<?php

namespace App\Http\Controllers\School;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Services\NotificationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BookingsController extends Controller
{
    public function __construct(private NotificationService $notifications) {}

    private function school()
    {
        return auth()->user()->autoSchool;
    }

    public function index(Request $request): Response
    {
        $school = $this->school();
        abort_if(! $school, 404);

        $bookings = Booking::where('auto_school_id', $school->id)
            ->when($request->status && $request->status !== 'all', fn ($q) => $q->where('status', $request->status))
            ->when($request->search, fn ($q, $s) => $q->where(fn ($qq) => $qq
                ->where('name', 'like', "%{$s}%")
                ->orWhere('email', 'like', "%{$s}%")
                ->orWhere('phone', 'like', "%{$s}%")
            ))
            ->latest()
            ->paginate(15)
            ->withQueryString();

        $statusCounts = Booking::where('auto_school_id', $school->id)
            ->selectRaw('status, count(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status');

        $stats = [
            'total'     => $statusCounts->sum(),
            'pending'   => $statusCounts->get('pending', 0),
            'confirmed' => $statusCounts->get('confirmed', 0),
        ];

        return Inertia::render('SchoolDashboard/Bookings', [
            'bookings' => $bookings,
            'stats'    => $stats,
            'filters'  => $request->only(['search', 'status']),
        ]);
    }

    public function update(Request $request, Booking $booking): RedirectResponse
    {
        $school = $this->school();
        abort_if(! $school || $booking->auto_school_id !== $school->id, 403);

        $request->validate([
            'status'      => 'required|in:pending,confirmed,cancelled,completed',
            'admin_notes' => 'nullable|string|max:500',
        ]);

        $wasCancelled = $booking->status !== 'cancelled' && $request->status === 'cancelled';

        $booking->update($request->only('status', 'admin_notes'));

        if ($wasCancelled) {
            $this->notifications->notifyBookingCancelled($booking);
        }

        return back()->with('success', 'Réservation mise à jour.');
    }
}
