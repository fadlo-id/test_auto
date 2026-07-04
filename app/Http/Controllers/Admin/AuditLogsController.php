<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AuditLogsController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAuditLogs', User::class);

        $logs = AuditLog::with('user:id,name,email')
            ->when($request->action, fn ($q, $a) => $q->where('action', 'like', "%{$a}%"))
            ->when($request->user_id, fn ($q, $u) => $q->where('user_id', $u))
            ->when($request->date_from, fn ($q, $d) => $q->whereDate('created_at', '>=', $d))
            ->when($request->date_to, fn ($q, $d) => $q->whereDate('created_at', '<=', $d))
            ->latest('created_at')
            ->paginate(30)
            ->withQueryString()
            ->through(fn (AuditLog $log) => [
                'id'           => $log->id,
                'action'       => $log->action,
                'subject_type' => $log->subject_type ? class_basename($log->subject_type) : null,
                'subject_id'   => $log->subject_id,
                'properties'   => $log->properties,
                'ip'           => $log->ip,
                'user'         => $log->user ? ['id' => $log->user->id, 'name' => $log->user->name, 'email' => $log->user->email] : null,
                'created_at'   => $log->created_at?->toISOString(),
            ]);

        $actions = AuditLog::query()->select('action')->distinct()->orderBy('action')->pluck('action');

        return Inertia::render('Admin/AuditLogs', [
            'logs'    => $logs,
            'actions' => $actions,
            'filters' => $request->only(['action', 'user_id', 'date_from', 'date_to']),
        ]);
    }
}
