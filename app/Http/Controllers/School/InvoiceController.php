<?php

namespace App\Http\Controllers\School;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Services\InvoiceService;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Inertia\Inertia;

class InvoiceController extends Controller
{
    public function __construct(private InvoiceService $invoiceService) {}

    public function index(): \Inertia\Response
    {
        $school = auth()->user()->autoSchool;
        abort_if(! $school, 403);

        $invoices = Payment::where('auto_school_id', $school->id)
            ->where('status', 'success')
            ->whereNotNull('invoice_number')
            ->with('plan', 'subscription')
            ->latest('paid_at')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('SchoolDashboard/Invoices', [
            'invoices' => $invoices,
        ]);
    }

    public function download(Payment $payment): Response
    {
        $school = auth()->user()->autoSchool;
        abort_if(! $school || $payment->auto_school_id !== $school->id, 403);

        // Assign invoice number if missing
        if (! $payment->invoice_number) {
            $this->invoiceService->assignNumber($payment);
            $payment->refresh();
        }

        // Ensure VAT is computed
        $this->invoiceService->computeAndSaveVAT($payment);
        $payment->refresh();

        $html = $this->invoiceService->generateHtml($payment);

        return response($html, 200, [
            'Content-Type'        => 'text/html; charset=UTF-8',
            'Content-Disposition' => "inline; filename=\"{$payment->invoice_number}.html\"",
        ]);
    }
}
