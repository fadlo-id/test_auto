<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\AutoSchool;
use App\Models\SchoolApplication;
use App\Models\Signalement;
use App\Models\Subscription;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class NotificationsController extends Controller
{
    /**
     * Personal in-app inbox (per-admin, markable as read — same pattern as the School
     * portal's NotificationsController) plus two read-only, always-live panels that need
     * no stored state: system alerts (computed from current data) and the recent audit
     * trail (already recorded by AuditLog::record() throughout the admin panel).
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        $notifications = $user->notifications()
            ->when($request->unread_only, fn ($q) => $q->whereNull('read_at'))
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Admin/Notifications', [
            'notifications' => $notifications,
            'unread_count'  => $user->unreadNotifications()->count(),
            'filters'       => $request->only(['unread_only']),
            'alerts'        => $this->systemAlerts($user),
            'recent_actions' => $user->isSuperAdmin()
                ? AuditLog::with('user:id,name')
                    ->latest('created_at')
                    ->limit(15)
                    ->get(['id', 'user_id', 'action', 'subject_type', 'subject_id', 'created_at'])
                : [],
        ]);
    }

    /** Only surfaces alerts the current admin actually has the permission to act on. */
    private function systemAlerts($user): array
    {
        $candidates = [
            [
                'label'      => 'Candidatures en attente',
                'count'      => fn () => SchoolApplication::where('status', 'pending')->count(),
                'url'        => route('admin.school-applications.index'),
                'level'      => 'info',
                'permission' => 'manage_schools',
            ],
            [
                'label'      => 'Auto-écoles en attente',
                'count'      => fn () => AutoSchool::where('status', 'pending')->count(),
                'url'        => route('admin.auto-schools.index', ['status' => 'pending']),
                'level'      => 'info',
                'permission' => 'manage_schools',
            ],
            [
                'label'      => 'Signalements non résolus',
                'count'      => fn () => Signalement::where('status', 'pending')->count(),
                'url'        => route('admin.signalements.index'),
                'level'      => 'warning',
                'permission' => 'manage_reviews',
            ],
            [
                'label'      => 'Abonnements expirant bientôt',
                'count'      => fn () => Subscription::where('expires_at', '<=', now()->addDays(7))->where('expires_at', '>', now())->count(),
                'url'        => route('admin.subscriptions.index'),
                'level'      => 'warning',
                'permission' => 'manage_subscriptions',
            ],
        ];

        return collect($candidates)
            ->filter(fn ($a) => $user->isSuperAdmin() || $user->hasPermission($a['permission']))
            ->map(fn ($a) => ['label' => $a['label'], 'count' => ($a['count'])(), 'url' => $a['url'], 'level' => $a['level']])
            ->values()
            ->all();
    }

    public function markRead(string $id): RedirectResponse
    {
        auth()->user()->notifications()->where('id', $id)->update(['read_at' => now()]);
        return back()->with('success', 'Notification marquée comme lue.');
    }

    public function markAllRead(): RedirectResponse
    {
        auth()->user()->unreadNotifications->markAsRead();
        return back()->with('success', 'Toutes les notifications marquées comme lues.');
    }

    public function destroy(string $id): RedirectResponse
    {
        auth()->user()->notifications()->where('id', $id)->delete();
        return back()->with('success', 'Notification supprimée.');
    }
}
