<?php

namespace App\Console\Commands;

use App\Models\Subscription;
use App\Services\NotificationService;
use Illuminate\Console\Command;

class CheckExpiredSubscriptions extends Command
{
    protected $signature   = 'subscriptions:check-expired';
    protected $description = 'Mark expired subscriptions and notify schools';

    public function __construct(private NotificationService $notifications) {
        parent::__construct();
    }

    public function handle(): int
    {
        // Mark expired active subscriptions
        $expired = Subscription::where('status', 'active')
            ->where('expires_at', '<', now())
            ->with('autoSchool:id,name,email,user_id')
            ->get();

        foreach ($expired as $subscription) {
            $subscription->update(['status' => 'cancelled', 'cancelled_at' => now(), 'cancellation_reason' => 'Expiration automatique']);
            $this->notifications->notifySubscriptionExpired($subscription);
            $this->info("Expired: #{$subscription->id} ({$subscription->autoSchool?->name})");
        }

        // Warn schools expiring in 7 days
        $expiringSoon = Subscription::where('status', 'active')
            ->whereBetween('expires_at', [now(), now()->addDays(7)])
            ->with('autoSchool:id,name,email,user_id')
            ->get();

        foreach ($expiringSoon as $subscription) {
            $this->notifications->notifySubscriptionExpiringSoon($subscription);
            $this->info("Expiring soon: #{$subscription->id} ({$subscription->autoSchool?->name})");
        }

        $this->info("Done. Expired: {$expired->count()}, Expiring soon: {$expiringSoon->count()}.");

        return Command::SUCCESS;
    }
}
