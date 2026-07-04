<?php

namespace App\Notifications;

use App\Mail\SubscriptionExpired as SubscriptionExpiredMail;
use App\Models\Subscription;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Notifications\Notification;

class SubscriptionExpiredNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public $tries = 3;
    public $backoff = [60, 300, 900];

    public function __construct(private readonly Subscription $subscription) {}

    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    public function toMail(object $notifiable): Mailable
    {
        return (new SubscriptionExpiredMail($this->subscription))->to($notifiable->email);
    }

    public function toDatabase(object $notifiable): array
    {
        return [
            'type'  => 'subscription_expired',
            'title' => 'Votre abonnement a expiré',
            'body'  => 'Renouvelez votre abonnement pour être à nouveau visible.',
            'url'   => route('school.subscription'),
            'icon'  => '🔴',
        ];
    }
}
