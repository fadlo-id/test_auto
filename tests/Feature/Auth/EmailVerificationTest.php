<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Auth\Events\Verified;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\URL;
use Tests\TestCase;

class EmailVerificationTest extends TestCase
{
    use RefreshDatabase;

    public function test_email_verification_screen_can_be_rendered(): void
    {
        $user = User::factory()->create([
            'email_verified_at' => null,
        ]);

        $response = $this->actingAs($user)->get('/verify-email');

        $response->assertStatus(200);
    }

    public function test_email_can_be_verified(): void
    {
        $user = User::factory()->create([
            'email_verified_at' => null,
        ]);

        Event::fake();

        $verificationUrl = URL::temporarySignedRoute(
            'verification.verify',
            now()->addMinutes(60),
            ['id' => $user->id, 'hash' => sha1($user->email)]
        );

        $response = $this->actingAs($user)->get($verificationUrl);

        Event::assertDispatched(Verified::class);
        $this->assertTrue($user->fresh()->hasVerifiedEmail());
        $response->assertRedirect(route('dashboard', absolute: false).'?verified=1');
    }

    public function test_email_is_not_verified_with_invalid_hash(): void
    {
        $user = User::factory()->create([
            'email_verified_at' => null,
        ]);

        $verificationUrl = URL::temporarySignedRoute(
            'verification.verify',
            now()->addMinutes(60),
            ['id' => $user->id, 'hash' => sha1('wrong-email')]
        );

        $this->actingAs($user)->get($verificationUrl);

        $this->assertFalse($user->fresh()->hasVerifiedEmail());
    }

    public function test_unverified_user_can_browse_user_portal(): void
    {
        $user = User::factory()->unverified()->create(['role' => 'user']);

        $this->actingAs($user)->get(route('user.dashboard'))->assertOk();
        $this->actingAs($user)->get(route('user.reviews'))->assertOk();
    }

    public function test_unverified_school_owner_is_blocked_from_school_dashboard(): void
    {
        $owner = User::factory()->unverified()->create(['role' => 'school_owner']);

        $this->actingAs($owner)
            ->get(route('school.dashboard'))
            ->assertRedirect(route('verification.notice'));
    }

    public function test_super_admin_is_always_auto_verified_regardless_of_input(): void
    {
        $superAdmin = User::factory()->unverified()->create(['role' => 'super_admin']);

        $this->assertTrue($superAdmin->fresh()->hasVerifiedEmail());
    }

    public function test_super_admin_can_access_admin_dashboard_even_if_created_unverified(): void
    {
        $superAdmin = User::factory()->unverified()->create(['role' => 'super_admin']);

        // The booted() hook already re-verifies on save, but this proves the route itself
        // never depends on that — no `verified` middleware sits on the admin group at all.
        $this->actingAs($superAdmin)
            ->get(route('admin.dashboard'))
            ->assertOk();
    }

    public function test_verification_banner_prop_is_hidden_for_super_admin_on_profile_page(): void
    {
        $superAdmin = User::factory()->create(['role' => 'super_admin']);

        $this->actingAs($superAdmin)
            ->get(route('profile.edit'))
            ->assertInertia(fn ($p) => $p->where('auth.user.role', 'super_admin')
                ->where('auth.user.email_verified', true));
    }
}
