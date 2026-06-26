<?php

namespace Tests\Feature\Auth;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RegistrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_registration_screen_can_be_rendered(): void
    {
        $response = $this->get('/register');
        $response->assertStatus(200);
    }

    public function test_new_users_can_register(): void
    {
        $response = $this->post('/register', [
            'name'                  => 'Test User',
            'email'                 => 'test@example.com',
            'phone'                 => '+212612345678',
            'role'                  => 'user',
            'password'              => 'password',
            'password_confirmation' => 'password',
        ]);

        $this->assertAuthenticated();
        $response->assertRedirect(route('dashboard', absolute: false));
    }

    public function test_school_owner_can_register(): void
    {
        $response = $this->post('/register', [
            'name'                  => 'School Owner',
            'email'                 => 'owner@example.com',
            'phone'                 => '+212699999999',
            'role'                  => 'school_owner',
            'password'              => 'password',
            'password_confirmation' => 'password',
        ]);

        $this->assertAuthenticated();
        $response->assertRedirect(route('school.dashboard', absolute: false));
    }

    public function test_invalid_role_is_rejected(): void
    {
        $response = $this->post('/register', [
            'name'                  => 'Hacker',
            'email'                 => 'hack@example.com',
            'role'                  => 'admin',
            'password'              => 'password',
            'password_confirmation' => 'password',
        ]);

        $this->assertGuest();
        $response->assertSessionHasErrors('role');
    }
}
