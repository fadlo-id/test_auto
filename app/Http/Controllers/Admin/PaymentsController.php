<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Services\RefundService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class PaymentsController extends Controller
{
    public function __construct(private RefundService $refundService) {}

    public function index(Request $request): Response
    {
        $payments = Payment::with(['autoSchool:id,name,city', 'autoSchool.user:id,name,email', 'plan:id,name,price'])
            ->when($request->search, fn ($q, $s) => $q->whereHas('autoSchool', fn ($sq) => $sq->where('name', 'like', "%$s%")))
            ->when($request->status, fn ($q, $s) => $q->where('status', $s))
            ->when($request->type,   fn ($q, $t) => $q->where('payment_type', $t))
            ->latest('paid_at')
            ->paginate(25)
            ->withQueryString();

        $stats = [
            'total_revenue'      => (float) Payment::where('status', 'success')->sum('amount'),
            'total_refunded'     => (float) Payment::where('status', 'success')->sum('refunded_amount'),
            'total_vat'          => (float) Payment::where('status', 'success')->sum('vat_amount'),
            'total_payments'     => Payment::count(),
            'successful_count'   => Payment::where('status', 'success')->count(),
            'failed_count'       => Payment::where('status', 'failed')->count(),
            'refunded_count'     => Payment::where('status', 'refunded')->count(),
        ];

        return Inertia::render('Admin/Payments', [
            'payments' => $payments,
            'stats'    => $stats,
            'filters'  => $request->only(['search', 'status', 'type']),
        ]);
    }

    public function refund(Request $request, Payment $payment): RedirectResponse
    {
        $request->validate([
            'amount' => "nullable|numeric|min:1|max:{$payment->remainingRefundable()}",
            'reason' => 'nullable|string|max:500',
        ]);

        if ($payment->remainingRefundable() <= 0) {
            return back()->with('error', 'Ce paiement a déjà été entièrement remboursé.');
        }

        $amount = $request->filled('amount')
            ? (float)$request->amount
            : $payment->remainingRefundable();

        $reason = $request->input('reason', 'Remboursement administratif');

        try {
            $result = $this->refundService->refund($payment, $amount, $reason);

            $label = $result['fully_refunded']
                ? "Remboursement total de {$amount} {$payment->currency} effectué."
                : "Remboursement partiel de {$amount} {$payment->currency} effectué.";

            Log::info("Admin refund: payment #{$payment->id}, amount={$amount}, by=" . auth()->id());

            return back()->with('success', $label);
        } catch (\RuntimeException $e) {
            return back()->with('error', $e->getMessage());
        } catch (\Stripe\Exception\ApiErrorException $e) {
            Log::error("Stripe refund failed: {$e->getMessage()}", ['payment_id' => $payment->id]);
            return back()->with('error', "Erreur Stripe : {$e->getMessage()}");
        } catch (\Exception $e) {
            Log::error("Refund error: {$e->getMessage()}", ['payment_id' => $payment->id]);
            return back()->with('error', 'Une erreur est survenue lors du remboursement.');
        }
    }

    // Admin: view invoice HTML
    public function invoice(Payment $payment): \Illuminate\Http\Response
    {
        $invoiceService = app(\App\Services\InvoiceService::class);

        if (! $payment->invoice_number) {
            $invoiceService->assignNumber($payment);
            $payment->refresh();
        }

        $invoiceService->computeAndSaveVAT($payment);
        $payment->refresh();

        return response($invoiceService->generateHtml($payment), 200, [
            'Content-Type' => 'text/html; charset=UTF-8',
        ]);
    }
}
