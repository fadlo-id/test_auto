<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AutoSchool;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SchoolsController extends Controller
{
    public function index(Request $request): Response
    {
        $schools = AutoSchool::with('user:id,name,email')
            ->when($request->search, fn($q, $s) => $q->where('name', 'like', "%$s%")->orWhere('city', 'like', "%$s%"))
            ->when($request->status && $request->status !== 'all', fn($q) => $q->where('status', $request->status))
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Admin/AutoSchools', [
            'schools' => $schools,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    public function approve(AutoSchool $school): RedirectResponse
    {
        $school->update([
            'status'           => 'approved',
            'verified_at'      => now(),
            'rejection_reason' => null,
        ]);

        return back()->with('success', "Auto-école \"{$school->name}\" approuvée.");
    }

    public function reject(Request $request, AutoSchool $school): RedirectResponse
    {
        $request->validate(['reason' => 'required|string|max:500']);

        $school->update([
            'status'           => 'rejected',
            'rejection_reason' => $request->reason,
            'verified_at'      => null,
        ]);

        return back()->with('success', "Auto-école \"{$school->name}\" refusée.");
    }

    public function destroy(AutoSchool $school): RedirectResponse
    {
        $school->delete();

        return back()->with('success', 'Auto-école supprimée.');
    }
}
