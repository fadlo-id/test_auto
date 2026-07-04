<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\AutoSchool;
use App\Models\CreditBalance;
use App\Models\CreditTransaction;
use App\Services\CreditService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CreditManagementController extends Controller
{
    public function __construct(private CreditService $credits) {}

    public function index(Request $request): Response
    {
        $query = AutoSchool::query()
            ->with(['activeSubscription.plan', 'user:id,name,email', 'creditBalances'])
            ->select(['id', 'user_id', 'name', 'slug', 'city', 'logo_url',
                'is_active', 'status', 'credits_exhausted', 'credits_reset_at'])
            ->withMax('creditTransactions as last_activity', 'created_at');

        if ($search = $request->string('search')->trim()->toString()) {
            $query->where(fn ($q) => $q->where('name', 'like', "%$search%")->orWhere('city', 'like', "%$search%"));
        }

        match ($request->input('filter')) {
            'exhausted' => $query->where('credits_exhausted', true),
            'low'       => $query->whereHas('creditBalances', fn ($q) =>
                $q->where('is_unlimited', false)->where('is_blocked', false)->where('balance', '>', 0)->whereRaw('balance / 30 <= 0.2')
            ),
            'blocked'   => $query->whereHas('creditBalances', fn ($q) => $q->where('is_blocked', true)),
            'suspended' => $query->where('is_active', false),
            'unlimited' => $query->whereHas('creditBalances', fn ($q) => $q->where('is_unlimited', true)),
            default     => null,
        };

        $schools = $query->orderByDesc('credits_exhausted')
            ->orderByDesc('is_active')
            ->orderBy('name')
            ->paginate(25)
            ->withQueryString()
            ->through(fn ($s) => $this->transformSchool($s));

        $base = AutoSchool::query();

        $stats = [
            'total'     => (clone $base)->count(),
            'exhausted' => (clone $base)->where('credits_exhausted', true)->count(),
            'suspended' => (clone $base)->where('is_active', false)->count(),
            'unlimited' => (clone $base)->whereHas('creditBalances', fn ($q) => $q->where('is_unlimited', true))->count(),
            'blocked'   => (clone $base)->whereHas('creditBalances', fn ($q) => $q->where('is_blocked', true))->count(),
            'low'       => (clone $base)->where('credits_exhausted', false)->whereHas('creditBalances', fn ($q) =>
                $q->where('credit_type', 'view')->where('is_unlimited', false)->whereRaw('balance <= 60'))->count(),
        ];

        return Inertia::render('Admin/CreditManagement', [
            'schools' => $schools,
            'filters' => [
                'search' => $request->input('search', ''),
                'filter' => $request->input('filter', ''),
            ],
            'stats'   => $stats,
            'types'   => CreditBalance::LABELS,
        ]);
    }

    public function show(AutoSchool $school): Response
    {
        $school->load(['activeSubscription.plan', 'user:id,name,email']);

        $transactions = CreditTransaction::where('auto_school_id', $school->id)
            ->with('performer:id,name')
            ->orderByDesc('created_at')
            ->paginate(40)
            ->through(fn (CreditTransaction $tx) => [
                'id'              => $tx->id,
                'credit_type'     => $tx->credit_type,
                'action'          => $tx->action,
                'amount'          => $tx->amount,
                'balance_before'  => $tx->balance_before,
                'balance_after'   => $tx->balance_after,
                'reason'          => $tx->reason,
                'notes'           => $tx->notes,
                'performer'       => $tx->performer ? ['name' => $tx->performer->name] : null,
                'created_at'      => $tx->created_at?->toISOString(),
                'is_rollbackable' => $tx->isRollbackable(),
                'rolled_back_at'  => $tx->rolled_back_at?->toISOString(),
                'rollback_of_id'  => $tx->rollback_of_id,
            ]);

        return Inertia::render('Admin/CreditDetail', [
            'school'       => $this->transformSchool($school),
            'summary'      => $this->credits->getSummary($school),
            'transactions' => $transactions,
            'chart_data'   => $this->credits->getChartData($school, 30),
            'types'        => CreditBalance::LABELS,
        ]);
    }

    // ── Per-type credit operations ────────────────────────────────────────────

    public function add(Request $request, AutoSchool $school): RedirectResponse
    {
        $data = $request->validate([
            'type'   => 'required|string|in:' . implode(',', CreditBalance::TYPES),
            'amount' => 'required|integer|min:1|max:999999',
            'notes'  => 'nullable|string|max:500',
        ]);

        $this->credits->add($school, $data['type'], $data['amount'], auth()->user(), $data['notes'] ?? '');
        AuditLog::record('credits.added', $school, $data);

        $label = CreditBalance::LABELS[$data['type']] ?? $data['type'];
        return back()->with('success', "+{$data['amount']} crédits {$label} pour «{$school->name}».");
    }

    public function remove(Request $request, AutoSchool $school): RedirectResponse
    {
        $data = $request->validate([
            'type'   => 'required|string|in:' . implode(',', CreditBalance::TYPES),
            'amount' => 'required|integer|min:1|max:999999',
            'notes'  => 'nullable|string|max:500',
        ]);

        $this->credits->remove($school, $data['type'], $data['amount'], auth()->user(), $data['notes'] ?? '');
        AuditLog::record('credits.removed', $school, $data);

        $label = CreditBalance::LABELS[$data['type']] ?? $data['type'];
        return back()->with('success', "-{$data['amount']} crédits {$label} pour «{$school->name}».");
    }

    public function reset(Request $request, AutoSchool $school): RedirectResponse
    {
        $data = $request->validate([
            'type' => 'nullable|string|in:' . implode(',', CreditBalance::TYPES),
        ]);

        $plan = $school->activeSubscription()->with('plan')->first()?->plan;

        if (! $plan) {
            $this->credits->resetToFreeQuota($school, auth()->user());
            AuditLog::record('credits.reset', $school, ['plan' => 'Gratuit']);
            return back()->with('success', 'Crédits réinitialisés (tier gratuit).');
        }

        $type = $data['type'] ?? null;
        $this->credits->reset($school, $type, $plan, auth()->user());
        AuditLog::record('credits.reset', $school, ['type' => $type ?? 'all', 'plan' => $plan->name]);

        $label = $type ? (CreditBalance::LABELS[$type] ?? $type) : 'tous les types';
        return back()->with('success', "Crédits {$label} réinitialisés selon «{$plan->name}».");
    }

    public function setUnlimited(Request $request, AutoSchool $school): RedirectResponse
    {
        $data = $request->validate([
            'type' => 'nullable|string|in:' . implode(',', CreditBalance::TYPES),
        ]);

        $this->credits->setUnlimited($school, $data['type'] ?? null, auth()->user());
        AuditLog::record('credits.unlimited', $school, $data);

        $label = isset($data['type']) ? (CreditBalance::LABELS[$data['type']] ?? $data['type']) : 'tous les types';
        return back()->with('success', "Crédits {$label} définis comme illimités pour «{$school->name}».");
    }

    public function removeUnlimited(Request $request, AutoSchool $school): RedirectResponse
    {
        $data = $request->validate([
            'type' => 'nullable|string|in:' . implode(',', CreditBalance::TYPES),
        ]);

        $plan = $school->activeSubscription()->with('plan')->first()?->plan;

        if (! $plan) {
            return back()->with('error', 'Aucun plan actif — impossible de définir un quota.');
        }

        $this->credits->removeUnlimited($school, $data['type'] ?? null, $plan, auth()->user());
        AuditLog::record('credits.remove_unlimited', $school, $data);

        return back()->with('success', "Mode illimité désactivé pour «{$school->name}».");
    }

    public function block(Request $request, AutoSchool $school): RedirectResponse
    {
        $data = $request->validate([
            'type'   => 'nullable|string|in:' . implode(',', CreditBalance::TYPES),
            'reason' => 'nullable|string|max:500',
        ]);

        $this->credits->block($school, $data['type'] ?? null, auth()->user(), $data['reason'] ?? '');
        AuditLog::record('credits.blocked', $school, $data);

        $label = isset($data['type']) ? (CreditBalance::LABELS[$data['type']] ?? $data['type']) : 'tous les types';
        return back()->with('success', "Crédits {$label} bloqués pour «{$school->name}».");
    }

    public function unblock(Request $request, AutoSchool $school): RedirectResponse
    {
        $data = $request->validate([
            'type' => 'nullable|string|in:' . implode(',', CreditBalance::TYPES),
        ]);

        $this->credits->unblock($school, $data['type'] ?? null, auth()->user());
        AuditLog::record('credits.unblocked', $school, $data);

        $label = isset($data['type']) ? (CreditBalance::LABELS[$data['type']] ?? $data['type']) : 'tous les types';
        return back()->with('success', "Crédits {$label} débloqués pour «{$school->name}».");
    }

    public function reactivate(AutoSchool $school): RedirectResponse
    {
        $this->credits->reactivate($school, auth()->user());
        AuditLog::record('credits.reactivated', $school);
        return back()->with('success', "École «{$school->name}» réactivée (flag épuisement levé).");
    }

    public function suspend(Request $request, AutoSchool $school): RedirectResponse
    {
        $data = $request->validate(['reason' => 'nullable|string|max:500']);
        $this->credits->suspendSchool($school, auth()->user(), $data['reason'] ?? '');
        AuditLog::record('school.suspended', $school, ['reason' => $data['reason'] ?? '']);
        return back()->with('success', "École «{$school->name}» suspendue.");
    }

    public function unsuspend(AutoSchool $school): RedirectResponse
    {
        $this->credits->unsuspendSchool($school, auth()->user());
        AuditLog::record('school.unsuspended', $school);
        return back()->with('success', "École «{$school->name}» désuspendue.");
    }

    /** Reverse a single credit transaction (add/remove/reset/... — never a raw visitor consumption). */
    public function rollback(AutoSchool $school, CreditTransaction $transaction): RedirectResponse
    {
        abort_if($transaction->auto_school_id !== $school->id, 404);

        if (! $transaction->isRollbackable()) {
            return back()->with('error', 'Cette transaction ne peut pas être annulée.');
        }

        $this->credits->rollbackTransaction($transaction, auth()->user());
        AuditLog::record('credits.rolled_back', $school, ['transaction_id' => $transaction->id, 'action' => $transaction->action]);

        return back()->with('success', "Transaction #{$transaction->id} annulée.");
    }

    // ── Transform ─────────────────────────────────────────────────────────────

    private function transformSchool(AutoSchool $s): array
    {
        $balancesCollection = $s->relationLoaded('creditBalances')
            ? $s->creditBalances
            : $s->creditBalances()->get();

        $balances = [];
        foreach (CreditBalance::TYPES as $type) {
            $b = $balancesCollection->firstWhere('credit_type', $type);
            $balances[$type] = $b ? [
                'balance'      => $b->is_unlimited ? null : $b->balance,
                'is_unlimited' => $b->is_unlimited,
                'is_blocked'   => $b->is_blocked,
                'is_exhausted' => $b->isExhausted(),
            ] : [
                'balance'      => CreditService::FREE_QUOTAS[$type] ?? 0,
                'is_unlimited' => false,
                'is_blocked'   => false,
                'is_exhausted' => false,
            ];
        }

        $sub  = $s->relationLoaded('activeSubscription') ? $s->activeSubscription : null;
        $plan = $sub?->plan;

        $hasAnyExhausted = collect($balances)->contains(fn ($b) => $b['is_exhausted']);
        $hasAnyBlocked   = collect($balances)->contains(fn ($b) => $b['is_blocked']);
        $hasAnyUnlimited = collect($balances)->contains(fn ($b) => $b['is_unlimited']);
        $viewBalance     = $balances['view']['balance'] ?? 0;
        $viewTotal       = $plan ? ($plan->getQuota('view') ?? null) : CreditService::FREE_QUOTAS['view'];
        $viewPct         = ($viewTotal && $viewBalance !== null) ? round($viewBalance / $viewTotal * 100) : null;
        $isCritical      = $viewPct !== null && (100 - $viewPct) >= 80;

        return [
            'id'               => $s->id,
            'name'             => $s->name,
            'city'             => $s->city,
            'slug'             => $s->slug,
            'logo_url'         => $s->logo_url,
            'is_active'        => $s->is_active,
            'status'           => $s->status,
            'credits_exhausted'=> $s->credits_exhausted,
            'credits_reset_at' => $s->credits_reset_at?->toDateString(),
            'last_activity'    => $s->last_activity ?? null,
            'balances'         => $balances,
            'view_balance'     => $viewBalance,
            'view_total'       => $viewTotal,
            'view_pct'         => $viewPct,
            'has_any_exhausted'=> $hasAnyExhausted,
            'has_any_blocked'  => $hasAnyBlocked,
            'has_any_unlimited'=> $hasAnyUnlimited,
            'is_critical'      => $isCritical,
            'plan_name'        => $plan?->name ?? 'Gratuit',
            'sub_status'       => $sub?->status ?? 'none',
            'sub_expires_at'   => $sub?->expires_at?->toDateString(),
        ];
    }
}
