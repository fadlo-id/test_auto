<?php

namespace Tests\Feature;

use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PermissionMatrixTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolesAndPermissionsSeeder::class);
    }

    private function superAdmin(): User
    {
        $role = Role::where('name', 'super_admin')->firstOrFail();
        return User::factory()->create(['role' => 'super_admin', 'role_id' => $role->id, 'is_active' => true]);
    }

    private function admin(string $tier = 'admin'): User
    {
        $role = Role::where('name', $tier)->firstOrFail();
        return User::factory()->create(['role' => 'admin', 'role_id' => $role->id, 'is_active' => true]);
    }

    // ── Hierarchy is seeded correctly ──────────────────────────────────────────

    public function test_all_seven_hierarchy_levels_are_seeded(): void
    {
        $names = Role::orderByHierarchy()->pluck('name')->toArray();
        $this->assertSame(
            ['super_admin', 'admin', 'support', 'moderator', 'school_owner', 'staff', 'user'],
            $names
        );
    }

    public function test_super_admin_is_senior_to_every_other_tier(): void
    {
        $sa      = Role::where('name', 'super_admin')->first();
        $admin   = Role::where('name', 'admin')->first();
        $support = Role::where('name', 'support')->first();

        $this->assertTrue($sa->isSeniorTo($admin));
        $this->assertTrue($sa->isSeniorTo($support));
        $this->assertTrue($admin->isSeniorTo($support));
        $this->assertFalse($support->isSeniorTo($admin));
    }

    // ── Permission catalog is dynamic (never hardcoded) ─────────────────────────

    public function test_permission_keys_are_sourced_from_the_database(): void
    {
        $this->assertContains('manage_crm', Permission::keys());
        $this->assertContains('manage_users', Permission::keys());
    }

    public function test_super_admin_can_create_a_new_permission_and_it_is_immediately_usable(): void
    {
        $sa = $this->superAdmin();

        $this->actingAs($sa)
            ->post(route('admin.permissions.store'), [
                'key'   => 'manage_widgets',
                'label' => 'Widgets',
                'group' => 'Gestion',
            ])
            ->assertRedirect()
            ->assertSessionHas('success');

        $this->assertDatabaseHas('permissions', ['key' => 'manage_widgets']);
        $this->assertContains('manage_widgets', Permission::keys());
    }

    public function test_regular_admin_cannot_create_a_permission(): void
    {
        $admin = $this->admin();

        $this->actingAs($admin)
            ->post(route('admin.permissions.store'), [
                'key' => 'manage_widgets', 'label' => 'Widgets', 'group' => 'Gestion',
            ])
            ->assertForbidden();
    }

    // ── Role-based permission grants (the new primary mechanism) ────────────────

    public function test_support_tier_has_its_seeded_default_permissions_via_role(): void
    {
        $support = $this->admin('support');

        $this->assertTrue($support->hasPermission('manage_contacts'));
        $this->assertFalse($support->hasPermission('manage_admins'));
    }

    public function test_super_admin_can_update_a_roles_permission_set_via_the_matrix(): void
    {
        $sa      = $this->superAdmin();
        $support = Role::where('name', 'support')->firstOrFail();

        $this->actingAs($sa)
            ->put(route('admin.roles.permissions.update', $support), [
                'permissions' => ['manage_reviews', 'manage_crm'],
            ])
            ->assertRedirect()
            ->assertSessionHas('success');

        $support->refresh();
        $this->assertEqualsCanonicalizing(['manage_reviews', 'manage_crm'], $support->permissionKeys());

        // The change takes effect for every user on that role, immediately.
        $supportUser = User::factory()->create(['role' => 'admin', 'role_id' => $support->id, 'is_active' => true]);
        $this->assertTrue($supportUser->hasPermission('manage_crm'));
        $this->assertFalse($supportUser->hasPermission('manage_contacts'));
    }

    public function test_regular_admin_cannot_update_the_permission_matrix(): void
    {
        $admin   = $this->admin();
        $support = Role::where('name', 'support')->firstOrFail();

        $this->actingAs($admin)
            ->put(route('admin.roles.permissions.update', $support), ['permissions' => ['manage_crm']])
            ->assertForbidden();
    }

    // ── Role CRUD ─────────────────────────────────────────────────────────────

    public function test_super_admin_can_create_a_custom_role(): void
    {
        $sa = $this->superAdmin();

        $this->actingAs($sa)
            ->post(route('admin.roles.store'), [
                'name'  => 'regional_manager',
                'label' => 'Responsable régional',
                'level' => 3,
            ])
            ->assertRedirect()
            ->assertSessionHas('success');

        $this->assertDatabaseHas('roles', ['name' => 'regional_manager', 'is_system' => false]);
    }

    public function test_system_roles_cannot_be_deleted(): void
    {
        $sa    = $this->superAdmin();
        $admin = Role::where('name', 'admin')->firstOrFail();

        $this->actingAs($sa)
            ->delete(route('admin.roles.destroy', $admin))
            ->assertForbidden();

        $this->assertDatabaseHas('roles', ['id' => $admin->id]);
    }

    public function test_custom_roles_can_be_deleted(): void
    {
        $sa   = $this->superAdmin();
        $role = Role::create(['name' => 'temp_role', 'label' => 'Temp', 'is_system' => false, 'sort_order' => 99]);

        $this->actingAs($sa)
            ->delete(route('admin.roles.destroy', $role))
            ->assertRedirect()
            ->assertSessionHas('success');

        $this->assertDatabaseMissing('roles', ['id' => $role->id]);
    }

    public function test_regular_admin_cannot_manage_roles(): void
    {
        $admin = $this->admin();

        $this->actingAs($admin)
            ->post(route('admin.roles.store'), ['name' => 'x', 'label' => 'X'])
            ->assertForbidden();
    }
}
