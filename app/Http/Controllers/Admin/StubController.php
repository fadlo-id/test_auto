<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AutoSchool;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class StubController extends Controller
{
    // ── Abonnements ───────────────────────────────────────────────

    public function invoices(Request $request): Response
    {
        $payments = Payment::with(['autoSchool:id,name', 'plan:id,name'])
            ->where('status', 'success')
            ->when($request->search, fn ($q, $s) =>
                $q->whereHas('autoSchool', fn ($sq) => $sq->where('name', 'like', "%$s%"))
            )
            ->latest()
            ->paginate(25)
            ->withQueryString();

        return Inertia::render('Admin/Invoices', [
            'payments' => $payments,
            'filters'  => $request->only(['search']),
            'total'    => Payment::where('status', 'success')->sum('amount'),
        ]);
    }

    // ── Contenu ───────────────────────────────────────────────────

    public function cities(Request $request): Response
    {
        $driver = DB::getDriverName();
        $cities = AutoSchool::where('status', 'approved')
            ->whereNotNull('city')
            ->selectRaw('city, COUNT(*) as schools_count')
            ->groupBy('city')
            ->orderByDesc('schools_count')
            ->when($request->search, fn ($q, $s) => $q->where('city', 'like', "%$s%"))
            ->paginate(30)
            ->withQueryString();

        return Inertia::render('Admin/Cities', [
            'cities'  => $cities,
            'filters' => $request->only(['search']),
            'total'   => AutoSchool::where('status', 'approved')->whereNotNull('city')->distinct('city')->count('city'),
        ]);
    }

    public function profile(Request $request): Response
    {
        return Inertia::render('Admin/AdminProfile', [
            'user' => $request->user()->only(['id', 'name', 'email', 'phone', 'role', 'avatar', 'notes', 'last_login_at', 'created_at']),
        ]);
    }

    public function updateProfile(Request $request): \Illuminate\Http\RedirectResponse
    {
        $data = $request->validate([
            'name'  => 'required|string|max:100',
            'phone' => 'nullable|string|max:20',
        ]);

        $request->user()->update($data);

        return back()->with('success', 'Profil mis à jour avec succès.');
    }
}
