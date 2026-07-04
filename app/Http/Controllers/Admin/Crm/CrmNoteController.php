<?php

namespace App\Http\Controllers\Admin\Crm;

use App\Http\Controllers\Controller;
use App\Models\CrmNote;
use App\Models\CrmProspect;
use App\Services\CrmService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class CrmNoteController extends Controller
{
    public function __construct(private CrmService $crm) {}

    public function store(Request $request, CrmProspect $prospect): RedirectResponse
    {
        $data = $request->validate([
            'content'   => 'required|string|max:5000',
            'type'      => 'required|in:general,call,meeting,email,sms',
            'is_pinned' => 'boolean',
        ]);

        $prospect->notes()->create([
            ...$data,
            'created_by' => auth()->id(),
        ]);

        $prospect->update(['last_contact_at' => now()]);

        $typeLabel = match($data['type']) {
            'call'    => 'Appel',
            'meeting' => 'Réunion',
            'email'   => 'Email',
            'sms'     => 'SMS',
            default   => 'Note',
        };

        $this->crm->log($prospect, 'note_added', "{$typeLabel} ajouté(e)");

        return back()->with('success', 'Note ajoutée.');
    }

    public function update(Request $request, CrmProspect $prospect, CrmNote $note): RedirectResponse
    {
        abort_if($note->prospect_id !== $prospect->id, 404);

        $data = $request->validate([
            'content'   => 'required|string|max:5000',
            'is_pinned' => 'boolean',
        ]);

        $note->update($data);

        return back()->with('success', 'Note mise à jour.');
    }

    public function destroy(CrmProspect $prospect, CrmNote $note): RedirectResponse
    {
        abort_if($note->prospect_id !== $prospect->id, 404);
        $note->delete();
        return back()->with('success', 'Note supprimée.');
    }
}
