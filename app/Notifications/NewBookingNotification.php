<?php

namespace App\Notifications;

use App\Models\Booking;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewBookingNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public $tries = 3;
    public $backoff = [60, 300, 900];

    public function __construct(private readonly Booking $booking) {}

    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $msg = (new MailMessage)
            ->subject("Nouvelle demande de réservation — {$this->booking->autoSchool->name}")
            ->greeting("Bonjour {$notifiable->name},")
            ->line("Vous avez reçu une nouvelle demande de réservation pour **{$this->booking->autoSchool->name}**.")
            ->line("**Candidat :** {$this->booking->name} ({$this->booking->email})");

        if ($this->booking->preferred_date) {
            $msg->line("**Date souhaitée :** " . $this->booking->preferred_date->format('d/m/Y'));
        }

        return $msg->action('Voir les réservations', route('school.bookings'))
                   ->salutation('L\'équipe AutoEcoles Maroc');
    }

    public function toDatabase(object $notifiable): array
    {
        $body = "De {$this->booking->name} ({$this->booking->email})";
        if ($this->booking->preferred_date) {
            $body .= ' — le ' . $this->booking->preferred_date->format('d/m/Y');
        }

        return [
            'type'  => 'booking',
            'title' => 'Nouvelle demande de réservation',
            'body'  => $body,
            'url'   => route('school.bookings'),
            'icon'  => '📋',
        ];
    }
}
