<?php

namespace App\Services;

use App\Models\AnalyticsDedup;
use App\Models\AutoSchool;
use App\Models\CreditHistory;
use App\Models\CreditLog;
use App\Models\Plan;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class CreditConsumptionService
{
    public const FREE_VIEWS  = 300;
    public const FREE_CLICKS = 30;

    public function __construct(private VisitorFingerprintService $fingerprint) {}

    // ── Visitor fingerprint ───────────────────────────────────────────────────

    /** @deprecated Use VisitorFingerprintService directly */
    public function generateVisitorHash(Request $request): string
    {
        return $this->fingerprint->fingerprint($request);
    }

    // ── Deduplication ─────────────────────────────────────────────────────────

    /**
     * Returns true if this is the first time this visitor triggers this event
     * for this school today. Inserts a dedup record atomically.
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
            // Unique constraint violation (race condition) — not unique
            return false;
        }
    }

    // ── Credit consumption ───────────────────────────────────────────────────

    /**
     * Track a view: consume 1 view credit if unique visitor today.
     */
    public function trackView(AutoSchool $school, Request $request): bool
    {
        $hash = $this->fingerprint->fingerprint($request);

        if (! $this->isUniqueEvent($school->id, $hash, 'view')) {
            return false;
        }

        $this->consumeViewCredit($school);
        return true;
    }

    /**
     * Track a click: consume 1 click credit if unique visitor+type today.
     * Each click type (phone, whatsapp, facebook, instagram, website, email) is deduplicated independently.
     */
    public function trackClick(AutoSchool $school, string $clickType, Request $request): bool
    {
        $hash = $this->fingerprint->fingerprint($request);

        if (! $this->isUniqueEvent($school->id, $hash, $clickType)) {
            return false;
        }

        $this->consumeClickCredit($school);
        return true;
    }

    // ── Credit operations ────────────────────────────────────────────────────

    public function consumeViewCredit(AutoSchool $school): void
    {
        if ($school->hasUnlimitedViews()) {
            return;
        }

        DB::transaction(function () use ($school) {
            $school->refresh();

            if ($school->views_remaining === null || $school->views_remaining <= 0) {
                $this->markExhausted($school);
                return;
            }

            $before = $school->views_remaining;
            $school->decrement('views_remaining');
            $school->refresh();

            $this->logLegacy($school, 'view', -1, $school->views_remaining, 'view_consumed');
            $this->writeHistory($school, 'view_consumed', 'view', -1, 0, $before, $school->views_remaining);

            if ($school->views_remaining <= 0) {
                $this->markExhausted($school);
            }
        });
    }

    public function consumeClickCredit(AutoSchool $school): void
    {
        if ($school->hasUnlimitedClicks()) {
            return;
        }

        DB::transaction(function () use ($school) {
            $school->refresh();

            if ($school->clicks_remaining === null || $school->clicks_remaining <= 0) {
                $this->markExhausted($school);
                return;
            }

            $before = $school->clicks_remaining;
            $school->decrement('clicks_remaining');
            $school->refresh();

            $this->logLegacy($school, 'click', -1, $school->clicks_remaining, 'click_consumed');
            $this->writeHistory($school, 'click_consumed', 'click', 0, -1, null, null, $before, $school->clicks_remaining);

            if ($school->clicks_remaining <= 0) {
                $this->markExhausted($school);
            }
        });
    }

    // ── Admin operations ─────────────────────────────────────────────────────

    public function addBonusCredits(AutoSchool $school, int $views, int $clicks, ?User $admin = null, string $notes = ''): void
    {
        DB::transaction(function () use ($school, $views, $clicks, $admin, $notes) {
            $vBefore = $school->views_remaining;
            $cBefore = $school->clicks_remaining;

            if ($views > 0 && $school->views_remaining !== null) {
                $school->increment('views_remaining', $views);
            }

            if ($clicks > 0 && $school->clicks_remaining !== null) {
                $school->increment('clicks_remaining', $clicks);
            }

            $school->refresh();

            if ($school->credits_exhausted) {
                $school->update(['credits_exhausted' => false]);
            }

            $this->logLegacy($school, 'view', $views, $school->views_remaining, 'admin_add', $admin?->id, $notes);
            $this->writeHistory(
                $school, 'bonus_added', 'both', $views, $clicks,
                $vBefore, $school->views_remaining, $cBefore, $school->clicks_remaining,
                $admin?->id, $notes
            );
        });
    }

    public function resetCredits(AutoSchool $school, Plan $plan, ?User $admin = null): void
    {
        DB::transaction(function () use ($school, $plan, $admin) {
            $newViews  = $plan->isUnlimitedViews()  ? null : $plan->monthly_view_credit  ?? self::FREE_VIEWS;
            $newClicks = $plan->isUnlimitedClicks() ? null : $plan->monthly_click_credit ?? self::FREE_CLICKS;

            $vBefore = $school->views_remaining;
            $cBefore = $school->clicks_remaining;

            $school->update([
                'views_remaining'   => $newViews,
                'clicks_remaining'  => $newClicks,
                'credits_exhausted' => false,
                'credits_reset_at'  => now(),
            ]);

            $reason = $admin ? 'admin_reset' : 'plan_reset';
            $action = $admin ? 'credits_reset' : 'plan_reset';

            $this->logLegacy($school, 'view',  $newViews  ?? PHP_INT_MAX, $newViews,  $reason, $admin?->id);
            $this->logLegacy($school, 'click', $newClicks ?? PHP_INT_MAX, $newClicks, $reason, $admin?->id);
            $this->writeHistory(
                $school, $action, 'both',
                ($newViews  ?? 0) - ($vBefore ?? 0),
                ($newClicks ?? 0) - ($cBefore ?? 0),
                $vBefore, $newViews, $cBefore, $newClicks,
                $admin?->id, "Réinitialisation plan «{$plan->name}»"
            );
        });
    }

    public function removeCredits(AutoSchool $school, int $views, int $clicks, ?User $admin = null, string $notes = ''): void
    {
        DB::transaction(function () use ($school, $views, $clicks, $admin, $notes) {
            $vBefore = $school->views_remaining;
            $cBefore = $school->clicks_remaining;

            if ($views > 0 && $school->views_remaining !== null) {
                $school->decrement('views_remaining', $views);
                if ($school->views_remaining <= 0) {
                    $this->markExhausted($school);
                }
            }

            if ($clicks > 0 && $school->clicks_remaining !== null) {
                $school->decrement('clicks_remaining', $clicks);
                if ($school->clicks_remaining <= 0) {
                    $this->markExhausted($school);
                }
            }

            $school->refresh();

            $this->logLegacy($school, 'view', -$views, $school->views_remaining, 'admin_remove', $admin?->id, $notes);
            $this->writeHistory(
                $school, 'credits_removed', 'both', -$views, -$clicks,
                $vBefore, $school->views_remaining, $cBefore, $school->clicks_remaining,
                $admin?->id, $notes
            );
        });
    }

    public function forceReactivate(AutoSchool $school, ?User $admin = null): void
    {
        $school->update(['credits_exhausted' => false]);
        $this->logLegacy($school, 'view', 0, $school->views_remaining, 'admin_reactivate', $admin?->id, 'Réactivation forcée');
        $this->writeHistory($school, 'reactivated', 'system', 0, 0, null, null, null, null, $admin?->id, 'Réactivation forcée');
    }

    public function suspendSchool(AutoSchool $school, ?User $admin = null, string $reason = ''): void
    {
        $school->update(['is_active' => false]);
        $this->writeHistory($school, 'suspended', 'system', 0, 0, null, null, null, null, $admin?->id, $reason ?: 'Suspendu par admin');
    }

    public function unsuspendSchool(AutoSchool $school, ?User $admin = null): void
    {
        $school->update(['is_active' => true]);
        $this->writeHistory($school, 'unsuspended', 'system', 0, 0, null, null, null, null, $admin?->id, 'Désuspendu par admin');
    }

    public function exhaustCredits(AutoSchool $school): void
    {
        $school->update([
            'credits_exhausted' => true,
            'views_remaining'   => 0,
            'clicks_remaining'  => 0,
        ]);
        $this->logLegacy($school, 'view',  0, 0, 'subscription_expired');
        $this->logLegacy($school, 'click', 0, 0, 'subscription_expired');
        $this->writeHistory($school, 'expired', 'system', 0, 0, null, 0, null, 0, null, 'Abonnement expiré');
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private function markExhausted(AutoSchool $school): void
    {
        if (! $school->credits_exhausted) {
            $school->update(['credits_exhausted' => true]);
        }
    }

    private function logLegacy(
        AutoSchool $school,
        string $creditType,
        int $change,
        ?int $balanceAfter,
        string $reason,
        ?int $adminId = null,
        string $notes = ''
    ): void {
        try {
            CreditLog::create([
                'auto_school_id' => $school->id,
                'credit_type'    => $creditType,
                'change'         => $change,
                'balance_after'  => $balanceAfter,
                'reason'         => $reason,
                'admin_id'       => $adminId,
                'notes'          => $notes ?: null,
            ]);
        } catch (\Throwable $e) {
            Log::warning('CreditLog write failed', ['school_id' => $school->id, 'error' => $e->getMessage()]);
        }
    }

    private function writeHistory(
        AutoSchool $school,
        string $action,
        string $creditType,
        int $viewsChange,
        int $clicksChange,
        ?int $viewsBefore = null,
        ?int $viewsAfter  = null,
        ?int $clicksBefore = null,
        ?int $clicksAfter  = null,
        ?int $performedBy  = null,
        string $reason = ''
    ): void {
        try {
            CreditHistory::create([
                'auto_school_id' => $school->id,
                'action'         => $action,
                'credit_type'    => $creditType,
                'views_change'   => $viewsChange,
                'clicks_change'  => $clicksChange,
                'views_before'   => $viewsBefore,
                'views_after'    => $viewsAfter,
                'clicks_before'  => $clicksBefore,
                'clicks_after'   => $clicksAfter,
                'performed_by'   => $performedBy,
                'reason'         => $reason ?: null,
                'ip'             => request()->ip(),
                'created_at'     => now(),
            ]);
        } catch (\Throwable $e) {
            Log::error('CreditHistory write failed', ['school_id' => $school->id, 'action' => $action, 'error' => $e->getMessage()]);
        }
    }

    // ── Cleanup (called by scheduler) ────────────────────────────────────────

    public function cleanOldDedupRecords(): int
    {
        return AnalyticsDedup::where('tracked_date', '<', today()->subDay()->toDateString())->delete();
    }

    // ── Credit summary for dashboard ─────────────────────────────────────────

    public function getCreditSummary(AutoSchool $school): array
    {
        $subscription = $school->activeSubscription()->with('plan')->first();
        $plan = $subscription?->plan;

        $viewsTotal  = $plan ? ($plan->isUnlimitedViews()  ? null : $plan->monthly_view_credit)  : self::FREE_VIEWS;
        $clicksTotal = $plan ? ($plan->isUnlimitedClicks() ? null : $plan->monthly_click_credit) : self::FREE_CLICKS;

        $viewsRemaining  = $school->views_remaining;
        $clicksRemaining = $school->clicks_remaining;

        $viewsUsed  = $viewsTotal  !== null && $viewsRemaining  !== null ? max(0, $viewsTotal  - $viewsRemaining)  : null;
        $clicksUsed = $clicksTotal !== null && $clicksRemaining !== null ? max(0, $clicksTotal - $clicksRemaining) : null;

        return [
            'views_remaining'  => $viewsRemaining,
            'clicks_remaining' => $clicksRemaining,
            'views_total'      => $viewsTotal,
            'clicks_total'     => $clicksTotal,
            'views_used'       => $viewsUsed,
            'clicks_used'      => $clicksUsed,
            'views_pct'        => ($viewsTotal && $viewsUsed !== null)  ? round(($viewsUsed  / $viewsTotal)  * 100) : null,
            'clicks_pct'       => ($clicksTotal && $clicksUsed !== null) ? round(($clicksUsed / $clicksTotal) * 100) : null,
            'unlimited_views'  => $viewsRemaining  === null,
            'unlimited_clicks' => $clicksRemaining === null,
            'exhausted'        => $school->credits_exhausted,
            'reset_at'         => $school->credits_reset_at?->toDateString(),
            'expires_at'       => $subscription?->expires_at?->toDateString(),
            'plan_name'        => $plan?->name ?? 'Gratuit',
        ];
    }
}
