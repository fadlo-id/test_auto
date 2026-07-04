<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote')->hourly();

// All wall-clock times below are intended as Morocco local time — APP_TIMEZONE is
// UTC (for consistent timestamp storage), so each schedule must set its own
// timezone or "6am"/"8am" would actually fire at 6/7am UTC depending on DST,
// which is 1h off from Africa/Casablanca outside the Ramadan UTC+0 exception.

// Check and expire subscriptions every day at 6am (Morocco time)
Schedule::command('subscriptions:check-expired')
    ->dailyAt('06:00')
    ->timezone('Africa/Casablanca')
    ->withoutOverlapping();

// Aggregate analytics stats every hour
Schedule::command('analytics:aggregate')
    ->hourly()
    ->withoutOverlapping();

// Process payment retries and trial ending notifications daily at 8am (Morocco time)
Schedule::command('payments:process-retries')
    ->dailyAt('08:00')
    ->timezone('Africa/Casablanca')
    ->withoutOverlapping();

// Check CRM reminders every 15 minutes
Schedule::command('crm:check-reminders')
    ->everyFifteenMinutes()
    ->withoutOverlapping();

// Monthly credit reset for free-tier schools + safety net for paid schools
// whose renewal webhook might have been missed
Schedule::command('credits:monthly-reset')
    ->dailyAt('05:00')
    ->timezone('Africa/Casablanca')
    ->withoutOverlapping();

// Retry email queue jobs (welcome, verification, subscription, booking, etc.)
// that failed in the last hour — e.g. a transient SMTP outage. Failures older
// than that are left in failed_jobs for manual review (queue:failed).
Schedule::command('app:retry-failed-email-jobs')
    ->hourly()
    ->withoutOverlapping();
