<?php

namespace Tests\Feature;

use App\Models\Role;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * The dedicated "Journal d'audit" admin page was removed (2026-07-30 nav simplification),
 * but AuditLog::record() is still called throughout RolesController/AdminsController for
 * compliance — this covers that the writes still happen correctly.
 */
class AuditLogRecordingTest extends TestCase
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
}
