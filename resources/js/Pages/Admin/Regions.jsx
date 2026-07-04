import { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Map, Plus, Pencil, Trash2, ToggleLeft, ToggleRight, Search } from 'lucide-react';

function Modal({ title, onClose, children }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h2 className="font-semibold text-gray-900">{title}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
                </div>
                <div className="px-6 py-5">{children}</div>
            </div>
        </div>
    );
}

export default function Regions({ regions, filters, stats }) {
    const { flash, errors } = usePage().props;
    const [modal, setModal] = useState(null);
    const [form, setForm] = useState({ name: '', code: '', capital: '', is_active: true });
    const [search, setSearch] = useState(filters?.search ?? '');
    const [processing, setProcessing] = useState(false);

    const openCreate = () => { setForm({ name: '', code: '', capital: '', is_active: true }); setModal('create'); };
    const openEdit = (r) => { setForm({ name: r.name, code: r.code, capital: r.capital ?? '', is_active: r.is_active }); setModal({ type: 'edit', id: r.id }); };

    const submit = () => {
        if (processing) return;
        setProcessing(true);
        const opts = { onSuccess: () => setModal(null), onFinish: () => setProcessing(false) };
        if (modal === 'create') {
            router.post(route('admin.regions.store'), form, opts);
        } else {
            router.put(route('admin.regions.update', modal.id), form, opts);
        }
    };

    const del = (id) => { if (confirm('Supprimer cette région ?')) router.delete(route('admin.regions.destroy', id)); };

    const doSearch = (e) => {
        e.preventDefault();
        router.get(route('admin.regions.index'), { search }, { preserveState: true, replace: true });
    };

    return (
        <AdminLayout title="Régions">
            <Head title="Régions - Admin" />

            {flash?.success && <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">{flash.success}</div>}
            {flash?.error   && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{flash.error}</div>}

            {/* KPIs */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                {[
                    { label: 'Total régions', value: stats.total, color: 'orange' },
                    { label: 'Actives',       value: stats.active, color: 'green' },
                ].map((k) => (
                    <div key={k.label} className="bg-white rounded-xl border border-gray-100 p-4">
                        <p className="text-sm text-gray-500">{k.label}</p>
                        <p className={`text-2xl font-bold text-${k.color}-600 mt-1`}>{k.value}</p>
                    </div>
                ))}
            </div>

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-3 mb-5">
                <form onSubmit={doSearch} className="flex gap-2 flex-1">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher une région…"
                            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500" />
                    </div>
                    <button type="submit" className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200">Filtrer</button>
                </form>
                <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg text-sm hover:bg-orange-700">
                    <Plus className="w-4 h-4" /> Ajouter une région
                </button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                        <tr>
                            <th className="px-4 py-3 text-left">Région</th>
                            <th className="px-4 py-3 text-left">Code</th>
                            <th className="px-4 py-3 text-left">Capitale</th>
                            <th className="px-4 py-3 text-left">Auto-écoles</th>
                            <th className="px-4 py-3 text-left">Statut</th>
                            <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {regions.data.length === 0 && (
                            <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">Aucune région trouvée.</td></tr>
                        )}
                        {regions.data.map((r) => (
                            <tr key={r.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3 font-medium text-gray-900">{r.name}</td>
                                <td className="px-4 py-3">
                                    <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs font-mono">{r.code}</span>
                                </td>
                                <td className="px-4 py-3 text-gray-600">{r.capital ?? '—'}</td>
                                <td className="px-4 py-3 text-gray-600">{r.schools_count ?? 0}</td>
                                <td className="px-4 py-3">
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${r.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                        {r.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button onClick={() => openEdit(r)} aria-label="Modifier" className="p-1.5 text-gray-400 hover:text-blue-600 rounded">
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => del(r.id)} aria-label="Supprimer" className="p-1.5 text-gray-400 hover:text-red-600 rounded">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Pagination */}
                {regions.last_page > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                        <span className="text-sm text-gray-500">Page {regions.current_page} / {regions.last_page}</span>
                        <div className="flex gap-2">
                            {regions.prev_page_url && <button onClick={() => router.get(regions.prev_page_url)} className="px-3 py-1 text-sm border border-gray-200 rounded hover:bg-gray-50">Précédent</button>}
                            {regions.next_page_url && <button onClick={() => router.get(regions.next_page_url)} className="px-3 py-1 text-sm border border-gray-200 rounded hover:bg-gray-50">Suivant</button>}
                        </div>
                    </div>
                )}
            </div>

            {/* Modal */}
            {modal && (
                <Modal title={modal === 'create' ? 'Nouvelle région' : 'Modifier la région'} onClose={() => setModal(null)}>
                    <div className="space-y-4">
                        {errors && Object.keys(errors).length > 0 && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                                <ul className="list-disc list-inside">
                                    {Object.values(errors).map((msg, i) => <li key={i}>{msg}</li>)}
                                </ul>
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                            <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Code *</label>
                            <input value={form.code} onChange={e => setForm(p => ({ ...p, code: e.target.value.toUpperCase() }))}
                                maxLength={20} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-orange-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Capitale</label>
                            <input value={form.capital} onChange={e => setForm(p => ({ ...p, capital: e.target.value }))}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500" />
                        </div>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={form.is_active} onChange={e => setForm(p => ({ ...p, is_active: e.target.checked }))}
                                className="rounded border-gray-300 text-orange-600" />
                            <span className="text-sm text-gray-700">Région active</span>
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
