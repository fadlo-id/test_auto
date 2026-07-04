<?php

namespace App\Mail;

use App\Models\AutoSchool;
use App\Models\Subscription;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class SubscriptionActivatedMail extends Mailable
{
    use Queueable, SerializesModels;

    public $tries = 3;
    public $backoff = [60, 300, 900];

    public function __construct(public AutoSchool $school, public Subscription $subscription) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Votre abonnement {$this->subscription->plan?->name} est actif",
        );
    }

    public function content(): Content
    {
        return new Content(view: 'emails.subscription-activated');
    }
}
