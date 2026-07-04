<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Permission;
use App\Services\RbacService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

/**
 * CRUD for the permission catalog itself — this is what makes permissions
 * genuinely dynamic: a Super Admin can add a brand-new permission key here
 * and it becomes assignable (Permission Matrix) and enforceable (Gate) with
 * no code change or deploy.
 */
class PermissionsController extends Controller
{
    public function __construct(private RbacService $rbac) {}

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', Permission::class);

        $data = $request->validate([
            'key'         => 'required|string|max:100|alpha_dash|unique:permissions,key',
            'label'       => 'required|string|max:100',
            'group'       => 'required|string|max:50',
            'description' => 'nullable|string|max:500',
        ]);

        $permission = $this->rbac->createPermission($data, auth()->user());

        return back()->with('success', "Permission « {$permission->label} » créée.");
    }

    public function update(Request $request, Permission $permission): RedirectResponse
    {
        $this->authorize('update', $permission);

        $data = $request->validate([
            'label'       => 'required|string|max:100',
            'group'       => 'required|string|max:50',
            'description' => 'nullable|string|max:500',
        ]);

        $this->rbac->updatePermission($permission, $data, auth()->user());

        return back()->with('success', "Permission « {$permission->label} » mise à jour.");
    }

    public function destroy(Permission $permission): RedirectResponse
    {
        $this->authorize('delete', $permission);

        $label = $permission->label;
        $this->rbac->deletePermission($permission, auth()->user());

        return back()->with('success', "Permission « {$label} » supprimée.");
    }
}
