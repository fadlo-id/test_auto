<?php

namespace App\Http\Controllers\School;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('SchoolDashboard/Profile', [
            'user' => auth()->user()->only('id', 'name', 'email', 'phone', 'created_at'),
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $user = auth()->user();

        $validated = $request->validate([
            'name'                  => 'required|string|max:255',
            'email'                 => "required|email|unique:users,email,{$user->id}",
            'phone'                 => 'nullable|string|max:20',
            'current_password'      => 'nullable|string',
            'password'              => ['nullable', 'confirmed', Rules\Password::defaults()],
        ]);

        if ($request->filled('current_password')) {
            if (! Hash::check($request->current_password, $user->password)) {
                return back()->withErrors(['current_password' => 'Mot de passe actuel incorrect.']);
            }
        }

        $user->update([
            'name'     => $validated['name'],
            'email'    => $validated['email'],
            'phone'    => $validated['phone'] ?? $user->phone,
        ]);

        if ($request->filled('password') && $request->filled('current_password')) {
            $user->update(['password' => Hash::make($validated['password'])]);
        }

        return back()->with('success', 'Profil mis à jour.');
    }
}
