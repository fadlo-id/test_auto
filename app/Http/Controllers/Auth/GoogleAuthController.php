<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Mail\GoogleAccountLinkedMail;
use App\Mail\WelcomeMail;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;

class GoogleAuthController extends Controller
{
    /**
     * Redirect to Google. The role is only used if this turns into a brand-new
     * account — Google doesn't know about our roles, so it has to travel with us.
     */
    public function redirect(Request $request): RedirectResponse
    {
        $role = $request->query('role');
        $role = in_array($role, ['user', 'school_owner'], true) ? $role : 'user';

        session(['oauth_role' => $role]);

        return Socialite::driver('google')->redirect();
    }

    public function callback(Request $request): RedirectResponse
    {
        try {
            $googleUser = Socialite::driver('google')->user();
        } catch (\Throwable $e) {
            Log::warning('Google OAuth callback failed', ['error' => $e->getMessage()]);

            return redirect()->route('login')->with('error', 'La connexion avec Google a échoué. Veuillez réessayer.');
        }

        $user = User::where('google_id', $googleUser->getId())->first();

        if (! $user) {
            $user = User::where('email', $googleUser->getEmail())->first();

            if ($user) {
                // Existing password-based account with the same (Google-verified) email — link it.
                $user->forceFill(['google_id' => $googleUser->getId()])->save();

                try {
                    Mail::to($user->email)->queue(new GoogleAccountLinkedMail($user));
                } catch (\Throwable $e) {
                    Log::warning('Google-account-linked notification failed to send', ['user_id' => $user->id, 'error' => $e->getMessage()]);
                }
            } else {
                $role = session('oauth_role');
                $role = in_array($role, ['user', 'school_owner'], true) ? $role : 'user';

                $user = User::create([
                    'name'      => $googleUser->getName() ?: $googleUser->getNickname() ?: 'Utilisateur Google',
                    'email'     => $googleUser->getEmail(),
                    'google_id' => $googleUser->getId(),
                    'avatar'    => $googleUser->getAvatar(),
                    'password'  => Hash::make(Str::random(40)),
                    'role'      => $role,
                    'is_active' => true,
                ]);

                // Google already proved ownership of this email — skip the verification step entirely.
                $user->markEmailAsVerified();

                event(new Registered($user));

                try {
                    Mail::to($user->email)->queue(new WelcomeMail($user));
                } catch (\Throwable $e) {
                    Log::warning('Welcome email failed to send', ['user_id' => $user->id, 'error' => $e->getMessage()]);
                }
            }
        }

        session()->forget('oauth_role');

        Auth::login($user);
        $request->session()->regenerate();

        // See AuthenticatedSessionController::store() — never let a stale intended URL
        // from a different portal override the role-based landing page.
        $request->session()->forget('url.intended');

        return redirect()->route($user->redirectRouteName());
    }
}
