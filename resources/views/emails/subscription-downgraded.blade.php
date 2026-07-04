<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"><title>Changement d'abonnement</title></head>
<body style="font-family:sans-serif;background:#f9fafb;margin:0;padding:20px">
<div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.1)">
  <div style="background:#ea580c;padding:32px;text-align:center">
    <h1 style="color:#fff;margin:0;font-size:24px">AutoEcoles.ma</h1>
  </div>
  <div style="padding:32px">
    <h2 style="color:#111827;margin-top:0">ℹ️ Changement d'abonnement programmé</h2>
    <p style="color:#374151">Bonjour <strong>{{ $school->name }}</strong>,</p>
    <p style="color:#374151">
      Votre demande de passage au plan <strong>{{ $newPlan->name }}</strong> a été enregistrée.
      Elle sera effective à la fin de votre période actuelle le
      <strong>{{ $currentSubscription->expires_at?->format('d/m/Y') }}</strong>.
    </p>
    <p style="color:#6b7280;font-size:14px">Vous conservez l'accès à votre plan actuel jusqu'à cette date.</p>
    <div style="text-align:center;margin:24px 0">
      <a href="{{ url('/school/subscription') }}" style="background:#ea580c;color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;display:inline-block">Mon abonnement</a>
    </div>
  </div>
  <div style="background:#f3f4f6;padding:16px;text-align:center">
    <p style="color:#9ca3af;font-size:12px;margin:0">© {{ date('Y') }} AutoEcoles.ma</p>
  </div>
</div>
</body></html>
