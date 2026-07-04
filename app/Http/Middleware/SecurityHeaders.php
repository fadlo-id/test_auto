<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SecurityHeaders
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Standard security headers — identical in all environments
        $response->headers->set('X-Content-Type-Options', 'nosniff');
        $response->headers->set('X-Frame-Options', 'SAMEORIGIN');
        $response->headers->set('X-XSS-Protection', '1; mode=block');
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');
        $response->headers->set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(self)');
        $response->headers->set('X-Permitted-Cross-Domain-Policies', 'none');

        // CSP — environment-aware (dev adds Vite origins, prod stays strict)
        $response->headers->set('Content-Security-Policy', $this->buildCsp());

        // HSTS only when running under HTTPS in production
        if (app()->isProduction() && $request->isSecure()) {
            $response->headers->set(
                'Strict-Transport-Security',
                'max-age=31536000; includeSubDomains; preload'
            );
        }

        return $response;
    }

    // ── CSP builder ───────────────────────────────────────────────────────────

    private function buildCsp(): string
    {
        $isDev      = app()->environment('local');
        $vitePort   = $isDev ? $this->readVitePort() : null;

        $directives = [
            "default-src 'self'",
            "script-src "  . $this->scriptSrc($isDev, $vitePort),
            "style-src "   . $this->styleSrc($isDev, $vitePort),
            "font-src 'self' https://fonts.gstatic.com https://fonts.bunny.net data:",
            "img-src 'self' data: blob: https:",
            "connect-src " . $this->connectSrc($isDev, $vitePort),
            "frame-src https://js.stripe.com https://hooks.stripe.com",
            "worker-src 'self' blob:",
            "manifest-src 'self'",
            "media-src 'self'",
            "frame-ancestors 'self'",
            "object-src 'none'",
            "base-uri 'self'",
            "form-action 'self'",
        ];

        return implode('; ', $directives);
    }

    /**
     * script-src
     *
     * Dev additions when Vite is running (public/hot exists):
     *   http://127.0.0.1:{port}   – serves @vite/client and all JS modules
     *   http://localhost:{port}    – alias for the same server
     *   'unsafe-eval'             – required by @vitejs/plugin-react (Babel transform)
     *                               for React Fast Refresh (uses Function() constructor)
     *
     * Production: none of these extras.
     * Note: 'unsafe-inline' stays permanently because Inertia serialises the initial
     * page props into an inline <script> tag. This will be replaced by a per-request
     * nonce once Inertia v2 nonce support is available.
     */
    private function scriptSrc(bool $isDev, ?int $vitePort): string
    {
        $sources = [
            "'self'",
            "'unsafe-inline'",
            'https://js.stripe.com',
            'https://www.googletagmanager.com',
        ];

        if ($isDev && $vitePort) {
            $sources[] = "http://127.0.0.1:{$vitePort}";
            $sources[] = "http://localhost:{$vitePort}";
            $sources[] = "'unsafe-eval'";   // React Fast Refresh needs Function() in dev
        }

        return implode(' ', $sources);
    }

    /**
     * style-src
     *
     * Dev addition: Vite serves raw CSS files from its dev server.
     */
    private function styleSrc(bool $isDev, ?int $vitePort): string
    {
        $sources = [
            "'self'",
            "'unsafe-inline'",
            'https://fonts.googleapis.com',
            'https://fonts.bunny.net',
        ];

        if ($isDev && $vitePort) {
            $sources[] = "http://127.0.0.1:{$vitePort}";
            $sources[] = "http://localhost:{$vitePort}";
        }

        return implode(' ', $sources);
    }

    /**
     * connect-src
     *
     * Dev additions:
     *   http://127.0.0.1:{port}  – fetch requests back to Vite for module updates
     *   http://localhost:{port}  – same server, alternate name
     *   ws://127.0.0.1:{port}   – HMR WebSocket (hot reload)
     *   ws://localhost:{port}   – same WebSocket, alternate name
     */
    private function connectSrc(bool $isDev, ?int $vitePort): string
    {
        $sources = [
            "'self'",
            'https://api.stripe.com',
            'https://www.google-analytics.com',
        ];

        if ($isDev && $vitePort) {
            $sources[] = "http://127.0.0.1:{$vitePort}";
            $sources[] = "http://localhost:{$vitePort}";
            $sources[] = "ws://127.0.0.1:{$vitePort}";
            $sources[] = "ws://localhost:{$vitePort}";
        }

        return implode(' ', $sources);
    }

    // ── Vite port detection ───────────────────────────────────────────────────

    /**
     * Reads the port Vite is listening on from public/hot.
     *
     * Vite writes its full URL to public/hot when `npm run dev` starts.
     * With vite.config.js set to host '127.0.0.1', this file will contain:
     *   http://127.0.0.1:5174
     *
     * We extract only the port so the CSP always uses safe IPv4 hostnames
     * (127.0.0.1 and localhost) regardless of what host Vite chose to bind on.
     * This prevents any [::1] IPv6 address from leaking into the CSP, as browsers
     * reject IPv6 addresses as invalid CSP sources.
     *
     * Returns null when the hot file is absent (Vite not running, or production build).
     */
    private function readVitePort(): ?int
    {
        $hotFile = public_path('hot');

        if (! file_exists($hotFile)) {
            return null;
        }

        $raw = trim((string) file_get_contents($hotFile));

        if (! $raw) {
            return null;
        }

        $port = parse_url($raw, PHP_URL_PORT);

        return $port ? (int) $port : null;
    }
}
