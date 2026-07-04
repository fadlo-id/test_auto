<?php

namespace Tests\Feature;

use App\Models\AutoSchool;
use App\Models\Payment;
use App\Models\Plan;
use App\Models\Subscription;
use App\Models\User;
use App\Services\CreditService;
use App\Services\SubscriptionService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class SubscriptionLifecycleTest extends TestCase
{
    use RefreshDatabase;

    private SubscriptionService $service;
    private AutoSchool $school;
    private User $owner;
    private Plan $plan;
    private Plan $premiumPlan;

    protected function setUp(): void
    {
        parent::setUp();
        Mail::fake();

        $this->mock(CreditService::class, function ($mock) {
            $mock->shouldReceive('restoreOnRenewal')->andReturn(null);
            $mock->shouldReceive('exhaustAll')->andReturn(null);
            $mock->shouldReceive('cleanOldDedupRecords')->andReturn(0);
        });

        $this->service = app(SubscriptionService::class);

        $this->owner = User::factory()->create(['role' => 'school_owner']);
        $this->school = AutoSchool::factory()->create([
            'user_id' => $this->owner->id,
            'status'  => 'approved',
        ]);
        $this->plan = Plan::factory()->create([
            'name'           => 'Basic',
            'price'          => 200.00,
            'billing_period' => 'monthly',
            'trial_days'     => 0,
            'is_active'      => true,
        ]);
        $this->premiumPlan = Plan::factory()->create([
            'name'           => 'Premium',
            'price'          => 500.00,
            'billing_period' => 'monthly',
            'trial_days'     => 0,
            'is_active'      => true,
        ]);
    }

    // ── Create ────────────────────────────────────────────────────────────────

    public function test_create_subscription_sets_correct_dates(): void
    {
        $sub = $this->service->createSubscription($this->school, $this->plan, 'pi_test_123');

        $this->assertDatabaseHas('subscriptions', [
            'auto_school_id' => $this->school->id,
            'plan_id'        => $this->plan->id,
            'status'         => 'active',
            'on_trial'       => false,
        ]);

        $this->assertTrue($sub->expires_at->greaterThan(now()->addDays(25)));
        $this->assertTrue($sub->expires_at->lessThan(now()->addDays(35)));
    }

    public function test_create_subscription_cancels_previous(): void
    {
        $old = Subscription::create([
            'auto_school_id' => $this->school->id,
            'plan_id'        => $this->plan->id,
            'status'         => 'active',
            'started_at'     => now()->subMonth(),
            'expires_at'     => now()->addMonth(),
        ]);

        $this->service->createSubscription($this->school, $this->premiumPlan, 'pi_test_456');

        $old->refresh();
        $this->assertEquals('cancelled', $old->status);
        $this->assertEquals('replaced', $old->cancellation_reason);
    }

    // ── Trial ─────────────────────────────────────────────────────────────────

    public function test_create_trial_subscription(): void
    {
        $trialPlan = Plan::factory()->create([
            'name'           => 'Trial Plan',
            'price'          => 200.00,
            'billing_period' => 'monthly',
            'trial_days'     => 14,
            'is_active'      => true,
        ]);

        $sub = $this->service->createTrialSubscription($this->school, $trialPlan);

        $this->assertTrue($sub->on_trial);
        $this->assertNotNull($sub->trial_ends_at);
        $this->assertTrue($sub->trial_ends_at->greaterThan(now()->addDays(13)));
        $this->assertEquals('active', $sub->status);
    }

    public function test_trial_not_allowed_twice(): void
    {
        $trialPlan = Plan::factory()->create([
            'name'       => 'Trial',
            'price'      => 100.00,
            'trial_days' => 7,
            'is_active'  => true,
        ]);

        // First subscription — would have trial
        Subscription::create([
            'auto_school_id' => $this->school->id,
            'plan_id'        => $trialPlan->id,
            'status'         => 'cancelled',
            'on_trial'       => true,
            'trial_ends_at'  => now()->subDay(),
            'started_at'     => now()->subMonth(),
            'expires_at'     => now()->subDay(),
        ]);

        // Create again via createSubscription (uses hasTrial internally)
        $sub = $this->service->createSubscription($this->school, $trialPlan, 'pi_new');

        // Should not be on trial again
        $this->assertFalse((bool)$sub->on_trial);
        $this->assertNull($sub->trial_ends_at);
    }

    // ── Upgrade ───────────────────────────────────────────────────────────────

    public function test_upgrade_changes_plan_keeps_expiry(): void
    {
        $expiry = now()->addDays(20);
        $sub = Subscription::create([
            'auto_school_id' => $this->school->id,
            'plan_id'        => $this->plan->id,
            'status'         => 'active',
            'started_at'     => now()->subDays(10),
            'expires_at'     => $expiry,
        ]);

        $payment = Payment::create([
            'auto_school_id'           => $this->school->id,
            'plan_id'                  => $this->premiumPlan->id,
            'amount'                   => 150.00,
            'status'                   => 'success',
            'currency'                 => 'MAD',
            'stripe_payment_intent_id' => 'pi_upgrade_test',
            'payment_type'             => 'upgrade',
            'paid_at'                  => now(),
        ]);

        $updated = $this->service->upgrade($this->school, $this->premiumPlan, $payment);

        $this->assertEquals($this->premiumPlan->id, $updated->plan_id);
        $this->assertEquals($expiry->toDateString(), $updated->expires_at->toDateString());
        $this->assertFalse((bool)$updated->on_trial);
    }

    public function test_upgrade_throws_when_no_active_subscription(): void
    {
        $this->expectException(\RuntimeException::class);
        $payment = Payment::create([
            'auto_school_id'           => $this->school->id,
            'plan_id'                  => $this->premiumPlan->id,
            'amount'                   => 100.00,
            'status'                   => 'success',
            'currency'                 => 'MAD',
            'stripe_payment_intent_id' => 'pi_no_sub',
            'paid_at'                  => now(),
        ]);
        $this->service->upgrade($this->school, $this->premiumPlan, $payment);
    }

    // ── Downgrade ──────────────────────────────────────────────────────────────

    public function test_schedule_downgrade_sets_cancel_at_period_end(): void
    {
        $sub = Subscription::create([
            'auto_school_id' => $this->school->id,
            'plan_id'        => $this->premiumPlan->id,
            'status'         => 'active',
            'started_at'     => now()->subDays(5),
            'expires_at'     => now()->addDays(25),
        ]);

        $this->service->scheduleDowngrade($this->school, $this->plan);

        $sub->refresh();
        $this->assertTrue((bool)$sub->cancel_at_period_end);

        $data = json_decode($sub->cancellation_reason, true);
        $this->assertEquals($this->plan->id, $data['downgrade_to_plan_id']);
    }

    public function test_schedule_downgrade_throws_without_active_sub(): void
    {
        $this->expectException(\RuntimeException::class);
        $this->service->scheduleDowngrade($this->school, $this->plan);
    }

    // ── Cancel ────────────────────────────────────────────────────────────────

    public function test_cancel_subscription(): void
    {
        $sub = Subscription::create([
            'auto_school_id' => $this->school->id,
            'plan_id'        => $this->plan->id,
            'status'         => 'active',
            'started_at'     => now()->subDays(5),
            'expires_at'     => now()->addDays(25),
        ]);

        $this->service->cancelSubscription($sub, 'Test cancel');

        $sub->refresh();
        $this->assertEquals('cancelled', $sub->status);
        $this->assertEquals('Test cancel', $sub->cancellation_reason);
    }

    // ── Payment retry ─────────────────────────────────────────────────────────

    public function test_schedule_payment_retry_increments_count(): void
    {
        $sub = Subscription::create([
            'auto_school_id'     => $this->school->id,
            'plan_id'            => $this->plan->id,
            'status'             => 'past_due',
            'started_at'         => now()->subDays(5),
            'expires_at'         => now()->addDays(25),
            'payment_retry_count'=> 0,
        ]);

        $result = $this->service->schedulePaymentRetry($sub);

        $this->assertTrue($result);
        $sub->refresh();
        $this->assertEquals(1, $sub->payment_retry_count);
        $this->assertNotNull($sub->next_payment_retry_at);
    }

    public function test_schedule_payment_retry_cancels_after_max(): void
    {
        $sub = Subscription::create([
            'auto_school_id'     => $this->school->id,
            'plan_id'            => $this->plan->id,
            'status'             => 'past_due',
            'started_at'         => now()->subDays(5),
            'expires_at'         => now()->addDays(25),
            'payment_retry_count'=> 3,
        ]);

        $result = $this->service->schedulePaymentRetry($sub);

        $this->assertFalse($result);
        $sub->refresh();
        $this->assertEquals('cancelled', $sub->status);
        $this->assertEquals('payment_failed_max_retries', $sub->cancellation_reason);
    }
}
