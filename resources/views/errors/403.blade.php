<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Accès refusé — AutoEcoles.ma</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: ui-sans-serif, system-ui, sans-serif; background: #f9fafb; color: #111827; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 1rem; }
        .card { background: white; border-radius: 1rem; border: 1px solid #e5e7eb; padding: 3rem 2rem; text-align: center; max-width: 480px; width: 100%; box-shadow: 0 1px 3px rgba(0,0,0,.07); }
        .emoji { font-size: 4rem; margin-bottom: 1rem; }
        h1 { font-size: 5rem; font-weight: 800; color: #f59e0b; line-height: 1; margin-bottom: .5rem; }
        h2 { font-size: 1.25rem; font-weight: 600; margin-bottom: .75rem; }
        p { color: #6b7280; margin-bottom: 2rem; }
        a { display: inline-block; background: #ea580c; color: white; padding: .75rem 1.5rem; border-radius: .75rem; text-decoration: none; font-weight: 500; }
        a:hover { background: #c2410c; }
    </style>
</head>
<body>
    <div class="card">
        <div class="emoji">🔒</div>
        <h1>403</h1>
        <h2>Accès non autorisé</h2>
        <p>{{ $exception->getMessage() ?: 'Vous n\'avez pas la permission d\'accéder à cette page.' }}</p>
        <a href="/">Retour à l'accueil</a>
    </div>
</body>
</html>
