<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><title>Mot de passe réinitialisé</title></head>
<body style="font-family:sans-serif;background:#f9fafb;margin:0;padding:20px">
<div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.1)">
    <div style="background:#ea580c;padding:32px;text-align:center">
        <h1 style="color:#fff;margin:0;font-size:24px">AutoEcoles.ma</h1>
    </div>
    <div style="padding:32px">
        <h2 style="color:#111827;margin-top:0">Votre mot de passe a été réinitialisé</h2>
        <p style="color:#374151">Bonjour {{ $user->name }},</p>
        <p style="color:#374151">
            Un administrateur a réinitialisé le mot de passe de votre compte. Voici votre nouveau mot de passe temporaire :
        </p>
        <div style="text-align:center;margin:32px 0">
            <span style="background:#f3f4f6;color:#111827;padding:12px 28px;border-radius:8px;font-weight:600;display:inline-block;font-family:monospace;font-size:18px">
                {{ $newPassword }}
            </span>
        </div>
        <p style="color:#374151">
            Merci de vous connecter et de changer ce mot de passe dès que possible depuis votre profil.
        </p>
        <p style="color:#6b7280;font-size:14px">
            Si vous n'êtes pas à l'origine de cette action, contactez immédiatement un administrateur.
        </p>
    </div>
    <div style="background:#f3f4f6;padding:16px;text-align:center">
        <p style="color:#9ca3af;font-size:12px;margin:0">© {{ date('Y') }} AutoEcoles.ma — Tous droits reserves.</p>
    </div>
</div>
</body>
</html>
