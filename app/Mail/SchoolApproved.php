<?php

namespace App\Mail;

use App\Models\AutoSchool;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class SchoolApproved extends Mailable
{
    use Queueable, SerializesModels;

    public $tries = 3;
    public $backoff = [60, 300, 900];

    public function __construct(public AutoSchool $school) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: 'Votre auto-ecole a ete approuvee !');
    }

    public function content(): Content
    {
        return new Content(view: 'emails.school-approved');
    }
}
