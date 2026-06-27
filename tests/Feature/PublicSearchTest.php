<?php

namespace Tests\Feature;

use App\Models\AutoSchool;
use App\Models\Category;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PublicSearchTest extends TestCase
{
    use RefreshDatabase;

    private function activeSchool(string $city = 'Casablanca', ?int $ownerId = null): AutoSchool
    {
        $owner = $ownerId ? User::find($ownerId) : User::factory()->create(['role' => 'school_owner']);
        return AutoSchool::factory()->active()->create([
            'user_id' => $owner->id,
            'city'    => $city,
            'name'    => "Auto-École {$city}",
        ]);
    }

    public function test_search_page_loads(): void
    {
        $this->get(route('search'))
            ->assertOk()
            ->assertInertia(fn ($p) => $p->component('SearchPage'));
    }

    public function test_search_returns_active_schools(): void
    {
        $school = $this->activeSchool();

        $this->get(route('search', ['search' => $school->name]))
            ->assertOk()
            ->assertInertia(fn ($p) => $p->where('schools.total', 1));
    }

    public function test_search_filters_by_city(): void
    {
        $this->activeSchool('Rabat');
        $this->activeSchool('Casablanca');

        $this->get(route('search', ['city' => 'Rabat']))
            ->assertOk()
            ->assertInertia(fn ($p) => $p->where('schools.total', 1));
    }

    public function test_search_does_not_return_inactive_schools(): void
    {
        $owner = User::factory()->create(['role' => 'school_owner']);
        AutoSchool::factory()->create(['user_id' => $owner->id, 'status' => 'pending', 'is_active' => false]);

        $this->get(route('search'))
            ->assertOk()
            ->assertInertia(fn ($p) => $p->where('schools.total', 0));
    }

    public function test_home_page_loads(): void
    {
        $this->get(route('home'))
            ->assertOk()
            ->assertInertia(fn ($p) => $p->component('HomePage'));
    }

    public function test_school_detail_page_loads(): void
    {
        $school = $this->activeSchool();

        $this->get(route('school.detail', $school->slug))
            ->assertOk()
            ->assertInertia(fn ($p) => $p->component('DetailPage')->where('school.id', $school->id));
    }

    public function test_school_detail_404_for_inactive_school(): void
    {
        $owner = User::factory()->create(['role' => 'school_owner']);
        $school = AutoSchool::factory()->create(['user_id' => $owner->id, 'status' => 'pending', 'is_active' => false]);

        $this->get(route('school.detail', $school->slug))
            ->assertNotFound();
    }

    public function test_sitemap_returns_xml(): void
    {
        $resp = $this->get(route('sitemap'))->assertOk();
        $this->assertStringContainsString('xml', $resp->headers->get('Content-Type', ''));
    }

    public function test_robots_txt_returns_correct_content(): void
    {
        $resp = $this->get('/robots.txt')->assertOk();
        $this->assertStringContainsString('Disallow: /admin/', $resp->content());
        $this->assertStringContainsString('Sitemap:', $resp->content());
    }

    public function test_search_filters_by_category(): void
    {
        $category = Category::create(['code' => 'B', 'name_fr' => 'Permis B', 'name_ar' => null, 'name_en' => null]);
        $school   = $this->activeSchool();
        $school->categories()->attach($category->id);

        $owner2  = User::factory()->create(['role' => 'school_owner']);
        $school2 = AutoSchool::factory()->active()->create(['user_id' => $owner2->id, 'city' => 'Fes']);

        $this->get(route('search', ['category' => $category->id]))
            ->assertOk()
            ->assertInertia(fn ($p) => $p->where('schools.total', 1));
    }
}
