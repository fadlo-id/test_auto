<?php

namespace App\Http\Middleware;

use App\Models\Permission;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): string|null
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        $user = $request->user();

        // Track last_login_at once per session after authentication
        if ($user && ! $request->session()->has('_ll')) {
            $user->updateQuietly(['last_login_at' => now()]);
            $request->session()->put('_ll', true);
        }

        $isSuperAdmin = false;
        $permissions  = [];

        if ($user?->isAdmin()) {
            $isSuperAdmin = $user->isSuperAdmin();
            $permissions  = $user->getUserPermissions();
        }

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user ? [
                    'id'            => $user->id,
                    'name'          => $user->name,
                    'email'         => $user->email,
                    'phone'         => $user->phone,
                    'role'          => $user->role,
                    'is_active'     => $user->is_active,
                    'is_super_admin' => $isSuperAdmin,
                    'permissions'   => $permissions,
                    'avatar'        => $user->avatar,
                    'email_verified' => $user->hasVerifiedEmail(),
                ] : null,
                'can' => $user ? [
                    'admin'        => $user->isAdmin(),
                    'super_admin'  => $isSuperAdmin,
                    'school_owner' => $user->isSchoolOwner(),
                ] : [],
            ],
            'verificationBannerDismissed' => (bool) $request->session()->get('verification_banner_dismissed', false),
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error'   => fn () => $request->session()->get('error'),
                'warning' => fn () => $request->session()->get('warning'),
            ],
            'permissions_map' => $user?->isAdmin()
                ? Permission::allCached()->mapWithKeys(
                    fn ($p) => [$p->key => ['label' => $p->label, 'group' => $p->group]]
                )
                : [],
        ];
    }
}
