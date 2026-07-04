<?php

namespace App\Policies;

use App\Models\Role;
use App\Models\User;

class RolePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->isSuperAdmin();
    }

    public function view(User $user, Role $role): bool
    {
        return $user->isSuperAdmin();
    }

    public function create(User $user): bool
    {
        return $user->isSuperAdmin();
    }

    public function update(User $user, Role $role): bool
    {
        return $user->isSuperAdmin();
    }

    /** System roles (the 7-level hierarchy) can never be deleted, only custom roles. */
    public function delete(User $user, Role $role): bool
    {
        return $user->isSuperAdmin() && ! $role->is_system;
    }

    /** Who can edit which permissions are attached to a role. */
    public function managePermissions(User $user, Role $role): bool
    {
        return $user->isSuperAdmin();
    }
}
