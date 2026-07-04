<?php

namespace App\Http\Controllers\Dev;

use App\Http\Controllers\Controller;
use App\Mail\AdminPasswordResetMail;
use App\Mail\BookingCancelledMail;
use App\Mail\BookingConfirmationMail;
use App\Mail\ContactReplyMail;
use App\Mail\NewsletterMail;
use App\Mail\PaymentFailedMail;
use App\Mail\PaymentRetryMail;
use App\Mail\PaymentSuccessMail;
use App\Mail\RefundProcessedMail;
use App\Mail\ResetPasswordMail;
use App\Mail\SchoolApproved;
use App\Mail\SchoolRejected;
use App\Mail\SubscriptionActivatedMail;
use App\Mail\SubscriptionDowngradedMail;
use App\Mail\SubscriptionExpired;
use App\Mail\SubscriptionExpiringSoon;
use App\Mail\SubscriptionUpgradedMail;
use App\Mail\TrialEndingMail;
use App\Mail\TrialStartedMail;
use App\Mail\VerifyEmailMail;
use App\Mail\WelcomeMail;
use App\Models\AutoSchool;
use App\Models\Booking;
use App\Models\ContactRequest;
use App\Models\NewsletterSubscriber;
use App\Models\Payment;
use App\Models\Plan;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Http\Response;

/**
 * Renders every transactional/marketing email with sample data, without
 * sending anything — for visually reviewing templates during development.
 * Registered only when app()->environment('local') (see routes/web.php).
 */
class MailPreviewController extends Controller
{
    private const CATALOG = [
        'welcome'                 => 'Welcome Email',
        'verify-email'            => 'Verify Email',
        'reset-password'          => 'Password Reset',
        'subscription-activated'  => 'Subscription Activated',
        'subscription-expiring'   => 'Subscription Expiring',
        'subscription-expired'    => 'Subscription Expired',
        'school-approved'         => 'School Approved',
        'school-rejected'         => 'School Rejected',
        'booking-confirmation'    => 'Booking Confirmation',
        'booking-cancelled'       => 'Booking Cancelled',
        'contact-reply'           => 'Contact Reply',
        'newsletter'              => 'Newsletter',
        'admin-password-reset'    => 'Admin Password Reset',
        'subscription-upgraded'   => 'Subscription Upgraded',
        'subscription-downgraded' => 'Subscription Downgraded',
        'trial-started'           => 'Trial Started',
        'trial-ending'            => 'Trial Ending',
        'payment-success'        => 'Payment Success',
        'payment-failed'          => 'Payment Failed',
        'payment-retry'           => 'Payment Retry',
        'refund-processed'        => 'Refund Processed',
    ];

    public function index(): Response
    {
        $links = collect(self::CATALOG)
            ->map(fn ($label, $key) => "<li><a href=\"" . route('dev.mail-preview.show', $key) . "\">{$label}</a></li>")
            ->implode('');

        return response("<h1>Email previews</h1><ul>{$links}</ul>", 200);
    }

    public function show(string $key): Response
    {
        abort_unless(array_key_exists($key, self::CATALOG), 404);

        $mailable = $this->build($key);

        return response($mailable->render());
    }

    private function build(string $key)
    {
        $school = AutoSchool::factory()->make(['id' => 1, 'name' => 'Auto-École Exemple', 'slug' => 'auto-ecole-exemple']);
        $user   = User::factory()->make(['id' => 1, 'name' => 'Karim Benali', 'email' => 'karim@example.com', 'role' => 'school_owner']);
        $school->setRelation('user', $user);

        $plan = Plan::factory()->make(['id' => 1, 'name' => 'Premium', 'price' => 299, 'billing_period' => 'monthly', 'trial_days' => 14]);

        $subscription = new Subscription([
            'id' => 1, 'auto_school_id' => 1, 'plan_id' => 1, 'status' => 'active',
            'started_at' => now()->subDays(5), 'expires_at' => now()->addDays(2),
            'trial_ends_at' => now()->addDays(2), 'on_trial' => true,
        ]);
        $subscription->setRelation('plan', $plan);
        $subscription->setRelation('autoSchool', $school);

        $booking = new Booking([
            'id' => 1, 'auto_school_id' => 1, 'name' => 'Sara Amrani', 'email' => 'sara@example.com',
            'phone' => '0600000000', 'permit_type' => 'b', 'preferred_date' => now()->addWeek(),
            'message' => 'Je souhaiterais m\'inscrire pour le permis B.', 'admin_notes' => 'Créneau complet ce mois-ci.',
        ]);
        $booking->setRelation('autoSchool', $school);

        $contactRequest = new ContactRequest([
            'id' => 1, 'name' => 'Youssef Idrissi', 'email' => 'youssef@example.com',
            'subject' => 'Question sur les tarifs', 'message' => 'Bonjour, quels sont vos tarifs pour le permis B ?',
            'reply' => 'Bonjour, nos tarifs démarrent à 3500 MAD. N\'hésitez pas à nous contacter pour plus de détails.',
        ]);

        $newsletterSubscriber = new NewsletterSubscriber(['id' => 1, 'email' => 'abonne@example.com', 'token' => 'preview-token']);

        $payment = new Payment([
            'id' => 1, 'auto_school_id' => 1, 'plan_id' => 1, 'amount' => 299, 'currency' => 'MAD',
            'status' => 'success', 'invoice_number' => 'INV-2026-0001', 'paid_at' => now(),
            'failure_message' => 'Fonds insuffisants',
        ]);
        $payment->setRelation('plan', $plan);
        $payment->setRelation('autoSchool', $school);

        return match ($key) {
            'welcome'                 => new WelcomeMail($user),
            'verify-email'            => new VerifyEmailMail($user->name, 'https://example.com/verify/preview'),
            'reset-password'          => new ResetPasswordMail($user->name, 'https://example.com/reset/preview'),
            'subscription-activated'  => new SubscriptionActivatedMail($school, $subscription),
            'subscription-expiring'   => new SubscriptionExpiringSoon($subscription),
            'subscription-expired'    => new SubscriptionExpired($subscription),
            'school-approved'         => new SchoolApproved($school),
            'school-rejected'         => new SchoolRejected($school, 'Documents incomplets — merci de fournir un justificatif de domicile.'),
            'booking-confirmation'    => new BookingConfirmationMail($booking),
            'booking-cancelled'       => new BookingCancelledMail($booking),
            'contact-reply'           => new ContactReplyMail($contactRequest),
            'newsletter'              => new NewsletterMail($newsletterSubscriber, 'Les nouveautés du mois', "Bonjour,\n\nDécouvrez les nouvelles auto-écoles inscrites ce mois-ci sur AutoEcoles.ma.\n\nÀ bientôt !"),
            'admin-password-reset'    => new AdminPasswordResetMail($user, 'TempPass1234'),
            'subscription-upgraded'   => new SubscriptionUpgradedMail($school, $plan, 'Standard'),
            'subscription-downgraded' => new SubscriptionDowngradedMail($school, $plan, $subscription),
            'trial-started'           => new TrialStartedMail($school, $subscription),
            'trial-ending'            => new TrialEndingMail($school, $subscription, 2),
            'payment-success'        => new PaymentSuccessMail($payment),
            'payment-failed'          => new PaymentFailedMail($payment, $subscription, 1),
            'payment-retry'           => new PaymentRetryMail($subscription, 1, 5),
            'refund-processed'        => new RefundProcessedMail($payment, 299.0, 'Demande du client'),
        };
    }
}
