<?php

namespace App\Http\Middleware;

use App\Models\SiteSetting;
use Closure;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

class MaintenanceMode
{
    public function handle(Request $request, Closure $next): Response
    {
        if (SiteSetting::get('maintenance_mode') !== '1') {
            return $next($request);
        }

        $user = $request->user();

        // Admins and super admins pass through
        if ($user && $user->isAdmin()) {
            return $next($request);
        }

        // Always allow access to login/logout so admins can sign in
        if ($request->routeIs('login', 'logout', 'password.*', 'admin.*')) {
            return $next($request);
        }

        // Return Inertia maintenance page with 503
        return Inertia::render('StaticPages/Maintenance')
            ->toResponse($request)
            ->setStatusCode(503);
    }
}
