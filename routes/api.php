<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\AutoSchoolController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\SubscriptionController;

Route::prefix('v1')->group(function () {

    // Auth publique
    Route::post('/auth/register', [AuthController::class, 'register']);
    Route::post('/auth/login', [AuthController::class, 'login']);

    // Routes publiques
    Route::get('/auto-schools', [AutoSchoolController::class, 'index']);
    Route::get('/auto-schools/{slug}', [AutoSchoolController::class, 'show']);
    Route::get('/plans', [SubscriptionController::class, 'plans']);

    // Reviews publiques
    Route::get('/auto-schools/{autoSchool}/reviews', [ReviewController::class, 'index']);

    // Routes protégées
    Route::middleware('auth:sanctum')->group(function () {

        Route::get('/auth/me', [AuthController::class, 'me']);
        Route::post('/auth/logout', [AuthController::class, 'logout']);

        Route::post('/auto-schools', [AutoSchoolController::class, 'store']);
        Route::put('/auto-schools/{autoSchool}', [AutoSchoolController::class, 'update']);
        Route::delete('/auto-schools/{autoSchool}', [AutoSchoolController::class, 'destroy']);

        // Reviews
        Route::post('/auto-schools/{autoSchool}/reviews', [ReviewController::class, 'store']);
        Route::put('/reviews/{review}', [ReviewController::class, 'update']);
        Route::delete('/reviews/{review}', [ReviewController::class, 'destroy']);

        // Subscription
        Route::post('/subscribe', [SubscriptionController::class, 'subscribe']);
        Route::get('/subscription/current', [SubscriptionController::class, 'current']);
        Route::post('/subscription/cancel', [SubscriptionController::class, 'cancel']);
    });
});