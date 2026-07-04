<?php

namespace App\Http\Controllers;

use App\Mail\PaymentFailedMail;
use App\Mail\PaymentSuccessMail;
use App\Models\AutoSchool;
use App\Models\Coupon;
use App\Models\Payment;
use App\Models\Plan;
use App\Models\Subscription;
use App\Services\InvoiceService;
use App\Services\StripeService;
use App\Services\SubscriptionService;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Stripe\Exception\SignatureVerificationException;
use Stripe\Stripe;
use Stripe\Webhook;

class StripeWebhookController extends Controller
{
    public function __construct(
        private SubscriptionService $subscriptions,
        private StripeService $stripe,
        private InvoiceService $invoiceService,
    ) {}

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
            Log::error('Stripe webhook error: ' . $e->getMessage());
            return response('Webhook error.', 400);
        }

        Log::info("Stripe webhook received: {$event->type}", ['event_id' => $event->id]);

        // Idempotency guard: Stripe explicitly documents that the same event can be
        // delivered more than once (retries, manual replays). Record the event id
        // atomically via a DB-unique constraint and skip processing on duplicates,
        // so handlers that aren't naturally idempotent (e.g. retry-count increments,
        // subscription-period extensions) can never be double-applied.
        try {
            $isNewEvent = DB::table('stripe_webhook_events')->insertOrIgnore([
                'stripe_event_id' => $event->id,
                'type'            => $event->type,
                'processed_at'    => now(),
                'created_at'      => now(),
                'updated_at'      => now(),
            ]) > 0;
        } catch (\Throwable $e) {
            // Fail-open on a transient DB error: the signature was already verified,
            // so refusing to process would silently drop a legitimate event.
            Log::error('Stripe webhook: idempotency check failed, processing anyway', [
                'event_id' => $event->id,
                'error'    => $e->getMessage(),
            ]);
            $isNewEvent = true;
        }

        if (! $isNewEvent) {
            Log::info("Stripe webhook duplicate event ignored: {$event->type}", ['event_id' => $event->id]);
            return response('OK', 200);
        }

        match ($event->type) {
            'payment_intent.succeeded'       => $this->handlePaymentSucceeded($event->data->object),
            'payment_intent.payment_failed'  => $this->handlePaymentFailed($event->data->object),
            'payment_intent.canceled'        => $this->handlePaymentCanceled($event->data->object),
            'charge.refunded'                => $this->handleChargeRefunded($event->data->object),
            'customer.subscription.deleted'  => $this->handleSubscriptionDeleted($event->data->object),
            'customer.subscription.updated'  => $this->handleSubscriptionUpdated($event->data->object),
            'invoice.payment_succeeded'      => $this->handleInvoicePaymentSucceeded($event->data->object),
            'invoice.payment_failed'         => $this->handleInvoicePaymentFailed($event->data->object),
            'customer.subscription.trial_will_end' => $this->handleTrialWillEnd($event->data->object),
            default                          => null,
        };

        return response('OK', 200);
    }

    // ── payment_intent.succeeded ──────────────────────────────────────────────

    private function handlePaymentSucceeded(object $intent): void
    {
        $schoolId       = $intent->metadata->school_id ?? null;
        $planId         = $intent->metadata->plan_id ?? null;
        $couponId       = $intent->metadata->coupon_id ?? null;
        $discountAmount = (float)($intent->metadata->discount_amount ?? 0);
        $paymentType    = $intent->metadata->payment_type ?? 'subscription';
        $vatRate        = (float)($intent->metadata->vat_rate ?? config('services.stripe.vat_rate', 20));

        if (! $schoolId || ! $planId) return;

        $school = AutoSchool::find($schoolId);
        $plan   = Plan::find($planId);
        if (! $school || ! $plan) return;

        $coupon        = $couponId ? Coupon::find((int)$couponId) : null;
        $grossAmount   = $intent->amount / 100;
        [$net, $vat]   = $this->stripe->splitVAT($grossAmount);

        $payment = Payment::firstOrCreate(
            ['stripe_payment_intent_id' => $intent->id],
            [
                'auto_school_id'  => $school->id,
                'plan_id'         => $plan->id,
                'coupon_id'       => $coupon?->id,
                'coupon_code'     => $coupon?->code,
                'amount'          => $grossAmount,
                'discount_amount' => $discountAmount > 0 ? $discountAmount : null,
                'currency'        => strtoupper($intent->currency),
                'status'          => 'success',
                'vat_rate'        => $vatRate,
                'vat_amount'      => $vat,
                'net_amount'      => $net,
                'payment_type'    => $paymentType,
                'paid_at'         => now(),
                'description'     => "Abonnement {$plan->name}",
            ]
        );

        if ($payment->wasRecentlyCreated) {
            // Assign invoice number
            $this->invoiceService->assignNumber($payment);

            if ($paymentType === 'upgrade') {
                $oldPlanId  = $intent->metadata->old_plan_id ?? null;
                $subId      = $intent->metadata->subscription_id ?? null;
                $currentSub = $subId ? Subscription::find($subId) : $school->subscription;

                if ($currentSub) {
                    $this->subscriptions->upgrade($school, $plan, $payment);
                }
            } else {
                $subscription = $this->subscriptions->createSubscription($school, $plan, $intent->id);
                $payment->update(['subscription_id' => $subscription->id]);

                if ($coupon) $coupon->recordUsage();
            }

            // Send confirmation email
            try {
                if ($school->user) {
                    Mail::to($school->user->email)->queue(new PaymentSuccessMail($payment->fresh(['plan', 'subscription'])));
                }
            } catch (\Throwable $e) {
                Log::warning('Webhook: payment success email failed', ['error' => $e->getMessage()]);
            }
        }
    }

    // ── payment_intent.payment_failed ─────────────────────────────────────────

    private function handlePaymentFailed(object $intent): void
    {
        $schoolId     = $intent->metadata->school_id ?? null;
        $planId       = $intent->metadata->plan_id ?? null;
        $lastError    = $intent->last_payment_error ?? null;
        $failureCode  = $lastError?->code ?? '';
        $failureMsg   = $lastError?->message ?? 'Paiement refusé';

        if (! $schoolId || ! $planId) return;

        $payment = Payment::updateOrCreate(
            ['stripe_payment_intent_id' => $intent->id],
            [
                'auto_school_id'  => (int)$schoolId,
                'plan_id'         => (int)$planId,
                'amount'          => $intent->amount / 100,
                'currency'        => strtoupper($intent->currency),
                'status'          => 'failed',
                'failure_code'    => $failureCode,
                'failure_message' => $failureMsg,
                'description'     => 'Paiement échoué',
            ]
        );

        // Schedule retry on active subscription
        $school = AutoSchool::find($schoolId);
        if ($school) {
            $sub = $school->subscription;
            if ($sub?->isActive() || $sub?->isPastDue()) {
                $sub->markPastDue();
                $canRetry = $this->subscriptions->schedulePaymentRetry($sub);

                try {
                    if ($school->user) {
                        Mail::to($school->user->email)->queue(
                            new PaymentFailedMail($payment, $sub, $sub->payment_retry_count)
                        );
                    }
                } catch (\Throwable $e) {
                    Log::warning('Webhook: payment failed email failed', ['error' => $e->getMessage()]);
                }
            }
        }
    }

    // ── payment_intent.canceled ───────────────────────────────────────────────

    private function handlePaymentCanceled(object $intent): void
    {
        $payment = Payment::where('stripe_payment_intent_id', $intent->id)->first();

        if ($payment) {
            $payment->update(['status' => 'failed', 'description' => 'Paiement annulé']);
            return;
        }

        $schoolId = $intent->metadata->school_id ?? null;
        $planId   = $intent->metadata->plan_id ?? null;

        if (! $schoolId || ! $planId) return;

        Payment::updateOrCreate(
            ['stripe_payment_intent_id' => $intent->id],
            [
                'auto_school_id' => $schoolId,
                'plan_id'        => $planId,
                'amount'         => $intent->amount / 100,
                'currency'       => strtoupper($intent->currency),
                'status'         => 'failed',
                'description'    => 'Paiement annulé',
            ]
        );
    }

    // ── charge.refunded ───────────────────────────────────────────────────────

    private function handleChargeRefunded(object $charge): void
    {
        $intentId = $charge->payment_intent ?? null;
        if (! $intentId) return;

        $payment = Payment::where('stripe_payment_intent_id', $intentId)->first();
        if (! $payment) {
            Log::warning("Webhook charge.refunded: no payment found for intent {$intentId}");
            return;
        }

        $refundedAmount = $charge->amount_refunded / 100;
        $isFullRefund   = $charge->refunded;
        $latestRefund   = $charge->refunds?->data[0] ?? null;

        $payment->update([
            'refunded_amount'  => $refundedAmount,
            'stripe_refund_id' => $latestRefund?->id,
            'status'           => $isFullRefund ? 'refunded' : $payment->status,
            'description'      => $isFullRefund
                ? 'Remboursement total'
                : "Remboursement partiel ({$refundedAmount} {$payment->currency})",
        ]);

        if ($isFullRefund && $payment->subscription_id) {
            Subscription::find($payment->subscription_id)?->cancel('refunded');
        }
    }

    // ── customer.subscription.deleted ────────────────────────────────────────

    private function handleSubscriptionDeleted(object $stripeSub): void
    {
        $stripeId = $stripeSub->id ?? null;
        if (! $stripeId) return;

        $subscription = Subscription::where('stripe_subscription_id', $stripeId)->first();
        if ($subscription && $subscription->status !== 'cancelled') {
            $subscription->cancel('deleted_by_stripe');
        }
    }

    // ── customer.subscription.updated ─────────────────────────────────────────

    private function handleSubscriptionUpdated(object $stripeSub): void
    {
        $stripeId = $stripeSub->id ?? null;
        if (! $stripeId) return;

        $subscription = Subscription::where('stripe_subscription_id', $stripeId)->first();
        if (! $subscription) return;

        // Sync status from Stripe
        $stripeStatus = $stripeSub->status ?? null;
        if ($stripeStatus === 'past_due') {
            $subscription->markPastDue();
        } elseif ($stripeStatus === 'active') {
            $subscription->reactivate();
        }
    }

    // ── invoice.payment_succeeded ─────────────────────────────────────────────

    private function handleInvoicePaymentSucceeded(object $invoice): void
    {
        $stripeSubscriptionId = $invoice->subscription ?? null;
        if (! $stripeSubscriptionId) return;

        $subscription = Subscription::where('stripe_subscription_id', $stripeSubscriptionId)->first();
        if (! $subscription) return;

        // Renewal — extend the subscription
        $plan = $subscription->plan;
        if ($plan) {
            $newExpiry = $plan->billing_period === 'yearly'
                ? now()->addYear()
                : now()->addMonth();

            $subscription->update([
                'status'              => 'active',
                'expires_at'          => $newExpiry,
                'payment_retry_count' => 0,
                'next_payment_retry_at' => null,
            ]);

            // Restore credits
            app(\App\Services\CreditService::class)->restoreOnRenewal($subscription->autoSchool, $plan);
        }
    }

    // ── invoice.payment_failed ────────────────────────────────────────────────

    private function handleInvoicePaymentFailed(object $invoice): void
    {
        $stripeSubscriptionId = $invoice->subscription ?? null;
        if (! $stripeSubscriptionId) return;

        $subscription = Subscription::where('stripe_subscription_id', $stripeSubscriptionId)->first();
        if (! $subscription) return;

        $subscription->markPastDue();
        $canRetry = $this->subscriptions->schedulePaymentRetry($subscription);

        Log::warning("Invoice payment failed for subscription #{$subscription->id} (school #{$subscription->auto_school_id}), retry #{$subscription->payment_retry_count}");
    }

    // ── customer.subscription.trial_will_end ─────────────────────────────────

    private function handleTrialWillEnd(object $stripeSub): void
    {
        $stripeId = $stripeSub->id ?? null;
        if (! $stripeId) return;

        $subscription = Subscription::where('stripe_subscription_id', $stripeId)
            ->with('autoSchool.user')
            ->first();

        if (! $subscription) return;

        $daysLeft = (int) now()->diffInDays($subscription->trial_ends_at, false);

        try {
            $school = $subscription->autoSchool;
            if ($school?->user) {
                Mail::to($school->user->email)
                    ->queue(new \App\Mail\TrialEndingMail($school, $subscription, $daysLeft));
            }
        } catch (\Throwable $e) {
            Log::warning('Webhook: trial ending email failed', ['error' => $e->getMessage()]);
        }
    }
}
