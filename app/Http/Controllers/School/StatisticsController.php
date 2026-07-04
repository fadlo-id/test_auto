<?php

namespace App\Http\Controllers\School;

use App\Http\Controllers\Controller;
use App\Models\AnalyticsDailyStat;
use App\Models\Booking;
use App\Models\Review;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class StatisticsController extends Controller
{
    public function index(): Response
    {
        $school = auth()->user()->autoSchool;
        abort_if(! $school, 404);

        $daily = AnalyticsDailyStat::where('auto_school_id', $school->id)
            ->where('date', '>=', now()->subDays(30)->toDateString())
            ->orderBy('date')
            ->get(['date', 'total_views', 'phone_clicks', 'whatsapp_clicks', 'website_clicks', 'email_clicks', 'facebook_clicks', 'instagram_clicks']);

        $monthly = AnalyticsDailyStat::where('auto_school_id', $school->id)
            ->where('date', '>=', now()->subMonths(12)->toDateString())
            ->select(
                DB::raw($this->monthExpr() . ' as month'),
                DB::raw('SUM(total_views) as views'),
                DB::raw('SUM(phone_clicks) as phone_clicks'),
                DB::raw('SUM(whatsapp_clicks) as whatsapp_clicks'),
                DB::raw('SUM(website_clicks) as website_clicks'),
                DB::raw('SUM(email_clicks) as email_clicks'),
            )
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        $totals = [
            'views'           => (int) $daily->sum('total_views'),
            'phone_clicks'    => (int) $daily->sum('phone_clicks'),
            'whatsapp_clicks' => (int) $daily->sum('whatsapp_clicks'),
            'website_clicks'  => (int) $daily->sum('website_clicks'),
            'email_clicks'    => (int) $daily->sum('email_clicks'),
            'social_clicks'   => (int) ($daily->sum('facebook_clicks') + $daily->sum('instagram_clicks')),
            'reviews'         => Review::where('auto_school_id', $school->id)->where('status', 'approved')->count(),
            'avg_rating'      => (float) Review::where('auto_school_id', $school->id)->where('status', 'approved')->avg('rating'),
            'bookings'        => Booking::where('auto_school_id', $school->id)->count(),
        ];

        $ratingBreakdown = Review::where('auto_school_id', $school->id)
            ->where('status', 'approved')
            ->selectRaw('rating, COUNT(*) as count')
            ->groupBy('rating')
            ->orderBy('rating')
            ->pluck('count', 'rating');

        return Inertia::render('SchoolDashboard/Statistics', compact('daily', 'monthly', 'totals', 'ratingBreakdown'));
    }

    private function monthExpr(): string
    {
        return DB::getDriverName() === 'sqlite'
            ? "strftime('%Y-%m', date)"
            : "DATE_FORMAT(date, '%Y-%m')";
    }
}
