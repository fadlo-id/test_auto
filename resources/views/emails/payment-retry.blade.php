<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"><title>Relance paiement</title></head>
<body style="font-family:sans-serif;background:#f9fafb;margin:0;padding:20px">
<div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.1)">
  <div style="background:#f59e0b;padding:32px;text-align:center">
    <h1 style="color:#fff;margin:0;font-size:24px">AutoEcoles.ma</h1>
  </div>
  <div style="padding:32px">
    <h2 style="color:#111827;margin-top:0">🔄 Tentative de paiement {{ $attemptNumber }}/3</h2>
    <p style="color:#374151">Nous tentons à nouveau de prélever votre abonnement <strong>{{ $subscription->plan?->name }}</strong>.</p>
    @if($daysUntilCancellation > 0)
    <div style="background:#fffbeb;border-left:4px solid #f59e0b;padding:16px;border-radius:4px;margin:20px 0">
      <p style="margin:0;color:#92400e">Si le paiement échoue à nouveau, votre abonnement sera annulé dans <strong>{{ $daysUntilCancellation }} jour(s)</strong>.</p>
    </div>
    @endif
    <div style="text-align:center;margin:24px 0">
      <a href="{{ url('/school/subscription') }}" style="background:#f59e0b;color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;display:inline-block">Vérifier mon moyen de paiement</a>
    </div>
  </div>
  <div style="background:#f3f4f6;padding:16px;text-align:center">
    <p style="color:#9ca3af;font-size:12px;margin:0">© {{ date('Y') }} AutoEcoles.ma</p>
  </div>
</div>
</body></html>
