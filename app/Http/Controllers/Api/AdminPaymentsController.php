<?php

namespace App\Http\Controllers\Api;

use App\Models\Payment;
use App\Http\Controllers\Controller;
use Carbon\Carbon;

class AdminPaymentsController extends Controller
{
    public function index()
    {
        $payments = Payment::with(['autoSchool:id,name', 'autoSchool.user:id,email'])
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        $summary = [
            'total_revenue'          => Payment::where('status', 'completed')->sum('amount'),
            'total_transactions'     => Payment::count(),
            'pending_transactions'   => Payment::where('status', 'pending')->count(),
            'last_30_days_revenue'   => Payment::where('status', 'completed')
                ->where('created_at', '>=', Carbon::now()->subDays(30))
                ->sum('amount'),
        ];

        return response()->json([
            'data'    => $payments->through(fn($payment) => [
                'id'          => $payment->id,
                'school_name' => $payment->autoSchool?->name,
                'user_email'  => $payment->autoSchool?->user?->email,
                'amount'      => $payment->amount,
                'currency'    => $payment->currency,
                'status'      => $payment->status,
                'paid_at'     => $payment->paid_at,
                'created_at'  => $payment->created_at,
            ]),
            'summary' => $summary,
        ]);
    }
}
