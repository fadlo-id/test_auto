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
        return Plan::where('is_active', true)
            ->orderBy('price')
            ->get();
    }

    public function subscribe(Request $request)
    {
        $validated = $request->validate([
            'plan_id' => 'required|exists:plans,id',
            'payment_method' => 'required|string',
        ]);

        $school = $request->user()->autoSchools()->firstOrFail();
        $plan = Plan::findOrFail($validated['plan_id']);

        // Cancel existing subscription
        if ($school->subscription) {
            $school->subscription->delete();
        }

        // Create new subscription (simulated - use Stripe in production)
        $subscription = Subscription::create([
            'auto_school_id' => $school->id,
            'plan_id' => $plan->id,
            'started_at' => now(),
            'expires_at' => now()->addMonth(),
            'status' => 'active',
        ]);

        return response()->json($subscription, 201);
    }

    public function current(Request $request)
    {
        $school = $request->user()->autoSchools()->firstOrFail();
        return response()->json($school->subscription);
    }

    public function cancel(Request $request)
    {
        $school = $request->user()->autoSchools()->firstOrFail();
        
        if (!$school->subscription) {
            return response()->json(['message' => 'No active subscription'], 404);
        }

        $school->subscription->update(['status' => 'canceled']);
        return response()->json(['message' => 'Subscription canceled']);
    }
}