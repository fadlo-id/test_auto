<?php

namespace App\Http\Controllers\Api;

use App\Models\User;
use App\Models\AutoSchool;
use App\Models\Subscription;
use App\Models\Payment;
use App\Models\Review;
use App\Http\Controllers\Controller;
use Carbon\Carbon;

class AdminDashboardController extends Controller
{
    public function index()
    {
        $totalUsers         = User::count();
        $totalSchools       = AutoSchool::count();
        $totalSubscriptions = Subscription::where('status', 'active')->count();
        $totalRevenue       = Payment::where('status', 'completed')->sum('amount');
        $pendingReviews     = Review::where('status', 'pending')->count();

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
            ->map(fn($item) => [
                'name'  => $item->plan?->name ?? 'Unknown',
                'count' => $item->count,
            ]);

        return response()->json([
            'total_users'            => $totalUsers,
            'total_schools'          => $totalSchools,
            'total_subscriptions'    => $totalSubscriptions,
            'total_revenue'          => $totalRevenue,
            'pending_reviews'        => $pendingReviews,
            'monthly_users'          => $monthlyUsers,
            'monthly_revenue'        => $monthlyRevenue,
            'subscription_breakdown' => $subscriptionBreakdown,
        ]);
    }
}
