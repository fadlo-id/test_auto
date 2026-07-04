<?php

namespace App\Http\Middleware;

use App\Services\VisitorFingerprintService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class VisitorCookieMiddleware
{
    public function __construct(private VisitorFingerprintService $fingerprint) {}

    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);
        return $this->fingerprint->attachCookie($request, $response);
    }
}
