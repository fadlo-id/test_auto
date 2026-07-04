<?php

namespace App\Console\Commands;

use App\Mail\PaymentRetryMail;
use App\Mail\TrialEndingMail;
use App\Models\Subscription;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class ProcessPaymentRetries extends Command
{
    protected $signature   = 'payments:process-retries';
    protected $description = 'Send payment retry reminders and handle failed subscription retries';

    public function handle(): int
    {
        $this->processFailedPaymentRetries();
        $this->processTrialEndingNotifications();
        $this->processDowngradesAtPeriodEnd();

        return Command::SUCCESS;
    }

    // ── Failed payment retries ────────────────────────────────────────────────

    private function processFailedPaymentRetries(): void
    {
        $due = Subscription::where('status', 'past_due')
            ->where('payment_retry_count', '<', 3)
            ->where('next_payment_retry_at', '<=', now())
            ->with('autoSchool.user', 'plan')
            ->get();

        $this->info("Processing {$due->count()} payment retry(ies)...");

        foreach ($due as $subscription) {
            $attempt = $subscription->payment_retry_count;
            $delays  = [3, 7, 14];
            $nextDelay = $delays[$attempt] ?? 14;
            $daysUntilCancel = array_sum(array_slice($delays, $attempt));

            try {
                $school = $subscription->autoSchool;

                if ($school?->user) {
                    Mail::to($school->user->email)->queue(
                        new PaymentRetryMail($subscription, $attempt + 1, $daysUntilCancel)
                    );
                }

                // Schedule next retry
                $subscription->scheduleRetry($nextDelay);

                $this->line("  ↻ Retry #{$attempt} queued for subscription #{$subscription->id}");
                Log::info("Payment retry #{$attempt} sent for subscription #{$subscription->id}");
            } catch (\Throwable $e) {
                Log::error("ProcessPaymentRetries error for sub #{$subscription->id}: {$e->getMessage()}");
            }
        }

        // Cancel subscriptions that exhausted all retries
        $exhausted = Subscription::where('status', 'past_due')
            ->where('payment_retry_count', '>=', 3)
            ->where('next_payment_retry_at', '<=', now())
            ->with('autoSchool')
            ->get();

        foreach ($exhausted as $subscription) {
            $subscription->cancel('payment_failed_max_retries');
            Log::info("Subscription #{$subscription->id} cancelled after 3 failed retries");
            $this->line("  ✗ Sub #{$subscription->id} cancelled (max retries exceeded)");
        }
    }

    // ── Trial ending reminders ────────────────────────────────────────────────

    private function processTrialEndingNotifications(): void
    {
        // Notify 3 days and 1 day before trial ends
        foreach ([3, 1] as $daysLeft) {
            $target = now()->addDays($daysLeft);

            $subs = Subscription::where('on_trial', true)
                ->where('status', 'active')
                ->whereBetween('trial_ends_at', [
                    $target->copy()->startOfDay(),
                    $target->copy()->endOfDay(),
                ])
                ->with('autoSchool.user', 'plan')
                ->get();

            foreach ($subs as $subscription) {
                try {
                    $school = $subscription->autoSchool;
                    if ($school?->user) {
                        Mail::to($school->user->email)->queue(
                            new TrialEndingMail($school, $subscription, $daysLeft)
                        );
                    }
                    $this->line("  ⏰ Trial ending in {$daysLeft}d reminder sent for sub #{$subscription->id}");
                } catch (\Throwable $e) {
                    Log::warning("Trial ending email failed for sub #{$subscription->id}: {$e->getMessage()}");
                }
            }
        }

        // Expire trials that have ended
        $expiredTrials = Subscription::where('on_trial', true)
            ->where('status', 'active')
            ->where('trial_ends_at', '<', now())
            ->get();

        foreach ($expiredTrials as $sub) {
            $sub->cancel('trial_expired');
            $this->line("  ✗ Trial expired for sub #{$sub->id}");
        }
    }

    // ── Scheduled downgrades ──────────────────────────────────────────────────

    private function processDowngradesAtPeriodEnd(): void
    {
        $pendingDowngrades = Subscription::where('cancel_at_period_end', true)
            ->where('status', 'active')
            ->where('expires_at', '<', now()->addHours(1))
            ->with('autoSchool', 'plan')
            ->get();

        foreach ($pendingDowngrades as $subscription) {
            $reason = $subscription->cancellation_reason;

            if (! $reason) continue;

            $data = json_decode($reason, true);
            if (! isset($data['downgrade_to_plan_id'])) continue;

            $newPlan = \App\Models\Plan::find($data['downgrade_to_plan_id']);
            if (! $newPlan) {
                $subscription->cancel('downgrade_plan_missing');
                continue;
            }

            // Apply the downgrade
            $subscription->update([
                'plan_id'              => $newPlan->id,
                'cancel_at_period_end' => false,
                'cancellation_reason'  => null,
                'expires_at'           => $newPlan->billing_period === 'yearly'
                    ? now()->addYear()
                    : now()->addMonth(),
            ]);

            // Reset credits for new plan
            try {
                $school = $subscription->autoSchool;
                app(\App\Services\CreditService::class)->restoreOnRenewal($school, $newPlan);
                $this->line("  ↓ Downgrade applied for sub #{$subscription->id} → {$newPlan->name}");
            } catch (\Throwable $e) {
                Log::error("Downgrade credit restore failed for sub #{$subscription->id}: {$e->getMessage()}");
            }
        }
    }
}
