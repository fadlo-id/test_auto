<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\ContactRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\RateLimiter;

class ContactController extends Controller
{
    public function submit(Request $request): RedirectResponse
    {
        // 5 submissions per hour per IP
        $key = 'contact:' . $request->ip();
        if (! RateLimiter::attempt($key, 5, fn () => null, 3600)) {
            return back()->withErrors(['message' => 'Trop de messages envoyés. Veuillez patienter avant de réessayer.']);
        }

        $validated = $request->validate([
            'name'    => 'required|string|min:2|max:100',
            'email'   => 'required|email|max:150',
            'subject' => 'required|string|min:3|max:100',
            'message' => 'required|string|min:10|max:2000',
        ]);

        ContactRequest::create($validated);

        // Send notification email to admin (queued, non-blocking)
        $adminEmail = config('mail.admin_address', config('mail.from.address'));
        if ($adminEmail) {
            try {
                Mail::raw(
                    "Nouveau message de contact\n\nDe : {$validated['name']} <{$validated['email']}>\nSujet : {$validated['subject']}\n\n{$validated['message']}",
                    fn ($msg) => $msg
                        ->to($adminEmail)
                        ->subject("[AutoEcoles.ma] Contact : {$validated['subject']}")
                        ->replyTo($validated['email'], $validated['name'])
                );
            } catch (\Exception $e) {
                Log::warning('Contact email failed to send', ['error' => $e->getMessage()]);
            }
        }

        return back()->with('success', 'Votre message a été envoyé avec succès. Nous vous répondrons sous 24h ouvrées.');
    }
}
