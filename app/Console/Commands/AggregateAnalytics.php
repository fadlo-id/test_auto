<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\AnalyticsDailyStat;
use App\Models\AnalyticsMonthStat;
use App\Models\ViewEvent;
use App\Models\ClickEvent;
use App\Models\LeadEvent;
use App\Models\AutoSchool;
use Carbon\Carbon;

class AggregateAnalytics extends Command
{
    protected $signature = 'analytics:aggregate {--date= : Date to aggregate (format: Y-m-d)}';
    protected $description = 'Aggregate analytics data from raw events into daily and monthly statistics';

    public function handle()
    {
        $date = $this->option('date') ? Carbon::parse($this->option('date')) : today()->subDay();

        $this->info("Aggregating analytics for {$date->format('Y-m-d')}");

        // Get all schools
        $schools = AutoSchool::all();

        foreach ($schools as $school) {
            $this->aggregateDailyStats($school, $date);
        }

        $this->aggregateMonthlyStats($date);

        $this->info('Analytics aggregation completed successfully!');
    }

    /**
     * Aggregate daily statistics
     */
    private function aggregateDailyStats(AutoSchool $school, Carbon $date)
    {
        $startOfDay = $date->copy()->startOfDay();
        $endOfDay = $date->copy()->endOfDay();

        // Get view events
        $viewEvents = ViewEvent::forSchool($school->id)
            ->whereBetween('created_at', [$startOfDay, $endOfDay])
            ->get();

        $totalViews = $viewEvents->count();
        $uniqueVisitors = $viewEvents->groupBy('user_id')->count();

        // Get click events by type
        $clickEvents = ClickEvent::forSchool($school->id)
            ->whereBetween('created_at', [$startOfDay, $endOfDay])
            ->get();

        $clicksByType = $clickEvents->groupBy('click_type')->map->count();
        $totalClicks = $clickEvents->count();

        // Get device breakdown
        $deviceBreakdown = $viewEvents->groupBy('device_type')->map->count();

        // Get traffic sources
        $trafficSources = $viewEvents->groupBy(function ($event) {
            if (empty($event->referrer_url)) {
                return 'direct';
            }
            if (strpos($event->referrer_url, 'organic') !== false) {
                return 'organic';
            }
            if (strpos($event->referrer_url, $school->website) !== false) {
                return 'referral';
            }
            return 'paid';
        })->map->count();

        // Get lead events
        $leadEvents = LeadEvent::forSchool($school->id)
            ->whereBetween('created_at', [$startOfDay, $endOfDay])
            ->get();

        $newLeads = $leadEvents->where('status', 'new')->count();
        $contactedLeads = $leadEvents->where('status', 'contacted')->count();
        $convertedLeads = $leadEvents->where('status', 'converted')->count();

        // Create or update daily stat
        AnalyticsDailyStat::updateOrCreate(
            [
                'auto_school_id' => $school->id,
                'date' => $date,
            ],
            [
                'total_views' => $totalViews,
                'unique_visitors' => $uniqueVisitors,
                'phone_clicks' => $clicksByType->get('phone', 0),
                'whatsapp_clicks' => $clicksByType->get('whatsapp', 0),
                'website_clicks' => $clicksByType->get('website', 0),
                'facebook_clicks' => $clicksByType->get('facebook', 0),
                'instagram_clicks' => $clicksByType->get('instagram', 0),
                'email_clicks' => $clicksByType->get('email', 0),
                'maps_clicks' => $clicksByType->get('maps', 0),
                'total_clicks' => $totalClicks,
                'desktop_views' => $deviceBreakdown->get('Desktop', 0),
                'mobile_views' => $deviceBreakdown->get('Mobile', 0),
                'tablet_views' => $deviceBreakdown->get('Tablet', 0),
                'direct_traffic' => $trafficSources->get('direct', 0),
                'organic_traffic' => $trafficSources->get('organic', 0),
                'referral_traffic' => $trafficSources->get('referral', 0),
                'paid_traffic' => $trafficSources->get('paid', 0),
                'new_leads' => $newLeads,
                'contacted_leads' => $contactedLeads,
                'converted_leads' => $convertedLeads,
            ]
        );

        $this->line("  ✓ Aggregated daily stats for {$school->name}");
    }

    /**
     * Aggregate monthly statistics
     */
    private function aggregateMonthlyStats(Carbon $date)
    {
        $month = $date->month;
        $year = $date->year;

        $startOfMonth = Carbon::createFromDate($year, $month, 1)->startOfMonth();
        $endOfMonth = Carbon::createFromDate($year, $month, 1)->endOfMonth();

        $schools = AutoSchool::all();

        foreach ($schools as $school) {
            // Get all daily stats for the month
            $dailyStats = AnalyticsDailyStat::forSchool($school->id)
                ->whereBetween('date', [$startOfMonth, $endOfMonth])
                ->get();

            if ($dailyStats->isEmpty()) {
                continue;
            }

            // Aggregate daily stats into monthly
            AnalyticsMonthStat::updateOrCreate(
                [
                    'auto_school_id' => $school->id,
                    'month' => $month,
                    'year' => $year,
                ],
                [
                    'total_views' => $dailyStats->sum('total_views'),
                    'unique_visitors' => $dailyStats->sum('unique_visitors'),
                    'phone_clicks' => $dailyStats->sum('phone_clicks'),
                    'whatsapp_clicks' => $dailyStats->sum('whatsapp_clicks'),
                    'website_clicks' => $dailyStats->sum('website_clicks'),
                    'facebook_clicks' => $dailyStats->sum('facebook_clicks'),
                    'instagram_clicks' => $dailyStats->sum('instagram_clicks'),
                    'email_clicks' => $dailyStats->sum('email_clicks'),
                    'maps_clicks' => $dailyStats->sum('maps_clicks'),
                    'total_clicks' => $dailyStats->sum('total_clicks'),
                    'desktop_views' => $dailyStats->sum('desktop_views'),
                    'mobile_views' => $dailyStats->sum('mobile_views'),
                    'tablet_views' => $dailyStats->sum('tablet_views'),
                    'direct_traffic' => $dailyStats->sum('direct_traffic'),
                    'organic_traffic' => $dailyStats->sum('organic_traffic'),
                    'referral_traffic' => $dailyStats->sum('referral_traffic'),
                    'paid_traffic' => $dailyStats->sum('paid_traffic'),
                    'new_leads' => $dailyStats->sum('new_leads'),
                    'contacted_leads' => $dailyStats->sum('contacted_leads'),
                    'converted_leads' => $dailyStats->sum('converted_leads'),
                ]
            );
        }

        $this->line("  ✓ Aggregated monthly stats for {$startOfMonth->format('F Y')}");
    }
}
