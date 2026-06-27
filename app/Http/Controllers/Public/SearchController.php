<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\AutoSchool;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class SearchController extends Controller
{
    public function index(Request $request): Response
    {
        $query = AutoSchool::active()
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

            $haversine = "(6371 * ACOS(
                COS(RADIANS({$lat})) * COS(RADIANS(latitude))
                * COS(RADIANS(longitude) - RADIANS({$lng}))
                + SIN(RADIANS({$lat})) * SIN(RADIANS(latitude))
            ))";

            $query->whereNotNull('latitude')
                  ->whereNotNull('longitude')
                  ->whereRaw("{$haversine} <= ?", [$radius])
                  ->selectRaw("auto_schools.*, {$haversine} AS distance_km");
        }

        $sort = $request->input('sort', 'name');
        if ($lat !== null && $lng !== null && $sort === 'distance') {
            $query->orderBy('distance_km');
        } else {
            match ($sort) {
                'rating'   => $query->orderByDesc('average_rating'),
                'reviews'  => $query->orderByDesc('reviews_count'),
                default    => $query->orderBy('name'),
            };
        }

        $schools = $query->paginate(12)->withQueryString();

        $cities     = Cache::remember('search_cities', now()->addHour(), fn () => AutoSchool::active()->select('city')->distinct()->orderBy('city')->pluck('city'));
        $categories = Cache::remember('search_categories', now()->addDay(), fn () => Category::all(['id', 'name_fr', 'name_ar', 'code']));

        return Inertia::render('SearchPage', [
            'schools'    => $schools,
            'cities'     => $cities,
            'categories' => $categories,
            'filters'    => $request->only('search', 'city', 'region', 'category', 'min_rating', 'sort', 'lat', 'lng', 'radius'),
        ]);
    }
}
