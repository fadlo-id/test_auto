<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Subscription;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SubscriptionsController extends Controller
{
    public function index(Request $request): Response
    {
        $subscriptions = Subscription::with(['autoSchool:id,name,city', 'plan:id,name,price'])
            ->when($request->status && $request->status !== 'all', fn($q) => $q->where('status', $request->status))
            ->when($request->search, fn($q, $s) => $q->whereHas('autoSchool', fn($sq) => $sq->where('name', 'like', "%$s%")))
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Admin/Subscriptions', [
            'subscriptions' => $subscriptions,
            'filters'       => $request->only(['search', 'status']),
        ]);
    }

    public function cancel(Request $request, Subscription $subscription): RedirectResponse
    {
        $request->validate(['reason' => 'nullable|string|max:500']);

        $subscription->update([
            'status'              => 'cancelled',
            'cancellation_reason' => $request->reason ?? 'Annulé par l\'admin',
            'cancelled_at'        => now(),
        ]);

        return back()->with('success', 'Abonnement annulé.');
    }
}
