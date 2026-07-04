<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;

class RolesAndPermissionsSeeder extends Seeder
{
    public function run(): void
    {
        // ── Roles — full 7-level admin hierarchy ─────────────────────────────────
        // level: 1 = most senior ... 7 = least senior (see Role::HIERARCHY).
        // school_owner / staff / user exist here for hierarchy completeness and are
        // NOT enforced by the admin panel — their actual access is governed by the
        // existing role string + School/User middleware, unchanged by this seeder.
        $roleDefs = [
            ['name' => 'super_admin',  'label' => 'Super Administrateur', 'level' => 1, 'color' => 'purple',
                'description' => 'Contrôle total sur la plateforme. Peut créer et gérer les administrateurs, attribuer des permissions et accéder à tous les modules.'],
            ['name' => 'admin',        'label' => 'Administrateur',       'level' => 2, 'color' => 'blue',
                'description' => 'Accès configurable via des permissions de rôle et individuelles, attribuées par le Super Admin.'],
            ['name' => 'support',      'label' => 'Support',              'level' => 3, 'color' => 'teal',
                'description' => 'Équipe support client : contacts, newsletter, réservations et avis.'],
            ['name' => 'moderator',    'label' => 'Modérateur',           'level' => 4, 'color' => 'amber',
                'description' => 'Modération de contenu : avis, catégories et services.'],
            ['name' => 'school_owner', 'label' => 'Propriétaire d\'école', 'level' => 5, 'color' => 'orange',
                'description' => 'Gère sa propre auto-école via l\'espace /school — hors périmètre du panneau d\'administration.'],
            ['name' => 'staff',        'label' => 'Personnel',            'level' => 6, 'color' => 'gray',
                'description' => 'Employé rattaché à une auto-école (fonctionnalité à venir).'],
            ['name' => 'user',         'label' => 'Utilisateur',          'level' => 7, 'color' => 'gray',
                'description' => 'Candidat / visiteur inscrit sur la plateforme publique.'],
        ];

        $roles = [];
        foreach ($roleDefs as $order => $def) {
            $roles[$def['name']] = Role::updateOrCreate(['name' => $def['name']], [
                'label'       => $def['label'],
                'description' => $def['description'],
                'color'       => $def['color'],
                'is_system'   => true,
                'sort_order'  => $order + 1,
                'level'       => $def['level'],
            ]);
        }

        // ── Permissions — sourced from HasPermissions::ALL_PERMISSIONS ─────────
        // This constant remains the seed source for the *initial* catalog only.
        // Once seeded, the `permissions` table is the live source of truth
        // (Permission::keys()) — new permissions can be added from the Permission
        // Matrix page without touching code.
        $allPermissions = User::ALL_PERMISSIONS;
        $order = 0;
        $permissionModels = [];

        foreach ($allPermissions as $key => $meta) {
            $permissionModels[$key] = Permission::updateOrCreate(['key' => $key], [
                'label'       => $meta['label'],
                'group'       => $meta['group'],
                'description' => $meta['description'] ?? null,
                'sort_order'  => $order++,
            ]);
        }

        $keyToId = fn (array $keys) => collect($keys)
            ->map(fn ($k) => $permissionModels[$k]?->id)
            ->filter()
            ->values()
            ->toArray();

        // super_admin / admin: full catalog (super_admin bypasses checks entirely;
        // still associated for accurate display in the Permission Matrix).
        $allIds = collect($permissionModels)->pluck('id')->toArray();
        $roles['super_admin']->permissions()->sync($allIds);
        $roles['admin']->permissions()->sync($allIds);

        // support: customer-facing operations — sensible default, editable by Super Admin.
        $roles['support']->permissions()->sync($keyToId([
            'manage_dashboard', 'manage_contacts', 'manage_newsletter', 'manage_bookings', 'manage_reviews',
        ]));

        // moderator: content moderation — sensible default, editable by Super Admin.
        $roles['moderator']->permissions()->sync($keyToId([
            'manage_dashboard', 'manage_reviews', 'manage_categories', 'manage_services',
        ]));

        // school_owner / staff / user: no admin-panel permissions (out of scope, see docs/RBAC.md).
        $roles['school_owner']->permissions()->sync([]);
        $roles['staff']->permissions()->sync([]);
        $roles['user']->permissions()->sync([]);

        // ── Backfill role_id on existing users from their current `role` string ──
        // Purely additive: never changes the `role` string column, only fills the
        // new fine-grained tier for users that don't have one set yet.
        foreach ($roles as $name => $role) {
            User::where('role', $name)->whereNull('role_id')->update(['role_id' => $role->id]);
        }

        $this->command->info('Roles and permissions seeded successfully.');
    }
}
