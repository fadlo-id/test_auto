<?php

namespace App\Http\Controllers\Api;

use App\Models\Subscription;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class AdminSubscriptionsController extends Controller
{
    public function index()
    {
        $subscriptions = Subscription::with(['autoSchool:id,name', 'plan:id,name,price'])
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json($subscriptions->through(fn($sub) => [
            'id'          => $sub->id,
            'school_name' => $sub->autoSchool?->name,
            'plan_name'   => $sub->plan?->name,
            'price'       => $sub->plan?->price,
            'status'      => $sub->status,
            'started_at'  => $sub->started_at,
            'expires_at'  => $sub->expires_at,
        ]));
    }

    public function cancel(string $id, Request $request)
    {
        $request->validate(['reason' => 'required|string|max:500']);

        $subscription = Subscription::findOrFail($id);
        $subscription->update([
            'status'               => 'canceled',
            'cancellation_reason'  => $request->input('reason'),
            'cancelled_at'         => now(),
        ]);

        return response()->json([
            'message'      => 'Subscription cancelled successfully',
            'subscription' => $subscription,
        ]);
    }
}
