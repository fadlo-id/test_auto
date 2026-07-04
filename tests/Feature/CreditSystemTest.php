<?php

namespace Tests\Feature;

use App\Models\AnalyticsDedup;
use App\Models\AutoSchool;
use App\Models\CreditBalance;
use App\Models\CreditTransaction;
use App\Models\Plan;
use App\Models\User;
use App\Notifications\CreditExhaustedNotification;
use App\Notifications\CreditLowNotification;
use App\Services\CreditService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class CreditSystemTest extends TestCase
{
    use RefreshDatabase;

    // ── Helpers ───────────────────────────────────────────────────────────────

    private function makeSchool(array $attrs = []): AutoSchool
    {
        return AutoSchool::factory()->create(array_merge([
            'status'            => 'approved',
            'is_active'         => true,
            'credits_exhausted' => false,
        ], $attrs));
    }

    private function makeSchoolWithBalance(array $balances = []): AutoSchool
    {
        $school  = $this->makeSchool();
        $service = app(CreditService::class);

        foreach ($balances as $type => $config) {
            if (is_int($config)) {
                $config = ['balance' => $config];
            }
            CreditBalance::updateOrCreate(
                ['auto_school_id' => $school->id, 'credit_type' => $type],
                array_merge(['balance' => 0, 'is_unlimited' => false, 'is_blocked' => false], $config)
            );
        }

        // Ensure all types exist
        $service->getBalances($school);

        return $school;
    }

    private function makePlan(array $attrs = []): Plan
    {
        return Plan::factory()->create(array_merge([
            'view_credits'     => 3000,
            'whatsapp_credits' => 300,
            'phone_credits'    => 300,
            'website_credits'  => 100,
            'facebook_credits' => 100,
            'instagram_credits'=> 100,
            'maps_credits'     => 200,
            'email_credits'    => 100,
            'is_active'        => true,
        ], $attrs));
    }

    private function makeRequest(string $ip = '1.2.3.4', string $ua = 'Mozilla/5.0'): Request
    {
        return Request::create('/', 'GET', [], [], [], [
            'REMOTE_ADDR'     => $ip,
            'HTTP_USER_AGENT' => $ua,
        ]);
    }

    private function makeRequestWithFingerprint(string $fingerprint, string $ip = '1.2.3.4', string $ua = 'Mozilla/5.0'): Request
    {
        return Request::create('/', 'GET', [], [], [], [
            'REMOTE_ADDR'                     => $ip,
            'HTTP_USER_AGENT'                 => $ua,
            'HTTP_X_VISITOR_FP' => $fingerprint,
        ]);
    }

    // ── Deduplication ─────────────────────────────────────────────────────────

    public function test_double_refresh_counts_as_one_view(): void
    {
        $school  = $this->makeSchoolWithBalance(['view' => 300]);
        $service = app(CreditService::class);
        $req     = $this->makeRequest();

        $first  = $service->trackView($school, $req);
        $second = $service->trackView($school, $req);

        $this->assertTrue($first);
        $this->assertFalse($second, 'Same visitor should be deduped');

        $balance = CreditBalance::where('auto_school_id', $school->id)->where('credit_type', 'view')->first();
        $this->assertEquals(299, $balance->balance, 'Only 1 credit consumed');
    }

    public function test_different_visitors_each_consume_one_view(): void
    {
        $school  = $this->makeSchoolWithBalance(['view' => 300]);
        $service = app(CreditService::class);

        $service->trackView($school, $this->makeRequest('1.1.1.1', 'AgentA'));
        $service->trackView($school, $this->makeRequest('2.2.2.2', 'AgentB'));
        $service->trackView($school, $this->makeRequest('3.3.3.3', 'AgentC'));

        $balance = CreditBalance::where('auto_school_id', $school->id)->where('credit_type', 'view')->first();
        $this->assertEquals(297, $balance->balance);
    }

    public function test_repeated_whatsapp_clicks_same_visitor_count_as_one(): void
    {
        $school  = $this->makeSchoolWithBalance(['whatsapp' => 30]);
        $service = app(CreditService::class);
        $req     = $this->makeRequest('5.5.5.5', 'TestAgent/1.0');

        for ($i = 0; $i < 20; $i++) {
            $service->trackClick($school, 'whatsapp', $req);
        }

        $balance = CreditBalance::where('auto_school_id', $school->id)->where('credit_type', 'whatsapp')->first();
        $this->assertEquals(29, $balance->balance, 'Only 1 click credit consumed');

        $dedup = AnalyticsDedup::where('auto_school_id', $school->id)->where('event_type', 'whatsapp')->count();
        $this->assertEquals(1, $dedup);
    }

    public function test_different_click_types_are_independent(): void
    {
        $school  = $this->makeSchoolWithBalance([
            'whatsapp' => 30, 'phone' => 30, 'email' => 10,
        ]);
        $service = app(CreditService::class);
        $req     = $this->makeRequest('4.4.4.4', 'BrowserX');

        $service->trackClick($school, 'whatsapp', $req);
        $service->trackClick($school, 'phone', $req);
        $service->trackClick($school, 'email', $req);

        // All 3 are different types → 3 credits consumed
        $this->assertEquals(29, CreditBalance::where('auto_school_id', $school->id)->where('credit_type', 'whatsapp')->value('balance'));
        $this->assertEquals(29, CreditBalance::where('auto_school_id', $school->id)->where('credit_type', 'phone')->value('balance'));
        $this->assertEquals(9, CreditBalance::where('auto_school_id', $school->id)->where('credit_type', 'email')->value('balance'));
    }

    // ── Exhaustion ────────────────────────────────────────────────────────────

    public function test_view_credits_exhausted_marks_school_hidden(): void
    {
        $school  = $this->makeSchoolWithBalance(['view' => 1]);
        $service = app(CreditService::class);

        $service->trackView($school, $this->makeRequest('10.0.0.1', 'AgentA'));
        $school->refresh();

        $viewBalance = CreditBalance::where('auto_school_id', $school->id)->where('credit_type', 'view')->first();
        $this->assertEquals(0, $viewBalance->balance);
        $this->assertTrue($school->credits_exhausted);
    }

    public function test_credits_cannot_go_below_zero(): void
    {
        $school  = $this->makeSchoolWithBalance(['view' => 1]);
        $service = app(CreditService::class);

        $service->trackView($school, $this->makeRequest('10.0.0.1', 'Agent1')); // consumes last
        $service->trackView($school, $this->makeRequest('10.0.0.2', 'Agent2')); // already 0

        $viewBalance = CreditBalance::where('auto_school_id', $school->id)->where('credit_type', 'view')->first();
        $this->assertEquals(0, $viewBalance->balance, 'Balance must not go below 0');
    }

    public function test_exhausted_school_not_in_visible_scope(): void
    {
        $visible = $this->makeSchool(['credits_exhausted' => false]);
        $hidden  = $this->makeSchool(['credits_exhausted' => true]);

        $ids = AutoSchool::visible()->pluck('id');

        $this->assertContains($visible->id, $ids);
        $this->assertNotContains($hidden->id, $ids);
    }

    // ── Unlimited credits ─────────────────────────────────────────────────────

    public function test_unlimited_view_credits_never_decrease(): void
    {
        $school = $this->makeSchool();
        CreditBalance::updateOrCreate(
            ['auto_school_id' => $school->id, 'credit_type' => 'view'],
            ['balance' => 0, 'is_unlimited' => true, 'is_blocked' => false]
        );

        $service = app(CreditService::class);

        for ($i = 0; $i < 5; $i++) {
            $result = $service->trackView($school, $this->makeRequest("$i.0.0.1", "UA-$i"));
            $this->assertTrue($result);
        }

        $viewBalance = CreditBalance::where('auto_school_id', $school->id)->where('credit_type', 'view')->first();
        $this->assertTrue($viewBalance->is_unlimited);
        $school->refresh();
        $this->assertFalse($school->credits_exhausted);
    }

    public function test_unlimited_plan_consumes_no_balance(): void
    {
        $school = $this->makeSchool();

        foreach (CreditBalance::TYPES as $type) {
            CreditBalance::create(['auto_school_id' => $school->id, 'credit_type' => $type, 'balance' => 0, 'is_unlimited' => true, 'is_blocked' => false]);
        }

        $service = app(CreditService::class);
        $service->trackView($school, $this->makeRequest('99.0.0.1', 'PremiumUA'));

        $school->refresh();
        $this->assertFalse($school->credits_exhausted);
    }

    // ── Blocked credits ───────────────────────────────────────────────────────

    public function test_blocked_type_returns_false_on_consume(): void
    {
        $school = $this->makeSchoolWithBalance(['view' => 300]);
        $admin  = User::factory()->create(['role' => 'admin']);

        CreditBalance::where('auto_school_id', $school->id)
            ->where('credit_type', 'view')
            ->update(['is_blocked' => true]);

        $service = app(CreditService::class);
        $result  = $service->consume($school, 'view');

        $this->assertFalse($result, 'Blocked type should not be consumable');

        $balance = CreditBalance::where('auto_school_id', $school->id)->where('credit_type', 'view')->first();
        $this->assertEquals(300, $balance->balance, 'Balance should not change when blocked');
    }

    // ── Admin operations ──────────────────────────────────────────────────────

    public function test_admin_can_add_credits(): void
    {
        $school  = $this->makeSchoolWithBalance(['view' => 100, 'whatsapp' => 10]);
        $admin   = User::factory()->create(['role' => 'admin']);
        $service = app(CreditService::class);

        $service->add($school, 'view', 200, $admin, 'Test bonus');
        $service->add($school, 'whatsapp', 20, $admin, 'Test bonus');

        $this->assertEquals(300, CreditBalance::where('auto_school_id', $school->id)->where('credit_type', 'view')->value('balance'));
        $this->assertEquals(30, CreditBalance::where('auto_school_id', $school->id)->where('credit_type', 'whatsapp')->value('balance'));
    }

    public function test_admin_can_remove_credits(): void
    {
        $school  = $this->makeSchoolWithBalance(['phone' => 30]);
        $admin   = User::factory()->create(['role' => 'admin']);
        $service = app(CreditService::class);

        $service->remove($school, 'phone', 10, $admin, 'Pénalité test');

        $this->assertEquals(20, CreditBalance::where('auto_school_id', $school->id)->where('credit_type', 'phone')->value('balance'));
    }

    public function test_admin_can_set_unlimited(): void
    {
        $school  = $this->makeSchoolWithBalance(['view' => 50]);
        $admin   = User::factory()->create(['role' => 'admin']);
        $service = app(CreditService::class);

        $service->setUnlimited($school, 'view', $admin);

        $balance = CreditBalance::where('auto_school_id', $school->id)->where('credit_type', 'view')->first();
        $this->assertTrue($balance->is_unlimited);

        $school->refresh();
        $this->assertFalse($school->credits_exhausted);
    }

    public function test_admin_can_block_and_unblock(): void
    {
        $school  = $this->makeSchoolWithBalance(['facebook' => 10]);
        $admin   = User::factory()->create(['role' => 'admin']);
        $service = app(CreditService::class);

        $service->block($school, 'facebook', $admin, 'Contenu illicite');

        $blocked = CreditBalance::where('auto_school_id', $school->id)->where('credit_type', 'facebook')->first();
        $this->assertTrue($blocked->is_blocked);

        $service->unblock($school, 'facebook', $admin);

        $unblocked = CreditBalance::where('auto_school_id', $school->id)->where('credit_type', 'facebook')->first();
        $this->assertFalse($unblocked->is_blocked);
    }

    public function test_admin_can_reactivate_exhausted_school(): void
    {
        $school  = $this->makeSchool(['credits_exhausted' => true]);
        $admin   = User::factory()->create(['role' => 'admin']);
        $service = app(CreditService::class);

        $service->reactivate($school, $admin);

        $school->refresh();
        $this->assertFalse($school->credits_exhausted);
    }

    // ── Subscription renewal ─────────────────────────────────────────────────

    public function test_subscription_renewal_restores_all_credits(): void
    {
        $school  = $this->makeSchool(['credits_exhausted' => true]);
        $plan    = $this->makePlan(['view_credits' => 3000, 'whatsapp_credits' => 300]);
        $service = app(CreditService::class);

        // First: set some balances to zero
        foreach (CreditBalance::TYPES as $type) {
            CreditBalance::updateOrCreate(
                ['auto_school_id' => $school->id, 'credit_type' => $type],
                ['balance' => 0, 'is_unlimited' => false, 'is_blocked' => false]
            );
        }

        $service->restoreOnRenewal($school, $plan);
        $school->refresh();

        $this->assertFalse($school->credits_exhausted);
        $this->assertEquals(3000, CreditBalance::where('auto_school_id', $school->id)->where('credit_type', 'view')->value('balance'));
        $this->assertEquals(300, CreditBalance::where('auto_school_id', $school->id)->where('credit_type', 'whatsapp')->value('balance'));
    }

    public function test_reset_clears_exhausted_flag(): void
    {
        $school  = $this->makeSchool(['credits_exhausted' => true]);
        $plan    = $this->makePlan();
        $service = app(CreditService::class);

        $service->reset($school, null, $plan, User::factory()->create(['role' => 'admin']));
        $school->refresh();

        $this->assertFalse($school->credits_exhausted);
        $this->assertNotNull($school->credits_reset_at);
    }

    // ── History & transactions ────────────────────────────────────────────────

    public function test_credit_consumption_logged_in_transactions(): void
    {
        $school  = $this->makeSchoolWithBalance(['view' => 100]);
        $service = app(CreditService::class);

        $service->trackView($school, $this->makeRequest('7.7.7.7', 'TestUA'));

        $tx = CreditTransaction::where('auto_school_id', $school->id)
            ->where('credit_type', 'view')
            ->where('action', 'consumed')
            ->first();

        $this->assertNotNull($tx);
        $this->assertEquals(-1, $tx->amount);
        $this->assertEquals(100, $tx->balance_before);
        $this->assertEquals(99, $tx->balance_after);
    }

    public function test_admin_add_logged_in_transactions(): void
    {
        $school  = $this->makeSchoolWithBalance(['view' => 100]);
        $admin   = User::factory()->create(['role' => 'admin']);
        $service = app(CreditService::class);

        $service->add($school, 'view', 50, $admin, 'Bonus mensuel');

        $tx = CreditTransaction::where('auto_school_id', $school->id)
            ->where('credit_type', 'view')
            ->where('action', 'added')
            ->first();

        $this->assertNotNull($tx);
        $this->assertEquals(50, $tx->amount);
        $this->assertEquals($admin->id, $tx->performed_by);
        $this->assertEquals('Bonus mensuel', $tx->notes);
    }

    // ── Notifications ─────────────────────────────────────────────────────────

    public function test_notification_sent_on_view_credit_exhausted(): void
    {
        Notification::fake();

        $owner  = User::factory()->create(['role' => 'school_owner']);
        $school = $this->makeSchool(['user_id' => $owner->id]);
        CreditBalance::updateOrCreate(
            ['auto_school_id' => $school->id, 'credit_type' => 'view'],
            ['balance' => 1, 'is_unlimited' => false, 'is_blocked' => false]
        );

        $service = app(CreditService::class);
        $service->trackView($school, $this->makeRequest('11.0.0.1', 'Notif-UA'));

        Notification::assertSentTo($owner, CreditExhaustedNotification::class);
    }

    // ── Suspend/Unsuspend ─────────────────────────────────────────────────────

    public function test_admin_can_suspend_and_unsuspend_school(): void
    {
        $school  = $this->makeSchool(['is_active' => true]);
        $admin   = User::factory()->create(['role' => 'admin']);
        $service = app(CreditService::class);

        $service->suspendSchool($school, $admin, 'Violation CGU');
        $school->refresh();
        $this->assertFalse($school->is_active);

        $service->unsuspendSchool($school, $admin);
        $school->refresh();
        $this->assertTrue($school->is_active);
    }

    // ── Exhaust all (subscription expired) ───────────────────────────────────

    public function test_exhaust_all_zeroes_all_balances(): void
    {
        $school  = $this->makeSchoolWithBalance([
            'view' => 200, 'whatsapp' => 20, 'phone' => 20,
        ]);
        $service = app(CreditService::class);

        $service->exhaustAll($school);
        $school->refresh();

        $this->assertTrue($school->credits_exhausted);

        foreach (['view', 'whatsapp', 'phone'] as $type) {
            $balance = CreditBalance::where('auto_school_id', $school->id)->where('credit_type', $type)->first();
            $this->assertEquals(0, $balance->balance);
        }
    }

    // ── Unique event deduplication ────────────────────────────────────────────

    public function test_is_unique_event_returns_true_only_once(): void
    {
        $school  = $this->makeSchool();
        $service = app(CreditService::class);

        $first  = $service->isUniqueEvent($school->id, 'hash123', 'view');
        $second = $service->isUniqueEvent($school->id, 'hash123', 'view');
        $third  = $service->isUniqueEvent($school->id, 'hash456', 'view'); // different hash

        $this->assertTrue($first);
        $this->assertFalse($second);
        $this->assertTrue($third);
    }

    public function test_same_hash_different_type_is_unique(): void
    {
        $school  = $this->makeSchool();
        $service = app(CreditService::class);

        $view     = $service->isUniqueEvent($school->id, 'hashXYZ', 'view');
        $whatsapp = $service->isUniqueEvent($school->id, 'hashXYZ', 'whatsapp');

        $this->assertTrue($view);
        $this->assertTrue($whatsapp, 'Same hash, different type = unique');
    }

    // ── Summary ───────────────────────────────────────────────────────────────

    public function test_get_summary_returns_all_types(): void
    {
        $school  = $this->makeSchool();
        $service = app(CreditService::class);
        $service->getBalances($school); // initialize

        $summary = $service->getSummary($school);

        $this->assertArrayHasKey('types', $summary);

        foreach (CreditBalance::TYPES as $type) {
            $this->assertArrayHasKey($type, $summary['types'], "Type {$type} missing from summary");
            $this->assertArrayHasKey('balance', $summary['types'][$type]);
            $this->assertArrayHasKey('is_unlimited', $summary['types'][$type]);
            $this->assertArrayHasKey('is_blocked', $summary['types'][$type]);
        }
    }

    // ── Browser fingerprint layering ─────────────────────────────────────────

    public function test_same_ip_different_client_fingerprint_are_treated_as_different_visitors(): void
    {
        $school  = $this->makeSchoolWithBalance(['view' => 300]);
        $service = app(CreditService::class);

        // Same IP, same UA, but two distinct real browsers behind it (e.g. NAT/office
        // network) — a genuine client-computed fingerprint must tell them apart.
        $reqA = $this->makeRequestWithFingerprint('canvas-hash-AAA', '9.9.9.9');
        $reqB = $this->makeRequestWithFingerprint('canvas-hash-BBB', '9.9.9.9');

        $this->assertTrue($service->trackView($school, $reqA));
        $this->assertTrue($service->trackView($school, $reqB));

        $balance = CreditBalance::where('auto_school_id', $school->id)->where('credit_type', 'view')->first();
        $this->assertEquals(298, $balance->balance, 'Two distinct fingerprints behind the same IP must consume two separate view credits.');
    }

    public function test_same_client_fingerprint_refreshing_counts_once(): void
    {
        $school  = $this->makeSchoolWithBalance(['view' => 300]);
        $service = app(CreditService::class);

        $req = $this->makeRequestWithFingerprint('canvas-hash-STABLE', '9.9.9.9');

        $first  = $service->trackView($school, $req);
        $second = $service->trackView($school, $req);
        $third  = $service->trackView($school, $req);

        $this->assertTrue($first);
        $this->assertFalse($second);
        $this->assertFalse($third);
    }

    public function test_fingerprint_header_is_picked_up_automatically_from_the_request(): void
    {
        $fp = app(\App\Services\VisitorFingerprintService::class);

        $withFp    = $fp->fingerprint($this->makeRequestWithFingerprint('abc', '5.5.5.5'));
        $withoutFp = $fp->fingerprint($this->makeRequest('5.5.5.5'));

        $this->assertNotEquals($withFp, $withoutFp, 'A client fingerprint header must change the resulting hash.');
    }

    // ── Rollback ──────────────────────────────────────────────────────────────

    public function test_admin_can_rollback_a_credit_addition(): void
    {
        $school  = $this->makeSchoolWithBalance(['view' => 100]);
        $admin   = User::factory()->create(['role' => 'admin']);
        $service = app(CreditService::class);

        $service->add($school, 'view', 50, $admin);
        $this->assertEquals(150, $this->freshBalance($school, 'view'));

        $tx = CreditTransaction::where('auto_school_id', $school->id)->where('action', 'added')->latest('id')->first();
        $this->assertTrue($tx->isRollbackable());

        $service->rollbackTransaction($tx, $admin);

        $this->assertEquals(100, $this->freshBalance($school, 'view'), 'Balance must return to its pre-addition value.');
        $tx->refresh();
        $this->assertNotNull($tx->rolled_back_at);
    }

    public function test_admin_can_rollback_a_credit_removal(): void
    {
        $school  = $this->makeSchoolWithBalance(['view' => 100]);
        $admin   = User::factory()->create(['role' => 'admin']);
        $service = app(CreditService::class);

        $service->remove($school, 'view', 30, $admin);
        $this->assertEquals(70, $this->freshBalance($school, 'view'));

        $tx = CreditTransaction::where('auto_school_id', $school->id)->where('action', 'removed')->latest('id')->first();
        $service->rollbackTransaction($tx, $admin);

        $this->assertEquals(100, $this->freshBalance($school, 'view'));
    }

    public function test_rollback_of_set_unlimited_restores_previous_balance_and_clears_flag(): void
    {
        $school  = $this->makeSchoolWithBalance(['view' => 42]);
        $admin   = User::factory()->create(['role' => 'admin']);
        $service = app(CreditService::class);

        $service->setUnlimited($school, 'view', $admin);
        $balance = CreditBalance::where('auto_school_id', $school->id)->where('credit_type', 'view')->first();
        $this->assertTrue($balance->is_unlimited);

        $tx = CreditTransaction::where('auto_school_id', $school->id)->where('action', 'set_unlimited')->latest('id')->first();
        $service->rollbackTransaction($tx, $admin);

        $balance->refresh();
        $this->assertFalse($balance->is_unlimited);
        $this->assertEquals(42, $balance->balance);
    }

    public function test_rollback_of_block_restores_unblocked_state(): void
    {
        $school  = $this->makeSchoolWithBalance(['view' => 100]);
        $admin   = User::factory()->create(['role' => 'admin']);
        $service = app(CreditService::class);

        $service->block($school, 'view', $admin);
        $tx = CreditTransaction::where('auto_school_id', $school->id)->where('action', 'blocked')->latest('id')->first();

        $service->rollbackTransaction($tx, $admin);

        $balance = CreditBalance::where('auto_school_id', $school->id)->where('credit_type', 'view')->first();
        $this->assertFalse($balance->is_blocked);
    }

    public function test_a_transaction_cannot_be_rolled_back_twice(): void
    {
        $school  = $this->makeSchoolWithBalance(['view' => 100]);
        $admin   = User::factory()->create(['role' => 'admin']);
        $service = app(CreditService::class);

        $service->add($school, 'view', 20, $admin);
        $tx = CreditTransaction::where('auto_school_id', $school->id)->where('action', 'added')->latest('id')->first();

        $service->rollbackTransaction($tx, $admin);

        $this->expectException(\RuntimeException::class);
        $service->rollbackTransaction($tx->fresh(), $admin);
    }

    public function test_a_raw_consumption_cannot_be_rolled_back(): void
    {
        $school  = $this->makeSchoolWithBalance(['view' => 100]);
        $admin   = User::factory()->create(['role' => 'admin']);
        $service = app(CreditService::class);

        $service->consume($school, 'view');
        $tx = CreditTransaction::where('auto_school_id', $school->id)->where('action', 'consumed')->latest('id')->first();

        $this->assertFalse($tx->isRollbackable());

        $this->expectException(\RuntimeException::class);
        $service->rollbackTransaction($tx, $admin);
    }

    public function test_rollback_itself_is_recorded_in_history_and_linked_to_the_original(): void
    {
        $school  = $this->makeSchoolWithBalance(['view' => 100]);
        $admin   = User::factory()->create(['role' => 'admin']);
        $service = app(CreditService::class);

        $service->add($school, 'view', 25, $admin);
        $original = CreditTransaction::where('auto_school_id', $school->id)->where('action', 'added')->latest('id')->first();

        $rollback = $service->rollbackTransaction($original, $admin);

        $this->assertEquals('rollback', $rollback->action);
        $this->assertEquals($original->id, $rollback->rollback_of_id);
        $this->assertEquals($admin->id, $rollback->performed_by);
        $this->assertDatabaseHas('credit_transactions', ['id' => $rollback->id, 'rollback_of_id' => $original->id]);
    }

    public function test_admin_rollback_route_is_forbidden_for_non_admin(): void
    {
        $school  = $this->makeSchoolWithBalance(['view' => 100]);
        $admin   = User::factory()->create(['role' => 'admin']);
        app(CreditService::class)->add($school, 'view', 10, $admin);
        $tx = CreditTransaction::where('auto_school_id', $school->id)->where('action', 'added')->latest('id')->first();

        $user = User::factory()->create(['role' => 'user']);

        $this->actingAs($user)
            ->post(route('admin.credits.transactions.rollback', [$school->id, $tx->id]))
            ->assertForbidden();
    }

    public function test_admin_rollback_route_reverses_the_transaction(): void
    {
        $school = $this->makeSchoolWithBalance(['view' => 100]);
        $admin  = User::factory()->create(['role' => 'super_admin']);
        app(CreditService::class)->add($school, 'view', 10, $admin);
        $tx = CreditTransaction::where('auto_school_id', $school->id)->where('action', 'added')->latest('id')->first();

        $this->actingAs($admin)
            ->post(route('admin.credits.transactions.rollback', [$school->id, $tx->id]))
            ->assertRedirect()
            ->assertSessionHas('success');

        $this->assertEquals(100, $this->freshBalance($school, 'view'));
    }

    // ── Locking hardening on admin mutations ─────────────────────────────────

    public function test_concurrent_style_add_and_consume_do_not_lose_updates(): void
    {
        // Not true multi-process concurrency (SQLite/PHPUnit run single-threaded),
        // but verifies the locked read-modify-write sequence is internally
        // consistent across interleaved admin + visitor operations.
        $school  = $this->makeSchoolWithBalance(['view' => 10]);
        $admin   = User::factory()->create(['role' => 'admin']);
        $service = app(CreditService::class);

        $service->consume($school, 'view');                 // 10 -> 9
        $service->add($school, 'view', 5, $admin);           // 9 -> 14
        $service->consume($school, 'view');                 // 14 -> 13
        $service->remove($school, 'view', 3, $admin);        // 13 -> 10

        $this->assertEquals(10, $this->freshBalance($school, 'view'));
    }

    // ── Monthly reset scheduler ───────────────────────────────────────────────

    public function test_monthly_reset_command_resets_free_tier_school_past_due(): void
    {
        $school = $this->makeSchoolWithBalance(['view' => 0]);
        $school->update(['credits_reset_at' => now()->subDays(31), 'credits_exhausted' => true]);

        $this->artisan('credits:monthly-reset')->assertSuccessful();

        $this->assertEquals(CreditService::FREE_QUOTAS['view'], $this->freshBalance($school, 'view'));
        $this->assertFalse($school->fresh()->credits_exhausted);
    }

    public function test_monthly_reset_command_skips_free_tier_school_not_yet_due(): void
    {
        $school = $this->makeSchoolWithBalance(['view' => 5]);
        $school->update(['credits_reset_at' => now()->subDays(5)]);

        $this->artisan('credits:monthly-reset')->assertSuccessful();

        $this->assertEquals(5, $this->freshBalance($school, 'view'), 'A school reset 5 days ago is not due for another 25 days.');
    }

    public function test_monthly_reset_command_ignores_subscribed_school_within_grace_period(): void
    {
        $school = $this->makeSchoolWithBalance(['view' => 3]);
        $plan   = $this->makePlan();
        \App\Models\Subscription::create([
            'auto_school_id' => $school->id,
            'plan_id'        => $plan->id,
            'status'         => 'active',
            'started_at'     => now()->subDays(10),
            'expires_at'     => now()->addDays(20),
        ]);
        $school->update(['credits_reset_at' => now()->subDays(10)]);

        $this->artisan('credits:monthly-reset')->assertSuccessful();

        $this->assertEquals(3, $this->freshBalance($school, 'view'), 'A paid school within the 35-day grace period must not be touched — it resets via the renewal webhook.');
    }

    public function test_monthly_reset_command_safety_nets_subscribed_school_with_stale_reset_date(): void
    {
        $school = $this->makeSchoolWithBalance(['view' => 3]);
        $plan   = $this->makePlan(['view_credits' => 3000]);
        \App\Models\Subscription::create([
            'auto_school_id' => $school->id,
            'plan_id'        => $plan->id,
            'status'         => 'active',
            'started_at'     => now()->subDays(40),
            'expires_at'     => now()->addDays(20),
        ]);
        $school->update(['credits_reset_at' => now()->subDays(40)]);

        $this->artisan('credits:monthly-reset')->assertSuccessful();

        $this->assertEquals(3000, $this->freshBalance($school, 'view'), 'A missed renewal webhook must be caught by the 35-day safety net.');
    }

    public function test_monthly_reset_does_not_touch_inactive_schools(): void
    {
        $school = $this->makeSchoolWithBalance(['view' => 0]);
        $school->update(['credits_reset_at' => now()->subDays(60), 'is_active' => false]);

        $this->artisan('credits:monthly-reset')->assertSuccessful();

        $this->assertEquals(0, $this->freshBalance($school, 'view'), 'A suspended school must not be reset.');
    }

    // ── Test helper ───────────────────────────────────────────────────────────

    private function freshBalance(AutoSchool $school, string $type): int
    {
        return CreditBalance::where('auto_school_id', $school->id)->where('credit_type', $type)->first()->balance;
    }
}
