<?php

namespace Tests\Feature;

use App\Models\AutoSchool;
use App\Models\Plan;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SubscriptionTest extends TestCase
{
    use RefreshDatabase;

    private function schoolOwner(): User
    {
        return User::factory()->create(['role' => 'school_owner']);
    }

    private function ownerWithSchool(): array
    {
        $owner  = $this->schoolOwner();
        $school = AutoSchool::factory()->create([
            'user_id'  => $owner->id,
            'status'   => 'approved',
            'is_active' => true,
        ]);
        return [$owner, $school];
    }

    private function plan(): Plan
    {
        return Plan::factory()->create(['price' => 299, 'billing_period' => 'monthly', 'is_active' => true]);
    }

    // Subscription index page
    public function test_subscription_page_renders(): void
    {
        [$owner] = $this->ownerWithSchool();

        $this->actingAs($owner)
            ->get(route('school.subscription'))
            ->assertOk()
            ->assertInertia(fn ($p) => $p->component('SchoolDashboard/Subscription'));
    }

    // Cancel subscription
    public function test_owner_can_cancel_active_subscription(): void
    {
        [$owner, $school] = $this->ownerWithSchool();
        $plan = $this->plan();

        $sub = Subscription::create([
            'auto_school_id'         => $school->id,
            'plan_id'                => $plan->id,
            'stripe_subscription_id' => 'pi_test_123',
            'status'                 => 'active',
            'started_at'             => now(),
            'expires_at'             => now()->addMonth(),
        ]);

        $this->actingAs($owner)
            ->post(route('school.subscription.cancel'))
            ->assertRedirect();

        $this->assertDatabaseHas('subscriptions', ['id' => $sub->id, 'status' => 'cancelled']);
    }

    public function test_owner_cannot_cancel_when_no_active_subscription(): void
    {
        [$owner] = $this->ownerWithSchool();

        $this->actingAs($owner)
            ->post(route('school.subscription.cancel'))
            ->assertRedirect();
        // Should redirect back with error flash, not throw
    }

    // Payment intent (Stripe not configured — should return 422)
    public function test_payment_intent_fails_without_stripe_key(): void
    {
        [$owner] = $this->ownerWithSchool();
        $plan = $this->plan();

        config(['services.stripe.secret' => null]);

        $this->actingAs($owner)
            ->postJson(route('school.payment.intent'), ['plan_id' => $plan->id])
            ->assertStatus(422);
    }

    // Payment success (idempotent)
    public function test_payment_success_redirects_to_subscription(): void
    {
        [$owner] = $this->ownerWithSchool();

        $this->actingAs($owner)
            ->get(route('school.payment.success'))
            ->assertRedirect(route('school.subscription'));
    }

    // Subscription model
    public function test_subscription_is_active_returns_false_when_expired(): void
    {
        [$owner, $school] = $this->ownerWithSchool();
        $plan = $this->plan();

        $sub = Subscription::create([
            'auto_school_id'         => $school->id,
            'plan_id'                => $plan->id,
            'stripe_subscription_id' => 'pi_test_456',
            'status'                 => 'active',
            'started_at'             => now()->subMonth()->subDay(),
            'expires_at'             => now()->subDay(),
        ]);

        $this->assertFalse($sub->isActive());
    }

    public function test_subscription_cancel_method_works(): void
    {
        [$owner, $school] = $this->ownerWithSchool();
        $plan = $this->plan();

        $sub = Subscription::create([
            'auto_school_id'         => $school->id,
            'plan_id'                => $plan->id,
            'stripe_subscription_id' => 'pi_test_789',
            'status'                 => 'active',
            'started_at'             => now(),
            'expires_at'             => now()->addMonth(),
        ]);

        $sub->cancel('test reason');

        $this->assertEquals('cancelled', $sub->fresh()->status);
        $this->assertEquals('test reason', $sub->fresh()->cancellation_reason);
    }
}
