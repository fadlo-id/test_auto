<?php

namespace Tests\Feature;

use App\Models\AutoSchool;
use App\Models\Plan;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

/**
 * Exercises the real HTTP /stripe/webhook endpoint (signature verification +
 * idempotency), unlike StripeWebhookTest which tests services directly.
 */
class StripeWebhookIdempotencyTest extends TestCase
{
    use RefreshDatabase;

    private const SECRET = 'whsec_test_secret';

    private function postWebhook(array $payload): \Illuminate\Testing\TestResponse
    {
        $body      = json_encode($payload);
        $timestamp = time();
        $signature = hash_hmac('sha256', "{$timestamp}.{$body}", self::SECRET);

        return $this->call(
            'POST',
            route('stripe.webhook'),
            [],
            [],
            [],
            array_merge($this->transformHeadersToServerVars([
                'Stripe-Signature' => "t={$timestamp},v1={$signature}",
                'Content-Type'     => 'application/json',
            ])),
            $body
        );
    }

    public function test_duplicate_payment_failed_event_only_schedules_one_retry(): void
    {
        Mail::fake();
        config(['services.stripe.webhook_secret' => self::SECRET]);

        $owner  = User::factory()->create(['role' => 'school_owner']);
        $school = AutoSchool::factory()->create(['user_id' => $owner->id, 'status' => 'approved']);
        $plan   = Plan::factory()->create();

        $sub = Subscription::create([
            'auto_school_id' => $school->id,
            'plan_id'        => $plan->id,
            'status'         => 'active',
            'started_at'     => now(),
            'expires_at'     => now()->addMonth(),
            'payment_retry_count' => 0,
        ]);

        $payload = [
            'id'   => 'evt_test_duplicate_failed',
            'type' => 'payment_intent.payment_failed',
            'data' => ['object' => [
                'id'       => 'pi_test_failed_1',
                'amount'   => 20000,
                'currency' => 'mad',
                'metadata' => ['school_id' => (string) $school->id, 'plan_id' => (string) $plan->id],
            ]],
        ];

        $first  = $this->postWebhook($payload);
        $second = $this->postWebhook($payload); // Stripe redelivering the exact same event id

        $first->assertOk();
        $second->assertOk();

        $sub->refresh();
        $this->assertSame(1, $sub->payment_retry_count, 'Retry counter must only advance once for a duplicated webhook event.');
        $this->assertDatabaseCount('stripe_webhook_events', 1);
    }

    public function test_invalid_signature_is_rejected(): void
    {
        config(['services.stripe.webhook_secret' => self::SECRET]);

        $response = $this->call(
            'POST',
            route('stripe.webhook'),
            [],
            [],
            [],
            $this->transformHeadersToServerVars(['Stripe-Signature' => 't=1,v1=invalid']),
            json_encode(['id' => 'evt_bad', 'type' => 'payment_intent.succeeded', 'data' => ['object' => []]])
        );

        $response->assertStatus(400);
    }
}
