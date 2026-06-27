<?php

namespace App\Http\Controllers\School;

use App\Http\Controllers\Controller;
use App\Models\Review;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReviewsController extends Controller
{
    public function index(Request $request): Response|RedirectResponse
    {
        $school = auth()->user()->autoSchool;

        if (! $school) {
            return redirect()->route('school.settings');
        }

        $reviews = $school->reviews()
            ->with('user:id,name')
            ->when(
                $request->status && $request->status !== 'all',
                fn ($q) => $q->where('status', $request->status)
            )
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('SchoolDashboard/Reviews', [
            'school'  => $school->only('id', 'name', 'city', 'status'),
            'reviews' => $reviews,
            'filters' => $request->only(['status']),
        ]);
    }

    public function reply(Request $request, Review $review): RedirectResponse
    {
        $school = auth()->user()->autoSchool;
        abort_if(! $school || $review->auto_school_id !== $school->id, 403);

        $request->validate([
            'owner_reply' => 'required|string|max:1000',
        ]);

        $review->update([
            'owner_reply' => $request->owner_reply,
            'replied_at'  => now(),
        ]);

        return back()->with('success', 'Votre reponse a ete publiee.');
    }

    public function deleteReply(Review $review): RedirectResponse
    {
        $school = auth()->user()->autoSchool;
        abort_if(! $school || $review->auto_school_id !== $school->id, 403);

        $review->update(['owner_reply' => null, 'replied_at' => null]);

        return back()->with('success', 'Reponse supprimee.');
    }
}
