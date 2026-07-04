<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"><title>Échec de paiement</title></head>
<body style="font-family:sans-serif;background:#f9fafb;margin:0;padding:20px">
<div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.1)">
  <div style="background:#dc2626;padding:32px;text-align:center">
    <h1 style="color:#fff;margin:0;font-size:24px">AutoEcoles.ma</h1>
  </div>
  <div style="padding:32px">
    <h2 style="color:#111827;margin-top:0">⚠️ Paiement échoué — Action requise</h2>
    <p style="color:#374151">Votre paiement n'a pas pu être traité.</p>
    @if($payment->failure_message)
    <div style="background:#fef2f2;border-left:4px solid #dc2626;padding:16px;border-radius:4px;margin:20px 0">
      <p style="margin:0;color:#991b1b"><strong>Raison :</strong> {{ $payment->failure_message }}</p>
    </div>
    @endif
    @if($retryCount > 0 && $retryCount < 3)
    <p style="color:#374151">Nous effectuerons une nouvelle tentative automatiquement. Il vous reste <strong>{{ 3 - $retryCount }} essai(s)</strong>.</p>
    @elseif($retryCount >= 3)
    <p style="color:#dc2626;font-weight:600">Toutes les tentatives ont échoué. Votre abonnement a été suspendu.</p>
    @endif
    <div style="text-align:center;margin:24px 0">
      <a href="{{ url('/school/subscription') }}" style="background:#dc2626;color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;display:inline-block">Mettre à jour mon moyen de paiement</a>
    </div>
  </div>
  <div style="background:#f3f4f6;padding:16px;text-align:center">
    <p style="color:#9ca3af;font-size:12px;margin:0">© {{ date('Y') }} AutoEcoles.ma</p>
  </div>
</div>
</body></html>
