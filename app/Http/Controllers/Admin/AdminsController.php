<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Mail\AdminPasswordResetMail;
use App\Models\AuditLog;
use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use App\Services\RbacService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class AdminsController extends Controller
{
    /** Hierarchy tiers assignable from this screen — school_owner/staff/user are out of scope here. */
    private const ADMIN_TIER_ROLES = ['super_admin', 'admin', 'support', 'moderator'];

    public function __construct(private RbacService $rbac) {}

    public function index(Request $request): Response
    {
        $this->authorize('viewAny', User::class);

        $admins = User::admins()
            ->with(['userPermissions:user_id,permission', 'roleModel:id,name,label,color,level'])
            ->when($request->search, fn ($q, $s) =>
                $q->where(fn ($qq) => $qq->where('name', 'like', "%$s%")->orWhere('email', 'like', "%$s%"))
            )
            // Filters by hierarchy tier (role_id), not the coarse `role` string —
            // Support/Moderator both have role='admin' but distinct role_id tiers.
            ->when($request->role, fn ($q, $r) => $q->whereHas('roleModel', fn ($rq) => $rq->where('name', $r)))
            ->when($request->status, function ($q, $s) {
                match ($s) {
                    'active'    => $q->where('is_active', true)->where('status', 0),
                    'inactive'  => $q->where('is_active', false),
                    'banned'    => $q->where('status', 1),
                    default     => null,
                };
            })
            ->latest()
            ->paginate(20)
            ->withQueryString()
            ->through(function ($u) {
                $authUser = auth()->user();
                return [
                    'id'                => $u->id,
                    'name'              => $u->name,
                    'email'             => $u->email,
                    'phone'             => $u->phone,
                    'role'              => $u->role,
                    'role_id'           => $u->role_id,
                    'hierarchy_role'    => $u->roleModel ? [
                        'name'  => $u->roleModel->name,
                        'label' => $u->roleModel->label,
                        'color' => $u->roleModel->color,
                        'level' => $u->roleModel->level,
                    ] : null,
                    'is_active'         => $u->is_active,
                    'status_label'      => $u->status_label,
                    'is_super_admin'    => $u->isSuperAdmin(),
                    'permissions'       => $u->getUserPermissions(),
                    'permissions_count' => $u->isSuperAdmin()
                        ? count(Permission::keys())
                        : count($u->getUserPermissions()),
                    'last_login_at'     => $u->last_login_at?->toISOString(),
                    'created_at'        => $u->created_at->toISOString(),
                    'avatar'            => $u->avatar,
                    'notes'             => $u->notes,
                    'can_edit'          => $authUser->can('update', $u),
                    'can_delete'        => $authUser->can('delete', $u),
                    'can_toggle'        => $authUser->can('toggleStatus', $u),
                    'can_reset_pw'      => $authUser->can('resetPassword', $u),
                    'can_sync_perms'    => $authUser->can('syncPermissions', $u),
                ];
            });

        $stats = [
            'total'        => User::admins()->count(),
            'super_admins' => User::where('role', User::ROLE_SUPER_ADMIN)->count(),
            'active'       => User::admins()->where('is_active', true)->where('status', 0)->count(),
            'suspended'    => User::admins()->where('is_active', false)->count(),
        ];

        $roles = Role::whereIn('name', self::ADMIN_TIER_ROLES)
            ->orderByHierarchy()
            ->select(['id', 'name', 'label', 'description', 'color', 'level'])
            ->get();

        return Inertia::render('Admin/Admins', [
            'admins'          => $admins,
            'stats'           => $stats,
            'roles'           => $roles,
            'filters'         => $request->only(['search', 'role', 'status']),
            'permissions_map' => Permission::allCached()
                ->mapWithKeys(fn ($p) => [$p->key => ['label' => $p->label, 'group' => $p->group]]),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', User::class);

        $data = $request->validate([
            'name'        => 'required|string|max:255',
            'email'       => 'required|email|unique:users,email',
            'phone'       => 'nullable|string|max:30',
            'role_id'     => 'required|exists:roles,id',
            'password'    => 'required|string|min:8|confirmed',
            'notes'       => 'nullable|string|max:500',
            'permissions' => 'array',
            'permissions.*' => 'string|in:' . implode(',', Permission::keys()),
        ]);

        $tier = $this->resolveAdminTierRole($data['role_id']);

        $admin = User::create([
            'name'      => $data['name'],
            'email'     => $data['email'],
            'phone'     => $data['phone'] ?? null,
            'role'      => $tier->name === 'super_admin' ? User::ROLE_SUPER_ADMIN : User::ROLE_ADMIN,
            'role_id'   => $tier->id,
            'password'  => Hash::make($data['password']),
            'is_active' => true,
            'notes'     => $data['notes'] ?? null,
        ]);
        // Admins are created by other admins — trust is already established, no need to prove email ownership.
        $admin->markEmailAsVerified();

        if ($tier->name !== 'super_admin' && ! empty($data['permissions'])) {
            $admin->syncPermissions($data['permissions'], auth()->id());
        }

        AuditLog::record('admin.created', $admin, [
            'new' => ['name' => $admin->name, 'email' => $admin->email, 'role' => $admin->role, 'tier' => $tier->name],
        ]);

        return back()->with('success', "Administrateur «{$admin->name}» créé avec succès.");
    }

    public function update(Request $request, User $user): RedirectResponse
    {
        abort_if(! $user->isAdmin(), 404);
        $this->authorize('update', $user);

        $data = $request->validate([
            'name'        => 'required|string|max:255',
            'email'       => 'required|email|unique:users,email,' . $user->id,
            'phone'       => 'nullable|string|max:30',
            'role_id'     => 'required|exists:roles,id',
            'notes'       => 'nullable|string|max:500',
            'permissions' => 'array',
            'permissions.*' => 'string|in:' . implode(',', Permission::keys()),
        ]);

        $tier = $this->resolveAdminTierRole($data['role_id']);
        $old  = $user->only(['name', 'email', 'role']);

        $user->update([
            'name'    => $data['name'],
            'email'   => $data['email'],
            'phone'   => $data['phone'] ?? null,
            'role'    => $tier->name === 'super_admin' ? User::ROLE_SUPER_ADMIN : User::ROLE_ADMIN,
            'role_id' => $tier->id,
            'notes'   => $data['notes'] ?? null,
        ]);

        if ($tier->name !== 'super_admin') {
            $user->syncPermissions($data['permissions'] ?? [], auth()->id());
        } else {
            // super_admin bypasses all checks — clear explicit individual grants
            $user->userPermissions()->delete();
        }

        AuditLog::record('admin.updated', $user, [
            'old' => $old,
            'new' => [...$user->only(['name', 'email', 'role']), 'tier' => $tier->name],
        ]);

        return back()->with('success', "Administrateur «{$user->name}» mis à jour.");
    }

    /** Resolve and validate that a submitted role_id is one of the assignable admin tiers. */
    private function resolveAdminTierRole(int $roleId): Role
    {
        $role = Role::whereIn('name', self::ADMIN_TIER_ROLES)->findOrFail($roleId);
        return $role;
    }

    public function destroy(User $user): RedirectResponse
    {
        abort_if(! $user->isAdmin(), 404);
        $this->authorize('delete', $user);

        $name = $user->name;
        AuditLog::record('admin.deleted', $user, ['old' => $user->only(['name', 'email', 'role'])]);
        $user->delete();

        return back()->with('success', "Administrateur «{$name}» supprimé.");
    }

    public function toggleStatus(Request $request, User $user): RedirectResponse
    {
        abort_if(! $user->isAdmin(), 404);
        $this->authorize('toggleStatus', $user);

        $data = $request->validate(['action' => 'required|in:activate,suspend']);

        if ($data['action'] === 'suspend') {
            $this->rbac->suspendAdmin($user, auth()->user());
            return back()->with('success', "Compte de «{$user->name}» suspendu.");
        }

        $user->update(['is_active' => true]);
        AuditLog::record('admin.activated', $user);
        return back()->with('success', "Compte de «{$user->name}» réactivé.");
    }

    public function resetPassword(User $user): RedirectResponse
    {
        abort_if(! $user->isAdmin(), 404);
        $this->authorize('resetPassword', $user);

        $newPassword = Str::random(12);
        $user->update(['password' => Hash::make($newPassword)]);

        AuditLog::record('admin.password_reset', $user);

        try {
            Mail::to($user->email)->queue(new AdminPasswordResetMail($user, $newPassword));
        } catch (\Throwable $e) {
            Log::error('Admin password reset email failed to send', ['user_id' => $user->id, 'error' => $e->getMessage()]);
        }

        return back()->with('success', "Nouveau mot de passe envoyé par email à «{$user->name}».");
    }

    public function syncPermissions(Request $request, User $user): RedirectResponse
    {
        abort_if(! $user->isAdmin(), 404);
        $this->authorize('syncPermissions', $user);

        $data = $request->validate([
            'permissions'   => 'array',
            'permissions.*' => 'string|in:' . implode(',', Permission::keys()),
        ]);

        $old = $user->getUserPermissions();
        $user->syncPermissions($data['permissions'] ?? [], auth()->id());

        AuditLog::record('admin.permissions_synced', $user, [
            'old' => $old,
            'new' => $data['permissions'] ?? [],
        ]);

        return back()->with('success', "Permissions de «{$user->name}» mises à jour.");
    }
}
