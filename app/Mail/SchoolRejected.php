<?php

namespace App\Mail;

use App\Models\AutoSchool;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class SchoolRejected extends Mailable
{
    use Queueable, SerializesModels;

    public $tries = 3;
    public $backoff = [60, 300, 900];

    public function __construct(public AutoSchool $school, public string $reason) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: 'Votre demande d\'inscription a ete refusee');
    }

    public function content(): Content
    {
        return new Content(view: 'emails.school-rejected');
    }
}
