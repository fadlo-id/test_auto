<?php

namespace Tests\Feature;

use App\Models\Role;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Exhaustive sweep of every `permission:<key>` route group in routes/web.php.
 *
 * This exists specifically to catch the regression class found during the
 * 2026-07-04 audit: RolesAndPermissionsSeeder used to sync the FULL permission
 * catalog onto the `admin` tier Role, so any admin-tier user passed every
 * `permission:*` middleware regardless of what was (not) individually granted
 * to them — the granular permission UI was completely decorative. This test
 * asserts, for one representative route per permission key, that an
 * admin-tier user with ZERO permissions is blocked, and is let in only once
 * that specific permission is individually granted.
 */
class PermissionLeakTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolesAndPermissionsSeeder::class);
    }

    private function bareAdmin(): User
    {
        $role = Role::where('name', 'admin')->firstOrFail();

        return User::factory()->create(['role' => 'admin', 'role_id' => $role->id, 'is_active' => true]);
    }

    public static function permissionGatedRoutes(): array
    {
        return [
            'manage_users'         => ['manage_users', 'admin.users.index'],
            'manage_schools'       => ['manage_schools', 'admin.auto-schools.index'],
            'manage_reviews'       => ['manage_reviews', 'admin.reviews.index'],
            'manage_payments'      => ['manage_payments', 'admin.payments.index'],
            'manage_subscriptions' => ['manage_subscriptions', 'admin.subscriptions.index'],
            'manage_categories'    => ['manage_categories', 'admin.categories.index'],
            'manage_plans'         => ['manage_plans', 'admin.plans.index'],
            'manage_analytics'     => ['manage_analytics', 'admin.analytics'],
            'manage_contacts'      => ['manage_contacts', 'admin.contact-requests.index'],
            'manage_reports'       => ['manage_reports', 'admin.reports'],
            'manage_logs'          => ['manage_logs', 'admin.logs'],
            'manage_settings'      => ['manage_settings', 'admin.settings'],
            'manage_newsletter'    => ['manage_newsletter', 'admin.newsletter.index'],
            'manage_credits'       => ['manage_credits', 'admin.credits.index'],
            'manage_crm'           => ['manage_crm', 'admin.crm.dashboard'],
        ];
    }

    /** @dataProvider permissionGatedRoutes */
    public function test_bare_admin_tier_user_is_blocked_without_the_specific_permission(string $permission, string $routeName): void
    {
        $admin = $this->bareAdmin();

        $response = $this->actingAs($admin)->get(route($routeName));

        $this->assertContains($response->getStatusCode(), [403, 404], "Expected {$routeName} to reject an admin-tier user with zero permissions (got {$response->getStatusCode()}).");
    }

    /** @dataProvider permissionGatedRoutes */
    public function test_admin_tier_user_is_allowed_once_the_specific_permission_is_granted(string $permission, string $routeName): void
    {
        $admin = $this->bareAdmin();
        $admin->syncPermissions([$permission]);

        $response = $this->actingAs($admin)->get(route($routeName));

        $this->assertSame(200, $response->getStatusCode(), "Expected {$routeName} to accept an admin granted '{$permission}' (got {$response->getStatusCode()}).");
    }

    /** @dataProvider permissionGatedRoutes */
    public function test_super_admin_bypasses_every_permission_gate(string $permission, string $routeName): void
    {
        $role = Role::where('name', 'super_admin')->firstOrFail();
        $superAdmin = User::factory()->create(['role' => 'super_admin', 'role_id' => $role->id, 'is_active' => true]);

        $response = $this->actingAs($superAdmin)->get(route($routeName));

        $this->assertSame(200, $response->getStatusCode(), "Expected {$routeName} to accept super_admin (got {$response->getStatusCode()}).");
    }

    public function test_plain_user_role_cannot_reach_any_admin_route(): void
    {
        $user = User::factory()->create(['role' => 'user']);

        $response = $this->actingAs($user)->get(route('admin.dashboard'));

        $this->assertContains($response->getStatusCode(), [403, 404]);
    }

    // ── School-owner middleware must not admit plain admin-tier staff (regression: ──
    // SchoolOwnerMiddleware used to also allow `$user->isAdmin()` through, meaning any
    // admin/support/moderator account could reach every /school/* route, including
    // billing and payment-intent creation. ──────────────────────────────────────────

    public function test_admin_tier_user_cannot_reach_school_owner_routes(): void
    {
        $admin = $this->bareAdmin();

        $response = $this->actingAs($admin)->get(route('school.settings'));

        $this->assertSame(403, $response->getStatusCode());
    }
}
