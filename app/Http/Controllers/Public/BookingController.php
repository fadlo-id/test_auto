<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\AutoSchool;
use App\Models\Booking;
use App\Services\NotificationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;

class BookingController extends Controller
{
    public function __construct(private NotificationService $notifications) {}

    public function store(Request $request, string $slug): RedirectResponse
    {
        $key = 'booking:' . ($request->ip() ?? 'unknown');
        if (RateLimiter::tooManyAttempts($key, 5)) {
            $seconds = RateLimiter::availableIn($key);
            return back()->with('error', "Trop de demandes. Veuillez réessayer dans {$seconds} secondes.");
        }
        RateLimiter::hit($key, 3600);

        $school = AutoSchool::active()->where('slug', $slug)->firstOrFail();

        $validated = $request->validate([
            'name'           => 'required|string|max:255',
            'email'          => 'required|email|max:255',
            'phone'          => 'nullable|string|max:20',
            'permit_type'    => 'nullable|string|max:10',
            'message'        => 'nullable|string|max:1000',
            'preferred_date' => 'nullable|date|after:today',
        ]);

        $booking = Booking::create(array_merge($validated, [
            'auto_school_id' => $school->id,
            'user_id'        => auth()->id(),
        ]));

        $this->notifications->notifyNewBooking($booking);
        $this->notifications->notifyBookingConfirmation($booking);

        return back()->with('success', 'Votre demande de réservation a été envoyée !');
    }
}
