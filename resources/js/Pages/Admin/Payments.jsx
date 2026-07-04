import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { RotateCcw } from 'lucide-react';

function StatusBadge({ status }) {
    const cls = {
        success:  'badge badge-green',
        completed:'badge badge-green',
        pending:  'badge badge-yellow',
        failed:   'badge badge-red',
        refunded: 'bg-purple-50 text-purple-700 text-xs font-semibold px-2 py-0.5 rounded-full',
    };
    const lbl = { success: 'Succès', completed: 'Succès', pending: 'En attente', failed: 'Échoué', refunded: 'Remboursé' };
    return <span className={cls[status] ?? 'badge badge-gray'}>{lbl[status] ?? status}</span>;
}

export default function Payments({ payments, stats, filters }) {
    const { flash } = usePage().props;
    const [search, setSearch]       = useState(filters?.search ?? '');
    const [confirming, setConfirming] = useState(null);

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('admin.payments.index'), { search }, { preserveState: true, replace: true });
    };

    const handleRefund = (payment) => {
        router.post(route('admin.payments.refund', payment.id), {}, { preserveScroll: true });
        setConfirming(null);
    };

    return (
        <AdminLayout title="Paiements">
            <Head title="Admin — Paiements" />

            {flash?.success && <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm border border-green-200">{flash.success}</div>}
            {flash?.error   && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200">{flash.error}</div>}

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <p className="text-xs font-medium text-gray-500 mb-1">Revenu total</p>
                    <p className="text-2xl font-extrabold text-gray-900">{Number(stats.total_revenue).toLocaleString()} MAD</p>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <p className="text-xs font-medium text-gray-500 mb-1">Paiements réussis</p>
                    <p className="text-2xl font-extrabold text-gray-900">{stats.total_payments}</p>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <p className="text-xs font-medium text-gray-500 mb-1">Échoués</p>
                    <p className="text-2xl font-extrabold text-amber-600">{stats.failed_count ?? 0}</p>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <p className="text-xs font-medium text-gray-500 mb-1">Remboursés</p>
                    <p className="text-2xl font-extrabold text-purple-600">{stats.refunded_count ?? 0}</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-50">
                    <form onSubmit={handleSearch} className="flex gap-2.5">
                        <input type="text" placeholder="Rechercher par auto-école…" value={search} onChange={(e) => setSearch(e.target.value)}
                            className="flex-1 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500" />
                        <button type="submit" className="px-4 py-2.5 bg-orange-600 text-white rounded-xl text-sm font-semibold hover:bg-orange-700 shadow-sm transition-colors">
                            Rechercher
                        </button>
                    </form>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                {['Auto-école', 'Propriétaire', 'Plan', 'Montant', 'Statut', 'Date', 'Action'].map((h) => (
                                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {payments.data.map((p) => (
                                <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50/70 transition-colors">
                                    <td className="px-4 py-3 font-semibold text-gray-900">{p.auto_school?.name ?? '—'}</td>
                                    <td className="px-4 py-3 text-gray-500 text-xs">{p.auto_school?.user?.email ?? '—'}</td>
                                    <td className="px-4 py-3 text-gray-600">{p.plan?.name ?? '—'}</td>
                                    <td className="px-4 py-3 font-bold text-gray-900">
                                        {Number(p.amount).toLocaleString()} <span className="text-gray-400 font-normal">{p.currency}</span>
                                        {p.discount_amount > 0 && (
                                            <span className="ml-1 text-xs text-green-600">(-{Number(p.discount_amount).toLocaleString()})</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                                    <td className="px-4 py-3 text-gray-400 text-xs">{new Date(p.created_at).toLocaleDateString('fr-FR')}</td>
                                    <td className="px-4 py-3">
                                        {p.status === 'success' && (
                                            confirming === p.id ? (
                                                <div className="flex items-center gap-1">
                                                    <button onClick={() => handleRefund(p)}
                                                        className="px-2 py-1 text-xs bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium">
                                                        Confirmer
                                                    </button>
                                                    <button onClick={() => setConfirming(null)}
                                                        className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200">
                                                        Annuler
                                                    </button>
                                                </div>
                                            ) : (
                                                <button onClick={() => setConfirming(p.id)}
                                                    className="flex items-center gap-1 px-2 py-1 text-xs text-purple-700 bg-purple-50 rounded-lg hover:bg-purple-100 border border-purple-200 font-medium transition-colors">
                                                    <RotateCcw className="w-3 h-3" />
                                                    Rembourser
                                                </button>
                                            )
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {payments.data.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-4 py-16 text-center">
                                        <p className="text-gray-400 font-medium">Aucun paiement trouvé</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {payments.links && (
                    <div className="px-4 py-4 border-t border-gray-50 flex gap-1.5 justify-center">
                        {payments.links.map((link, i) => (
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
