<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\AutoSchool;
use App\Models\Category;
use App\Models\Plan;
use App\Models\Review;
use App\Services\SeoService;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function index(): Response
    {
        $data = Cache::remember('home_page_data', now()->addMinutes(30), function () {
            $featured = AutoSchool::visible()
                ->with('categories:id,name_fr,name_ar,code')
                ->withAvg('reviews as average_rating', 'rating')
                ->withCount(['reviews' => fn ($q) => $q->where('status', 'approved')])
                ->where('featured_until', '>=', now())
                ->orderByDesc('featured_until')
                ->take(6)
                ->get(['id', 'slug', 'name', 'city', 'logo_url', 'banner_url', 'description', 'featured_until']);

            $latest = AutoSchool::visible()
                ->with('categories:id,name_fr,name_ar,code')
                ->withAvg('reviews as average_rating', 'rating')
                ->withCount(['reviews' => fn ($q) => $q->where('status', 'approved')])
                ->latest()
                ->take(6)
                ->get(['id', 'slug', 'name', 'city', 'logo_url', 'banner_url', 'description', 'created_at']);

            $cities = AutoSchool::visible()
                ->selectRaw('city, COUNT(*) as schools_count')
                ->groupBy('city')
                ->orderByDesc('schools_count')
                ->take(12)
                ->get();

            $categories = Category::withCount(['autoSchools as schools_count' => fn ($q) => $q
                    ->where('is_active', true)
                    ->where('status', 'approved')
                    ->where('credits_exhausted', false)
                    ->whereNull('deleted_at')])
                ->orderByDesc('schools_count')
                ->take(8)
                ->get(['id', 'name_fr', 'name_ar', 'code']);

            $plans = Plan::where('is_active', true)
                ->orderBy('price')
                ->get(['id', 'name', 'price', 'billing_period', 'description', 'features']);

            $cityCount = AutoSchool::visible()->distinct()->count('city');
            $stats = [
                'schools' => AutoSchool::visible()->count(),
                'cities'  => $cityCount,
                'reviews' => Review::where('status', 'approved')->count(),
            ];

            return compact('featured', 'latest', 'cities', 'categories', 'plans', 'stats');
        });

        return Inertia::render('HomePage', array_merge($data, [
            'seo' => app(SeoService::class)->home(),
        ]));
    }
}
