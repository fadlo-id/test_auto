import { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Megaphone, Plus, Pencil, Trash2, Search, MousePointer, Eye } from 'lucide-react';

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

const POSITIONS = ['header', 'sidebar', 'footer', 'search', 'detail'];
const EMPTY = { title: '', image_url: '', link_url: '', position: 'sidebar', is_active: true, starts_at: '', ends_at: '', notes: '' };

export default function Ads({ ads, filters, stats }) {
    const { flash } = usePage().props;
    const [modal, setModal] = useState(null);
    const [form, setForm] = useState(EMPTY);
    const [search, setSearch] = useState(filters?.search ?? '');
    const [processing, setProcessing] = useState(false);

    const openCreate = () => { setForm(EMPTY); setModal('create'); };
    const openEdit = (ad) => {
        setForm({ title: ad.title, image_url: ad.image_url ?? '', link_url: ad.link_url ?? '',
            position: ad.position, is_active: ad.is_active, starts_at: ad.starts_at ?? '', ends_at: ad.ends_at ?? '', notes: ad.notes ?? '' });
        setModal({ type: 'edit', id: ad.id });
    };

    const submit = () => {
        if (processing) return;
        setProcessing(true);
        const opts = { onSuccess: () => setModal(null), onFinish: () => setProcessing(false) };
        if (modal === 'create') {
            router.post(route('admin.ads.store'), form, opts);
        } else {
            router.put(route('admin.ads.update', modal.id), form, opts);
        }
    };

    const del = (id) => { if (confirm('Supprimer cette publicité ?')) router.delete(route('admin.ads.destroy', id)); };

    const positionColors = { header: 'blue', sidebar: 'purple', footer: 'gray', search: 'green', detail: 'orange' };

    return (
        <AdminLayout title="Publicités">
            <Head title="Publicités - Admin" />

            {flash?.success && <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">{flash.success}</div>}
            {flash?.error   && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{flash.error}</div>}

            {/* KPIs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                {[
                    { label: 'Total pubs',     value: stats.total,        icon: Megaphone,    color: 'orange' },
                    { label: 'Actives',         value: stats.active,       icon: Megaphone,    color: 'green'  },
                    { label: 'Total clics',     value: stats.total_clicks, icon: MousePointer, color: 'blue'   },
                    { label: 'Impressions',     value: stats.total_views,  icon: Eye,          color: 'purple' },
                ].map((k) => (
                    <div key={k.label} className="bg-white rounded-xl border border-gray-100 p-4">
                        <p className="text-xs text-gray-500">{k.label}</p>
                        <p className={`text-2xl font-bold text-${k.color}-600 mt-1`}>{k.value.toLocaleString()}</p>
                    </div>
                ))}
            </div>

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-3 mb-5">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input value={search} onChange={e => setSearch(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && router.get(route('admin.ads.index'), { search }, { preserveState: true, replace: true })}
                        placeholder="Rechercher…"
                        className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500" />
                </div>
                <select value={filters?.position ?? ''} onChange={e => router.get(route('admin.ads.index'), { ...filters, position: e.target.value }, { preserveState: true, replace: true })}
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500">
                    <option value="">Toutes positions</option>
                    {POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg text-sm hover:bg-orange-700">
                    <Plus className="w-4 h-4" /> Nouvelle pub
                </button>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {ads.data.length === 0 && (
                    <div className="col-span-3 text-center py-12 text-gray-400">Aucune publicité trouvée.</div>
                )}
                {ads.data.map((ad) => (
                    <div key={ad.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-sm transition-shadow">
                        {ad.image_url && (
                            <div className="h-32 bg-gray-100 overflow-hidden">
                                <img src={ad.image_url} alt={ad.title} className="w-full h-full object-cover" onError={e => e.target.style.display='none'} />
                            </div>
                        )}
                        <div className="p-4">
                            <div className="flex items-start justify-between gap-2 mb-2">
                                <h3 className="font-medium text-gray-900 text-sm leading-tight">{ad.title}</h3>
                                <span className={`px-2 py-0.5 rounded text-xs font-medium flex-shrink-0 ${ad.is_live ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                    {ad.is_live ? 'Live' : 'Off'}
                                </span>
                            </div>
                            <span className={`inline-block px-2 py-0.5 rounded text-xs bg-${positionColors[ad.position] ?? 'gray'}-100 text-${positionColors[ad.position] ?? 'gray'}-700 mb-2`}>
                                {ad.position}
                            </span>
                            <div className="flex items-center gap-4 text-xs text-gray-400 mb-3">
                                <span className="flex items-center gap-1"><MousePointer className="w-3 h-3" />{ad.clicks_count}</span>
                                <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{ad.impressions_count}</span>
                            </div>
                            <div className="flex items-center justify-end gap-2">
                                <button onClick={() => openEdit(ad)} className="p-1.5 text-gray-400 hover:text-blue-600 rounded"><Pencil className="w-4 h-4" /></button>
                                <button onClick={() => del(ad.id)} className="p-1.5 text-gray-400 hover:text-red-600 rounded"><Trash2 className="w-4 h-4" /></button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Pagination */}
            {ads.last_page > 1 && (
                <div className="flex items-center justify-between mt-4">
                    <span className="text-sm text-gray-500">Page {ads.current_page} / {ads.last_page}</span>
                    <div className="flex gap-2">
                        {ads.prev_page_url && <button onClick={() => router.get(ads.prev_page_url)} className="px-3 py-1 text-sm border rounded hover:bg-gray-50">Précédent</button>}
                        {ads.next_page_url && <button onClick={() => router.get(ads.next_page_url)} className="px-3 py-1 text-sm border rounded hover:bg-gray-50">Suivant</button>}
                    </div>
                </div>
            )}

            {/* Modal */}
            {modal && (
                <Modal title={modal === 'create' ? 'Nouvelle publicité' : 'Modifier la publicité'} onClose={() => setModal(null)}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Titre *</label>
                            <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Image (URL)</label>
                            <input value={form.image_url} onChange={e => setForm(p => ({ ...p, image_url: e.target.value }))} type="url"
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Lien de destination</label>
                            <input value={form.link_url} onChange={e => setForm(p => ({ ...p, link_url: e.target.value }))} type="url"
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Position *</label>
                            <select value={form.position} onChange={e => setForm(p => ({ ...p, position: e.target.value }))}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500">
                                {POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Début</label>
                                <input type="date" value={form.starts_at} onChange={e => setForm(p => ({ ...p, starts_at: e.target.value }))}
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Fin</label>
                                <input type="date" value={form.ends_at} onChange={e => setForm(p => ({ ...p, ends_at: e.target.value }))}
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500" />
                            </div>
                        </div>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={form.is_active} onChange={e => setForm(p => ({ ...p, is_active: e.target.checked }))}
                                className="rounded border-gray-300 text-orange-600" />
                            <span className="text-sm text-gray-700">Publicité active</span>
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
