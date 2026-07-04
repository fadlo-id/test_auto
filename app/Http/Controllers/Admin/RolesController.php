<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use App\Services\RbacService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class RolesController extends Controller
{
    public function __construct(private RbacService $rbac) {}

    public function index(): Response
    {
        $this->authorize('viewAny', Role::class);

        // One grouped query instead of a per-role COUNT (userCount()) in the map below.
        $roleCounts = User::select('role_id', 'role', DB::raw('COUNT(*) as cnt'))
            ->groupBy('role_id', 'role')
            ->get();

        $roles = Role::with('permissions:id,key,label,group,sort_order')
            ->orderByHierarchy()
            ->get()
            ->map(fn (Role $role) => [
                'id'          => $role->id,
                'name'        => $role->name,
                'label'       => $role->label,
                'description' => $role->description,
                'color'       => $role->color,
                'level'       => $role->level,
                'is_system'   => $role->is_system,
                'user_count'  => $roleCounts->sum(fn ($row) => ($row->role_id == $role->id || $row->role === $role->name) ? $row->cnt : 0),
                'permissions' => $role->permissions->pluck('key')->toArray(),
            ]);

        $permissions = Permission::allCached()
            ->sortBy([['group', 'asc'], ['sort_order', 'asc']])
            ->values()
            ->map->only(['id', 'key', 'label', 'group', 'description']);

        $grouped = $permissions->groupBy('group')->map(fn ($items) => $items->values());

        return Inertia::render('Admin/Roles', [
            'roles'                => $roles,
            'permissions'          => $permissions,
            'grouped_permissions'  => $grouped,
            'can_manage'           => (bool) auth()->user()->isSuperAdmin(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', Role::class);

        $data = $request->validate([
            'name'        => 'required|string|max:50|alpha_dash|unique:roles,name',
            'label'       => 'required|string|max:100',
            'description' => 'nullable|string|max:500',
            'color'       => 'nullable|string|max:30',
            'level'       => 'nullable|integer|min:1|max:100',
        ]);

        $role = $this->rbac->createRole($data, auth()->user());

        return back()->with('success', "Rôle « {$role->label} » créé.");
    }

    public function update(Request $request, Role $role): RedirectResponse
    {
        $this->authorize('update', $role);

        $data = $request->validate([
            'label'       => 'required|string|max:100',
            'description' => 'nullable|string|max:500',
            'color'       => 'nullable|string|max:30',
            'level'       => 'nullable|integer|min:1|max:100',
        ]);

        $role->update($data);

        return back()->with('success', "Rôle « {$role->label} » mis à jour.");
    }

    public function destroy(Role $role): RedirectResponse
    {
        $this->authorize('delete', $role);

        $label = $role->label;
        $this->rbac->deleteRole($role, auth()->user());

        return back()->with('success', "Rôle « {$label} » supprimé.");
    }

    /** Save the Permission Matrix: replace a role's full permission set. */
    public function updatePermissions(Request $request, Role $role): RedirectResponse
    {
        $this->authorize('managePermissions', $role);

        $data = $request->validate([
            'permissions'   => 'array',
            'permissions.*' => 'string|in:' . implode(',', Permission::keys()),
        ]);

        $this->rbac->updateRolePermissions($role, $data['permissions'] ?? [], auth()->user());

        return back()->with('success', "Permissions du rôle « {$role->label} » mises à jour.");
    }
}
