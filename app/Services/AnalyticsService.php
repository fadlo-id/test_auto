<?php

namespace App\Services;

use App\Models\AutoSchool;
use App\Models\AnalyticsDailyStat;
use App\Models\AnalyticsMonthStat;
use App\Models\ViewEvent;
use App\Models\ClickEvent;
use App\Models\LeadEvent;
use Carbon\Carbon;

class AnalyticsService
{
    /**
     * Get analytics dashboard data
     */
    public function getDashboardData(AutoSchool $school, $days = 30)
    {
        $endDate = today();
        $startDate = $endDate->copy()->subDays($days - 1);

        $stats = AnalyticsDailyStat::forSchool($school->id)
            ->dateRange($startDate, $endDate)
            ->get();

        return [
            'summary' => $this->getSummary($stats),
            'daily_stats' => $stats,
            'chart_data' => $this->getChartData($stats),
            'top_clicks' => $this->getTopClicks($school, $startDate, $endDate),
            'devices' => $this->getDeviceBreakdown($stats),
            'traffic_sources' => $this->getTrafficBreakdown($stats),
        ];
    }

    /**
     * Get summary metrics
     */
    public function getSummary($stats)
    {
        return [
            'total_views' => $stats->sum('total_views'),
            'unique_visitors' => $stats->sum('unique_visitors'),
            'total_clicks' => $stats->sum('total_clicks'),
            'new_leads' => $stats->sum('new_leads'),
            'converted_leads' => $stats->sum('converted_leads'),
            'avg_ctr' => $stats->count() > 0 ? round($stats->avg('total_clicks') / $stats->avg('total_views') * 100, 2) : 0,
            'avg_conversion_rate' => $stats->count() > 0 ? round($stats->avg('new_leads') / $stats->avg('total_views') * 100, 2) : 0,
        ];
    }

    /**
     * Get chart data
     */
    public function getChartData($stats)
    {
        return [
            'views' => [
                'labels' => $stats->map(fn($s) => $s->date->format('M d'))->toArray(),
                'data' => $stats->map(fn($s) => $s->total_views)->toArray(),
                'unique' => $stats->map(fn($s) => $s->unique_visitors)->toArray(),
            ],
            'clicks' => [
                'labels' => $stats->map(fn($s) => $s->date->format('M d'))->toArray(),
                'data' => $stats->map(fn($s) => $s->total_clicks)->toArray(),
            ],
            'leads' => [
                'labels' => $stats->map(fn($s) => $s->date->format('M d'))->toArray(),
                'new' => $stats->map(fn($s) => $s->new_leads)->toArray(),
                'converted' => $stats->map(fn($s) => $s->converted_leads)->toArray(),
            ],
        ];
    }

    /**
     * Get top clicks by type
     */
    public function getTopClicks(AutoSchool $school, $startDate, $endDate)
    {
        $stats = AnalyticsDailyStat::forSchool($school->id)
            ->dateRange($startDate, $endDate)
            ->get();

        return [
            'phone' => $stats->sum('phone_clicks'),
            'whatsapp' => $stats->sum('whatsapp_clicks'),
            'website' => $stats->sum('website_clicks'),
            'facebook' => $stats->sum('facebook_clicks'),
            'instagram' => $stats->sum('instagram_clicks'),
            'email' => $stats->sum('email_clicks'),
            'maps' => $stats->sum('maps_clicks'),
        ];
    }

    /**
     * Get device breakdown
     */
    public function getDeviceBreakdown($stats)
    {
        return [
            'desktop' => $stats->sum('desktop_views'),
            'mobile' => $stats->sum('mobile_views'),
            'tablet' => $stats->sum('tablet_views'),
        ];
    }

    /**
     * Get traffic sources breakdown
     */
    public function getTrafficBreakdown($stats)
    {
        return [
            'direct' => $stats->sum('direct_traffic'),
            'organic' => $stats->sum('organic_traffic'),
            'referral' => $stats->sum('referral_traffic'),
            'paid' => $stats->sum('paid_traffic'),
        ];
    }

    /**
     * Get comparison data (current vs previous period)
     */
    public function getComparison(AutoSchool $school, $days = 30)
    {
        $endDate = today();
        $midDate = $endDate->copy()->subDays($days);
        $startDate = $midDate->copy()->subDays($days);

        $current = AnalyticsDailyStat::forSchool($school->id)
            ->dateRange($midDate, $endDate)
            ->get();

        $previous = AnalyticsDailyStat::forSchool($school->id)
            ->dateRange($startDate, $midDate)
            ->get();

        return [
            'views' => [
                'current' => $current->sum('total_views'),
                'previous' => $previous->sum('total_views'),
                'change' => $this->calculateChange($current->sum('total_views'), $previous->sum('total_views')),
            ],
            'clicks' => [
                'current' => $current->sum('total_clicks'),
                'previous' => $previous->sum('total_clicks'),
                'change' => $this->calculateChange($current->sum('total_clicks'), $previous->sum('total_clicks')),
            ],
            'leads' => [
                'current' => $current->sum('new_leads'),
                'previous' => $previous->sum('new_leads'),
                'change' => $this->calculateChange($current->sum('new_leads'), $previous->sum('new_leads')),
            ],
        ];
    }

    /**
     * Calculate percentage change
     */
    private function calculateChange($current, $previous)
    {
        if ($previous == 0) {
            return $current > 0 ? 100 : 0;
        }
        return round((($current - $previous) / $previous) * 100, 2);
    }

    /**
     * Get monthly statistics
     */
    public function getMonthlyStats(AutoSchool $school, $year = null)
    {
        $year = $year ?? now()->year;

        return AnalyticsMonthStat::forSchool($school->id)
            ->forYear($year)
            ->orderBy('month')
            ->get();
    }

    /**
     * Get annual overview
     */
    public function getAnnualOverview(AutoSchool $school, $year = null)
    {
        $year = $year ?? now()->year;
        $stats = $this->getMonthlyStats($school, $year);

        return [
            'year' => $year,
            'months' => $stats,
            'total_views' => $stats->sum('total_views'),
            'total_clicks' => $stats->sum('total_clicks'),
            'total_leads' => $stats->sum('new_leads'),
            'best_month' => $stats->sortByDesc('total_views')->first(),
            'average_monthly_views' => $stats->count() > 0 ? round($stats->sum('total_views') / $stats->count(), 0) : 0,
        ];
    }

    /**
     * Get lead conversion funnel
     */
    public function getConversionFunnel(AutoSchool $school, $startDate, $endDate)
    {
        $views = AnalyticsDailyStat::forSchool($school->id)
            ->dateRange($startDate, $endDate)
            ->sum('total_views');

        $clicks = AnalyticsDailyStat::forSchool($school->id)
            ->dateRange($startDate, $endDate)
            ->sum('total_clicks');

        $leads = LeadEvent::forSchool($school->id)
            ->dateRange($startDate, $endDate)
            ->count();

        $converted = LeadEvent::forSchool($school->id)
            ->dateRange($startDate, $endDate)
            ->converted()
            ->count();

        return [
            'steps' => [
                ['name' => 'Views', 'count' => $views, 'percentage' => 100],
                ['name' => 'Clicks', 'count' => $clicks, 'percentage' => $views > 0 ? round(($clicks / $views) * 100, 2) : 0],
                ['name' => 'Leads', 'count' => $leads, 'percentage' => $views > 0 ? round(($leads / $views) * 100, 2) : 0],
                ['name' => 'Converted', 'count' => $converted, 'percentage' => $leads > 0 ? round(($converted / $leads) * 100, 2) : 0],
            ],
        ];
    }

    /**
     * Get ROI analysis
     */
    public function getROIAnalysis(AutoSchool $school, $startDate, $endDate)
    {
        $stats = AnalyticsDailyStat::forSchool($school->id)
            ->dateRange($startDate, $endDate)
            ->get();

        $leads = LeadEvent::forSchool($school->id)
            ->dateRange($startDate, $endDate)
            ->count();

        $subscription = $school->subscription;
        
        if (!$subscription) {
            return null;
        }

        $plan = $subscription->plan;
        $days = $startDate->diffInDays($endDate);
        $dailyCost = $plan->price / 30;
        $totalCost = $dailyCost * $days;

        $leadValue = $leads > 0 ? $totalCost / $leads : 0;
        $roi = $leads > 0 ? round((($leads * 100) / $totalCost) * 100, 2) : 0; // Assuming 100 per lead value

        return [
            'subscription_name' => $plan->name,
            'plan_price' => $plan->price,
            'daily_cost' => round($dailyCost, 2),
            'total_cost' => round($totalCost, 2),
            'leads_generated' => $leads,
            'cost_per_lead' => round($leadValue, 2),
            'roi_percentage' => $roi,
            'total_views' => $stats->sum('total_views'),
            'total_clicks' => $stats->sum('total_clicks'),
        ];
    }
}
