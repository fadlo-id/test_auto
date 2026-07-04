<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Signalement;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SignalementsController extends Controller
{
    public function index(Request $request): Response
    {
        $signalements = Signalement::with(['reporter:id,name,email'])
            ->when($request->search, fn ($q, $s) =>
                $q->where('reason', 'like', "%$s%")->orWhere('description', 'like', "%$s%")
            )
            ->when($request->status, fn ($q, $s) => $q->where('status', $s))
            ->when($request->type, fn ($q, $t) => $q->where('subject_type', $t))
            ->latest()
            ->paginate(25)
            ->withQueryString()
            ->through(fn ($s) => [
                'id'           => $s->id,
                'subject_type' => $s->subject_type,
                'subject_id'   => $s->subject_id,
                'reason'       => $s->reason,
                'description'  => $s->description,
                'status'       => $s->status,
                'admin_notes'  => $s->admin_notes,
                'reporter'     => $s->reporter ? ['id' => $s->reporter->id, 'name' => $s->reporter->name, 'email' => $s->reporter->email] : null,
                'handled_at'   => $s->handled_at?->toDateString(),
                'created_at'   => $s->created_at->toISOString(),
            ]);

        return Inertia::render('Admin/Signalements', [
            'signalements' => $signalements,
            'filters'      => $request->only(['search', 'status', 'type']),
            'stats'        => [
                'total'     => Signalement::count(),
                'pending'   => Signalement::where('status', 'pending')->count(),
                'resolved'  => Signalement::where('status', 'resolved')->count(),
                'dismissed' => Signalement::where('status', 'dismissed')->count(),
            ],
        ]);
    }

    public function resolve(Request $request, Signalement $signalement): RedirectResponse
    {
        $data = $request->validate(['admin_notes' => 'nullable|string|max:500']);

        $signalement->update([
            'status'      => 'resolved',
            'admin_notes' => $data['admin_notes'] ?? null,
            'handled_by'  => auth()->id(),
            'handled_at'  => now(),
        ]);

        return back()->with('success', 'Signalement marqué comme résolu.');
    }

    public function dismiss(Request $request, Signalement $signalement): RedirectResponse
    {
        $data = $request->validate(['admin_notes' => 'nullable|string|max:500']);

        $signalement->update([
            'status'      => 'dismissed',
            'admin_notes' => $data['admin_notes'] ?? null,
            'handled_by'  => auth()->id(),
            'handled_at'  => now(),
        ]);

        return back()->with('success', 'Signalement classé sans suite.');
    }

    public function destroy(Signalement $signalement): RedirectResponse
    {
        $signalement->delete();

        return back()->with('success', 'Signalement supprimé.');
    }
}
