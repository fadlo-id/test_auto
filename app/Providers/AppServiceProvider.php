<?php

namespace App\Providers;

use App\Models\AutoSchool;
use App\Models\Payment;
use App\Models\Permission as PermissionModel;
use App\Models\Review;
use App\Models\Role;
use App\Models\Subscription;
use App\Models\User;
use App\Observers\UserObserver;
use App\Policies\AdminPolicy;
use App\Policies\AutoSchoolPolicy;
use App\Policies\PaymentPolicy;
use App\Policies\PermissionPolicy;
use App\Policies\ReviewPolicy;
use App\Policies\RolePolicy;
use App\Policies\SubscriptionPolicy;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    protected array $policies = [
        AutoSchool::class     => AutoSchoolPolicy::class,
        Review::class         => ReviewPolicy::class,
        Payment::class        => PaymentPolicy::class,
        Subscription::class   => SubscriptionPolicy::class,
        User::class           => AdminPolicy::class,
        Role::class           => RolePolicy::class,
        PermissionModel::class => PermissionPolicy::class,
    ];

    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        User::observe(UserObserver::class);

        $this->registerPolicies();
        $this->registerGates();
    }

    private function registerPolicies(): void
    {
        foreach ($this->policies as $model => $policy) {
            Gate::policy($model, $policy);
        }
    }

    private function registerGates(): void
    {
        Gate::define('admin', fn(User $user) => $user->isAdmin());
        Gate::define('school-owner', fn(User $user) => $user->isSchoolOwner());
        Gate::define('manage-school', function (User $user, AutoSchool $school) {
            return $user->isAdmin() || $user->id === $school->user_id;
        });

        $this->registerDynamicPermissionGates();
    }

    /**
     * Every row in the `permissions` table becomes a real Laravel Gate at boot
     * time — e.g. a `manage_crm` row registers `Gate::define('manage_crm', ...)`.
     * This is what "never hardcode permissions" means in practice: adding a
     * permission from the Permission Matrix page makes `$user->can('key')` and
     * `->middleware('can:key')` work immediately, with no code deploy.
     *
     * Guarded so a fresh install (before `migrate`) or a test with an empty
     * `permissions` table never crashes on boot.
     */
    private function registerDynamicPermissionGates(): void
    {
        try {
            if (! Schema::hasTable('permissions')) return;

            $keys = Cache::remember('gate_permission_keys', 600, fn () =>
                PermissionModel::query()->pluck('key')->all()
            );

            foreach ($keys as $key) {
                Gate::define($key, fn (User $user) => $user->hasPermission($key));
            }
        } catch (\Throwable) {
            // Never let Gate bootstrapping break the app (e.g. DB not reachable yet).
        }
    }
}
