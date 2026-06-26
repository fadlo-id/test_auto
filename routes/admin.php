<?php

use App\Http\Controllers\Api\AdminDashboardController;
use App\Http\Controllers\Api\AdminUsersController;
use App\Http\Controllers\Api\AdminSchoolsController;
use App\Http\Controllers\Api\AdminReviewsController;
use App\Http\Controllers\Api\AdminPaymentsController;
use App\Http\Controllers\Api\AdminSubscriptionsController;
use App\Http\Controllers\Api\AdminAnalyticsController;
use Illuminate\Support\Facades\Route;

// All admin routes require authentication and admin role
Route::middleware(['auth:sanctum', 'admin'])->group(function () {
    // Dashboard
    Route::get('admin/dashboard', [AdminDashboardController::class, 'index']);

    // Users Management
    Route::get('admin/users', [AdminUsersController::class, 'index']);
    Route::put('admin/users/{id}', [AdminUsersController::class, 'update']);
    Route::post('admin/users/{id}/ban', [AdminUsersController::class, 'ban']);
    Route::delete('admin/users/{id}', [AdminUsersController::class, 'destroy']);

    // Schools Management
    Route::get('admin/schools', [AdminSchoolsController::class, 'index']);
    Route::put('admin/schools/{id}', [AdminSchoolsController::class, 'update']);
    Route::post('admin/schools/{id}/approve', [AdminSchoolsController::class, 'approve']);
    Route::post('admin/schools/{id}/reject', [AdminSchoolsController::class, 'reject']);
    Route::delete('admin/schools/{id}', [AdminSchoolsController::class, 'destroy']);

    // Reviews Moderation
    Route::get('admin/reviews', [AdminReviewsController::class, 'index']);
    Route::post('admin/reviews/{id}/approve', [AdminReviewsController::class, 'approve']);
    Route::post('admin/reviews/{id}/reject', [AdminReviewsController::class, 'reject']);
    Route::delete('admin/reviews/{id}', [AdminReviewsController::class, 'destroy']);

    // Payments Management
    Route::get('admin/payments', [AdminPaymentsController::class, 'index']);

    // Subscriptions Management
    Route::get('admin/subscriptions', [AdminSubscriptionsController::class, 'index']);
    Route::post('admin/subscriptions/{id}/cancel', [AdminSubscriptionsController::class, 'cancel']);

    // Analytics
    Route::get('admin/analytics', [AdminAnalyticsController::class, 'index']);
});
