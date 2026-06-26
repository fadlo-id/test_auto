<?php

namespace App\Observers;

use App\Models\User;

class UserObserver
{
    public function creating(User $user): void
    {
        if (empty($user->role)) {
            $user->role = User::ROLE_USER;
        }
    }
}
