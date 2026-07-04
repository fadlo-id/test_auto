<?php

namespace App\Mail;

use App\Models\Payment;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class RefundProcessedMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public $tries = 3;
    public $backoff = [60, 300, 900];

    public function __construct(
        public Payment $payment,
        public float $refundedAmount,
        public string $reason
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: '💳 Remboursement traité');
    }

    public function content(): Content
    {
        return new Content(view: 'emails.refund-processed');
    }
}
