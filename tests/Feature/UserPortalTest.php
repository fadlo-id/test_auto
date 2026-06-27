<?php

namespace Tests\Feature;

use App\Models\AutoSchool;
use App\Models\Favorite;
use App\Models\Review;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserPortalTest extends TestCase
{
    use RefreshDatabase;

    private function user(): User
    {
        return User::factory()->create(['role' => 'user']);
    }

    private function schoolOwner(): User
    {
        return User::factory()->create(['role' => 'school_owner']);
    }

    private function approvedSchool(?User $owner = null): AutoSchool
    {
        $owner ??= $this->schoolOwner();
        return AutoSchool::factory()->create([
            'user_id'  => $owner->id,
            'status'   => 'approved',
            'is_active' => true,
        ]);
    }

    // Dashboard
    public function test_user_dashboard_accessible(): void
    {
        $this->actingAs($this->user())
            ->get(route('user.dashboard'))
            ->assertOk()
            ->assertInertia(fn ($p) => $p->component('UserDashboard/Overview'));
    }

    public function test_guest_cannot_access_user_dashboard(): void
    {
        $this->get(route('user.dashboard'))->assertRedirect(route('login'));
    }

    public function test_school_owner_can_access_user_dashboard(): void
    {
        $this->actingAs($this->schoolOwner())
            ->get(route('user.dashboard'))
            ->assertOk();
    }

    // Reviews
    public function test_user_reviews_page_renders(): void
    {
        $user   = $this->user();
        $school = $this->approvedSchool();
        Review::factory()->create(['user_id' => $user->id, 'auto_school_id' => $school->id, 'status' => 'approved']);

        $this->actingAs($user)
            ->get(route('user.reviews'))
            ->assertOk()
            ->assertInertia(fn ($p) => $p->component('UserDashboard/Reviews')->has('reviews'));
    }

    public function test_user_reviews_filter_by_status(): void
    {
        $user   = $this->user();
        $school = $this->approvedSchool();
        Review::factory()->create(['user_id' => $user->id, 'auto_school_id' => $school->id, 'status' => 'pending']);
        Review::factory()->create(['user_id' => $user->id, 'auto_school_id' => $school->id, 'status' => 'approved']);

        $resp = $this->actingAs($user)
            ->get(route('user.reviews', ['status' => 'pending']))
            ->assertOk();

        $resp->assertInertia(fn ($p) => $p
            ->component('UserDashboard/Reviews')
            ->where('reviews.total', 1)
        );
    }

    // Favorites
    public function test_user_favorites_page_renders(): void
    {
        $user   = $this->user();
        $school = $this->approvedSchool();
        Favorite::create(['user_id' => $user->id, 'auto_school_id' => $school->id]);

        $this->actingAs($user)
            ->get(route('user.favorites'))
            ->assertOk()
            ->assertInertia(fn ($p) => $p->component('UserDashboard/Favorites'));
    }

    public function test_user_can_add_favorite(): void
    {
        $user   = $this->user();
        $school = $this->approvedSchool();

        $this->actingAs($user)
            ->withHeaders(['X-Inertia' => 'true'])
            ->post(route('user.favorites.toggle', $school->id))
            ->assertRedirect();

        $this->assertDatabaseHas('user_favorites', [
            'user_id'        => $user->id,
            'auto_school_id' => $school->id,
        ]);
    }

    public function test_user_can_remove_favorite(): void
    {
        $user   = $this->user();
        $school = $this->approvedSchool();
        Favorite::create(['user_id' => $user->id, 'auto_school_id' => $school->id]);

        $this->actingAs($user)
            ->withHeaders(['X-Inertia' => 'true'])
            ->post(route('user.favorites.toggle', $school->id))
            ->assertRedirect();

        $this->assertDatabaseMissing('user_favorites', [
            'user_id'        => $user->id,
            'auto_school_id' => $school->id,
        ]);
    }

    public function test_guest_cannot_toggle_favorite(): void
    {
        $school = $this->approvedSchool();

        $this->post(route('user.favorites.toggle', $school->id))
            ->assertRedirect(route('login'));
    }

    // Profile page
    public function test_user_profile_page_renders(): void
    {
        $this->actingAs($this->user())
            ->get(route('user.profile'))
            ->assertOk()
            ->assertInertia(fn ($p) => $p->component('UserDashboard/Profile'));
    }
}
