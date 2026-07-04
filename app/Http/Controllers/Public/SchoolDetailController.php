<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\AutoSchool;
use App\Services\CreditConsumptionService;
use App\Services\SeoService;
use App\Services\TrackingService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SchoolDetailController extends Controller
{
    public function __construct(
        private TrackingService $tracking,
        private CreditConsumptionService $credits,
    ) {}

    public function show(Request $request, string $slug): Response|\Illuminate\Http\Response
    {
        // Allow access even when credits exhausted (show message), but school must be approved+active
        $school = AutoSchool::active()
            ->where('slug', $slug)
            ->with([
                'categories:id,name_fr,name_ar,code',
                'services',
                'photos',
                'reviews' => fn ($q) => $q->where('status', 'approved')->with('user:id,name')->latest()->take(20),
            ])
            ->withAvg('reviews as average_rating', 'rating')
            ->withCount(['reviews' => fn ($q) => $q->where('status', 'approved')])
            ->firstOrFail();

        // Track view (raw event + dedup + credit)
        // Only track when school is publicly visible (has credits)
        if (! $school->credits_exhausted) {
            $this->tracking->trackView($school, $request, $request->user()?->id);
            $this->credits->trackView($school, $request);
        }

        // Compute rating breakdown from already-loaded reviews (no extra query)
        $ratingBreakdown = $school->reviews
            ->countBy('rating')
            ->all();

        $userId      = auth()->id();
        $isFavorited = $userId
            && auth()->user()->favorites()->where('auto_school_id', $school->id)->exists();

        $canReview = (bool) $userId
            && ! $school->reviews->where('user_id', $userId)->count();

        return Inertia::render('DetailPage', [
            'school'           => $school,
            'ratingBreakdown'  => $ratingBreakdown,
            'canReview'        => $canReview,
            'isFavorited'      => $isFavorited,
            'creditsExhausted' => $school->credits_exhausted,
            'seo'              => app(SeoService::class)->schoolDetail($school),
        ]);
    }
}
