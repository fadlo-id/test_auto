<?php

use Illuminate\Support\Facades\Route;

// Health check
Route::get('/health', fn () => response()->json(['status' => 'ok', 'timestamp' => now()->toISOString()]))->name('api.health');