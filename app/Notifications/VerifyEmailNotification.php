<?php

namespace App\Notifications;

use App\Mail\VerifyEmailMail;
use Illuminate\Auth\Notifications\VerifyEmail as BaseVerifyEmail;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;

/**
 * Queued, branded replacement for Laravel's default email-verification
 * notification — same signed-URL logic, but rendered via VerifyEmailMail
 * (app/Mail) instead of the generic MailMessage template.
 */
class VerifyEmailNotification extends BaseVerifyEmail implements ShouldQueue
{
    use Queueable;

    public $tries = 3;
    public $backoff = [60, 300, 900];

    public function toMail($notifiable): Mailable
    {
        $url = $this->verificationUrl($notifiable);

        return (new VerifyEmailMail($notifiable->name, $url))->to($notifiable->email);
    }
}
