<?php

namespace App\Http\Controllers\School;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReviewsController extends Controller
{
    public function index(Request $request): Response|\Illuminate\Http\RedirectResponse
    {
        $school = auth()->user()->autoSchool;

        if (! $school) {
            return redirect()->route('school.settings');
        }

        $reviews = $school->reviews()
            ->with('user:id,name')
            ->when($request->status && $request->status !== 'all', fn($q) => $q->where('status', $request->status))
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('SchoolDashboard/Reviews', [
            'school'  => $school->only('id', 'name'),
            'reviews' => $reviews,
            'filters' => $request->only(['status']),
        ]);
    }
}
