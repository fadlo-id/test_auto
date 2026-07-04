<?php

namespace App\Mail;

use App\Models\AutoSchool;
use App\Models\Subscription;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class TrialEndingMail extends Mailable
{
    use Queueable, SerializesModels;

    public $tries = 3;
    public $backoff = [60, 300, 900];

    public function __construct(
        public AutoSchool $school,
        public Subscription $subscription,
        public int $daysLeft
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "⏰ Votre essai gratuit se termine dans {$this->daysLeft} jour(s)",
        );
    }

    public function content(): Content
    {
        return new Content(view: 'emails.trial-ending');
    }
}
