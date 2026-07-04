<?php

namespace App\Console\Commands;

use App\Models\CrmReminder;
use App\Notifications\CrmReminderDueNotification;
use Illuminate\Console\Command;

class CheckCrmReminders extends Command
{
    protected $signature   = 'crm:check-reminders';
    protected $description = 'Send notifications for CRM reminders that are due';

    public function handle(): int
    {
        $due = CrmReminder::with(['prospect', 'assignedTo'])
            ->where('status', 'pending')
            ->where('due_at', '<=', now()->addMinutes(15))
            ->where('due_at', '>=', now()->subMinutes(5))
            ->get();

        foreach ($due as $reminder) {
            if ($reminder->assignedTo) {
                $reminder->assignedTo->notify(new CrmReminderDueNotification($reminder));
            }
        }

        $this->info("CRM reminders checked — {$due->count()} notification(s) sent.");

        return self::SUCCESS;
    }
}
