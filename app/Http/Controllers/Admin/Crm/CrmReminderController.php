<?php

namespace App\Http\Controllers\Admin\Crm;

use App\Http\Controllers\Controller;
use App\Models\CrmProspect;
use App\Models\CrmReminder;
use App\Services\CrmService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class CrmReminderController extends Controller
{
    public function __construct(private CrmService $crm) {}

    public function store(Request $request, CrmProspect $prospect): RedirectResponse
    {
        $data = $request->validate([
            'title'       => 'required|string|max:200',
            'note'        => 'nullable|string|max:1000',
            'due_at'      => 'required|date|after:now',
            'assigned_to' => 'required|exists:users,id',
        ]);

        $reminder = $prospect->reminders()->create([
            ...$data,
            'created_by' => auth()->id(),
            'status'     => 'pending',
        ]);

        $this->crm->log($prospect, 'reminder_set', "Relance planifiée : {$data['title']}", [
            'reminder_id' => $reminder->id,
            'due_at'      => $data['due_at'],
        ]);

        return back()->with('success', 'Relance planifiée.');
    }

    public function done(CrmProspect $prospect, CrmReminder $reminder): RedirectResponse
    {
        abort_if($reminder->prospect_id !== $prospect->id, 404);
        $this->crm->markReminderDone($reminder);
        return back()->with('success', 'Relance marquée comme accomplie.');
    }

    public function destroy(CrmProspect $prospect, CrmReminder $reminder): RedirectResponse
    {
        abort_if($reminder->prospect_id !== $prospect->id, 404);
        $reminder->update(['status' => 'cancelled']);
        return back()->with('success', 'Relance annulée.');
    }
}
