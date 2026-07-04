<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class VerifyEmailMail extends Mailable
{
    use Queueable, SerializesModels;

    public $tries = 3;
    public $backoff = [60, 300, 900];

    public function __construct(public string $userName, public string $verificationUrl) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: 'Vérifiez votre adresse email');
    }

    public function content(): Content
    {
        return new Content(view: 'emails.verify-email');
    }
}
