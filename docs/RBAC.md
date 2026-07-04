# Enterprise Admin Hierarchy & RBAC

This document describes the role/permission system added on top of the existing
authentication model. **Scope**: this governs the admin panel (`/admin/*`) only.
`school_owner`, `staff`, and `user` are recognized as hierarchy levels for
completeness, but their actual access (`/school/*`, public site) is unchanged —
see "Out of scope" below.

## Hierarchy

```
Level 1  Super Admin   — full bypass, manages every account, roles & permissions
Level 2  Admin         — permissions come entirely from its role + individual grants
Level 3  Support       — customer-facing ops (default: contacts, newsletter, bookings, reviews)
Level 4  Moderator     — content moderation (default: reviews, categories, services)
Level 5  School Owner  — out of scope (see below)
Level 6  Staff         — out of scope, not yet a working feature (see below)
Level 7  User          — out of scope (see below)
```

Defined in `App\Models\Role::HIERARCHY` and seeded by
`database/seeders/RolesAndPermissionsSeeder.php`. `roles.level` (1 = most
senior) drives `Role::isSeniorTo()` / `User::isSeniorTo()` / `User::hierarchyLevel()`.

### Why levels 5–7 exist as rows but aren't "wired up"

The request asked for the full 7-level hierarchy to exist as real, queryable
data (`roles` table), and for the admin-panel tiers (1–4) to be fully
functional. School Owner / Staff / User already have their own working,
separate systems (`/school/*` middleware, public auth) that this change
deliberately does not touch, to avoid a large, risky restructure outside what
was asked. **Staff in particular has no real feature behind it yet** — the row
exists so the hierarchy is complete and so a future "invite an employee"
feature has a role to attach to, but there is no staff-invitation flow today.

## Schema

```
roles                  id, name, label, description, color, is_system, sort_order, level
permissions             id, key, label, group, description, sort_order
role_permission (pivot) role_id, permission_id
users                    ... existing role_id column ->> roles.id  (NEW)
audit_logs               (pre-existing) user_id, action, subject_type, subject_id, properties, ip, user_agent
```

Two role_id / role fields co-exist on `users` by design:

- **`role`** (string, unchanged) — coarse area access: `super_admin` / `admin` /
  `school_owner` / `user`. Every existing middleware (`AdminMiddleware`,
  `SchoolOwnerMiddleware`, etc.) and all 298 pre-existing tests depend on this
  exact semantic — it was never renamed or repurposed.
- **`role_id`** (FK, new) — fine-grained tier within the admin panel
  (Super Admin / Admin / Support / Moderator). Support and Moderator both have
  `role = 'admin'` and are distinguished only by `role_id`.

This split is what let the whole hierarchy ship without touching the 18
pre-existing `permission:xxx` route groups or any School/User-side code.

## Where permissions actually come from (`User::hasPermission()`)

```php
public function hasPermission(string $permission): bool
{
    if ($this->isSuperAdmin()) return true;
    if (! $this->isAdmin()) return false;

    // 1. Individual grant (legacy per-user mechanism, still supported)
    if ($this->userPermissions()->where('permission', $permission)->exists()) return true;

    // 2. Role-based grant (new primary mechanism)
    return $this->roleModel?->permissions()->where('key', $permission)->exists() ?? false;
}
```

Both mechanisms are additive — a user's effective permissions are the union of
their role's permissions and any individual overrides. This means existing
per-admin permission grants (e.g. the seeded `manager@autoecoles.ma` account)
keep working exactly as before; role-based grants are the new recommended way
to manage a group of admins at once via the Permission Matrix page.

## Never hardcoded: permissions are DB rows, not a PHP constant

`App\Models\Permission::keys()` (cached, DB-backed) is the single source of
truth for:
- Validation rules (`'permissions.*' => 'in:' . implode(',', Permission::keys())`)
- The frontend `permissions_map` shared prop
- Dynamic Gate registration (see below)

Creating a permission from the **Permission Matrix** page
(`POST /admin/permissions`) makes it immediately assignable to a role and
enforceable — no code change, no deploy. `App\Traits\HasPermissions::ALL_PERMISSIONS`
still exists as the *initial seed* for a fresh install only; it is never read
at runtime anymore.

## Gates & Policies

`App\Providers\AppServiceProvider::registerDynamicPermissionGates()` loops
over every `permissions` row at boot and registers a matching Laravel Gate:

```php
foreach (Permission::query()->pluck('key') as $key) {
    Gate::define($key, fn (User $user) => $user->hasPermission($key));
}
```

So `$user->can('manage_crm')` and `Route::middleware('can:manage_crm')` work
for every permission in the catalog, automatically. The pre-existing
`permission:xxx` middleware (used on the 18 existing route groups) calls the
same `hasPermission()` method under the hood, so both mechanisms are always
consistent — nothing was force-migrated off the working middleware just for
the sake of it.

New Policy classes, all registered in `AppServiceProvider::$policies`:

| Model | Policy | Notes |
|---|---|---|
| `User` | `AdminPolicy` (extended) | added `viewAuditLogs()` |
| `Role` | `RolePolicy` (new) | `is_system` roles can't be deleted |
| `Permission` | `PermissionPolicy` (new) | Super Admin only |

## New admin-panel surfaces

| Page | Route | What it does |
|---|---|---|
| Admin Management | `admin.admins.*` (extended) | create/edit/suspend/delete admins, assign a hierarchy tier (`role_id`) + individual permission overrides |
| Permission Matrix | `admin.roles.index` + `admin.roles.{store,update,destroy}` + `admin.roles.permissions.update` | interactive roles × permissions grid, create custom roles/permissions |
| Audit Log | `admin.audit-logs.index` (new) | filterable log of every `AuditLog::record()` call, Super Admin only |

## Service layer

`App\Services\RbacService` centralizes the mutations (`assignRole`,
`updateRolePermissions`, `createRole`, `deleteRole`, `createPermission`,
`updatePermission`, `deletePermission`, `suspendAdmin`) so controllers stay
thin and every mutation is independently testable and consistently audit-logged.

## Adding a new permission tier (e.g. "Regional Manager")

No migration needed — either:
1. Super Admin uses the "+ Rôle" button on the Permission Matrix page, or
2. `App\Services\RbacService::createRole([...])`.

Then grant it permissions via the matrix (click a cell, "Enregistrer"), and
assign it to an admin from the Admin Management page's role dropdown.

## Tests

- `tests/Feature/RbacTest.php` — existing admin CRUD/policy tests, updated for `role_id`.
- `tests/Feature/PermissionMatrixTest.php` — hierarchy seeding, dynamic permission creation, role-based grant propagation, role CRUD, authorization.
- `tests/Feature/AuditLogViewingTest.php` — viewing, filtering, authorization, and that RBAC mutations are actually audit-logged.

All 314 tests (298 pre-existing + 16 new) pass.
