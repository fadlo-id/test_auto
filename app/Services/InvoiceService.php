<?php

namespace App\Services;

use App\Models\Payment;
use Illuminate\Support\Facades\DB;

class InvoiceService
{
    private const FORMAT = 'FAC-%s-%06d';

    // ── Invoice number ────────────────────────────────────────────────────────

    public function assignNumber(Payment $payment): string
    {
        if ($payment->invoice_number) {
            return $payment->invoice_number;
        }

        return DB::transaction(function () use ($payment) {
            // Re-check inside transaction after acquiring lock
            $fresh = Payment::where('id', $payment->id)->lockForUpdate()->first();
            if ($fresh?->invoice_number) {
                $payment->invoice_number = $fresh->invoice_number;
                return $fresh->invoice_number;
            }

            $year = now()->year;
            $next = $this->nextSequence($year);
            $num  = sprintf(self::FORMAT, $year, $next);

            $payment->update(['invoice_number' => $num]);
            return $num;
        });
    }

    private function nextSequence(int $year): int
    {
        // lockForUpdate prevents concurrent transactions from reading the same last sequence.
        // Must be called inside a DB::transaction().
        $last = Payment::where('invoice_number', 'like', "FAC-{$year}-%")
            ->whereNotNull('invoice_number')
            ->lockForUpdate()
            ->orderByDesc('invoice_number')
            ->value('invoice_number');

        if (! $last) return 1;

        $parts = explode('-', $last);
        return (int) end($parts) + 1;
    }

    // ── VAT ──────────────────────────────────────────────────────────────────

    public function computeAndSaveVAT(Payment $payment): void
    {
        if ($payment->vat_amount !== null) return; // Already computed

        $gross   = (float) $payment->amount;
        $vatRate = (float) ($payment->vat_rate ?? config('services.stripe.vat_rate', 20));

        if ($vatRate > 0 && $gross > 0) {
            $net = round($gross / (1 + $vatRate / 100), 2);
            $vat = round($gross - $net, 2);
        } else {
            $net = $gross;
            $vat = 0.0;
        }

        $payment->update([
            'vat_rate'   => $vatRate,
            'vat_amount' => $vat,
            'net_amount' => $net,
        ]);
    }

    // ── PDF/HTML Invoice ──────────────────────────────────────────────────────

    public function generateHtml(Payment $payment): string
    {
        $payment->load(['autoSchool', 'plan', 'coupon']);
        $school = $payment->autoSchool;
        $plan   = $payment->plan;

        $appName      = config('app.name', 'AutoEcoles Maroc');
        $invoiceNo    = $payment->invoice_number ?? 'N/A';
        $date         = $payment->paid_at?->format('d/m/Y') ?? now()->format('d/m/Y');
        $gross        = number_format((float) $payment->amount, 2, ',', ' ');
        $net          = number_format((float) ($payment->net_amount ?? $payment->amount), 2, ',', ' ');
        $vat          = number_format((float) ($payment->vat_amount ?? 0), 2, ',', ' ');
        $vatRate      = number_format((float) ($payment->vat_rate ?? 20), 0, ',', ' ');
        $discount     = (float) ($payment->discount_amount ?? 0);
        $currency     = strtoupper($payment->currency ?? 'MAD');
        $billingLabel = ($plan?->billing_period === 'yearly') ? 'annuel' : 'mensuel';
        $paidAtFmt    = $payment->paid_at?->format('d/m/Y') ?? '';
        $expiresAtFmt = $payment->subscription?->expires_at?->format('d/m/Y') ?? 'N/A';
        $stripeIntId  = $payment->stripe_payment_intent_id ?? '';
        $schoolName   = $school?->name ?? '';
        $schoolAddr   = $school?->address ?? '';
        $schoolCity   = $school?->city ?? '';
        $schoolEmail  = $school?->email ?? '';
        $planName     = $plan?->name ?? '';
        $couponCode2  = $payment->coupon_code ?? '';
        $refundReason2 = $payment->refund_reason ?? '';

        $discountRow = $discount > 0
            ? "<tr><td>Remise (coupon {$couponCode2})</td><td style='color:#e53e3e'>- " . number_format($discount, 2, ',', ' ') . " {$currency}</td></tr>"
            : '';

        $refundRow = '';
        if ((float)($payment->refunded_amount ?? 0) > 0) {
            $refunded  = number_format((float) $payment->refunded_amount, 2, ',', ' ');
            $refundRow = "<tr style='color:#e53e3e'><td>Remboursement ({$refundReason2})</td><td>- {$refunded} {$currency}</td></tr>";
        }

        $statusBadge = match($payment->status) {
            'success'  => '<span style="background:#38a169;color:#fff;padding:3px 10px;border-radius:4px;font-size:12px">PAYÉE</span>',
            'refunded' => '<span style="background:#e53e3e;color:#fff;padding:3px 10px;border-radius:4px;font-size:12px">REMBOURSÉE</span>',
            'failed'   => '<span style="background:#e53e3e;color:#fff;padding:3px 10px;border-radius:4px;font-size:12px">ÉCHOUÉE</span>',
            default    => '<span style="background:#718096;color:#fff;padding:3px 10px;border-radius:4px;font-size:12px">' . strtoupper($payment->status) . '</span>',
        };

        return <<<HTML
        <!DOCTYPE html>
        <html lang="fr">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Facture {$invoiceNo}</title>
          <style>
            @page { margin: 20mm; }
            @media print { .no-print { display: none !important; } }
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 13px; color: #2d3748; background: #fff; }
            .container { max-width: 800px; margin: 0 auto; padding: 40px 32px; }
            .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; padding-bottom: 24px; border-bottom: 2px solid #ea580c; }
            .brand { font-size: 22px; font-weight: 700; color: #ea580c; }
            .brand small { display: block; font-size: 12px; font-weight: 400; color: #718096; margin-top: 2px; }
            .invoice-meta { text-align: right; }
            .invoice-meta h1 { font-size: 28px; font-weight: 800; color: #2d3748; letter-spacing: -0.5px; }
            .invoice-meta p { color: #718096; margin-top: 4px; font-size: 12px; }
            .parties { display: flex; justify-content: space-between; margin-bottom: 36px; gap: 24px; }
            .party { flex: 1; background: #f7fafc; padding: 16px; border-radius: 8px; }
            .party h3 { font-size: 10px; font-weight: 700; color: #718096; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 8px; }
            .party p { margin-bottom: 3px; font-size: 13px; }
            .party .name { font-weight: 600; font-size: 15px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
            thead { background: #2d3748; color: #fff; }
            thead th { padding: 12px 16px; text-align: left; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
            tbody tr { border-bottom: 1px solid #e2e8f0; }
            tbody tr:hover { background: #f7fafc; }
            tbody td { padding: 12px 16px; }
            .amounts { margin-left: auto; width: 280px; }
            .amounts table { width: 100%; }
            .amounts td { padding: 6px 12px; font-size: 13px; }
            .amounts td:last-child { text-align: right; font-weight: 500; }
            .amounts .vat-row { color: #718096; font-size: 12px; }
            .amounts .total-row { background: #2d3748; color: #fff; font-weight: 700; font-size: 15px; border-radius: 6px; }
            .amounts .total-row td { padding: 10px 12px; }
            .footer { margin-top: 48px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; color: #a0aec0; font-size: 11px; }
            .btn-print { display: inline-block; padding: 10px 24px; background: #ea580c; color: #fff; border-radius: 6px; text-decoration: none; font-weight: 600; cursor: pointer; border: none; font-size: 14px; margin-bottom: 24px; }
          </style>
        </head>
        <body>
        <div class="no-print" style="padding:12px;background:#fffbeb;text-align:center;border-bottom:1px solid #fcd34d">
          <button class="btn-print" onclick="window.print()">🖨️ Imprimer / Enregistrer en PDF</button>
        </div>
        <div class="container">
          <div class="header">
            <div class="brand">
              {$appName}
              <small>Plateforme Auto-Écoles Maroc</small>
            </div>
            <div class="invoice-meta">
              <h1>FACTURE</h1>
              <p><strong>{$invoiceNo}</strong></p>
              <p>Date : {$date}</p>
              <p style="margin-top:6px">{$statusBadge}</p>
            </div>
          </div>

          <div class="parties">
            <div class="party">
              <h3>Émetteur</h3>
              <p class="name">{$appName}</p>
              <p>Maroc</p>
              <p>contact@autoecoles.ma</p>
            </div>
            <div class="party">
              <h3>Facturé à</h3>
              <p class="name">{$schoolName}</p>
              <p>{$schoolAddr}</p>
              <p>{$schoolCity}</p>
              <p>{$schoolEmail}</p>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th>Période</th>
                <th style="text-align:right">Montant TTC</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <strong>{$planName}</strong><br>
                  <span style="color:#718096;font-size:12px">Abonnement ({$billingLabel})</span>
                </td>
                <td style="color:#718096;font-size:12px">
                  {$paidAtFmt} → {$expiresAtFmt}
                </td>
                <td style="text-align:right;font-weight:600">{$gross} {$currency}</td>
              </tr>
            </tbody>
          </table>

          <div class="amounts">
            <table>
              {$discountRow}
              <tr class="vat-row"><td>Montant HT</td><td>{$net} {$currency}</td></tr>
              <tr class="vat-row"><td>TVA ({$vatRate}%)</td><td>{$vat} {$currency}</td></tr>
              {$refundRow}
              <tr class="total-row"><td>TOTAL TTC</td><td>{$gross} {$currency}</td></tr>
            </table>
          </div>

          <div class="footer">
            <p>Ce document est généré automatiquement par {$appName}.</p>
            <p>Stripe Payment ID : {$stripeIntId}</p>
          </div>
        </div>
        </body>
        </html>
        HTML;
    }
}
