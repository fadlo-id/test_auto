<?php

namespace App\Services;

use App\Mail\SchoolApproved;
use App\Mail\SchoolRejected;
use App\Mail\SubscriptionExpired;
use App\Mail\SubscriptionExpiringSoon;
use App\Models\AutoSchool;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class NotificationService
{
    public function notifySchoolApproved(AutoSchool $school): void
    {
        $owner = $school->user;
        if (! $owner?->email) {
            return;
        }

        try {
            Mail::to($owner->email)->queue(new SchoolApproved($school));
        } catch (\Exception $e) {
            Log::warning("Failed to send school approved email #{$school->id}: {$e->getMessage()}");
        }
    }

    public function notifySchoolRejected(AutoSchool $school, string $reason): void
    {
        $owner = $school->user;
        if (! $owner?->email) {
            return;
        }

        try {
            Mail::to($owner->email)->queue(new SchoolRejected($school, $reason));
        } catch (\Exception $e) {
            Log::warning("Failed to send school rejected email #{$school->id}: {$e->getMessage()}");
        }
    }

    public function notifyReviewApproved(User $user, AutoSchool $school): void
    {
        // Notification légère via log (email Phase future si besoin)
        Log::info("Review approved for user #{$user->id} on school #{$school->id}");
    }

    public function notifySubscriptionExpiringSoon(Subscription $subscription): void
    {
        $owner = $subscription->autoSchool?->user;
        if (! $owner?->email) {
            return;
        }

        try {
            Mail::to($owner->email)->queue(new SubscriptionExpiringSoon($subscription));
        } catch (\Exception $e) {
            Log::warning("Failed to send expiring soon email subscription #{$subscription->id}: {$e->getMessage()}");
        }
    }

    public function notifySubscriptionExpired(Subscription $subscription): void
    {
        $owner = $subscription->autoSchool?->user;
        if (! $owner?->email) {
            return;
        }

        try {
            Mail::to($owner->email)->queue(new SubscriptionExpired($subscription));
        } catch (\Exception $e) {
            Log::warning("Failed to send expired email subscription #{$subscription->id}: {$e->getMessage()}");
        }
    }

    public function notifyNewReview(AutoSchool $school): void
    {
        // Log only — school owners check their dashboard
        Log::info("New review pending for school #{$school->id} ({$school->name})");
    }
}
