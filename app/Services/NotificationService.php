<?php

namespace App\Services;

use App\Mail\BookingCancelledMail;
use App\Mail\BookingConfirmationMail;
use App\Mail\SchoolApproved;
use App\Mail\SchoolRejected;
use App\Models\AutoSchool;
use App\Models\Booking;
use App\Models\Subscription;
use App\Models\User;
use App\Notifications\NewBookingNotification;
use App\Notifications\NewReviewNotification;
use App\Notifications\ReviewApprovedNotification;
use App\Notifications\SubscriptionExpiredNotification;
use App\Notifications\SubscriptionExpiringNotification;
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

    public function notifyNewBooking(Booking $booking): void
    {
        $owner = $booking->autoSchool?->user;
        if (! $owner) {
            return;
        }

        try {
            $owner->notify(new NewBookingNotification($booking));
        } catch (\Exception $e) {
            Log::warning("Failed to send booking notification #{$booking->id}: {$e->getMessage()}");
        }
    }

    /** Confirmation sent to the candidate who submitted the booking. */
    public function notifyBookingConfirmation(Booking $booking): void
    {
        if (! $booking->email) {
            return;
        }

        try {
            Mail::to($booking->email)->queue(new BookingConfirmationMail($booking));
        } catch (\Exception $e) {
            Log::warning("Failed to send booking confirmation #{$booking->id}: {$e->getMessage()}");
        }
    }

    /** Sent to the candidate when the school cancels their booking request. */
    public function notifyBookingCancelled(Booking $booking): void
    {
        if (! $booking->email) {
            return;
        }

        try {
            Mail::to($booking->email)->queue(new BookingCancelledMail($booking));
        } catch (\Exception $e) {
            Log::warning("Failed to send booking cancellation #{$booking->id}: {$e->getMessage()}");
        }
    }

    public function notifyNewReview(AutoSchool $school): void
    {
        $owner = $school->user;
        if (! $owner) {
            return;
        }

        try {
            $owner->notify(new NewReviewNotification($school));
        } catch (\Exception $e) {
            Log::warning("Failed to send new review notification school #{$school->id}: {$e->getMessage()}");
        }
    }

    public function notifyReviewApproved(User $reviewer, AutoSchool $school): void
    {
        try {
            $reviewer->notify(new ReviewApprovedNotification($school));
        } catch (\Exception $e) {
            Log::warning("Failed to send review approved notification user #{$reviewer->id}: {$e->getMessage()}");
        }
    }

    public function notifySubscriptionExpiringSoon(Subscription $subscription): void
    {
        $owner = $subscription->autoSchool?->user;
        if (! $owner) {
            return;
        }

        try {
            $owner->notify(new SubscriptionExpiringNotification($subscription));
        } catch (\Exception $e) {
            Log::warning("Failed to send expiring soon notification subscription #{$subscription->id}: {$e->getMessage()}");
        }
    }

    public function notifySubscriptionExpired(Subscription $subscription): void
    {
        $owner = $subscription->autoSchool?->user;
        if (! $owner) {
            return;
        }

        try {
            $owner->notify(new SubscriptionExpiredNotification($subscription));
        } catch (\Exception $e) {
            Log::warning("Failed to send expired notification subscription #{$subscription->id}: {$e->getMessage()}");
        }
    }
}
