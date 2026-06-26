<?php

namespace App\Http\Controllers\Api;

use App\Models\Review;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class AdminReviewsController extends Controller
{
    public function index()
    {
        $reviews = Review::with(['autoSchool:id,name', 'user:id,name'])
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json($reviews->through(fn($review) => [
            'id'          => $review->id,
            'school_name' => $review->autoSchool?->name,
            'user_name'   => $review->user?->name,
            'rating'      => $review->rating,
            'title'       => $review->title,
            'content'     => $review->content,
            'status'      => $review->status,
            'created_at'  => $review->created_at,
        ]));
    }

    public function approve(string $id)
    {
        $review = Review::findOrFail($id);
        $review->update([
            'status'           => 'approved',
            'rejection_reason' => null,
        ]);

        return response()->json([
            'message' => 'Review approved successfully',
            'review'  => $review,
        ]);
    }

    public function reject(string $id, Request $request)
    {
        $request->validate(['reason' => 'required|string|max:500']);

        $review = Review::findOrFail($id);
        $review->update([
            'status'           => 'rejected',
            'rejection_reason' => $request->input('reason'),
        ]);

        return response()->json([
            'message' => 'Review rejected successfully',
            'review'  => $review,
        ]);
    }

    public function destroy(string $id)
    {
        $review = Review::findOrFail($id);
        $review->delete();

        return response()->json(['message' => 'Review deleted successfully']);
    }
}
