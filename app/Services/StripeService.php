<?php

namespace App\Services;

use App\Models\AutoSchool;
use App\Models\Coupon;
use App\Models\Plan;
use App\Models\Subscription;
use Stripe\Customer;
use Stripe\PaymentIntent;
use Stripe\Refund;
use Stripe\Stripe;

class StripeService
{
    private float $vatRate;

    public function __construct()
    {
        $key = config('services.stripe.secret');
        if ($key) {
            Stripe::setApiKey($key);
        }
        $this->vatRate = (float) config('services.stripe.vat_rate', 20);
    }

    // ── Customer management ───────────────────────────────────────────────────

    public function createOrGetCustomer(AutoSchool $school): string
    {
        if ($school->stripe_customer_id) {
            return $school->stripe_customer_id;
        }

        $this->assertConfigured();

        $customer = Customer::create([
            'email'    => $school->user->email ?? $school->email,
            'name'     => $school->name,
            'metadata' => ['school_id' => $school->id],
        ]);

        $school->update(['stripe_customer_id' => $customer->id]);

        return $customer->id;
    }

    // ── Payment Intent ────────────────────────────────────────────────────────

    /**
     * Creates a Stripe PaymentIntent with VAT-inclusive amount and full metadata.
     *
     * @return array{intent: PaymentIntent, gross: float, net: float, vat: float, discount: float}
     */
    public function createPaymentIntent(
        AutoSchool $school,
        Plan $plan,
        ?Coupon $coupon = null,
        string $type = 'subscription'
    ): array {
        $this->assertConfigured();

        $customerId = $this->createOrGetCustomer($school);

        $baseAmount     = (float) $plan->price;
        $discount       = $coupon ? $coupon->computeDiscount($baseAmount) : 0.0;
        $grossAfterDisc = max(0, $baseAmount - $discount);
        [$net, $vat]    = $this->splitVAT($grossAfterDisc);

        $intent = PaymentIntent::create([
            'amount'      => (int) round($grossAfterDisc * 100),
            'currency'    => strtolower($plan->currency ?? 'mad'),
            'customer'    => $customerId,
            'description' => "{$plan->name} — {$school->name}",
            'metadata'    => [
                'school_id'       => $school->id,
                'plan_id'         => $plan->id,
                'coupon_id'       => $coupon?->id ?? '',
                'coupon_code'     => $coupon?->code ?? '',
                'discount_amount' => $discount,
                'vat_rate'        => $this->vatRate,
                'payment_type'    => $type,
            ],
        ]);

        return compact('intent', 'grossAfterDisc', 'net', 'vat', 'discount') + ['gross' => $grossAfterDisc];
    }

    /**
     * Creates a PaymentIntent for a plan upgrade (proration amount).
     *
     * @return array{intent: PaymentIntent, proration: float, net: float, vat: float}
     */
    public function createUpgradeIntent(
        AutoSchool $school,
        Subscription $currentSub,
        Plan $newPlan
    ): array {
        $this->assertConfigured();

        $customerId    = $this->createOrGetCustomer($school);
        $prorationAmt  = $this->calculateProration($currentSub, $newPlan);
        [$net, $vat]   = $this->splitVAT($prorationAmt);

        $intent = PaymentIntent::create([
            'amount'      => (int) round($prorationAmt * 100),
            'currency'    => strtolower($newPlan->currency ?? 'mad'),
            'customer'    => $customerId,
            'description' => "Upgrade vers {$newPlan->name} — {$school->name}",
            'metadata'    => [
                'school_id'          => $school->id,
                'plan_id'            => $newPlan->id,
                'old_plan_id'        => $currentSub->plan_id,
                'subscription_id'    => $currentSub->id,
                'payment_type'       => 'upgrade',
                'vat_rate'           => $this->vatRate,
            ],
        ]);

        return ['intent' => $intent, 'proration' => $prorationAmt, 'net' => $net, 'vat' => $vat];
    }

    // ── Refund ────────────────────────────────────────────────────────────────

    public function refundPayment(string $paymentIntentId, float $amount, string $reason = 'requested_by_customer'): Refund
    {
        $this->assertConfigured();

        return Refund::create([
            'payment_intent' => $paymentIntentId,
            'amount'         => (int) round($amount * 100),
            'reason'         => $reason,
        ]);
    }

    // ── Proration ────────────────────────────────────────────────────────────

    /**
     * Calculate proration amount for an upgrade.
     * Formula: (new_daily_rate - old_daily_rate) × remaining_days
     */
    public function calculateProration(Subscription $subscription, Plan $newPlan): float
    {
        $expiresAt   = $subscription->expires_at;
        $startedAt   = $subscription->started_at;

        if (! $expiresAt || $expiresAt->isPast()) {
            return (float) $newPlan->price;
        }

        $totalDays     = max(1, (int) $startedAt->diffInDays($expiresAt));
        $remainingDays = max(0, (int) now()->diffInDays($expiresAt, false));

        $oldPlan       = $subscription->plan;
        $oldDaily      = $oldPlan ? ((float)$oldPlan->price / $totalDays) : 0;
        $newDaily      = (float)$newPlan->price / $totalDays;

        $proration = ($newDaily - $oldDaily) * $remainingDays;

        return max(0, round($proration, 2));
    }

    // ── VAT helpers ───────────────────────────────────────────────────────────

    /** Returns [net_amount (HT), vat_amount (TVA)] from a TTC gross amount */
    public function splitVAT(float $grossTTC): array
    {
        if ($this->vatRate <= 0 || $grossTTC <= 0) {
            return [$grossTTC, 0.0];
        }
        $net = round($grossTTC / (1 + $this->vatRate / 100), 2);
        $vat = round($grossTTC - $net, 2);
        return [$net, $vat];
    }

    public function getVatRate(): float
    {
        return $this->vatRate;
    }

    // ── Guard ─────────────────────────────────────────────────────────────────

    private function assertConfigured(): void
    {
        if (! config('services.stripe.secret')) {
            throw new \RuntimeException('Stripe non configuré. Ajoutez STRIPE_SECRET dans votre .env');
        }
    }
}
