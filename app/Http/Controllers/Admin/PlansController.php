<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Plan;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PlansController extends Controller
{
    public function index(): Response
    {
        $plans = Plan::withCount('subscriptions')
            ->orderBy('price')
            ->get();

        return Inertia::render('Admin/Plans', [
            'plans' => $plans,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name'            => 'required|string|max:100',
            'slug'            => 'required|string|max:100|unique:plans,slug',
            'description'     => 'nullable|string|max:500',
            'price'           => 'required|numeric|min:0',
            'billing_period'  => 'required|in:monthly,yearly',
            'stripe_price_id' => 'nullable|string|max:100',
            'max_listings'    => 'nullable|integer|min:1',
            'is_active'       => 'boolean',
        ]);

        $validated['features'] = [
            'listing'  => true,
            'reviews'  => true,
            'analytics'=> (bool) $request->input('analytics', false),
            'featured' => (bool) $request->input('featured', false),
            'support'  => (bool) $request->input('support', false),
        ];

        Plan::create($validated);

        return back()->with('success', 'Plan créé avec succès.');
    }

    public function update(Request $request, Plan $plan): RedirectResponse
    {
        $validated = $request->validate([
            'name'            => 'required|string|max:100',
            'description'     => 'nullable|string|max:500',
            'price'           => 'required|numeric|min:0',
            'billing_period'  => 'required|in:monthly,yearly',
            'stripe_price_id' => 'nullable|string|max:100',
            'max_listings'    => 'nullable|integer|min:1',
            'is_active'       => 'boolean',
        ]);

        $validated['features'] = [
            'listing'   => true,
            'reviews'   => true,
            'analytics' => (bool) $request->input('analytics', false),
            'featured'  => (bool) $request->input('featured', false),
            'support'   => (bool) $request->input('support', false),
        ];

        $plan->update($validated);

        return back()->with('success', 'Plan mis à jour.');
    }

    public function destroy(Plan $plan): RedirectResponse
    {
        if ($plan->subscriptions()->where('status', 'active')->exists()) {
            return back()->with('error', 'Impossible de supprimer un plan avec des abonnements actifs.');
        }

        $plan->update(['is_active' => false]);

        return back()->with('success', 'Plan désactivé.');
    }
}
