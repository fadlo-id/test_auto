import { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Ticket, Plus, Pencil, Trash2, Search, Zap } from 'lucide-react';

function Modal({ title, onClose, children }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white">
                    <h2 className="font-semibold text-gray-900">{title}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
                </div>
                <div className="px-6 py-5">{children}</div>
            </div>
        </div>
    );
}

const EMPTY = { code: '', discount_type: 'percent', discount_value: '', min_amount: '', max_uses: '', expires_at: '', is_active: true, description: '' };

export default function Coupons({ coupons, filters, stats }) {
    const { flash } = usePage().props;
    const [modal, setModal] = useState(null);
    const [form, setForm] = useState(EMPTY);
    const [search, setSearch] = useState(filters?.search ?? '');
    const [status, setStatus] = useState(filters?.status ?? '');
    const [processing, setProcessing] = useState(false);

    const openCreate = () => { setForm(EMPTY); setModal('create'); };
    const openEdit = (c) => {
        setForm({
            code: c.code, discount_type: c.discount_type,
            discount_value: c.discount_value, min_amount: c.min_amount ?? '',
            max_uses: c.max_uses ?? '', expires_at: c.expires_at ?? '',
            is_active: c.is_active, description: c.description ?? '',
        });
        setModal({ type: 'edit', id: c.id });
    };

    const submit = () => {
        if (processing) return;
        setProcessing(true);
        const payload = { ...form };
        const opts = { onSuccess: () => setModal(null), onFinish: () => setProcessing(false) };
        if (modal === 'create') {
            router.post(route('admin.coupons.store'), payload, opts);
        } else {
            router.put(route('admin.coupons.update', modal.id), payload, opts);
        }
    };

    const del = (id) => { if (confirm('Supprimer ce coupon ?')) router.delete(route('admin.coupons.destroy', id)); };

    const doFilter = () => {
        router.get(route('admin.coupons.index'), { search, status }, { preserveState: true, replace: true });
    };

    const badge = (c) => {
        if (c.is_expired) return <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs">Expiré</span>;
        if (c.is_exhausted) return <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-xs">Épuisé</span>;
        if (!c.is_active) return <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full text-xs">Inactif</span>;
        return <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs">Actif</span>;
    };

    return (
        <AdminLayout title="Coupons de réduction">
            <Head title="Coupons - Admin" />

            {flash?.success && <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">{flash.success}</div>}
            {flash?.error   && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{flash.error}</div>}

            {/* KPIs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                {[
                    { label: 'Total',        value: stats.total,       color: 'orange' },
                    { label: 'Actifs',        value: stats.active,      color: 'green'  },
                    { label: 'Expirés',       value: stats.expired,     color: 'red'    },
                    { label: 'Utilisations',  value: stats.total_uses,  color: 'blue'   },
                ].map((k) => (
                    <div key={k.label} className="bg-white rounded-xl border border-gray-100 p-4">
                        <p className="text-xs text-gray-500">{k.label}</p>
                        <p className={`text-2xl font-bold text-${k.color}-600 mt-1`}>{k.value}</p>
                    </div>
                ))}
            </div>

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-3 mb-5">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && doFilter()}
                        placeholder="Rechercher un code…"
                        className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500" />
                </div>
                <select value={status} onChange={e => { setStatus(e.target.value); router.get(route('admin.coupons.index'), { search, status: e.target.value }, { preserveState: true, replace: true }); }}
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500">
                    <option value="">Tous les statuts</option>
                    <option value="active">Actifs</option>
                    <option value="inactive">Inactifs</option>
                    <option value="expired">Expirés</option>
                </select>
                <div className="flex gap-2">
                    <button onClick={() => router.post(route('admin.coupons.generate'), {}, {})} className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200">
                        <Zap className="w-4 h-4" /> Générer
                    </button>
                    <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg text-sm hover:bg-orange-700">
                        <Plus className="w-4 h-4" /> Nouveau
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                        <tr>
                            <th className="px-4 py-3 text-left">Code</th>
                            <th className="px-4 py-3 text-left">Remise</th>
                            <th className="px-4 py-3 text-left">Utilisations</th>
                            <th className="px-4 py-3 text-left">Expiration</th>
                            <th className="px-4 py-3 text-left">Statut</th>
                            <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {coupons.data.length === 0 && (
                            <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">Aucun coupon trouvé.</td></tr>
                        )}
                        {coupons.data.map((c) => (
                            <tr key={c.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3">
                                    <span className="font-mono font-semibold text-gray-900 bg-gray-100 px-2 py-0.5 rounded">{c.code}</span>
                                    {c.description && <p className="text-xs text-gray-400 mt-0.5">{c.description}</p>}
                                </td>
                                <td className="px-4 py-3 font-semibold text-gray-800">
                                    {c.discount_type === 'percent' ? `${c.discount_value}%` : `${c.discount_value} MAD`}
                                </td>
                                <td className="px-4 py-3 text-gray-600">
                                    {c.used_count}{c.max_uses ? ` / ${c.max_uses}` : ''}
                                </td>
                                <td className="px-4 py-3 text-gray-500">{c.expires_at ?? '—'}</td>
                                <td className="px-4 py-3">{badge(c)}</td>
                                <td className="px-4 py-3 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button onClick={() => openEdit(c)} aria-label="Modifier" className="p-1.5 text-gray-400 hover:text-blue-600 rounded"><Pencil className="w-4 h-4" /></button>
                                        <button onClick={() => del(c.id)} aria-label="Supprimer" className="p-1.5 text-gray-400 hover:text-red-600 rounded"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {coupons.last_page > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                        <span className="text-sm text-gray-500">Page {coupons.current_page} / {coupons.last_page}</span>
                        <div className="flex gap-2">
                            {coupons.prev_page_url && <button onClick={() => router.get(coupons.prev_page_url)} className="px-3 py-1 text-sm border rounded hover:bg-gray-50">Précédent</button>}
                            {coupons.next_page_url && <button onClick={() => router.get(coupons.next_page_url)} className="px-3 py-1 text-sm border rounded hover:bg-gray-50">Suivant</button>}
                        </div>
                    </div>
                )}
            </div>

            {/* Modal */}
            {modal && (
                <Modal title={modal === 'create' ? 'Nouveau coupon' : 'Modifier le coupon'} onClose={() => setModal(null)}>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Code *</label>
                                <input value={form.code} onChange={e => setForm(p => ({ ...p, code: e.target.value.toUpperCase() }))}
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-orange-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                                <select value={form.discount_type} onChange={e => setForm(p => ({ ...p, discount_type: e.target.value }))}
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500">
                                    <option value="percent">Pourcentage (%)</option>
                                    <option value="fixed">Montant fixe (MAD)</option>
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Valeur *</label>
                                <input type="number" value={form.discount_value} onChange={e => setForm(p => ({ ...p, discount_value: e.target.value }))}
                                    min="0" max={form.discount_type === 'percent' ? 100 : undefined}
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Montant min.</label>
                                <input type="number" value={form.min_amount} onChange={e => setForm(p => ({ ...p, min_amount: e.target.value }))}
                                    min="0" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Max utilisations</label>
                                <input type="number" value={form.max_uses} onChange={e => setForm(p => ({ ...p, max_uses: e.target.value }))}
                                    min="1" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Expiration</label>
                                <input type="date" value={form.expires_at} onChange={e => setForm(p => ({ ...p, expires_at: e.target.value }))}
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500" />
                        </div>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={form.is_active} onChange={e => setForm(p => ({ ...p, is_active: e.target.checked }))}
                                className="rounded border-gray-300 text-orange-600" />
                            <span className="text-sm text-gray-700">Coupon actif</span>
                        </label>
                        <div className="flex justify-end gap-3 pt-2">
                            <button onClick={() => setModal(null)} className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">Annuler</button>
                            <button onClick={submit} disabled={processing} className="px-4 py-2 text-sm bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed">{processing ? 'Enregistrement…' : 'Enregistrer'}</button>
                        </div>
                    </div>
                </Modal>
            )}
        </AdminLayout>
    );
}
