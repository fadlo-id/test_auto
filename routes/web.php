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
use App\Http\Controllers\Admin\ContactRequestsController as AdminContacts;
use App\Http\Controllers\Admin\ReportsController as AdminReports;
use App\Http\Controllers\Admin\LogsController as AdminLogs;
use App\Http\Controllers\Admin\SystemSettingsController as AdminSystemSettings;
use App\Http\Controllers\Admin\NewsletterController as AdminNewsletter;
use App\Http\Controllers\Admin\ServicesController as AdminServices;
use App\Http\Controllers\Admin\CreditManagementController as AdminCredits;
use App\Http\Controllers\Admin\AdminsController;
use App\Http\Controllers\Admin\RolesController as AdminRoles;
use App\Http\Controllers\Admin\PermissionsController as AdminPermissions;
use App\Http\Controllers\Admin\AuditLogsController as AdminAuditLogs;
use App\Http\Controllers\Admin\StubController as AdminStub;
use App\Http\Controllers\Admin\ArticlesController as AdminArticles;
use App\Http\Controllers\Admin\CouponsController as AdminCoupons;
use App\Http\Controllers\Admin\RegionsController as AdminRegions;
use App\Http\Controllers\Admin\AdsController as AdminAds;
use App\Http\Controllers\Admin\SignalementsController as AdminSignalements;
use App\Http\Controllers\Admin\Crm\CrmDashboardController;
use App\Http\Controllers\Admin\Crm\CrmProspectController;
use App\Http\Controllers\Admin\Crm\CrmPipelineController;
use App\Http\Controllers\Admin\Crm\CrmNoteController;
use App\Http\Controllers\Admin\Crm\CrmTagController;
use App\Http\Controllers\Admin\Crm\CrmReminderController;
use App\Http\Controllers\Admin\Crm\CrmEmailController;
use App\Http\Controllers\Admin\Crm\CrmSmsController;
use App\Http\Controllers\School\BookingsController as SchoolBookings;
use App\Http\Controllers\School\StatisticsController as SchoolStatistics;
use App\Http\Controllers\School\NotificationsController as SchoolNotifications;
use App\Http\Controllers\School\BillingController as SchoolBilling;
use App\Http\Controllers\School\InvoiceController as SchoolInvoice;
use App\Http\Controllers\School\ProfileController as SchoolProfile;
use App\Http\Controllers\User\DashboardController as UserDashboard;
use App\Http\Controllers\User\ReviewsController as UserReviews;
use App\Http\Controllers\User\FavoritesController as UserFavorites;
use App\Http\Controllers\Public\HomeController;
use App\Http\Controllers\Public\ReviewController as PublicReview;
use App\Http\Controllers\Public\SearchController;
use App\Http\Controllers\Public\StaticPageController;
use App\Http\Controllers\Public\SchoolDetailController;
use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Stripe webhook (no CSRF)
Route::post('/stripe/webhook', [StripeWebhookController::class, 'handle'])->name('stripe.webhook');

// SEO — Sitemap index + sub-sitemaps
Route::get('/sitemap.xml',            [\App\Http\Controllers\SitemapController::class, 'index'])->name('sitemap');
Route::get('/sitemap-static.xml',     [\App\Http\Controllers\SitemapController::class, 'staticPages'])->name('sitemap.static');
Route::get('/sitemap-schools.xml',    [\App\Http\Controllers\SitemapController::class, 'schools'])->name('sitemap.schools');
Route::get('/sitemap-cities.xml',     [\App\Http\Controllers\SitemapController::class, 'cities'])->name('sitemap.cities');
Route::get('/sitemap-categories.xml', [\App\Http\Controllers\SitemapController::class, 'categories'])->name('sitemap.categories');
Route::get('/robots.txt',             [\App\Http\Controllers\SitemapController::class, 'robots'])->name('robots');

// Routes publiques (maintenance mode applies)
Route::middleware('maintenance')->group(function () {
    Route::get('/', [HomeController::class, 'index'])->name('home');
    Route::get('/search', [SearchController::class, 'index'])->name('search');
    Route::get('/ville/{city}', [SearchController::class, 'byCity'])->name('search.city');
    Route::get('/categorie/{code}', [SearchController::class, 'byCategory'])->name('search.category');
    Route::get('/auto-ecole/{slug}', [SchoolDetailController::class, 'show'])->name('school.detail');
    Route::post('/auto-ecole/{slug}/review', [PublicReview::class, 'store'])->middleware(['auth', 'verified'])->name('school.detail.review');
    Route::post('/auto-ecole/{slug}/booking', [\App\Http\Controllers\Public\BookingController::class, 'store'])->name('school.detail.booking');
});

// Static pages — served from CMS (SiteSettings) with fallback to hardcoded content
Route::middleware('maintenance')->group(function () {
    Route::get('/a-propos',        [StaticPageController::class, 'about'])->name('about');
    Route::get('/faq',             [StaticPageController::class, 'faq'])->name('faq');
    Route::get('/confidentialite', [StaticPageController::class, 'privacy'])->name('privacy');
    Route::get('/conditions',      [StaticPageController::class, 'terms'])->name('terms');
    Route::get('/contact',         [StaticPageController::class, 'contact'])->name('contact');
});
Route::post('/contact', [\App\Http\Controllers\Public\ContactController::class, 'submit'])->name('contact.submit');

// One-click newsletter unsubscribe (public, unauthenticated — link included in every newsletter email)
Route::get('/newsletter/unsubscribe/{token}', [\App\Http\Controllers\Admin\NewsletterController::class, 'publicUnsubscribe'])
    ->name('newsletter.unsubscribe.public');

// Routes authentifiées
Route::middleware(['auth'])->group(function () {

    // Smart redirect dashboard
    Route::get('/dashboard', fn () => redirect()->route(auth()->user()->redirectRouteName()))->name('dashboard');

    // Profile (Breeze)
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Dismiss the persistent email-verification banner for the rest of this session
    Route::post('/email/verification-banner/dismiss', function () {
        session(['verification_banner_dismissed' => true]);
        return back();
    })->name('verification.banner.dismiss');

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

        // Dashboard — accessible to all admins
        Route::get('/dashboard',        [AdminDashboard::class, 'index'])->name('dashboard');
        Route::get('/dashboard/live',   [AdminDashboard::class, 'live'])->name('dashboard.live');
        Route::get('/dashboard/export', [AdminDashboard::class, 'export'])->name('dashboard.export');

        // Users
        Route::middleware('permission:manage_users')->group(function () {
            Route::get('/users',                      [AdminUsers::class, 'index'])->name('users.index');
            Route::put('/users/{user}',               [AdminUsers::class, 'update'])->name('users.update');
            Route::delete('/users/{user}',            [AdminUsers::class, 'destroy'])->name('users.destroy');
            Route::post('/users/{user}/activate',     [AdminUsers::class, 'activate'])->name('users.activate');
            Route::post('/users/{user}/deactivate',   [AdminUsers::class, 'deactivate'])->name('users.deactivate');
            Route::post('/users/{user}/ban',          [AdminUsers::class, 'ban'])->name('users.ban');
            Route::post('/users/{user}/unban',        [AdminUsers::class, 'unban'])->name('users.unban');
            Route::get('/users/export',               [AdminUsers::class, 'export'])->name('users.export');
            Route::get('/instructors',                [AdminStub::class, 'instructors'])->name('instructors.index');
            Route::get('/students',                   [AdminStub::class, 'students'])->name('students.index');
        });

        // Schools
        Route::middleware('permission:manage_schools')->group(function () {
            Route::get('/auto-schools',                              [AdminSchools::class, 'index'])->name('auto-schools.index');
            Route::post('/auto-schools/{school}/approve',            [AdminSchools::class, 'approve'])->name('auto-schools.approve');
            Route::post('/auto-schools/{school}/reject',             [AdminSchools::class, 'reject'])->name('auto-schools.reject');
            Route::post('/auto-schools/{school}/activate',           [AdminSchools::class, 'activate'])->name('auto-schools.activate');
            Route::post('/auto-schools/{school}/deactivate',         [AdminSchools::class, 'deactivate'])->name('auto-schools.deactivate');
            Route::delete('/auto-schools/{school}',                  [AdminSchools::class, 'destroy'])->name('auto-schools.destroy');
            Route::get('/auto-schools/export',                       [AdminSchools::class, 'export'])->name('auto-schools.export');
            Route::get('/services',                                  [AdminServices::class, 'index'])->name('services.index');
            Route::delete('/services/{service}',                     [AdminServices::class, 'destroy'])->name('services.destroy');
        });

        // Reviews
        Route::middleware('permission:manage_reviews')->group(function () {
            Route::get('/reviews',                    [AdminReviews::class, 'index'])->name('reviews.index');
            Route::post('/reviews/{review}/approve',  [AdminReviews::class, 'approve'])->name('reviews.approve');
            Route::post('/reviews/{review}/reject',   [AdminReviews::class, 'reject'])->name('reviews.reject');
            Route::delete('/reviews/{review}',        [AdminReviews::class, 'destroy'])->name('reviews.destroy');
            Route::get('/signalements',                          [AdminSignalements::class, 'index'])->name('signalements.index');
            Route::post('/signalements/{signalement}/resolve',   [AdminSignalements::class, 'resolve'])->name('signalements.resolve');
            Route::post('/signalements/{signalement}/dismiss',   [AdminSignalements::class, 'dismiss'])->name('signalements.dismiss');
            Route::delete('/signalements/{signalement}',         [AdminSignalements::class, 'destroy'])->name('signalements.destroy');
        });

        // Payments
        Route::middleware('permission:manage_payments')->group(function () {
            Route::get('/payments',                         [AdminPayments::class, 'index'])->name('payments.index');
            Route::post('/payments/{payment}/refund',       [AdminPayments::class, 'refund'])->name('payments.refund');
            Route::get('/payments/{payment}/invoice',       [AdminPayments::class, 'invoice'])->name('payments.invoice');
        });

        // Subscriptions
        Route::middleware('permission:manage_subscriptions')->group(function () {
            Route::get('/subscriptions',                              [AdminSubscriptions::class, 'index'])->name('subscriptions.index');
            Route::post('/subscriptions/{subscription}/cancel',       [AdminSubscriptions::class, 'cancel'])->name('subscriptions.cancel');
        });
        Route::middleware('permission:manage_payments')->group(function () {
            Route::get('/invoices',                                   [AdminPayments::class, 'index'])->name('invoices.index');
        });

        // Categories & Content
        Route::middleware('permission:manage_categories')->group(function () {
            Route::get('/categories',                   [AdminCategories::class, 'index'])->name('categories.index');
            Route::post('/categories',                  [AdminCategories::class, 'store'])->name('categories.store');
            Route::put('/categories/{category}',        [AdminCategories::class, 'update'])->name('categories.update');
            Route::delete('/categories/{category}',     [AdminCategories::class, 'destroy'])->name('categories.destroy');
            Route::get('/cities',                       [AdminStub::class, 'cities'])->name('cities.index');
            Route::get('/regions',                      [AdminRegions::class, 'index'])->name('regions.index');
            Route::post('/regions',                     [AdminRegions::class, 'store'])->name('regions.store');
            Route::put('/regions/{region}',             [AdminRegions::class, 'update'])->name('regions.update');
            Route::delete('/regions/{region}',          [AdminRegions::class, 'destroy'])->name('regions.destroy');
        });

        // Plans & Coupons
        Route::middleware('permission:manage_plans')->group(function () {
            Route::get('/plans',                [AdminPlans::class, 'index'])->name('plans.index');
            Route::post('/plans',               [AdminPlans::class, 'store'])->name('plans.store');
            Route::put('/plans/{plan}',         [AdminPlans::class, 'update'])->name('plans.update');
            Route::delete('/plans/{plan}',      [AdminPlans::class, 'destroy'])->name('plans.destroy');
            Route::get('/coupons',              [AdminCoupons::class, 'index'])->name('coupons.index');
            Route::post('/coupons',             [AdminCoupons::class, 'store'])->name('coupons.store');
            Route::post('/coupons/generate',    [AdminCoupons::class, 'generate'])->name('coupons.generate');
            Route::put('/coupons/{coupon}',     [AdminCoupons::class, 'update'])->name('coupons.update');
            Route::delete('/coupons/{coupon}',  [AdminCoupons::class, 'destroy'])->name('coupons.destroy');
        });

        // Analytics
        Route::middleware('permission:manage_analytics')->group(function () {
            Route::get('/analytics',                 [AdminAnalytics::class, 'index'])->name('analytics');
            Route::get('/analytics/export/{format}',  [AdminAnalytics::class, 'export'])
                ->whereIn('format', ['pdf', 'excel', 'csv'])->name('analytics.export');
            Route::get('/revenue',             [AdminStub::class, 'revenue'])->name('revenue');
            Route::get('/stats/users',         [AdminStub::class, 'statsUsers'])->name('stats.users');
            Route::get('/stats/schools',       [AdminStub::class, 'statsSchools'])->name('stats.schools');
        });

        // Contact Requests
        Route::middleware('permission:manage_contacts')->group(function () {
            Route::get('/contact-requests',                           [AdminContacts::class, 'index'])->name('contact-requests.index');
            Route::post('/contact-requests/{contactRequest}/read',    [AdminContacts::class, 'markRead'])->name('contact-requests.read');
            Route::post('/contact-requests/{contactRequest}/reply',   [AdminContacts::class, 'reply'])->name('contact-requests.reply');
            Route::delete('/contact-requests/{contactRequest}',       [AdminContacts::class, 'destroy'])->name('contact-requests.destroy');
        });

        // Reports
        Route::middleware('permission:manage_reports')->group(function () {
            Route::get('/reports', [AdminReports::class, 'index'])->name('reports');
        });

        // Logs
        Route::middleware('permission:manage_logs')->group(function () {
            Route::get('/logs',        [AdminLogs::class, 'index'])->name('logs');
            Route::post('/logs/clear', [AdminLogs::class, 'clear'])->name('logs.clear');
        });

        // Settings
        Route::middleware('permission:manage_settings')->group(function () {
            Route::get('/settings',        [AdminSystemSettings::class, 'index'])->name('settings');
            Route::put('/settings',        [AdminSystemSettings::class, 'update'])->name('settings.update');
            Route::get('/configuration',   [AdminStub::class, 'configuration'])->name('configuration');
            Route::get('/roles',           [AdminRoles::class, 'index'])->name('roles.index');
            Route::get('/backups',         [AdminStub::class, 'backups'])->name('backups');
            Route::get('/ads',             [AdminAds::class, 'index'])->name('ads.index');
            Route::post('/ads',            [AdminAds::class, 'store'])->name('ads.store');
            Route::put('/ads/{ad}',        [AdminAds::class, 'update'])->name('ads.update');
            Route::delete('/ads/{ad}',     [AdminAds::class, 'destroy'])->name('ads.destroy');
            Route::get('/news',                   [AdminArticles::class, 'index'])->name('news.index');
            Route::post('/news',                  [AdminArticles::class, 'store'])->name('news.store');
            Route::put('/news/{article}',         [AdminArticles::class, 'update'])->name('news.update');
            Route::delete('/news/{article}',      [AdminArticles::class, 'destroy'])->name('news.destroy');
            Route::post('/news/{article}/toggle', [AdminArticles::class, 'togglePublish'])->name('news.toggle');
        });

        // Newsletter
        Route::middleware('permission:manage_newsletter')->group(function () {
            Route::get('/newsletter',                              [AdminNewsletter::class, 'index'])->name('newsletter.index');
            Route::post('/newsletter/send',                        [AdminNewsletter::class, 'send'])->name('newsletter.send');
            Route::delete('/newsletter/{newsletterSubscriber}',    [AdminNewsletter::class, 'destroy'])->name('newsletter.destroy');
            Route::post('/newsletter/{newsletterSubscriber}/unsub',[AdminNewsletter::class, 'unsubscribe'])->name('newsletter.unsubscribe');
        });

        // Credit management
        Route::middleware('permission:manage_credits')->group(function () {
            Route::get('/credits',                                   [AdminCredits::class, 'index'])->name('credits.index');
            Route::get('/credits/{school}',                          [AdminCredits::class, 'show'])->name('credits.show');
            Route::post('/credits/{school}/add',                     [AdminCredits::class, 'add'])->name('credits.add');
            Route::post('/credits/{school}/remove',                  [AdminCredits::class, 'remove'])->name('credits.remove');
            Route::post('/credits/{school}/reset',                   [AdminCredits::class, 'reset'])->name('credits.reset');
            Route::post('/credits/{school}/unlimited',               [AdminCredits::class, 'setUnlimited'])->name('credits.unlimited');
            Route::post('/credits/{school}/remove-unlimited',        [AdminCredits::class, 'removeUnlimited'])->name('credits.remove-unlimited');
            Route::post('/credits/{school}/block',                   [AdminCredits::class, 'block'])->name('credits.block');
            Route::post('/credits/{school}/unblock',                 [AdminCredits::class, 'unblock'])->name('credits.unblock');
            Route::post('/credits/{school}/reactivate',              [AdminCredits::class, 'reactivate'])->name('credits.reactivate');
            Route::post('/credits/{school}/suspend',                 [AdminCredits::class, 'suspend'])->name('credits.suspend');
            Route::post('/credits/{school}/unsuspend',               [AdminCredits::class, 'unsuspend'])->name('credits.unsuspend');
            Route::post('/credits/{school}/transactions/{transaction}/rollback', [AdminCredits::class, 'rollback'])->name('credits.transactions.rollback');
        });

        // ── CRM ──────────────────────────────────────────────────────────────────
        Route::middleware('permission:manage_crm')->prefix('crm')->name('crm.')->group(function () {
            // Dashboard
            Route::get('/', [CrmDashboardController::class, 'index'])->name('dashboard');

            // Pipeline Kanban
            Route::get('/pipeline',             [CrmPipelineController::class, 'index'])->name('pipeline');
            Route::post('/pipeline/move',        [CrmPipelineController::class, 'move'])->name('pipeline.move');
            Route::post('/pipeline/stages',      [CrmPipelineController::class, 'storeStage'])->name('pipeline.stages.store');
            Route::put('/pipeline/stages/{stage}',   [CrmPipelineController::class, 'updateStage'])->name('pipeline.stages.update');
            Route::delete('/pipeline/stages/{stage}',[CrmPipelineController::class, 'destroyStage'])->name('pipeline.stages.destroy');
            Route::post('/pipeline/reorder',     [CrmPipelineController::class, 'reorderStages'])->name('pipeline.reorder');

            // Tags
            Route::get('/tags',           [CrmTagController::class, 'index'])->name('tags.index');
            Route::post('/tags',          [CrmTagController::class, 'store'])->name('tags.store');
            Route::put('/tags/{tag}',     [CrmTagController::class, 'update'])->name('tags.update');
            Route::delete('/tags/{tag}',  [CrmTagController::class, 'destroy'])->name('tags.destroy');

            // Prospects
            Route::get('/prospects',                [CrmProspectController::class, 'index'])->name('prospects.index');
            Route::post('/prospects',               [CrmProspectController::class, 'store'])->name('prospects.store');
            Route::get('/prospects/{prospect}',     [CrmProspectController::class, 'show'])->name('prospects.show');
            Route::put('/prospects/{prospect}',     [CrmProspectController::class, 'update'])->name('prospects.update');
            Route::delete('/prospects/{prospect}',  [CrmProspectController::class, 'destroy'])->name('prospects.destroy');
            Route::post('/prospects/{prospect}/move',   [CrmProspectController::class, 'moveStage'])->name('prospects.move');
            Route::post('/prospects/{prospect}/assign', [CrmProspectController::class, 'assign'])->name('prospects.assign');

            // Notes (nested under prospect)
            Route::post('/prospects/{prospect}/notes',                [CrmNoteController::class, 'store'])->name('prospects.notes.store');
            Route::put('/prospects/{prospect}/notes/{note}',          [CrmNoteController::class, 'update'])->name('prospects.notes.update');
            Route::delete('/prospects/{prospect}/notes/{note}',       [CrmNoteController::class, 'destroy'])->name('prospects.notes.destroy');

            // Reminders
            Route::post('/prospects/{prospect}/reminders',                   [CrmReminderController::class, 'store'])->name('prospects.reminders.store');
            Route::post('/prospects/{prospect}/reminders/{reminder}/done',   [CrmReminderController::class, 'done'])->name('prospects.reminders.done');
            Route::delete('/prospects/{prospect}/reminders/{reminder}',      [CrmReminderController::class, 'destroy'])->name('prospects.reminders.destroy');

            // Emails
            Route::post('/prospects/{prospect}/emails', [CrmEmailController::class, 'store'])
                ->middleware('throttle:20,1')->name('prospects.emails.store');

            // SMS — throttled tighter, SMS carries a real per-message cost
            Route::post('/prospects/{prospect}/sms', [CrmSmsController::class, 'store'])
                ->middleware('throttle:10,1')->name('prospects.sms.store');
        });

        // Profile — accessible to all admins
        Route::get('/profile',   [AdminStub::class, 'profile'])->name('profile');
        Route::patch('/profile', [AdminStub::class, 'updateProfile'])->name('profile.update');

        // Admin management (super_admin only)
        Route::middleware('super_admin')->prefix('admins')->name('admins.')->group(function () {
            Route::get('/',                              [AdminsController::class, 'index'])->name('index');
            Route::post('/',                             [AdminsController::class, 'store'])->name('store');
            Route::put('/{user}',                        [AdminsController::class, 'update'])->name('update');
            Route::delete('/{user}',                     [AdminsController::class, 'destroy'])->name('destroy');
            Route::post('/{user}/toggle-status',         [AdminsController::class, 'toggleStatus'])->name('toggle-status');
            Route::post('/{user}/reset-password',        [AdminsController::class, 'resetPassword'])->name('reset-password');
            Route::post('/{user}/sync-permissions',      [AdminsController::class, 'syncPermissions'])->name('sync-permissions');
        });

        // Role / permission management + audit log (super_admin only)
        Route::middleware('super_admin')->group(function () {
            Route::post('/roles',                          [AdminRoles::class, 'store'])->name('roles.store');
            Route::put('/roles/{role}',                     [AdminRoles::class, 'update'])->name('roles.update');
            Route::delete('/roles/{role}',                  [AdminRoles::class, 'destroy'])->name('roles.destroy');
            Route::put('/roles/{role}/permissions',         [AdminRoles::class, 'updatePermissions'])->name('roles.permissions.update');

            Route::post('/permissions',                     [AdminPermissions::class, 'store'])->name('permissions.store');
            Route::put('/permissions/{permission}',         [AdminPermissions::class, 'update'])->name('permissions.update');
            Route::delete('/permissions/{permission}',      [AdminPermissions::class, 'destroy'])->name('permissions.destroy');

            Route::get('/audit-logs',                       [AdminAuditLogs::class, 'index'])->name('audit-logs.index');
        });
    });

    // ── School owner routes ───────────────────────────────────
    Route::middleware(['school.owner', 'verified'])->prefix('school')->name('school.')->group(function () {

        // Always accessible regardless of subscription status
        Route::get('/subscription',           [SchoolSubscription::class, 'index'])->name('subscription');
        Route::post('/subscription/cancel',   [SchoolSubscription::class, 'cancel'])->name('subscription.cancel');
        Route::post('/payment/intent',        [SchoolPayment::class,   'createIntent'])->name('payment.intent');
        Route::post('/payment/validate-coupon', [SchoolPayment::class, 'validateCoupon'])->name('payment.validate-coupon');
        Route::get('/payment/success',           [SchoolPayment::class,   'success'])->name('payment.success');
        Route::get('/payment/cancel',            [SchoolPayment::class,   'cancel'])->name('payment.cancel');
        Route::post('/payment/upgrade-intent',   [SchoolPayment::class,   'upgradeIntent'])->name('payment.upgrade-intent');
        Route::post('/payment/downgrade',        [SchoolPayment::class,   'downgrade'])->name('payment.downgrade');
        Route::post('/payment/trial',            [SchoolPayment::class,   'startTrial'])->name('payment.trial');
        Route::get('/invoices',                  [SchoolInvoice::class,   'index'])->name('invoices.index');
        Route::get('/invoices/{payment}/download', [SchoolInvoice::class, 'download'])->name('invoices.download');
        Route::get('/settings',               [SchoolSettings::class,  'index'])->name('settings');
        Route::post('/settings',              [SchoolSettings::class,  'store'])->name('settings.store');
        Route::put('/settings',               [SchoolSettings::class,  'update'])->name('settings.update');
        Route::post('/settings/logo',         [SchoolSettings::class,  'uploadLogo'])->name('settings.logo');
        Route::post('/settings/banner',       [SchoolSettings::class,  'uploadBanner'])->name('settings.banner');
        Route::get('/profile',                [SchoolProfile::class,   'index'])->name('profile');
        Route::put('/profile',                [SchoolProfile::class,   'update'])->name('profile.update');

        // Protected routes — redirected when subscription is expired
        Route::middleware('subscription')->group(function () {
            Route::get('/dashboard',  [SchoolDashboard::class,  'index'])->name('dashboard');
            Route::get('/analytics',  [SchoolAnalytics::class,  'index'])->name('analytics');
            Route::get('/analytics/export/{format}', [SchoolAnalytics::class, 'export'])
                ->whereIn('format', ['pdf', 'excel', 'csv'])->name('analytics.export');
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
            Route::get('/bookings',               [SchoolBookings::class,  'index'])->name('bookings');
            Route::put('/bookings/{booking}',     [SchoolBookings::class,  'update'])->name('bookings.update');
            Route::get('/statistics',             [SchoolStatistics::class,'index'])->name('statistics');
            Route::get('/notifications',          [SchoolNotifications::class,'index'])->name('notifications');
            Route::post('/notifications/{id}/read',   [SchoolNotifications::class,'markRead'])->name('notifications.read');
            Route::post('/notifications/read-all',    [SchoolNotifications::class,'markAllRead'])->name('notifications.read-all');
            Route::delete('/notifications/{id}',      [SchoolNotifications::class,'destroy'])->name('notifications.destroy');
            Route::get('/billing',                [SchoolBilling::class,   'index'])->name('billing');
        });
    });
});

// Email template previews (local development only — never registered elsewhere)
if (app()->environment('local')) {
    Route::prefix('dev/mail-preview')->name('dev.mail-preview.')->group(function () {
        Route::get('/', [\App\Http\Controllers\Dev\MailPreviewController::class, 'index'])->name('index');
        Route::get('/{key}', [\App\Http\Controllers\Dev\MailPreviewController::class, 'show'])->name('show');
    });
}

require __DIR__ . '/auth.php';
