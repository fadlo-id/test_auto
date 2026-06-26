<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AutoSchool;
use App\Models\Payment;
use App\Models\Review;
use App\Models\Subscription;
use App\Models\User;
use Carbon\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $stats = [
            'total_users'         => User::count(),
            'total_schools'       => AutoSchool::count(),
            'pending_schools'     => AutoSchool::where('status', 'pending')->count(),
            'active_subscriptions' => Subscription::where('status', 'active')->count(),
            'total_revenue'       => Payment::where('status', 'completed')->sum('amount'),
            'pending_reviews'     => Review::where('status', 'pending')->count(),
        ];

        $monthlyUsers = User::selectRaw('DATE_FORMAT(created_at, "%Y-%m") as month, COUNT(*) as count')
            ->where('created_at', '>=', Carbon::now()->subMonths(12))
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        $monthlyRevenue = Payment::selectRaw('DATE_FORMAT(created_at, "%Y-%m") as month, SUM(amount) as revenue')
            ->where('status', 'completed')
            ->where('created_at', '>=', Carbon::now()->subMonths(12))
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        $subscriptionBreakdown = Subscription::selectRaw('plan_id, COUNT(*) as count')
            ->with('plan:id,name')
            ->where('status', 'active')
            ->groupBy('plan_id')
            ->get()
            ->map(fn($s) => ['name' => $s->plan?->name ?? 'Inconnu', 'count' => $s->count]);

        $recentSchools = AutoSchool::with('user:id,name,email')
            ->latest()
            ->take(5)
            ->get(['id', 'name', 'city', 'status', 'created_at', 'user_id']);

        return Inertia::render('Admin/Dashboard', compact(
            'stats',
            'monthlyUsers',
            'monthlyRevenue',
            'subscriptionBreakdown',
            'recentSchools'
        ));
    }
}
