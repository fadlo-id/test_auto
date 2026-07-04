<?php

namespace App\Console\Commands;

use App\Models\AutoSchool;
use App\Services\CreditService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

/**
 * Monthly credit reset safety net.
 *
 * Paid schools already get their credits restored the moment Stripe confirms
 * a renewal (StripeWebhookController::handleInvoicePaymentSucceeded ->
 * CreditService::restoreOnRenewal). This command covers the two cases that
 * path doesn't:
 *
 *  1. Free-tier schools (no active subscription) — nothing else ever resets
 *     their quota, so it's done here once every ~30 days per school.
 *  2. A safety net for paid schools whose `credits_reset_at` has gone stale
 *     (35+ days — a generous grace period) in case a renewal webhook was
 *     ever missed, so a school never gets silently stuck exhausted.
 */
class ResetMonthlyCredits extends Command
{
    protected $signature   = 'credits:monthly-reset';
    protected $description = 'Reset free-tier school credits monthly, and safety-net paid schools with a stale reset date';

    public function __construct(private CreditService $credits)
    {
        parent::__construct();
    }

    public function handle(): int
    {
        $dueDate = now()->subDays(30);
        $staleDate = now()->subDays(35);

        $freeSchools = AutoSchool::query()
            ->where('is_active', true)
            ->whereDoesntHave('activeSubscription')
            ->where(fn ($q) => $q->whereNull('credits_reset_at')->orWhere('credits_reset_at', '<=', $dueDate))
            ->get();

        foreach ($freeSchools as $school) {
            try {
                $this->credits->resetToFreeQuota($school);
                $this->line("Free-tier reset: school #{$school->id} ({$school->name})");
            } catch (\Throwable $e) {
                Log::error('Monthly credit reset failed (free tier)', ['school_id' => $school->id, 'error' => $e->getMessage()]);
            }
        }

        $staleSubscribed = AutoSchool::query()
            ->where('is_active', true)
            ->whereHas('activeSubscription')
            ->where(fn ($q) => $q->whereNull('credits_reset_at')->orWhere('credits_reset_at', '<=', $staleDate))
            ->with('activeSubscription.plan')
            ->get();

        foreach ($staleSubscribed as $school) {
            $plan = $school->activeSubscription?->plan;
            if (! $plan) continue;

            try {
                $this->credits->restoreOnRenewal($school, $plan);
                $this->line("Safety-net reset: school #{$school->id} ({$school->name})");
            } catch (\Throwable $e) {
                Log::error('Monthly credit reset failed (safety net)', ['school_id' => $school->id, 'error' => $e->getMessage()]);
            }
        }

        $this->info(sprintf(
            'Monthly credit reset done: %d free-tier, %d safety-net.',
            $freeSchools->count(),
            $staleSubscribed->count()
        ));

        return self::SUCCESS;
    }
}
