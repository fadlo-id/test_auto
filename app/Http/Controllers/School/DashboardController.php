<?php

namespace App\Http\Controllers\School;

use App\Http\Controllers\Controller;
use App\Models\AutoSchool;
use Carbon\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response|\Illuminate\Http\RedirectResponse
    {
        $school = auth()->user()->autoSchool;

        if (! $school) {
            return redirect()->route('school.settings')
                ->with('warning', 'Veuillez créer votre auto-école pour accéder au tableau de bord.');
        }

        $school->load(['subscription.plan', 'services']);

        $reviewStats = $school->reviews()
            ->selectRaw('
                COUNT(*) as total,
                AVG(rating) as avg_rating,
                SUM(CASE WHEN status = "pending" THEN 1 ELSE 0 END) as pending,
                SUM(CASE WHEN status = "approved" THEN 1 ELSE 0 END) as approved
            ')
            ->first();

        $recentReviews = $school->reviews()
            ->with('user:id,name')
            ->latest()
            ->take(5)
            ->get(['id', 'user_id', 'rating', 'title', 'status', 'created_at']);

        return Inertia::render('SchoolDashboard/Overview', [
            'school'        => $school,
            'reviewStats'   => $reviewStats,
            'recentReviews' => $recentReviews,
        ]);
    }
}
