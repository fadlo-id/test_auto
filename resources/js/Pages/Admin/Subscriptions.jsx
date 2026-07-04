import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';

function StatusBadge({ status }) {
    const cls = { active: 'badge badge-green', cancelled: 'badge badge-red', expired: 'badge badge-gray', past_due: 'badge badge-yellow' };
    const labels = { active: 'Actif', cancelled: 'Annulé', expired: 'Expiré', past_due: 'En retard' };
    return <span className={cls[status] ?? 'badge badge-gray'}>{labels[status] ?? status}</span>;
}

export default function Subscriptions({ subscriptions, filters }) {
    const { flash } = usePage().props;
    const [status, setStatus] = useState(filters.status ?? 'all');

    const applyFilter = (s) => {
        setStatus(s);
        router.get(route('admin.subscriptions.index'), { status: s }, { preserveState: true, replace: true });
    };

    const cancel = (sub) => {
        if (confirm('Annuler cet abonnement ?')) {
            router.post(route('admin.subscriptions.cancel', sub.id), {}, { preserveScroll: true });
        }
    };

    return (
        <AdminLayout title="Abonnements">
            <Head title="Admin — Abonnements" />

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-50 flex gap-2 flex-wrap">
                    {['all', 'active', 'cancelled', 'expired'].map((s) => (
                        <button key={s} onClick={() => applyFilter(s)}
                            className={`px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-colors ${status === s ? 'bg-orange-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                            {s === 'all' ? 'Tous' : s === 'active' ? 'Actifs' : s === 'cancelled' ? 'Annulés' : 'Expirés'}
                        </button>
                    ))}
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                {['Auto-école', 'Plan', 'Prix', 'Statut', 'Début', 'Fin', 'Actions'].map((h) => (
                                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {subscriptions.data.map((sub) => (
                                <tr key={sub.id} className="border-b border-gray-50 hover:bg-gray-50/70 transition-colors">
                                    <td className="px-4 py-3 font-semibold text-gray-900">{sub.auto_school?.name ?? '—'}</td>
                                    <td className="px-4 py-3 text-gray-600">{sub.plan?.name ?? '—'}</td>
                                    <td className="px-4 py-3 font-medium text-gray-900">{sub.plan?.price ? `${Number(sub.plan.price).toLocaleString()} MAD` : '—'}</td>
                                    <td className="px-4 py-3"><StatusBadge status={sub.status} /></td>
                                    <td className="px-4 py-3 text-gray-400 text-xs">{sub.started_at ? new Date(sub.started_at).toLocaleDateString('fr-FR') : '—'}</td>
                                    <td className="px-4 py-3 text-gray-400 text-xs">{sub.expires_at ? new Date(sub.expires_at).toLocaleDateString('fr-FR') : '—'}</td>
                                    <td className="px-4 py-3">
                                        {sub.status === 'active' && (
                                            <button onClick={() => cancel(sub)} className="text-xs px-2.5 py-1 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 font-semibold transition-colors">
                                                Annuler
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {subscriptions.data.length === 0 && (
                                <tr><td colSpan={7} className="px-4 py-16 text-center text-gray-400 font-medium">Aucun abonnement trouvé</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {subscriptions.links && (
                    <div className="px-4 py-4 border-t border-gray-50 flex gap-1.5 justify-center">
                        {subscriptions.links.map((link, i) => (
                            <Link key={i} href={link.url ?? '#'} dangerouslySetInnerHTML={{ __html: link.label }}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${link.active ? 'bg-orange-600 text-white shadow-sm' : link.url ? 'bg-white border border-gray-200 text-gray-600 hover:border-orange-300 hover:text-orange-700' : 'bg-white border border-gray-100 text-gray-300 cursor-default pointer-events-none'}`}
                                preserveScroll />
                        ))}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
