<!DOCTYPE html>
<html lang="fr" class="h-full">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Trop de requêtes — AutoEcoles.ma</title>
    @vite(['resources/css/app.css'])
    <script>
        (function () {
            var stored = localStorage.getItem('theme');
            var dark = stored ? stored === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
            document.documentElement.classList.toggle('dark', dark);
        })();
    </script>
</head>
<body class="h-full font-sans antialiased bg-gray-50 dark:bg-zinc-950">
    <div class="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
        <div class="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-orange-100/60 dark:bg-orange-500/10 blur-3xl pointer-events-none"></div>
        <div class="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-orange-50 dark:bg-orange-500/5 blur-3xl pointer-events-none"></div>

        <div class="relative w-full max-w-md">
            <div class="card p-8 sm:p-10 text-center">
                <span class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                </span>

                <p class="text-sm font-bold tracking-widest text-orange-600 dark:text-orange-400 uppercase mb-1">Erreur 429</p>
                <h1 class="text-2xl font-extrabold text-gray-900 dark:text-zinc-50 tracking-tight mb-2">Trop de requêtes</h1>
                <p class="text-sm text-gray-500 dark:text-zinc-400 leading-relaxed mb-8">
                    Vous avez effectué trop de requêtes en peu de temps. Veuillez patienter quelques instants avant de réessayer.
                </p>

                <a href="/" class="btn-primary w-full">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.7" stroke="currentColor" class="w-4 h-4">
                        <path stroke-linecap="round" stroke-linejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                    </svg>
                    Retour à l'accueil
                </a>
            </div>
        </div>
    </div>
</body>
</html>
