<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\AutoSchool;
use App\Models\Review;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    public function store(Request $request, string $slug): RedirectResponse
    {
        $school = AutoSchool::active()->where('slug', $slug)->firstOrFail();

        $request->validate([
            'rating'  => 'required|integer|between:1,5',
            'title'   => 'nullable|string|max:255',
            'content' => 'required|string|max:2000',
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

        Review::create([
            'auto_school_id' => $school->id,
            'user_id'        => auth()->id(),
            'rating'         => $request->rating,
            'title'          => $request->title,
            'content'        => $request->content,
            'status'         => 'pending',
        ]);

        return back()->with('success', 'Votre avis a ete soumis et est en attente de validation. Merci !');
    }
}
