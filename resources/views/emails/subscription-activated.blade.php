<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"><title>Abonnement actif</title></head>
<body style="font-family:sans-serif;background:#f9fafb;margin:0;padding:20px">
<div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.1)">
  <div style="background:#ea580c;padding:32px;text-align:center">
    <h1 style="color:#fff;margin:0;font-size:24px">AutoEcoles.ma</h1>
  </div>
  <div style="padding:32px">
    <h2 style="color:#111827;margin-top:0">Votre abonnement est actif</h2>
    <p style="color:#374151">Bonjour <strong>{{ $school->name }}</strong>,</p>
    <p style="color:#374151">
      Votre abonnement <strong>{{ $subscription->plan?->name }}</strong> est maintenant actif. Merci de votre confiance !
    </p>
    <div style="background:#fff7ed;border-left:4px solid #ea580c;padding:16px;border-radius:4px;margin:20px 0">
      <p style="margin:0;color:#9a3412">
        <strong>Plan :</strong> {{ $subscription->plan?->name }}<br>
        <strong>Debut :</strong> {{ $subscription->started_at?->format('d/m/Y') }}<br>
        <strong>Prochain renouvellement :</strong> {{ $subscription->expires_at?->format('d/m/Y') }}
      </p>
    </div>
    <p style="color:#6b7280;font-size:14px">Vos credits de visibilite ont ete crediees et votre fiche beneficie de toutes les fonctionnalites de votre plan.</p>
    <div style="text-align:center;margin:24px 0">
      <a href="{{ route('school.subscription') }}" style="background:#ea580c;color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;display:inline-block">Voir mon abonnement</a>
    </div>
  </div>
  <div style="background:#f3f4f6;padding:16px;text-align:center">
    <p style="color:#9ca3af;font-size:12px;margin:0">© {{ date('Y') }} AutoEcoles.ma</p>
  </div>
</div>
</body></html>
