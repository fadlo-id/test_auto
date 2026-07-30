<?php

namespace App\Observers;

use App\Models\User;
use App\Notifications\NewUserRegisteredNotification;
use Illuminate\Support\Facades\Log;

class UserObserver
{
    public function creating(User $user): void
    {
        if (empty($user->role)) {
            $user->role = User::ROLE_USER;
        }
    }

    /**
     * Feeds the Admin notification center ("nouvelles inscriptions"). Only for genuine
     * public self-registration (guest at creation time) — accounts created by an admin
     * (new admins, or a school owner created from the Admin auto-schools CRUD) are the
     * admin's own action and shouldn't notify themselves.
     */
    public function created(User $user): void
    {
        if (! in_array($user->role, [User::ROLE_USER, User::ROLE_SCHOOL_OWNER], true)) {
            return;
        }

        if (auth()->check() && auth()->user()?->isAdmin()) {
            return;
        }

        try {
            User::admins()->get()->each(fn (User $admin) => $admin->notify(new NewUserRegisteredNotification($user)));
        } catch (\Throwable $e) {
            Log::warning("Failed to notify admins of new registration #{$user->id}: {$e->getMessage()}");
        }
    }
}
