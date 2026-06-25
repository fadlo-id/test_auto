<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SchoolOwnerMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        if (!auth()->check()) {
            return redirect()->route('login');
        }

        if (!auth()->user()->isSchoolOwner()) {
            abort(403, 'Accès non autorisé. Réservé aux propriétaires d\'auto-écoles.');
        }

        if (!auth()->user()->is_active) {
            auth()->logout();
            return redirect()->route('login')
                ->with('error', 'Votre compte a été désactivé.');
        }

        return $next($request);
    }
}