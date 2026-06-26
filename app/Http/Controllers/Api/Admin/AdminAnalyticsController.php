<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\AnalyticsDailyStat;
use App\Models\AnalyticsMonthStat;
use App\Models\LeadEvent;
use App\Models\AutoSchool;
use Illuminate\Http\Request;

class AdminAnalyticsController extends Controller
{
    /**
     * Get platform-wide analytics dashboard
     * GET /api/v1/admin/analytics/dashboard?days=30
     */
    public function dashboard(Request $request)
    {
        $days = $request->query('days', 30);
        $endDate = today();
        $startDate = $endDate->copy()->subDays($days - 1);

        $stats = AnalyticsDailyStat::whereBetween('date', [$startDate, $endDate])->get();
        $schools = AutoSchool::count();
        $leads = LeadEvent::whereBetween('created_at', [$startDate, now()])->count();

        return response()->json([
            'summary' => [
                'total_views' => $stats->sum('total_views'),
                'total_clicks' => $stats->sum('total_clicks'),
                'total_leads' => $stats->sum('new_leads'),
                'avg_ctr' => $stats->count() > 0 ? round($stats->avg('total_clicks') / $stats->avg('total_views') * 100, 2) : 0,
                'total_schools' => $schools,
                'recent_leads' => $leads,
            ],
            'daily_stats' => $stats,
            'chart_data' => [
                'views' => [
                    'labels' => $stats->map(fn($s) => $s->date->format('M d'))->toArray(),
                    'data' => $stats->map(fn($s) => $s->total_views)->toArray(),
                ],
                'clicks' => [
                    'labels' => $stats->map(fn($s) => $s->date->format('M d'))->toArray(),
                    'data' => $stats->map(fn($s) => $s->total_clicks)->toArray(),
                ],
                'leads' => [
                    'labels' => $stats->map(fn($s) => $s->date->format('M d'))->toArray(),
                    'data' => $stats->map(fn($s) => $s->new_leads)->toArray(),
                ],
            ],
            'top_schools' => $this->getTopSchools(10),
        ]);
    }

    /**
     * Get revenue analytics
     * GET /api/v1/admin/analytics/revenue?period=monthly
     */
    public function revenue(Request $request)
    {
        $period = $request->query('period', 'monthly'); // daily, weekly, monthly
        $months = $request->query('months', 12);

        if ($period === 'monthly') {
            $stats = AnalyticsMonthStat::where('year', now()->year)
                ->orderBy('month')
                ->get();

            return response()->json([
                'period' => 'monthly',
                'data' => $stats->map(fn($s) => [
                    'month' => $s->formatted_month,
                    'views' => $s->total_views,
                    'clicks' => $s->total_clicks,
                    'leads' => $s->new_leads,
                ]),
            ]);
        }

        return response()->json(['message' => 'Unsupported period'], 400);
    }

    /**
     * Get growth metrics
     * GET /api/v1/admin/analytics/growth?metric=schools|users|revenue
     */
    public function growth(Request $request)
    {
        $metric = $request->query('metric', 'schools');
        $months = 12;
        $startDate = now()->subMonths($months);

        switch ($metric) {
            case 'views':
                $data = $this->getViewsGrowth($startDate);
                break;
            case 'leads':
                $data = $this->getLeadsGrowth($startDate);
                break;
            case 'clicks':
                $data = $this->getClicksGrowth($startDate);
                break;
            default:
                return response()->json(['message' => 'Invalid metric'], 400);
        }

        return response()->json($data);
    }

    /**
     * Get top performing schools
     * GET /api/v1/admin/analytics/top-schools?limit=10
     */
    public function topSchools(Request $request)
    {
        $limit = $request->query('limit', 10);
        $schools = $this->getTopSchools($limit);

        return response()->json($schools);
    }

    /**
     * Get top click types across all schools
     * GET /api/v1/admin/analytics/top-clicks?limit=7
     */
    public function topClicks(Request $request)
    {
        $limit = $request->query('limit', 7);
        $days = $request->query('days', 30);
        $endDate = today();
        $startDate = $endDate->copy()->subDays($days - 1);

        $stats = AnalyticsDailyStat::whereBetween('date', [$startDate, $endDate])->get();

        $clicks = [
            'Phone' => $stats->sum('phone_clicks'),
            'WhatsApp' => $stats->sum('whatsapp_clicks'),
            'Website' => $stats->sum('website_clicks'),
            'Facebook' => $stats->sum('facebook_clicks'),
            'Instagram' => $stats->sum('instagram_clicks'),
            'Email' => $stats->sum('email_clicks'),
            'Maps' => $stats->sum('maps_clicks'),
        ];

        arsort($clicks);

        return response()->json(array_slice($clicks, 0, $limit, true));
    }

    /**
     * Get device breakdown
     * GET /api/v1/admin/analytics/devices?days=30
     */
    public function devices(Request $request)
    {
        $days = $request->query('days', 30);
        $endDate = today();
        $startDate = $endDate->copy()->subDays($days - 1);

        $stats = AnalyticsDailyStat::whereBetween('date', [$startDate, $endDate])->get();

        return response()->json([
            'desktop' => $stats->sum('desktop_views'),
            'mobile' => $stats->sum('mobile_views'),
            'tablet' => $stats->sum('tablet_views'),
        ]);
    }

    /**
     * Get all leads (admin view)
     * GET /api/v1/admin/analytics/leads?status=new&page=1
     */
    public function leads(Request $request)
    {
        $query = LeadEvent::query();

        // Filter by status
        if ($request->has('status')) {
            $query->byStatus($request->query('status'));
        }

        // Filter by school
        if ($request->has('school_id')) {
            $query->where('auto_school_id', $request->query('school_id'));
        }

        // Search
        if ($request->has('search')) {
            $search = $request->query('search');
            $query->where('visitor_name', 'like', "%$search%")
                  ->orWhere('visitor_email', 'like', "%$search%");
        }

        $leads = $query->latest()->paginate(20);

        return response()->json($leads);
    }

    /**
     * Get helper methods
     */
    private function getTopSchools($limit = 10)
    {
        return AutoSchool::withCount('reviews')
            ->withSum('analyticsDailyStat', 'total_views')
            ->latest('analytics_daily_stat_sum_total_views')
            ->limit($limit)
            ->get()
            ->map(fn($school) => [
                'id' => $school->id,
                'name' => $school->name,
                'views' => $school->analytics_daily_stat_sum_total_views ?? 0,
                'reviews_count' => $school->reviews_count,
                'rating' => $school->average_rating,
            ]);
    }

    private function getViewsGrowth($startDate)
    {
        $stats = AnalyticsDailyStat::where('date', '>=', $startDate)
            ->get()
            ->groupBy(function ($item) {
                return $item->date->format('Y-m');
            })
            ->map(fn($group) => $group->sum('total_views'));

        return [
            'metric' => 'views',
            'labels' => $stats->keys()->toArray(),
            'data' => $stats->values()->toArray(),
        ];
    }

    private function getLeadsGrowth($startDate)
    {
        $stats = AnalyticsDailyStat::where('date', '>=', $startDate)
            ->get()
            ->groupBy(function ($item) {
                return $item->date->format('Y-m');
            })
            ->map(fn($group) => $group->sum('new_leads'));

        return [
            'metric' => 'leads',
            'labels' => $stats->keys()->toArray(),
            'data' => $stats->values()->toArray(),
        ];
    }

    private function getClicksGrowth($startDate)
    {
        $stats = AnalyticsDailyStat::where('date', '>=', $startDate)
            ->get()
            ->groupBy(function ($item) {
                return $item->date->format('Y-m');
            })
            ->map(fn($group) => $group->sum('total_clicks'));

        return [
            'metric' => 'clicks',
            'labels' => $stats->keys()->toArray(),
            'data' => $stats->values()->toArray(),
        ];
    }
}
