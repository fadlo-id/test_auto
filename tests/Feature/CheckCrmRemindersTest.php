<?php

namespace Tests\Feature;

use App\Models\CrmProspect;
use App\Models\CrmReminder;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class CheckCrmRemindersTest extends TestCase
{
    use RefreshDatabase;

    public function test_sends_notification_for_due_reminder(): void
    {
        Notification::fake();

        $staff = User::factory()->create(['role' => 'admin']);
        $prospect = CrmProspect::create(['name' => 'Jane Prospect']);
        $reminder = CrmReminder::create([
            'prospect_id' => $prospect->id,
            'assigned_to' => $staff->id,
            'created_by'  => $staff->id,
            'title'       => 'Call back',
            'due_at'      => now(),
            'status'      => 'pending',
        ]);

        $this->artisan('crm:check-reminders')->assertSuccessful();

        Notification::assertSentTo($staff, \App\Notifications\CrmReminderDueNotification::class);
        $this->assertNotNull($reminder->fresh()->notified_at);
    }

    /**
     * Regression: the due-window (now-5min .. now+15min) is wider than the
     * scheduler cadence (every 15 minutes), so a reminder due in the 5-minute
     * overlap used to be picked up by two consecutive runs and notified twice.
     */
    public function test_does_not_send_duplicate_notification_on_overlapping_runs(): void
    {
        Notification::fake();

        $staff = User::factory()->create(['role' => 'admin']);
        $prospect = CrmProspect::create(['name' => 'Jane Prospect']);
        CrmReminder::create([
            'prospect_id' => $prospect->id,
            'assigned_to' => $staff->id,
            'created_by'  => $staff->id,
            'title'       => 'Call back',
            'due_at'      => now()->subMinutes(3), // inside the overlap window
            'status'      => 'pending',
        ]);

        $this->artisan('crm:check-reminders')->assertSuccessful();
        $this->artisan('crm:check-reminders')->assertSuccessful();

        Notification::assertSentToTimes($staff, \App\Notifications\CrmReminderDueNotification::class, 1);
    }
}
