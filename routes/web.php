<?php

use App\Http\Controllers\School\DashboardController as SchoolDashboard;
use App\Http\Controllers\School\ReviewsController as SchoolReviews;
use App\Http\Controllers\School\ServicesController as SchoolServices;
use App\Http\Controllers\School\SettingsController as SchoolSettings;
use App\Http\Controllers\School\AnalyticsController as SchoolAnalytics;
use App\Http\Controllers\School\SubscriptionController as SchoolSubscription;
use App\Http\Controllers\School\PaymentController as SchoolPayment;
use App\Http\Controllers\School\GalleryController as SchoolGallery;
use App\Http\Controllers\StripeWebhookController;
use App\Http\Controllers\Admin\DashboardController as AdminDashboard;
use App\Http\Controllers\Admin\UsersController as AdminUsers;
use App\Http\Controllers\Admin\SchoolsController as AdminSchools;
use App\Http\Controllers\Admin\ReviewsController as AdminReviews;
use App\Http\Controllers\Admin\PaymentsController as AdminPayments;
use App\Http\Controllers\Admin\AnalyticsController as AdminAnalytics;
use App\Http\Controllers\Admin\SubscriptionsController as AdminSubscriptions;
use App\Http\Controllers\Admin\CategoriesController as AdminCategories;
use App\Http\Controllers\Admin\PlansController as AdminPlans;
use App\Http\Controllers\User\DashboardController as UserDashboard;
use App\Http\Controllers\User\ReviewsController as UserReviews;
use App\Http\Controllers\User\FavoritesController as UserFavorites;
use App\Http\Controllers\Public\HomeController;
use App\Http\Controllers\Public\ReviewController as PublicReview;
use App\Http\Controllers\Public\SearchController;
use App\Http\Controllers\Public\SchoolDetailController;
use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Stripe webhook (no CSRF)
Route::post('/stripe/webhook', [StripeWebhookController::class, 'handle'])->name('stripe.webhook');

// SEO
Route::get('/sitemap.xml', [\App\Http\Controllers\SitemapController::class, 'index'])->name('sitemap');

// Routes publiques
Route::get('/', [HomeController::class, 'index'])->name('home');
Route::get('/search', [SearchController::class, 'index'])->name('search');
Route::get('/auto-ecole/{slug}', [SchoolDetailController::class, 'show'])->name('school.detail');
Route::post('/auto-ecole/{slug}/review', [PublicReview::class, 'store'])->middleware('auth')->name('school.detail.review');

// Static pages
Route::get('/a-propos', fn () => Inertia::render('StaticPages/About'))->name('about');
Route::get('/faq', fn () => Inertia::render('StaticPages/Faq'))->name('faq');
Route::get('/confidentialite', fn () => Inertia::render('StaticPages/Privacy'))->name('privacy');
Route::get('/conditions', fn () => Inertia::render('StaticPages/Terms'))->name('terms');
Route::get('/contact', fn () => Inertia::render('StaticPages/Contact'))->name('contact');
Route::post('/contact', [\App\Http\Controllers\Public\ContactController::class, 'submit'])->name('contact.submit');

// Routes authentifiées
Route::middleware(['auth', 'verified'])->group(function () {

    // Smart redirect dashboard
    Route::get('/dashboard', function () {
        $user = auth()->user();
        if ($user->isAdmin()) return redirect()->route('admin.dashboard');
        if ($user->isSchoolOwner()) return redirect()->route('school.dashboard');
        return redirect()->route('user.dashboard');
    })->name('dashboard');

    // Profile (Breeze)
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // ── User portal ──────────────────────────────────────────
    Route::prefix('user')->name('user.')->group(function () {
        Route::get('/dashboard',  [UserDashboard::class, 'index'])->name('dashboard');
        Route::get('/reviews',    [UserReviews::class,   'index'])->name('reviews');
        Route::get('/favorites',  [UserFavorites::class, 'index'])->name('favorites');
        Route::post('/favorites/{school}', [UserFavorites::class, 'toggle'])->name('favorites.toggle');
        Route::get('/profile',    fn () => \Inertia\Inertia::render('UserDashboard/Profile'))->name('profile');
    });

    // ── Admin routes ─────────────────────────────────────────
    Route::middleware('admin')->prefix('admin')->name('admin.')->group(function () {
        Route::get('/dashboard', [AdminDashboard::class, 'index'])->name('dashboard');

        // Users
        Route::get('/users',              [AdminUsers::class, 'index'])->name('users.index');
        Route::put('/users/{user}',       [AdminUsers::class, 'update'])->name('users.update');
        Route::delete('/users/{user}',    [AdminUsers::class, 'destroy'])->name('users.destroy');
        Route::post('/users/{user}/ban',  [AdminUsers::class, 'ban'])->name('users.ban');

        // Schools
        Route::get('/auto-schools',                           [AdminSchools::class, 'index'])->name('auto-schools.index');
        Route::post('/auto-schools/{school}/approve',         [AdminSchools::class, 'approve'])->name('auto-schools.approve');
        Route::post('/auto-schools/{school}/reject',          [AdminSchools::class, 'reject'])->name('auto-schools.reject');
        Route::delete('/auto-schools/{school}',               [AdminSchools::class, 'destroy'])->name('auto-schools.destroy');

        // Reviews
        Route::get('/reviews',                    [AdminReviews::class, 'index'])->name('reviews.index');
        Route::post('/reviews/{review}/approve',  [AdminReviews::class, 'approve'])->name('reviews.approve');
        Route::post('/reviews/{review}/reject',   [AdminReviews::class, 'reject'])->name('reviews.reject');
        Route::delete('/reviews/{review}',        [AdminReviews::class, 'destroy'])->name('reviews.destroy');

        // Payments
        Route::get('/payments', [AdminPayments::class, 'index'])->name('payments.index');

        // Subscriptions
        Route::get('/subscriptions',                              [AdminSubscriptions::class, 'index'])->name('subscriptions.index');
        Route::post('/subscriptions/{subscription}/cancel',       [AdminSubscriptions::class, 'cancel'])->name('subscriptions.cancel');

        // Categories
        Route::get('/categories',                   [AdminCategories::class, 'index'])->name('categories.index');
        Route::post('/categories',                  [AdminCategories::class, 'store'])->name('categories.store');
        Route::put('/categories/{category}',        [AdminCategories::class, 'update'])->name('categories.update');
        Route::delete('/categories/{category}',     [AdminCategories::class, 'destroy'])->name('categories.destroy');

        // Plans
        Route::get('/plans',                [AdminPlans::class, 'index'])->name('plans.index');
        Route::post('/plans',               [AdminPlans::class, 'store'])->name('plans.store');
        Route::put('/plans/{plan}',         [AdminPlans::class, 'update'])->name('plans.update');
        Route::delete('/plans/{plan}',      [AdminPlans::class, 'destroy'])->name('plans.destroy');

        // Analytics
        Route::get('/analytics', [AdminAnalytics::class, 'index'])->name('analytics');
    });

    // ── School owner routes ───────────────────────────────────
    Route::middleware('school.owner')->prefix('school')->name('school.')->group(function () {
        Route::get('/dashboard',  [SchoolDashboard::class,  'index'])->name('dashboard');
        Route::get('/analytics',  [SchoolAnalytics::class,  'index'])->name('analytics');
        Route::get('/reviews',    [SchoolReviews::class,    'index'])->name('reviews');
        Route::post('/reviews/{review}/reply',  [SchoolReviews::class, 'reply'])->name('reviews.reply');
        Route::delete('/reviews/{review}/reply',[SchoolReviews::class, 'deleteReply'])->name('reviews.reply.delete');
        Route::get('/services',               [SchoolServices::class,  'index'])->name('services');
        Route::post('/services',              [SchoolServices::class,  'store'])->name('services.store');
        Route::put('/services/{service}',     [SchoolServices::class,  'update'])->name('services.update');
        Route::delete('/services/{service}',  [SchoolServices::class,  'destroy'])->name('services.destroy');
        Route::get('/gallery',                [SchoolGallery::class,   'index'])->name('gallery');
        Route::post('/gallery',               [SchoolGallery::class,   'store'])->name('gallery.store');
        Route::delete('/gallery/{photo}',     [SchoolGallery::class,   'destroy'])->name('gallery.destroy');
        Route::get('/subscription',           [SchoolSubscription::class, 'index'])->name('subscription');
        Route::post('/subscription/cancel',   [SchoolSubscription::class, 'cancel'])->name('subscription.cancel');
        Route::post('/payment/intent',        [SchoolPayment::class,   'createIntent'])->name('payment.intent');
        Route::get('/payment/success',        [SchoolPayment::class,   'success'])->name('payment.success');
        Route::get('/payment/cancel',         [SchoolPayment::class,   'cancel'])->name('payment.cancel');
        Route::get('/settings',               [SchoolSettings::class,  'index'])->name('settings');
        Route::post('/settings',              [SchoolSettings::class,  'store'])->name('settings.store');
        Route::put('/settings',               [SchoolSettings::class,  'update'])->name('settings.update');
        Route::post('/settings/logo',         [SchoolSettings::class,  'uploadLogo'])->name('settings.logo');
        Route::post('/settings/banner',       [SchoolSettings::class,  'uploadBanner'])->name('settings.banner');
    });
});

require __DIR__ . '/auth.php';
