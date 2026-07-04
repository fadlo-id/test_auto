<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Mail\ContactReplyMail;
use App\Models\ContactRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Inertia\Response;

class ContactRequestsController extends Controller
{
    public function index(Request $request): Response
    {
        $requests = ContactRequest::query()
            ->when($request->status && $request->status !== 'all', fn ($q) => $q->where('status', $request->status))
            ->when($request->search, fn ($q, $s) => $q->where('name', 'like', "%{$s}%")->orWhere('email', 'like', "%{$s}%")->orWhere('subject', 'like', "%{$s}%"))
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Admin/ContactRequests', [
            'requests' => $requests,
            'filters'  => $request->only(['search', 'status']),
        ]);
    }

    public function markRead(ContactRequest $contactRequest): RedirectResponse
    {
        $contactRequest->update(['status' => 'read', 'replied_at' => $contactRequest->replied_at ?? null]);
        return back()->with('success', 'Marque comme lu.');
    }

    public function reply(Request $request, ContactRequest $contactRequest): RedirectResponse
    {
        $validated = $request->validate(['reply' => 'required|string|max:2000']);

        $contactRequest->update([
            'reply'      => $validated['reply'],
            'status'     => 'replied',
            'replied_at' => now(),
        ]);

        try {
            Mail::to($contactRequest->email)->queue(new ContactReplyMail($contactRequest));
        } catch (\Throwable $e) {
            Log::warning('Contact reply email failed to send', ['contact_request_id' => $contactRequest->id, 'error' => $e->getMessage()]);
        }

        return back()->with('success', 'Reponse enregistree et envoyee par email.');
    }

    public function destroy(ContactRequest $contactRequest): RedirectResponse
    {
        $contactRequest->delete();
        return back()->with('success', 'Demande supprimee.');
    }
}
