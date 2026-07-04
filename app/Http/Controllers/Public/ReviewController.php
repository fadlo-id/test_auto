<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\AutoSchool;
use App\Models\Review;
use App\Models\SiteSetting;
use App\Services\NotificationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;

class ReviewController extends Controller
{
    public function __construct(private NotificationService $notifications) {}

    public function store(Request $request, string $slug): RedirectResponse
    {
        if (SiteSetting::get('allow_reviews', '1') === '0') {
            return back()->with('error', 'Les avis sont temporairement désactivés.');
        }

        // Rate limit: 3 reviews per hour per user
        RateLimiter::attempt(
            'review:' . auth()->id(),
            3,
            fn () => null,
            60 * 60,
        ) ?: abort(429, 'Trop de tentatives. Veuillez patienter avant de soumettre un nouvel avis.');

        $school = AutoSchool::active()->where('slug', $slug)->firstOrFail();

        $request->validate([
            'rating'  => 'required|integer|between:1,5',
            'title'   => 'nullable|string|min:3|max:255',
            'content' => 'required|string|min:20|max:2000',
        ]);

        $alreadyReviewed = Review::where('auto_school_id', $school->id)
            ->where('user_id', auth()->id())
            ->exists();

        if ($alreadyReviewed) {
            return back()->with('error', 'Vous avez deja laisse un avis pour cette auto-ecole.');
        }

        if ($school->user_id === auth()->id()) {
            return back()->with('error', 'Vous ne pouvez pas noter votre propre auto-ecole.');
        }

        $requireApproval = SiteSetting::get('require_approval', '1') !== '0';
        $status          = $requireApproval ? 'pending' : 'approved';

        Review::create([
            'auto_school_id' => $school->id,
            'user_id'        => auth()->id(),
            'rating'         => $request->rating,
            'title'          => $request->title,
            'content'        => $request->content,
            'status'         => $status,
        ]);

        $this->notifications->notifyNewReview($school);

        $message = $requireApproval
            ? 'Votre avis a ete soumis et est en attente de validation. Merci !'
            : 'Votre avis a ete publié. Merci !';

        return back()->with('success', $message);
    }
}
