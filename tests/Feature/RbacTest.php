<?php

namespace Tests\Feature;

use App\Models\Role;
use App\Models\User;
use App\Policies\AdminPolicy;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class RbacTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolesAndPermissionsSeeder::class);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private function superAdmin(): User
    {
        return User::factory()->create(['role' => 'super_admin', 'is_active' => true]);
    }

    private function admin(array $permissions = []): User
    {
        $user = User::factory()->create(['role' => 'admin', 'is_active' => true]);
        foreach ($permissions as $perm) {
            $user->grantPermission($perm);
        }
        return $user;
    }

    private function adminRoleId(): int
    {
        return Role::where('name', 'admin')->firstOrFail()->id;
    }

    private function regularUser(): User
    {
        return User::factory()->create(['role' => 'user']);
    }

    // ── AdminPolicy unit tests ─────────────────────────────────────────────────

    public function test_policy_super_admin_can_view_any(): void
    {
        $policy = new AdminPolicy();
        $sa = $this->superAdmin();
        $this->assertTrue($policy->viewAny($sa));
    }

    public function test_policy_regular_admin_cannot_view_any(): void
    {
        $policy = new AdminPolicy();
        $admin = $this->admin();
        $this->assertFalse($policy->viewAny($admin));
    }

    public function test_policy_super_admin_can_create(): void
    {
        $policy = new AdminPolicy();
        $this->assertTrue($policy->create($this->superAdmin()));
    }

    public function test_policy_admin_cannot_create(): void
    {
        $policy = new AdminPolicy();
        $this->assertFalse($policy->create($this->admin()));
    }

    public function test_policy_super_admin_can_update_other_admin(): void
    {
        $policy  = new AdminPolicy();
        $sa      = $this->superAdmin();
        $target  = $this->admin();
        $this->assertTrue($policy->update($sa, $target));
    }

    public function test_policy_super_admin_cannot_update_themselves(): void
    {
        $policy = new AdminPolicy();
        $sa     = $this->superAdmin();
        $this->assertFalse($policy->update($sa, $sa));
    }

    public function test_policy_admin_cannot_update_anyone(): void
    {
        $policy = new AdminPolicy();
        $a1     = $this->admin();
        $a2     = $this->admin();
        $this->assertFalse($policy->update($a1, $a2));
    }

    public function test_policy_super_admin_can_delete_regular_admin(): void
    {
        $policy = new AdminPolicy();
        $sa     = $this->superAdmin();
        $target = $this->admin();
        $this->assertTrue($policy->delete($sa, $target));
    }

    public function test_policy_super_admin_cannot_delete_themselves(): void
    {
        $policy = new AdminPolicy();
        $sa     = $this->superAdmin();
        $this->assertFalse($policy->delete($sa, $sa));
    }

    public function test_policy_super_admin_cannot_delete_another_super_admin(): void
    {
        $policy = new AdminPolicy();
        $sa1    = $this->superAdmin();
        $sa2    = $this->superAdmin();
        $this->assertFalse($policy->delete($sa1, $sa2));
    }

    public function test_policy_super_admin_can_toggle_status(): void
    {
        $policy = new AdminPolicy();
        $sa     = $this->superAdmin();
        $target = $this->admin();
        $this->assertTrue($policy->toggleStatus($sa, $target));
    }

    public function test_policy_super_admin_cannot_toggle_own_status(): void
    {
        $policy = new AdminPolicy();
        $sa     = $this->superAdmin();
        $this->assertFalse($policy->toggleStatus($sa, $sa));
    }

    public function test_policy_super_admin_can_reset_password(): void
    {
        $policy = new AdminPolicy();
        $sa     = $this->superAdmin();
        $target = $this->admin();
        $this->assertTrue($policy->resetPassword($sa, $target));
    }

    public function test_policy_super_admin_cannot_reset_own_password_via_this_route(): void
    {
        $policy = new AdminPolicy();
        $sa     = $this->superAdmin();
        $this->assertFalse($policy->resetPassword($sa, $sa));
    }

    public function test_policy_super_admin_can_sync_permissions_on_admin(): void
    {
        $policy = new AdminPolicy();
        $sa     = $this->superAdmin();
        $target = $this->admin();
        $this->assertTrue($policy->syncPermissions($sa, $target));
    }

    public function test_policy_cannot_sync_permissions_on_super_admin(): void
    {
        $policy = new AdminPolicy();
        $sa1    = $this->superAdmin();
        $sa2    = $this->superAdmin();
        $this->assertFalse($policy->syncPermissions($sa1, $sa2));
    }

    // ── HTTP integration tests ─────────────────────────────────────────────────

    public function test_super_admin_can_access_admins_index(): void
    {
        $sa = $this->superAdmin();
        $this->actingAs($sa)
            ->get(route('admin.admins.index'))
            ->assertOk();
    }

    public function test_regular_admin_cannot_access_admins_index(): void
    {
        $admin = $this->admin(['manage_dashboard']);
        $this->actingAs($admin)
            ->get(route('admin.admins.index'))
            ->assertForbidden();
    }

    public function test_unauthenticated_cannot_access_admins_index(): void
    {
        $this->get(route('admin.admins.index'))
            ->assertRedirect(route('login'));
    }

    public function test_super_admin_can_create_admin(): void
    {
        $sa = $this->superAdmin();
        $this->actingAs($sa)
            ->post(route('admin.admins.store'), [
                'name'                  => 'Nouveau Admin',
                'email'                 => 'nouveau@test.ma',
                'role_id'               => $this->adminRoleId(),
                'password'              => 'Secure@2026!',
                'password_confirmation' => 'Secure@2026!',
                'permissions'           => ['manage_users', 'manage_schools'],
            ])
            ->assertRedirect()
            ->assertSessionHas('success');

        $this->assertDatabaseHas('users', ['email' => 'nouveau@test.ma', 'role' => 'admin']);
        $this->assertDatabaseHas('user_permissions', ['permission' => 'manage_users']);

        // Admins created via the panel must be pre-verified — no email ownership proof needed
        // between two already-trusted admin accounts.
        $this->assertTrue(User::where('email', 'nouveau@test.ma')->first()->hasVerifiedEmail());
    }

    public function test_regular_admin_cannot_create_admin(): void
    {
        $admin = $this->admin();
        $this->actingAs($admin)
            ->post(route('admin.admins.store'), [
                'name'                  => 'Nouveau',
                'email'                 => 'new@test.ma',
                'role_id'               => $this->adminRoleId(),
                'password'              => 'Pass@2026!',
                'password_confirmation' => 'Pass@2026!',
            ])
            ->assertForbidden();
    }

    public function test_super_admin_can_update_admin(): void
    {
        $sa     = $this->superAdmin();
        $target = $this->admin();

        $this->actingAs($sa)
            ->put(route('admin.admins.update', $target), [
                'name'        => 'Updated Name',
                'email'       => $target->email,
                'role_id'     => $this->adminRoleId(),
                'permissions' => ['manage_reviews'],
            ])
            ->assertRedirect()
            ->assertSessionHas('success');

        $this->assertDatabaseHas('users', ['id' => $target->id, 'name' => 'Updated Name']);
    }

    public function test_super_admin_cannot_update_themselves(): void
    {
        $sa = $this->superAdmin();
        $this->actingAs($sa)
            ->put(route('admin.admins.update', $sa), [
                'name'    => 'Changed',
                'email'   => $sa->email,
                'role_id' => Role::where('name', 'super_admin')->firstOrFail()->id,
            ])
            ->assertForbidden();
    }

    public function test_super_admin_can_delete_regular_admin(): void
    {
        $sa     = $this->superAdmin();
        $target = $this->admin();

        $this->actingAs($sa)
            ->delete(route('admin.admins.destroy', $target))
            ->assertRedirect()
            ->assertSessionHas('success');

        $this->assertDatabaseMissing('users', ['id' => $target->id]);
    }

    public function test_super_admin_cannot_delete_themselves(): void
    {
        $sa = $this->superAdmin();
        $this->actingAs($sa)
            ->delete(route('admin.admins.destroy', $sa))
            ->assertForbidden();
    }

    public function test_super_admin_cannot_delete_another_super_admin(): void
    {
        $sa1 = $this->superAdmin();
        $sa2 = $this->superAdmin();
        $this->actingAs($sa1)
            ->delete(route('admin.admins.destroy', $sa2))
            ->assertForbidden();
    }

    public function test_super_admin_can_suspend_admin(): void
    {
        $sa     = $this->superAdmin();
        $target = $this->admin();

        $this->actingAs($sa)
            ->post(route('admin.admins.toggle-status', $target), ['action' => 'suspend'])
            ->assertRedirect()
            ->assertSessionHas('success');

        $this->assertDatabaseHas('users', ['id' => $target->id, 'is_active' => false]);
    }

    public function test_super_admin_cannot_suspend_themselves(): void
    {
        $sa = $this->superAdmin();
        $this->actingAs($sa)
            ->post(route('admin.admins.toggle-status', $sa), ['action' => 'suspend'])
            ->assertForbidden();
    }

    public function test_super_admin_can_reactivate_admin(): void
    {
        $sa     = $this->superAdmin();
        $target = User::factory()->create(['role' => 'admin', 'is_active' => false]);

        $this->actingAs($sa)
            ->post(route('admin.admins.toggle-status', $target), ['action' => 'activate'])
            ->assertRedirect()
            ->assertSessionHas('success');

        $this->assertDatabaseHas('users', ['id' => $target->id, 'is_active' => true]);
    }

    public function test_super_admin_can_reset_password(): void
    {
        $sa     = $this->superAdmin();
        $target = $this->admin();
        $oldHash = $target->password;

        $this->actingAs($sa)
            ->post(route('admin.admins.reset-password', $target))
            ->assertRedirect()
            ->assertSessionHas('success');

        $target->refresh();
        $this->assertNotEquals($oldHash, $target->password);
    }

    public function test_super_admin_cannot_reset_own_password_via_admins_route(): void
    {
        $sa = $this->superAdmin();
        $this->actingAs($sa)
            ->post(route('admin.admins.reset-password', $sa))
            ->assertForbidden();
    }

    public function test_super_admin_can_sync_permissions(): void
    {
        $sa     = $this->superAdmin();
        $target = $this->admin(['manage_users']);

        $this->actingAs($sa)
            ->post(route('admin.admins.sync-permissions', $target), [
                'permissions' => ['manage_reviews', 'manage_analytics'],
            ])
            ->assertRedirect()
            ->assertSessionHas('success');

        $this->assertDatabaseHas('user_permissions', ['user_id' => $target->id, 'permission' => 'manage_reviews']);
        $this->assertDatabaseMissing('user_permissions', ['user_id' => $target->id, 'permission' => 'manage_users']);
    }

    public function test_cannot_sync_permissions_on_super_admin(): void
    {
        $sa1 = $this->superAdmin();
        $sa2 = $this->superAdmin();

        $this->actingAs($sa1)
            ->post(route('admin.admins.sync-permissions', $sa2), [
                'permissions' => ['manage_users'],
            ])
            ->assertForbidden();
    }

    public function test_store_validates_required_fields(): void
    {
        $sa = $this->superAdmin();
        $this->actingAs($sa)
            ->post(route('admin.admins.store'), [])
            ->assertSessionHasErrors(['name', 'email', 'role_id', 'password']);
    }

    public function test_store_rejects_duplicate_email(): void
    {
        $sa       = $this->superAdmin();
        $existing = $this->admin();

        $this->actingAs($sa)
            ->post(route('admin.admins.store'), [
                'name'                  => 'Dup',
                'email'                 => $existing->email,
                'role_id'               => $this->adminRoleId(),
                'password'              => 'Pass@2026!',
                'password_confirmation' => 'Pass@2026!',
            ])
            ->assertSessionHasErrors('email');
    }

    public function test_store_rejects_invalid_permission_key(): void
    {
        $sa = $this->superAdmin();
        $this->actingAs($sa)
            ->post(route('admin.admins.store'), [
                'name'                  => 'Test',
                'email'                 => 'perm_test@test.ma',
                'role_id'               => $this->adminRoleId(),
                'password'              => 'Pass@2026!',
                'password_confirmation' => 'Pass@2026!',
                'permissions'           => ['nonexistent_permission'],
            ])
            ->assertSessionHasErrors('permissions.0');
    }
}
