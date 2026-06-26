<?php

namespace App\Http\Controllers\School;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\Plan;
use Inertia\Inertia;
use Inertia\Response;

class SubscriptionController extends Controller
{
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
            'school'       => $school->only('id', 'name'),
            'subscription' => $school->subscription?->load('plan'),
            'plans'        => $plans,
            'payments'     => $payments,
        ]);
    }
}
