<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AutoSchool;
use App\Models\LeadEvent;
use App\Services\AnalyticsService;
use Illuminate\Http\Request;

class AnalyticsController extends Controller
{
    protected $analyticsService;

    public function __construct(AnalyticsService $analyticsService)
    {
        $this->analyticsService = $analyticsService;
    }

    /**
     * Get analytics dashboard data
     * GET /api/v1/school/analytics/dashboard?days=30
     */
    public function dashboard(Request $request)
    {
        $school = auth()->user()->autoSchool;
        
        if (!$school) {
            return response()->json(['message' => 'No school found'], 404);
        }

        $days = $request->query('days', 30);
        $data = $this->analyticsService->getDashboardData($school, $days);

        return response()->json($data);
    }

    /**
     * Get comparison data (current vs previous period)
     * GET /api/v1/school/analytics/comparison?days=30
     */
    public function comparison(Request $request)
    {
        $school = auth()->user()->autoSchool;
        
        if (!$school) {
            return response()->json(['message' => 'No school found'], 404);
        }

        $days = $request->query('days', 30);
        $data = $this->analyticsService->getComparison($school, $days);

        return response()->json($data);
    }

    /**
     * Get monthly statistics
     * GET /api/v1/school/analytics/monthly?year=2026
     */
    public function monthly(Request $request)
    {
        $school = auth()->user()->autoSchool;
        
        if (!$school) {
            return response()->json(['message' => 'No school found'], 404);
        }

        $year = $request->query('year', now()->year);
        $stats = $this->analyticsService->getMonthlyStats($school, $year);

        return response()->json($stats);
    }

    /**
     * Get annual overview
     * GET /api/v1/school/analytics/annual?year=2026
     */
    public function annual(Request $request)
    {
        $school = auth()->user()->autoSchool;
        
        if (!$school) {
            return response()->json(['message' => 'No school found'], 404);
        }

        $year = $request->query('year', now()->year);
        $data = $this->analyticsService->getAnnualOverview($school, $year);

        return response()->json($data);
    }

    /**
     * Get conversion funnel
     * GET /api/v1/school/analytics/funnel?start_date=2026-01-01&end_date=2026-06-30
     */
    public function funnel(Request $request)
    {
        $school = auth()->user()->autoSchool;
        
        if (!$school) {
            return response()->json(['message' => 'No school found'], 404);
        }

        $startDate = $request->query('start_date', now()->subMonth()->toDateString());
        $endDate = $request->query('end_date', now()->toDateString());

        $data = $this->analyticsService->getConversionFunnel(
            $school,
            \Carbon\Carbon::parse($startDate),
            \Carbon\Carbon::parse($endDate)
        );

        return response()->json($data);
    }

    /**
     * Get ROI analysis
     * GET /api/v1/school/analytics/roi?start_date=2026-01-01&end_date=2026-06-30
     */
    public function roi(Request $request)
    {
        $school = auth()->user()->autoSchool;
        
        if (!$school) {
            return response()->json(['message' => 'No school found'], 404);
        }

        $startDate = $request->query('start_date', now()->subMonth()->toDateString());
        $endDate = $request->query('end_date', now()->toDateString());

        $data = $this->analyticsService->getROIAnalysis(
            $school,
            \Carbon\Carbon::parse($startDate),
            \Carbon\Carbon::parse($endDate)
        );

        return response()->json($data);
    }

    /**
     * Get leads list
     * GET /api/v1/school/analytics/leads?status=new&page=1
     */
    public function leads(Request $request)
    {
        $school = auth()->user()->autoSchool;
        
        if (!$school) {
            return response()->json(['message' => 'No school found'], 404);
        }

        $query = LeadEvent::forSchool($school->id);

        // Filter by status
        if ($request->has('status')) {
            $query->byStatus($request->query('status'));
        }

        // Search by name or email
        if ($request->has('search')) {
            $search = $request->query('search');
            $query->where('visitor_name', 'like', "%$search%")
                  ->orWhere('visitor_email', 'like', "%$search%");
        }

        $leads = $query->latest()->paginate(15);

        return response()->json($leads);
    }

    /**
     * Get single lead
     * GET /api/v1/school/analytics/leads/{id}
     */
    public function showLead($id)
    {
        $school = auth()->user()->autoSchool;
        
        if (!$school) {
            return response()->json(['message' => 'No school found'], 404);
        }

        $lead = LeadEvent::forSchool($school->id)->findOrFail($id);

        return response()->json($lead);
    }

    /**
     * Update lead status
     * PUT /api/v1/school/analytics/leads/{id}
     */
    public function updateLead(Request $request, $id)
    {
        $school = auth()->user()->autoSchool;
        
        if (!$school) {
            return response()->json(['message' => 'No school found'], 404);
        }

        $validated = $request->validate([
            'status' => 'required|in:new,contacted,converted,archived',
        ]);

        $lead = LeadEvent::forSchool($school->id)->findOrFail($id);
        $lead->update($validated);

        return response()->json([
            'message' => 'Lead updated successfully',
            'data' => $lead,
        ]);
    }

    /**
     * Export analytics report
     * GET /api/v1/school/analytics/export?format=csv&start_date=2026-01-01&end_date=2026-06-30
     */
    public function export(Request $request)
    {
        $school = auth()->user()->autoSchool;
        
        if (!$school) {
            return response()->json(['message' => 'No school found'], 404);
        }

        $format = $request->query('format', 'csv');
        $startDate = $request->query('start_date', now()->subMonth()->toDateString());
        $endDate = $request->query('end_date', now()->toDateString());

        $stats = \App\Models\AnalyticsDailyStat::forSchool($school->id)
            ->dateRange(\Carbon\Carbon::parse($startDate), \Carbon\Carbon::parse($endDate))
            ->get();

        if ($format === 'csv') {
            return $this->exportCsv($stats, $school);
        }

        return response()->json(['message' => 'Unsupported format'], 400);
    }

    /**
     * Export as CSV
     */
    private function exportCsv($stats, $school)
    {
        $filename = "analytics-{$school->slug}-" . now()->format('Y-m-d') . ".csv";

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=$filename",
        ];

        $callback = function () use ($stats) {
            $file = fopen('php://output', 'w');

            // Header row
            fputcsv($file, [
                'Date',
                'Total Views',
                'Unique Visitors',
                'Phone Clicks',
                'WhatsApp Clicks',
                'Website Clicks',
                'Facebook Clicks',
                'Instagram Clicks',
                'Email Clicks',
                'Maps Clicks',
                'Total Clicks',
                'New Leads',
                'Converted Leads',
                'Desktop Views',
                'Mobile Views',
                'Tablet Views',
            ]);

            // Data rows
            foreach ($stats as $stat) {
                fputcsv($file, [
                    $stat->date->format('Y-m-d'),
                    $stat->total_views,
                    $stat->unique_visitors,
                    $stat->phone_clicks,
                    $stat->whatsapp_clicks,
                    $stat->website_clicks,
                    $stat->facebook_clicks,
                    $stat->instagram_clicks,
                    $stat->email_clicks,
                    $stat->maps_clicks,
                    $stat->total_clicks,
                    $stat->new_leads,
                    $stat->converted_leads,
                    $stat->desktop_views,
                    $stat->mobile_views,
                    $stat->tablet_views,
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
