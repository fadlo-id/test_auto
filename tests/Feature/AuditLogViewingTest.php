<?php

namespace Tests\Feature;

use App\Models\AuditLog;
use App\Models\Role;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuditLogViewingTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolesAndPermissionsSeeder::class);
    }

    private function superAdmin(): User
    {
        return User::factory()->create(['role' => 'super_admin', 'is_active' => true]);
    }

    private function admin(): User
    {
        $role = Role::where('name', 'admin')->firstOrFail();
        return User::factory()->create(['role' => 'admin', 'role_id' => $role->id, 'is_active' => true]);
    }

    public function test_super_admin_can_view_audit_logs(): void
    {
        $sa = $this->superAdmin();
        AuditLog::record('admin.created', $sa, ['name' => 'Test']);

        $this->actingAs($sa)
            ->get(route('admin.audit-logs.index'))
            ->assertOk()
            ->assertInertia(fn ($p) => $p->component('Admin/AuditLogs'));
    }

    public function test_regular_admin_cannot_view_audit_logs(): void
    {
        $admin = $this->admin();

        $this->actingAs($admin)
            ->get(route('admin.audit-logs.index'))
            ->assertForbidden();
    }

    public function test_audit_log_is_recorded_when_role_permissions_change(): void
    {
        $sa      = $this->superAdmin();
        $support = Role::where('name', 'support')->firstOrFail();

        $this->actingAs($sa)->put(route('admin.roles.permissions.update', $support), [
            'permissions' => ['manage_crm'],
        ]);

        $this->assertDatabaseHas('audit_logs', [
            'action'       => 'rbac.role_permissions_updated',
            'subject_type' => Role::class,
            'subject_id'   => $support->id,
        ]);
    }

    public function test_audit_logs_can_be_filtered_by_action(): void
    {
        $sa = $this->superAdmin();
        AuditLog::record('admin.created', $sa);
        AuditLog::record('admin.suspended', $sa);

        $response = $this->actingAs($sa)
            ->get(route('admin.audit-logs.index', ['action' => 'suspended']));

        $response->assertOk()->assertInertia(fn ($p) => $p
            ->component('Admin/AuditLogs')
            ->where('logs.total', 1)
        );
    }
}
