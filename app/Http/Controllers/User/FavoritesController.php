<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\AutoSchool;
use Illuminate\Http\JsonResponse;
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

    public function toggle(AutoSchool $school): JsonResponse
    {
        $user = auth()->user();
        $exists = $user->favorites()->where('auto_school_id', $school->id)->exists();

        if ($exists) {
            $user->favorites()->where('auto_school_id', $school->id)->delete();
            return response()->json(['favorited' => false, 'message' => 'Retiré des favoris']);
        }

        $user->favorites()->create(['auto_school_id' => $school->id]);
        return response()->json(['favorited' => true, 'message' => 'Ajouté aux favoris']);
    }
}
