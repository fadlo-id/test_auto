<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"><title>Confirmation de paiement</title></head>
<body style="font-family:sans-serif;background:#f9fafb;margin:0;padding:20px">
<div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.1)">
  <div style="background:#ea580c;padding:32px;text-align:center">
    <h1 style="color:#fff;margin:0;font-size:24px">AutoEcoles.ma</h1>
  </div>
  <div style="padding:32px">
    <h2 style="color:#111827;margin-top:0">✅ Paiement confirmé</h2>
    <p style="color:#374151">Merci, votre paiement a bien été reçu.</p>
    <div style="background:#f0fdf4;border-left:4px solid #22c55e;padding:16px;border-radius:4px;margin:20px 0">
      <p style="margin:0;color:#166534"><strong>N° Facture :</strong> {{ $payment->invoice_number }}</p>
      <p style="margin:4px 0 0;color:#166534"><strong>Montant :</strong> {{ number_format($payment->amount, 2, ',', ' ') }} {{ $payment->currency }}</p>
      <p style="margin:4px 0 0;color:#166534"><strong>Plan :</strong> {{ $payment->plan?->name }}</p>
    </div>
    <p style="color:#6b7280;font-size:14px">La facture est disponible dans votre espace abonnement.</p>
    <div style="text-align:center;margin:24px 0">
      <a href="{{ url('/school/subscription') }}" style="background:#ea580c;color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;display:inline-block">Mon espace abonnement</a>
    </div>
  </div>
  <div style="background:#f3f4f6;padding:16px;text-align:center">
    <p style="color:#9ca3af;font-size:12px;margin:0">© {{ date('Y') }} AutoEcoles.ma</p>
  </div>
</div>
</body></html>
