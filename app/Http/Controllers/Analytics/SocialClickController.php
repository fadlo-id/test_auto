<?php

namespace App\Http\Controllers\Analytics;

use App\Http\Controllers\Controller;
use App\Models\AutoSchool;
use App\Models\CreditBalance;
use App\Services\CreditService;
use App\Services\TrackingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SocialClickController extends Controller
{
    public function __construct(
        private TrackingService $tracking,
        private CreditService $credits,
    ) {}

    public function store(Request $request): JsonResponse
    {
        $allowedTypes = implode(',', CreditBalance::CLICK_TYPES);
        $request->validate([
            'school_id'  => 'required|integer|exists:auto_schools,id',
            'click_type' => "required|string|in:{$allowedTypes}",
        ]);

        $school = AutoSchool::find($request->school_id);

        if (! $school || $school->status !== 'approved' || ! $school->is_active) {
            return response()->json(['ok' => false], 422);
        }

        try {
            // Raw event + daily stats (always recorded)
            $this->tracking->trackClick($school, $request->click_type, $request, $request->user()?->id);
            // Dedup + credit consumption (unique visitor per type per day only)
            $this->credits->trackClick($school, $request->click_type, $request);
        } catch (\Throwable) {
            // Never let tracking break the page
        }

        return response()->json(['ok' => true]);
    }
}
