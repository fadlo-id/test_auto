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
