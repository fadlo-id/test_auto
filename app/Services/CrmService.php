<?php

namespace App\Services;

use App\Models\CrmActivity;
use App\Models\CrmProspect;
use App\Models\CrmReminder;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class CrmService
{
    // ── Activity logging ──────────────────────────────────────────────────────

    public function log(
        CrmProspect $prospect,
        string $type,
        string $description,
        ?array $meta = null,
        ?int $userId = null,
    ): CrmActivity {
        return CrmActivity::create([
            'prospect_id' => $prospect->id,
            'user_id'     => $userId ?? auth()->id(),
            'type'        => $type,
            'description' => $description,
            'meta'        => $meta,
            'occurred_at' => now(),
        ]);
    }

    // ── Stage change ──────────────────────────────────────────────────────────

    public function moveStage(CrmProspect $prospect, int $stageId): void
    {
        $oldStage = $prospect->stage?->name ?? 'Aucun';
        $prospect->update(['stage_id' => $stageId]);
        $prospect->load('stage');
        $newStage = $prospect->stage?->name ?? 'Aucun';

        // Auto-update status when moved to won/lost stage
        if ($prospect->stage?->isWon())  { $prospect->update(['status' => 'won']); }
        if ($prospect->stage?->isLost()) { $prospect->update(['status' => 'lost']); }

        $this->log($prospect, 'stage_changed', "Étape changée : {$oldStage} → {$newStage}", [
            'old_stage' => $oldStage,
            'new_stage' => $newStage,
        ]);
    }

    // ── Assignment ────────────────────────────────────────────────────────────

    public function assign(CrmProspect $prospect, int $adminId): void
    {
        $oldAdmin = $prospect->assignedTo?->name ?? 'Non assigné';
        $prospect->update(['assigned_to' => $adminId]);
        $prospect->load('assignedTo');
        $newAdmin = $prospect->assignedTo?->name ?? 'Non assigné';

        $this->log($prospect, 'assigned', "Assigné à : {$newAdmin} (était : {$oldAdmin})", [
            'old_admin' => $oldAdmin,
            'new_admin' => $newAdmin,
        ]);
    }

    // ── Send email ────────────────────────────────────────────────────────────

    public function sendEmail(CrmProspect $prospect, string $subject, string $body, User $sender): \App\Models\CrmEmail
    {
        $toEmail = $prospect->email;
        $status  = 'sent';
        $error   = null;

        try {
            Mail::send([], [], function ($message) use ($toEmail, $subject, $body, $sender) {
                $message
                    ->to($toEmail)
                    ->from(config('mail.from.address'), config('mail.from.name'))
                    ->replyTo($sender->email, $sender->name)
                    ->subject($subject)
                    ->html($body);
            });
        } catch (\Throwable $e) {
            $status = 'failed';
            $error  = $e->getMessage();
            Log::error('CRM email failed', ['prospect' => $prospect->id, 'error' => $e->getMessage()]);
        }

        $email = \App\Models\CrmEmail::create([
            'prospect_id'   => $prospect->id,
            'sent_by'       => $sender->id,
            'to_email'      => $toEmail,
            'subject'       => $subject,
            'body'          => $body,
            'status'        => $status,
            'error_message' => $error,
            'sent_at'       => now(),
        ]);

        $prospect->update(['last_contact_at' => now()]);

        $this->log($prospect, 'email_sent', "Email envoyé : {$subject}", [
            'email_id' => $email->id,
            'to'       => $toEmail,
            'status'   => $status,
        ]);

        return $email;
    }

    // ── Send SMS ──────────────────────────────────────────────────────────────

    public function sendSms(CrmProspect $prospect, string $message, User $sender): \App\Models\CrmSms
    {
        $toPhone    = $prospect->phone;
        $status     = 'sent';
        $error      = null;
        $providerId = null;

        try {
            $providerId = $this->dispatchSms($toPhone, $message);
        } catch (\Throwable $e) {
            $status = 'failed';
            $error  = $e->getMessage();
            Log::warning('CRM SMS failed', ['prospect' => $prospect->id, 'error' => $e->getMessage()]);
        }

        $sms = \App\Models\CrmSms::create([
            'prospect_id'   => $prospect->id,
            'sent_by'       => $sender->id,
            'to_phone'      => $toPhone,
            'message'       => $message,
            'status'        => $status,
            'provider_id'   => $providerId,
            'error_message' => $error,
            'sent_at'       => now(),
        ]);

        $prospect->update(['last_contact_at' => now()]);

        $this->log($prospect, 'sms_sent', "SMS envoyé au {$toPhone}", [
            'sms_id' => $sms->id,
            'status' => $status,
        ]);

        return $sms;
    }

    /**
     * Pluggable SMS dispatch. Configure TWILIO_* or VONAGE_* in .env.
     * Returns a provider message ID, or null if using log driver.
     */
    private function dispatchSms(string $to, string $message): ?string
    {
        $driver = config('services.sms.driver', 'log');

        if ($driver === 'twilio') {
            $client = new \Twilio\Rest\Client(
                config('services.twilio.sid'),
                config('services.twilio.token')
            );
            $msg = $client->messages->create($to, [
                'from' => config('services.twilio.from'),
                'body' => $message,
            ]);
            return $msg->sid;
        }

        if ($driver === 'vonage') {
            $vonage = new \Vonage\Client(
                new \Vonage\Client\Credentials\Basic(
                    config('services.vonage.key'),
                    config('services.vonage.secret')
                )
            );
            $response = $vonage->sms()->send(
                new \Vonage\SMS\Message\SMS($to, config('services.vonage.from'), $message)
            );
            return $response->current()->getMessageId();
        }

        // Log driver (dev / fallback)
        Log::info("CRM SMS [LOG DRIVER] → {$to}: {$message}");
        return 'log-' . uniqid();
    }

    // ── Reminders ─────────────────────────────────────────────────────────────

    public function markReminderDone(CrmReminder $reminder): void
    {
        $reminder->update(['status' => 'done', 'done_at' => now()]);

        $this->log(
            $reminder->prospect,
            'reminder_done',
            "Relance accomplie : {$reminder->title}",
            ['reminder_id' => $reminder->id],
        );
    }

    // ── Conversion funnel stats ───────────────────────────────────────────────

    public function funnelStats(): array
    {
        $total  = CrmProspect::count();
        $won    = CrmProspect::where('status', 'won')->count();
        $lost   = CrmProspect::where('status', 'lost')->count();
        $active = CrmProspect::where('status', 'active')->count();

        return [
            'total'           => $total,
            'active'          => $active,
            'won'             => $won,
            'lost'            => $lost,
            'conversion_rate' => $total > 0 ? round(($won / $total) * 100, 1) : 0,
        ];
    }
}
