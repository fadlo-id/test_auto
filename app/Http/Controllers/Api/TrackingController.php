<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AutoSchool;
use App\Services\TrackingService;
use Illuminate\Http\Request;

class TrackingController extends Controller
{
    protected $trackingService;

    public function __construct(TrackingService $trackingService)
    {
        $this->trackingService = $trackingService;
    }

    /**
     * Track a school profile view
     * POST /api/v1/track/view
     */
    public function trackView(Request $request)
    {
        $validated = $request->validate([
            'school_slug' => 'required|string',
        ]);

        $school = AutoSchool::where('slug', $validated['school_slug'])->firstOrFail();
        $userId = auth()->id();

        $view = $this->trackingService->trackView($school, $request, $userId);

        return response()->json([
            'message' => 'View tracked successfully',
            'data' => $view,
        ]);
    }

    /**
     * Track a click event
     * POST /api/v1/track/click
     */
    public function trackClick(Request $request)
    {
        $validated = $request->validate([
            'school_slug' => 'required|string',
            'click_type' => 'required|in:phone,whatsapp,website,facebook,instagram,email,maps',
        ]);

        $school = AutoSchool::where('slug', $validated['school_slug'])->firstOrFail();
        $userId = auth()->id();

        $click = $this->trackingService->trackClick(
            $school,
            $validated['click_type'],
            $request,
            $userId
        );

        return response()->json([
            'message' => 'Click tracked successfully',
            'data' => $click,
        ]);
    }

    /**
     * Track a lead/contact submission
     * POST /api/v1/track/lead
     */
    public function trackLead(Request $request)
    {
        $validated = $request->validate([
            'school_slug' => 'required|string',
            'visitor_name' => 'required|string|max:255',
            'visitor_email' => 'required|email',
            'visitor_phone' => 'required|string|max:20',
            'visitor_message' => 'nullable|string|max:1000',
        ]);

        $school = AutoSchool::where('slug', $validated['school_slug'])->firstOrFail();
        $userId = auth()->id();

        $lead = $this->trackingService->trackLead(
            $school,
            $validated['visitor_name'],
            $validated['visitor_email'],
            $validated['visitor_phone'],
            $request,
            $validated['visitor_message'] ?? null,
            $userId
        );

        return response()->json([
            'message' => 'Lead tracked successfully',
            'data' => $lead,
        ], 201);
    }
}
