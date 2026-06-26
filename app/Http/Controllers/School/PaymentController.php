<?php

namespace App\Http\Controllers\School;

use App\Http\Controllers\Controller;
use App\Models\Plan;
use App\Services\PaymentService;
use App\Services\SubscriptionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PaymentController extends Controller
{
    public function __construct(
        private PaymentService $paymentService,
        private SubscriptionService $subscriptionService,
    ) {}

    public function createIntent(Request $request): JsonResponse
    {
        $school = auth()->user()->autoSchool;
        abort_if(! $school, 403, 'No school found.');

        $plan = Plan::findOrFail($request->input('plan_id'));

        try {
            $intent = $this->paymentService->createPaymentIntent($school, $plan);

            return response()->json([
                'client_secret' => $intent->client_secret,
                'plan'          => $plan->only('id', 'name', 'price', 'currency'),
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 422);
        }
    }

    public function success(Request $request): Response|RedirectResponse
    {
        $school = auth()->user()->autoSchool;

        if (! $school) {
            return redirect()->route('school.settings');
        }

        $paymentIntentId = $request->input('payment_intent');
        $planId          = $request->input('plan_id');

        if ($paymentIntentId && $planId) {
            $plan    = Plan::find($planId);
            $payment = $school->payments()->where('stripe_payment_intent_id', $paymentIntentId)->first();

            if (! $payment && $plan) {
                $payment      = $this->paymentService->recordPayment($school, $plan, $paymentIntentId, 'completed');
                $subscription = $this->subscriptionService->createSubscription($school, $plan, $paymentIntentId);
                $payment->update(['subscription_id' => $subscription->id]);
            }
        }

        return redirect()->route('school.subscription')
            ->with('success', 'Paiement confirme ! Votre abonnement est maintenant actif.');
    }

    public function cancel(): RedirectResponse
    {
        return redirect()->route('school.subscription')
            ->with('error', 'Paiement annule. Votre abonnement n\'a pas ete modifie.');
    }
}
