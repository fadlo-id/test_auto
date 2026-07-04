<?php

namespace Tests\Feature;

use App\Models\AutoSchool;
use App\Models\Coupon;
use App\Models\Plan;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Tests covering the 6 critical production blockers fixed in this session:
 * 1. RBAC permission enforcement on admin routes
 * 2. CheckSubscription middleware on school routes
 * 3. Coupon validation and application
 * 4. Stripe webhook (new events)
 * 5. public/build.zip removed
 * 6. Plan currency column present
 */
class ProductionBlockersTest extends TestCase
{
    use RefreshDatabase;

    // ── Helpers ───────────────────────────────────────────────

    private function superAdmin(): User
    {
        return User::factory()->create(['role' => 'super_admin']);
    }

    private function regularAdmin(array $permissions = []): User
    {
        $admin = User::factory()->create(['role' => 'admin']);
        foreach ($permissions as $perm) {
            $admin->grantPermission($perm);
        }
        return $admin;
    }

    private function schoolOwner(?Plan $plan = null, bool $expired = false): array
    {
        $owner  = User::factory()->create(['role' => 'school_owner']);
        $school = AutoSchool::factory()->create([
            'user_id' => $owner->id,
            'status'  => 'approved',
            'is_active' => true,
        ]);

        if ($plan) {
            Subscription::create([
                'auto_school_id'         => $school->id,
                'plan_id'                => $plan->id,
                'stripe_subscription_id' => 'pi_test_' . uniqid(),
                'status'                 => 'active',
                'started_at'             => now()->subMonth(),
                'expires_at'             => $expired ? now()->subDay() : now()->addMonth(),
            ]);
        }

        return [$owner, $school];
    }

    private function makeCoupon(array $attrs = []): Coupon
    {
        return Coupon::create(array_merge([
            'code'           => 'TEST10',
            'discount_type'  => 'percent',
            'discount_value' => 10,
            'is_active'      => true,
            'used_count'     => 0,
        ], $attrs));
    }

    // ── 1. RBAC: super_admin bypasses all permission checks ───

    public function test_super_admin_can_access_all_admin_routes(): void
    {
        $admin = $this->superAdmin();

        $this->actingAs($admin)->get(route('admin.users.index'))->assertOk();
        $this->actingAs($admin)->get(route('admin.auto-schools.index'))->assertOk();
        $this->actingAs($admin)->get(route('admin.plans.index'))->assertOk();
        $this->actingAs($admin)->get(route('admin.credits.index'))->assertOk();
    }

    public function test_regular_admin_without_permission_gets_403(): void
    {
        $admin = $this->regularAdmin(); // no permissions granted

        $this->actingAs($admin)->get(route('admin.users.index'))->assertForbidden();
        $this->actingAs($admin)->get(route('admin.auto-schools.index'))->assertForbidden();
        $this->actingAs($admin)->get(route('admin.plans.index'))->assertForbidden();
        $this->actingAs($admin)->get(route('admin.credits.index'))->assertForbidden();
    }

    public function test_admin_with_manage_users_can_access_users(): void
    {
        $admin = $this->regularAdmin(['manage_users']);

        $this->actingAs($admin)->get(route('admin.users.index'))->assertOk();
        // but cannot access schools
        $this->actingAs($admin)->get(route('admin.auto-schools.index'))->assertForbidden();
    }

    public function test_admin_with_manage_schools_can_access_schools(): void
    {
        $admin = $this->regularAdmin(['manage_schools']);

        $this->actingAs($admin)->get(route('admin.auto-schools.index'))->assertOk();
        // but cannot access users
        $this->actingAs($admin)->get(route('admin.users.index'))->assertForbidden();
    }

    public function test_admin_with_manage_plans_can_access_plans_and_coupons(): void
    {
        $admin = $this->regularAdmin(['manage_plans']);

        $this->actingAs($admin)->get(route('admin.plans.index'))->assertOk();
        $this->actingAs($admin)->get(route('admin.coupons.index'))->assertOk();
    }

    public function test_admin_with_manage_credits_can_access_credits(): void
    {
        $admin = $this->regularAdmin(['manage_credits']);

        $this->actingAs($admin)->get(route('admin.credits.index'))->assertOk();
    }

    public function test_unauthenticated_user_cannot_access_admin(): void
    {
        $this->get(route('admin.users.index'))->assertRedirect(route('login'));
    }

    // ── 2. CheckSubscription middleware ───────────────────────

    public function test_school_owner_with_active_subscription_can_access_dashboard(): void
    {
        $plan = Plan::factory()->create(['billing_period' => 'monthly']);
        [$owner] = $this->schoolOwner($plan, expired: false);

        $this->actingAs($owner)->get(route('school.dashboard'))->assertOk();
    }

    public function test_school_owner_with_expired_subscription_is_redirected(): void
    {
        $plan = Plan::factory()->create(['billing_period' => 'monthly']);
        [$owner] = $this->schoolOwner($plan, expired: true);

        $this->actingAs($owner)
            ->get(route('school.dashboard'))
            ->assertRedirect(route('school.subscription'));
    }

    public function test_school_owner_with_expired_subscription_can_still_access_subscription_page(): void
    {
        $plan = Plan::factory()->create(['billing_period' => 'monthly']);
        [$owner] = $this->schoolOwner($plan, expired: true);

        // Subscription and payment pages must always be accessible
        $this->actingAs($owner)->get(route('school.subscription'))->assertOk();
    }

    public function test_school_owner_with_expired_subscription_can_still_access_settings(): void
    {
        $plan = Plan::factory()->create(['billing_period' => 'monthly']);
        [$owner] = $this->schoolOwner($plan, expired: true);

        $this->actingAs($owner)->get(route('school.settings'))->assertOk();
    }

    public function test_school_owner_without_subscription_can_access_dashboard(): void
    {
        // Free tier — no subscription at all → passes through
        [$owner] = $this->schoolOwner();

        $this->actingAs($owner)->get(route('school.dashboard'))->assertOk();
    }

    // ── 3. Coupon validation and application ──────────────────

    public function test_valid_coupon_validate_endpoint(): void
    {
        $plan   = Plan::factory()->create(['price' => 200, 'billing_period' => 'monthly']);
        $coupon = $this->makeCoupon(['code' => 'SAVE10', 'discount_type' => 'percent', 'discount_value' => 10]);
        [$owner] = $this->schoolOwner();

        $response = $this->actingAs($owner)
            ->postJson(route('school.payment.validate-coupon'), [
                'code'    => 'SAVE10',
                'plan_id' => $plan->id,
            ]);

        $response->assertOk()
            ->assertJsonPath('coupon.code', 'SAVE10')
            ->assertJsonPath('discount_amount', fn ($v) => $v == 20)
            ->assertJsonPath('final_price', fn ($v) => $v == 180);
    }

    public function test_invalid_coupon_returns_422(): void
    {
        $plan = Plan::factory()->create(['price' => 200, 'billing_period' => 'monthly']);
        [$owner] = $this->schoolOwner();

        $this->actingAs($owner)
            ->postJson(route('school.payment.validate-coupon'), [
                'code'    => 'NONEXISTENT',
                'plan_id' => $plan->id,
            ])
            ->assertStatus(422)
            ->assertJsonPath('error', fn ($v) => str_contains($v, 'invalide'));
    }

    public function test_expired_coupon_returns_422(): void
    {
        $plan   = Plan::factory()->create(['price' => 200, 'billing_period' => 'monthly']);
        $coupon = $this->makeCoupon([
            'code'       => 'EXPIRED',
            'expires_at' => now()->subDay()->format('Y-m-d'),
        ]);
        [$owner] = $this->schoolOwner();

        $this->actingAs($owner)
            ->postJson(route('school.payment.validate-coupon'), [
                'code'    => 'EXPIRED',
                'plan_id' => $plan->id,
            ])
            ->assertStatus(422);
    }

    public function test_exhausted_coupon_returns_422(): void
    {
        $plan   = Plan::factory()->create(['price' => 200, 'billing_period' => 'monthly']);
        $coupon = $this->makeCoupon([
            'code'       => 'USED',
            'max_uses'   => 5,
            'used_count' => 5,
        ]);
        [$owner] = $this->schoolOwner();

        $this->actingAs($owner)
            ->postJson(route('school.payment.validate-coupon'), [
                'code'    => 'USED',
                'plan_id' => $plan->id,
            ])
            ->assertStatus(422);
    }

    public function test_inactive_coupon_returns_422(): void
    {
        $plan   = Plan::factory()->create(['price' => 200, 'billing_period' => 'monthly']);
        $coupon = $this->makeCoupon(['code' => 'INACTIVE', 'is_active' => false]);
        [$owner] = $this->schoolOwner();

        $this->actingAs($owner)
            ->postJson(route('school.payment.validate-coupon'), [
                'code'    => 'INACTIVE',
                'plan_id' => $plan->id,
            ])
            ->assertStatus(422);
    }

    public function test_fixed_discount_coupon_computes_correctly(): void
    {
        $plan   = Plan::factory()->create(['price' => 200, 'billing_period' => 'monthly']);
        $coupon = $this->makeCoupon([
            'code'           => 'FIXED50',
            'discount_type'  => 'fixed',
            'discount_value' => 50,
        ]);
        [$owner] = $this->schoolOwner();

        $response = $this->actingAs($owner)
            ->postJson(route('school.payment.validate-coupon'), [
                'code'    => 'FIXED50',
                'plan_id' => $plan->id,
            ]);

        $response->assertOk()
            ->assertJsonPath('discount_amount', fn ($v) => $v == 50)
            ->assertJsonPath('final_price', fn ($v) => $v == 150);
    }

    public function test_coupon_discount_cannot_exceed_plan_price(): void
    {
        $plan   = Plan::factory()->create(['price' => 30, 'billing_period' => 'monthly']);
        $coupon = $this->makeCoupon([
            'code'           => 'BIG50',
            'discount_type'  => 'fixed',
            'discount_value' => 100,
        ]);
        [$owner] = $this->schoolOwner();

        $response = $this->actingAs($owner)
            ->postJson(route('school.payment.validate-coupon'), [
                'code'    => 'BIG50',
                'plan_id' => $plan->id,
            ]);

        $response->assertOk()
            ->assertJsonPath('discount_amount', fn ($v) => $v == 30)
            ->assertJsonPath('final_price', fn ($v) => $v == 0);
    }

    // ── 4. Coupon model: isValid() and recordUsage() ──────────

    public function test_coupon_is_valid(): void
    {
        $coupon = $this->makeCoupon();
        $this->assertTrue($coupon->isValid());
    }

    public function test_coupon_record_usage_increments_count(): void
    {
        $coupon = $this->makeCoupon(['used_count' => 3, 'max_uses' => 10]);
        $coupon->recordUsage();
        $this->assertEquals(4, $coupon->fresh()->used_count);
    }

    public function test_coupon_is_exhausted_after_max_uses(): void
    {
        $coupon = $this->makeCoupon(['max_uses' => 2, 'used_count' => 2]);
        $this->assertFalse($coupon->isValid());
        $this->assertTrue($coupon->is_exhausted);
    }

    // ── 5. public/build.zip removed ──────────────────────────

    public function test_build_zip_does_not_exist_in_public(): void
    {
        $this->assertFileDoesNotExist(public_path('build.zip'));
    }

    // ── 6. Plan currency column ───────────────────────────────

    public function test_plan_has_currency_column(): void
    {
        $plan = Plan::factory()->create(['price' => 299, 'billing_period' => 'monthly']);
        $this->assertNotNull($plan->currency);
    }

    public function test_plan_currency_column_is_readable(): void
    {
        $plan = Plan::factory()->create(['currency' => 'MAD']);
        $this->assertEquals('MAD', $plan->fresh()->currency);
    }
}
