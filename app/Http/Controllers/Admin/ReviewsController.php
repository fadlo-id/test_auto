<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Review;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReviewsController extends Controller
{
    public function index(Request $request): Response
    {
        $reviews = Review::with(['user:id,name,email', 'autoSchool:id,name,city'])
            ->when($request->status && $request->status !== 'all', fn($q) => $q->where('status', $request->status))
            ->when($request->search, fn($q, $s) => $q->where('title', 'like', "%$s%")->orWhere('content', 'like', "%$s%"))
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Admin/Reviews', [
            'reviews' => $reviews,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    public function approve(Review $review): RedirectResponse
    {
        $review->update(['status' => 'approved', 'verified' => true]);

        return back()->with('success', 'Avis approuvé.');
    }

    public function reject(Request $request, Review $review): RedirectResponse
    {
        $request->validate(['reason' => 'nullable|string|max:500']);

        $review->update([
            'status'           => 'rejected',
            'rejection_reason' => $request->reason,
        ]);

        return back()->with('success', 'Avis refusé.');
    }

    public function destroy(Review $review): RedirectResponse
    {
        $review->delete();

        return back()->with('success', 'Avis supprimé.');
    }
}
