<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\AutoSchoolResource;
use App\Models\AutoSchool;
use App\Services\AnalyticsService;
use Illuminate\Http\JsonResponse;

class SchoolDashboardController extends Controller
{
    public function __construct(private AnalyticsService $analyticsService) {}

    public function index(int $id): AutoSchoolResource|JsonResponse
    {
        $school = AutoSchool::with([
            'subscription.plan',
            'reviews',
            'services',
        ])->findOrFail($id);

        if (auth()->id() !== $school->user_id && ! auth()->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $analytics = $this->analyticsService->getDashboardData($school, 30);

        return (new AutoSchoolResource($school))->additional([
            'analytics' => $analytics['summary'] ?? null,
        ]);
    }
}
