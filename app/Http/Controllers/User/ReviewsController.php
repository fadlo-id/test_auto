<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReviewsController extends Controller
{
    public function index(Request $request): Response
    {
        $reviews = auth()->user()
            ->reviews()
            ->with('autoSchool:id,name,slug,city,logo_url')
            ->when(
                $request->status && $request->status !== 'all',
                fn ($q) => $q->where('status', $request->status)
            )
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('UserDashboard/Reviews', [
            'reviews' => $reviews,
            'filters' => $request->only(['status']),
        ]);
    }
}
