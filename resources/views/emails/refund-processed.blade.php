<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"><title>Remboursement traité</title></head>
<body style="font-family:sans-serif;background:#f9fafb;margin:0;padding:20px">
<div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.1)">
  <div style="background:#6366f1;padding:32px;text-align:center">
    <h1 style="color:#fff;margin:0;font-size:24px">AutoEcoles.ma</h1>
  </div>
  <div style="padding:32px">
    <h2 style="color:#111827;margin-top:0">💳 Remboursement traité</h2>
    <p style="color:#374151">Votre remboursement a été effectué avec succès.</p>
    <div style="background:#eff6ff;border-left:4px solid #6366f1;padding:16px;border-radius:4px;margin:20px 0">
      <p style="margin:0;color:#3730a3"><strong>Montant remboursé :</strong> {{ number_format($refundedAmount, 2, ',', ' ') }} {{ $payment->currency }}</p>
      <p style="margin:4px 0 0;color:#3730a3"><strong>Facture :</strong> {{ $payment->invoice_number }}</p>
      <p style="margin:4px 0 0;color:#3730a3"><strong>Motif :</strong> {{ $reason }}</p>
    </div>
    <p style="color:#6b7280;font-size:14px">Le montant apparaîtra sur votre relevé bancaire dans 5 à 10 jours ouvrés.</p>
  </div>
  <div style="background:#f3f4f6;padding:16px;text-align:center">
    <p style="color:#9ca3af;font-size:12px;margin:0">© {{ date('Y') }} AutoEcoles.ma</p>
  </div>
</div>
</body></html>
