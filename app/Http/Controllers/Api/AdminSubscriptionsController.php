<?php

namespace App\Http\Controllers\Api;

use App\Models\Subscription;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class AdminSubscriptionsController extends Controller
{
    public function index()
    {
        $this->authorize('isAdmin');

        $subscriptions = Subscription::with(['school', 'plan'])
            ->orderBy('created_at', 'desc')
            ->paginate(20)
            ->map(function ($subscription) {
                return [
                    'id' => $subscription->id,
                    'school_name' => $subscription->school?->name,
                    'plan_name' => $subscription->plan?->name,
                    'price' => $subscription->plan?->price,
                    'status' => $subscription->status,
                    'start_date' => $subscription->start_date,
                    'expires_at' => $subscription->expires_at,
                ];
            });

        return response()->json($subscriptions);
    }

    public function cancel($id, Request $request)
    {
        $this->authorize('isAdmin');

        $request->validate(['reason' => 'required|string']);

        $subscription = Subscription::findOrFail($id);
        $subscription->update([
            'status' => 'cancelled',
            'cancellation_reason' => $request->input('reason'),
            'cancelled_at' => now(),
        ]);

        return response()->json([
            'message' => 'Subscription cancelled successfully',
            'subscription' => $subscription,
        ]);
    }
}
