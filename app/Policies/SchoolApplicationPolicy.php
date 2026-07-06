<?php

namespace App\Policies;

use App\Models\SchoolApplication;
use App\Models\User;

class SchoolApplicationPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->isSuperAdmin() || $user->hasPermission('manage_schools');
    }

    public function view(User $user, SchoolApplication $application): bool
    {
        return $user->isSuperAdmin() || $user->hasPermission('manage_schools');
    }

    public function approve(User $user, SchoolApplication $application): bool
    {
        return $user->isSuperAdmin() || $user->hasPermission('manage_schools');
    }

    public function reject(User $user, SchoolApplication $application): bool
    {
        return $user->isSuperAdmin() || $user->hasPermission('manage_schools');
    }

    public function delete(User $user, SchoolApplication $application): bool
    {
        return $user->isSuperAdmin() || $user->hasPermission('manage_schools');
    }
}
