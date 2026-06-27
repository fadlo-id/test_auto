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
        $owner = $school->user;
        Log::info("New review pending for school #{$school->id} ({$school->name})");

        if (! $owner?->email) {
            return;
        }

        try {
            $dashboardUrl = route('school.reviews');
            Mail::raw(
                "Bonjour {$owner->name},\n\nUn nouvel avis a été soumis pour votre auto-école \"{$school->name}\" et est en attente de validation par notre équipe.\n\nConsultez votre tableau de bord :\n{$dashboardUrl}\n\nCordialement,\nL'équipe AutoEcoles.ma",
                fn ($msg) => $msg
                    ->to($owner->email, $owner->name)
                    ->subject("Nouvel avis soumis — {$school->name}")
            );
        } catch (\Exception $e) {
            Log::warning("Failed to send new review notification school #{$school->id}: {$e->getMessage()}");
        }
    }
}
