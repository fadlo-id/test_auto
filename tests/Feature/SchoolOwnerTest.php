<?php

namespace Tests\Feature;

use App\Models\AutoSchool;
use App\Models\Service;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SchoolOwnerTest extends TestCase
{
    use RefreshDatabase;

    private function ownerWithSchool(): array
    {
        $owner  = User::factory()->create(['role' => 'school_owner']);
        $school = AutoSchool::factory()->create([
            'user_id'   => $owner->id,
            'status'    => 'approved',
            'is_active' => true,
        ]);
        return [$owner, $school];
    }

    public function test_school_dashboard_accessible_by_owner(): void
    {
        [$owner] = $this->ownerWithSchool();

        $this->actingAs($owner)
            ->get(route('school.dashboard'))
            ->assertStatus(200)
            ->assertInertia(fn ($page) => $page->component('SchoolDashboard/Overview'));
    }

    public function test_regular_user_cannot_access_school_dashboard(): void
    {
        $user = User::factory()->create(['role' => 'user']);

        $this->actingAs($user)
            ->get(route('school.dashboard'))
            ->assertStatus(403);
    }

    public function test_school_owner_can_create_service(): void
    {
        [$owner] = $this->ownerWithSchool();

        $this->actingAs($owner)
            ->post(route('school.services.store'), [
                'name'        => 'Permis B',
                'price'       => 2500,
                'description'    => 'Formation complete permis B',
                'duration' => 30,
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('services', ['name' => 'Permis B', 'price' => 2500]);
    }

    public function test_school_owner_can_update_own_service(): void
    {
        [$owner, $school] = $this->ownerWithSchool();
        $service = Service::factory()->create(['auto_school_id' => $school->id, 'name' => 'Ancien nom']);

        $this->actingAs($owner)
            ->put(route('school.services.update', $service), [
                'name'  => 'Nouveau nom',
                'price' => 3000,
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('services', ['id' => $service->id, 'name' => 'Nouveau nom', 'price' => 3000]);
    }

    public function test_school_owner_can_delete_own_service(): void
    {
        [$owner, $school] = $this->ownerWithSchool();
        $service = Service::factory()->create(['auto_school_id' => $school->id]);

        $this->actingAs($owner)
            ->delete(route('school.services.destroy', $service))
            ->assertRedirect();

        $this->assertDatabaseMissing('services', ['id' => $service->id]);
    }

    public function test_school_owner_can_view_settings(): void
    {
        [$owner] = $this->ownerWithSchool();

        $this->actingAs($owner)
            ->get(route('school.settings'))
            ->assertStatus(200)
            ->assertInertia(fn ($page) => $page->component('SchoolDashboard/Settings'));
    }

    public function test_school_owner_can_update_school(): void
    {
        [$owner, $school] = $this->ownerWithSchool();

        $this->actingAs($owner)
            ->put(route('school.settings.update'), [
                'name'    => 'Ecole Modifiee',
                'email'   => 'new@ecole.ma',
                'phone'   => '0612345678',
                'address' => '5 rue test',
                'city'    => 'Casablanca',
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('auto_schools', ['id' => $school->id, 'name' => 'Ecole Modifiee']);
    }

    public function test_school_analytics_accessible(): void
    {
        [$owner] = $this->ownerWithSchool();

        $this->actingAs($owner)
            ->get(route('school.analytics'))
            ->assertStatus(200)
            ->assertInertia(fn ($page) => $page->component('SchoolDashboard/Analytics'));
    }
}
