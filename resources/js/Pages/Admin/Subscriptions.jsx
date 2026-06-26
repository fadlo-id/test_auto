import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';

function StatusBadge({ status }) {
    const map = { active: 'bg-green-100 text-green-700', cancelled: 'bg-red-100 text-red-700', expired: 'bg-gray-100 text-gray-600', past_due: 'bg-yellow-100 text-yellow-700' };
    const labels = { active: 'Actif', cancelled: 'Annulé', expired: 'Expiré', past_due: 'En retard' };
    return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${map[status] ?? 'bg-gray-100 text-gray-600'}`}>{labels[status] ?? status}</span>;
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

            {flash?.success && <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm border border-green-200">{flash.success}</div>}

            <div className="bg-white rounded-xl border border-gray-200">
                <div className="p-5 border-b border-gray-100 flex gap-2 flex-wrap">
                    {['all', 'active', 'cancelled', 'expired'].map((s) => (
                        <button key={s} onClick={() => applyFilter(s)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${status === s ? 'bg-orange-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                            {s === 'all' ? 'Tous' : s === 'active' ? 'Actifs' : s === 'cancelled' ? 'Annulés' : 'Expirés'}
                        </button>
                    ))}
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                {['Auto-école', 'Plan', 'Prix', 'Statut', 'Début', 'Fin', 'Actions'].map((h) => (
                                    <th key={h} className="px-4 py-3 text-left font-medium text-gray-600">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {subscriptions.data.map((sub) => (
                                <tr key={sub.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 font-medium text-gray-900">{sub.auto_school?.name ?? '—'}</td>
                                    <td className="px-4 py-3 text-gray-600">{sub.plan?.name ?? '—'}</td>
                                    <td className="px-4 py-3 text-gray-600">{sub.plan?.price ? `${Number(sub.plan.price).toLocaleString()} MAD` : '—'}</td>
                                    <td className="px-4 py-3"><StatusBadge status={sub.status} /></td>
                                    <td className="px-4 py-3 text-gray-500">{sub.started_at ? new Date(sub.started_at).toLocaleDateString('fr-FR') : '—'}</td>
                                    <td className="px-4 py-3 text-gray-500">{sub.expires_at ? new Date(sub.expires_at).toLocaleDateString('fr-FR') : '—'}</td>
                                    <td className="px-4 py-3">
                                        {sub.status === 'active' && (
                                            <button onClick={() => cancel(sub)} className="text-xs px-2 py-1 rounded bg-red-50 text-red-700 hover:bg-red-100 font-medium">
                                                Annuler
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {subscriptions.data.length === 0 && (
                                <tr><td colSpan={7} className="px-4 py-10 text-center text-gray-400">Aucun abonnement trouvé</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {subscriptions.links && (
                    <div className="p-4 border-t border-gray-100 flex gap-1 justify-center">
                        {subscriptions.links.map((link, i) => (
                            <Link key={i} href={link.url ?? '#'} dangerouslySetInnerHTML={{ __html: link.label }}
                                className={`px-3 py-1.5 rounded text-sm ${link.active ? 'bg-orange-600 text-white' : link.url ? 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50' : 'bg-white border border-gray-100 text-gray-300 cursor-default'}`}
                                preserveScroll />
                        ))}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
