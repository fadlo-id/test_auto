<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Models\AutoSchool;
use App\Models\Plan;

Route::get('/', function () {

    return Inertia::render('HomePage', [
        'plans' => Plan::all(),
    ]);

})->name('home');

Route::get('/search', function () {

    $schools = AutoSchool::with('categories')
        ->withCount('reviews')
        ->withAvg('reviews', 'rating')
        ->where('is_active', true)
        ->paginate(15);

    return Inertia::render('SearchPage', [
        'schools' => $schools,
    ]);

})->name('search');


Route::get('/school/{slug}', function ($slug) {

    $school = AutoSchool::where('slug', $slug)
        ->with([
            'user',
            'categories',
            'services',
            'reviews.user'
        ])
        ->withCount('reviews')
        ->withAvg('reviews', 'rating')
        ->firstOrFail();

    /*
    Tracking View
    */

    if (method_exists($school, 'views')) {

        $school->views()->create([
            'ip' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);

    }

    return Inertia::render('DetailPage', [
        'school' => $school,
    ]);

})->name('school.detail');


Route::middleware(['auth', 'verified'])->group(function () {

    Route::get('/dashboard', function () {

        $school = auth()->user()
            ->autoSchools()
            ->with([
                'categories',
                'services',
                'reviews',
                'subscription.plan',
            ])
            ->withCount('reviews')
            ->withAvg('reviews', 'rating')
            ->first();

        if ($school) {

            $school->views_count =
                \App\Models\Stat::where('auto_school_id', $school->id)
                ->sum('views_count');

            $school->clicks_count =
                \App\Models\Stat::where('auto_school_id', $school->id)
                ->sum('clicks_count');
        }

        return Inertia::render('DashboardPage', [
            'school' => $school,
            'plans' => Plan::all(),
        ]);

    })->name('dashboard');

});


Route::middleware('auth')->group(function () {

    Route::get('/profile', [ProfileController::class, 'edit'])
        ->name('profile.edit');

    Route::patch('/profile', [ProfileController::class, 'update'])
        ->name('profile.update');

    Route::delete('/profile', [ProfileController::class, 'destroy'])
        ->name('profile.destroy');

});

require __DIR__.'/auth.php';