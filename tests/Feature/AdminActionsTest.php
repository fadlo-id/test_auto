<?php

namespace Tests\Feature;

use App\Models\AutoSchool;
use App\Models\Plan;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminActionsTest extends TestCase
{
    use RefreshDatabase;

    private function admin(): User
    {
        return User::factory()->create(['role' => 'super_admin']);
    }

    private function pendingSchool(): AutoSchool
    {
        $owner = User::factory()->create(['role' => 'school_owner']);
        return AutoSchool::factory()->create(['user_id' => $owner->id, 'status' => 'pending', 'is_active' => false]);
    }

    // Dashboard
    public function test_admin_dashboard_renders(): void
    {
        $this->actingAs($this->admin())
            ->get(route('admin.dashboard'))
            ->assertOk()
            ->assertInertia(fn ($p) => $p->component('Admin/Dashboard'));
    }

    // Schools approval
    public function test_admin_can_approve_school(): void
    {
        $school = $this->pendingSchool();

        $this->actingAs($this->admin())
            ->post(route('admin.auto-schools.approve', $school->id))
            ->assertRedirect();

        $this->assertDatabaseHas('auto_schools', ['id' => $school->id, 'status' => 'approved', 'is_active' => true]);
    }

    public function test_admin_can_reject_school(): void
    {
        $school = $this->pendingSchool();

        $this->actingAs($this->admin())
            ->post(route('admin.auto-schools.reject', $school->id), ['reason' => 'Documents incomplets.'])
            ->assertRedirect();

        $this->assertDatabaseHas('auto_schools', ['id' => $school->id, 'status' => 'rejected']);
    }

    public function test_admin_can_delete_school(): void
    {
        $school = $this->pendingSchool();

        $this->actingAs($this->admin())
            ->delete(route('admin.auto-schools.destroy', $school->id))
            ->assertRedirect();

        $this->assertSoftDeleted('auto_schools', ['id' => $school->id]);
    }

    // Users
    public function test_admin_users_page_renders(): void
    {
        $this->actingAs($this->admin())
            ->get(route('admin.users.index'))
            ->assertOk()
            ->assertInertia(fn ($p) => $p->component('Admin/Users'));
    }

    public function test_admin_can_ban_user(): void
    {
        $user = User::factory()->create(['role' => 'user', 'is_active' => true]);

        $this->actingAs($this->admin())
            ->post(route('admin.users.ban', $user->id))
            ->assertRedirect();

        $this->assertDatabaseHas('users', ['id' => $user->id, 'is_active' => false]);
    }

    public function test_admin_cannot_deactivate_another_admin(): void
    {
        $targetAdmin = User::factory()->create(['role' => 'admin', 'is_active' => true]);

        $this->actingAs($this->admin())
            ->post(route('admin.users.deactivate', $targetAdmin->id))
            ->assertRedirect();

        $this->assertDatabaseHas('users', ['id' => $targetAdmin->id, 'is_active' => true]);
    }

    public function test_admin_cannot_unban_another_admin_to_bypass_status(): void
    {
        $targetAdmin = User::factory()->create(['role' => 'admin', 'is_active' => false, 'status' => 1]);

        $this->actingAs($this->admin())
            ->post(route('admin.users.unban', $targetAdmin->id))
            ->assertRedirect();

        $this->assertDatabaseHas('users', ['id' => $targetAdmin->id, 'is_active' => false, 'status' => 1]);
    }

    public function test_admin_can_deactivate_regular_user(): void
    {
        $user = User::factory()->create(['role' => 'user', 'is_active' => true]);

        $this->actingAs($this->admin())
            ->post(route('admin.users.deactivate', $user->id))
            ->assertRedirect();

        $this->assertDatabaseHas('users', ['id' => $user->id, 'is_active' => false]);
    }

    // Non-admin blocked
    public function test_regular_user_cannot_access_admin(): void
    {
        $user = User::factory()->create(['role' => 'user']);

        $this->actingAs($user)
            ->get(route('admin.dashboard'))
            ->assertForbidden();
    }

    // Subscriptions cancel
    public function test_admin_can_cancel_subscription(): void
    {
        $plan   = Plan::factory()->create(['billing_period' => 'monthly']);
        $owner  = User::factory()->create(['role' => 'school_owner']);
        $school = AutoSchool::factory()->create(['user_id' => $owner->id, 'status' => 'approved', 'is_active' => true]);
        $sub    = Subscription::create([
            'auto_school_id'         => $school->id,
            'plan_id'                => $plan->id,
            'stripe_subscription_id' => 'pi_admin_test',
            'status'                 => 'active',
            'started_at'             => now(),
            'expires_at'             => now()->addMonth(),
        ]);

        $this->actingAs($this->admin())
            ->post(route('admin.subscriptions.cancel', $sub->id))
            ->assertRedirect();

        $this->assertDatabaseHas('subscriptions', ['id' => $sub->id, 'status' => 'cancelled']);
    }

    // Analytics
    public function test_admin_analytics_page_renders(): void
    {
        $this->actingAs($this->admin())
            ->get(route('admin.analytics'))
            ->assertOk();
    }
}
