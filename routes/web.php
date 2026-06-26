<?php

use App\Http\Controllers\School\DashboardController as SchoolDashboard;
use App\Http\Controllers\School\ReviewsController as SchoolReviews;
use App\Http\Controllers\School\ServicesController as SchoolServices;
use App\Http\Controllers\School\SettingsController as SchoolSettings;
use App\Http\Controllers\School\SubscriptionController as SchoolSubscription;
use App\Http\Controllers\Admin\DashboardController as AdminDashboard;
use App\Http\Controllers\Admin\UsersController as AdminUsers;
use App\Http\Controllers\Admin\SchoolsController as AdminSchools;
use App\Http\Controllers\Admin\ReviewsController as AdminReviews;
use App\Http\Controllers\Admin\PaymentsController as AdminPayments;
use App\Http\Controllers\Admin\SubscriptionsController as AdminSubscriptions;
use App\Http\Controllers\Public\HomeController;
use App\Http\Controllers\Public\ReviewController as PublicReview;
use App\Http\Controllers\Public\SearchController;
use App\Http\Controllers\Public\SchoolDetailController;
use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Routes publiques
Route::get('/', [HomeController::class, 'index'])->name('home');
Route::get('/search', [SearchController::class, 'index'])->name('search');
Route::get('/auto-ecole/{slug}', [SchoolDetailController::class, 'show'])->name('school.detail');
Route::post('/auto-ecole/{slug}/review', [PublicReview::class, 'store'])->middleware('auth')->name('school.detail.review');

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
        Route::get('/dashboard', [SchoolDashboard::class, 'index'])->name('dashboard');
        Route::get('/analytics', fn () => Inertia::render('SchoolDashboard/Analytics'))->name('analytics');
        Route::get('/reviews', [SchoolReviews::class, 'index'])->name('reviews');
        Route::post('/reviews/{review}/reply', [SchoolReviews::class, 'reply'])->name('reviews.reply');
        Route::delete('/reviews/{review}/reply', [SchoolReviews::class, 'deleteReply'])->name('reviews.reply.delete');
        Route::get('/services', [SchoolServices::class, 'index'])->name('services');
        Route::post('/services', [SchoolServices::class, 'store'])->name('services.store');
        Route::put('/services/{service}', [SchoolServices::class, 'update'])->name('services.update');
        Route::delete('/services/{service}', [SchoolServices::class, 'destroy'])->name('services.destroy');
        Route::get('/subscription', [SchoolSubscription::class, 'index'])->name('subscription');
        Route::get('/settings', [SchoolSettings::class, 'index'])->name('settings');
        Route::post('/settings', [SchoolSettings::class, 'store'])->name('settings.store');
        Route::put('/settings', [SchoolSettings::class, 'update'])->name('settings.update');
        Route::post('/settings/logo', [SchoolSettings::class, 'uploadLogo'])->name('settings.logo');
        Route::post('/settings/banner', [SchoolSettings::class, 'uploadBanner'])->name('settings.banner');
    });
});

require __DIR__ . '/auth.php';
