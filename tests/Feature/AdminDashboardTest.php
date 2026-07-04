<?php

namespace Tests\Feature;

use App\Models\AutoSchool;
use App\Models\Category;
use App\Models\Payment;
use App\Models\Plan;
use App\Models\Review;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminDashboardTest extends TestCase
{
    use RefreshDatabase;

    // ── Helpers ───────────────────────────────────────────────────────────────

    private function admin(): User
    {
        return User::factory()->create(['role' => 'super_admin']);
    }

    private function schoolOwner(): User
    {
        return User::factory()->create(['role' => 'school_owner']);
    }

    private function school(string $status = 'approved'): AutoSchool
    {
        return AutoSchool::factory()->create([
            'user_id'   => $this->schoolOwner()->id,
            'status'    => $status,
            'is_active' => $status === 'approved',
        ]);
    }

    /** Create a successful Payment directly (no factory). */
    private function pay(AutoSchool $school, float $amount, string $status = 'success'): Payment
    {
        return Payment::create([
            'auto_school_id'           => $school->id,
            'amount'                   => $amount,
            'status'                   => $status,
            'currency'                 => 'MAD',
            'stripe_payment_intent_id' => 'pi_test_' . uniqid(),
        ]);
    }

    /** Create an active Subscription directly (no factory). */
    private function subscribe(AutoSchool $school, Plan $plan): Subscription
    {
        return Subscription::create([
            'auto_school_id' => $school->id,
            'plan_id'        => $plan->id,
            'status'         => 'active',
            'started_at'     => now()->subMonth(),
            'expires_at'     => now()->addMonth(),
        ]);
    }

    // ── Access control ────────────────────────────────────────────────────────

    public function test_dashboard_requires_authentication(): void
    {
        $this->get(route('admin.dashboard'))->assertRedirect(route('login'));
    }

    public function test_regular_user_cannot_access_dashboard(): void
    {
        $this->actingAs(User::factory()->create(['role' => 'user']))
            ->get(route('admin.dashboard'))
            ->assertStatus(403);
    }

    public function test_admin_can_access_dashboard(): void
    {
        $this->actingAs($this->admin())
            ->get(route('admin.dashboard'))
            ->assertOk()
            ->assertInertia(fn ($p) => $p->component('Admin/Dashboard'));
    }

    // ── Inertia props ─────────────────────────────────────────────────────────

    public function test_dashboard_returns_required_props(): void
    {
        $this->actingAs($this->admin())
            ->get(route('admin.dashboard'))
            ->assertInertia(fn ($p) => $p
                ->component('Admin/Dashboard')
                ->has('stats')
                ->has('monthlyUsers')
                ->has('monthlyRevenue')
                ->has('monthlySchools')
                ->has('subscriptionBreakdown')
                ->has('cityBreakdown')
                ->has('topSchools')
                ->has('topCategories')
                ->has('heatmap')
                ->has('recentSchools')
                ->has('recentPayments')
                ->has('pendingActions')
            );
    }

    public function test_stats_includes_saas_metrics(): void
    {
        $this->actingAs($this->admin())
            ->get(route('admin.dashboard'))
            ->assertInertia(fn ($p) => $p
                ->has('stats.mrr')
                ->has('stats.arr')
                ->has('stats.churn_rate')
                ->has('stats.conversion_rate')
                ->has('stats.renewal_rate')
                ->has('stats.rev_month')
                ->has('stats.rev_today')
                ->has('stats.rev_week')
                ->has('stats.rev_year')
                ->has('stats.total_revenue')
            );
    }

    public function test_pending_actions_reflects_pending_schools(): void
    {
        $this->school('pending');
        $this->school('pending');

        $this->actingAs($this->admin())
            ->get(route('admin.dashboard'))
            ->assertInertia(fn ($p) => $p->where('pendingActions.schools', 2));
    }

    public function test_pending_actions_reflects_pending_reviews(): void
    {
        $school = $this->school();
        $user   = User::factory()->create(['role' => 'user']);
        Review::factory()->count(3)->create([
            'auto_school_id' => $school->id,
            'user_id'        => $user->id,
            'status'         => 'pending',
        ]);

        $this->actingAs($this->admin())
            ->get(route('admin.dashboard'))
            ->assertInertia(fn ($p) => $p->where('pendingActions.reviews', 3));
    }

    // ── Revenue metrics ───────────────────────────────────────────────────────

    public function test_total_revenue_counts_only_successful_payments(): void
    {
        $school = $this->school();
        $this->pay($school, 2000);
        $this->pay($school, 9999, 'failed');

        // PHP json_encode encodes whole-number floats as ints (2000.0 → 2000)
        $this->actingAs($this->admin())
            ->get(route('admin.dashboard'))
            ->assertInertia(fn ($p) => $p->where('stats.total_revenue', fn ($v) => (float)$v === 2000.0));
    }

    public function test_mrr_is_zero_when_no_active_subscriptions(): void
    {
        $this->actingAs($this->admin())
            ->get(route('admin.dashboard'))
            ->assertInertia(fn ($p) => $p->where('stats.mrr', fn ($v) => (float)$v === 0.0));
    }

    public function test_mrr_computed_from_monthly_subscription(): void
    {
        $plan = Plan::factory()->create(['price' => 300, 'billing_period' => 'monthly']);
        $this->subscribe($this->school(), $plan);

        $this->actingAs($this->admin())
            ->get(route('admin.dashboard'))
            ->assertInertia(fn ($p) => $p->where('stats.mrr', fn ($v) => (float)$v === 300.0));
    }

    public function test_arr_equals_mrr_times_twelve(): void
    {
        $plan = Plan::factory()->create(['price' => 500, 'billing_period' => 'monthly']);
        $this->subscribe($this->school(), $plan);

        $this->actingAs($this->admin())
            ->get(route('admin.dashboard'))
            ->assertInertia(fn ($p) => $p
                ->where('stats.mrr', fn ($v) => (float)$v === 500.0)
                ->where('stats.arr', fn ($v) => (float)$v === 6000.0)
            );
    }

    public function test_yearly_plan_contributes_to_mrr_normalized(): void
    {
        $plan = Plan::factory()->create(['price' => 1200, 'billing_period' => 'yearly']);
        $this->subscribe($this->school(), $plan);

        // MRR = 1200 / 12 = 100
        $this->actingAs($this->admin())
            ->get(route('admin.dashboard'))
            ->assertInertia(fn ($p) => $p->where('stats.mrr', fn ($v) => (float)$v === 100.0));
    }

    public function test_conversion_rate_is_zero_with_no_schools(): void
    {
        $this->actingAs($this->admin())
            ->get(route('admin.dashboard'))
            ->assertInertia(fn ($p) => $p->where('stats.conversion_rate', fn ($v) => (float)$v === 0.0));
    }

    public function test_conversion_rate_computed_correctly(): void
    {
        $plan = Plan::factory()->create(['price' => 200, 'billing_period' => 'monthly']);
        $sch1 = $this->school();
        $this->school(); // no subscription
        $this->subscribe($sch1, $plan);

        // 1 active sub / 2 total schools = 50%
        $this->actingAs($this->admin())
            ->get(route('admin.dashboard'))
            ->assertInertia(fn ($p) => $p->where('stats.conversion_rate', fn ($v) => (float)$v === 50.0));
    }

    // ── Top schools ───────────────────────────────────────────────────────────

    public function test_top_schools_ordered_by_revenue(): void
    {
        $schoolA = $this->school(); $this->pay($schoolA, 5000);
        $schoolB = $this->school(); $this->pay($schoolB, 1000);
        $schoolC = $this->school(); $this->pay($schoolC, 9000);

        $this->actingAs($this->admin())
            ->get(route('admin.dashboard'))
            ->assertInertia(fn ($p) => $p
                ->has('topSchools', 3)
                ->where('topSchools.0.name', $schoolC->name)
            );
    }

    public function test_top_schools_have_revenue_and_count(): void
    {
        $school = $this->school();
        $this->pay($school, 2000);
        $this->pay($school, 3000);

        $this->actingAs($this->admin())
            ->get(route('admin.dashboard'))
            ->assertInertia(fn ($p) => $p
                ->has('topSchools.0.total_revenue')
                ->has('topSchools.0.payment_count')
                ->where('topSchools.0.payment_count', 2)
            );
    }

    // ── Top categories ────────────────────────────────────────────────────────

    public function test_top_categories_returned_when_populated(): void
    {
        $cat    = Category::create(['code' => 'B', 'name_fr' => 'Permis B']);
        $school = $this->school();
        $school->categories()->attach($cat->id);

        $this->actingAs($this->admin())
            ->get(route('admin.dashboard'))
            ->assertInertia(fn ($p) => $p
                ->has('topCategories', 1)
                ->where('topCategories.0.school_count', 1)
            );
    }

    // ── Heatmap ───────────────────────────────────────────────────────────────

    public function test_heatmap_covers_52_weeks(): void
    {
        $response = $this->actingAs($this->admin())->get(route('admin.dashboard'));
        $response->assertOk();

        // Extract heatmap from Inertia response
        $response->assertInertia(fn ($p) => $p
            ->where('heatmap', fn ($data) => count($data) > 300)
        );
    }

    public function test_heatmap_entry_structure(): void
    {
        $response = $this->actingAs($this->admin())->get(route('admin.dashboard'));
        $response->assertOk()->assertInertia(fn ($p) => $p
            ->has('heatmap.0.date')
            ->has('heatmap.0.count')
            ->has('heatmap.0.week')
            ->has('heatmap.0.dow')
        );
    }

    // ── Live endpoint ─────────────────────────────────────────────────────────

    public function test_live_endpoint_returns_401_for_unauthenticated(): void
    {
        // JSON requests get 401 (Unauthenticated), not a redirect
        $this->getJson(route('admin.dashboard.live'))->assertStatus(401);
    }

    public function test_live_endpoint_returns_json_for_admin(): void
    {
        $this->actingAs($this->admin())
            ->getJson(route('admin.dashboard.live'))
            ->assertOk()
            ->assertJsonStructure([
                'active_subscriptions',
                'pending_schools',
                'pending_reviews',
                'unread_contacts',
                'rev_today',
                'updated_at',
            ]);
    }

    public function test_live_endpoint_reflects_current_pending_count(): void
    {
        $this->school('pending');
        $this->school('pending');

        $this->actingAs($this->admin())
            ->getJson(route('admin.dashboard.live'))
            ->assertOk()
            ->assertJsonFragment(['pending_schools' => 2]);
    }

    public function test_live_rev_today_reflects_payments(): void
    {
        $school = $this->school();
        $this->pay($school, 1500);
        $this->pay($school, 500);

        $this->actingAs($this->admin())
            ->getJson(route('admin.dashboard.live'))
            ->assertOk()
            ->assertJsonFragment(['rev_today' => 2000.0]);
    }

    // ── Export ────────────────────────────────────────────────────────────────

    public function test_export_csv_returns_csv_response(): void
    {
        $this->actingAs($this->admin())
            ->get(route('admin.dashboard.export') . '?format=csv')
            ->assertOk()
            ->assertHeader('content-type', 'text/csv; charset=UTF-8');
    }

    public function test_export_excel_returns_excel_response(): void
    {
        $this->actingAs($this->admin())
            ->get(route('admin.dashboard.export') . '?format=excel')
            ->assertOk()
            ->assertHeader('content-type', 'application/vnd.ms-excel');
    }

    public function test_export_defaults_to_csv(): void
    {
        $this->actingAs($this->admin())
            ->get(route('admin.dashboard.export'))
            ->assertOk()
            ->assertHeader('content-type', 'text/csv; charset=UTF-8');
    }

    public function test_export_csv_contains_all_metrics(): void
    {
        $response = $this->actingAs($this->admin())
            ->get(route('admin.dashboard.export') . '?format=csv');
        $response->assertOk();

        $content = $response->streamedContent();
        foreach (['Revenu Total', 'MRR', 'ARR', 'Taux de Conversion', 'Taux de Churn', 'Renouvellement'] as $label) {
            $this->assertStringContainsString($label, $content, "CSV is missing: $label");
        }
    }

    public function test_export_excel_contains_valid_xml(): void
    {
        $response = $this->actingAs($this->admin())
            ->get(route('admin.dashboard.export') . '?format=excel');
        $response->assertOk();

        $xml = $response->content();
        $this->assertStringContainsString('<Workbook', $xml);
        $this->assertStringContainsString('<Worksheet', $xml);
        $this->assertStringContainsString('MRR', $xml);
    }

    public function test_non_admin_cannot_access_export(): void
    {
        $this->actingAs(User::factory()->create(['role' => 'user']))
            ->get(route('admin.dashboard.export'))
            ->assertStatus(403);
    }

    // ── Recent feeds ──────────────────────────────────────────────────────────

    public function test_recent_payments_only_shows_successful(): void
    {
        $school = $this->school();
        $this->pay($school, 1000, 'success');
        $this->pay($school, 9999, 'failed');

        $this->actingAs($this->admin())
            ->get(route('admin.dashboard'))
            ->assertInertia(fn ($p) => $p->has('recentPayments', 1));
    }

    public function test_recent_schools_included_in_props(): void
    {
        $this->school('pending');
        $this->school('approved');

        $this->actingAs($this->admin())
            ->get(route('admin.dashboard'))
            ->assertInertia(fn ($p) => $p->has('recentSchools', 2));
    }
}
