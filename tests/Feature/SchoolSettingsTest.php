<?php

namespace Tests\Feature;

use App\Models\AutoSchool;
use App\Models\Category;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class SchoolSettingsTest extends TestCase
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

    public function test_settings_page_renders(): void
    {
        [$owner] = $this->ownerWithSchool();

        $this->actingAs($owner)
            ->get(route('school.settings'))
            ->assertOk()
            ->assertInertia(fn ($p) => $p->component('SchoolDashboard/Settings'));
    }

    public function test_owner_can_update_school_profile(): void
    {
        [$owner, $school] = $this->ownerWithSchool();

        $this->actingAs($owner)
            ->put(route('school.settings.update'), [
                'name'        => 'Updated School Name',
                'email'       => 'updated@school.com',
                'phone'       => '0612345678',
                'address'     => '10 Rue Mohammed V',
                'city'        => 'Rabat',
                'description' => 'Une belle école.',
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('auto_schools', [
            'id'   => $school->id,
            'name' => 'Updated School Name',
            'city' => 'Rabat',
        ]);
    }

    public function test_owner_can_update_categories(): void
    {
        [$owner, $school] = $this->ownerWithSchool();
        $category = Category::create(['code' => 'C', 'name_fr' => 'Permis C', 'name_ar' => null, 'name_en' => null]);

        $this->actingAs($owner)
            ->put(route('school.settings.update'), [
                'name'       => $school->name,
                'email'      => $school->email,
                'phone'      => $school->phone,
                'address'    => $school->address,
                'city'       => $school->city,
                'categories' => [$category->id],
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('school_categories', [
            'auto_school_id' => $school->id,
            'category_id'    => $category->id,
        ]);
    }

    public function test_owner_can_upload_logo(): void
    {
        Storage::fake('public');
        [$owner, $school] = $this->ownerWithSchool();

        $file = UploadedFile::fake()->create('logo.jpg', 50, 'image/jpeg');

        $this->actingAs($owner)
            ->post(route('school.settings.logo'), ['logo' => $file])
            ->assertRedirect();

        $school->refresh();
        $this->assertNotNull($school->logo_url);
        Storage::disk('public')->assertExists($school->logo_url);
    }

    public function test_owner_can_upload_banner(): void
    {
        Storage::fake('public');
        [$owner, $school] = $this->ownerWithSchool();

        $file = UploadedFile::fake()->create('banner.jpg', 200, 'image/jpeg');

        $this->actingAs($owner)
            ->post(route('school.settings.banner'), ['banner' => $file])
            ->assertRedirect();

        $school->refresh();
        $this->assertNotNull($school->banner_url);
    }

    public function test_non_owner_cannot_access_settings(): void
    {
        $other = User::factory()->create(['role' => 'user']);

        $this->actingAs($other)
            ->get(route('school.settings'))
            ->assertForbidden();
    }

    public function test_owner_can_create_school_if_none_exists(): void
    {
        $owner = User::factory()->create(['role' => 'school_owner']);

        $this->actingAs($owner)
            ->get(route('school.settings'))
            ->assertOk()
            ->assertInertia(fn ($p) => $p->where('school', null));
    }
}
