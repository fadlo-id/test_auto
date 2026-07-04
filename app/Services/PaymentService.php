<?php

namespace App\Services;

use App\Models\AutoSchool;
use App\Models\Coupon;
use App\Models\Payment;
use App\Models\Plan;

class PaymentService
{
    public function __construct(
        private StripeService $stripe,
        private InvoiceService $invoice,
    ) {}

    // ── Intent creation ───────────────────────────────────────────────────────

    public function createPaymentIntent(AutoSchool $school, Plan $plan, ?Coupon $coupon = null): \Stripe\PaymentIntent
    {
        $result = $this->stripe->createPaymentIntent($school, $plan, $coupon);
        return $result['intent'];
    }

    public function createUpgradeIntent(AutoSchool $school, \App\Models\Subscription $currentSub, Plan $newPlan): array
    {
        return $this->stripe->createUpgradeIntent($school, $currentSub, $newPlan);
    }

    // ── Record ────────────────────────────────────────────────────────────────

    public function recordPayment(
        AutoSchool $school,
        Plan $plan,
        string $stripeIntentId,
        string $status = 'success',
        ?Coupon $coupon = null,
        float $discountAmount = 0.0,
        string $type = 'subscription',
        float $amount = 0.0,
    ): Payment {
        $gross   = $amount > 0 ? $amount : (float)$plan->price - $discountAmount;
        [$net, $vat] = $this->stripe->splitVAT($gross);

        $payment = Payment::firstOrCreate(
            ['stripe_payment_intent_id' => $stripeIntentId],
            [
                'auto_school_id'  => $school->id,
                'plan_id'         => $plan->id,
                'coupon_id'       => $coupon?->id,
                'coupon_code'     => $coupon?->code,
                'amount'          => $gross,
                'discount_amount' => $discountAmount > 0 ? $discountAmount : null,
                'currency'        => strtoupper($plan->currency ?? 'MAD'),
                'status'          => $status,
                'vat_rate'        => $this->stripe->getVatRate(),
                'vat_amount'      => $vat,
                'net_amount'      => $net,
                'payment_type'    => $type,
                'paid_at'         => $status === 'success' ? now() : null,
            ]
        );

        if ($payment->wasRecentlyCreated && $status === 'success') {
            $this->invoice->assignNumber($payment);
        }

        return $payment;
    }

    // ── Failed payment ────────────────────────────────────────────────────────

    public function recordFailure(
        AutoSchool $school,
        Plan $plan,
        string $stripeIntentId,
        string $failureCode = '',
        string $failureMessage = ''
    ): Payment {
        return Payment::updateOrCreate(
            ['stripe_payment_intent_id' => $stripeIntentId],
            [
                'auto_school_id'  => $school->id,
                'plan_id'         => $plan->id,
                'amount'          => $plan->price,
                'currency'        => strtoupper($plan->currency ?? 'MAD'),
                'status'          => 'failed',
                'failure_code'    => $failureCode,
                'failure_message' => $failureMessage,
                'description'     => 'Paiement échoué',
            ]
        );
    }

    // ── Queries ───────────────────────────────────────────────────────────────

    public function getSchoolPayments(AutoSchool $school, int $perPage = 15)
    {
        return $school->payments()
            ->with('plan', 'coupon', 'subscription')
            ->latest('paid_at')
            ->paginate($perPage);
    }
}
