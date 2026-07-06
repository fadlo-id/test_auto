<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><title>Candidature approuvée</title></head>
<body style="font-family:sans-serif;background:#f9fafb;margin:0;padding:20px">
<div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.1)">
    <div style="background:#16a34a;padding:32px;text-align:center">
        <h1 style="color:#fff;margin:0;font-size:24px">AutoEcoles.ma</h1>
    </div>
    <div style="padding:32px">
        <h2 style="color:#111827;margin-top:0">Félicitations, {{ $application->owner_name }} !</h2>
        <p style="color:#374151">
            Votre auto-école <strong>{{ $school->name }}</strong> a été approuvée et est désormais visible sur
            AutoEcoles.ma.
        </p>

        @if ($newAccountCreated)
            <p style="color:#374151">
                Un compte propriétaire a été créé pour vous avec l'adresse <strong>{{ $application->email }}</strong>.
                Un email séparé vient de vous être envoyé pour définir votre mot de passe et accéder à votre espace
                de gestion.
            </p>
        @else
            <p style="color:#374151">
                Votre auto-école est désormais rattachée à votre compte existant. Connectez-vous pour gérer votre
                fiche, vos services et vos réservations.
            </p>
        @endif

        <div style="text-align:center;margin:32px 0">
            <a href="{{ route('school.detail', $school->slug) }}"
               style="background:#ea580c;color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;display:inline-block">
                Voir ma fiche publique
            </a>
        </div>

        <p style="color:#6b7280;font-size:14px">
            Besoin d'aide ? Notre équipe support reste disponible à tout moment.
        </p>
    </div>
</div>
</body>
</html>
