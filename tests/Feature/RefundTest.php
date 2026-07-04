<?php

namespace Tests\Feature;

use App\Models\AutoSchool;
use App\Models\Payment;
use App\Models\Plan;
use App\Models\Subscription;
use App\Models\User;
use App\Services\RefundService;
use App\Services\StripeService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Stripe\Refund as StripeRefund;
use Tests\TestCase;

class RefundTest extends TestCase
{
    use RefreshDatabase;

    private AutoSchool $school;
    private User $admin;
    private User $owner;
    private Plan $plan;
    private Payment $payment;
    private Subscription $subscription;

    protected function setUp(): void
    {
        parent::setUp();
        Mail::fake();

        $this->owner = User::factory()->create(['role' => 'school_owner']);
        $this->admin = User::factory()->create(['role' => 'super_admin']);

        $this->school = AutoSchool::factory()->create([
            'user_id' => $this->owner->id,
            'status'  => 'approved',
        ]);

        $this->plan = Plan::factory()->create([
            'name'  => 'Basic',
            'price' => 300.00,
        ]);

        $this->payment = Payment::create([
            'auto_school_id'           => $this->school->id,
            'plan_id'                  => $this->plan->id,
            'amount'                   => 300.00,
            'status'                   => 'success',
            'currency'                 => 'MAD',
            'stripe_payment_intent_id' => 'pi_test_refund_' . uniqid(),
            'refunded_amount'          => 0,
            'paid_at'                  => now(),
        ]);

        $this->subscription = Subscription::create([
            'auto_school_id' => $this->school->id,
            'plan_id'        => $this->plan->id,
            'status'         => 'active',
            'started_at'     => now()->subDays(5),
            'expires_at'     => now()->addDays(25),
        ]);

        $this->payment->update(['subscription_id' => $this->subscription->id]);
    }

    private function mockStripeRefund(string $refundId = 're_test_mock'): void
    {
        // StripeRefund passes $id via constructor; cannot use __set('id')
        $mockRefund = new StripeRefund($refundId);

        $this->mock(StripeService::class, function ($mock) use ($mockRefund) {
            $mock->shouldReceive('refundPayment')->andReturn($mockRefund);
        });
    }

    // ── Service tests ─────────────────────────────────────────────────────────

    public function test_full_refund_marks_payment_refunded(): void
    {
        $this->mockStripeRefund();

        $service = app(RefundService::class);
        $result  = $service->refund($this->payment, 300.00, 'Test refund');

        $this->payment->refresh();
        $this->assertEquals('refunded', $this->payment->status);
        $this->assertEquals(300.00, (float)$this->payment->refunded_amount);
        $this->assertTrue($result['fully_refunded']);
    }

    public function test_full_refund_cancels_subscription(): void
    {
        $this->mockStripeRefund();

        $service = app(RefundService::class);
        $service->refund($this->payment, 300.00, 'Test');

        $this->subscription->refresh();
        $this->assertEquals('cancelled', $this->subscription->status);
        $this->assertEquals('refunded', $this->subscription->cancellation_reason);
    }

    public function test_partial_refund_keeps_payment_status(): void
    {
        $this->mockStripeRefund('re_partial');

        $service = app(RefundService::class);
        $result  = $service->refund($this->payment, 100.00, 'Partial refund');

        $this->payment->refresh();
        $this->assertEquals('success', $this->payment->status);
        $this->assertEquals(100.00, (float)$this->payment->refunded_amount);
        $this->assertFalse($result['fully_refunded']);
    }

    public function test_partial_refund_does_not_cancel_subscription(): void
    {
        $this->mockStripeRefund();

        $service = app(RefundService::class);
        $service->refund($this->payment, 50.00, 'Partial');

        $this->subscription->refresh();
        $this->assertEquals('active', $this->subscription->status);
    }

    public function test_refund_exceeds_remaining_throws(): void
    {
        $this->expectException(\RuntimeException::class);
        $this->expectExceptionMessageMatches('/montant/i');

        $this->mockStripeRefund();
        $service = app(RefundService::class);
        $service->refund($this->payment, 999.00, 'Too much');
    }

    public function test_refund_without_stripe_id_throws(): void
    {
        $this->expectException(\RuntimeException::class);

        $this->payment->update(['stripe_payment_intent_id' => null]);

        $service = app(RefundService::class);
        $service->refund($this->payment, 100.00, 'No stripe');
    }

    // ── Admin controller ──────────────────────────────────────────────────────

    public function test_admin_can_refund_via_controller(): void
    {
        $this->mockStripeRefund('re_admin_test');

        $response = $this->actingAs($this->admin)
            ->post(route('admin.payments.refund', $this->payment->id), [
                'amount' => 100.00,
                'reason' => 'Admin partial refund test',
            ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');
    }

    public function test_admin_full_refund_when_no_amount_given(): void
    {
        $this->mockStripeRefund('re_full_admin');

        $response = $this->actingAs($this->admin)
            ->post(route('admin.payments.refund', $this->payment->id), [
                'reason' => 'Full refund test',
            ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $this->payment->refresh();
        $this->assertEquals('refunded', $this->payment->status);
    }

    public function test_admin_refund_already_fully_refunded_returns_error(): void
    {
        // Pre-refund
        $this->payment->update(['refunded_amount' => 300.00, 'status' => 'refunded']);

        $response = $this->actingAs($this->admin)
            ->post(route('admin.payments.refund', $this->payment->id), [
                'reason' => 'Try again',
            ]);

        $response->assertRedirect();
        $response->assertSessionHas('error');
    }

    public function test_payment_remaining_refundable_helper(): void
    {
        $this->assertEquals(300.0, $this->payment->remainingRefundable());

        $this->payment->update(['refunded_amount' => 100.0]);
        $this->assertEquals(200.0, $this->payment->fresh()->remainingRefundable());

        $this->payment->update(['refunded_amount' => 300.0]);
        $this->assertEquals(0.0, $this->payment->fresh()->remainingRefundable());
    }
}
