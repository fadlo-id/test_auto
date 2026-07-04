<?php

namespace App\Mail;

use App\Models\AutoSchool;
use App\Models\Plan;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class SubscriptionUpgradedMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public $tries = 3;
    public $backoff = [60, 300, 900];

    public function __construct(
        public AutoSchool $school,
        public Plan $newPlan,
        public ?string $oldPlanName = null
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: "🚀 Abonnement mis à niveau — {$this->newPlan->name}");
    }

    public function content(): Content
    {
        return new Content(view: 'emails.subscription-upgraded');
    }
}
