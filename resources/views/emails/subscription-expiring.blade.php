<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><title>Abonnement expirant</title></head>
<body style="font-family:sans-serif;background:#f9fafb;margin:0;padding:20px">
<div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.1)">
    <div style="background:#f59e0b;padding:32px;text-align:center">
        <h1 style="color:#fff;margin:0;font-size:24px">AutoEcoles.ma</h1>
    </div>
    <div style="padding:32px">
        <h2 style="color:#111827;margin-top:0">Votre abonnement expire dans 7 jours ⚠️</h2>
        <p style="color:#374151">Bonjour,</p>
        <p style="color:#374151">
            Votre abonnement <strong>{{ $subscription->plan?->name }}</strong> pour
            <strong>{{ $subscription->autoSchool?->name }}</strong> expirera le
            <strong>{{ $subscription->expires_at?->format('d/m/Y') }}</strong>.
        </p>
        <p style="color:#374151">
            Renouvelez votre abonnement pour continuer a beneficier de toutes les fonctionnalites premium
            et maintenir votre visibilite sur la plateforme.
        </p>
        <div style="text-align:center;margin:32px 0">
            <a href="{{ url('/school/subscription') }}"
               style="background:#ea580c;color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;display:inline-block">
                Renouveler mon abonnement
            </a>
        </div>
    </div>
    <div style="background:#f3f4f6;padding:16px;text-align:center">
        <p style="color:#9ca3af;font-size:12px;margin:0">© {{ date('Y') }} AutoEcoles.ma</p>
    </div>
</div>
</body>
</html>
