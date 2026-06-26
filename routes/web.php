<?php

use App\Http\Controllers\Admin\DashboardController as AdminDashboard;
use App\Http\Controllers\Admin\UsersController as AdminUsers;
use App\Http\Controllers\Admin\SchoolsController as AdminSchools;
use App\Http\Controllers\Admin\ReviewsController as AdminReviews;
use App\Http\Controllers\Admin\PaymentsController as AdminPayments;
use App\Http\Controllers\Admin\SubscriptionsController as AdminSubscriptions;
use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Routes publiques
Route::get('/', fn () => Inertia::render('HomePage'))->name('home');
Route::get('/search', fn () => Inertia::render('SearchPage'))->name('search');
Route::get('/auto-ecole/{slug}', fn () => Inertia::render('DetailPage'))->name('school.detail');

// Routes authentifiées
Route::middleware(['auth', 'verified'])->group(function () {

    // Smart redirect dashboard
    Route::get('/dashboard', function () {
        $user = auth()->user();
        if ($user->isAdmin()) return redirect()->route('admin.dashboard');
        if ($user->isSchoolOwner()) return redirect()->route('school.dashboard');
        return Inertia::render('Dashboard');
    })->name('dashboard');

    // Profile (Breeze)
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Admin routes
    Route::middleware('admin')->prefix('admin')->name('admin.')->group(function () {
        Route::get('/dashboard', [AdminDashboard::class, 'index'])->name('dashboard');

        // Users
        Route::get('/users', [AdminUsers::class, 'index'])->name('users.index');
        Route::put('/users/{user}', [AdminUsers::class, 'update'])->name('users.update');
        Route::delete('/users/{user}', [AdminUsers::class, 'destroy'])->name('users.destroy');
        Route::post('/users/{user}/ban', [AdminUsers::class, 'ban'])->name('users.ban');

        // Schools
        Route::get('/auto-schools', [AdminSchools::class, 'index'])->name('auto-schools.index');
        Route::post('/auto-schools/{school}/approve', [AdminSchools::class, 'approve'])->name('auto-schools.approve');
        Route::post('/auto-schools/{school}/reject', [AdminSchools::class, 'reject'])->name('auto-schools.reject');
        Route::delete('/auto-schools/{school}', [AdminSchools::class, 'destroy'])->name('auto-schools.destroy');

        // Reviews
        Route::get('/reviews', [AdminReviews::class, 'index'])->name('reviews.index');
        Route::post('/reviews/{review}/approve', [AdminReviews::class, 'approve'])->name('reviews.approve');
        Route::post('/reviews/{review}/reject', [AdminReviews::class, 'reject'])->name('reviews.reject');
        Route::delete('/reviews/{review}', [AdminReviews::class, 'destroy'])->name('reviews.destroy');

        // Payments
        Route::get('/payments', [AdminPayments::class, 'index'])->name('payments.index');

        // Subscriptions
        Route::get('/subscriptions', [AdminSubscriptions::class, 'index'])->name('subscriptions.index');
        Route::post('/subscriptions/{subscription}/cancel', [AdminSubscriptions::class, 'cancel'])->name('subscriptions.cancel');

        // Analytics
        Route::get('/analytics', fn () => Inertia::render('Admin/Analytics'))->name('analytics');
    });

    // School owner routes
    Route::middleware('school.owner')->prefix('school')->name('school.')->group(function () {
        Route::get('/dashboard', fn () => Inertia::render('SchoolDashboard/Overview'))->name('dashboard');
        Route::get('/analytics', fn () => Inertia::render('SchoolDashboard/Analytics'))->name('analytics');
        Route::get('/reviews', fn () => Inertia::render('SchoolDashboard/Reviews'))->name('reviews');
        Route::get('/services', fn () => Inertia::render('SchoolDashboard/Services'))->name('services');
        Route::get('/subscription', fn () => Inertia::render('SchoolDashboard/Subscription'))->name('subscription');
        Route::get('/settings', fn () => Inertia::render('SchoolDashboard/Settings'))->name('settings');
    });
});

require __DIR__ . '/auth.php';
