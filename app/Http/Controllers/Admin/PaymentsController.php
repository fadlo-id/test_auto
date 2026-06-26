<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PaymentsController extends Controller
{
    public function index(Request $request): Response
    {
        $payments = Payment::with(['autoSchool:id,name,city', 'autoSchool.user:id,name,email', 'plan:id,name'])
            ->when($request->search, fn($q, $s) => $q->whereHas('autoSchool', fn($sq) => $sq->where('name', 'like', "%$s%")))
            ->when($request->status, fn($q, $s) => $q->where('status', $s))
            ->latest()
            ->paginate(20)
            ->withQueryString();

        $stats = [
            'total_revenue'  => Payment::where('status', 'completed')->sum('amount'),
            'total_payments' => Payment::count(),
            'pending_count'  => Payment::where('status', 'pending')->count(),
        ];

        return Inertia::render('Admin/Payments', [
            'payments' => $payments,
            'stats'    => $stats,
            'filters'  => $request->only(['search', 'status']),
        ]);
    }
}
