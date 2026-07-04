<?php

namespace App\Http\Controllers\School;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\Subscription;
use Inertia\Inertia;
use Inertia\Response;

class BillingController extends Controller
{
    public function index(): Response
    {
        $school = auth()->user()->autoSchool;
        abort_if(! $school, 404);

        $payments = Payment::where('auto_school_id', $school->id)
            ->with('plan:id,name,price,billing_period')
            ->latest()
            ->paginate(15);

        $subscriptions = Subscription::where('auto_school_id', $school->id)
            ->with('plan:id,name,price')
            ->latest()
            ->get();

        $currentSubscription = $subscriptions->where('status', 'active')->first();

        $summary = [
            'total_paid'    => Payment::where('auto_school_id', $school->id)->where('status', 'success')->sum('amount'),
            'total_invoices' => Payment::where('auto_school_id', $school->id)->count(),
        ];

        return Inertia::render('SchoolDashboard/Billing', compact('payments', 'subscriptions', 'currentSubscription', 'summary'));
    }
}
