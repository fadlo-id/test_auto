<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $user = auth()->user();

        $reviewCounts = $user->reviews()
            ->selectRaw('COUNT(*) as total, SUM(CASE WHEN status=\'pending\' THEN 1 ELSE 0 END) as pending, SUM(CASE WHEN status=\'approved\' THEN 1 ELSE 0 END) as approved')
            ->first();

        $bookingCounts = $user->bookings()
            ->selectRaw('COUNT(*) as total, SUM(CASE WHEN status=\'pending\' THEN 1 ELSE 0 END) as pending, SUM(CASE WHEN status=\'confirmed\' THEN 1 ELSE 0 END) as confirmed')
            ->first();

        $stats = [
            'total_reviews'    => (int) ($reviewCounts->total    ?? 0),
            'pending_reviews'  => (int) ($reviewCounts->pending  ?? 0),
            'approved_reviews' => (int) ($reviewCounts->approved ?? 0),
            'favorites'        => $user->favorites()->count(),
            'total_bookings'   => (int) ($bookingCounts->total     ?? 0),
            'pending_bookings' => (int) ($bookingCounts->pending   ?? 0),
        ];

        $recentReviews = $user->reviews()
            ->with('autoSchool:id,name,slug,city,logo_url')
            ->latest()
            ->take(5)
            ->get(['id', 'auto_school_id', 'rating', 'title', 'status', 'created_at']);

        $favoriteSchools = $user->favoriteSchools()
            ->with('categories:id,code')
            ->withAvg('reviews as average_rating', 'rating')
            ->withCount(['reviews as reviews_count' => fn ($q) => $q->where('status', 'approved')])
            ->take(4)
            ->get(['auto_schools.id', 'slug', 'name', 'city', 'logo_url', 'banner_url', 'is_active', 'status']);

        $recentBookings = $user->bookings()
            ->with('autoSchool:id,name,slug,city,logo_url')
            ->latest()
            ->take(5)
            ->get(['id', 'auto_school_id', 'name', 'permit_type', 'preferred_date', 'status', 'created_at']);

        return Inertia::render('UserDashboard/Overview', [
            'stats'          => $stats,
            'recentReviews'  => $recentReviews,
            'favoriteSchools'=> $favoriteSchools,
            'recentBookings' => $recentBookings,
        ]);
    }
}
