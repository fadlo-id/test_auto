<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\AutoSchool;
use App\Services\TrackingService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SchoolDetailController extends Controller
{
    public function __construct(private TrackingService $tracking) {}

    public function show(Request $request, string $slug): Response|\Illuminate\Http\Response
    {
        $school = AutoSchool::active()
            ->where('slug', $slug)
            ->with([
                'categories:id,name,code',
                'services',
                'reviews' => fn ($q) => $q->where('status', 'approved')->with('user:id,name')->latest()->take(20),
            ])
            ->withAvg('reviews as average_rating', 'rating')
            ->withCount(['reviews' => fn ($q) => $q->where('status', 'approved')])
            ->firstOrFail();

        $this->tracking->trackView($school, $request, $request->user()?->id);

        $ratingBreakdown = $school->reviews()
            ->where('status', 'approved')
            ->selectRaw('rating, count(*) as count')
            ->groupBy('rating')
            ->pluck('count', 'rating')
            ->toArray();

        return Inertia::render('DetailPage', [
            'school'          => $school,
            'ratingBreakdown' => $ratingBreakdown,
            'canReview'       => auth()->check() && ! $school->reviews()->where('user_id', auth()->id())->exists(),
        ]);
    }
}
