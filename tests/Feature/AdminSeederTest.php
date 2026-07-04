<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\AdminSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminSeederTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Regression test: email_verified_at is not mass-assignable on User, so passing it
     * straight into create()/updateOrCreate() silently drops it. The seeder must instead
     * call markEmailAsVerified() explicitly, or every seeded account — including the
     * Super Admin — ends up unverified on a fresh install.
     */
    public function test_seeded_accounts_are_all_pre_verified(): void
    {
        $this->seed(AdminSeeder::class);

        $emails = [
            'admin@autoecoles.ma',
            'manager@autoecoles.ma',
            'ecole@autoecoles.ma',
            'user@autoecoles.ma',
        ];

        foreach ($emails as $email) {
            $user = User::where('email', $email)->firstOrFail();
            $this->assertTrue($user->hasVerifiedEmail(), "{$email} should be pre-verified after seeding.");
        }
    }
}
