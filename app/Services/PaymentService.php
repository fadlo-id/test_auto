<?php

namespace App\Services;

use App\Models\AutoSchool;
use App\Models\Payment;
use App\Models\Plan;
use Stripe\PaymentIntent;
use Stripe\Stripe;

class PaymentService
{
    public function __construct()
    {
        $key = config('services.stripe.secret');
        if ($key) {
            Stripe::setApiKey($key);
        }
    }

    public function createPaymentIntent(AutoSchool $school, Plan $plan): PaymentIntent
    {
        $key = config('services.stripe.secret');
        if (! $key) {
            throw new \RuntimeException('Stripe non configuré. Ajoutez STRIPE_SECRET dans votre .env');
        }

        return PaymentIntent::create([
            'amount'   => (int) ($plan->price * 100),
            'currency' => strtolower($plan->currency ?? 'mad'),
            'metadata' => [
                'school_id' => $school->id,
                'plan_id'   => $plan->id,
            ],
        ]);
    }

    public function recordPayment(AutoSchool $school, Plan $plan, string $stripeIntentId, string $status = 'succeeded'): Payment
    {
        return Payment::create([
            'auto_school_id'         => $school->id,
            'plan_id'                => $plan->id,
            'amount'                 => $plan->price,
            'currency'               => $plan->currency ?? 'MAD',
            'status'                 => $status,
            'stripe_payment_intent_id' => $stripeIntentId,
            'paid_at'                => $status === 'succeeded' ? now() : null,
        ]);
    }

    public function getSchoolPayments(AutoSchool $school, int $perPage = 10)
    {
        return $school->payments()->with('plan')->latest()->paginate($perPage);
    }
}
