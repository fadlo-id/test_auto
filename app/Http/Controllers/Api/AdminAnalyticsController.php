<?php

namespace App\Http\Controllers\Api;

use App\Models\User;
use App\Models\AutoSchool;
use App\Models\Subscription;
use App\Models\Payment;
use App\Models\Plan;
use App\Http\Controllers\Controller;
use Carbon\Carbon;
use Illuminate\Http\Request;

class AdminAnalyticsController extends Controller
{
    public function index(Request $request)
    {
        $range = $request->input('range', 30);
        $startDate = Carbon::now()->subDays($range);

        // Monthly users
        $monthlyUsers = $this->getMonthlyUsers($startDate);

        // Monthly revenue
        $monthlyRevenue = $this->getMonthlyRevenue($startDate);

        // Monthly subscriptions
        $monthlySubscriptions = $this->getMonthlySubscriptions($startDate);

        // User growth
        $userGrowth = $this->getUserGrowth($startDate);

        // School growth
        $schoolGrowth = $this->getSchoolGrowth($startDate);

        // Subscription types
        $subscriptionTypes = $this->getSubscriptionTypes();

        // Top plans
        $topPlans = $this->getTopPlans();

        return response()->json([
            'monthly_users' => $monthlyUsers,
            'monthly_revenue' => $monthlyRevenue,
            'monthly_subscriptions' => $monthlySubscriptions,
            'user_growth' => $userGrowth,
            'school_growth' => $schoolGrowth,
            'subscription_types' => $subscriptionTypes,
            'top_plans' => $topPlans,
        ]);
    }

    private function getMonthlyUsers($startDate)
    {
        return User::selectRaw('DATE_FORMAT(created_at, "%Y-%m") as month, COUNT(*) as total_users, COUNT(IF(created_at >= DATE_SUB(NOW(), INTERVAL 1 MONTH), 1, NULL)) as new_users')
            ->where('created_at', '>=', $startDate)
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->toArray();
    }

    private function getMonthlyRevenue($startDate)
    {
        return Payment::selectRaw('DATE_FORMAT(created_at, "%Y-%m") as month, SUM(IF(status="completed", amount, 0)) as revenue, SUM(IF(status="refunded", amount, 0)) as refunds')
            ->where('created_at', '>=', $startDate)
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->toArray();
    }

    private function getMonthlySubscriptions($startDate)
    {
        return Subscription::selectRaw('DATE_FORMAT(created_at, "%Y-%m") as month, COUNT(IF(status="active", 1, NULL)) as new, COUNT(IF(status="cancelled", 1, NULL)) as cancelled, COUNT(*) as total')
            ->where('created_at', '>=', $startDate)
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->toArray();
    }

    private function getUserGrowth($startDate)
    {
        return User::selectRaw('DATE_FORMAT(created_at, "%Y-%m") as month, COUNT(*) as count')
            ->where('created_at', '>=', $startDate)
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->toArray();
    }

    private function getSchoolGrowth($startDate)
    {
        return AutoSchool::selectRaw('DATE_FORMAT(created_at, "%Y-%m") as month, COUNT(*) as count')
            ->where('created_at', '>=', $startDate)
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->toArray();
    }

    private function getSubscriptionTypes()
    {
        return Subscription::selectRaw('plan_id, COUNT(*) as count')
            ->with('plan:id,name')
            ->where('status', 'active')
            ->groupBy('plan_id')
            ->get()
            ->map(function ($item) {
                return [
                    'name' => $item->plan?->name ?? 'Unknown',
                    'count' => $item->count,
                ];
            })
            ->toArray();
    }

    private function getTopPlans()
    {
        return Plan::selectRaw('plans.id, plans.name, plans.price, COUNT(subscriptions.id) as subscriptions')
            ->leftJoin('subscriptions', 'subscriptions.plan_id', '=', 'plans.id')
            ->groupBy('plans.id', 'plans.name', 'plans.price')
            ->orderByDesc('subscriptions')
            ->limit(5)
            ->get()
            ->map(function ($plan) {
                return [
                    'name' => $plan->name,
                    'price' => $plan->price,
                    'subscriptions' => $plan->subscriptions,
                    'growth' => rand(-15, 35), // Placeholder - calculate actual growth
                ];
            })
            ->toArray();
    }
}
