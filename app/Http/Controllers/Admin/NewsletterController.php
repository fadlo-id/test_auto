<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Jobs\SendNewsletterJob;
use App\Models\NewsletterSubscriber;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class NewsletterController extends Controller
{
    public function index(Request $request): Response
    {
        $subscribers = NewsletterSubscriber::query()
            ->when($request->status && $request->status !== 'all', fn ($q) => $q->where('status', $request->status))
            ->when($request->search, fn ($q, $s) => $q->where('email', 'like', "%{$s}%")->orWhere('name', 'like', "%{$s}%"))
            ->latest()
            ->paginate(20)
            ->withQueryString();

        $stats = [
            'total'        => NewsletterSubscriber::count(),
            'active'       => NewsletterSubscriber::where('status', 'active')->count(),
            'unsubscribed' => NewsletterSubscriber::where('status', 'unsubscribed')->count(),
        ];

        return Inertia::render('Admin/Newsletter', [
            'subscribers' => $subscribers,
            'filters'     => $request->only(['search', 'status']),
            'stats'       => $stats,
        ]);
    }

    public function destroy(NewsletterSubscriber $newsletterSubscriber): RedirectResponse
    {
        $newsletterSubscriber->delete();
        return back()->with('success', 'Abonné supprimé.');
    }

    public function unsubscribe(NewsletterSubscriber $newsletterSubscriber): RedirectResponse
    {
        $newsletterSubscriber->update(['status' => 'unsubscribed', 'unsubscribed_at' => now()]);
        return back()->with('success', 'Abonné désabonné.');
    }

    /** Compose-and-send: dispatched to the queue, never sent inline from the request. */
    public function send(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'subject' => 'required|string|max:255',
            'body'    => 'required|string|max:20000',
        ]);

        $count = NewsletterSubscriber::where('status', 'active')->count();

        if ($count === 0) {
            return back()->with('error', 'Aucun abonné actif à qui envoyer.');
        }

        SendNewsletterJob::dispatch($validated['subject'], $validated['body']);

        return back()->with('success', "Newsletter en cours d'envoi à {$count} abonné(s).");
    }

    /** Public, unauthenticated one-click unsubscribe link included in every newsletter email. */
    public function publicUnsubscribe(string $token): \Illuminate\View\View|RedirectResponse
    {
        $subscriber = NewsletterSubscriber::where('token', $token)->first();

        if (! $subscriber) {
            abort(404);
        }

        $subscriber->update(['status' => 'unsubscribed', 'unsubscribed_at' => now()]);

        return redirect()->route('home')->with('success', 'Vous avez été désabonné de la newsletter.');
    }
}
