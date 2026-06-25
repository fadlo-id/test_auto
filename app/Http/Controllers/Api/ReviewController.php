<?php

namespace App\Http\Controllers\Api;

use App\Models\Review;
use App\Models\AutoSchool;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class ReviewController extends Controller
{
    public function index(AutoSchool $autoSchool)
    {
        return $autoSchool->reviews()
            ->where('verified', true)
            ->with('user')
            ->latest()
            ->paginate(10);
    }

    public function store(Request $request, AutoSchool $autoSchool)
    {
        $validated = $request->validate([
            'rating' => 'required|integer|between:1,5',
            'title' => 'required|string|max:255',
            'content' => 'required|string|max:1000',
        ]);

        // Check if user already reviewed
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'message' => 'Veuillez vous connecter.'
            ], 401);
        }

        $existing = Review::where('auto_school_id', $autoSchool->id)
            ->where('user_id', $user->id)
            ->exists();

        if ($existing) {
            return response()->json(['message' => 'Vous avez déjà évalué cette auto-école'], 422);
        }

        $review = $autoSchool->reviews()->create([
            'user_id' => $user->id,
            ...$validated,
        ]);

        return response()->json($review, 201);
    }

    public function update(Request $request, Review $review)
    {
        if ($review->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $review->update($request->validate([
            'rating' => 'sometimes|integer|between:1,5',
            'title' => 'sometimes|string|max:255',
            'content' => 'sometimes|string|max:1000',
        ]));

        return response()->json($review);
    }

    public function destroy(Review $review)
    {
        if ($review->user_id !== auth()->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $review->delete();
        return response()->json(null, 204);
    }
}