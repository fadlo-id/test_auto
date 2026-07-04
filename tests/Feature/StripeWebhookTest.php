<?php

namespace Tests\Feature;

use App\Models\AutoSchool;
use App\Models\Payment;
use App\Models\Plan;
use App\Models\Subscription;
use App\Models\User;
use App\Services\CreditService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

/**
 * Tests the StripeWebhookController by crafting raw event payloads
 * without signature verification (signature check is bypassed via a test-only hook).
 */
class StripeWebhookTest extends TestCase
{
    use RefreshDatabase;

    private AutoSchool $school;
    private Plan $plan;
    private User $owner;

    protected function setUp(): void
    {
        parent::setUp();
        Mail::fake();

        $this->mock(CreditService::class, function ($mock) {
            $mock->shouldReceive('restoreOnRenewal')->andReturn(null);
            $mock->shouldReceive('exhaustAll')->andReturn(null);
            $mock->shouldReceive('cleanOldDedupRecords')->andReturn(0);
        });

        // Bypass Stripe webhook signature verification for tests
        config(['services.stripe.webhook_secret' => null]);
        config(['services.stripe.secret' => null]);

        $this->owner = User::factory()->create(['role' => 'school_owner']);
        $this->school = AutoSchool::factory()->create([
            'user_id' => $this->owner->id,
            'status'  => 'approved',
        ]);
        $this->plan = Plan::factory()->create([
            'name'  => 'Basic',
            'price' => 200.00,
        ]);
    }

    // ── Proration ─────────────────────────────────────────────────────────────

    public function test_proration_formula(): void
    {
        $stripe = new \App\Services\StripeService();

        $sub = new Subscription([
            'plan_id'    => $this->plan->id,
            'started_at' => now()->subDays(10),
            'expires_at' => now()->addDays(20), // 30-day period, 20 remaining
        ]);
        $sub->setRelation('plan', $this->plan);

        $newPlan = Plan::factory()->create(['price' => 500.00]);

        // oldDaily  = 200/30 ≈ 6.67
        // newDaily  = 500/30 ≈ 16.67
        // proration = (16.67 - 6.67) × 20 ≈ 200.00
        $proration = $stripe->calculateProration($sub, $newPlan);

        $this->assertGreaterThan(0, $proration);
        $this->assertLessThan((float)$newPlan->price, $proration);
    }

    public function test_proration_returns_full_price_if_expired(): void
    {
        $stripe = new \App\Services\StripeService();

        $sub = new Subscription([
            'plan_id'    => $this->plan->id,
            'started_at' => now()->subDays(35),
            'expires_at' => now()->subDays(5), // already expired
        ]);
        $sub->setRelation('plan', $this->plan);

        $newPlan = Plan::factory()->create(['price' => 400.00]);

        $proration = $stripe->calculateProration($sub, $newPlan);

        $this->assertEquals(400.00, $proration);
    }

    // ── VAT split ─────────────────────────────────────────────────────────────

    public function test_vat_split_20_percent(): void
    {
        $stripe = new \App\Services\StripeService();
        [$net, $vat] = $stripe->splitVAT(120.0);

        $this->assertEqualsWithDelta(100.0, $net, 0.01);
        $this->assertEqualsWithDelta(20.0,  $vat, 0.01);
    }

    public function test_vat_split_zero_rate(): void
    {
        config(['services.stripe.vat_rate' => 0]);
        $stripe = new \App\Services\StripeService();
        [$net, $vat] = $stripe->splitVAT(100.0);

        $this->assertEquals(100.0, $net);
        $this->assertEquals(0.0,  $vat);
    }

    // ── Payment record helpers ────────────────────────────────────────────────

    public function test_payment_is_fully_refunded(): void
    {
        $payment = Payment::create([
            'auto_school_id'           => $this->school->id,
            'plan_id'                  => $this->plan->id,
            'amount'                   => 100.0,
            'refunded_amount'          => 100.0,
            'status'                   => 'refunded',
            'currency'                 => 'MAD',
            'stripe_payment_intent_id' => 'pi_fully_refunded',
        ]);

        $this->assertTrue($payment->isFullyRefunded());
        $this->assertFalse($payment->isPartiallyRefunded());
        $this->assertEquals(0.0, $payment->remainingRefundable());
    }

    public function test_payment_is_partially_refunded(): void
    {
        $payment = Payment::create([
            'auto_school_id'           => $this->school->id,
            'plan_id'                  => $this->plan->id,
            'amount'                   => 200.0,
            'refunded_amount'          => 80.0,
            'status'                   => 'success',
            'currency'                 => 'MAD',
            'stripe_payment_intent_id' => 'pi_partial_refunded',
        ]);

        $this->assertFalse($payment->isFullyRefunded());
        $this->assertTrue($payment->isPartiallyRefunded());
        $this->assertEqualsWithDelta(120.0, $payment->remainingRefundable(), 0.01);
    }

    // ── Subscription model helpers ────────────────────────────────────────────

    public function test_subscription_is_active(): void
    {
        $sub = Subscription::create([
            'auto_school_id' => $this->school->id,
            'plan_id'        => $this->plan->id,
            'status'         => 'active',
            'started_at'     => now()->subDays(5),
            'expires_at'     => now()->addDays(25),
        ]);

        $this->assertTrue($sub->isActive());
        $this->assertFalse($sub->isPastDue());
    }

    public function test_subscription_mark_past_due(): void
    {
        $sub = Subscription::create([
            'auto_school_id' => $this->school->id,
            'plan_id'        => $this->plan->id,
            'status'         => 'active',
            'started_at'     => now()->subDays(5),
            'expires_at'     => now()->addDays(25),
        ]);

        $sub->markPastDue();
        $sub->refresh();

        $this->assertEquals('past_due', $sub->status);
        $this->assertTrue($sub->isPastDue());
    }

    public function test_subscription_reactivate(): void
    {
        $sub = Subscription::create([
            'auto_school_id'     => $this->school->id,
            'plan_id'            => $this->plan->id,
            'status'             => 'past_due',
            'started_at'         => now()->subDays(5),
            'expires_at'         => now()->addDays(25),
            'payment_retry_count'=> 2,
        ]);

        $sub->reactivate();
        $sub->refresh();

        $this->assertEquals('active', $sub->status);
        $this->assertEquals(0, $sub->payment_retry_count);
    }

    public function test_subscription_schedule_retry_increments(): void
    {
        $sub = Subscription::create([
            'auto_school_id'     => $this->school->id,
            'plan_id'            => $this->plan->id,
            'status'             => 'past_due',
            'started_at'         => now()->subDays(5),
            'expires_at'         => now()->addDays(25),
            'payment_retry_count'=> 0,
        ]);

        $sub->scheduleRetry(3);
        $sub->refresh();

        $this->assertEquals(1, $sub->payment_retry_count);
        $this->assertNotNull($sub->next_payment_retry_at);
        // Should be ~3 days from now
        $this->assertTrue($sub->next_payment_retry_at->greaterThan(now()->addDays(2)));
        $this->assertTrue($sub->next_payment_retry_at->lessThan(now()->addDays(4)));
    }

    public function test_subscription_cancel(): void
    {
        $sub = Subscription::create([
            'auto_school_id' => $this->school->id,
            'plan_id'        => $this->plan->id,
            'status'         => 'active',
            'started_at'     => now()->subDays(5),
            'expires_at'     => now()->addDays(25),
        ]);

        $sub->cancel('test_reason');
        $sub->refresh();

        $this->assertEquals('cancelled', $sub->status);
        $this->assertEquals('test_reason', $sub->cancellation_reason);
        $this->assertNotNull($sub->cancelled_at);
    }

    public function test_subscription_is_in_trial(): void
    {
        $sub = Subscription::create([
            'auto_school_id' => $this->school->id,
            'plan_id'        => $this->plan->id,
            'status'         => 'active',
            'on_trial'       => true,
            'started_at'     => now(),
            'expires_at'     => now()->addDays(14),
            'trial_ends_at'  => now()->addDays(14),
        ]);

        $this->assertTrue($sub->isInTrial());
    }

    public function test_subscription_not_in_trial_if_ended(): void
    {
        $sub = Subscription::create([
            'auto_school_id' => $this->school->id,
            'plan_id'        => $this->plan->id,
            'status'         => 'active',
            'on_trial'       => true,
            'started_at'     => now()->subDays(20),
            'expires_at'     => now()->subDay(),
            'trial_ends_at'  => now()->subDay(), // already ended
        ]);

        $this->assertFalse($sub->isInTrial());
    }

    // ── Check expired command ─────────────────────────────────────────────────

    public function test_check_expired_cancels_normal_subscription(): void
    {
        $sub = Subscription::create([
            'auto_school_id'     => $this->school->id,
            'plan_id'            => $this->plan->id,
            'status'             => 'active',
            'started_at'         => now()->subDays(35),
            'expires_at'         => now()->subDays(2), // expired
            'cancel_at_period_end' => false,
        ]);

        $this->artisan('subscriptions:check-expired')->assertSuccessful();

        $sub->refresh();
        $this->assertEquals('cancelled', $sub->status);
    }

    public function test_check_expired_applies_downgrade(): void
    {
        $basicPlan = Plan::factory()->create(['price' => 100.0, 'billing_period' => 'monthly']);

        $sub = Subscription::create([
            'auto_school_id'      => $this->school->id,
            'plan_id'             => $this->plan->id,
            'status'              => 'active',
            'started_at'          => now()->subDays(35),
            'expires_at'          => now()->subDays(2),
            'cancel_at_period_end'=> true,
            'cancellation_reason' => json_encode(['downgrade_to_plan_id' => $basicPlan->id]),
        ]);

        $this->artisan('subscriptions:check-expired')->assertSuccessful();

        $sub->refresh();
        // After downgrade, status should still be active (new period)
        $this->assertEquals('active', $sub->status);
        $this->assertEquals($basicPlan->id, $sub->plan_id);
        $this->assertNull($sub->cancellation_reason);
        $this->assertFalse((bool)$sub->cancel_at_period_end);
        // Should have a new future expiry
        $this->assertTrue($sub->expires_at->greaterThan(now()));
    }

    /**
     * Regression: the "expiring soon" query used to have no dedup, so a subscription
     * expiring in 7 days matched the query on every one of the ~8 daily runs before
     * expiry, sending a fresh warning email each time instead of once.
     */
    public function test_check_expired_sends_expiring_soon_notification_only_once(): void
    {
        $sub = Subscription::create([
            'auto_school_id' => $this->school->id,
            'plan_id'        => $this->plan->id,
            'status'         => 'active',
            'on_trial'       => false,
            'started_at'     => now()->subDays(23),
            'expires_at'     => now()->addDays(5),
        ]);

        $this->artisan('subscriptions:check-expired')->assertSuccessful();
        $sub->refresh();
        $this->assertNotNull($sub->expiring_soon_notified_at);
        $firstNotifiedAt = $sub->expiring_soon_notified_at;

        // Run again the next day — still within the 7-day window, must NOT re-notify.
        $this->travel(1)->days();
        $this->artisan('subscriptions:check-expired')->assertSuccessful();
        $sub->refresh();

        $this->assertTrue($sub->expiring_soon_notified_at->equalTo($firstNotifiedAt));
    }
}
