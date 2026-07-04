<?php

namespace App\Console\Commands;

use App\Models\Plan;
use App\Models\Subscription;
use App\Services\CreditService;
use App\Services\NotificationService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class CheckExpiredSubscriptions extends Command
{
    protected $signature   = 'subscriptions:check-expired';
    protected $description = 'Mark expired subscriptions, exhaust credits, and notify schools';

    public function __construct(
        private NotificationService $notifications,
        private CreditService $credits,
    ) {
        parent::__construct();
    }

    public function handle(): int
    {
        $expiredQuery = Subscription::where('status', 'active')
            ->where('expires_at', '<', now())
            ->with('autoSchool:id,name,email,user_id,credits_exhausted', 'plan');

        // Split: downgrades vs. real cancellations
        $pendingDowngrades = (clone $expiredQuery)
            ->where('cancel_at_period_end', true)
            ->get()
            ->filter(fn ($s) => $this->hasDowngradePlan($s));

        $normalExpired = (clone $expiredQuery)
            ->where(fn ($q) => $q->where('cancel_at_period_end', false)->orWhereNull('cancel_at_period_end'))
            ->get();

        // Also pick up cancel_at_period_end that are NOT downgrades (user-initiated cancels)
        $userCancelledExpired = (clone $expiredQuery)
            ->where('cancel_at_period_end', true)
            ->get()
            ->filter(fn ($s) => ! $this->hasDowngradePlan($s));

        // ── Apply downgrades ─────────────────────────────────────────────────

        foreach ($pendingDowngrades as $subscription) {
            $this->applyDowngrade($subscription);
        }

        // ── Cancel expired (and user-cancelled) ──────────────────────────────

        $toCancel = $normalExpired->merge($userCancelledExpired);

        foreach ($toCancel as $subscription) {
            $reason = $subscription->cancel_at_period_end ? 'Annulé par le propriétaire' : 'Expiration automatique';
            $subscription->update(['status' => 'cancelled', 'cancelled_at' => now(), 'cancellation_reason' => $reason]);

            if ($subscription->autoSchool) {
                $this->credits->exhaustAll($subscription->autoSchool);
                $this->info("Credits exhausted: #{$subscription->autoSchool->id} ({$subscription->autoSchool->name})");
            }

            $this->notifications->notifySubscriptionExpired($subscription);
            $this->info("Expired: #{$subscription->id} ({$subscription->autoSchool?->name})");
        }

        // ── Cleanup ──────────────────────────────────────────────────────────

        $deleted = $this->credits->cleanOldDedupRecords();
        $this->info("Dedup cleanup: {$deleted} records removed.");

        // ── Expiring soon notifications ───────────────────────────────────────

        $expiringSoon = Subscription::where('status', 'active')
            ->where('on_trial', false)
            ->whereBetween('expires_at', [now(), now()->addDays(7)])
            ->with('autoSchool:id,name,email,user_id')
            ->get();

        foreach ($expiringSoon as $subscription) {
            $this->notifications->notifySubscriptionExpiringSoon($subscription);
            $this->info("Expiring soon: #{$subscription->id} ({$subscription->autoSchool?->name})");
        }

        $this->info("Done. Expired: {$toCancel->count()}, Downgrades: {$pendingDowngrades->count()}, Expiring soon: {$expiringSoon->count()}.");

        return Command::SUCCESS;
    }

    private function hasDowngradePlan(Subscription $sub): bool
    {
        if (! $sub->cancellation_reason) return false;
        $data = json_decode($sub->cancellation_reason, true);
        return isset($data['downgrade_to_plan_id']);
    }

    private function applyDowngrade(Subscription $subscription): void
    {
        $data    = json_decode($subscription->cancellation_reason, true);
        $newPlan = Plan::find($data['downgrade_to_plan_id']);

        if (! $newPlan) {
            $subscription->update(['status' => 'cancelled', 'cancelled_at' => now(), 'cancellation_reason' => 'Downgrade plan missing']);
            Log::error("Downgrade failed for sub #{$subscription->id}: plan {$data['downgrade_to_plan_id']} not found");
            return;
        }

        $subscription->update([
            'plan_id'              => $newPlan->id,
            'cancel_at_period_end' => false,
            'cancellation_reason'  => null,
            'expires_at'           => $newPlan->billing_period === 'yearly' ? now()->addYear() : now()->addMonth(),
            'started_at'           => now(),
        ]);

        try {
            if ($subscription->autoSchool) {
                $this->credits->restoreOnRenewal($subscription->autoSchool, $newPlan);
            }
        } catch (\Throwable $e) {
            Log::error("Downgrade credit restore failed for sub #{$subscription->id}: {$e->getMessage()}");
        }

        $this->info("Downgrade applied: sub #{$subscription->id} → {$newPlan->name}");
        Log::info("Downgrade applied for subscription #{$subscription->id} → plan #{$newPlan->id}");
    }
}
