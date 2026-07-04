<?php

namespace App\Services;

use App\Models\AutoSchool;
use App\Models\Booking;
use App\Models\ClickEvent;
use App\Models\LeadEvent;
use App\Models\Payment;
use App\Models\ViewEvent;
use Carbon\Carbon;
use Carbon\CarbonPeriod;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Collection;

/**
 * Cross-dashboard analytics reporting service. Reads raw event/payment/booking
 * tables directly (rather than the pre-aggregated daily/monthly tables) so
 * numbers are always correct for an arbitrary date range.
 *
 * $schoolId = null means platform-wide (admin only); a school id scopes
 * every query to that single school (used by both admin drill-down and the
 * school dashboard).
 */
class EnterpriseAnalyticsService
{
    public function __construct(
        private ?int $schoolId,
        private Carbon $start,
        private Carbon $end,
    ) {
    }

    // ── SQL portability helpers (sqlite in tests, mysql in prod) ───────────

    private function dateExpr(string $column = 'created_at'): string
    {
        return DB::getDriverName() === 'sqlite'
            ? "strftime('%Y-%m-%d', {$column})"
            : "DATE({$column})";
    }

    private function monthExpr(string $column = 'created_at'): string
    {
        return DB::getDriverName() === 'sqlite'
            ? "strftime('%Y-%m', {$column})"
            : "DATE_FORMAT({$column}, '%Y-%m')";
    }

    private function hourExpr(string $column = 'created_at'): string
    {
        return DB::getDriverName() === 'sqlite'
            ? "CAST(strftime('%H', {$column}) AS INTEGER)"
            : "HOUR({$column})";
    }

    /** ISO weekday: 0 = Monday .. 6 = Sunday, consistent across drivers */
    private function weekdayExpr(string $column = 'created_at'): string
    {
        return DB::getDriverName() === 'sqlite'
            ? "CAST(strftime('%w', {$column}) AS INTEGER)"
            : "(DAYOFWEEK({$column}) - 1)";
    }

    private function scopeSchool($query)
    {
        if ($this->schoolId) {
            $query->where('auto_school_id', $this->schoolId);
        }

        return $query;
    }

    private function inRange($query, string $column = 'created_at')
    {
        return $query->whereBetween($column, [$this->start, $this->end]);
    }

    // ── Overview ─────────────────────────────────────────────────────────

    public function overview(): array
    {
        $views  = $this->inRange($this->scopeSchool(ViewEvent::query()))->count();
        $clicks = $this->inRange($this->scopeSchool(ClickEvent::query()))->count();
        $leads  = $this->inRange($this->scopeSchool(LeadEvent::query()))->count();

        $bookingsQuery = Booking::query();
        if ($this->schoolId) {
            $bookingsQuery->where('auto_school_id', $this->schoolId);
        }
        $bookings = $this->inRange($bookingsQuery)->count();

        [$uniqueVisitors, $returningVisitors] = $this->visitorCounts();
        $bounceRate = $this->bounceRate();

        $revenue = null;
        if (! $this->schoolId) {
            $revenue = (float) $this->inRange(Payment::where('status', 'success'), 'created_at')->sum('amount');
        }

        return [
            'views'               => $views,
            'unique_visitors'     => $uniqueVisitors,
            'returning_visitors'  => $returningVisitors,
            'clicks'              => $clicks,
            'leads'               => $leads,
            'bookings'            => $bookings,
            'revenue'             => $revenue,
            'bounce_rate'         => $bounceRate,
            'ctr'                 => $views > 0 ? round($clicks / $views * 100, 2) : 0,
            'conversion_rate'     => $views > 0 ? round($leads / $views * 100, 2) : 0,
        ];
    }

    private function visitorCounts(): array
    {
        $ipsInRange = $this->inRange($this->scopeSchool(ViewEvent::query()))
            ->distinct()
            ->pluck('ip_address');

        $uniqueVisitors = $ipsInRange->count();

        if ($uniqueVisitors === 0) {
            return [0, 0];
        }

        $returningVisitors = $this->scopeSchool(ViewEvent::query())
            ->where('created_at', '<', $this->start)
            ->whereIn('ip_address', $ipsInRange)
            ->distinct()
            ->count('ip_address');

        return [$uniqueVisitors, $returningVisitors];
    }

    public function bounceRate(): float
    {
        $dateExpr = $this->dateExpr();

        $visits = $this->inRange($this->scopeSchool(ViewEvent::query()))
            ->selectRaw("ip_address, {$dateExpr} as visit_date, COUNT(*) as views")
            ->groupBy('ip_address', 'visit_date')
            ->get();

        $totalVisits = $visits->count();
        if ($totalVisits === 0) {
            return 0;
        }

        $clickVisitKeys = $this->inRange($this->scopeSchool(ClickEvent::query()))
            ->selectRaw("ip_address, {$dateExpr} as visit_date")
            ->groupBy('ip_address', 'visit_date')
            ->get()
            ->map(fn ($c) => $c->ip_address . '|' . $c->visit_date)
            ->flip();

        $bounced = $visits->filter(function ($v) use ($clickVisitKeys) {
            return (int) $v->views === 1 && ! $clickVisitKeys->has($v->ip_address . '|' . $v->visit_date);
        })->count();

        return round($bounced / $totalVisits * 100, 2);
    }

    // ── Time series ─────────────────────────────────────────────────────

    private function perDay($query, string $dateColumn = 'created_at'): Collection
    {
        $dateExpr = $this->dateExpr($dateColumn);

        $rows = $this->inRange($this->scopeSchool($query), $dateColumn)
            ->selectRaw("{$dateExpr} as day, COUNT(*) as count")
            ->groupBy('day')
            ->orderBy('day')
            ->get()
            ->keyBy('day');

        return collect(CarbonPeriod::create($this->start->copy()->startOfDay(), $this->end->copy()->startOfDay()))
            ->map(fn (Carbon $d) => [
                'date'  => $d->toDateString(),
                'count' => (int) ($rows->get($d->toDateString())->count ?? 0),
            ])
            ->values();
    }

    public function viewsPerDay(): Collection
    {
        return $this->perDay(ViewEvent::query());
    }

    public function clicksPerDay(): Collection
    {
        return $this->perDay(ClickEvent::query());
    }

    public function bookingsPerDay(): Collection
    {
        return $this->perDay(Booking::query());
    }

    // ── Revenue ──────────────────────────────────────────────────────────

    public function revenuePerMonth(): Collection
    {
        $monthExpr = $this->monthExpr();

        $query = Payment::where('status', 'success');
        if ($this->schoolId) {
            $query->where('auto_school_id', $this->schoolId);
        }

        return $this->inRange($query)
            ->selectRaw("{$monthExpr} as month, SUM(amount) as revenue, COUNT(*) as count")
            ->groupBy('month')
            ->orderBy('month')
            ->get();
    }

    public function revenuePerSchool(int $limit = 10): Collection
    {
        return $this->inRange(Payment::where('payments.status', 'success'), 'payments.created_at')
            ->join('auto_schools', 'auto_schools.id', '=', 'payments.auto_school_id')
            ->selectRaw('auto_schools.id, auto_schools.name, auto_schools.city, SUM(payments.amount) as revenue, COUNT(payments.id) as payments_count')
            ->groupBy('auto_schools.id', 'auto_schools.name', 'auto_schools.city')
            ->orderByDesc('revenue')
            ->limit($limit)
            ->get();
    }

    // ── Top schools ──────────────────────────────────────────────────────

    private function topSchoolsBy(string $table, int $limit): Collection
    {
        return $this->inRange(DB::table($table), "{$table}.created_at")
            ->join('auto_schools', 'auto_schools.id', '=', "{$table}.auto_school_id")
            ->selectRaw('auto_schools.id, auto_schools.name, auto_schools.city, COUNT(*) as total')
            ->groupBy('auto_schools.id', 'auto_schools.name', 'auto_schools.city')
            ->orderByDesc('total')
            ->limit($limit)
            ->get();
    }

    public function mostViewed(int $limit = 10): Collection
    {
        return $this->topSchoolsBy('view_events', $limit);
    }

    public function mostClicked(int $limit = 10): Collection
    {
        return $this->topSchoolsBy('click_events', $limit);
    }

    public function mostContacted(int $limit = 10): Collection
    {
        return $this->topSchoolsBy('lead_events', $limit);
    }

    // ── Geography / categories ──────────────────────────────────────────

    public function topCities(int $limit = 10): Collection
    {
        return $this->inRange(ViewEvent::query(), 'view_events.created_at')
            ->join('auto_schools', 'auto_schools.id', '=', 'view_events.auto_school_id')
            ->when($this->schoolId, fn ($q) => $q->where('view_events.auto_school_id', $this->schoolId))
            ->selectRaw('auto_schools.city, COUNT(*) as views')
            ->whereNotNull('auto_schools.city')
            ->groupBy('auto_schools.city')
            ->orderByDesc('views')
            ->limit($limit)
            ->get();
    }

    public function topCategories(int $limit = 10): Collection
    {
        return $this->inRange(DB::table('view_events'), 'view_events.created_at')
            ->join('auto_schools', 'auto_schools.id', '=', 'view_events.auto_school_id')
            ->join('school_categories', 'school_categories.auto_school_id', '=', 'auto_schools.id')
            ->join('categories', 'categories.id', '=', 'school_categories.category_id')
            ->when($this->schoolId, fn ($q) => $q->where('view_events.auto_school_id', $this->schoolId))
            ->selectRaw('categories.id, categories.name_fr as name, COUNT(*) as views')
            ->groupBy('categories.id', 'categories.name_fr')
            ->orderByDesc('views')
            ->limit($limit)
            ->get();
    }

    // ── Traffic / devices / tech ─────────────────────────────────────────

    public function trafficSources(): array
    {
        $rows = $this->inRange($this->scopeSchool(ViewEvent::query()))
            ->select('referrer_url')
            ->get();

        $buckets = ['direct' => 0, 'organic' => 0, 'social' => 0, 'referral' => 0];

        foreach ($rows as $row) {
            $ref = $row->referrer_url;
            if (empty($ref)) {
                $buckets['direct']++;
                continue;
            }

            $host = parse_url($ref, PHP_URL_HOST) ?? '';

            if (preg_match('/google|bing|yahoo|duckduckgo/i', $host)) {
                $buckets['organic']++;
            } elseif (preg_match('/facebook|instagram|whatsapp|tiktok|linkedin|twitter|x\.com/i', $host)) {
                $buckets['social']++;
            } else {
                $buckets['referral']++;
            }
        }

        return $buckets;
    }

    public function deviceStats(): Collection
    {
        return $this->groupCount(ViewEvent::query(), 'device_type');
    }

    public function browserStats(): Collection
    {
        return $this->groupCount(ViewEvent::query(), 'browser');
    }

    public function countryStats(): Collection
    {
        return $this->groupCount(ViewEvent::query(), 'country');
    }

    private function groupCount($query, string $column): Collection
    {
        return $this->inRange($this->scopeSchool($query))
            ->whereNotNull($column)
            ->selectRaw("{$column} as name, COUNT(*) as count")
            ->groupBy($column)
            ->orderByDesc('count')
            ->get();
    }

    // ── Heatmap ──────────────────────────────────────────────────────────

    /** Returns a flat list of [weekday(0=Mon..6=Sun), hour(0-23), count] for views. */
    public function hourlyHeatmap(): Collection
    {
        $weekdayExpr = $this->weekdayExpr();
        $hourExpr    = $this->hourExpr();

        return $this->inRange($this->scopeSchool(ViewEvent::query()))
            ->selectRaw("{$weekdayExpr} as weekday, {$hourExpr} as hour, COUNT(*) as count")
            ->groupBy('weekday', 'hour')
            ->get();
    }

    // ── Funnel ───────────────────────────────────────────────────────────

    public function conversionFunnel(): array
    {
        $views     = $this->inRange($this->scopeSchool(ViewEvent::query()))->count();
        $clicks    = $this->inRange($this->scopeSchool(ClickEvent::query()))->count();
        $leads     = $this->inRange($this->scopeSchool(LeadEvent::query()))->count();
        $converted = $this->inRange($this->scopeSchool(LeadEvent::query()))->where('status', 'converted')->count();

        return [
            'steps' => [
                ['name' => 'Vues',      'count' => $views,     'percentage' => 100],
                ['name' => 'Clics',     'count' => $clicks,    'percentage' => $views > 0 ? round($clicks / $views * 100, 2) : 0],
                ['name' => 'Contacts',  'count' => $leads,     'percentage' => $views > 0 ? round($leads / $views * 100, 2) : 0],
                ['name' => 'Convertis', 'count' => $converted, 'percentage' => $leads > 0 ? round($converted / $leads * 100, 2) : 0],
            ],
        ];
    }
}
