<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Nouvelle demande de réservation</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f9fafb; margin: 0; padding: 24px; color: #111827; }
        .card { background: #fff; border-radius: 12px; max-width: 560px; margin: 0 auto; padding: 32px; border: 1px solid #e5e7eb; }
        .badge { display: inline-block; background: #fff7ed; color: #ea580c; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 600; letter-spacing: 0.4px; }
        h1 { font-size: 20px; font-weight: 700; margin: 16px 0 4px; }
        .sub { color: #6b7280; font-size: 14px; margin-bottom: 24px; }
        .info-row { display: flex; gap: 8px; align-items: flex-start; margin-bottom: 8px; font-size: 14px; }
        .info-label { color: #6b7280; min-width: 120px; }
        .info-value { color: #111827; font-weight: 500; }
        .divider { border: none; border-top: 1px solid #f3f4f6; margin: 24px 0; }
        .btn { display: inline-block; background: #ea580c; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; }
        .footer { margin-top: 32px; font-size: 12px; color: #9ca3af; text-align: center; }
    </style>
</head>
<body>
    <div class="card">
        <div class="badge">Nouvelle réservation</div>
        <h1>Demande de réservation reçue</h1>
        <p class="sub">Un candidat souhaite s'inscrire dans votre auto-école <strong>{{ $booking->autoSchool->name }}</strong>.</p>

        <div class="info-row">
            <span class="info-label">Nom</span>
            <span class="info-value">{{ $booking->name }}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Email</span>
            <span class="info-value">{{ $booking->email }}</span>
        </div>
        @if ($booking->phone)
        <div class="info-row">
            <span class="info-label">Téléphone</span>
            <span class="info-value">{{ $booking->phone }}</span>
        </div>
        @endif
        @if ($booking->permit_type)
        <div class="info-row">
            <span class="info-label">Type de permis</span>
            <span class="info-value">{{ strtoupper($booking->permit_type) }}</span>
        </div>
        @endif
        @if ($booking->preferred_date)
        <div class="info-row">
            <span class="info-label">Date souhaitée</span>
            <span class="info-value">{{ $booking->preferred_date->format('d/m/Y') }}</span>
        </div>
        @endif
        @if ($booking->message)
        <div class="info-row">
            <span class="info-label">Message</span>
            <span class="info-value">{{ $booking->message }}</span>
        </div>
        @endif

        <hr class="divider">
        <a href="{{ route('school.bookings') }}" class="btn">Voir les réservations</a>

        <div class="footer">
            AutoEcoles Maroc &mdash; Ce message est automatique, ne pas répondre directement.
        </div>
    </div>
</body>
</html>
