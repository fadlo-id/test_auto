<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\User as SocialiteUser;
use Tests\TestCase;

class GoogleAuthTest extends TestCase
{
    use RefreshDatabase;

    private function fakeGoogleUser(string $id, string $email, string $name = 'Jane Doe'): SocialiteUser
    {
        $socialiteUser = new SocialiteUser();
        $socialiteUser->map([
            'id'     => $id,
            'name'   => $name,
            'email'  => $email,
            'avatar' => 'https://example.com/avatar.jpg',
        ]);

        return $socialiteUser;
    }

    public function test_redirect_stores_the_chosen_role_in_session(): void
    {
        $this->get('/auth/google/redirect?role=school_owner')->assertRedirect();

        $this->assertSame('school_owner', session('oauth_role'));
    }

    public function test_redirect_defaults_to_user_role_for_invalid_input(): void
    {
        $this->get('/auth/google/redirect?role=admin')->assertRedirect();

        $this->assertSame('user', session('oauth_role'));
    }

    public function test_new_google_user_is_created_verified_with_chosen_role(): void
    {
        $this->withSession(['oauth_role' => 'school_owner']);

        Socialite::shouldReceive('driver->user')
            ->andReturn($this->fakeGoogleUser('google-123', 'newschool@example.com'));

        $response = $this->get('/auth/google/callback');

        $this->assertAuthenticated();
        $response->assertRedirect(route('school.dashboard', absolute: false));

        $user = User::where('email', 'newschool@example.com')->firstOrFail();
        $this->assertSame('google-123', $user->google_id);
        $this->assertSame('school_owner', $user->role);
        $this->assertTrue($user->hasVerifiedEmail());
    }

    public function test_existing_email_gets_linked_to_google_without_duplicating(): void
    {
        $existing = User::factory()->create(['email' => 'linked@example.com', 'role' => 'user']);

        Socialite::shouldReceive('driver->user')
            ->andReturn($this->fakeGoogleUser('google-456', 'linked@example.com'));

        $this->get('/auth/google/callback');

        $this->assertAuthenticatedAs($existing->fresh());
        $this->assertSame(1, User::where('email', 'linked@example.com')->count());
        $this->assertSame('google-456', $existing->fresh()->google_id);
    }

    public function test_returning_google_user_logs_in_directly(): void
    {
        $existing = User::factory()->create(['google_id' => 'google-789', 'email' => 'returning@example.com']);

        Socialite::shouldReceive('driver->user')
            ->andReturn($this->fakeGoogleUser('google-789', 'returning@example.com'));

        $this->get('/auth/google/callback');

        $this->assertAuthenticatedAs($existing);
        $this->assertSame(1, User::where('email', 'returning@example.com')->count());
    }

    /**
     * Same regression as AuthenticationTest::test_login_always_redirects_to_own_dashboard...
     * but through the Google OAuth callback: a stale `url.intended` must not hijack the
     * role-based landing page here either.
     */
    public function test_google_login_ignores_stale_intended_url_and_redirects_by_role(): void
    {
        $existing = User::factory()->create(['google_id' => 'google-999', 'email' => 'admin-via-google@example.com', 'role' => 'super_admin']);

        // Stash a stale intended URL from an earlier, unrelated unauthenticated visit.
        $this->get('/user/dashboard');

        Socialite::shouldReceive('driver->user')
            ->andReturn($this->fakeGoogleUser('google-999', 'admin-via-google@example.com'));

        $response = $this->get('/auth/google/callback');

        $this->assertAuthenticatedAs($existing);
        $response->assertRedirect(route('admin.dashboard', absolute: false));
    }
}
