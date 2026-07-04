<?php

namespace App\Notifications;

use App\Models\AutoSchool;
use App\Models\CreditBalance;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class CreditLowNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public $tries = 3;
    public $backoff = [60, 300, 900];

    public function __construct(
        private AutoSchool $school,
        private string $creditType,
        private int $remaining,
        private int $total,
        private int $thresholdPct,
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $label = CreditBalance::LABELS[$this->creditType] ?? $this->creditType;
        $used  = max(0, $this->total - $this->remaining);
        $pct   = $this->total > 0 ? round($used / $this->total * 100) : 0;

        return (new MailMessage)
            ->subject("Crédits faibles — {$this->school->name}")
            ->greeting("Bonjour {$notifiable->name},")
            ->line("Les crédits **{$label}** de votre auto-école **{$this->school->name}** sont faibles.")
            ->line("Il reste **{$this->remaining} crédits** sur {$this->total} ({$pct}% utilisés).")
            ->line("Sans renouvellement, votre école ne sera plus visible dès épuisement des crédits de vues.")
            ->action('Gérer mon abonnement', url('/school/subscription'))
            ->line('Renouvelez votre abonnement pour restaurer tous vos crédits.');
    }
}
