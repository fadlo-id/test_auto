<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\AutoSchool;
use Inertia\Inertia;
use Inertia\Response;

class FavoritesController extends Controller
{
    public function index(): Response
    {
        $favorites = auth()->user()->favoriteSchools()
            ->with('categories:id,code,name_fr')
            ->withAvg('reviews as average_rating', 'rating')
            ->withCount(['reviews as reviews_count' => fn ($q) => $q->where('status', 'approved')])
            ->paginate(12);

        return Inertia::render('UserDashboard/Favorites', [
            'favorites' => $favorites,
        ]);
    }

    public function toggle(AutoSchool $school): \Illuminate\Http\RedirectResponse|\Symfony\Component\HttpFoundation\Response
    {
        $user   = auth()->user();
        $exists = $user->favorites()->where('auto_school_id', $school->id)->exists();

        if ($exists) {
            $user->favorites()->where('auto_school_id', $school->id)->delete();
        } else {
            $user->favorites()->create(['auto_school_id' => $school->id]);
        }

        // Inertia uses back() for preserveScroll; JSON for XHR callers
        if (request()->header('X-Inertia')) {
            return back();
        }

        return response()->json(['favorited' => ! $exists]);
    }
}
