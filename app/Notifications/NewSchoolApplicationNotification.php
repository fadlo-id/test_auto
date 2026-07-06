<?php

namespace App\Notifications;

use App\Models\SchoolApplication;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewSchoolApplicationNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public $tries = 3;
    public $backoff = [60, 300, 900];

    public function __construct(private readonly SchoolApplication $application) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject("Nouvelle candidature auto-école — {$this->application->school_name}")
            ->greeting("Bonjour {$notifiable->name},")
            ->line("Une nouvelle candidature a été soumise pour rejoindre la plateforme :")
            ->line("**{$this->application->school_name}** — {$this->application->city}")
            ->line("Propriétaire : {$this->application->owner_name}")
            ->action('Examiner la candidature', route('admin.school-applications.show', $this->application))
            ->salutation('L\'équipe AutoEcoles Maroc');
    }
}
