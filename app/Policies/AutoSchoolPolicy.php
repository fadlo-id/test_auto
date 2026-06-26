<?php

namespace App\Policies;

use App\Models\AutoSchool;
use App\Models\User;

class AutoSchoolPolicy
{
    public function viewAny(?User $user): bool
    {
        return true;
    }

    public function view(?User $user, AutoSchool $school): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return $user->isSchoolOwner() && $user->autoSchool === null;
    }

    public function update(User $user, AutoSchool $school): bool
    {
        return $user->isAdmin() || $user->id === $school->user_id;
    }

    public function delete(User $user, AutoSchool $school): bool
    {
        return $user->isAdmin() || $user->id === $school->user_id;
    }

    public function approve(User $user): bool
    {
        return $user->isAdmin();
    }

    public function reject(User $user): bool
    {
        return $user->isAdmin();
    }

    public function feature(User $user): bool
    {
        return $user->isAdmin();
    }
}
