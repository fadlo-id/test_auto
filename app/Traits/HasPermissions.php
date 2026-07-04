<?php

namespace App\Traits;

use App\Models\UserPermission;

trait HasPermissions
{
    public const ALL_PERMISSIONS = [
        'manage_dashboard'     => ['label' => 'Dashboard',       'group' => 'Général'],
        'manage_users'         => ['label' => 'Utilisateurs',    'group' => 'Gestion'],
        'manage_schools'       => ['label' => 'Auto-écoles',     'group' => 'Gestion'],
        'manage_credits'       => ['label' => 'Crédits',         'group' => 'Gestion'],
        'manage_reviews'       => ['label' => 'Avis',            'group' => 'Gestion'],
        'manage_bookings'      => ['label' => 'Réservations',    'group' => 'Gestion'],
        'manage_crm'           => ['label' => 'CRM',             'group' => 'Gestion'],
        'manage_payments'      => ['label' => 'Paiements',       'group' => 'Finance'],
        'manage_subscriptions' => ['label' => 'Abonnements',     'group' => 'Finance'],
        'manage_plans'         => ['label' => 'Plans',           'group' => 'Finance'],
        'manage_analytics'     => ['label' => 'Analytics',       'group' => 'Rapports'],
        'manage_reports'       => ['label' => 'Rapports',        'group' => 'Rapports'],
        'manage_contacts'      => ['label' => 'Contacts',        'group' => 'Communication'],
        'manage_newsletter'    => ['label' => 'Newsletter',      'group' => 'Communication'],
        'manage_categories'    => ['label' => 'Catégories',      'group' => 'Contenu'],
        'manage_services'      => ['label' => 'Services',        'group' => 'Contenu'],
        'manage_settings'      => ['label' => 'Paramètres',      'group' => 'Système'],
        'manage_logs'          => ['label' => 'Logs',            'group' => 'Système'],
        'manage_admins'        => ['label' => 'Administrateurs', 'group' => 'Système'],
    ];

    public function userPermissions()
    {
        return $this->hasMany(UserPermission::class, 'user_id');
    }

    public function getUserPermissions(): array
    {
        if ($this->isSuperAdmin()) {
            return \App\Models\Permission::keys() ?: array_keys(self::ALL_PERMISSIONS);
        }

        $individual = $this->userPermissions()->pluck('permission')->toArray();
        $fromRole   = $this->roleModel?->permissionKeys() ?? [];

        return array_values(array_unique([...$individual, ...$fromRole]));
    }

    public function hasPermission(string $permission): bool
    {
        if ($this->isSuperAdmin()) return true;
        if (! $this->isAdmin()) return false;

        // Individually-granted permission (legacy/override mechanism — still supported).
        if ($this->userPermissions()->where('permission', $permission)->exists()) {
            return true;
        }

        // Role-based permission (new primary mechanism — via role_id -> role_permission).
        return $this->roleModel?->permissions()->where('key', $permission)->exists() ?? false;
    }

    public function grantPermission(string $permission, ?int $grantedBy = null): void
    {
        $this->userPermissions()->updateOrCreate(
            ['permission' => $permission],
            ['granted_by' => $grantedBy, 'granted_at' => now()]
        );
    }

    public function revokePermission(string $permission): void
    {
        $this->userPermissions()->where('permission', $permission)->delete();
    }

    public function syncPermissions(array $permissions, ?int $grantedBy = null): void
    {
        $this->userPermissions()->delete();
        foreach ($permissions as $perm) {
            if (array_key_exists($perm, self::ALL_PERMISSIONS)) {
                $this->userPermissions()->create([
                    'permission' => $perm,
                    'granted_by' => $grantedBy,
                    'granted_at' => now(),
                ]);
            }
        }
    }

    public function permissionsCount(): int
    {
        if ($this->isSuperAdmin()) return count(self::ALL_PERMISSIONS);
        return $this->userPermissions()->count();
    }
}
