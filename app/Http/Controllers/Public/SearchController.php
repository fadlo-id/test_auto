<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\AutoSchool;
use App\Models\Category;
use App\Services\SeoService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class SearchController extends Controller
{
    public function byCity(string $city): Response
    {
        return $this->index(new \Illuminate\Http\Request(['city' => urldecode($city)]));
    }

    public function byCategory(string $code): Response
    {
        $category = \App\Models\Category::where('code', strtoupper($code))->firstOrFail();
        return $this->index(new \Illuminate\Http\Request(['category' => $category->id]));
    }

    public function index(Request $request): Response
    {
        $query = AutoSchool::visible()
            ->with('categories:id,name_fr,name_ar,code')
            ->withAvg('reviews as average_rating', 'rating')
            ->withCount(['reviews' => fn ($q) => $q->where('status', 'approved')]);

        if ($search = $request->string('search')->trim()->toString()) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('city', 'like', "%{$search}%")
                  ->orWhere('address', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($city = $request->string('city')->trim()->toString()) {
            $query->where('city', $city);
        }

        if ($region = $request->string('region')->trim()->toString()) {
            $query->where('region', $region);
        }

        if ($category = $request->input('category')) {
            $query->whereHas('categories', fn ($q) => $q->where('categories.id', $category));
        }

        if ($minRating = $request->input('min_rating')) {
            $query->having('average_rating', '>=', (float) $minRating);
        }

        // Geolocation proximity search (Haversine formula)
        $lat  = $request->input('lat');
        $lng  = $request->input('lng');
        $radius = (float) ($request->input('radius', 20));

        if ($lat !== null && $lng !== null) {
            $lat    = (float) $lat;
            $lng    = (float) $lng;
            $radius = max(1, min(200, $radius));

            // Haversine formula using parameterized bindings to prevent SQL injection
            $haversineExpr = '(6371 * ACOS(COS(RADIANS(?)) * COS(RADIANS(latitude)) * COS(RADIANS(longitude) - RADIANS(?)) + SIN(RADIANS(?)) * SIN(RADIANS(latitude))))';

            $query->whereNotNull('latitude')
                  ->whereNotNull('longitude')
                  ->whereRaw("{$haversineExpr} <= ?", [$lat, $lng, $lat, $radius])
                  ->selectRaw("auto_schools.*, {$haversineExpr} AS distance_km", [$lat, $lng, $lat]);
        }

        $sort = $request->input('sort', 'name');
        if ($lat !== null && $lng !== null && $sort === 'distance') {
            $query->orderByRaw('distance_km ASC');
        } else {
            match ($sort) {
                'rating'   => $query->orderByDesc('average_rating'),
                'reviews'  => $query->orderByDesc('reviews_count'),
                'newest'   => $query->orderByDesc('created_at'),
                default    => $query->orderBy('name'),
            };
        }

        $schools = $query->paginate(12)->withQueryString();

        $cities     = Cache::remember('search_cities', now()->addHour(), fn () => AutoSchool::visible()->select('city')->distinct()->orderBy('city')->pluck('city'));
        $categories = Cache::remember('search_categories', now()->addDay(), fn () => Category::all(['id', 'name_fr', 'name_ar', 'code']));

        $filters = $request->only('search', 'city', 'region', 'category', 'min_rating', 'sort', 'lat', 'lng', 'radius');

        return Inertia::render('SearchPage', [
            'schools'    => $schools,
            'cities'     => $cities,
            'categories' => $categories,
            'filters'    => $filters,
            'seo'        => app(SeoService::class)->search($filters, $schools->total()),
        ]);
    }
}
