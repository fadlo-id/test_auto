<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><title>Demande refusee</title></head>
<body style="font-family:sans-serif;background:#f9fafb;margin:0;padding:20px">
<div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.1)">
    <div style="background:#ea580c;padding:32px;text-align:center">
        <h1 style="color:#fff;margin:0;font-size:24px">AutoEcoles.ma</h1>
    </div>
    <div style="padding:32px">
        <h2 style="color:#111827;margin-top:0">Votre demande n'a pas ete acceptee</h2>
        <p style="color:#374151">Bonjour,</p>
        <p style="color:#374151">
            Apres examen, votre demande d'inscription pour <strong>{{ $school->name }}</strong>
            n'a pas pu etre approuvee pour la raison suivante :
        </p>
        <div style="background:#fef2f2;border-left:4px solid #ef4444;padding:16px;border-radius:0 8px 8px 0;margin:20px 0">
            <p style="color:#dc2626;margin:0;font-weight:500">{{ $reason }}</p>
        </div>
        <p style="color:#374151">
            Vous pouvez corriger les problemes mentionnes et soumettre a nouveau votre demande depuis
            votre espace proprietaire.
        </p>
        <div style="text-align:center;margin:32px 0">
            <a href="{{ url('/school/settings') }}"
               style="background:#ea580c;color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;display:inline-block">
                Modifier mon profil
            </a>
        </div>
    </div>
    <div style="background:#f3f4f6;padding:16px;text-align:center">
        <p style="color:#9ca3af;font-size:12px;margin:0">© {{ date('Y') }} AutoEcoles.ma</p>
    </div>
</div>
</body>
</html>
