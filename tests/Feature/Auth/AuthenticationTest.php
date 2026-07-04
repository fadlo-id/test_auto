<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class AuthenticationTest extends TestCase
{
    use RefreshDatabase;

    public function test_login_screen_can_be_rendered(): void
    {
        $response = $this->get('/login');

        $response->assertStatus(200);
    }

    public function test_users_can_authenticate_using_the_login_screen(): void
    {
        $user = User::factory()->create();

        $response = $this->post('/login', [
            'email' => $user->email,
            'password' => 'password',
        ]);

        $this->assertAuthenticated();
        $response->assertRedirect(route('user.dashboard', absolute: false));
    }

    public function test_users_can_not_authenticate_with_invalid_password(): void
    {
        $user = User::factory()->create();

        $this->post('/login', [
            'email' => $user->email,
            'password' => 'wrong-password',
        ]);

        $this->assertGuest();
    }

    public function test_users_can_logout(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post('/logout');

        $this->assertGuest();
        $response->assertRedirect('/');
    }

    /**
     * Regression test: a stale `url.intended` session value (stashed by Laravel's default
     * unauthenticated-redirect handler on an earlier, unrelated protected-page visit) must
     * never override the role-based post-login destination.
     */
    #[DataProvider('roleDashboardProvider')]
    public function test_login_always_redirects_to_own_dashboard_even_with_a_stale_intended_url(string $role, string $dashboardRoute): void
    {
        $user = User::factory()->create(['role' => $role, 'password' => bcrypt('Secret123!')]);

        // Simulate a prior unauthenticated visit to a *different* portal's protected page —
        // this stashes session('url.intended') via Laravel's default AuthenticationException handling.
        $this->get('/user/dashboard');

        $response = $this->post('/login', [
            'email'    => $user->email,
            'password' => 'Secret123!',
        ]);

        $this->assertAuthenticated();
        $response->assertRedirect(route($dashboardRoute, absolute: false));
    }

    public static function roleDashboardProvider(): array
    {
        return [
            'super_admin'  => ['super_admin', 'admin.dashboard'],
            'admin'        => ['admin', 'admin.dashboard'],
            'school_owner' => ['school_owner', 'school.dashboard'],
            'user'         => ['user', 'user.dashboard'],
        ];
    }
}
