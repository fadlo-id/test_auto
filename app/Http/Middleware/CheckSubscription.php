<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckSubscription
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = auth()->user();
        
        if (!$user || !$user->isSchoolOwner()) {
            return $next($request);
        }

        $autoSchool = $user->autoSchool;
        
        if ($autoSchool && $autoSchool->subscription) {
            if ($autoSchool->subscription->isExpired()) {
                return redirect()->route('school.subscription')
                    ->with('warning', 'Votre abonnement a expiré. Veuillez le renouveler.');
            }
        }

        return $next($request);
    }
}