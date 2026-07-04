<?php

namespace Tests\Feature;

use App\Models\AutoSchool;
use App\Models\Category;
use App\Models\Plan;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminCrudTest extends TestCase
{
    use RefreshDatabase;

    private function admin(): User
    {
        return User::factory()->create(['role' => 'super_admin']);
    }

    // ── Categories ────────────────────────────────────────────

    public function test_admin_categories_index_renders(): void
    {
        Category::create(['code' => 'B', 'name_fr' => 'Permis B', 'name_ar' => null, 'name_en' => 'License B']);

        $this->actingAs($this->admin())
            ->get(route('admin.categories.index'))
            ->assertOk()
            ->assertInertia(fn ($p) => $p->component('Admin/Categories')->has('categories'));
    }

    public function test_admin_can_create_category(): void
    {
        $this->actingAs($this->admin())
            ->post(route('admin.categories.store'), [
                'code'    => 'C',
                'name_fr' => 'Permis C',
                'name_ar' => null,
                'name_en' => 'License C',
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('categories', ['code' => 'C', 'name_fr' => 'Permis C']);
    }

    public function test_admin_can_update_category(): void
    {
        $cat = Category::create(['code' => 'D', 'name_fr' => 'Permis D', 'name_ar' => null, 'name_en' => null]);

        $this->actingAs($this->admin())
            ->put(route('admin.categories.update', $cat->id), [
                'code'    => 'D',
                'name_fr' => 'Permis D Modifié',
                'name_ar' => null,
                'name_en' => null,
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('categories', ['id' => $cat->id, 'name_fr' => 'Permis D Modifié']);
    }

    public function test_admin_can_delete_category(): void
    {
        $cat = Category::create(['code' => 'E', 'name_fr' => 'Permis E', 'name_ar' => null, 'name_en' => null]);

        $this->actingAs($this->admin())
            ->delete(route('admin.categories.destroy', $cat->id))
            ->assertRedirect();

        $this->assertDatabaseMissing('categories', ['id' => $cat->id]);
    }

    public function test_non_admin_cannot_access_categories(): void
    {
        $user = User::factory()->create(['role' => 'user']);

        $this->actingAs($user)
            ->get(route('admin.categories.index'))
            ->assertStatus(403);
    }

    // ── Plans ─────────────────────────────────────────────────

    public function test_admin_plans_index_renders(): void
    {
        $this->actingAs($this->admin())
            ->get(route('admin.plans.index'))
            ->assertOk()
            ->assertInertia(fn ($p) => $p->component('Admin/Plans')->has('plans'));
    }

    public function test_admin_can_create_plan(): void
    {
        $this->actingAs($this->admin())
            ->post(route('admin.plans.store'), [
                'name'           => 'Plan Pro Test',
                'slug'           => 'pro-test',
                'description'    => 'Test plan',
                'price'          => 299,
                'billing_period' => 'monthly',
                'is_active'      => true,
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('plans', ['name' => 'Plan Pro Test', 'price' => 299]);
    }

    public function test_admin_can_update_plan(): void
    {
        $plan = Plan::factory()->create(['name' => 'Old Name', 'price' => 100, 'billing_period' => 'monthly']);

        $this->actingAs($this->admin())
            ->put(route('admin.plans.update', $plan->id), [
                'name'           => 'New Name',
                'description'    => $plan->description ?? '',
                'price'          => 200,
                'billing_period' => 'monthly',
                'is_active'      => true,
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('plans', ['id' => $plan->id, 'name' => 'New Name', 'price' => 200]);
    }

    public function test_admin_can_deactivate_plan(): void
    {
        $plan = Plan::factory()->create(['is_active' => true]);

        $this->actingAs($this->admin())
            ->delete(route('admin.plans.destroy', $plan->id))
            ->assertRedirect();

        $this->assertDatabaseHas('plans', ['id' => $plan->id, 'is_active' => false]);
    }

    // ── School gallery ────────────────────────────────────────

    public function test_school_gallery_page_renders(): void
    {
        $owner  = User::factory()->create(['role' => 'school_owner']);
        $school = AutoSchool::factory()->create(['user_id' => $owner->id, 'status' => 'approved']);

        $this->actingAs($owner)
            ->get(route('school.gallery'))
            ->assertOk()
            ->assertInertia(fn ($p) => $p->component('SchoolDashboard/Gallery'));
    }
}
