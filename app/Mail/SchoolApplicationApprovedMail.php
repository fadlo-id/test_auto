<?php

namespace App\Mail;

use App\Models\AutoSchool;
use App\Models\SchoolApplication;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class SchoolApplicationApprovedMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public $tries = 3;
    public $backoff = [60, 300, 900];

    public function __construct(
        public SchoolApplication $application,
        public AutoSchool $school,
        public bool $newAccountCreated,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: 'Félicitations ! Votre auto-école est en ligne');
    }

    public function content(): Content
    {
        return new Content(view: 'emails.school-application-approved');
    }
}
