<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AnalyticsDailyStat;
use App\Models\AutoSchool;
use App\Models\Category;
use App\Models\ContactRequest;
use App\Models\Payment;
use App\Models\Review;
use App\Models\Subscription;
use App\Models\User;
use Carbon\Carbon;
use Carbon\CarbonPeriod;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\StreamedResponse;

class DashboardController extends Controller
{
    // ── Helpers ───────────────────────────────────────────────────────────────

    private function isSqlite(): bool
    {
        return DB::getDriverName() === 'sqlite';
    }

    private function monthExpr(string $col = 'created_at'): string
    {
        return $this->isSqlite()
            ? "strftime('%Y-%m', {$col}) as month"
            : "DATE_FORMAT({$col}, '%Y-%m') as month";
    }

    private function dayExpr(string $col = 'created_at'): string
    {
        return $this->isSqlite()
            ? "date({$col}) as day"
            : "DATE({$col}) as day";
    }

    private function growthPct(int|float $current, int|float $previous): float|null
    {
        if ($previous == 0) return $current > 0 ? 100.0 : null;
        return round((($current - $previous) / $previous) * 100, 1);
    }

    // ── Core KPI computation (called fresh each cache cycle) ──────────────────

    private function computeKpis(Carbon $now): array
    {
        $monthStart     = $now->copy()->startOfMonth();
        $prevMonthStart = $now->copy()->subMonth()->startOfMonth();
        $prevMonthEnd   = $now->copy()->subMonth()->endOfMonth();
        $yearStart      = $now->copy()->startOfYear();
        $weekStart      = $now->copy()->startOfWeek();
        $todayStart     = $now->copy()->startOfDay();

        // Revenue: single pass over payments table
        if ($this->isSqlite()) {
            $revRow = DB::selectOne("
                SELECT
                    SUM(CASE WHEN status='success' THEN amount ELSE 0 END) AS total,
                    SUM(CASE WHEN status='success' AND created_at >= ? THEN amount ELSE 0 END) AS today,
                    SUM(CASE WHEN status='success' AND created_at >= ? THEN amount ELSE 0 END) AS week,
                    SUM(CASE WHEN status='success' AND created_at >= ? THEN amount ELSE 0 END) AS month,
                    SUM(CASE WHEN status='success' AND created_at >= ? THEN amount ELSE 0 END) AS year,
                    SUM(CASE WHEN status='success' AND created_at BETWEEN ? AND ? THEN amount ELSE 0 END) AS prev_month
                FROM payments
            ", [$todayStart, $weekStart, $monthStart, $yearStart, $prevMonthStart, $prevMonthEnd]);
        } else {
            $revRow = DB::selectOne("
                SELECT
                    SUM(IF(status='success', amount, 0)) AS total,
                    SUM(IF(status='success' AND created_at >= ?, amount, 0)) AS today,
                    SUM(IF(status='success' AND created_at >= ?, amount, 0)) AS week,
                    SUM(IF(status='success' AND created_at >= ?, amount, 0)) AS month,
                    SUM(IF(status='success' AND created_at >= ?, amount, 0)) AS year,
                    SUM(IF(status='success' AND created_at BETWEEN ? AND ?, amount, 0)) AS prev_month
                FROM payments
            ", [$todayStart, $weekStart, $monthStart, $yearStart, $prevMonthStart, $prevMonthEnd]);
        }

        // Users & schools in one query each
        $userRow = DB::selectOne("
            SELECT COUNT(*) AS total,
                   SUM(CASE WHEN created_at >= ? THEN 1 ELSE 0 END) AS this_month,
                   SUM(CASE WHEN created_at BETWEEN ? AND ? THEN 1 ELSE 0 END) AS prev_month
            FROM users
        ", [$monthStart, $prevMonthStart, $prevMonthEnd]);

        $schoolRow = DB::selectOne("
            SELECT COUNT(*) AS total,
                   SUM(CASE WHEN status='pending' THEN 1 ELSE 0 END) AS pending,
                   SUM(CASE WHEN created_at >= ? THEN 1 ELSE 0 END) AS this_month,
                   SUM(CASE WHEN created_at BETWEEN ? AND ? THEN 1 ELSE 0 END) AS prev_month
            FROM auto_schools WHERE deleted_at IS NULL
        ", [$monthStart, $prevMonthStart, $prevMonthEnd]);

        // MRR: normalized monthly revenue from active subscriptions
        $mrrRow = DB::selectOne(
            "SELECT SUM(
                CASE WHEN plans.billing_period='monthly' THEN plans.price
                     WHEN plans.billing_period='yearly'  THEN plans.price / 12
                     ELSE 0
                END
             ) AS mrr
             FROM subscriptions
             JOIN plans ON plans.id = subscriptions.plan_id
             WHERE subscriptions.status = 'active'
               AND subscriptions.expires_at > ?",
            [$now]
        );

        // Active subscriptions
        $activeSubs = Subscription::where('status', 'active')->where('expires_at', '>', $now)->count();

        // Churn: expired + cancelled this month vs active at start of month
        $churnExpired   = Subscription::where('status', 'active')
            ->whereBetween('expires_at', [$monthStart, $now])
            ->count();
        $churnCancelled = Subscription::where('status', 'cancelled')
            ->where('cancelled_at', '>=', $monthStart)
            ->count();
        $activeLastMonth = Subscription::where('status', 'active')
            ->where('started_at', '<', $monthStart)
            ->count();

        // Renewal rate: schools with >1 payment / schools with ≥1 payment
        $totalPayers = DB::table('payments')
            ->where('status', 'success')
            ->distinct('auto_school_id')
            ->count('auto_school_id');
        $renewedPayers = DB::table('payments')
            ->where('status', 'success')
            ->select('auto_school_id')
            ->groupBy('auto_school_id')
            ->havingRaw('COUNT(*) > 1')
            ->get()->count();

        $mrr          = (float)($mrrRow->mrr          ?? 0);
        $revMonth     = (float)($revRow->month         ?? 0);
        $revPrevMonth = (float)($revRow->prev_month    ?? 0);
        $usersNow     = (int)  ($userRow->this_month   ?? 0);
        $usersPrev    = (int)  ($userRow->prev_month   ?? 0);
        $schoolsNow   = (int)  ($schoolRow->this_month ?? 0);
        $schoolsPrev  = (int)  ($schoolRow->prev_month ?? 0);
        $churnTotal   = $churnExpired + $churnCancelled;
        $totalSchools = (int)  ($schoolRow->total      ?? 0);

        return [
            // Counters
            'total_users'          => (int)($userRow->total    ?? 0),
            'total_schools'        => $totalSchools,
            'pending_schools'      => (int)($schoolRow->pending ?? 0),
            'active_subscriptions' => $activeSubs,
            'total_revenue'        => (float)($revRow->total   ?? 0),
            'pending_reviews'      => Review::where('status', 'pending')->count(),
            'unread_contacts'      => ContactRequest::where('status', 'new')->count(),

            // Revenue breakdown
            'rev_today'      => (float)($revRow->today ?? 0),
            'rev_week'       => (float)($revRow->week  ?? 0),
            'rev_month'      => $revMonth,
            'rev_year'       => (float)($revRow->year  ?? 0),
            'rev_prev_month' => $revPrevMonth,

            // SaaS metrics
            'mrr'              => round($mrr, 2),
            'arr'              => round($mrr * 12, 2),
            'churn_rate'       => $activeLastMonth > 0 ? round($churnTotal / $activeLastMonth * 100, 1) : 0.0,
            'churn_count'      => $churnTotal,
            'conversion_rate'  => $totalSchools > 0 ? round($activeSubs / $totalSchools * 100, 1) : 0.0,
            'renewal_rate'     => $totalPayers > 0 ? round($renewedPayers / $totalPayers * 100, 1) : 0.0,
            'renewals_count'   => $renewedPayers,

            // Growth
            'users_this_month'   => $usersNow,
            'users_prev_month'   => $usersPrev,
            'users_growth'       => $this->growthPct($usersNow,   $usersPrev),
            'schools_this_month' => $schoolsNow,
            'schools_prev_month' => $schoolsPrev,
            'schools_growth'     => $this->growthPct($schoolsNow, $schoolsPrev),
            'revenue_growth'     => $this->growthPct($revMonth,   $revPrevMonth),
        ];
    }

    // ── Heatmap: 52-week calendar (GitHub-style) ──────────────────────────────

    private function computeHeatmap(): array
    {
        $startDate = now()->subWeeks(52)->startOfWeek(Carbon::SUNDAY)->toDateString();
        $epoch     = Carbon::parse($startDate)->startOfWeek(Carbon::SUNDAY);

        // Try analytics stats first (views + clicks), fall back to payment activity
        $rows = AnalyticsDailyStat::selectRaw(
            ($this->isSqlite() ? "date" : "date") . ", SUM(total_views) + SUM(total_clicks) as count"
        )->where('date', '>=', $startDate)->groupBy('date')->get()->keyBy('date');

        if ($rows->isEmpty()) {
            $rows = Payment::selectRaw($this->dayExpr() . ', COUNT(*) as count')
                ->where('status', 'success')
                ->where('created_at', '>=', $startDate)
                ->groupBy('day')
                ->get()
                ->keyBy('day');
        }

        $result = [];
        foreach (CarbonPeriod::create($startDate, now()->toDateString()) as $day) {
            $dateStr = $day->toDateString();
            $result[] = [
                'date'  => $dateStr,
                'count' => (int)($rows[$dateStr]->count ?? 0),
                'week'  => (int) floor($epoch->diffInDays($day) / 7),
                'dow'   => $day->dayOfWeek,
            ];
        }

        return $result;
    }

    // ── Routes ────────────────────────────────────────────────────────────────

    public function index(): \Inertia\Response
    {
        $now          = Carbon::now();
        $last12Months = $now->copy()->subMonths(12)->startOfMonth();

        $stats = Cache::remember('admin.dashboard.stats.v3', 300, fn () => $this->computeKpis($now));

        [$monthlyUsers, $monthlyRevenue, $monthlySchools] = Cache::remember(
            'admin.dashboard.charts.v3', 3600,
            fn () => [
                User::selectRaw($this->monthExpr() . ', COUNT(*) as count')
                    ->where('created_at', '>=', $last12Months)
                    ->groupBy('month')->orderBy('month')->get(),
                Payment::selectRaw($this->monthExpr() . ', SUM(amount) as revenue, COUNT(*) as count')
                    ->where('status', 'success')
                    ->where('created_at', '>=', $last12Months)
                    ->groupBy('month')->orderBy('month')->get(),
                AutoSchool::selectRaw($this->monthExpr() . ', COUNT(*) as count')
                    ->where('created_at', '>=', $last12Months)
                    ->groupBy('month')->orderBy('month')->get(),
            ]
        );

        [$subscriptionBreakdown, $cityBreakdown] = Cache::remember(
            'admin.dashboard.breakdowns.v3', 1800,
            fn () => [
                Subscription::selectRaw('plan_id, COUNT(*) as count')
                    ->with('plan:id,name')
                    ->where('status', 'active')
                    ->where('expires_at', '>', now())
                    ->groupBy('plan_id')->get()
                    ->map(fn ($s) => ['name' => $s->plan?->name ?? 'Inconnu', 'count' => $s->count]),
                AutoSchool::active()
                    ->selectRaw('city, COUNT(*) as count')
                    ->groupBy('city')->orderByDesc('count')->take(10)->get(),
            ]
        );

        $topSchools = Cache::remember('admin.dashboard.top_schools.v3', 1800, function () {
            return AutoSchool::select('auto_schools.id', 'auto_schools.name', 'auto_schools.city')
                ->join('payments', 'payments.auto_school_id', '=', 'auto_schools.id')
                ->where('payments.status', 'success')
                ->groupBy('auto_schools.id', 'auto_schools.name', 'auto_schools.city')
                ->selectRaw('SUM(payments.amount) as total_revenue, COUNT(payments.id) as payment_count')
                ->orderByDesc('total_revenue')
                ->take(10)
                ->get();
        });

        $topCategories = Cache::remember('admin.dashboard.top_categories.v3', 3600, function () {
            return Category::select('categories.id', 'categories.name_fr', 'categories.code')
                ->join('school_categories', 'school_categories.category_id', '=', 'categories.id')
                ->join('auto_schools', function ($j) {
                    $j->on('auto_schools.id', '=', 'school_categories.auto_school_id')
                      ->where('auto_schools.status', 'approved')
                      ->where('auto_schools.is_active', true)
                      ->whereNull('auto_schools.deleted_at');
                })
                ->groupBy('categories.id', 'categories.name_fr', 'categories.code')
                ->selectRaw('COUNT(DISTINCT auto_schools.id) as school_count')
                ->orderByDesc('school_count')
                ->take(8)
                ->get();
        });

        $heatmap = Cache::remember('admin.dashboard.heatmap.v3', 14400, fn () => $this->computeHeatmap());

        [$recentSchools, $recentPayments] = Cache::remember('admin.dashboard.recent.v1', 60, fn () => [
            AutoSchool::with('user:id,name,email')
                ->latest()->take(6)->get(['id', 'name', 'city', 'status', 'created_at', 'user_id']),
            Payment::with(['autoSchool:id,name', 'plan:id,name'])
                ->where('status', 'success')
                ->latest()->take(6)->get(['id', 'auto_school_id', 'plan_id', 'amount', 'created_at']),
        ]);

        $pendingActions = [
            'schools'  => $stats['pending_schools'],
            'reviews'  => $stats['pending_reviews'],
            'contacts' => $stats['unread_contacts'],
        ];

        return Inertia::render('Admin/Dashboard', compact(
            'stats', 'monthlyUsers', 'monthlyRevenue', 'monthlySchools',
            'subscriptionBreakdown', 'cityBreakdown',
            'topSchools', 'topCategories', 'heatmap',
            'recentSchools', 'recentPayments', 'pendingActions'
        ));
    }

    /** Fresh counts for real-time polling — no cache. */
    public function live(): JsonResponse
    {
        return response()->json([
            'active_subscriptions' => Subscription::where('status', 'active')->where('expires_at', '>', now())->count(),
            'pending_schools'      => AutoSchool::where('status', 'pending')->whereNull('deleted_at')->count(),
            'pending_reviews'      => Review::where('status', 'pending')->count(),
            'unread_contacts'      => ContactRequest::where('status', 'new')->count(),
            'rev_today'            => (float) Payment::where('status', 'success')
                                        ->where('created_at', '>=', now()->startOfDay())
                                        ->sum('amount'),
            'updated_at'           => now()->toIso8601String(),
        ]);
    }

    /** CSV / Excel download (no external packages). */
    public function export(Request $request): StreamedResponse|Response
    {
        $stats = $this->computeKpis(Carbon::now());

        $rows = [
            ['Métrique',                      'Valeur',                               'Unité'],
            ['Revenu Total',                  number_format($stats['total_revenue'],   2, ',', ' '), 'MAD'],
            ['MRR (Mensuel récurrent)',        number_format($stats['mrr'],             2, ',', ' '), 'MAD'],
            ['ARR (Annuel récurrent)',         number_format($stats['arr'],             2, ',', ' '), 'MAD'],
            ['Revenu Ce Mois',                number_format($stats['rev_month'],        2, ',', ' '), 'MAD'],
            ['Revenu Cette Semaine',          number_format($stats['rev_week'],         2, ',', ' '), 'MAD'],
            ["Revenu Aujourd'hui",            number_format($stats['rev_today'],        2, ',', ' '), 'MAD'],
            ['Revenu Cette Année',            number_format($stats['rev_year'],         2, ',', ' '), 'MAD'],
            ['Abonnements Actifs',            $stats['active_subscriptions'],          ''],
            ['Taux de Conversion',            number_format($stats['conversion_rate'], 1, ',', ''), '%'],
            ['Taux de Churn',                 number_format($stats['churn_rate'],      1, ',', ''), '%'],
            ['Taux de Renouvellement',        number_format($stats['renewal_rate'],    1, ',', ''), '%'],
            ['Résiliations Ce Mois',          $stats['churn_count'],                  ''],
            ['Renouvellements (historique)',  $stats['renewals_count'],               ''],
            ['Utilisateurs Total',            $stats['total_users'],                  ''],
            ['Nouveaux Utilisateurs Ce Mois', $stats['users_this_month'],             ''],
            ['Auto-Écoles Total',             $stats['total_schools'],                ''],
            ['Nouvelles Écoles Ce Mois',      $stats['schools_this_month'],           ''],
            ['Écoles En Attente',             $stats['pending_schools'],              ''],
            ['Avis En Attente',              $stats['pending_reviews'],              ''],
        ];

        return $request->input('format') === 'excel'
            ? $this->exportExcel($rows)
            : $this->exportCsv($rows);
    }

    private function exportCsv(array $rows): StreamedResponse
    {
        return response()->streamDownload(function () use ($rows) {
            $f = fopen('php://output', 'w');
            fputs($f, "\xEF\xBB\xBF"); // UTF-8 BOM for Excel
            foreach ($rows as $row) {
                fputcsv($f, $row, ';');
            }
            fclose($f);
        }, 'dashboard_' . now()->format('Y-m-d') . '.csv', [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }

    private function exportExcel(array $rows): Response
    {
        $xml  = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n";
        $xml .= "<Workbook xmlns=\"urn:schemas-microsoft-com:office:spreadsheet\" ";
        $xml .= "xmlns:ss=\"urn:schemas-microsoft-com:office:spreadsheet\">\n";
        $xml .= "<Worksheet ss:Name=\"Dashboard\"><Table>\n";
        foreach ($rows as $i => $row) {
            $xml .= '<Row>';
            foreach ($row as $cell) {
                $val   = htmlspecialchars((string) $cell, ENT_XML1 | ENT_QUOTES, 'UTF-8');
                $type  = ($i > 0 && is_numeric(str_replace([',', ' '], '.', $val))) ? 'Number' : 'String';
                $numVal = $type === 'Number' ? str_replace([',', ' '], ['.', ''], $val) : $val;
                $xml  .= "<Cell><Data ss:Type=\"{$type}\">{$numVal}</Data></Cell>";
            }
            $xml .= "</Row>\n";
        }
        $xml .= "</Table></Worksheet></Workbook>";

        return response($xml, 200, [
            'Content-Type'        => 'application/vnd.ms-excel',
            'Content-Disposition' => 'attachment; filename="dashboard_' . now()->format('Y-m-d') . '.xlsx"',
        ]);
    }
}
