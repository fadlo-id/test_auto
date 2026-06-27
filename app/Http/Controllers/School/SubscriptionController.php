<?php

namespace App\Http\Controllers\School;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\Plan;
use App\Services\SubscriptionService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class SubscriptionController extends Controller
{
    public function __construct(private SubscriptionService $subscriptions) {}

    public function cancel(): RedirectResponse
    {
        $school = auth()->user()->autoSchool;
        abort_if(! $school, 403);

        $subscription = $school->subscription;
        if (! $subscription || $subscription->status !== 'active') {
            return back()->with('error', 'Aucun abonnement actif a annuler.');
        }

        $this->subscriptions->cancelSubscription($subscription, 'Annule par le proprietaire');

        return back()->with('success', 'Votre abonnement a ete annule.');
    }

    public function index(): Response|\Illuminate\Http\RedirectResponse
    {
        $school = auth()->user()->autoSchool;

        if (! $school) {
            return redirect()->route('school.settings');
        }

        $plans = Plan::where('is_active', true)->get();
        $payments = $school->payments()
            ->with('plan:id,name')
            ->latest()
            ->take(10)
            ->get(['id', 'plan_id', 'amount', 'currency', 'status', 'created_at']);

        return Inertia::render('SchoolDashboard/Subscription', [
            'school'       => $school->only('id', 'name', 'city', 'status'),
            'subscription' => $school->subscription?->load('plan'),
            'plans'        => $plans,
            'payments'     => $payments,
        ]);
    }
}
