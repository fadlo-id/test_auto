<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\TrackingController;
use App\Http\Controllers\Api\AnalyticsController;
use App\Http\Controllers\Api\Admin\AdminAnalyticsController;

/**
 * Analytics Routes
 * Base: /api/v1
 */

// Public tracking routes (no auth required)
Route::prefix('track')->group(function () {
    Route::post('/view', [TrackingController::class, 'trackView']);
    Route::post('/click', [TrackingController::class, 'trackClick']);
    Route::post('/lead', [TrackingController::class, 'trackLead']);
});

// School owner analytics routes
Route::middleware(['auth:sanctum', 'school.owner'])->prefix('school/analytics')->group(function () {
    Route::get('/dashboard', [AnalyticsController::class, 'dashboard']);
    Route::get('/comparison', [AnalyticsController::class, 'comparison']);
    Route::get('/monthly', [AnalyticsController::class, 'monthly']);
    Route::get('/annual', [AnalyticsController::class, 'annual']);
    Route::get('/funnel', [AnalyticsController::class, 'funnel']);
    Route::get('/roi', [AnalyticsController::class, 'roi']);
    Route::get('/leads', [AnalyticsController::class, 'leads']);
    Route::get('/leads/{id}', [AnalyticsController::class, 'showLead']);
    Route::put('/leads/{id}', [AnalyticsController::class, 'updateLead']);
    Route::get('/export', [AnalyticsController::class, 'export']);
});

// Admin analytics routes
Route::middleware(['auth:sanctum', 'admin'])->prefix('admin/analytics')->group(function () {
    Route::get('/dashboard', [AdminAnalyticsController::class, 'dashboard']);
    Route::get('/revenue', [AdminAnalyticsController::class, 'revenue']);
    Route::get('/growth', [AdminAnalyticsController::class, 'growth']);
    Route::get('/top-schools', [AdminAnalyticsController::class, 'topSchools']);
    Route::get('/top-clicks', [AdminAnalyticsController::class, 'topClicks']);
    Route::get('/devices', [AdminAnalyticsController::class, 'devices']);
    Route::get('/leads', [AdminAnalyticsController::class, 'leads']);
});
