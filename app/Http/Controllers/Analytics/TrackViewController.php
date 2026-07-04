<?php

namespace App\Http\Controllers\Analytics;

use App\Http\Controllers\Controller;
use App\Models\AutoSchool;
use App\Services\CreditService;
use App\Services\TrackingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TrackViewController extends Controller
{
    public function __construct(
        private TrackingService $tracking,
        private CreditService $credits,
    ) {}

    public function store(Request $request): JsonResponse
    {
        $request->validate(['school_id' => 'required|integer|exists:auto_schools,id']);

        $school = AutoSchool::find($request->school_id);

        if (! $school || $school->status !== 'approved' || ! $school->is_active) {
            return response()->json(['ok' => false], 422);
        }

        try {
            // Raw event + daily stats (always)
            $this->tracking->trackView($school, $request, $request->user()?->id);
            // Dedup + credit consumption (unique visitor only)
            $this->credits->trackView($school, $request);
        } catch (\Throwable) {
            // Never let tracking break the page
        }

        return response()->json(['ok' => true]);
    }
}
