<?php

namespace App\Services;

use App\Mail\SubscriptionActivatedMail;
use App\Mail\SubscriptionDowngradedMail;
use App\Mail\SubscriptionUpgradedMail;
use App\Mail\TrialStartedMail;
use App\Models\AutoSchool;
use App\Models\Payment;
use App\Models\Plan;
use App\Models\Subscription;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class SubscriptionService
{
    public function __construct(private ?CreditService $credits = null) {}

    // ── Read ─────────────────────────────────────────────────────────────────

    public function getActivePlan(AutoSchool $school): ?Subscription
    {
        return $school->subscription()->where('status', 'active')->first();
    }

    // ── Create ───────────────────────────────────────────────────────────────

    public function createSubscription(AutoSchool $school, Plan $plan, string $stripeId): Subscription
    {
        $existing = $school->subscription;
        if ($existing) {
            $existing->cancel('replaced');
        }

        $hasTrial      = $plan->hasTrial() && ! $this->hasUsedTrial($school);
        $trialEndsAt   = $hasTrial ? now()->addDays($plan->trial_days) : null;
        $subscriptionEnd = $plan->billing_period === 'yearly' ? now()->addYear() : now()->addMonth();

        $subscription = Subscription::create([
            'auto_school_id'         => $school->id,
            'plan_id'                => $plan->id,
            'stripe_subscription_id' => $stripeId,
            'status'                 => 'active',
            'started_at'             => now(),
            'expires_at'             => $subscriptionEnd,
            'on_trial'               => $hasTrial,
            'trial_ends_at'          => $trialEndsAt,
        ]);

        $credits = $this->credits ?? app(CreditService::class);
        $credits->restoreOnRenewal($school, $plan);

        if ($hasTrial) {
            $this->sendTrialStarted($school, $subscription);
        } else {
            $this->sendSubscriptionActivated($school, $subscription);
        }

        return $subscription;
    }

    public function createTrialSubscription(AutoSchool $school, Plan $plan): Subscription
    {
        $existing = $school->subscription;
        if ($existing) {
            $existing->cancel('replaced');
        }

        $trialDays   = max(1, $plan->trial_days);
        $trialEndsAt = now()->addDays($trialDays);

        $subscription = Subscription::create([
            'auto_school_id'         => $school->id,
            'plan_id'                => $plan->id,
            'stripe_subscription_id' => null,
            'status'                 => 'active',
            'started_at'             => now(),
            'expires_at'             => $trialEndsAt,
            'on_trial'               => true,
            'trial_ends_at'          => $trialEndsAt,
        ]);

        $credits = $this->credits ?? app(CreditService::class);
        $credits->restoreOnRenewal($school, $plan);

        $this->sendTrialStarted($school, $subscription);

        return $subscription;
    }

    // ── Upgrade ───────────────────────────────────────────────────────────────

    public function upgrade(AutoSchool $school, Plan $newPlan, Payment $prorationPayment): Subscription
    {
        $current = $school->subscription;

        if (! $current || ! $current->isActive()) {
            throw new \RuntimeException('Aucun abonnement actif à mettre à niveau.');
        }

        $oldPlanName = $current->plan?->name;

        // Keep same expiry — just change the plan
        $current->update([
            'plan_id'  => $newPlan->id,
            'on_trial' => false,
        ]);

        $prorationPayment->update(['subscription_id' => $current->id]);

        $credits = $this->credits ?? app(CreditService::class);
        $credits->restoreOnRenewal($school, $newPlan);

        try {
            if ($school->user) {
                Mail::to($school->user->email)
                    ->queue(new SubscriptionUpgradedMail($school, $newPlan, $oldPlanName));
            }
        } catch (\Throwable $e) {
            Log::warning('SubscriptionService: upgrade email failed', ['error' => $e->getMessage()]);
        }

        return $current->fresh();
    }

    // ── Downgrade ──────────────────────────────────────────────────────────────

    /**
     * Schedules a downgrade at end of current billing period.
     * The flag is stored in cancellation_reason so the CheckExpired command can apply it.
     */
    public function scheduleDowngrade(AutoSchool $school, Plan $newPlan): Subscription
    {
        $current = $school->subscription;

        if (! $current || ! $current->isActive()) {
            throw new \RuntimeException('Aucun abonnement actif à rétrograder.');
        }

        // Encode downgrade as JSON in cancel_at_period_end flag + cancellation_reason
        $current->update([
            'cancel_at_period_end' => true,
            'cancellation_reason'  => json_encode(['downgrade_to_plan_id' => $newPlan->id]),
        ]);

        try {
            if ($school->user) {
                Mail::to($school->user->email)
                    ->queue(new SubscriptionDowngradedMail($school, $newPlan, $current));
            }
        } catch (\Throwable $e) {
            Log::warning('SubscriptionService: downgrade email failed', ['error' => $e->getMessage()]);
        }

        return $current->fresh();
    }

    // ── Cancel ────────────────────────────────────────────────────────────────

    public function cancelSubscription(Subscription $subscription, string $reason = ''): Subscription
    {
        return tap($subscription)->update([
            'status'              => 'cancelled',
            'cancellation_reason' => $reason,
            'cancelled_at'        => now(),
        ]);
    }

    // ── Retry logic ───────────────────────────────────────────────────────────

    /**
     * Schedule next payment retry with exponential backoff.
     * Retry 1 → 3 days, Retry 2 → 7 days, Retry 3 → final failure
     */
    public function schedulePaymentRetry(Subscription $subscription): bool
    {
        $count = $subscription->payment_retry_count ?? 0;

        if ($count >= 3) {
            $subscription->cancel('payment_failed_max_retries');
            return false; // No more retries
        }

        $delays = [3, 7, 14];
        $delay  = $delays[$count] ?? 14;
        $subscription->scheduleRetry($delay);

        return true;
    }

    // ── State checks ──────────────────────────────────────────────────────────

    public function isExpired(Subscription $subscription): bool
    {
        return $subscription->expires_at?->isPast() ?? false;
    }

    private function hasUsedTrial(AutoSchool $school): bool
    {
        return Subscription::where('auto_school_id', $school->id)
            ->where('on_trial', true)
            ->exists();
    }

    private function sendTrialStarted(AutoSchool $school, Subscription $subscription): void
    {
        try {
            if ($school->user) {
                Mail::to($school->user->email)
                    ->queue(new TrialStartedMail($school, $subscription));
            }
        } catch (\Throwable $e) {
            Log::warning('SubscriptionService: trial email failed', ['error' => $e->getMessage()]);
        }
    }

    private function sendSubscriptionActivated(AutoSchool $school, Subscription $subscription): void
    {
        try {
            if ($school->user) {
                Mail::to($school->user->email)
                    ->queue(new SubscriptionActivatedMail($school, $subscription));
            }
        } catch (\Throwable $e) {
            Log::warning('SubscriptionService: activation email failed', ['error' => $e->getMessage()]);
        }
    }
}
