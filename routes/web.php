<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Routes publiques
Route::get('/', function () {
    return Inertia::render('HomePage');
})->name('home');

Route::get('/search', function () {
    return Inertia::render('SearchPage');
})->name('search');

Route::get('/auto-ecole/{id}', function () {
    return Inertia::render('DetailPage');
})->name('school.detail');

// Routes authentifiées
Route::middleware(['auth', 'verified'])->group(function () {
    
    // Dashboard intelligent (redirection selon rôle)
    Route::get('/dashboard', function () {
        $user = auth()->user();
        
        if ($user->role === 'admin') {
            return redirect()->route('admin.dashboard');
        }
        
        if ($user->role === 'school_owner') {
            return redirect()->route('school.dashboard');
        }
        
        return Inertia::render('Dashboard');
    })->name('dashboard');

    // Profile
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Routes propriétaire auto-école
    Route::middleware(['school.owner'])->prefix('school')->name('school.')->group(function () {
        Route::get('/dashboard', function () {
            return Inertia::render('SchoolDashboard/Overview');
        })->name('dashboard');
        
        Route::get('/analytics', function () {
            return Inertia::render('SchoolDashboard/Analytics');
        })->name('analytics');
        
        Route::get('/reviews', function () {
            return Inertia::render('SchoolDashboard/Reviews');
        })->name('reviews');
        
        Route::get('/services', function () {
            return Inertia::render('SchoolDashboard/Services');
        })->name('services');
        
        Route::get('/subscription', function () {
            return Inertia::render('SchoolDashboard/Subscription');
        })->name('subscription');
        
        Route::get('/settings', function () {
            return Inertia::render('SchoolDashboard/Settings');
        })->name('settings');
    });

    // Routes admin
    Route::middleware(['admin'])->prefix('admin')->name('admin.')->group(function () {
        Route::get('/dashboard', function () {
            return Inertia::render('Admin/AdminDashboard');
        })->name('dashboard');
        
        Route::get('/analytics', function () {
            return Inertia::render('Admin/Analytics');
        })->name('analytics');
        
        Route::get('/users', function () {
            return Inertia::render('Admin/Users');
        })->name('users.index');
        
        Route::get('/auto-schools', function () {
            return Inertia::render('Admin/AutoSchools');
        })->name('auto-schools.index');
        
        Route::get('/reviews', function () {
            return Inertia::render('Admin/Reviews');
        })->name('reviews.index');
        
        Route::get('/subscriptions', function () {
            return Inertia::render('Admin/Subscriptions');
        })->name('subscriptions.index');
        
        Route::get('/payments', function () {
            return Inertia::render('Admin/Payments');
        })->name('payments.index');
    });
});

require __DIR__.'/auth.php';