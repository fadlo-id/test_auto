<?php

namespace App\Policies;

use App\Models\User;

class AdminPolicy
{
    /** Who can see the admin list. */
    public function viewAny(User $user): bool
    {
        return $user->isSuperAdmin();
    }

    /** Who can create a new admin. */
    public function create(User $user): bool
    {
        return $user->isSuperAdmin();
    }

    /** Who can update an admin's profile/role.
     * A super_admin cannot edit themselves through this interface (use /profile). */
    public function update(User $user, User $target): bool
    {
        return $user->isSuperAdmin() && $user->id !== $target->id;
    }

    /** Who can delete an admin.
     * Super admins are protected — they can only be removed via direct DB access. */
    public function delete(User $user, User $target): bool
    {
        return $user->isSuperAdmin()
            && $user->id !== $target->id
            && ! $target->isSuperAdmin();
    }

    /** Who can suspend / reactivate an admin.
     * Cannot suspend yourself. */
    public function toggleStatus(User $user, User $target): bool
    {
        return $user->isSuperAdmin() && $user->id !== $target->id;
    }

    /** Who can reset another admin's password. */
    public function resetPassword(User $user, User $target): bool
    {
        return $user->isSuperAdmin() && $user->id !== $target->id;
    }

    /** Who can sync (replace) an admin's permission list.
     * Super admins don't have individual permissions — they bypass. */
    public function syncPermissions(User $user, User $target): bool
    {
        return $user->isSuperAdmin() && ! $target->isSuperAdmin();
    }

    /** Who can view the platform audit log. */
    public function viewAuditLogs(User $user): bool
    {
        return $user->isSuperAdmin();
    }
}
