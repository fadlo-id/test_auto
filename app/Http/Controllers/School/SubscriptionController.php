<?php

namespace App\Http\Controllers\School;

use App\Http\Controllers\Controller;
use App\Models\Plan;
use App\Services\SubscriptionService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Inertia\Response;

class SubscriptionController extends Controller
{
    public function __construct(private SubscriptionService $subscriptions) {}

    public function index(): Response|RedirectResponse
    {
        $school = auth()->user()->autoSchool;

        if (! $school) {
            return redirect()->route('school.settings');
        }

        $subscription = $school->subscription?->load('plan');
        $plans        = Cache::remember('active_plans', now()->addHour(), fn () => Plan::where('is_active', true)->orderBy('price')->get());

        $payments = $school->payments()
            ->with('plan:id,name,billing_period')
            ->latest('paid_at')
            ->take(5)
            ->get([
                'id', 'plan_id', 'amount', 'currency', 'status',
                'invoice_number', 'vat_amount', 'net_amount', 'vat_rate',
                'refunded_amount', 'payment_type', 'paid_at',
            ]);

        $vatRate    = config('services.stripe.vat_rate', 20);
        $stripeKey  = config('services.stripe.key');

        return Inertia::render('SchoolDashboard/Subscription', [
            'school'       => $school->only('id', 'name', 'city', 'status', 'stripe_customer_id'),
            'subscription' => $subscription,
            'plans'        => $plans,
            'payments'     => $payments,
            'vat_rate'     => (float)$vatRate,
            'stripe_key'   => $stripeKey,
        ]);
    }

    public function cancel(Request $request): RedirectResponse
    {
        $school = auth()->user()->autoSchool;
        abort_if(! $school, 403);

        $subscription = $school->subscription;
        if (! $subscription || $subscription->status !== 'active') {
            return back()->with('error', 'Aucun abonnement actif à annuler.');
        }

        $reason = $request->input('reason', 'Annulé par le propriétaire');
        $this->subscriptions->cancelSubscription($subscription, $reason);

        return back()->with('success', 'Votre abonnement a été annulé.');
    }
}
