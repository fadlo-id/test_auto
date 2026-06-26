<?php

namespace App\Http\Controllers\Api;

use App\Models\Review;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class AdminReviewsController extends Controller
{
    public function index()
    {
        $this->authorize('isAdmin');

        $reviews = Review::with(['school', 'user'])
            ->paginate(20);

        return response()->json($reviews->map(function ($review) {
            return [
                'id' => $review->id,
                'school_name' => $review->school?->name,
                'user_name' => $review->user?->name,
                'rating' => $review->rating,
                'comment' => $review->comment,
                'status' => $review->status,
                'created_at' => $review->created_at,
            ];
        }));
    }

    public function approve($id)
    {
        $this->authorize('isAdmin');

        $review = Review::findOrFail($id);
        $review->update(['status' => 'approved']);

        return response()->json([
            'message' => 'Review approved successfully',
            'review' => $review,
        ]);
    }

    public function reject($id, Request $request)
    {
        $this->authorize('isAdmin');

        $request->validate(['reason' => 'required|string']);

        $review = Review::findOrFail($id);
        $review->update([
            'status' => 'rejected',
            'rejection_reason' => $request->input('reason'),
        ]);

        return response()->json([
            'message' => 'Review rejected successfully',
            'review' => $review,
        ]);
    }

    public function destroy($id)
    {
        $this->authorize('isAdmin');

        $review = Review::findOrFail($id);
        $review->delete();

        return response()->json(['message' => 'Review deleted successfully']);
    }
}
