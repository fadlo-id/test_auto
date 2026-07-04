<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><title>{{ $subject }}</title></head>
<body style="font-family:sans-serif;background:#f9fafb;margin:0;padding:20px">
<div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.1)">
    <div style="background:#ea580c;padding:32px;text-align:center">
        <h1 style="color:#fff;margin:0;font-size:24px">AutoEcoles.ma</h1>
    </div>
    <div style="padding:32px;color:#374151;white-space:pre-line;line-height:1.6">{{ $body }}</div>
    <div style="background:#f3f4f6;padding:16px;text-align:center">
        <p style="color:#9ca3af;font-size:12px;margin:0 0 6px">© {{ date('Y') }} AutoEcoles.ma — Tous droits reserves.</p>
        <p style="color:#9ca3af;font-size:12px;margin:0">
            <a href="{{ route('newsletter.unsubscribe.public', $subscriber->token) }}" style="color:#9ca3af;text-decoration:underline">Se desabonner</a>
        </p>
    </div>
</div>
</body>
</html>
