<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AutoSchool;
use App\Services\AnalyticsService;
use Illuminate\Http\Request;

class SchoolDashboardController extends Controller
{
    protected $analyticsService;

    public function __construct(AnalyticsService $analyticsService)
    {
        $this->analyticsService = $analyticsService;
    }

    /**
     * Get complete dashboard data
     * GET /api/v1/school/dashboard/{id}
     */
    public function index($id)
    {
        $school = AutoSchool::with([
            'subscription.plan',
            'reviews',
            'services',
        ])->findOrFail($id);

        // Check authorization
        if (auth()->user()->id !== $school->user_id && !auth()->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Get analytics data
        $analytics = $this->analyticsService->getDashboardData($school, 30);

        return response()->json([
            'id' => $school->id,
            'name' => $school->name,
            'email' => $school->email,
            'phone' => $school->phone,
            'address' => $school->address,
            'city' => $school->city,
            'description' => $school->description,
            'website' => $school->website,
            'latitude' => $school->latitude,
            'longitude' => $school->longitude,
            'logo' => $school->logo,
            'banner' => $school->banner,
            'is_verified' => $school->is_verified,
            'slug' => $school->slug,
            'reviews_count' => $school->reviews()->count(),
            'reviews_avg_rating' => $school->reviews()->avg('rating'),
            'services_count' => $school->services()->count(),
            'subscription' => $school->subscription ? [
                'id' => $school->subscription->id,
                'plan' => $school->subscription->plan,
                'starts_at' => $school->subscription->starts_at,
                'ends_at' => $school->subscription->ends_at,
            ] : null,
            'services' => $school->services()->select('id', 'name', 'description', 'price', 'duration')->get(),
            'analytics' => $analytics['summary'] ?? null,
        ]);
    }
}
