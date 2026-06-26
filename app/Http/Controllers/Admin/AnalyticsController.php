<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AutoSchool;
use App\Models\Payment;
use App\Models\Review;
use App\Models\Subscription;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AnalyticsController extends Controller
{
    public function index(Request $request): Response
    {
        $months = 12;

        $monthlyRevenue = Payment::where('status', 'completed')
            ->where('created_at', '>=', now()->subMonths($months))
            ->selectRaw('DATE_FORMAT(created_at, "%Y-%m") as month, SUM(amount) as revenue, COUNT(*) as count')
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        $monthlySchools = AutoSchool::where('created_at', '>=', now()->subMonths($months))
            ->selectRaw('DATE_FORMAT(created_at, "%Y-%m") as month, COUNT(*) as count')
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        $monthlyUsers = User::where('created_at', '>=', now()->subMonths($months))
            ->selectRaw('DATE_FORMAT(created_at, "%Y-%m") as month, COUNT(*) as count')
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        $cityBreakdown = AutoSchool::active()
            ->selectRaw('city, COUNT(*) as count')
            ->groupBy('city')
            ->orderByDesc('count')
            ->take(10)
            ->get();

        $subscriptionBreakdown = Subscription::where('status', 'active')
            ->with('plan:id,name')
            ->selectRaw('plan_id, COUNT(*) as count')
            ->groupBy('plan_id')
            ->get()
            ->map(fn ($s) => ['plan' => $s->plan?->name ?? 'Unknown', 'count' => $s->count]);

        $totals = [
            'revenue'       => Payment::where('status', 'completed')->sum('amount'),
            'active_schools'=> AutoSchool::active()->count(),
            'active_subs'   => Subscription::where('status', 'active')->count(),
            'pending_reviews' => Review::where('status', 'pending')->count(),
        ];

        return Inertia::render('Admin/Analytics', compact(
            'monthlyRevenue', 'monthlySchools', 'monthlyUsers',
            'cityBreakdown', 'subscriptionBreakdown', 'totals'
        ));
    }
}
