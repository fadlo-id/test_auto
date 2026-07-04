<?php

namespace App\Notifications;

use App\Models\CrmReminder;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class CrmReminderDueNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public $tries = 3;
    public $backoff = [60, 300, 900];

    public function __construct(public CrmReminder $reminder) {}

    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $prospect = $this->reminder->prospect;

        return (new MailMessage)
            ->subject("⏰ Relance CRM : {$this->reminder->title}")
            ->greeting("Bonjour {$notifiable->name},")
            ->line("Une relance arrive à échéance pour le prospect **{$prospect->name}**.")
            ->line("**Relance :** {$this->reminder->title}")
            ->line("**Échéance :** {$this->reminder->due_at->format('d/m/Y à H:i')}")
            ->when($this->reminder->note, fn ($m) => $m->line("**Note :** {$this->reminder->note}"))
            ->action('Voir le prospect', url("/admin/crm/prospects/{$prospect->id}"))
            ->salutation("L'équipe AutoEcoles Maroc");
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type'          => 'crm_reminder',
            'title'         => "Relance : {$this->reminder->title}",
            'message'       => "Prospect : {$this->reminder->prospect?->name}",
            'reminder_id'   => $this->reminder->id,
            'prospect_id'   => $this->reminder->prospect_id,
            'due_at'        => $this->reminder->due_at?->toIsoString(),
        ];
    }
}
