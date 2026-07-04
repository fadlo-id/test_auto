<?php

namespace App\Http\Controllers\School;

use App\Http\Controllers\Controller;
use App\Models\AnalyticsDailyStat;
use App\Services\CreditConsumptionService;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __construct(private CreditConsumptionService $credits) {}

    public function index(): Response|\Illuminate\Http\RedirectResponse
    {
        $school = auth()->user()->autoSchool;

        if (! $school) {
            return redirect()->route('school.settings')
                ->with('warning', 'Veuillez créer votre auto-école pour accéder au tableau de bord.');
        }

        $school->loadCount('services')->load(['subscription.plan']);

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

        // Analytics last 30 days
        $last30 = AnalyticsDailyStat::where('auto_school_id', $school->id)
            ->where('date', '>=', now()->subDays(30)->toDateString())
            ->selectRaw('SUM(total_views) as views, SUM(total_clicks) as clicks, SUM(new_leads) as leads')
            ->first();

        // Single aggregate query instead of 5 separate counts (total/pending/confirmed/month/last30).
        $bookingAgg = $school->bookings()->selectRaw('
                COUNT(*) as total,
                SUM(CASE WHEN status = "pending" THEN 1 ELSE 0 END) as pending,
                SUM(CASE WHEN status = "confirmed" THEN 1 ELSE 0 END) as confirmed,
                SUM(CASE WHEN created_at >= ? THEN 1 ELSE 0 END) as month,
                SUM(CASE WHEN created_at >= ? THEN 1 ELSE 0 END) as last30
            ', [now()->startOfMonth(), now()->subDays(30)->startOfDay()])
            ->first();

        $bookingStats = [
            'total'     => (int) $bookingAgg->total,
            'pending'   => (int) $bookingAgg->pending,
            'confirmed' => (int) $bookingAgg->confirmed,
            'month'     => (int) $bookingAgg->month,
        ];

        $views30        = (int) ($last30?->views ?? 0);
        $bookings30     = (int) $bookingAgg->last30;
        $conversionRate = $views30 > 0 ? round(($bookings30 / $views30) * 100, 2) : 0;

        return Inertia::render('SchoolDashboard/Overview', [
            'school'         => $school,
            'reviewStats'    => $reviewStats,
            'recentReviews'  => $recentReviews,
            'analytics30d'   => [
                'views'    => $views30,
                'clicks'   => (int) ($last30?->clicks ?? 0),
                'leads'    => (int) ($last30?->leads  ?? 0),
            ],
            'bookingStats'   => $bookingStats,
            'conversionRate' => $conversionRate,
            'creditSummary'  => $this->credits->getCreditSummary($school),
        ]);
    }
}
