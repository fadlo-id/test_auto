<?php

namespace Tests\Feature;

use App\Models\AutoSchool;
use App\Models\Category;
use App\Models\Plan;
use App\Models\Review;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PublicPagesTest extends TestCase
{
    use RefreshDatabase;

    private function createActiveSchool(array $attrs = []): AutoSchool
    {
        $user = User::factory()->create(['role' => 'school_owner']);
        return AutoSchool::factory()->create(array_merge([
            'user_id'   => $user->id,
            'status'    => 'approved',
            'is_active' => true,
        ], $attrs));
    }

    public function test_home_page_renders(): void
    {
        $this->get(route('home'))->assertStatus(200)->assertInertia(fn ($page) =>
            $page->component('HomePage')
                ->has('featured')
                ->has('cities')
                ->has('categories')
                ->has('plans')
                ->has('stats')
        );
    }

    public function test_search_page_renders(): void
    {
        $this->get(route('search'))->assertStatus(200)->assertInertia(fn ($page) =>
            $page->component('SearchPage')
                ->has('schools')
                ->has('cities')
                ->has('categories')
                ->has('filters')
        );
    }

    public function test_search_filters_by_city(): void
    {
        $this->createActiveSchool(['city' => 'Casablanca', 'name' => 'Ecole Casa']);
        $this->createActiveSchool(['city' => 'Rabat', 'name' => 'Ecole Rabat']);

        $this->get(route('search', ['city' => 'Casablanca']))
            ->assertStatus(200)
            ->assertInertia(fn ($page) =>
                $page->component('SearchPage')
                    ->where('schools.total', 1)
                    ->where('schools.data.0.name', 'Ecole Casa')
            );
    }

    public function test_search_filters_by_keyword(): void
    {
        $this->createActiveSchool(['name' => 'Auto-ecole Unique123']);
        $this->createActiveSchool(['name' => 'Autre ecole']);

        $this->get(route('search', ['search' => 'Unique123']))
            ->assertStatus(200)
            ->assertInertia(fn ($page) =>
                $page->component('SearchPage')
                    ->where('schools.total', 1)
            );
    }

    public function test_detail_page_renders_for_active_school(): void
    {
        $school = $this->createActiveSchool(['name' => 'Test School', 'slug' => 'test-school']);

        $this->get(route('school.detail', 'test-school'))
            ->assertStatus(200)
            ->assertInertia(fn ($page) =>
                $page->component('DetailPage')
                    ->has('school')
                    ->has('ratingBreakdown')
                    ->has('canReview')
                    ->where('school.name', 'Test School')
            );
    }

    public function test_detail_page_returns_404_for_unknown_slug(): void
    {
        $this->get(route('school.detail', 'slug-inexistant'))->assertStatus(404);
    }

    public function test_sitemap_returns_xml(): void
    {
        $this->createActiveSchool(['slug' => 'ecole-sitemap-test']);

        $response = $this->get(route('sitemap'));

        $response->assertStatus(200);
        $response->assertHeader('Content-Type', 'application/xml');
        $this->assertStringContainsString('urlset', $response->getContent());
        $this->assertStringContainsString('ecole-sitemap-test', $response->getContent());
    }
}
