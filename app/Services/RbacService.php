<?php

namespace App\Services;

use App\Models\AuditLog;
use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Support\Facades\DB;

/**
 * Central place for role/permission mutations used by the admin panel's
 * RBAC screens (Admin Management + Permission Matrix). Keeping this logic
 * out of the controllers makes it independently testable and reusable.
 */
class RbacService
{
    /** Assign a hierarchy tier (role_id) to a user. Never touches the coarse `role` string. */
    public function assignRole(User $user, Role $role, ?User $actor = null): User
    {
        $old = $user->roleModel?->name;

        $user->update(['role_id' => $role->id]);

        AuditLog::record('rbac.role_assigned', $user, [
            'old_role' => $old,
            'new_role' => $role->name,
        ], $actor?->id);

        return $user->fresh();
    }

    /** Replace the full permission set for a role (Permission Matrix "save" action). */
    public function updateRolePermissions(Role $role, array $permissionKeys, ?User $actor = null): Role
    {
        $old = $role->permissionKeys();

        $ids = Permission::whereIn('key', $permissionKeys)->pluck('id')->toArray();
        $role->permissions()->sync($ids);

        AuditLog::record('rbac.role_permissions_updated', $role, [
            'old' => $old,
            'new' => $permissionKeys,
        ], $actor?->id);

        return $role->fresh('permissions');
    }

    public function createRole(array $data, ?User $actor = null): Role
    {
        $role = Role::create([
            'name'        => $data['name'],
            'label'       => $data['label'],
            'description' => $data['description'] ?? null,
            'color'       => $data['color'] ?? 'gray',
            'is_system'   => false,
            'sort_order'  => $data['sort_order'] ?? (Role::max('sort_order') + 1),
            'level'       => $data['level'] ?? null,
        ]);

        AuditLog::record('rbac.role_created', $role, ['name' => $role->name], $actor?->id);

        return $role;
    }

    public function deleteRole(Role $role, ?User $actor = null): void
    {
        AuditLog::record('rbac.role_deleted', $role, ['name' => $role->name], $actor?->id);
        $role->delete();
    }

    /** Create a brand-new permission key — this is what makes the catalog dynamic. */
    public function createPermission(array $data, ?User $actor = null): Permission
    {
        $permission = Permission::create([
            'key'         => $data['key'],
            'label'       => $data['label'],
            'group'       => $data['group'],
            'description' => $data['description'] ?? null,
            'sort_order'  => $data['sort_order'] ?? (Permission::max('sort_order') + 1),
        ]);

        AuditLog::record('rbac.permission_created', $permission, ['key' => $permission->key], $actor?->id);

        return $permission;
    }

    public function updatePermission(Permission $permission, array $data, ?User $actor = null): Permission
    {
        $old = $permission->only(['label', 'group', 'description']);

        $permission->update([
            'label'       => $data['label'] ?? $permission->label,
            'group'       => $data['group'] ?? $permission->group,
            'description' => $data['description'] ?? $permission->description,
        ]);

        AuditLog::record('rbac.permission_updated', $permission, [
            'old' => $old,
            'new' => $permission->only(['label', 'group', 'description']),
        ], $actor?->id);

        return $permission;
    }

    public function deletePermission(Permission $permission, ?User $actor = null): void
    {
        AuditLog::record('rbac.permission_deleted', $permission, ['key' => $permission->key], $actor?->id);
        DB::table('role_permission')->where('permission_id', $permission->id)->delete();
        $permission->delete();
    }

    public function suspendAdmin(User $admin, ?User $actor = null): User
    {
        $admin->update(['is_active' => false]);
        AuditLog::record('admin.suspended', $admin, [], $actor?->id);
        return $admin->fresh();
    }
}
