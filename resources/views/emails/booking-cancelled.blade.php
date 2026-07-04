<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Réservation annulée</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f9fafb; margin: 0; padding: 24px; color: #111827; }
        .card { background: #fff; border-radius: 12px; max-width: 560px; margin: 0 auto; padding: 32px; border: 1px solid #e5e7eb; }
        .badge { display: inline-block; background: #fef2f2; color: #dc2626; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 600; letter-spacing: 0.4px; }
        h1 { font-size: 20px; font-weight: 700; margin: 16px 0 4px; }
        .sub { color: #6b7280; font-size: 14px; margin-bottom: 24px; }
        .info-row { display: flex; gap: 8px; align-items: flex-start; margin-bottom: 8px; font-size: 14px; }
        .info-label { color: #6b7280; min-width: 140px; }
        .info-value { color: #111827; font-weight: 500; }
        .divider { border: none; border-top: 1px solid #f3f4f6; margin: 24px 0; }
        .btn { display: inline-block; background: #ea580c; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; }
        .footer { margin-top: 32px; font-size: 12px; color: #9ca3af; text-align: center; }
    </style>
</head>
<body>
    <div class="card">
        <div class="badge">Réservation annulée</div>
        <h1>Votre reservation a ete annulee</h1>
        <p class="sub">
            Bonjour {{ $booking->name }}, votre demande de reservation aupres de
            <strong>{{ $booking->autoSchool->name }}</strong> a ete annulee.
        </p>

        @if ($booking->admin_notes)
        <div class="info-row">
            <span class="info-label">Motif</span>
            <span class="info-value">{{ $booking->admin_notes }}</span>
        </div>
        @endif

        <hr class="divider">
        <a href="{{ route('search') }}" class="btn">Trouver une autre auto-ecole</a>

        <div class="footer">
            AutoEcoles Maroc &mdash; Ce message est automatique, ne pas repondre directement.
        </div>
    </div>
</body>
</html>
