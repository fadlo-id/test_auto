<?php

namespace App\Http\Controllers\Admin\Crm;

use App\Http\Controllers\Controller;
use App\Models\CrmPipelineStage;
use App\Models\CrmProspect;
use App\Models\CrmReminder;
use App\Services\CrmService;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class CrmDashboardController extends Controller
{
    public function __construct(private CrmService $crm) {}

    public function index(): Response
    {
        $funnel = $this->crm->funnelStats();

        // Prospects by stage
        $byStage = CrmPipelineStage::withCount('prospects')
            ->orderBy('order')
            ->get()
            ->map(fn ($s) => [
                'id'    => $s->id,
                'name'  => $s->name,
                'color' => $s->color,
                'count' => $s->prospects_count,
            ]);

        // Prospects by source
        $bySource = CrmProspect::select('source', DB::raw('count(*) as total'))
            ->groupBy('source')
            ->pluck('total', 'source');

        // Monthly new prospects (last 6 months)
        $monthExpr = DB::getDriverName() === 'sqlite'
            ? "strftime('%Y-%m', created_at) as month"
            : "DATE_FORMAT(created_at, '%Y-%m') as month";

        $monthly = CrmProspect::select(
            DB::raw($monthExpr),
            DB::raw('count(*) as total')
        )
            ->where('created_at', '>=', now()->subMonths(6))
            ->groupBy('month')
            ->orderBy('month')
            ->pluck('total', 'month');

        // Due reminders (today + overdue)
        $dueReminders = CrmReminder::with(['prospect', 'assignedTo'])
            ->where('status', 'pending')
            ->where('due_at', '<=', now()->endOfDay())
            ->orderBy('due_at')
            ->limit(10)
            ->get()
            ->map(fn ($r) => [
                'id'           => $r->id,
                'title'        => $r->title,
                'due_at'       => $r->due_at,
                'is_overdue'   => $r->isOverdue(),
                'prospect'     => ['id' => $r->prospect?->id, 'name' => $r->prospect?->name],
                'assigned_to'  => ['name' => $r->assignedTo?->name],
            ]);

        // Recent prospects
        $recent = CrmProspect::with(['stage', 'assignedTo', 'tags'])
            ->latest()
            ->limit(8)
            ->get()
            ->map(fn ($p) => [
                'id'         => $p->id,
                'name'       => $p->name,
                'email'      => $p->email,
                'phone'      => $p->phone,
                'source'     => $p->source,
                'status'     => $p->status,
                'score'      => $p->score,
                'stage'      => $p->stage ? ['name' => $p->stage->name, 'color' => $p->stage->color] : null,
                'assigned_to'=> $p->assignedTo ? ['name' => $p->assignedTo->name] : null,
                'tags'       => $p->tags->map(fn ($t) => ['name' => $t->name, 'color' => $t->color]),
                'created_at' => $p->created_at,
            ]);

        // Overdue count
        $overdueCount = CrmReminder::where('status', 'pending')
            ->where('due_at', '<', now())
            ->count();

        return Inertia::render('Admin/CRM/Dashboard', [
            'stats' => [
                ...$funnel,
                'reminders_due_today' => CrmReminder::where('status', 'pending')
                    ->whereDate('due_at', today())
                    ->count(),
                'reminders_overdue'   => $overdueCount,
                'added_this_month'    => CrmProspect::whereMonth('created_at', now()->month)
                    ->whereYear('created_at', now()->year)
                    ->count(),
            ],
            'by_stage'      => $byStage,
            'by_source'     => $bySource,
            'monthly'       => $monthly,
            'due_reminders' => $dueReminders,
            'recent'        => $recent,
        ]);
    }
}
