<?php

namespace App\Notifications;

use App\Mail\SubscriptionExpiringSoon;
use App\Models\Subscription;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Notifications\Notification;

class SubscriptionExpiringNotification extends Notification implements ShouldQueue
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
        return (new SubscriptionExpiringSoon($this->subscription))->to($notifiable->email);
    }

    public function toDatabase(object $notifiable): array
    {
        $days = (int) now()->diffInDays($this->subscription->expires_at);

        return [
            'type'  => 'subscription_expiring',
            'title' => "Abonnement expire dans {$days} jour(s)",
            'body'  => "Renouvelez votre abonnement pour continuer à être visible.",
            'url'   => route('school.subscription'),
            'icon'  => '⚠️',
        ];
    }
}
