<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><title>Auto-ecole approuvee</title></head>
<body style="font-family:sans-serif;background:#f9fafb;margin:0;padding:20px">
<div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.1)">
    <div style="background:#ea580c;padding:32px;text-align:center">
        <h1 style="color:#fff;margin:0;font-size:24px">AutoEcoles.ma</h1>
    </div>
    <div style="padding:32px">
        <h2 style="color:#111827;margin-top:0">Felicitations ! Votre auto-ecole est approuvee ✓</h2>
        <p style="color:#374151">Bonjour,</p>
        <p style="color:#374151">
            Votre auto-ecole <strong>{{ $school->name }}</strong> a ete approuvee et est maintenant
            visible sur notre plateforme AutoEcoles.ma.
        </p>
        <p style="color:#374151">Les candidats peuvent desormais trouver votre ecole, lire vos services et vous contacter.</p>
        <div style="text-align:center;margin:32px 0">
            <a href="{{ url('/auto-ecole/' . $school->slug) }}"
               style="background:#ea580c;color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;display:inline-block">
                Voir ma fiche
            </a>
        </div>
        <p style="color:#6b7280;font-size:14px">
            Pour augmenter votre visibilite, pensez a completer votre profil et a choisir un plan premium.
        </p>
    </div>
    <div style="background:#f3f4f6;padding:16px;text-align:center">
        <p style="color:#9ca3af;font-size:12px;margin:0">© {{ date('Y') }} AutoEcoles.ma — Tous droits reserves.</p>
    </div>
</div>
</body>
</html>
