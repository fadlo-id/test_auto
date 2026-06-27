<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class ContactController extends Controller
{
    public function submit(Request $request): RedirectResponse
    {
        $request->validate([
            'name'    => 'required|string|max:100',
            'email'   => 'required|email|max:150',
            'subject' => 'required|string|max:100',
            'message' => 'required|string|max:2000',
        ]);

        // Store in contact_requests table if it exists, otherwise just log
        try {
            \DB::table('contact_requests')->insert([
                'name'       => $request->name,
                'email'      => $request->email,
                'subject'    => $request->subject,
                'message'    => $request->message,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        } catch (\Exception $e) {
            \Log::info('Contact form submission (table missing)', $request->only('name', 'email', 'subject'));
        }

        return back()->with('success', 'Votre message a été envoyé avec succès. Nous vous répondrons sous 24h ouvrées.');
    }
}
