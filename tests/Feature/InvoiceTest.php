<?php

namespace Tests\Feature;

use App\Models\AutoSchool;
use App\Models\Payment;
use App\Models\Plan;
use App\Models\User;
use App\Services\InvoiceService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class InvoiceTest extends TestCase
{
    use RefreshDatabase;

    private InvoiceService $invoices;
    private AutoSchool $school;
    private Plan $plan;
    private User $owner;

    protected function setUp(): void
    {
        parent::setUp();
        $this->invoices = app(InvoiceService::class);

        $this->owner = User::factory()->create(['role' => 'school_owner']);
        $this->school = AutoSchool::factory()->create([
            'user_id' => $this->owner->id,
            'status'  => 'approved',
        ]);
        $this->plan = Plan::factory()->create([
            'name'  => 'Premium',
            'price' => 300.00,
        ]);
    }

    private function makePayment(float $amount = 300.0, string $status = 'success'): Payment
    {
        return Payment::create([
            'auto_school_id'           => $this->school->id,
            'plan_id'                  => $this->plan->id,
            'amount'                   => $amount,
            'status'                   => $status,
            'currency'                 => 'MAD',
            'stripe_payment_intent_id' => 'pi_test_' . uniqid(),
            'paid_at'                  => now(),
        ]);
    }

    // ── Invoice numbering ─────────────────────────────────────────────────────

    public function test_assign_number_format(): void
    {
        $payment = $this->makePayment();
        $number  = $this->invoices->assignNumber($payment);

        $year = now()->year;
        $this->assertMatchesRegularExpression("/^FAC-{$year}-\d{6}$/", $number);
        $payment->refresh();
        $this->assertEquals($number, $payment->invoice_number);
    }

    public function test_invoice_numbers_are_sequential(): void
    {
        $p1 = $this->makePayment();
        $p2 = $this->makePayment();
        $p3 = $this->makePayment();

        $n1 = $this->invoices->assignNumber($p1);
        $n2 = $this->invoices->assignNumber($p2);
        $n3 = $this->invoices->assignNumber($p3);

        $seq1 = (int) substr($n1, -6);
        $seq2 = (int) substr($n2, -6);
        $seq3 = (int) substr($n3, -6);

        $this->assertGreaterThan($seq1, $seq2);
        $this->assertGreaterThan($seq2, $seq3);
    }

    public function test_assign_number_is_idempotent(): void
    {
        $payment = $this->makePayment();
        $n1 = $this->invoices->assignNumber($payment);
        $n2 = $this->invoices->assignNumber($payment);

        $this->assertEquals($n1, $n2);
    }

    // ── VAT computation ───────────────────────────────────────────────────────

    public function test_compute_vat_20_percent(): void
    {
        $payment = $this->makePayment(240.0);
        $this->invoices->computeAndSaveVAT($payment);
        $payment->refresh();

        // 240 TTC → net = 200, vat = 40
        $this->assertEquals(20.0,  (float)$payment->vat_rate);
        $this->assertEqualsWithDelta(40.0,  (float)$payment->vat_amount, 0.01);
        $this->assertEqualsWithDelta(200.0, (float)$payment->net_amount,  0.01);
    }

    public function test_vat_net_plus_vat_equals_gross(): void
    {
        $payment = $this->makePayment(360.0);
        $this->invoices->computeAndSaveVAT($payment);
        $payment->refresh();

        $total = (float)$payment->net_amount + (float)$payment->vat_amount;
        $this->assertEqualsWithDelta(360.0, $total, 0.02);
    }

    // ── HTML generation ───────────────────────────────────────────────────────

    public function test_generate_html_contains_invoice_number(): void
    {
        $payment = $this->makePayment();
        $this->invoices->assignNumber($payment);
        $this->invoices->computeAndSaveVAT($payment);
        $payment->refresh()->load('plan', 'autoSchool');

        $html = $this->invoices->generateHtml($payment);

        $this->assertStringContainsString($payment->invoice_number, $html);
        $this->assertStringContainsString('MAD', $html);
        $this->assertStringContainsString('TVA', $html);
    }

    public function test_generate_html_contains_school_name(): void
    {
        $payment = $this->makePayment();
        $this->invoices->assignNumber($payment);
        $this->invoices->computeAndSaveVAT($payment);
        $payment->refresh()->load('plan', 'autoSchool');

        $html = $this->invoices->generateHtml($payment);

        $this->assertStringContainsString($this->school->name, $html);
    }

    public function test_generate_html_has_print_css(): void
    {
        $payment = $this->makePayment();
        $this->invoices->assignNumber($payment);
        $payment->refresh()->load('plan', 'autoSchool');

        $html = $this->invoices->generateHtml($payment);

        $this->assertStringContainsString('@media print', $html);
        $this->assertStringContainsString('window.print', $html);
    }

    // ── Download endpoint ─────────────────────────────────────────────────────

    public function test_school_can_download_own_invoice(): void
    {
        $payment = $this->makePayment();
        $this->invoices->assignNumber($payment);
        $this->invoices->computeAndSaveVAT($payment);

        $response = $this->actingAs($this->owner)
            ->get(route('school.invoices.download', $payment->id));

        $response->assertStatus(200);
        $response->assertHeader('Content-Type', 'text/html; charset=UTF-8');
    }

    public function test_school_cannot_download_another_schools_invoice(): void
    {
        $otherUser   = User::factory()->create(['role' => 'school_owner']);
        $otherSchool = AutoSchool::factory()->create(['user_id' => $otherUser->id]);
        $otherPayment = Payment::create([
            'auto_school_id'           => $otherSchool->id,
            'plan_id'                  => $this->plan->id,
            'amount'                   => 100.00,
            'status'                   => 'success',
            'currency'                 => 'MAD',
            'stripe_payment_intent_id' => 'pi_other_' . uniqid(),
            'paid_at'                  => now(),
        ]);

        $response = $this->actingAs($this->owner)
            ->get(route('school.invoices.download', $otherPayment->id));

        $response->assertStatus(403);
    }

    public function test_invoice_list_is_paginated(): void
    {
        for ($i = 0; $i < 5; $i++) {
            $p = $this->makePayment();
            $this->invoices->assignNumber($p);
        }

        $response = $this->actingAs($this->owner)
            ->get(route('school.invoices.index'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($p) => $p->component('SchoolDashboard/Invoices')->has('invoices'));
    }
}
