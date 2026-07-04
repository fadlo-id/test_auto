<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" dir="ltr">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        <!-- Apply saved theme before first paint to avoid a light/dark flash -->
        <script>
            (function () {
                var stored = localStorage.getItem('theme');
                var dark = stored ? stored === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
                document.documentElement.classList.toggle('dark', dark);
            })();
        </script>

        @php
            $seo       = $page['props']['seo'] ?? [];
            $seoTitle  = $seo['title']       ?? config('app.name', 'AutoEcoles Maroc');
            $seoDesc   = $seo['description'] ?? 'Trouvez la meilleure auto-école au Maroc. Comparez les auto-écoles, lisez les avis vérifiés et inscrivez-vous facilement sur AutoEcoles.ma';
            $canonical = $seo['canonical']   ?? url()->current();
            $noindex   = !empty($seo['noindex']);
            $og        = $seo['og']      ?? [];
            $tw        = $seo['twitter'] ?? [];
            $jsonLd    = $seo['json_ld'] ?? [];
            $ogImage   = $og['image']    ?? asset('images/og-default.png');
            $twImage   = $tw['image']    ?? asset('images/og-default.png');
        @endphp

        <title inertia>{{ $seoTitle }}</title>

        <!-- SEO -->
        <meta name="description" content="{{ $seoDesc }}">
        <meta name="keywords" content="auto-école Maroc, permis de conduire, auto-école Casablanca, auto-école Rabat, inscription auto-école">
        <meta name="robots" content="{{ $noindex ? 'noindex, nofollow' : 'index, follow' }}">
        <meta name="theme-color" content="#ea580c">
        <link rel="canonical" href="{{ $canonical }}">

        <!-- Open Graph -->
        <meta property="og:site_name" content="{{ $og['site_name'] ?? 'AutoEcoles.ma' }}">
        <meta property="og:type"      content="{{ $og['type']      ?? 'website' }}">
        <meta property="og:url"       content="{{ $og['url']       ?? $canonical }}">
        <meta property="og:title"     content="{{ $og['title']     ?? $seoTitle }}">
        <meta property="og:description" content="{{ $og['description'] ?? $seoDesc }}">
        <meta property="og:locale"    content="{{ $og['locale']    ?? 'fr_MA' }}">
        <meta property="og:image"     content="{{ $ogImage }}">
        <meta property="og:image:width"  content="1200">
        <meta property="og:image:height" content="630">
        <meta property="og:image:alt"    content="{{ $og['title'] ?? $seoTitle }}">

        <!-- Twitter Card -->
        <meta name="twitter:card"        content="{{ $tw['card']        ?? 'summary_large_image' }}">
        <meta name="twitter:site"        content="{{ $tw['site']        ?? '@autoecoles_ma' }}">
        <meta name="twitter:title"       content="{{ $tw['title']       ?? $seoTitle }}">
        <meta name="twitter:description" content="{{ $tw['description'] ?? $seoDesc }}">
        <meta name="twitter:image"       content="{{ $twImage }}">

        <!-- JSON-LD structured data (server-side, crawlable by all bots) -->
        @foreach ($jsonLd as $schema)
            <script type="application/ld+json">{!! json_encode($schema, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT) !!}</script>
        @endforeach

        <!-- Favicon -->
        <link rel="icon" type="image/x-icon" href="{{ asset('favicon.ico') }}">
        <link rel="apple-touch-icon" sizes="180x180" href="{{ asset('apple-touch-icon.png') }}">

        <!-- Performance hints -->
        <link rel="dns-prefetch" href="https://fonts.bunny.net">
        <link rel="preconnect" href="https://fonts.bunny.net" crossorigin>

        <!-- Fonts: Inter for body, Figtree for headings -->
        <link href="https://fonts.bunny.net/css?family=inter:400,500,600,700,800,900|figtree:400,500,600,700&display=swap" rel="stylesheet" />

        <!-- Google Analytics -->
        @php $gaId = \App\Models\SiteSetting::get('google_analytics', ''); @endphp
        @if ($gaId)
        <script async src="https://www.googletagmanager.com/gtag/js?id={{ $gaId }}"></script>
        <script>
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '{{ $gaId }}');
        </script>
        @endif

        <!-- Scripts -->
        @routes
        @viteReactRefresh
        @vite(['resources/js/app.jsx', "resources/js/Pages/{$page['component']}.jsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased bg-gray-50 text-gray-900 dark:bg-zinc-950 dark:text-zinc-100">
        @inertia
    </body>
</html>
