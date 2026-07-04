<?php

namespace App\Notifications;

use App\Models\AutoSchool;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewReviewNotification extends Notification implements ShouldQueue
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
            ->subject("Nouvel avis soumis — {$this->school->name}")
            ->greeting("Bonjour {$notifiable->name},")
            ->line("Un nouvel avis a été soumis pour **{$this->school->name}** et est en attente de validation.")
            ->action('Voir les avis', route('school.reviews'))
            ->salutation('L\'équipe AutoEcoles Maroc');
    }

    public function toDatabase(object $notifiable): array
    {
        return [
            'type'  => 'new_review',
            'title' => 'Nouvel avis en attente',
            'body'  => "Un avis pour {$this->school->name} attend votre réponse.",
            'url'   => route('school.reviews'),
            'icon'  => '⭐',
        ];
    }
}
