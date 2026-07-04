<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote')->hourly();

// Check and expire subscriptions every day at 6am
Schedule::command('subscriptions:check-expired')->dailyAt('06:00');

// Aggregate analytics stats every hour
Schedule::command('analytics:aggregate')->hourly();

// Process payment retries and trial ending notifications daily at 8am
Schedule::command('payments:process-retries')->dailyAt('08:00');

// Check CRM reminders every 15 minutes
Schedule::command('crm:check-reminders')->everyFifteenMinutes();

// Monthly credit reset for free-tier schools + safety net for paid schools
// whose renewal webhook might have been missed
Schedule::command('credits:monthly-reset')->dailyAt('05:00');

// Retry email queue jobs (welcome, verification, subscription, booking, etc.)
// that failed in the last hour — e.g. a transient SMTP outage. Failures older
// than that are left in failed_jobs for manual review (queue:failed).
Schedule::command('app:retry-failed-email-jobs')->hourly();
