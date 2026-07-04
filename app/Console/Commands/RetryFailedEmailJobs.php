<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;

/**
 * Automatically retries recently-failed email/notification queue jobs
 * (SendQueuedMailable, SendQueuedNotifications, SendNewsletterJob) — but only
 * within a recent time window, so a job that is permanently broken (bad
 * template, missing data) doesn't get retried forever on every scheduler tick.
 * Older failures are left in `failed_jobs` for manual inspection
 * (`php artisan queue:failed`).
 */
class RetryFailedEmailJobs extends Command
{
    protected $signature = 'app:retry-failed-email-jobs {--minutes=60 : Only retry failures from the last N minutes}';

    protected $description = 'Retry recently-failed email queue jobs (mailables, notifications, newsletter fan-out)';

    private const MAIL_JOB_CLASSES = [
        'Illuminate\\Mail\\SendQueuedMailable',
        'Illuminate\\Notifications\\SendQueuedNotifications',
        'App\\Jobs\\SendNewsletterJob',
    ];

    public function handle(): int
    {
        $minutes = (int) $this->option('minutes');
        $cutoff  = now()->subMinutes($minutes);

        $failed = DB::table('failed_jobs')
            ->where('failed_at', '>=', $cutoff)
            ->get();

        $toRetry = $failed->filter(function ($row) {
            $displayName = json_decode($row->payload, true)['displayName'] ?? '';
            return in_array($displayName, self::MAIL_JOB_CLASSES, true);
        });

        if ($toRetry->isEmpty()) {
            $this->info("No failed email jobs in the last {$minutes} minute(s).");
            return self::SUCCESS;
        }

        foreach ($toRetry as $row) {
            Artisan::call('queue:retry', ['id' => [$row->uuid]]);
            $this->info("Retried failed job {$row->uuid}");
        }

        $this->info("Retried {$toRetry->count()} failed email job(s).");

        return self::SUCCESS;
    }
}
