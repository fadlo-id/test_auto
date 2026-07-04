<?php

namespace App\Services;

use App\Models\AnalyticsDedup;
use App\Models\AutoSchool;
use App\Models\CreditBalance;
use App\Models\CreditTransaction;
use App\Models\Plan;
use App\Models\User;
use App\Notifications\CreditExhaustedNotification;
use App\Notifications\CreditLowNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class CreditService
{
    const TYPES = ['view', 'whatsapp', 'phone', 'website', 'facebook', 'instagram', 'maps', 'email'];

    const CLICK_TYPES = ['whatsapp', 'phone', 'website', 'facebook', 'instagram', 'maps', 'email'];

    const FREE_QUOTAS = [
        'view'      => 300,
        'whatsapp'  => 30,
        'phone'     => 30,
        'website'   => 10,
        'facebook'  => 10,
        'instagram' => 10,
        'maps'      => 20,
        'email'     => 10,
    ];

    // Notification thresholds (percentage remaining)
    const ALERT_THRESHOLDS = [20, 10];

    public function __construct(private VisitorFingerprintService $fingerprint) {}

    // ── Balance getters ──────────────────────────────────────────────────────

    /** Get all balances for a school, auto-creating missing types. */
    public function getBalances(AutoSchool $school): Collection
    {
        $existing = CreditBalance::where('auto_school_id', $school->id)->get()->keyBy('credit_type');

        $toCreate = [];
        foreach (self::TYPES as $type) {
            if (! $existing->has($type)) {
                $toCreate[] = [
                    'auto_school_id' => $school->id,
                    'credit_type'    => $type,
                    'balance'        => self::FREE_QUOTAS[$type],
                    'is_unlimited'   => false,
                    'is_blocked'     => false,
                    'created_at'     => now(),
                    'updated_at'     => now(),
                ];
            }
        }

        if ($toCreate) {
            DB::table('credit_balances')->insert($toCreate);
            $existing = CreditBalance::where('auto_school_id', $school->id)->get()->keyBy('credit_type');
        }

        return $existing;
    }

    /** Get a single balance, auto-creating if missing. */
    public function getBalance(AutoSchool $school, string $type): CreditBalance
    {
        return CreditBalance::firstOrCreate(
            ['auto_school_id' => $school->id, 'credit_type' => $type],
            [
                'balance'      => self::FREE_QUOTAS[$type] ?? 0,
                'is_unlimited' => false,
                'is_blocked'   => false,
            ]
        );
    }

    /**
     * Same as getBalance(), but row-locked within the caller's transaction —
     * used by every admin mutation (add/remove/reset/...) so a concurrent
     * visitor `consume()` can never race an admin adjustment into a lost update.
     */
    private function lockedBalance(AutoSchool $school, string $type): CreditBalance
    {
        $balance = CreditBalance::where('auto_school_id', $school->id)
            ->where('credit_type', $type)
            ->lockForUpdate()
            ->first();

        if ($balance) {
            return $balance;
        }

        // firstOrCreate isn't lock-aware; create then re-fetch under lock.
        CreditBalance::firstOrCreate(
            ['auto_school_id' => $school->id, 'credit_type' => $type],
            ['balance' => self::FREE_QUOTAS[$type] ?? 0, 'is_unlimited' => false, 'is_blocked' => false]
        );

        return CreditBalance::where('auto_school_id', $school->id)
            ->where('credit_type', $type)
            ->lockForUpdate()
            ->firstOrFail();
    }

    // ── Tracking (dedup + consume) ───────────────────────────────────────────

    /** Track a view. Dedup: 1 per visitor per school per 24h. */
    public function trackView(AutoSchool $school, Request $request): bool
    {
        $hash = $this->fingerprint->fingerprint($request, $request->user()?->id);

        if (! $this->isUniqueEvent($school->id, $hash, 'view')) {
            return false;
        }

        return $this->consume($school, 'view');
    }

    /** Track a contact click. Dedup: 1 per type per visitor per school per 24h. */
    public function trackClick(AutoSchool $school, string $clickType, Request $request): bool
    {
        if (! in_array($clickType, self::CLICK_TYPES, true)) {
            return false;
        }

        $hash = $this->fingerprint->fingerprint($request, $request->user()?->id);

        if (! $this->isUniqueEvent($school->id, $hash, $clickType)) {
            return false;
        }

        return $this->consume($school, $clickType);
    }

    /**
     * Check uniqueness and insert dedup record atomically.
     * Returns true if this is the first event today (and records it).
     */
    public function isUniqueEvent(int $schoolId, string $visitorHash, string $eventType): bool
    {
        $today = today()->toDateString();

        $exists = AnalyticsDedup::where('auto_school_id', $schoolId)
            ->where('visitor_hash', $visitorHash)
            ->where('event_type', $eventType)
            ->where('tracked_date', $today)
            ->exists();

        if ($exists) {
            return false;
        }

        try {
            AnalyticsDedup::create([
                'auto_school_id' => $schoolId,
                'visitor_hash'   => $visitorHash,
                'event_type'     => $eventType,
                'tracked_date'   => $today,
            ]);
            return true;
        } catch (\Illuminate\Database\QueryException) {
            // Race condition: unique constraint violation
            return false;
        }
    }

    /**
     * Consume 1 credit for the given type.
     * Returns true if consumed (or unlimited), false if blocked or exhausted.
     */
    public function consume(AutoSchool $school, string $type): bool
    {
        return DB::transaction(function () use ($school, $type) {
            $balance = CreditBalance::where('auto_school_id', $school->id)
                ->where('credit_type', $type)
                ->lockForUpdate()
                ->first();

            if (! $balance) {
                $balance = CreditBalance::create([
                    'auto_school_id' => $school->id,
                    'credit_type'    => $type,
                    'balance'        => self::FREE_QUOTAS[$type] ?? 0,
                    'is_unlimited'   => false,
                    'is_blocked'     => false,
                ]);
            }

            if ($balance->is_blocked) {
                return false;
            }

            if ($balance->is_unlimited) {
                $this->log($school->id, $type, 'consumed', -1, null, null);
                return true;
            }

            if ($balance->balance <= 0) {
                $this->handleExhaustion($school, $type);
                return false;
            }

            $before = $balance->balance;
            $balance->decrement('balance');
            $after = $before - 1;

            $this->log($school->id, $type, 'consumed', -1, $before, $after);

            if ($after <= 0) {
                $this->handleExhaustion($school, $type);
            } else {
                $this->checkAlertThresholds($school, $type, $before, $after);
            }

            return true;
        });
    }

    // ── Admin operations ──────────────────────────────────────────────────────

    /** Add credits for a specific type. */
    public function add(AutoSchool $school, string $type, int $amount, ?User $admin = null, string $notes = ''): void
    {
        DB::transaction(function () use ($school, $type, $amount, $admin, $notes) {
            $balance = $this->lockedBalance($school, $type);
            $before  = $balance->is_unlimited ? null : $balance->balance;

            if (! $balance->is_unlimited) {
                $balance->increment('balance', $amount);
                $balance->refresh();
            }

            $after = $balance->is_unlimited ? null : $balance->balance;
            $this->log($school->id, $type, 'added', $amount, $before, $after, $admin?->id, 'Ajout admin', $notes);

            // Lift exhausted flag if views were restored
            if ($type === 'view' && $school->credits_exhausted && ($balance->balance > 0 || $balance->is_unlimited)) {
                $school->update(['credits_exhausted' => false]);
            }
        });
    }

    /** Remove credits from a specific type. */
    public function remove(AutoSchool $school, string $type, int $amount, ?User $admin = null, string $notes = ''): void
    {
        DB::transaction(function () use ($school, $type, $amount, $admin, $notes) {
            $balance = $this->lockedBalance($school, $type);

            if ($balance->is_unlimited) {
                return;
            }

            $before = $balance->balance;
            $balance->decrement('balance', $amount);
            $balance->refresh();

            if ($balance->balance < 0) {
                $balance->update(['balance' => 0]);
                $balance->refresh();
            }

            $after = $balance->balance;
            $this->log($school->id, $type, 'removed', -$amount, $before, $after, $admin?->id, 'Retrait admin', $notes);

            if ($after <= 0) {
                $this->handleExhaustion($school, $type);
            }
        });
    }

    /**
     * Reset credits to plan quota. Pass null for $type to reset ALL types.
     * Used by admin (reset) and by subscription renewal.
     */
    public function reset(AutoSchool $school, ?string $type, Plan $plan, ?User $admin = null): void
    {
        DB::transaction(function () use ($school, $type, $plan, $admin) {
            $types  = $type ? [$type] : self::TYPES;
            $action = $admin ? 'reset' : 'renewal';
            $reason = $admin ? 'Réinitialisation admin' : "Renouvellement plan «{$plan->name}»";

            foreach ($types as $t) {
                $quota      = $plan->getQuota($t);
                $unlimited  = $quota === null;
                $balance    = $this->lockedBalance($school, $t);
                $before     = $balance->is_unlimited ? null : $balance->balance;

                $balance->update([
                    'balance'      => $unlimited ? 0 : $quota,
                    'is_unlimited' => $unlimited,
                    'is_blocked'   => false,
                ]);

                $after = $unlimited ? null : $quota;
                $this->log($school->id, $t, $action, ($after ?? 0) - ($before ?? 0), $before, $after, $admin?->id, $reason);
            }

            $school->update(['credits_exhausted' => false, 'credits_reset_at' => now()]);
        });
    }

    /** Set unlimited for a type (or ALL types if null). */
    public function setUnlimited(AutoSchool $school, ?string $type, ?User $admin = null): void
    {
        DB::transaction(function () use ($school, $type, $admin) {
            foreach ($type ? [$type] : self::TYPES as $t) {
                $balance = $this->lockedBalance($school, $t);
                $before  = $balance->is_unlimited ? null : $balance->balance;

                $balance->update(['is_unlimited' => true, 'is_blocked' => false]);
                $this->log($school->id, $t, 'set_unlimited', 0, $before, null, $admin?->id, 'Illimité activé par admin');
            }

            $school->update(['credits_exhausted' => false]);
        });
    }

    /** Remove unlimited, restore to plan quota. */
    public function removeUnlimited(AutoSchool $school, ?string $type, Plan $plan, ?User $admin = null): void
    {
        DB::transaction(function () use ($school, $type, $plan, $admin) {
            foreach ($type ? [$type] : self::TYPES as $t) {
                $quota   = $plan->getQuota($t) ?? self::FREE_QUOTAS[$t] ?? 30;
                $balance = $this->lockedBalance($school, $t);

                $balance->update(['is_unlimited' => false, 'balance' => $quota]);
                $this->log($school->id, $t, 'remove_unlimited', $quota, null, $quota, $admin?->id, 'Illimité désactivé par admin');
            }
        });
    }

    /** Block credit consumption for a type (or ALL types if null). */
    public function block(AutoSchool $school, ?string $type, ?User $admin = null, string $reason = ''): void
    {
        DB::transaction(function () use ($school, $type, $admin, $reason) {
            foreach ($type ? [$type] : self::TYPES as $t) {
                $balance = $this->lockedBalance($school, $t);
                $balance->update(['is_blocked' => true]);
                $this->log($school->id, $t, 'blocked', 0, $balance->balance, $balance->balance, $admin?->id, $reason ?: 'Bloqué par admin');
            }
        });
    }

    /** Unblock credit consumption for a type (or ALL types if null). */
    public function unblock(AutoSchool $school, ?string $type, ?User $admin = null): void
    {
        DB::transaction(function () use ($school, $type, $admin) {
            foreach ($type ? [$type] : self::TYPES as $t) {
                $balance = $this->lockedBalance($school, $t);
                $balance->update(['is_blocked' => false]);
                $this->log($school->id, $t, 'unblocked', 0, $balance->balance, $balance->balance, $admin?->id, 'Débloqué par admin');
            }
        });
    }

    /** Force-reactivate: clear credits_exhausted without changing balances. */
    public function reactivate(AutoSchool $school, ?User $admin = null): void
    {
        $school->update(['credits_exhausted' => false]);
        $this->log($school->id, 'view', 'reactivated', 0, null, null, $admin?->id, 'Réactivation forcée par admin');
    }

    /** Suspend school entirely (is_active = false). */
    public function suspendSchool(AutoSchool $school, ?User $admin = null, string $reason = ''): void
    {
        $school->update(['is_active' => false]);
        $this->log($school->id, 'view', 'suspended', 0, null, null, $admin?->id, $reason ?: 'Suspendu par admin');
    }

    /** Unsuspend school (is_active = true). */
    public function unsuspendSchool(AutoSchool $school, ?User $admin = null): void
    {
        $school->update(['is_active' => true]);
        $this->log($school->id, 'view', 'unsuspended', 0, null, null, $admin?->id, 'Désuspendu par admin');
    }

    /** Exhaust all credits (subscription expired). */
    public function exhaustAll(AutoSchool $school): void
    {
        DB::transaction(function () use ($school) {
            CreditBalance::where('auto_school_id', $school->id)
                ->where('is_unlimited', false)
                ->update(['balance' => 0]);

            $school->update(['credits_exhausted' => true]);

            foreach (self::TYPES as $type) {
                $this->log($school->id, $type, 'exhausted', 0, null, 0, null, 'Abonnement expiré');
            }
        });
    }

    /** On subscription renewal: restore all credits from plan. */
    public function restoreOnRenewal(AutoSchool $school, Plan $plan): void
    {
        $this->reset($school, null, $plan, null);
    }

    /**
     * Reset a school with no active paid plan back to the free-tier quotas.
     * Used by the monthly reset scheduler and by the admin "reset" action
     * when a school has no subscription — single source of truth for what
     * "free tier" means, instead of duplicating FREE_QUOTAS in the controller.
     */
    public function resetToFreeQuota(AutoSchool $school, ?User $admin = null): void
    {
        DB::transaction(function () use ($school, $admin) {
            $action = $admin ? 'reset' : 'renewal';
            $reason = $admin ? 'Réinitialisation admin (tier gratuit)' : 'Réinitialisation mensuelle automatique (tier gratuit)';

            foreach (self::TYPES as $t) {
                $balance = $this->lockedBalance($school, $t);
                $before  = $balance->is_unlimited ? null : $balance->balance;

                if (! $balance->is_unlimited) {
                    $balance->update(['balance' => self::FREE_QUOTAS[$t], 'is_blocked' => false]);
                }

                $this->log($school->id, $t, $action, self::FREE_QUOTAS[$t] - ($before ?? 0), $before, $balance->is_unlimited ? null : self::FREE_QUOTAS[$t], $admin?->id, $reason);
            }

            $school->update(['credits_exhausted' => false, 'credits_reset_at' => now()]);
        });
    }

    /**
     * Reverse a single admin adjustment (add/remove/reset/set_unlimited/...).
     * Never rolls back a raw visitor `consumed` transaction — those aren't
     * "mistakes" to undo, they're what actually happened.
     *
     * Restores the balance to what it was immediately before the original
     * transaction, inverts any is_unlimited/is_blocked flag it changed, and
     * records the rollback itself as a new, fully audited transaction —
     * history is never edited or deleted, only appended to.
     *
     * @throws \RuntimeException if the transaction isn't rollback-eligible.
     */
    public function rollbackTransaction(CreditTransaction $transaction, ?User $admin = null): CreditTransaction
    {
        if (! $transaction->isRollbackable()) {
            throw new \RuntimeException('This transaction cannot be rolled back.');
        }

        return DB::transaction(function () use ($transaction, $admin) {
            $school = AutoSchool::findOrFail($transaction->auto_school_id);
            $type   = $transaction->credit_type;
            $balance = $this->lockedBalance($school, $type);

            $current = $balance->balance;

            $updates = ['balance' => $transaction->balance_before ?? $current];

            if (in_array($transaction->action, ['set_unlimited', 'remove_unlimited'], true)) {
                $updates['is_unlimited'] = $transaction->action === 'remove_unlimited';
            }
            if (in_array($transaction->action, ['blocked', 'unblocked'], true)) {
                $updates['is_blocked'] = $transaction->action === 'unblocked';
            }

            $balance->update($updates);

            if ($transaction->action === 'reactivated') {
                $school->update(['credits_exhausted' => true]);
            }

            $transaction->update(['rolled_back_at' => now()]);

            $rollback = CreditTransaction::create([
                'auto_school_id'  => $school->id,
                'credit_type'     => $type,
                'action'          => 'rollback',
                'amount'          => ($updates['balance'] ?? 0) - $current,
                'balance_before'  => $current,
                'balance_after'   => $balance->fresh()->balance,
                'performed_by'    => $admin?->id,
                'reason'          => "Annulation de la transaction #{$transaction->id} ({$transaction->action})",
                'ip_address'      => request()?->ip(),
                'rollback_of_id'  => $transaction->id,
                'created_at'      => now(),
            ]);

            return $rollback;
        });
    }

    // ── Summary ───────────────────────────────────────────────────────────────

    public function getSummary(AutoSchool $school): array
    {
        $balances     = $this->getBalances($school);
        $subscription = $school->activeSubscription()->with('plan')->first();
        $plan         = $subscription?->plan;

        $types = [];
        foreach (self::TYPES as $type) {
            $balance   = $balances->get($type);
            $planQuota = $plan ? $plan->getQuota($type) : (self::FREE_QUOTAS[$type] ?? 0);
            $remaining = $balance->is_unlimited ? null : $balance->balance;
            $total     = $balance->is_unlimited ? null : $planQuota;
            $used      = ($total !== null && $remaining !== null) ? max(0, $total - $remaining) : null;

            $types[$type] = [
                'type'         => $type,
                'label'        => CreditBalance::LABELS[$type] ?? $type,
                'balance'      => $remaining,
                'total'        => $total,
                'used'         => $used,
                'pct'          => ($total && $used !== null) ? round(min(100, $used / $total * 100)) : null,
                'is_unlimited' => $balance->is_unlimited,
                'is_blocked'   => $balance->is_blocked,
                'is_exhausted' => $balance->isExhausted(),
            ];
        }

        return [
            'types'     => $types,
            'exhausted' => $school->credits_exhausted,
            'reset_at'  => $school->credits_reset_at?->toDateString(),
            'expires_at'=> $subscription?->expires_at?->toDateString(),
            'plan_name' => $plan?->name ?? 'Gratuit',
            'is_active' => $school->is_active,
        ];
    }

    // ── Chart data (last 30 days consumption) ────────────────────────────────

    public function getChartData(AutoSchool $school, int $days = 30): array
    {
        $from = now()->subDays($days - 1)->startOfDay();

        $rows = CreditTransaction::where('auto_school_id', $school->id)
            ->where('action', 'consumed')
            ->where('created_at', '>=', $from)
            ->selectRaw('DATE(created_at) as day, credit_type, COUNT(*) as total')
            ->groupBy('day', 'credit_type')
            ->orderBy('day')
            ->get();

        // Build date labels
        $labels = [];
        for ($i = $days - 1; $i >= 0; $i--) {
            $labels[] = now()->subDays($i)->toDateString();
        }

        // Build per-type series
        $series = [];
        foreach (self::TYPES as $type) {
            $byDay = $rows->where('credit_type', $type)->keyBy('day');
            $series[$type] = array_map(fn ($d) => $byDay[$d]->total ?? 0, $labels);
        }

        return ['labels' => $labels, 'series' => $series];
    }

    // ── Cleanup ───────────────────────────────────────────────────────────────

    public function cleanOldDedupRecords(): int
    {
        return AnalyticsDedup::where('tracked_date', '<', today()->subDay()->toDateString())->delete();
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private function handleExhaustion(AutoSchool $school, string $type): void
    {
        if ($type === 'view' && ! $school->credits_exhausted) {
            $school->update(['credits_exhausted' => true]);
            $this->log($school->id, $type, 'exhausted', 0, 0, 0, null, 'Vues épuisées — école masquée');

            try {
                $owner = $school->user;
                if ($owner) {
                    $owner->notify(new CreditExhaustedNotification($school, $type));
                }
            } catch (\Throwable $e) {
                Log::warning('Credit exhausted notification failed', ['school' => $school->id, 'error' => $e->getMessage()]);
            }
        }
    }

    private function checkAlertThresholds(AutoSchool $school, string $type, int $before, int $after): void
    {
        // Only notify for view type to avoid spam
        if ($type !== 'view') {
            return;
        }

        $subscription = $school->activeSubscription()->with('plan')->first();
        $plan  = $subscription?->plan;
        $total = $plan ? ($plan->getQuota('view') ?? self::FREE_QUOTAS['view']) : self::FREE_QUOTAS['view'];

        if ($total <= 0) {
            return;
        }

        foreach (self::ALERT_THRESHOLDS as $threshold) {
            $afterPct  = ($after / $total) * 100;
            $beforePct = ($before / $total) * 100;

            $crossedThreshold = (100 - $afterPct) >= $threshold && (100 - $beforePct) < $threshold;

            if ($crossedThreshold) {
                try {
                    $owner = $school->user;
                    if ($owner) {
                        $owner->notify(new CreditLowNotification($school, $type, $after, $total, $threshold));
                    }
                } catch (\Throwable $e) {
                    Log::warning('Credit low notification failed', ['school' => $school->id, 'threshold' => $threshold]);
                }
                break; // Only one threshold per consumption
            }
        }
    }

    private function log(
        int $schoolId,
        string $creditType,
        string $action,
        int $amount,
        ?int $balanceBefore,
        ?int $balanceAfter,
        ?int $performedBy = null,
        string $reason = '',
        string $notes = ''
    ): void {
        try {
            CreditTransaction::create([
                'auto_school_id' => $schoolId,
                'credit_type'    => $creditType,
                'action'         => $action,
                'amount'         => $amount,
                'balance_before' => $balanceBefore,
                'balance_after'  => $balanceAfter,
                'performed_by'   => $performedBy,
                'reason'         => $reason ?: null,
                'notes'          => $notes ?: null,
                'ip_address'     => request()->ip(),
                'created_at'     => now(),
            ]);
        } catch (\Throwable $e) {
            Log::error('CreditTransaction write failed', [
                'school_id' => $schoolId,
                'action'    => $action,
                'error'     => $e->getMessage(),
            ]);
        }
    }
}
