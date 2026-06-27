<?php

namespace Tests\Feature;

use App\Models\AutoSchool;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminTest extends TestCase
{
    use RefreshDatabase;

    private function admin(): User
    {
        return User::factory()->create(['role' => 'admin']);
    }

    private function createSchool(string $status = 'pending'): AutoSchool
    {
        $owner = User::factory()->create(['role' => 'school_owner']);
        return AutoSchool::factory()->create(['user_id' => $owner->id, 'status' => $status]);
    }

    public function test_admin_dashboard_is_accessible_by_admin(): void
    {
        $this->actingAs($this->admin())
            ->get(route('admin.dashboard'))
            ->assertStatus(200)
            ->assertInertia(fn ($page) => $page->component('Admin/Dashboard'));
    }

    public function test_non_admin_cannot_access_admin_dashboard(): void
    {
        $user = User::factory()->create(['role' => 'user']);

        $this->actingAs($user)
            ->get(route('admin.dashboard'))
            ->assertStatus(403);
    }

    public function test_admin_can_approve_school(): void
    {
        $admin  = $this->admin();
        $school = $this->createSchool('pending');

        $this->actingAs($admin)
            ->post(route('admin.auto-schools.approve', $school))
            ->assertRedirect();

        $this->assertDatabaseHas('auto_schools', ['id' => $school->id, 'status' => 'approved']);
    }

    public function test_admin_can_reject_school(): void
    {
        $admin  = $this->admin();
        $school = $this->createSchool('pending');

        $this->actingAs($admin)
            ->post(route('admin.auto-schools.reject', $school), [
                'reason' => 'Dossier incomplet.',
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('auto_schools', ['id' => $school->id, 'status' => 'rejected']);
    }

    public function test_admin_can_ban_user(): void
    {
        $admin  = $this->admin();
        $target = User::factory()->create(['role' => 'user', 'is_active' => true]);

        $this->actingAs($admin)
            ->post(route('admin.users.ban', $target))
            ->assertRedirect();

        $this->assertDatabaseHas('users', ['id' => $target->id, 'is_active' => false]);
    }

    public function test_admin_users_index_renders(): void
    {
        User::factory()->count(3)->create(['role' => 'user']);

        $this->actingAs($this->admin())
            ->get(route('admin.users.index'))
            ->assertStatus(200)
            ->assertInertia(fn ($page) => $page->component('Admin/Users')->has('users'));
    }

    public function test_admin_schools_index_renders(): void
    {
        $this->createSchool();

        $this->actingAs($this->admin())
            ->get(route('admin.auto-schools.index'))
            ->assertStatus(200)
            ->assertInertia(fn ($page) => $page->component('Admin/AutoSchools')->has('schools'));
    }
}
