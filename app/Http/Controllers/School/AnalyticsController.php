<?php

namespace App\Http\Controllers\School;

use App\Http\Controllers\Controller;
use App\Services\AnalyticsService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AnalyticsController extends Controller
{
    public function __construct(private AnalyticsService $analytics) {}

    public function index(Request $request): Response|\Illuminate\Http\RedirectResponse
    {
        $school = auth()->user()->autoSchool;

        if (! $school) {
            return redirect()->route('school.settings');
        }

        $days = (int) $request->input('days', 30);
        $days = in_array($days, [7, 30, 90]) ? $days : 30;

        $data       = $this->analytics->getDashboardData($school, $days);
        $comparison = $this->analytics->getComparison($school, $days);

        return Inertia::render('SchoolDashboard/Analytics', [
            'school'     => $school->only('id', 'name'),
            'analytics'  => $data,
            'comparison' => $comparison,
            'days'       => $days,
        ]);
    }
}
