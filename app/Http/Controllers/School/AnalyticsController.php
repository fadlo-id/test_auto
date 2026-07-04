<?php

namespace App\Http\Controllers\School;

use App\Exports\AnalyticsExport;
use App\Http\Controllers\Controller;
use App\Services\AnalyticsService;
use App\Services\EnterpriseAnalyticsService;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;
use Maatwebsite\Excel\Excel as ExcelFormat;
use Maatwebsite\Excel\Facades\Excel;

class AnalyticsController extends Controller
{
    public function __construct(private AnalyticsService $analytics) {}

    /**
     * Resolve the {start, end, days} filters shared by index() and export().
     * `days` (7/30/90) is a quick-filter shortcut; explicit date_from/date_to overrides it.
     */
    private function resolveFilters(Request $request): array
    {
        $days = (int) $request->input('days', 30);
        $days = in_array($days, [7, 30, 90], true) ? $days : 30;

        if ($request->filled('date_from') || $request->filled('date_to')) {
            $end   = $request->filled('date_to') ? Carbon::parse($request->input('date_to'))->endOfDay() : now()->endOfDay();
            $start = $request->filled('date_from') ? Carbon::parse($request->input('date_from'))->startOfDay() : $end->copy()->subDays(29)->startOfDay();
        } else {
            $end   = today()->endOfDay();
            $start = $end->copy()->subDays($days - 1)->startOfDay();
        }

        return [$start, $end, $days];
    }

    private function buildReport(Request $request, $school): array
    {
        [$start, $end, $days] = $this->resolveFilters($request);

        $service = new EnterpriseAnalyticsService($school->id, $start, $end);

        return [
            'filters' => [
                'date_from' => $start->toDateString(),
                'date_to'   => $end->toDateString(),
                'school_id' => $school->id,
                'days'      => $days,
            ],
            'overview'         => $service->overview(),
            'viewsPerDay'      => $service->viewsPerDay(),
            'clicksPerDay'     => $service->clicksPerDay(),
            'bookingsPerDay'   => $service->bookingsPerDay(),
            'revenuePerMonth'  => collect(),
            'revenuePerSchool' => collect(),
            'mostViewed'       => collect(),
            'mostClicked'      => collect(),
            'mostContacted'    => collect(),
            'topCities'        => $service->topCities(),
            'topCategories'    => $service->topCategories(),
            'trafficSources'   => $service->trafficSources(),
            'deviceStats'      => $service->deviceStats(),
            'browserStats'     => $service->browserStats(),
            'countryStats'     => $service->countryStats(),
            'heatmap'          => $service->hourlyHeatmap(),
            'funnel'           => $service->conversionFunnel(),
        ];
    }

    public function index(Request $request): Response|RedirectResponse
    {
        $school = auth()->user()->autoSchool;

        if (! $school) {
            return redirect()->route('school.settings');
        }

        [$start, $end, $days] = $this->resolveFilters($request);

        $data       = $this->analytics->getDashboardData($school, (int) $start->diffInDays($end) + 1);
        $comparison = $this->analytics->getComparison($school, $days);

        $enterprise = new EnterpriseAnalyticsService($school->id, $start, $end);

        return Inertia::render('SchoolDashboard/Analytics', [
            'school'      => $school->only('id', 'name', 'city', 'status'),
            'analytics'   => $data,
            'comparison'  => $comparison,
            'days'        => $days,
            'filters'     => [
                'date_from' => $start->toDateString(),
                'date_to'   => $end->toDateString(),
            ],
            'overview'        => $enterprise->overview(),
            'trafficSources'  => $enterprise->trafficSources(),
            'browserStats'    => $enterprise->browserStats(),
            'countryStats'    => $enterprise->countryStats(),
            'heatmap'         => $enterprise->hourlyHeatmap(),
            'funnel'          => $enterprise->conversionFunnel(),
        ]);
    }

    public function export(Request $request, string $format)
    {
        abort_unless(in_array($format, ['pdf', 'excel', 'csv'], true), 404);

        $school = auth()->user()->autoSchool;
        abort_unless($school, 404);

        $data = $this->buildReport($request, $school);

        if ($format === 'pdf') {
            return Pdf::loadView('exports.analytics-pdf', ['data' => $data])
                ->download('analytics-' . $data['filters']['date_from'] . '-au-' . $data['filters']['date_to'] . '.pdf');
        }

        $export   = new AnalyticsExport($data);
        $filename = 'analytics-' . $data['filters']['date_from'] . '-au-' . $data['filters']['date_to'] . '.' . $format;

        return Excel::download($export, $filename, $format === 'csv' ? ExcelFormat::CSV : ExcelFormat::XLSX);
    }
}
