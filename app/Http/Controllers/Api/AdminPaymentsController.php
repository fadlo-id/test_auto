<?php

namespace App\Http\Controllers\Api;

use App\Models\Payment;
use App\Models\Subscription;
use App\Http\Controllers\Controller;
use Carbon\Carbon;

class AdminPaymentsController extends Controller
{
    public function index()
    {
        $this->authorize('isAdmin');

        $payments = Payment::with(['school', 'user'])
            ->orderBy('created_at', 'desc')
            ->paginate(20)
            ->map(function ($payment) {
                return [
                    'id' => $payment->id,
                    'transaction_id' => $payment->transaction_id,
                    'school_name' => $payment->school?->name,
                    'user_email' => $payment->user?->email,
                    'amount' => $payment->amount,
                    'type' => $payment->type,
                    'status' => $payment->status,
                    'created_at' => $payment->created_at,
                ];
            });

        // Calculate summary
        $summary = [
            'total_revenue' => Payment::where('status', 'completed')->sum('amount'),
            'total_transactions' => Payment::count(),
            'pending_transactions' => Payment::where('status', 'pending')->count(),
            'last_30_days_revenue' => Payment::where('status', 'completed')
                ->where('created_at', '>=', Carbon::now()->subDays(30))
                ->sum('amount'),
        ];

        return response()->json([
            'data' => $payments,
            'summary' => $summary,
        ]);
    }
}
