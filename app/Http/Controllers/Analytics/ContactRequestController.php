<?php

namespace App\Http\Controllers\Analytics;

use App\Http\Controllers\Controller;
use App\Models\AutoSchool;
use App\Services\TrackingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ContactRequestController extends Controller
{
    public function __construct(private TrackingService $tracking) {}

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'school_id' => 'required|integer|exists:auto_schools,id',
            'name'      => 'required|string|max:100',
            'email'     => 'required|email|max:150',
            'phone'     => 'required|string|max:30',
            'message'   => 'nullable|string|max:1000',
        ]);

        $school = AutoSchool::find($validated['school_id']);

        if (! $school || $school->status !== 'approved' || ! $school->is_active) {
            return response()->json(['ok' => false, 'message' => 'École non trouvée.'], 422);
        }

        try {
            $this->tracking->trackLead($school, $validated, $request, $request->user()?->id);
        } catch (\Throwable) {
            // Never let tracking break the page
        }

        return response()->json(['ok' => true, 'message' => 'Votre message a été envoyé.']);
    }
}
