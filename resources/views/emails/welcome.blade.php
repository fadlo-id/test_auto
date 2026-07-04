<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><title>Bienvenue</title></head>
<body style="font-family:sans-serif;background:#f9fafb;margin:0;padding:20px">
<div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.1)">
    <div style="background:#ea580c;padding:32px;text-align:center">
        <h1 style="color:#fff;margin:0;font-size:24px">AutoEcoles.ma</h1>
    </div>
    <div style="padding:32px">
        <h2 style="color:#111827;margin-top:0">Bienvenue, {{ $user->name }} !</h2>
        <p style="color:#374151">
            Votre compte a bien ete cree sur AutoEcoles.ma, la reference des auto-ecoles au Maroc.
        </p>

        @if ($user->isSchoolOwner())
            <p style="color:#374151">
                Prochaine etape : creez la fiche de votre auto-ecole pour qu'elle soit visible par les candidats.
            </p>
            <div style="text-align:center;margin:32px 0">
                <a href="{{ route('school.settings') }}"
                   style="background:#ea580c;color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;display:inline-block">
                    Creer ma fiche auto-ecole
                </a>
            </div>
        @else
            <p style="color:#374151">
                Vous pouvez des maintenant comparer les auto-ecoles, lire les avis verifies et trouver celle qui vous convient.
            </p>
            <div style="text-align:center;margin:32px 0">
                <a href="{{ route('search') }}"
                   style="background:#ea580c;color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;display:inline-block">
                    Trouver une auto-ecole
                </a>
            </div>
        @endif

        <p style="color:#6b7280;font-size:14px">
            Besoin d'aide ? Notre equipe support reste disponible a tout moment.
        </p>
    </div>
    <div style="background:#f3f4f6;padding:16px;text-align:center">
        <p style="color:#9ca3af;font-size:12px;margin:0">© {{ date('Y') }} AutoEcoles.ma — Tous droits reserves.</p>
    </div>
</div>
</body>
</html>
