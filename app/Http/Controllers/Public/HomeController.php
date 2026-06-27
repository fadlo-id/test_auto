<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\AutoSchool;
use App\Models\Category;
use App\Models\Plan;
use App\Models\Review;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function index(): Response
    {
        [$featured, $cities, $categories, $plans, $stats] = Cache::remember('home_page_data', now()->addMinutes(30), function () {
            $featured = AutoSchool::active()
                ->with('categories:id,name_fr,name_ar,code')
                ->withAvg('reviews as average_rating', 'rating')
                ->withCount(['reviews' => fn ($q) => $q->where('status', 'approved')])
                ->where(fn ($q) => $q->where('featured_until', '>=', now())->orWhereNull('featured_until'))
                ->orderByDesc('featured_until')
                ->take(6)
                ->get(['id', 'slug', 'name', 'city', 'logo_url', 'banner_url', 'description', 'featured_until']);

            $cities = AutoSchool::active()
                ->select('city')
                ->groupBy('city')
                ->orderBy('city')
                ->pluck('city');

            $categories = Category::withCount(['autoSchools as schools_count' => fn ($q) => $q->active()])
                ->orderByDesc('schools_count')
                ->take(8)
                ->get(['id', 'name_fr', 'name_ar', 'code']);

            $plans = Plan::where('is_active', true)
                ->get(['id', 'name', 'price', 'billing_period', 'description', 'features']);

            $stats = [
                'schools' => AutoSchool::active()->count(),
                'cities'  => $cities->count(),
                'reviews' => Review::where('status', 'approved')->count(),
            ];

            return [$featured, $cities, $categories, $plans, $stats];
        });

        return Inertia::render('HomePage', compact('featured', 'cities', 'categories', 'plans', 'stats'));
    }
}
