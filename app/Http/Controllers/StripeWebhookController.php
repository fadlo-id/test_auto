<?php

namespace App\Http\Controllers;

use App\Models\AutoSchool;
use App\Models\Payment;
use App\Models\Plan;
use App\Services\SubscriptionService;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Stripe\Exception\SignatureVerificationException;
use Stripe\Stripe;
use Stripe\Webhook;

class StripeWebhookController extends Controller
{
    public function __construct(private SubscriptionService $subscriptions) {}

    public function handle(Request $request): Response
    {
        $secret    = config('services.stripe.webhook_secret');
        $payload   = $request->getContent();
        $signature = $request->header('Stripe-Signature');

        try {
            Stripe::setApiKey(config('services.stripe.secret'));
            $event = Webhook::constructEvent($payload, $signature, $secret);
        } catch (SignatureVerificationException) {
            return response('Invalid signature.', 400);
        } catch (\Exception $e) {
            return response('Webhook error: ' . $e->getMessage(), 400);
        }

        match ($event->type) {
            'payment_intent.succeeded'  => $this->handlePaymentSucceeded($event->data->object),
            'payment_intent.payment_failed' => $this->handlePaymentFailed($event->data->object),
            default => null,
        };

        return response('OK', 200);
    }

    private function handlePaymentSucceeded(object $intent): void
    {
        $schoolId = $intent->metadata->school_id ?? null;
        $planId   = $intent->metadata->plan_id ?? null;

        if (! $schoolId || ! $planId) {
            return;
        }

        $school = AutoSchool::find($schoolId);
        $plan   = Plan::find($planId);

        if (! $school || ! $plan) {
            return;
        }

        $payment = Payment::firstOrCreate(
            ['stripe_payment_intent_id' => $intent->id],
            [
                'auto_school_id' => $school->id,
                'plan_id'        => $plan->id,
                'amount'         => $intent->amount / 100,
                'currency'       => strtoupper($intent->currency),
                'status'         => 'completed',
                'paid_at'        => now(),
                'description'    => "Abonnement {$plan->name}",
            ]
        );

        if ($payment->wasRecentlyCreated) {
            $subscription = $this->subscriptions->createSubscription($school, $plan, $intent->id);
            $payment->update(['subscription_id' => $subscription->id]);
        }
    }

    private function handlePaymentFailed(object $intent): void
    {
        $schoolId = $intent->metadata->school_id ?? null;
        $planId   = $intent->metadata->plan_id ?? null;

        if (! $schoolId || ! $planId) {
            return;
        }

        Payment::updateOrCreate(
            ['stripe_payment_intent_id' => $intent->id],
            [
                'auto_school_id' => $schoolId,
                'plan_id'        => $planId,
                'amount'         => $intent->amount / 100,
                'currency'       => strtoupper($intent->currency),
                'status'         => 'failed',
                'description'    => 'Paiement echoue',
            ]
        );
    }
}
