<?php

namespace App\Http\Controllers\School;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use App\Models\Plan;
use App\Services\InvoiceService;
use App\Services\PaymentService;
use App\Services\StripeService;
use App\Services\SubscriptionService;
use Illuminate\Database\QueryException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class PaymentController extends Controller
{
    public function __construct(
        private PaymentService $paymentService,
        private StripeService $stripe,
        private SubscriptionService $subscriptionService,
        private InvoiceService $invoiceService,
    ) {}

    // ── Coupon validation ─────────────────────────────────────────────────────

    public function validateCoupon(Request $request): JsonResponse
    {
        $request->validate([
            'code'    => 'required|string|max:50',
            'plan_id' => 'required|integer|exists:plans,id',
        ]);

        $coupon = Coupon::where('code', strtoupper($request->code))->first();

        if (! $coupon || ! $coupon->isValid()) {
            return response()->json(['error' => 'Coupon invalide, expiré ou épuisé.'], 422);
        }

        $plan = Plan::findOrFail($request->plan_id);

        if ($coupon->min_amount && (float)$plan->price < (float)$coupon->min_amount) {
            return response()->json([
                'error' => "Ce coupon nécessite un montant minimum de {$coupon->min_amount} MAD.",
            ], 422);
        }

        $discount   = $coupon->computeDiscount((float)$plan->price);
        $finalPrice = max(0, (float)$plan->price - $discount);
        [$net, $vat] = $this->stripe->splitVAT($finalPrice);

        return response()->json([
            'coupon'         => $coupon->only('id', 'code', 'discount_type', 'discount_value', 'description'),
            'original_price' => (float)$plan->price,
            'discount_amount'=> $discount,
            'final_price'    => $finalPrice,
            'vat_rate'       => $this->stripe->getVatRate(),
            'vat_amount'     => $vat,
            'net_amount'     => $net,
        ]);
    }

    // ── Standard subscription intent ──────────────────────────────────────────

    public function createIntent(Request $request): JsonResponse
    {
        $school = auth()->user()->autoSchool;
        abort_if(! $school, 403, 'No school found.');

        $plan = Plan::findOrFail($request->input('plan_id'));

        $coupon = null;
        if ($couponCode = $request->input('coupon_code')) {
            $coupon = Coupon::where('code', strtoupper($couponCode))->first();

            if (! $coupon || ! $coupon->isValid()) {
                return response()->json(['error' => 'Coupon invalide ou expiré.'], 422);
            }

            if ($coupon->min_amount && (float)$plan->price < (float)$coupon->min_amount) {
                return response()->json([
                    'error' => "Ce coupon nécessite un montant minimum de {$coupon->min_amount} MAD.",
                ], 422);
            }
        }

        try {
            $result = $this->stripe->createPaymentIntent($school, $plan, $coupon, 'subscription');

            return response()->json([
                'client_secret'  => $result['intent']->client_secret,
                'plan'           => $plan->only('id', 'name', 'price', 'currency'),
                'coupon'         => $coupon ? ['code' => $coupon->code, 'discount' => $result['discount']] : null,
                'final_price'    => $result['gross'],
                'net_amount'     => $result['net'],
                'vat_amount'     => $result['vat'],
                'vat_rate'       => $this->stripe->getVatRate(),
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 422);
        }
    }

    // ── Upgrade intent (proration) ─────────────────────────────────────────────

    public function upgradeIntent(Request $request): JsonResponse
    {
        $request->validate(['plan_id' => 'required|integer|exists:plans,id']);

        $school = auth()->user()->autoSchool;
        abort_if(! $school, 403);

        $currentSub = $school->subscription;
        if (! $currentSub?->isActive()) {
            return response()->json(['error' => 'Aucun abonnement actif.'], 422);
        }

        $newPlan = Plan::findOrFail($request->plan_id);

        if ((float)$newPlan->price <= (float)($currentSub->plan?->price ?? 0)) {
            return response()->json(['error' => "Utilisez 'Rétrograder' pour passer à un plan moins cher."], 422);
        }

        try {
            $result      = $this->stripe->createUpgradeIntent($school, $currentSub, $newPlan);
            $proration   = $result['proration'];

            return response()->json([
                'client_secret'    => $result['intent']->client_secret,
                'proration_amount' => $proration,
                'net_amount'       => $result['net'],
                'vat_amount'       => $result['vat'],
                'new_plan'         => $newPlan->only('id', 'name', 'price', 'currency'),
                'current_plan'     => $currentSub->plan?->only('id', 'name', 'price'),
                'expires_at'       => $currentSub->expires_at?->format('Y-m-d'),
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 422);
        }
    }

    // ── Downgrade (scheduled) ─────────────────────────────────────────────────

    public function downgrade(Request $request): JsonResponse
    {
        $request->validate(['plan_id' => 'required|integer|exists:plans,id']);

        $school = auth()->user()->autoSchool;
        abort_if(! $school, 403);

        $newPlan = Plan::findOrFail($request->plan_id);

        try {
            $this->subscriptionService->scheduleDowngrade($school, $newPlan);

            return response()->json([
                'message'    => "Votre plan sera rétrogradé vers {$newPlan->name} à la fin de la période actuelle.",
                'new_plan'   => $newPlan->only('id', 'name', 'price'),
                'effective'  => $school->subscription?->expires_at?->format('d/m/Y'),
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 422);
        }
    }

    // ── Success handler ───────────────────────────────────────────────────────

    public function success(Request $request): Response|RedirectResponse
    {
        $school = auth()->user()->autoSchool;

        if (! $school) {
            return redirect()->route('school.settings');
        }

        $paymentIntentId = $request->input('payment_intent');
        $type            = $request->input('type', 'subscription');

        if ($paymentIntentId) {
            $payment = $school->payments()->where('stripe_payment_intent_id', $paymentIntentId)->first();

            if (! $payment) {
                // Verify the PaymentIntent directly with Stripe — both its plan (via metadata,
                // never trusting URL params — prevents plan_id substitution) AND its status
                // (prevents activating a subscription that was never actually paid for).
                try {
                    $stripeIntent = \Stripe\PaymentIntent::retrieve($paymentIntentId);
                } catch (\Exception $e) {
                    Log::warning('Payment success: unable to verify PaymentIntent with Stripe', [
                        'payment_intent' => $paymentIntentId,
                        'error'          => $e->getMessage(),
                    ]);
                    $stripeIntent = null;
                }

                if (! $stripeIntent || $stripeIntent->status !== 'succeeded') {
                    // Not confirmed yet (or Stripe unreachable) — never activate from here.
                    // The webhook remains the sole source of truth for payment confirmation.
                    return redirect()->route('school.subscription')
                        ->with('info', 'Votre paiement est en cours de vérification. Votre abonnement sera activé dès confirmation par notre système.');
                }

                $trustedPlanId = $stripeIntent->metadata->plan_id ?? null;
                $type          = $stripeIntent->metadata->payment_type ?? $type;
                $plan          = $trustedPlanId ? Plan::find($trustedPlanId) : null;

                if ($plan) {
                    // Coupon is read from the Stripe-signed intent metadata (set when the
                    // intent was created), never from the request — the request's coupon_id
                    // is client-controlled and could be swapped for an unrelated valid coupon.
                    $couponId = $stripeIntent->metadata->coupon_id ?? null;
                    $coupon   = $couponId ? Coupon::find((int)$couponId) : null;
                    $discount = $coupon ? $coupon->computeDiscount((float)$plan->price) : 0.0;

                    try {
                        $payment = $this->paymentService->recordPayment(
                            $school, $plan, $paymentIntentId, 'success', $coupon, $discount, $type
                        );
                    } catch (QueryException $e) {
                        // Lost the race against the webhook, which already recorded this
                        // payment concurrently — treat it as already processed.
                        $payment = $school->payments()->where('stripe_payment_intent_id', $paymentIntentId)->first();
                        if (! $payment) {
                            throw $e;
                        }
                    }

                    if ($payment->wasRecentlyCreated) {
                        if ($type === 'upgrade') {
                            $currentSub = $school->subscription;
                            if ($currentSub) {
                                $this->subscriptionService->upgrade($school, $plan, $payment);
                            }
                        } else {
                            $subscription = $this->subscriptionService->createSubscription($school, $plan, $paymentIntentId);
                            $payment->update(['subscription_id' => $subscription->id]);
                        }

                        if ($coupon) {
                            $coupon->recordUsage();
                        }
                    }
                }
            }
        }

        $message = $type === 'upgrade'
            ? 'Mise à niveau réussie ! Votre plan a été mis à jour.'
            : 'Paiement confirmé ! Votre abonnement est maintenant actif.';

        return redirect()->route('school.subscription')->with('success', $message);
    }

    public function cancel(): RedirectResponse
    {
        return redirect()->route('school.subscription')
            ->with('error', "Paiement annulé. Votre abonnement n'a pas été modifié.");
    }

    // ── Trial activation (no payment) ─────────────────────────────────────────

    public function startTrial(Request $request): RedirectResponse
    {
        $request->validate(['plan_id' => 'required|integer|exists:plans,id']);

        $school = auth()->user()->autoSchool;
        abort_if(! $school, 403);

        $plan = Plan::findOrFail($request->plan_id);

        if (! $plan->hasTrial()) {
            return back()->with('error', 'Ce plan ne propose pas d\'essai gratuit.');
        }

        // Check if already used a trial
        if ($school->subscription?->on_trial) {
            return back()->with('error', 'Vous bénéficiez déjà d\'une période d\'essai.');
        }

        $this->subscriptionService->createTrialSubscription($school, $plan);

        return redirect()->route('school.subscription')
            ->with('success', "Votre essai gratuit de {$plan->trial_days} jours a démarré !");
    }
}
