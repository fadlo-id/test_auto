import AdminLayout from '@/Layouts/AdminLayout';
import { router, Link } from '@inertiajs/react';
import { useState } from 'react';
import { Search, Download, Receipt } from 'lucide-react';

function fmt(amount) {
    return new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD', minimumFractionDigits: 0 }).format(amount / 100);
}

export default function Invoices({ payments, filters, total }) {
    const [search, setSearch] = useState(filters?.search ?? '');

    return (
        <AdminLayout title="Factures">
            <div className="space-y-6">
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-5 text-white">
                    <p className="text-sm font-medium text-orange-100">Chiffre d'affaires total (facturé)</p>
                    <p className="text-4xl font-bold mt-1">{fmt(total)}</p>
                    <p className="text-orange-200 text-xs mt-1">{payments.total ?? 0} factures</p>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <form onSubmit={e => { e.preventDefault(); router.get(route('admin.invoices.index'), { search }); }}
                        className="flex gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input value={search} onChange={e => setSearch(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                                placeholder="Rechercher une auto-école…" />
                        </div>
                        <button type="submit" className="px-4 py-2 bg-orange-600 text-white text-sm font-semibold rounded-lg hover:bg-orange-700 transition-colors">
                            Rechercher
                        </button>
                    </form>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide"># Facture</th>
                                <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">Auto-école</th>
                                <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">Plan</th>
                                <th className="text-right px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">Montant</th>
                                <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">Date</th>
                                <th className="text-center px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">État</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {payments.data?.length === 0 ? (
                                <tr><td colSpan={6} className="text-center py-10 text-gray-400">Aucune facture trouvée.</td></tr>
                            ) : payments.data?.map(p => (
                                <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-4 py-3 font-mono text-xs text-gray-500">FAC-{String(p.id).padStart(6, '0')}</td>
                                    <td className="px-4 py-3 font-medium text-gray-900">{p.auto_school?.name ?? '—'}</td>
                                    <td className="px-4 py-3 text-gray-600">{p.plan?.name ?? '—'}</td>
                                    <td className="px-4 py-3 text-right font-semibold text-gray-900">{fmt(p.amount)}</td>
                                    <td className="px-4 py-3 text-xs text-gray-400">{new Date(p.created_at).toLocaleDateString('fr-FR')}</td>
                                    <td className="px-4 py-3 text-center"><span className="badge-green">Payée</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {payments.last_page > 1 && (
                        <div className="flex justify-center gap-1 px-4 py-3 border-t border-gray-100">
                            {payments.links?.map((link, i) => (
                                link.url ? <Link key={i} href={link.url} className={`px-3 py-1.5 rounded text-xs font-medium ${link.active ? 'bg-orange-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`} dangerouslySetInnerHTML={{ __html: link.label }} />
                                    : <span key={i} className="px-3 py-1.5 rounded text-xs text-gray-300" dangerouslySetInnerHTML={{ __html: link.label }} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
