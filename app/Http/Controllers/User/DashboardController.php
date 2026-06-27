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

        $stats = [
            'total_reviews'   => $user->reviews()->count(),
            'pending_reviews' => $user->reviews()->where('status', 'pending')->count(),
            'approved_reviews'=> $user->reviews()->where('status', 'approved')->count(),
            'favorites'       => $user->favorites()->count(),
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

        return Inertia::render('UserDashboard/Overview', [
            'stats'          => $stats,
            'recentReviews'  => $recentReviews,
            'favoriteSchools'=> $favoriteSchools,
        ]);
    }
}
