<?php

namespace App\Http\Controllers\Admin;

use App\Exports\AnalyticsExport;
use App\Http\Controllers\Controller;
use App\Models\AutoSchool;
use App\Models\Booking;
use App\Models\Payment;
use App\Models\Review;
use App\Models\Subscription;
use App\Models\User;
use App\Services\EnterpriseAnalyticsService;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Maatwebsite\Excel\Excel as ExcelFormat;
use Maatwebsite\Excel\Facades\Excel;

class AnalyticsController extends Controller
{
    private function monthExpr(string $column = 'created_at'): string
    {
        return DB::getDriverName() === 'sqlite'
            ? "strftime('%Y-%m', {$column}) as month"
            : "DATE_FORMAT({$column}, '%Y-%m') as month";
    }

    /**
     * Resolve the {start, end, schoolId} filters shared by index() and export().
     */
    private function resolveFilters(Request $request): array
    {
        $end   = $request->filled('date_to') ? Carbon::parse($request->input('date_to'))->endOfDay() : now()->endOfDay();
        $start = $request->filled('date_from') ? Carbon::parse($request->input('date_from'))->startOfDay() : $end->copy()->subDays(29)->startOfDay();
        $schoolId = $request->filled('school_id') ? (int) $request->input('school_id') : null;

        return [$start, $end, $schoolId];
    }

    private function buildReport(Request $request): array
    {
        [$start, $end, $schoolId] = $this->resolveFilters($request);

        $service = new EnterpriseAnalyticsService($schoolId, $start, $end);

        $months = 12;

        $monthlySchools = AutoSchool::where('created_at', '>=', now()->subMonths($months))
            ->selectRaw($this->monthExpr() . ', COUNT(*) as count')
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        $monthlyUsers = User::where('created_at', '>=', now()->subMonths($months))
            ->selectRaw($this->monthExpr() . ', COUNT(*) as count')
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        $subscriptionBreakdown = Subscription::where('status', 'active')
            ->with('plan:id,name')
            ->selectRaw('plan_id, COUNT(*) as count')
            ->groupBy('plan_id')
            ->get()
            ->map(fn ($s) => ['plan' => $s->plan?->name ?? 'Unknown', 'count' => $s->count]);

        $bookingStats = [
            'total'     => Booking::count(),
            'pending'   => Booking::where('status', 'pending')->count(),
            'confirmed' => Booking::where('status', 'confirmed')->count(),
            'completed' => Booking::where('status', 'completed')->count(),
        ];

        return [
            'filters' => [
                'date_from' => $start->toDateString(),
                'date_to'   => $end->toDateString(),
                'school_id' => $schoolId,
            ],
            'overview'          => $service->overview(),
            'viewsPerDay'       => $service->viewsPerDay(),
            'clicksPerDay'      => $service->clicksPerDay(),
            'bookingsPerDay'    => $service->bookingsPerDay(),
            'revenuePerMonth'   => $service->revenuePerMonth(),
            'revenuePerSchool'  => $service->revenuePerSchool(),
            'mostViewed'        => $service->mostViewed(),
            'mostClicked'       => $service->mostClicked(),
            'mostContacted'     => $service->mostContacted(),
            'topCities'         => $service->topCities(),
            'topCategories'     => $service->topCategories(),
            'trafficSources'    => $service->trafficSources(),
            'deviceStats'       => $service->deviceStats(),
            'browserStats'      => $service->browserStats(),
            'countryStats'      => $service->countryStats(),
            'heatmap'           => $service->hourlyHeatmap(),
            'funnel'            => $service->conversionFunnel(),
            'monthlySchools'    => $monthlySchools,
            'monthlyUsers'      => $monthlyUsers,
            'subscriptionBreakdown' => $subscriptionBreakdown,
            'bookingStats'      => $bookingStats,
            'totals' => [
                'revenue_all_time' => (float) Payment::where('status', 'success')->sum('amount'),
                'active_schools'   => AutoSchool::active()->count(),
                'active_subs'      => Subscription::where('status', 'active')->count(),
                'pending_reviews'  => Review::where('status', 'pending')->count(),
            ],
        ];
    }

    public function index(Request $request): Response
    {
        $data = $this->buildReport($request);

        $data['schools'] = AutoSchool::active()
            ->select('id', 'name')
            ->orderBy('name')
            ->get();

        return Inertia::render('Admin/Analytics', $data);
    }

    public function export(Request $request, string $format)
    {
        abort_unless(in_array($format, ['pdf', 'excel', 'csv'], true), 404);

        $data = $this->buildReport($request);

        if ($format === 'pdf') {
            return Pdf::loadView('exports.analytics-pdf', ['data' => $data])
                ->download('analytics-' . $data['filters']['date_from'] . '-au-' . $data['filters']['date_to'] . '.pdf');
        }

        $export   = new AnalyticsExport($data);
        $filename = 'analytics-' . $data['filters']['date_from'] . '-au-' . $data['filters']['date_to'] . '.' . $format;

        return Excel::download($export, $filename, $format === 'csv' ? ExcelFormat::CSV : ExcelFormat::XLSX);
    }
}
