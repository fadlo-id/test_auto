<?php

namespace App\Notifications;

use App\Mail\ResetPasswordMail;
use Illuminate\Auth\Notifications\ResetPassword as BaseResetPassword;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;

/**
 * Queued, branded replacement for Laravel's default password-reset
 * notification — same token/URL logic, but rendered via ResetPasswordMail
 * (app/Mail) instead of the generic MailMessage template.
 */
class ResetPasswordNotification extends BaseResetPassword implements ShouldQueue
{
    use Queueable;

    public $tries = 3;
    public $backoff = [60, 300, 900];

    public function toMail($notifiable): Mailable
    {
        $url = $this->resetUrl($notifiable);

        return (new ResetPasswordMail($notifiable->name, $url))->to($notifiable->email);
    }
}
