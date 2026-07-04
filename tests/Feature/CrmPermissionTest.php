<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CrmPermissionTest extends TestCase
{
    use RefreshDatabase;

    public function test_super_admin_can_access_crm_dashboard(): void
    {
        $superAdmin = User::factory()->create(['role' => 'super_admin', 'is_active' => true]);

        $this->actingAs($superAdmin)
            ->get(route('admin.crm.dashboard'))
            ->assertOk();
    }

    public function test_admin_without_manage_crm_permission_is_forbidden(): void
    {
        $admin = User::factory()->create(['role' => 'admin', 'is_active' => true]);
        // Deliberately grant an unrelated permission only.
        $admin->grantPermission('manage_users');

        $this->actingAs($admin)
            ->get(route('admin.crm.dashboard'))
            ->assertForbidden();
    }

    public function test_admin_granted_manage_crm_permission_can_access(): void
    {
        $admin = User::factory()->create(['role' => 'admin', 'is_active' => true]);
        $admin->grantPermission('manage_crm');

        $this->actingAs($admin)
            ->get(route('admin.crm.dashboard'))
            ->assertOk();
    }
}
