<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><title>Compte lié à Google</title></head>
<body style="font-family:sans-serif;background:#f9fafb;margin:0;padding:20px">
<div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.1)">
    <div style="background:#ea580c;padding:32px;text-align:center">
        <h1 style="color:#fff;margin:0;font-size:24px">AutoEcoles.ma</h1>
    </div>
    <div style="padding:32px">
        <h2 style="color:#111827;margin-top:0">Bonjour {{ $user->name }},</h2>
        <p style="color:#374151">
            Votre compte AutoEcoles.ma ({{ $user->email }}) vient d'être connecté à une connexion Google utilisant
            la même adresse email.
        </p>
        <p style="color:#374151">
            Si c'est bien vous, aucune action n'est requise. Si vous n'êtes pas à l'origine de cette action,
            contactez-nous immédiatement afin de sécuriser votre compte.
        </p>
    </div>
    <div style="background:#f3f4f6;padding:16px;text-align:center">
        <p style="color:#9ca3af;font-size:12px;margin:0">© {{ date('Y') }} AutoEcoles.ma — Tous droits reservés.</p>
    </div>
</div>
</body>
</html>
