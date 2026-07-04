<!DOCTYPE html>
<html lang="fr" class="h-full">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Erreur serveur — AutoEcoles.ma</title>
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
        <div class="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-red-100/50 dark:bg-red-500/10 blur-3xl pointer-events-none"></div>
        <div class="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-orange-50 dark:bg-orange-500/5 blur-3xl pointer-events-none"></div>

        <div class="relative w-full max-w-md">
            <div class="card p-8 sm:p-10 text-center">
                <span class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 17.25v-.228a4.5 4.5 0 0 0-.12-1.03l-2.268-9.64a3.375 3.375 0 0 0-3.285-2.602H7.923a3.375 3.375 0 0 0-3.285 2.602l-2.268 9.64a4.5 4.5 0 0 0-.12 1.03v.228m19.5 0a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3m19.5 0a3 3 0 0 0-3-3H5.25a3 3 0 0 0-3 3m16.5 0h.008v.008h-.008v-.008Zm-3 0h.008v.008h-.008v-.008Z" />
                    </svg>
                </span>

                <p class="text-sm font-bold tracking-widest text-red-600 dark:text-red-400 uppercase mb-1">Erreur 500</p>
                <h1 class="text-2xl font-extrabold text-gray-900 dark:text-zinc-50 tracking-tight mb-2">Erreur serveur</h1>
                <p class="text-sm text-gray-500 dark:text-zinc-400 leading-relaxed mb-8">
                    Une erreur inattendue s'est produite. Notre équipe a été notifiée. Veuillez réessayer dans quelques instants.
                </p>

                <div class="flex flex-col sm:flex-row gap-3">
                    <a href="/" class="btn-primary flex-1">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.7" stroke="currentColor" class="w-4 h-4">
                            <path stroke-linecap="round" stroke-linejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                        </svg>
                        Retour à l'accueil
                    </a>
                    <a href="{{ url('/contact') }}" class="btn-secondary flex-1">Contacter le support</a>
                </div>
            </div>
        </div>
    </div>
</body>
</html>
