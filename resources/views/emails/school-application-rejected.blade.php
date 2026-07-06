<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><title>Candidature non retenue</title></head>
<body style="font-family:sans-serif;background:#f9fafb;margin:0;padding:20px">
<div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.1)">
    <div style="background:#ea580c;padding:32px;text-align:center">
        <h1 style="color:#fff;margin:0;font-size:24px">AutoEcoles.ma</h1>
    </div>
    <div style="padding:32px">
        <h2 style="color:#111827;margin-top:0">Bonjour {{ $application->owner_name }},</h2>
        <p style="color:#374151">
            Nous vous remercions pour l'intérêt porté à AutoEcoles.ma. Après examen, nous ne sommes malheureusement
            pas en mesure de valider la candidature de <strong>{{ $application->school_name }}</strong> pour le
            moment.
        </p>

        @if ($application->rejection_reason)
            <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:16px;margin:24px 0">
                <p style="color:#991b1b;margin:0;font-size:14px"><strong>Motif :</strong> {{ $application->rejection_reason }}</p>
            </div>
        @endif

        <p style="color:#374151">
            Vous pouvez soumettre une nouvelle candidature à tout moment après avoir pris en compte ces éléments.
        </p>

        <p style="color:#6b7280;font-size:14px">
            Des questions ? Notre équipe support reste disponible pour vous accompagner.
        </p>
    </div>
</div>
</body>
</html>
