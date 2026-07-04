<?php

namespace App\Notifications;

use App\Models\AutoSchool;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ReviewApprovedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public $tries = 3;
    public $backoff = [60, 300, 900];

    public function __construct(private readonly AutoSchool $school) {}

    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject("Votre avis a été approuvé — {$this->school->name}")
            ->greeting("Bonjour {$notifiable->name},")
            ->line("Votre avis pour **{$this->school->name}** a été approuvé et est maintenant visible sur la plateforme.")
            ->line("Merci pour votre contribution !")
            ->action('Voir l\'auto-école', route('school.detail', $this->school->slug))
            ->salutation('L\'équipe AutoEcoles Maroc');
    }

    public function toDatabase(object $notifiable): array
    {
        return [
            'type'  => 'review_approved',
            'title' => 'Votre avis a été approuvé',
            'body'  => "Votre avis pour {$this->school->name} est maintenant visible.",
            'url'   => route('school.detail', $this->school->slug),
            'icon'  => '✅',
        ];
    }
}
