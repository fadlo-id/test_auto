<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AutoSchool;
use App\Models\Payment;
use App\Models\Review;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ReportsController extends Controller
{
    public function index(Request $request): Response
    {
        $period = $request->input('period', '30');
        $from = now()->subDays((int) $period);

        $revenueByMonth = Payment::where('status', 'success')
            ->where('created_at', '>=', now()->subMonths(12))
            ->select(DB::raw($this->monthExpr() . ' as month'), DB::raw('SUM(amount) as total'), DB::raw('COUNT(*) as count'))
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        $registrationsByMonth = User::where('created_at', '>=', now()->subMonths(12))
            ->select(DB::raw($this->monthExpr() . ' as month'), DB::raw('COUNT(*) as count'))
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        $schoolsByStatus = AutoSchool::selectRaw('status, COUNT(*) as count')->groupBy('status')->get();
        $reviewsByRating = Review::where('status', 'approved')->selectRaw('rating, COUNT(*) as count')->groupBy('rating')->orderBy('rating')->get();

        $summary = [
            'total_revenue'     => Payment::where('status', 'success')->sum('amount'),
            'revenue_period'    => Payment::where('status', 'success')->where('created_at', '>=', $from)->sum('amount'),
            'new_users'         => User::where('created_at', '>=', $from)->count(),
            'new_schools'       => AutoSchool::where('created_at', '>=', $from)->count(),
            'active_subs'       => Subscription::where('status', 'active')->count(),
            'pending_schools'   => AutoSchool::where('status', 'pending')->count(),
        ];

        return Inertia::render('Admin/Reports', compact('revenueByMonth', 'registrationsByMonth', 'schoolsByStatus', 'reviewsByRating', 'summary', 'period'));
    }

    private function monthExpr(): string
    {
        return DB::getDriverName() === 'sqlite'
            ? "strftime('%Y-%m', created_at)"
            : "DATE_FORMAT(created_at, '%Y-%m')";
    }
}
