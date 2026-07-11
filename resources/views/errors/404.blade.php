<!DOCTYPE html>
<html lang="fr" class="h-full">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Page introuvable — AutoEcoles.ma</title>
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
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15.182 16.318A4.486 4.486 0 0 0 12.016 15a4.486 4.486 0 0 0-3.198 1.318M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Z" />
                    </svg>
                </span>

                <p class="text-sm font-bold tracking-widest text-orange-600 dark:text-orange-400 uppercase mb-1">Erreur 404</p>
                <h1 class="text-2xl font-extrabold text-gray-900 dark:text-zinc-50 tracking-tight mb-2">Page introuvable</h1>
                <p class="text-sm text-gray-500 dark:text-zinc-400 leading-relaxed mb-8">
                    La page que vous cherchez n'existe pas, a été déplacée ou renommée.
                </p>

                <div class="flex flex-col sm:flex-row gap-3">
                    <a href="{{ url('/search') }}" class="btn-primary flex-1">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.7" stroke="currentColor" class="w-4 h-4">
                            <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                        </svg>
                        Rechercher une auto-école
                    </a>
                    <a href="/" class="btn-secondary flex-1">Retour à l'accueil</a>
                </div>
            </div>
        </div>
    </div>
</body>
</html>
