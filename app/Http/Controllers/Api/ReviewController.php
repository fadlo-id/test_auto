<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreReviewRequest;
use App\Http\Requests\UpdateReviewRequest;
use App\Http\Resources\ReviewResource;
use App\Models\AutoSchool;
use App\Models\Review;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ReviewController extends Controller
{
    public function index(AutoSchool $autoSchool): AnonymousResourceCollection
    {
        $reviews = $autoSchool->reviews()
            ->where('status', 'approved')
            ->with('user')
            ->latest()
            ->paginate(10);

        return ReviewResource::collection($reviews);
    }

    public function store(StoreReviewRequest $request, AutoSchool $autoSchool): ReviewResource
    {
        $review = $autoSchool->reviews()->create([
            'user_id' => $request->user()->id,
            'rating'  => $request->validated('rating'),
            'title'   => $request->validated('title'),
            'content' => $request->validated('content'),
            'status'  => 'pending',
        ]);

        return new ReviewResource($review->load('user'));
    }

    public function update(UpdateReviewRequest $request, Review $review): ReviewResource
    {
        $review->update($request->validated());

        return new ReviewResource($review->load('user'));
    }

    public function destroy(Review $review): \Illuminate\Http\Response
    {
        $this->authorize('delete', $review);
        $review->delete();

        return response()->noContent();
    }
}
