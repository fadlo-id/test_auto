<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\AutoSchool;
use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SearchController extends Controller
{
    public function index(Request $request): Response
    {
        $query = AutoSchool::active()
            ->with('categories:id,name,code')
            ->withAvg('reviews as average_rating', 'rating')
            ->withCount(['reviews' => fn ($q) => $q->where('status', 'approved')]);

        if ($search = $request->string('search')->trim()->toString()) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('address', 'like', "%{$search}%");
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

        $sort = $request->input('sort', 'name');
        match ($sort) {
            'rating'   => $query->orderByDesc('average_rating'),
            'reviews'  => $query->orderByDesc('reviews_count'),
            default    => $query->orderBy('name'),
        };

        $schools = $query->paginate(12)->withQueryString();

        $cities = AutoSchool::active()->select('city')->distinct()->orderBy('city')->pluck('city');
        $categories = Category::all(['id', 'name', 'code']);

        return Inertia::render('SearchPage', [
            'schools'    => $schools,
            'cities'     => $cities,
            'categories' => $categories,
            'filters'    => $request->only('search', 'city', 'region', 'category', 'min_rating', 'sort'),
        ]);
    }
}
