import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';

function StatusBadge({ status }) {
    const map = { completed: 'bg-green-100 text-green-700', pending: 'bg-yellow-100 text-yellow-700', failed: 'bg-red-100 text-red-700' };
    return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${map[status] ?? 'bg-gray-100 text-gray-600'}`}>{status}</span>;
}

export default function Payments({ payments, stats, filters }) {
    const { flash } = usePage().props;
    const [search, setSearch] = useState(filters.search ?? '');

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('admin.payments.index'), { search }, { preserveState: true, replace: true });
    };

    return (
        <AdminLayout title="Paiements">
            <Head title="Admin — Paiements" />

            {flash?.success && <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm border border-green-200">{flash.success}</div>}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <p className="text-sm text-gray-500">Revenu total</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{Number(stats.total_revenue).toLocaleString()} MAD</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <p className="text-sm text-gray-500">Total paiements</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total_payments}</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <p className="text-sm text-gray-500">En attente</p>
                    <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.pending_count}</p>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200">
                <div className="p-5 border-b border-gray-100">
                    <form onSubmit={handleSearch} className="flex gap-2">
                        <input type="text" placeholder="Rechercher auto-école..." value={search} onChange={(e) => setSearch(e.target.value)}
                            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
                        <button type="submit" className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700">Rechercher</button>
                    </form>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                {['Auto-école', 'Propriétaire', 'Plan', 'Montant', 'Statut', 'Date'].map((h) => (
                                    <th key={h} className="px-4 py-3 text-left font-medium text-gray-600">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {payments.data.map((p) => (
                                <tr key={p.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 font-medium text-gray-900">{p.auto_school?.name ?? '—'}</td>
                                    <td className="px-4 py-3 text-gray-600">{p.auto_school?.user?.email ?? '—'}</td>
                                    <td className="px-4 py-3 text-gray-600">{p.plan?.name ?? '—'}</td>
                                    <td className="px-4 py-3 font-medium">{Number(p.amount).toLocaleString()} {p.currency}</td>
                                    <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                                    <td className="px-4 py-3 text-gray-500">{new Date(p.created_at).toLocaleDateString('fr-FR')}</td>
                                </tr>
                            ))}
                            {payments.data.length === 0 && (
                                <tr><td colSpan={6} className="px-4 py-10 text-center text-gray-400">Aucun paiement trouvé</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {payments.links && (
                    <div className="p-4 border-t border-gray-100 flex gap-1 justify-center">
                        {payments.links.map((link, i) => (
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
