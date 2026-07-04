<?php

namespace App\Services;

use App\Models\AutoSchool;
use App\Models\Plan;
use App\Models\User;
use Illuminate\Http\Request;

/**
 * @deprecated  Replaced by CreditService. This class delegates to CreditService for backward compatibility.
 */
class CreditConsumptionService
{
    public function __construct(private CreditService $credits) {}

    public function trackView(AutoSchool $school, Request $request): bool
    {
        return $this->credits->trackView($school, $request);
    }

    public function trackClick(AutoSchool $school, string $clickType, Request $request): bool
    {
        return $this->credits->trackClick($school, $clickType, $request);
    }

    public function isUniqueEvent(int $schoolId, string $visitorHash, string $eventType): bool
    {
        return $this->credits->isUniqueEvent($schoolId, $visitorHash, $eventType);
    }

    public function addBonusCredits(AutoSchool $school, int $views, int $clicks, ?User $admin = null, string $notes = ''): void
    {
        $this->credits->add($school, 'view', $views, $admin, $notes);
    }

    public function resetCredits(AutoSchool $school, Plan $plan, ?User $admin = null): void
    {
        $this->credits->reset($school, null, $plan, $admin);
    }

    public function removeCredits(AutoSchool $school, int $views, int $clicks, ?User $admin = null, string $notes = ''): void
    {
        if ($views > 0) $this->credits->remove($school, 'view', $views, $admin, $notes);
    }

    public function forceReactivate(AutoSchool $school, ?User $admin = null): void
    {
        $this->credits->reactivate($school, $admin);
    }

    public function suspendSchool(AutoSchool $school, ?User $admin = null, string $reason = ''): void
    {
        $this->credits->suspendSchool($school, $admin, $reason);
    }

    public function unsuspendSchool(AutoSchool $school, ?User $admin = null): void
    {
        $this->credits->unsuspendSchool($school, $admin);
    }

    public function exhaustCredits(AutoSchool $school): void
    {
        $this->credits->exhaustAll($school);
    }

    public function cleanOldDedupRecords(): int
    {
        return $this->credits->cleanOldDedupRecords();
    }

    public function getCreditSummary(AutoSchool $school): array
    {
        return $this->credits->getSummary($school);
    }

    public function generateVisitorHash(Request $request): string
    {
        return app(VisitorFingerprintService::class)->fingerprint($request);
    }
}
