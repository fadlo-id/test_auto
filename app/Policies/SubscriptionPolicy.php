<?php

namespace App\Policies;

use App\Models\Subscription;
use App\Models\User;

class SubscriptionPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->isAdmin() || $user->isSchoolOwner();
    }

    public function view(User $user, Subscription $subscription): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        return $user->autoSchool?->id === $subscription->auto_school_id;
    }

    public function create(User $user): bool
    {
        return $user->isSchoolOwner() && $user->autoSchool !== null;
    }

    public function cancel(User $user, Subscription $subscription): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        return $user->autoSchool?->id === $subscription->auto_school_id;
    }
}
