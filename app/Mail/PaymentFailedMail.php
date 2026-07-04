<?php

namespace App\Mail;

use App\Models\Payment;
use App\Models\Subscription;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class PaymentFailedMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public $tries = 3;
    public $backoff = [60, 300, 900];

    public function __construct(
        public Payment $payment,
        public ?Subscription $subscription = null,
        public int $retryCount = 0
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: '⚠️ Échec de paiement — Action requise',
        );
    }

    public function content(): Content
    {
        return new Content(view: 'emails.payment-failed');
    }
}
