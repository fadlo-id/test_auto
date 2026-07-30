<?php

namespace App\Notifications;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

/** In-app only — feeds the Admin notification center, no admin inbox needs an email per signup. */
class NewUserRegisteredNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public $tries = 3;
    public $backoff = [60, 300, 900];

    public function __construct(private readonly User $user) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toDatabase(object $notifiable): array
    {
        $label = $this->user->role === User::ROLE_SCHOOL_OWNER ? 'Nouvelle inscription (auto-école)' : 'Nouvelle inscription';

        return [
            'type'  => 'user_registered',
            'title' => $label,
            'body'  => "{$this->user->name} ({$this->user->email})",
            'url'   => route('admin.users.index', ['search' => $this->user->email]),
            'icon'  => '👤',
        ];
    }
}
