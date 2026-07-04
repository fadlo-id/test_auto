<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AutoSchool;
use App\Services\NotificationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Response as HttpResponse;
use Illuminate\Support\Facades\Cache;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SchoolsController extends Controller
{
    public function __construct(private NotificationService $notifications) {}

    public function index(Request $request): Response
    {
        $schools = AutoSchool::with('user:id,name,email')
            ->when($request->search, fn ($q, $s) => $q->where('name', 'like', "%{$s}%")->orWhere('city', 'like', "%{$s}%"))
            ->when($request->status && $request->status !== 'all', fn ($q) => $q->where('status', $request->status))
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
            'is_active'        => true,
            'verified_at'      => now(),
            'rejection_reason' => null,
        ]);

        $this->notifications->notifySchoolApproved($school);
        $this->clearPublicCaches();

        return back()->with('success', "Auto-ecole \"{$school->name}\" approuvee.");
    }

    public function reject(Request $request, AutoSchool $school): RedirectResponse
    {
        $request->validate(['reason' => 'required|string|max:500']);

        $school->update([
            'status'           => 'rejected',
            'is_active'        => false,
            'rejection_reason' => $request->reason,
            'verified_at'      => null,
        ]);

        $this->notifications->notifySchoolRejected($school, $request->reason);
        $this->clearPublicCaches();

        return back()->with('success', "Auto-ecole \"{$school->name}\" refusee.");
    }

    public function deactivate(AutoSchool $school): RedirectResponse
    {
        $school->update(['is_active' => false]);
        $this->clearPublicCaches();
        return back()->with('success', "Auto-ecole \"{$school->name}\" desactivee.");
    }

    public function activate(AutoSchool $school): RedirectResponse
    {
        abort_if($school->status !== 'approved', 422, 'L\'auto-ecole doit etre approuvee avant activation.');
        $school->update(['is_active' => true]);
        $this->clearPublicCaches();
        return back()->with('success', "Auto-ecole \"{$school->name}\" activee.");
    }

    private function clearPublicCaches(): void
    {
        Cache::forget('home_page_data');
        Cache::forget('search_cities');
        Cache::forget('search_categories');
        Cache::forget('sitemap_data');
    }

    public function destroy(AutoSchool $school): RedirectResponse
    {
        $school->delete();
        $this->clearPublicCaches();

        return back()->with('success', 'Auto-ecole supprimee.');
    }

    public function export(Request $request): HttpResponse
    {
        $schools = AutoSchool::with('user:id,name,email')
            ->when($request->search, fn ($q, $s) => $q->where('name', 'like', "%{$s}%")->orWhere('city', 'like', "%{$s}%"))
            ->when($request->status && $request->status !== 'all', fn ($q) => $q->where('status', $request->status))
            ->latest()
            ->get(['id', 'name', 'city', 'status', 'is_active', 'user_id', 'created_at']);

        $header = implode(',', ['ID', 'Nom', 'Ville', 'Statut', 'Actif', 'Propriétaire', 'Date inscription']);
        $rows   = $schools->map(fn ($s) => implode(',', [
            $s->id,
            '"' . str_replace('"', '""', $s->name) . '"',
            '"' . ($s->city ?? '') . '"',
            $s->status,
            $s->is_active ? 'Oui' : 'Non',
            '"' . str_replace('"', '""', $s->user?->name ?? '') . '"',
            $s->created_at?->format('d/m/Y'),
        ]));

        $csv = $header . "\n" . $rows->implode("\n");

        return response($csv, 200, [
            'Content-Type'        => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="auto_ecoles_' . now()->format('Ymd') . '.csv"',
        ]);
    }
}
