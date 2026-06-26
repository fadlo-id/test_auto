<?php

namespace App\Services;

use App\Models\AutoSchool;
use App\Models\Plan;
use App\Models\Subscription;

class SubscriptionService
{
    public function getActivePlan(AutoSchool $school): ?Subscription
    {
        return $school->subscription()->where('status', 'active')->first();
    }

    public function createSubscription(AutoSchool $school, Plan $plan, string $stripeId): Subscription
    {
        $existing = $school->subscription;

        if ($existing) {
            $existing->cancel('replaced');
        }

        return Subscription::create([
            'auto_school_id'       => $school->id,
            'plan_id'              => $plan->id,
            'stripe_subscription_id' => $stripeId,
            'status'               => 'active',
            'started_at'           => now(),
            'expires_at'           => $plan->billing_period === 'yearly'
                ? now()->addYear()
                : now()->addMonth(),
        ]);
    }

    public function cancelSubscription(Subscription $subscription, string $reason = ''): Subscription
    {
        return tap($subscription)->update([
            'status'              => 'cancelled',
            'cancellation_reason' => $reason,
            'cancelled_at'        => now(),
        ]);
    }

    public function isExpired(Subscription $subscription): bool
    {
        return $subscription->expires_at?->isPast() ?? false;
    }
}
