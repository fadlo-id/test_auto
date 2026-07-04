<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class AdminPasswordResetMail extends Mailable
{
    use Queueable, SerializesModels;

    public $tries = 3;
    public $backoff = [60, 300, 900];

    public function __construct(public User $user, public string $newPassword) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Votre mot de passe administrateur a été réinitialisé',
        );
    }

    public function content(): Content
    {
        return new Content(view: 'emails.admin-password-reset');
    }
}
