import { Head, Link, router, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import Pagination from '@/Components/UI/Pagination';
import EmptyState from '@/Components/UI/EmptyState';
import { BellIcon, CheckIcon, TrashIcon, ExclamationTriangleIcon, ClockIcon } from '@heroicons/react/24/outline';

const ALERT_STYLES = {
    info:    'bg-blue-50 dark:bg-blue-500/10 border-blue-100 dark:border-blue-500/20 text-blue-700 dark:text-blue-400',
    warning: 'bg-amber-50 dark:bg-amber-500/10 border-amber-100 dark:border-amber-500/20 text-amber-700 dark:text-amber-400',
};

function actionLabel(action) {
    return action?.replaceAll('.', ' → ').replaceAll('_', ' ') ?? '';
}

export default function Notifications({ notifications, unread_count = 0, filters = {}, alerts = [], recent_actions = [] }) {
    const { flash, auth } = usePage().props;

    const markRead = (id) => router.post(route('admin.notifications.read', id), {}, { preserveScroll: true });
    const markAll = () => router.post(route('admin.notifications.read-all'), {}, { preserveScroll: true });
    const destroy = (id) => {
        if (!confirm('Supprimer cette notification ?')) return;
        router.delete(route('admin.notifications.destroy', id), { preserveScroll: true });
    };

    return (
        <AdminLayout title="Notifications">
            <Head title="Admin — Notifications" />
            {flash?.success && <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">{flash.success}</div>}

            {/* System alerts — always-live, computed from current data */}
            {alerts.filter(a => a.count > 0).length > 0 && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                    {alerts.filter(a => a.count > 0).map((alert, i) => (
                        <Link key={i} href={alert.url} className={`card-hover border rounded-2xl p-4 flex items-center gap-3 ${ALERT_STYLES[alert.level] ?? ALERT_STYLES.info}`}>
                            <ExclamationTriangleIcon className="w-5 h-5 flex-shrink-0" />
                            <div className="min-w-0">
                                <p className="text-lg font-extrabold leading-none">{alert.count}</p>
                                <p className="text-xs font-medium mt-1 truncate">{alert.label}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            <div className={`grid gap-6 ${auth?.user?.is_super_admin ? 'lg:grid-cols-3' : ''}`}>
                {/* Personal inbox */}
                <div className={auth?.user?.is_super_admin ? 'lg:col-span-2' : ''}>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <h2 className="text-base font-bold text-gray-900 dark:text-zinc-100">Boîte de notifications</h2>
                            {unread_count > 0 && <span className="bg-orange-600 text-white text-xs px-2 py-0.5 rounded-full font-semibold">{unread_count} non lue{unread_count > 1 ? 's' : ''}</span>}
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => router.get(route('admin.notifications.index'), { unread_only: filters.unread_only ? '' : '1' })}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${filters.unread_only ? 'bg-orange-600 text-white border-orange-600' : 'border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-800'}`}
                            >
                                Non lues seulement
                            </button>
                            {unread_count > 0 && (
                                <button onClick={markAll} className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 inline-flex items-center gap-1.5">
                                    <CheckIcon className="w-3.5 h-3.5" /> Tout marquer lu
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="card overflow-hidden">
                        {notifications?.data?.length === 0 ? (
                            <EmptyState icon={BellIcon} title="Aucune notification" description="Les nouvelles inscriptions, candidatures et alertes apparaîtront ici." />
                        ) : (
                            <div className="divide-y divide-gray-50 dark:divide-zinc-800">
                                {notifications.data.map((notif) => {
                                    const d = typeof notif.data === 'string' ? JSON.parse(notif.data) : notif.data;
                                    return (
                                        <div key={notif.id} className={`p-4 flex items-start gap-3 transition-colors ${!notif.read_at ? 'bg-orange-50/40 dark:bg-orange-500/[0.04]' : ''}`}>
                                            <span className="text-xl flex-shrink-0 leading-none mt-0.5">{d?.icon ?? '🔔'}</span>
                                            <div className="flex-1 min-w-0">
                                                {d?.url ? (
                                                    <Link href={d.url} className="text-sm font-semibold text-gray-900 dark:text-zinc-100 hover:text-orange-600 dark:hover:text-orange-400">
                                                        {d?.title ?? 'Notification'}
                                                    </Link>
                                                ) : (
                                                    <p className="text-sm font-semibold text-gray-900 dark:text-zinc-100">{d?.title ?? 'Notification'}</p>
                                                )}
                                                {d?.body && <p className="text-sm text-gray-500 dark:text-zinc-400 mt-0.5">{d.body}</p>}
                                                <p className="text-xs text-gray-400 dark:text-zinc-500 mt-1">{new Date(notif.created_at).toLocaleString('fr-FR')}</p>
                                            </div>
                                            <div className="flex gap-1 flex-shrink-0">
                                                {!notif.read_at && (
                                                    <button onClick={() => markRead(notif.id)} title="Marquer lu" className="p-1.5 rounded-lg text-gray-400 dark:text-zinc-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10">
                                                        <CheckIcon className="w-4 h-4" />
                                                    </button>
                                                )}
                                                <button onClick={() => destroy(notif.id)} title="Supprimer" className="p-1.5 rounded-lg text-gray-400 dark:text-zinc-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10">
                                                    <TrashIcon className="w-4 h-4" />
                                                </button>
                                            </div>
                                            {!notif.read_at && <span className="w-2 h-2 rounded-full bg-orange-500 mt-2 flex-shrink-0" />}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                        <Pagination paginator={notifications} />
                    </div>
                </div>

                {/* Actions importantes — audit trail preview (super_admin only) */}
                {auth?.user?.is_super_admin && (
                    <div>
                        <h2 className="text-base font-bold text-gray-900 dark:text-zinc-100 mb-4">Actions importantes</h2>
                        <div className="card divide-y divide-gray-50 dark:divide-zinc-800">
                            {recent_actions.length === 0 ? (
                                <div className="p-6 text-center text-sm text-gray-400 dark:text-zinc-500">Aucune action récente</div>
                            ) : recent_actions.map((a) => (
                                <div key={a.id} className="p-3.5 flex items-start gap-2.5">
                                    <ClockIcon className="w-4 h-4 text-gray-300 dark:text-zinc-600 flex-shrink-0 mt-0.5" />
                                    <div className="min-w-0">
                                        <p className="text-xs font-medium text-gray-700 dark:text-zinc-300 capitalize">{actionLabel(a.action)}</p>
                                        <p className="text-[11px] text-gray-400 dark:text-zinc-500 mt-0.5">
                                            {a.user?.name ?? 'Système'} · {new Date(a.created_at).toLocaleString('fr-FR')}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
