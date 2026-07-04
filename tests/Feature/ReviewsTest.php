<?php

namespace Tests\Feature;

use App\Models\AutoSchool;
use App\Models\Review;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReviewsTest extends TestCase
{
    use RefreshDatabase;

    private function createActiveSchool(): AutoSchool
    {
        $owner = User::factory()->create(['role' => 'school_owner']);
        return AutoSchool::factory()->create([
            'user_id'   => $owner->id,
            'status'    => 'approved',
            'is_active' => true,
            'slug'      => 'test-school-review',
        ]);
    }

    public function test_authenticated_user_can_submit_review(): void
    {
        $school = $this->createActiveSchool();
        $user   = User::factory()->create(['role' => 'user']);

        $this->actingAs($user)
            ->post(route('school.detail.review', $school->slug), [
                'rating'  => 4,
                'title'   => 'Bonne ecole',
                'content' => 'Formation de qualite, je recommande.',
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('reviews', [
            'auto_school_id' => $school->id,
            'user_id'        => $user->id,
            'rating'         => 4,
            'status'         => 'pending',
        ]);
    }

    public function test_guest_cannot_submit_review(): void
    {
        $school = $this->createActiveSchool();

        $this->post(route('school.detail.review', $school->slug), [
            'rating'  => 5,
            'content' => 'Super ecole',
        ])->assertRedirect(route('login'));
    }

    public function test_unverified_user_cannot_submit_review(): void
    {
        $school = $this->createActiveSchool();
        $user   = User::factory()->unverified()->create(['role' => 'user']);

        $this->actingAs($user)
            ->post(route('school.detail.review', $school->slug), [
                'rating'  => 4,
                'content' => 'Formation de qualite, je recommande.',
            ])
            ->assertRedirect(route('verification.notice'));

        $this->assertDatabaseMissing('reviews', [
            'auto_school_id' => $school->id,
            'user_id'        => $user->id,
        ]);
    }

    public function test_user_cannot_review_same_school_twice(): void
    {
        $school = $this->createActiveSchool();
        $user   = User::factory()->create(['role' => 'user']);

        Review::factory()->create([
            'auto_school_id' => $school->id,
            'user_id'        => $user->id,
            'status'         => 'approved',
        ]);

        $this->actingAs($user)
            ->post(route('school.detail.review', $school->slug), [
                'rating'  => 3,
                'content' => 'Ceci est mon deuxième avis sur cette auto-école.',
            ])
            ->assertRedirect()
            ->assertSessionHas('error');
    }

    public function test_owner_cannot_review_own_school(): void
    {
        $school = $this->createActiveSchool();
        $owner  = $school->user;

        $this->actingAs($owner)
            ->post(route('school.detail.review', $school->slug), [
                'rating'  => 5,
                'content' => 'Je laisse un avis sur ma propre auto-école.',
            ])
            ->assertRedirect()
            ->assertSessionHas('error');
    }

    public function test_admin_can_approve_review(): void
    {
        $admin  = User::factory()->create(['role' => 'super_admin']);
        $school = $this->createActiveSchool();
        $review = Review::factory()->create([
            'auto_school_id' => $school->id,
            'status'         => 'pending',
        ]);

        $this->actingAs($admin)
            ->post(route('admin.reviews.approve', $review))
            ->assertRedirect();

        $this->assertDatabaseHas('reviews', ['id' => $review->id, 'status' => 'approved']);
    }

    public function test_school_owner_can_reply_to_review(): void
    {
        $school = $this->createActiveSchool();
        $owner  = $school->user;
        $review = Review::factory()->create([
            'auto_school_id' => $school->id,
            'status'         => 'approved',
        ]);

        $this->actingAs($owner)
            ->post(route('school.reviews.reply', $review), [
                'owner_reply' => 'Merci pour votre avis !',
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('reviews', [
            'id'          => $review->id,
            'owner_reply' => 'Merci pour votre avis !',
        ]);
    }

    public function test_school_owner_can_delete_own_reply(): void
    {
        $school = $this->createActiveSchool();
        $owner  = $school->user;
        $review = Review::factory()->create([
            'auto_school_id' => $school->id,
            'status'         => 'approved',
            'owner_reply'    => 'Merci !',
        ]);

        $this->actingAs($owner)
            ->delete(route('school.reviews.reply.delete', $review))
            ->assertRedirect();

        $this->assertDatabaseHas('reviews', ['id' => $review->id, 'owner_reply' => null]);
    }
}
