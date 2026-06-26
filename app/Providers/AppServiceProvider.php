<?php

namespace App\Providers;

use App\Models\AutoSchool;
use App\Models\Payment;
use App\Models\Review;
use App\Models\Subscription;
use App\Models\User;
use App\Observers\UserObserver;
use App\Policies\AutoSchoolPolicy;
use App\Policies\PaymentPolicy;
use App\Policies\ReviewPolicy;
use App\Policies\SubscriptionPolicy;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    protected array $policies = [
        AutoSchool::class   => AutoSchoolPolicy::class,
        Review::class       => ReviewPolicy::class,
        Payment::class      => PaymentPolicy::class,
        Subscription::class => SubscriptionPolicy::class,
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
    }
}
