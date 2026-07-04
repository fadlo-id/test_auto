<?php

use App\Http\Controllers\Analytics\TrackViewController;
use App\Http\Controllers\Analytics\SocialClickController;
use App\Http\Controllers\Analytics\ContactRequestController;
use Illuminate\Support\Facades\Route;

// Health check
Route::get('/health', fn () => response()->json(['status' => 'ok', 'timestamp' => now()->toISOString()]))->name('api.health');

// Analytics tracking (no auth required — public endpoints, rate limited)
Route::middleware('throttle:120,1')->prefix('track')->group(function () {
    Route::post('/view',    [TrackViewController::class,    'store'])->name('track.view');
    Route::post('/click',   [SocialClickController::class,  'store'])->name('track.click');
    Route::post('/contact', [ContactRequestController::class,'store'])->name('track.contact');
});