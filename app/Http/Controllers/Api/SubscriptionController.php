<?php

namespace App\Http\Controllers\Api;

use App\Models\Plan;
use App\Models\Subscription;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class SubscriptionController extends Controller
{
    public function plans()
    {
        return response()->json(
            Plan::where('is_active', true)->orderBy('price')->get()
        );
    }

    public function subscribe(Request $request)
    {
        $validated = $request->validate([
            'plan_id'        => 'required|exists:plans,id',
            'payment_method' => 'required|string',
        ]);

        $school = $request->user()->autoSchool;

        if (! $school) {
            return response()->json(['message' => 'No school found for this account'], 404);
        }

        $plan = Plan::findOrFail($validated['plan_id']);

        // Annuler l'abonnement existant
        if ($school->subscription) {
            $school->subscription->update(['status' => 'canceled']);
        }

        $subscription = Subscription::create([
            'auto_school_id' => $school->id,
            'plan_id'        => $plan->id,
            'started_at'     => now(),
            'expires_at'     => now()->addMonth(),
            'status'         => 'active',
        ]);

        return response()->json($subscription->load('plan'), 201);
    }

    public function current(Request $request)
    {
        $school = $request->user()->autoSchool;

        if (! $school) {
            return response()->json(['message' => 'No school found for this account'], 404);
        }

        return response()->json($school->subscription?->load('plan'));
    }

    public function cancel(Request $request)
    {
        $school = $request->user()->autoSchool;

        if (! $school) {
            return response()->json(['message' => 'No school found for this account'], 404);
        }

        if (! $school->subscription) {
            return response()->json(['message' => 'No active subscription'], 404);
        }

        $school->subscription->update(['status' => 'canceled']);

        return response()->json(['message' => 'Subscription canceled']);
    }
}
