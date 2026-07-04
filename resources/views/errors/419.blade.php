<!DOCTYPE html>
<html lang="fr" class="h-full">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Session expirée — AutoEcoles.ma</title>
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
                        <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                    </svg>
                </span>

                <p class="text-sm font-bold tracking-widest text-orange-600 dark:text-orange-400 uppercase mb-1">Erreur 419</p>
                <h1 class="text-2xl font-extrabold text-gray-900 dark:text-zinc-50 tracking-tight mb-2">Session expirée</h1>
                <p class="text-sm text-gray-500 dark:text-zinc-400 leading-relaxed mb-8">
                    Votre session a expiré, généralement après une longue période d'inactivité. Veuillez recharger la page et réessayer.
                </p>

                <button onclick="window.location.reload()" class="btn-primary w-full">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.7" stroke="currentColor" class="w-4 h-4">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                    </svg>
                    Recharger la page
                </button>
            </div>
        </div>
    </div>
</body>
</html>
