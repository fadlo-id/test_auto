<?php

namespace App\Services;

use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

class VisitorFingerprintService
{
    const COOKIE_NAME = '_vid';
    const COOKIE_TTL  = 525600; // 1 year in minutes

    /**
     * Get or generate the persistent visitor ID from the request cookie.
     * Returns null if the cookie has not been set yet (first request).
     */
    public function getVisitorId(Request $request): ?string
    {
        return $request->cookie(self::COOKIE_NAME);
    }

    /** Header a client sends its computed browser fingerprint on (canvas + navigator hash). */
    const FINGERPRINT_HEADER = 'X-Visitor-Fp';

    /**
     * Build a stable fingerprint for the current request, layering every
     * available signal:
     *
     *  1. Logged-in user_id     — most stable, cross-device
     *  2. Persistent cookie     — stable within same browser
     *  3. Session ID            — fallback for cookie-less browsers
     *  4. IP address            — prevents trivial cookie-clearing spoofing
     *  5. Browser fingerprint   — genuine client-computed canvas/navigator
     *                             hash (see resources/js/utils/fingerprint.js),
     *                             sent via the X-Visitor-Fp header on
     *                             JS-triggered requests (click tracking).
     *                             Falls back to User-Agent + Accept-Language
     *                             when unavailable — e.g. the server-rendered
     *                             page-view path runs before any client JS
     *                             executes, so it can't carry a client hash.
     *
     * The date is NOT included so the same hash deduplicates all day.
     */
    public function fingerprint(Request $request, ?int $userId = null, ?string $clientFingerprint = null): string
    {
        $ip = $request->ip() ?? '0.0.0.0';

        if ($userId) {
            return hash('sha256', "user:{$userId}|{$ip}");
        }

        $cookieId  = $request->cookie(self::COOKIE_NAME) ?? '';
        $sessionId = ($request->hasSession() ? $request->session()->getId() : '') ?? '';
        $primary   = $cookieId ?: $sessionId;

        $clientFingerprint ??= $request->header(self::FINGERPRINT_HEADER);
        $browserSignal = $clientFingerprint
            ? substr($clientFingerprint, 0, 64)
            : substr($request->userAgent() ?? '', 0, 200) . '|' . substr($request->header('Accept-Language', ''), 0, 50);

        return hash('sha256', "{$primary}|{$ip}|{$browserSignal}");
    }

    /**
     * Attach the persistent visitor cookie to the response.
     * Should be called by VisitorCookieMiddleware.
     */
    public function attachCookie(Request $request, Response $response): Response
    {
        if ($request->cookie(self::COOKIE_NAME)) {
            return $response; // already set
        }

        $vid = (string) Str::uuid();

        $response->headers->setCookie(
            new \Symfony\Component\HttpFoundation\Cookie(
                self::COOKIE_NAME,
                $vid,
                time() + (self::COOKIE_TTL * 60),
                '/',
                null,
                false, // secure: false in dev, set to true in prod via HTTPS
                true,  // httpOnly
                false,
                'Lax'
            )
        );

        return $response;
    }
}
