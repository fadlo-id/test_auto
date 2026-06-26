<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\SchoolDashboardController;
use App\Http\Controllers\Api\SchoolProfileController;
use App\Http\Controllers\Api\SchoolServiceController;

/**
 * School Dashboard Routes
 * Prefix: /api/v1/school
 */

Route::middleware(['auth:sanctum', 'school.owner'])->group(function () {
    // Dashboard
    Route::get('/dashboard/{id}', [SchoolDashboardController::class, 'index']);

    // Profile Management
    Route::put('{id}/profile', [SchoolProfileController::class, 'update']);
    Route::post('{id}/upload-logo', [SchoolProfileController::class, 'uploadLogo']);
    Route::post('{id}/upload-banner', [SchoolProfileController::class, 'uploadBanner']);

    // Services Management
    Route::get('{schoolId}/services', [SchoolServiceController::class, 'index']);
    Route::post('{schoolId}/services', [SchoolServiceController::class, 'store']);
    Route::get('{schoolId}/services/{id}', [SchoolServiceController::class, 'show']);
    Route::put('{schoolId}/services/{id}', [SchoolServiceController::class, 'update']);
    Route::delete('{schoolId}/services/{id}', [SchoolServiceController::class, 'destroy']);
});
