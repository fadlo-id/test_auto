import { Head, router, usePage } from '@inertiajs/react';
import SchoolLayout from '@/Layouts/SchoolLayout';

export default function Notifications({ notifications, unread_count = 0, filters = {} }) {
    const { flash, school } = usePage().props;

    const markRead = (id) => router.post(route('school.notifications.read', id), {}, { preserveScroll: true });
    const markAll = () => router.post(route('school.notifications.read-all'), {}, { preserveScroll: true });
    const destroy = (id) => router.delete(route('school.notifications.destroy', id), { preserveScroll: true });

    return (
        <SchoolLayout title="Notifications" school={school}>
            <Head title="Notifications" />
            {flash?.success && <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">{flash.success}</div>}

            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                    <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
                    {unread_count > 0 && <span className="bg-orange-600 text-white text-xs px-2 py-0.5 rounded-full">{unread_count} non lue{unread_count > 1 ? 's' : ''}</span>}
                </div>
                <div className="flex gap-2">
                    <button onClick={() => router.get(route('school.notifications'), { unread_only: filters.unread_only ? '' : '1' })}
                        className={`px-3 py-1.5 rounded-lg text-sm border ${filters.unread_only ? 'bg-orange-600 text-white border-orange-600' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                        Non lues seulement
                    </button>
                    {unread_count > 0 && (
                        <button onClick={markAll} className="px-3 py-1.5 rounded-lg text-sm bg-green-600 text-white hover:bg-green-700">
                            Tout marquer lu
                        </button>
                    )}
                </div>
            </div>

            <div className="space-y-2">
                {notifications?.data?.length === 0 && (
                    <div className="bg-white rounded-xl border border-gray-200 py-14 text-center text-gray-400">
                        <p className="text-4xl mb-2">🔔</p>
                        <p>Aucune notification</p>
                    </div>
                )}
                {notifications?.data?.map((notif) => {
                    const d = typeof notif.data === 'string' ? JSON.parse(notif.data) : notif.data;
                    return (
                        <div key={notif.id} className={`bg-white rounded-xl border p-4 flex items-start gap-4 ${!notif.read_at ? 'border-orange-200 bg-orange-50/30' : 'border-gray-200'}`}>
                            <div className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${!notif.read_at ? 'bg-orange-500' : 'bg-gray-300'}`} />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900">{d?.title ?? d?.message ?? 'Notification'}</p>
                                {d?.body && <p className="text-sm text-gray-500 mt-0.5">{d.body}</p>}
                                <p className="text-xs text-gray-400 mt-1">{new Date(notif.created_at).toLocaleString('fr')}</p>
                            </div>
                            <div className="flex gap-2 flex-shrink-0">
                                {!notif.read_at && <button onClick={() => markRead(notif.id)} className="text-xs text-orange-600 hover:underline">Marquer lu</button>}
                                <button onClick={() => destroy(notif.id)} className="text-xs text-red-500 hover:underline">✕</button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {notifications?.last_page > 1 && (
                <div className="mt-4 flex gap-2">
                    {notifications.links?.map((link, i) => (
                        <button key={i} disabled={!link.url} onClick={() => link.url && router.get(link.url)}
                            className={`px-3 py-1 rounded text-xs ${link.active ? 'bg-orange-600 text-white' : 'border border-gray-200 text-gray-600 disabled:opacity-40'}`}
                            dangerouslySetInnerHTML={{ __html: link.label }} />
                    ))}
                </div>
            )}
        </SchoolLayout>
    );
}
