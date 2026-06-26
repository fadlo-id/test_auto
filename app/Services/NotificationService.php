<?php

namespace App\Services;

use App\Models\AutoSchool;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Support\Facades\Mail;

class NotificationService
{
    public function notifySchoolApproved(AutoSchool $school): void
    {
        // Phase 11: send approval email to school owner
    }

    public function notifySchoolRejected(AutoSchool $school, string $reason): void
    {
        // Phase 11: send rejection email with reason
    }

    public function notifyReviewApproved(User $user, AutoSchool $school): void
    {
        // Phase 11: notify reviewer that their review was approved
    }

    public function notifySubscriptionExpiringSoon(Subscription $subscription): void
    {
        // Phase 11: send reminder 7 days before expiry
    }

    public function notifySubscriptionExpired(Subscription $subscription): void
    {
        // Phase 11: send expiration notification
    }

    public function notifyNewReview(AutoSchool $school): void
    {
        // Phase 11: notify school owner of new pending review
    }
}
