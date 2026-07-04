<?php

namespace App\Notifications;

use App\Models\AutoSchool;
use App\Models\CreditBalance;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class CreditExhaustedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public $tries = 3;
    public $backoff = [60, 300, 900];

    public function __construct(
        private AutoSchool $school,
        private string $creditType,
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $label = CreditBalance::LABELS[$this->creditType] ?? $this->creditType;

        return (new MailMessage)
            ->subject("Crédits épuisés — {$this->school->name}")
            ->greeting("Bonjour {$notifiable->name},")
            ->line("Les crédits **{$label}** de votre auto-école **{$this->school->name}** sont épuisés.")
            ->line("Votre école n'apparaît plus dans les résultats de recherche.")
            ->action('Renouveler mon abonnement', url('/school/subscription'))
            ->line('Renouvelez votre abonnement pour restaurer votre visibilité immédiatement.');
    }
}
