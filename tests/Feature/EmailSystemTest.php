<?php

namespace Tests\Feature;

use App\Jobs\SendNewsletterJob;
use App\Mail\BookingCancelledMail;
use App\Mail\BookingConfirmationMail;
use App\Mail\ContactReplyMail;
use App\Mail\NewsletterMail;
use App\Mail\SchoolApproved;
use App\Mail\SchoolRejected;
use App\Mail\SubscriptionActivatedMail;
use App\Mail\SubscriptionExpired as SubscriptionExpiredMail;
use App\Mail\SubscriptionExpiringSoon;
use App\Mail\WelcomeMail;
use App\Models\AutoSchool;
use App\Models\Booking;
use App\Models\ContactRequest;
use App\Models\NewsletterSubscriber;
use App\Models\Plan;
use App\Models\Subscription;
use App\Models\User;
use App\Notifications\ResetPasswordNotification;
use App\Notifications\SubscriptionExpiredNotification;
use App\Notifications\SubscriptionExpiringNotification;
use App\Notifications\VerifyEmailNotification;
use App\Services\CreditService;
use App\Services\NotificationService;
use App\Services\SubscriptionService;
use Illuminate\Auth\Notifications\ResetPassword as BaseResetPassword;
use Illuminate\Auth\Notifications\VerifyEmail as BaseVerifyEmail;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Bus;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;

/**
 * Covers every email feature in the system: the 14 requested transactional
 * emails, queueing behaviour, and the failed-job retry command. Credits
 * Low / Credits Exhausted already have dedicated coverage in
 * tests/Feature/CreditSystemTest.php and are intentionally not duplicated here.
 */
class EmailSystemTest extends TestCase
{
    use RefreshDatabase;

    private function schoolOwner(): array
    {
        $owner  = User::factory()->create(['role' => 'school_owner']);
        $school = AutoSchool::factory()->create(['user_id' => $owner->id, 'status' => 'approved', 'is_active' => true]);

        return [$owner, $school];
    }

    // ── Welcome ──────────────────────────────────────────────────────────

    public function test_welcome_email_is_queued_on_registration(): void
    {
        Mail::fake();

        $this->post('/register', [
            'name'                  => 'Nouveau Test',
            'email'                 => 'nouveau@example.com',
            'password'              => 'password123',
            'password_confirmation' => 'password123',
            'role'                  => 'user',
        ]);

        $user = User::where('email', 'nouveau@example.com')->firstOrFail();

        Mail::assertQueued(WelcomeMail::class, fn ($mail) => $mail->user->is($user));
    }

    // ── Verify Email ─────────────────────────────────────────────────────

    public function test_verify_email_uses_custom_queued_notification(): void
    {
        Notification::fake();

        $user = User::factory()->unverified()->create();
        $user->sendEmailVerificationNotification();

        Notification::assertSentTo($user, VerifyEmailNotification::class);
        // Confirms the framework default is no longer used.
        Notification::assertNotSentTo($user, BaseVerifyEmail::class);
    }

    public function test_verify_email_notification_is_queued(): void
    {
        $user = User::factory()->unverified()->create();

        $this->assertInstanceOf(
            \Illuminate\Contracts\Queue\ShouldQueue::class,
            new VerifyEmailNotification()
        );
    }

    // ── Password Reset ───────────────────────────────────────────────────

    public function test_password_reset_uses_custom_queued_notification(): void
    {
        Notification::fake();

        $user = User::factory()->create();
        $this->post('/forgot-password', ['email' => $user->email]);

        Notification::assertSentTo($user, ResetPasswordNotification::class);
        Notification::assertNotSentTo($user, BaseResetPassword::class);
    }

    public function test_password_reset_notification_is_queued(): void
    {
        $this->assertInstanceOf(
            \Illuminate\Contracts\Queue\ShouldQueue::class,
            new ResetPasswordNotification('token')
        );
    }

    // ── Subscription Activated ───────────────────────────────────────────

    public function test_subscription_activated_email_sent_on_paid_activation(): void
    {
        Mail::fake();
        $this->mock(CreditService::class, function ($mock) {
            $mock->shouldReceive('restoreOnRenewal')->andReturn(null);
        });

        [, $school] = $this->schoolOwner();
        $plan = Plan::factory()->create(['trial_days' => 0]);

        app(SubscriptionService::class)->createSubscription($school, $plan, 'sub_test123');

        Mail::assertQueued(SubscriptionActivatedMail::class, fn ($mail) => $mail->school->is($school));
    }

    public function test_subscription_activated_email_not_sent_when_trial_started_instead(): void
    {
        Mail::fake();
        $this->mock(CreditService::class, function ($mock) {
            $mock->shouldReceive('restoreOnRenewal')->andReturn(null);
        });

        [, $school] = $this->schoolOwner();
        $plan = Plan::factory()->create(['trial_days' => 14]);

        app(SubscriptionService::class)->createSubscription($school, $plan, 'sub_trial123');

        Mail::assertNotQueued(SubscriptionActivatedMail::class);
    }

    // ── Subscription Expiring / Expired ──────────────────────────────────

    public function test_subscription_expiring_notification_renders_branded_mailable_and_is_queued(): void
    {
        [, $school] = $this->schoolOwner();
        $plan = Plan::factory()->create();
        $subscription = Subscription::create([
            'auto_school_id' => $school->id, 'plan_id' => $plan->id,
            'status' => 'active', 'started_at' => now(), 'expires_at' => now()->addDays(3),
        ]);

        $notification = new SubscriptionExpiringNotification($subscription);

        $this->assertInstanceOf(\Illuminate\Contracts\Queue\ShouldQueue::class, $notification);
        $this->assertInstanceOf(SubscriptionExpiringSoon::class, $notification->toMail($school->user));
    }

    public function test_subscription_expired_notification_renders_branded_mailable_and_is_queued(): void
    {
        [, $school] = $this->schoolOwner();
        $plan = Plan::factory()->create();
        $subscription = Subscription::create([
            'auto_school_id' => $school->id, 'plan_id' => $plan->id,
            'status' => 'cancelled', 'started_at' => now()->subMonth(), 'expires_at' => now()->subDay(),
        ]);

        $notification = new SubscriptionExpiredNotification($subscription);

        $this->assertInstanceOf(\Illuminate\Contracts\Queue\ShouldQueue::class, $notification);
        $this->assertInstanceOf(SubscriptionExpiredMail::class, $notification->toMail($school->user));
    }

    public function test_check_expired_subscriptions_command_sends_expiring_and_expired_notifications(): void
    {
        Notification::fake();
        $this->mock(CreditService::class, function ($mock) {
            $mock->shouldReceive('exhaustAll')->andReturn(null);
            $mock->shouldReceive('cleanOldDedupRecords')->andReturn(0);
        });

        $plan = Plan::factory()->create();

        [$owner1, $school1] = $this->schoolOwner();
        Subscription::create([
            'auto_school_id' => $school1->id, 'plan_id' => $plan->id, 'status' => 'active',
            'on_trial' => false, 'started_at' => now()->subMonth(), 'expires_at' => now()->addDays(3),
        ]);

        [$owner2, $school2] = $this->schoolOwner();
        Subscription::create([
            'auto_school_id' => $school2->id, 'plan_id' => $plan->id, 'status' => 'active',
            'started_at' => now()->subMonth(), 'expires_at' => now()->subDay(), 'cancel_at_period_end' => false,
        ]);

        $this->artisan('subscriptions:check-expired')->assertSuccessful();

        Notification::assertSentTo($owner1, SubscriptionExpiringNotification::class);
        Notification::assertSentTo($owner2, SubscriptionExpiredNotification::class);
    }

    // ── School Approved / Rejected ───────────────────────────────────────

    public function test_school_approved_email_is_queued(): void
    {
        Mail::fake();
        [, $school] = $this->schoolOwner();

        app(NotificationService::class)->notifySchoolApproved($school);

        Mail::assertQueued(SchoolApproved::class, fn ($mail) => $mail->hasTo($school->user->email));
    }

    public function test_school_rejected_email_is_queued(): void
    {
        Mail::fake();
        [, $school] = $this->schoolOwner();

        app(NotificationService::class)->notifySchoolRejected($school, 'Documents incomplets');

        Mail::assertQueued(SchoolRejected::class, fn ($mail) => $mail->hasTo($school->user->email) && $mail->reason === 'Documents incomplets');
    }

    // ── Booking Confirmation / Cancelled ──────────────────────────────────

    public function test_booking_confirmation_email_is_queued_to_candidate(): void
    {
        Mail::fake();
        [, $school] = $this->schoolOwner();

        $this->post(route('school.detail.booking', $school->slug), [
            'name'  => 'Sara Amrani',
            'email' => 'sara@example.com',
        ]);

        Mail::assertQueued(BookingConfirmationMail::class, fn ($mail) => $mail->booking->email === 'sara@example.com');
    }

    public function test_booking_cancelled_email_is_queued_when_owner_cancels(): void
    {
        Mail::fake();
        [$owner, $school] = $this->schoolOwner();

        $booking = Booking::create([
            'auto_school_id' => $school->id, 'name' => 'Sara Amrani', 'email' => 'sara@example.com', 'status' => 'pending',
        ]);

        $this->actingAs($owner)->put(route('school.bookings.update', $booking), ['status' => 'cancelled']);

        Mail::assertQueued(BookingCancelledMail::class, fn ($mail) => $mail->booking->id === $booking->id);
    }

    public function test_booking_cancelled_email_not_resent_if_already_cancelled(): void
    {
        Mail::fake();
        [$owner, $school] = $this->schoolOwner();

        $booking = Booking::create([
            'auto_school_id' => $school->id, 'name' => 'Sara Amrani', 'email' => 'sara@example.com', 'status' => 'cancelled',
        ]);

        $this->actingAs($owner)->put(route('school.bookings.update', $booking), ['status' => 'cancelled', 'admin_notes' => 'still cancelled']);

        Mail::assertNotQueued(BookingCancelledMail::class);
    }

    // ── Contact Reply ─────────────────────────────────────────────────────

    public function test_contact_reply_email_is_queued_and_reply_persisted(): void
    {
        Mail::fake();
        $admin = User::factory()->create(['role' => 'super_admin']);

        $contactRequest = ContactRequest::create([
            'name' => 'Youssef Idrissi', 'email' => 'youssef@example.com',
            'subject' => 'Question', 'message' => 'Quels sont vos tarifs ?', 'status' => 'new',
        ]);

        $this->actingAs($admin)->post(route('admin.contact-requests.reply', $contactRequest), [
            'reply' => 'Nos tarifs démarrent à 3500 MAD.',
        ]);

        $contactRequest->refresh();
        $this->assertSame('replied', $contactRequest->status);
        $this->assertSame('Nos tarifs démarrent à 3500 MAD.', $contactRequest->reply);

        Mail::assertQueued(ContactReplyMail::class, fn ($mail) => $mail->contactRequest->id === $contactRequest->id);
    }

    // ── Newsletter ────────────────────────────────────────────────────────

    public function test_newsletter_send_dispatches_job(): void
    {
        Bus::fake();
        $admin = User::factory()->create(['role' => 'super_admin']);
        NewsletterSubscriber::create(['email' => 'sub@example.com', 'status' => 'active']);

        $this->actingAs($admin)->post(route('admin.newsletter.send'), [
            'subject' => 'Nouveautes',
            'body'    => 'Contenu de la newsletter',
        ]);

        Bus::assertDispatched(SendNewsletterJob::class, fn ($job) => $job->subject === 'Nouveautes');
    }

    public function test_newsletter_job_queues_one_mail_per_active_subscriber_and_skips_unsubscribed(): void
    {
        Mail::fake();

        NewsletterSubscriber::create(['email' => 'active1@example.com', 'status' => 'active']);
        NewsletterSubscriber::create(['email' => 'active2@example.com', 'status' => 'active']);
        NewsletterSubscriber::create(['email' => 'gone@example.com', 'status' => 'unsubscribed']);

        (new SendNewsletterJob('Sujet', 'Corps du message'))->handle();

        Mail::assertQueued(NewsletterMail::class, 2);
        Mail::assertQueued(NewsletterMail::class, fn ($mail) => $mail->subscriber->email === 'active1@example.com');
        Mail::assertQueued(NewsletterMail::class, fn ($mail) => $mail->subscriber->email === 'active2@example.com');
    }

    public function test_newsletter_subscriber_gets_unsubscribe_token_generated_if_missing(): void
    {
        Mail::fake();
        $subscriber = NewsletterSubscriber::create(['email' => 'notoken@example.com', 'status' => 'active', 'token' => null]);

        (new SendNewsletterJob('Sujet', 'Corps'))->handle();

        $subscriber->refresh();
        $this->assertNotNull($subscriber->token);
    }

    public function test_public_newsletter_unsubscribe_via_token(): void
    {
        $subscriber = NewsletterSubscriber::create(['email' => 'unsub@example.com', 'status' => 'active', 'token' => 'test-token-123']);

        $this->get(route('newsletter.unsubscribe.public', 'test-token-123'))->assertRedirect();

        $subscriber->refresh();
        $this->assertSame('unsubscribed', $subscriber->status);
    }

    // ── Queue retry infrastructure ────────────────────────────────────────

    public function test_retry_failed_email_jobs_command_runs_successfully_with_no_failures(): void
    {
        $this->artisan('app:retry-failed-email-jobs')
            ->expectsOutputToContain('No failed email jobs')
            ->assertSuccessful();
    }

    public function test_retry_failed_email_jobs_only_retries_mail_related_jobs_within_window(): void
    {
        // A mail-related failure inside the window...
        \Illuminate\Support\Facades\DB::table('failed_jobs')->insert([
            'uuid'       => (string) \Illuminate\Support\Str::uuid(),
            'connection' => 'database',
            'queue'      => 'default',
            'payload'    => json_encode(['displayName' => 'Illuminate\\Mail\\SendQueuedMailable']),
            'exception'  => 'Some transient SMTP error',
            'failed_at'  => now(),
        ]);

        // ...and an unrelated job failure, which must NOT be retried by this command.
        \Illuminate\Support\Facades\DB::table('failed_jobs')->insert([
            'uuid'       => (string) \Illuminate\Support\Str::uuid(),
            'connection' => 'database',
            'queue'      => 'default',
            'payload'    => json_encode(['displayName' => 'App\\Jobs\\SomeUnrelatedJob']),
            'exception'  => 'Unrelated failure',
            'failed_at'  => now(),
        ]);

        // Only the mail-related failure should be selected for retry — the
        // unrelated job must be left alone. (We assert on the command's own
        // count rather than on `queue:retry`'s internal re-push succeeding,
        // since that requires a real serialized job payload.)
        $this->artisan('app:retry-failed-email-jobs')
            ->expectsOutputToContain('Retried 1 failed email job(s).')
            ->assertSuccessful();

        $this->assertDatabaseHas('failed_jobs', ['exception' => 'Unrelated failure']);
    }

    // ── Mail preview safety gate ─────────────────────────────────────────

    public function test_mail_preview_routes_are_not_registered_outside_local_environment(): void
    {
        // phpunit.xml sets APP_ENV=testing, so these routes must not exist here.
        $this->assertFalse(\Illuminate\Support\Facades\Route::has('dev.mail-preview.index'));

        $this->get('/dev/mail-preview')->assertNotFound();
    }
}
