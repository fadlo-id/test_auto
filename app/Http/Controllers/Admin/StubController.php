<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AutoSchool;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class StubController extends Controller
{
    // ── Gestion ───────────────────────────────────────────────────

    public function instructors(Request $request): Response
    {
        $users = User::where('role', 'school_owner')
            ->with('autoSchool:id,user_id,name')
            ->when($request->search, fn ($q, $s) =>
                $q->where('name', 'like', "%$s%")->orWhere('email', 'like', "%$s%")
            )
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Admin/Instructors', [
            'users'   => $users,
            'filters' => $request->only(['search']),
            'stats'   => [
                'total'  => User::where('role', 'school_owner')->count(),
                'active' => User::where('role', 'school_owner')->where('is_active', true)->count(),
            ],
        ]);
    }

    public function students(Request $request): Response
    {
        $users = User::where('role', 'user')
            ->when($request->search, fn ($q, $s) =>
                $q->where('name', 'like', "%$s%")->orWhere('email', 'like', "%$s%")
            )
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Admin/Students', [
            'users'   => $users,
            'filters' => $request->only(['search']),
            'stats'   => [
                'total'    => User::where('role', 'user')->count(),
                'active'   => User::where('role', 'user')->where('is_active', true)->count(),
                'new_this_month' => User::where('role', 'user')->where('created_at', '>=', now()->startOfMonth())->count(),
            ],
        ]);
    }

    // ── Abonnements ───────────────────────────────────────────────

    public function invoices(Request $request): Response
    {
        $payments = Payment::with(['autoSchool:id,name', 'plan:id,name'])
            ->where('status', 'success')
            ->when($request->search, fn ($q, $s) =>
                $q->whereHas('autoSchool', fn ($sq) => $sq->where('name', 'like', "%$s%"))
            )
            ->latest()
            ->paginate(25)
            ->withQueryString();

        return Inertia::render('Admin/Invoices', [
            'payments' => $payments,
            'filters'  => $request->only(['search']),
            'total'    => Payment::where('status', 'success')->sum('amount'),
        ]);
    }

    // ── Contenu ───────────────────────────────────────────────────

    public function cities(Request $request): Response
    {
        $driver = DB::getDriverName();
        $cities = AutoSchool::where('status', 'approved')
            ->whereNotNull('city')
            ->selectRaw('city, COUNT(*) as schools_count')
            ->groupBy('city')
            ->orderByDesc('schools_count')
            ->when($request->search, fn ($q, $s) => $q->where('city', 'like', "%$s%"))
            ->paginate(30)
            ->withQueryString();

        return Inertia::render('Admin/Cities', [
            'cities'  => $cities,
            'filters' => $request->only(['search']),
            'total'   => AutoSchool::where('status', 'approved')->whereNotNull('city')->distinct('city')->count('city'),
        ]);
    }

    // ── Statistiques ──────────────────────────────────────────────

    public function revenue(Request $request): Response
    {
        $period = $request->input('period', '12');
        $months = (int) $period;

        $driver = DB::getDriverName();
        $monthExpr = $driver === 'sqlite'
            ? "strftime('%Y-%m', created_at)"
            : "DATE_FORMAT(created_at, '%Y-%m')";

        $monthly = Payment::where('status', 'success')
            ->where('created_at', '>=', now()->subMonths($months)->startOfMonth())
            ->selectRaw("{$monthExpr} as month, SUM(amount) as total, COUNT(*) as count")
            ->groupByRaw($monthExpr)
            ->orderBy('month')
            ->get();

        $byPlan = Payment::where('status', 'success')
            ->with('plan:id,name')
            ->selectRaw('plan_id, SUM(amount) as total, COUNT(*) as count')
            ->groupBy('plan_id')
            ->orderByDesc('total')
            ->get();

        return Inertia::render('Admin/Revenue', [
            'monthly' => $monthly,
            'byPlan'  => $byPlan,
            'period'  => $period,
            'summary' => [
                'total_all_time' => Payment::where('status', 'success')->sum('amount'),
                'total_month'    => Payment::where('status', 'success')->where('created_at', '>=', now()->startOfMonth())->sum('amount'),
                'total_year'     => Payment::where('status', 'success')->where('created_at', '>=', now()->startOfYear())->sum('amount'),
                'count_all'      => Payment::where('status', 'success')->count(),
            ],
        ]);
    }

    public function statsUsers(Request $request): Response
    {
        $driver = DB::getDriverName();
        $monthExpr = $driver === 'sqlite'
            ? "strftime('%Y-%m', created_at)"
            : "DATE_FORMAT(created_at, '%Y-%m')";

        $monthly = User::where('created_at', '>=', now()->subMonths(12)->startOfMonth())
            ->selectRaw("{$monthExpr} as month, COUNT(*) as count")
            ->groupByRaw($monthExpr)
            ->orderBy('month')
            ->get();

        $byRole = User::selectRaw('role, COUNT(*) as count')
            ->groupBy('role')
            ->get();

        return Inertia::render('Admin/StatsUsers', [
            'monthly' => $monthly,
            'byRole'  => $byRole,
            'summary' => [
                'total'          => User::count(),
                'active'         => User::where('is_active', true)->count(),
                'new_this_month' => User::where('created_at', '>=', now()->startOfMonth())->count(),
                'new_this_week'  => User::where('created_at', '>=', now()->startOfWeek())->count(),
            ],
        ]);
    }

    public function statsSchools(Request $request): Response
    {
        $driver = DB::getDriverName();
        $monthExpr = $driver === 'sqlite'
            ? "strftime('%Y-%m', created_at)"
            : "DATE_FORMAT(created_at, '%Y-%m')";

        $monthly = AutoSchool::where('created_at', '>=', now()->subMonths(12)->startOfMonth())
            ->selectRaw("{$monthExpr} as month, COUNT(*) as count")
            ->groupByRaw($monthExpr)
            ->orderBy('month')
            ->get();

        $byStatus = AutoSchool::selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->get();

        $byCity = AutoSchool::where('status', 'approved')
            ->whereNotNull('city')
            ->selectRaw('city, COUNT(*) as count')
            ->groupBy('city')
            ->orderByDesc('count')
            ->limit(15)
            ->get();

        return Inertia::render('Admin/StatsSchools', [
            'monthly'  => $monthly,
            'byStatus' => $byStatus,
            'byCity'   => $byCity,
            'summary'  => [
                'total'    => AutoSchool::count(),
                'approved' => AutoSchool::where('status', 'approved')->count(),
                'pending'  => AutoSchool::where('status', 'pending')->count(),
                'active'   => AutoSchool::where('is_active', true)->count(),
            ],
        ]);
    }

    // ── Administration ────────────────────────────────────────────

    public function configuration(): Response
    {
        $driver = \DB::getDriverName();
        if ($driver === 'mysql') {
            $tables  = \DB::select('SHOW TABLE STATUS');
            $dbSize  = array_sum(array_map(fn ($t) => ($t->Data_length ?? 0) + ($t->Index_length ?? 0), $tables));
            $tableCount = count($tables);
        } else {
            $tables     = \DB::select("SELECT name FROM sqlite_master WHERE type='table'");
            $dbSize     = 0;
            $tableCount = count($tables);
        }

        return Inertia::render('Admin/Configuration', [
            'app' => [
                'name'        => config('app.name'),
                'env'         => config('app.env'),
                'debug'       => config('app.debug'),
                'url'         => config('app.url'),
                'timezone'    => config('app.timezone'),
                'locale'      => config('app.locale'),
            ],
            'php' => [
                'version'     => PHP_VERSION,
                'memory_limit'=> ini_get('memory_limit'),
                'max_execution_time' => ini_get('max_execution_time') . 's',
                'upload_max_filesize' => ini_get('upload_max_filesize'),
            ],
            'db' => [
                'driver'      => config('database.default'),
                'database'    => config('database.connections.' . config('database.default') . '.database'),
                'tables'      => $tableCount,
                'size_mb'     => round($dbSize / 1024 / 1024, 2),
            ],
            'cache' => [
                'driver'  => config('cache.default'),
                'queue'   => config('queue.default'),
                'session' => config('session.driver'),
                'mail'    => config('mail.default'),
            ],
        ]);
    }

    public function rolesIndex(): Response
    {
        return Inertia::render('Admin/Roles', [
            'permissions_map' => array_map(
                fn ($v) => ['label' => $v['label'], 'group' => $v['group']],
                User::ALL_PERMISSIONS
            ),
            'roles' => [
                ['name' => 'super_admin', 'label' => 'Super Admin', 'desc' => 'Accès total sans restriction', 'color' => 'purple', 'count' => User::where('role', 'super_admin')->count()],
                ['name' => 'admin',       'label' => 'Admin',       'desc' => 'Accès selon les permissions accordées', 'color' => 'blue', 'count' => User::where('role', 'admin')->count()],
                ['name' => 'school_owner','label' => 'Propriétaire', 'desc' => 'Gestion de son auto-école', 'color' => 'orange', 'count' => User::where('role', 'school_owner')->count()],
                ['name' => 'user',        'label' => 'Utilisateur', 'desc' => 'Accès public + avis', 'color' => 'gray', 'count' => User::where('role', 'user')->count()],
            ],
        ]);
    }

    public function backups(): Response
    {
        $driver = \DB::getDriverName();
        if ($driver === 'mysql') {
            $tables = \DB::select('SHOW TABLE STATUS');
            $dbSize = array_sum(array_map(fn ($t) => ($t->Data_length ?? 0) + ($t->Index_length ?? 0), $tables));
        } else {
            $tables = \DB::select("SELECT name FROM sqlite_master WHERE type='table'");
            $dbSize = 0;
        }

        return Inertia::render('Admin/Backups', [
            'db' => [
                'tables'   => count($tables),
                'size_mb'  => round($dbSize / 1024 / 1024, 2),
                'driver'   => config('database.default'),
                'database' => config('database.connections.' . config('database.default') . '.database'),
            ],
            'storage' => [
                'uploads_path' => storage_path('app/public'),
                'logs_path'    => storage_path('logs'),
            ],
        ]);
    }

    public function profile(Request $request): Response
    {
        return Inertia::render('Admin/AdminProfile', [
            'user' => $request->user()->only(['id', 'name', 'email', 'phone', 'role', 'avatar', 'notes', 'last_login_at', 'created_at']),
        ]);
    }

    public function updateProfile(Request $request): \Illuminate\Http\RedirectResponse
    {
        $data = $request->validate([
            'name'  => 'required|string|max:100',
            'phone' => 'nullable|string|max:20',
        ]);

        $request->user()->update($data);

        return back()->with('success', 'Profil mis à jour avec succès.');
    }
}
