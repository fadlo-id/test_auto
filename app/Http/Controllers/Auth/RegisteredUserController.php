<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Mail\WelcomeMail;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    public function create(Request $request): Response
    {
        $role = $request->query('role');

        if (! in_array($role, ['user', 'school_owner'], true)) {
            return Inertia::render('Auth/ChooseRole');
        }

        return Inertia::render('Auth/Register', ['role' => $role]);
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|string|lowercase|email|max:255|unique:' . User::class,
            'phone'    => 'nullable|string|max:20',
            'role'     => ['required', Rule::in(['user', 'school_owner'])],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $user = User::create([
            'name'      => $request->name,
            'email'     => $request->email,
            'password'  => Hash::make($request->password),
            'phone'     => $request->phone,
            'role'      => $request->role,
            'is_active' => true,
        ]);

        event(new Registered($user));

        try {
            Mail::to($user->email)->queue(new WelcomeMail($user));
        } catch (\Throwable $e) {
            Log::warning('Welcome email failed to send', ['user_id' => $user->id, 'error' => $e->getMessage()]);
        }

        Auth::login($user);

        // See AuthenticatedSessionController::store() — never let a stale intended URL
        // from a different portal override the role-based landing page.
        $request->session()->forget('url.intended');

        return redirect()->route($user->redirectRouteName());
    }
}
