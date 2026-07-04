<?php

namespace App\Jobs;

use App\Mail\NewsletterMail;
use App\Models\NewsletterSubscriber;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

/**
 * Fans a newsletter out to every active subscriber, one queued mail job per
 * recipient. Runs on the queue itself (not the HTTP request) and chunks the
 * subscriber list so sending to a large list never loads it all into memory.
 */
class SendNewsletterJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tries = 3;
    public $backoff = [60, 300, 900];

    public function __construct(
        public readonly string $subject,
        public readonly string $body,
    ) {}

    public function handle(): void
    {
        NewsletterSubscriber::where('status', 'active')
            ->chunkById(200, function ($subscribers) {
                foreach ($subscribers as $subscriber) {
                    if (! $subscriber->token) {
                        $subscriber->update(['token' => Str::random(40)]);
                    }

                    try {
                        Mail::to($subscriber->email)->queue(new NewsletterMail($subscriber, $this->subject, $this->body));
                    } catch (\Throwable $e) {
                        Log::warning('Newsletter email failed to queue', [
                            'subscriber_id' => $subscriber->id,
                            'error'         => $e->getMessage(),
                        ]);
                    }
                }
            });
    }
}
