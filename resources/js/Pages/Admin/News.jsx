import { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Newspaper, Plus, Pencil, Trash2, Search, Eye, EyeOff } from 'lucide-react';

function Modal({ title, onClose, children }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white">
                    <h2 className="font-semibold text-gray-900">{title}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
                </div>
                <div className="px-6 py-5">{children}</div>
            </div>
        </div>
    );
}

const CATEGORIES = [
    { value: 'news',   label: 'Actualités' },
    { value: 'guide',  label: 'Guide'       },
    { value: 'promo',  label: 'Promotion'   },
    { value: 'update', label: 'Mise à jour' },
];

const EMPTY = { title: '', excerpt: '', content: '', image_url: '', category: 'news', is_published: false };

export default function News({ articles, filters, stats }) {
    const { flash } = usePage().props;
    const [modal, setModal] = useState(null);
    const [form, setForm] = useState(EMPTY);
    const [search, setSearch] = useState(filters?.search ?? '');

    const openCreate = () => { setForm(EMPTY); setModal('create'); };
    const openEdit = (a) => {
        setForm({ title: a.title, excerpt: a.excerpt ?? '', content: a.content, image_url: a.image_url ?? '', category: a.category, is_published: a.is_published });
        setModal({ type: 'edit', id: a.id });
    };

    const submit = () => {
        if (modal === 'create') {
            router.post(route('admin.news.store'), form, { onSuccess: () => setModal(null) });
        } else {
            router.put(route('admin.news.update', modal.id), form, { onSuccess: () => setModal(null) });
        }
    };

    const del = (id) => { if (confirm('Supprimer cet article ?')) router.delete(route('admin.news.destroy', id)); };
    const toggle = (id) => router.post(route('admin.news.toggle', id));

    const applyFilter = (key, val) => {
        router.get(route('admin.news.index'), { ...filters, [key]: val }, { preserveState: true, replace: true });
    };

    const catLabel = (cat) => CATEGORIES.find(c => c.value === cat)?.label ?? cat;

    return (
        <AdminLayout title="Actualités">
            <Head title="Actualités - Admin" />

            {flash?.success && <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">{flash.success}</div>}
            {flash?.error   && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{flash.error}</div>}

            {/* KPIs */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                {[
                    { label: 'Total articles', value: stats.total,     color: 'orange' },
                    { label: 'Publiés',         value: stats.published, color: 'green'  },
                    { label: 'Brouillons',       value: stats.drafts,    color: 'yellow' },
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
                    <input value={search} onChange={e => setSearch(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && applyFilter('search', search)}
                        placeholder="Rechercher un article…"
                        className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500" />
                </div>
                <select value={filters?.status ?? ''} onChange={e => applyFilter('status', e.target.value)}
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500">
                    <option value="">Tous les statuts</option>
                    <option value="published">Publiés</option>
                    <option value="draft">Brouillons</option>
                </select>
                <select value={filters?.category ?? ''} onChange={e => applyFilter('category', e.target.value)}
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500">
                    <option value="">Toutes catégories</option>
                    {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
                <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg text-sm hover:bg-orange-700">
                    <Plus className="w-4 h-4" /> Nouvel article
                </button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                        <tr>
                            <th className="px-4 py-3 text-left">Titre</th>
                            <th className="px-4 py-3 text-left">Catégorie</th>
                            <th className="px-4 py-3 text-left">Auteur</th>
                            <th className="px-4 py-3 text-left">Statut</th>
                            <th className="px-4 py-3 text-left">Date</th>
                            <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {articles.data.length === 0 && (
                            <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">Aucun article trouvé.</td></tr>
                        )}
                        {articles.data.map((a) => (
                            <tr key={a.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3">
                                    <p className="font-medium text-gray-900 leading-tight">{a.title}</p>
                                    {a.excerpt && <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{a.excerpt}</p>}
                                </td>
                                <td className="px-4 py-3">
                                    <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs">{catLabel(a.category)}</span>
                                </td>
                                <td className="px-4 py-3 text-gray-500 text-xs">{a.author?.name ?? '—'}</td>
                                <td className="px-4 py-3">
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${a.is_published ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                        {a.is_published ? 'Publié' : 'Brouillon'}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-gray-400 text-xs">
                                    {a.published_at ? new Date(a.published_at).toLocaleDateString('fr-FR') : new Date(a.created_at).toLocaleDateString('fr-FR')}
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button onClick={() => toggle(a.id)} className={`p-1.5 rounded ${a.is_published ? 'text-green-500 hover:text-yellow-600' : 'text-gray-400 hover:text-green-600'}`}
                                            title={a.is_published ? 'Dépublier' : 'Publier'}>
                                            {a.is_published ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                        </button>
                                        <button onClick={() => openEdit(a)} className="p-1.5 text-gray-400 hover:text-blue-600 rounded"><Pencil className="w-4 h-4" /></button>
                                        <button onClick={() => del(a.id)} className="p-1.5 text-gray-400 hover:text-red-600 rounded"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {articles.last_page > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                        <span className="text-sm text-gray-500">Page {articles.current_page} / {articles.last_page}</span>
                        <div className="flex gap-2">
                            {articles.prev_page_url && <button onClick={() => router.get(articles.prev_page_url)} className="px-3 py-1 text-sm border rounded hover:bg-gray-50">Précédent</button>}
                            {articles.next_page_url && <button onClick={() => router.get(articles.next_page_url)} className="px-3 py-1 text-sm border rounded hover:bg-gray-50">Suivant</button>}
                        </div>
                    </div>
                )}
            </div>

            {/* Modal */}
            {modal && (
                <Modal title={modal === 'create' ? 'Nouvel article' : 'Modifier l\'article'} onClose={() => setModal(null)}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Titre *</label>
                            <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie *</label>
                                <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500">
                                    {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Image (URL)</label>
                                <input value={form.image_url} onChange={e => setForm(p => ({ ...p, image_url: e.target.value }))} type="url"
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Résumé</label>
                            <textarea value={form.excerpt} onChange={e => setForm(p => ({ ...p, excerpt: e.target.value }))} rows={2}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Contenu *</label>
                            <textarea value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))} rows={8}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 font-mono" />
                        </div>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={form.is_published} onChange={e => setForm(p => ({ ...p, is_published: e.target.checked }))}
                                className="rounded border-gray-300 text-orange-600" />
                            <span className="text-sm text-gray-700">Publier immédiatement</span>
                        </label>
                        <div className="flex justify-end gap-3 pt-2">
                            <button onClick={() => setModal(null)} className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">Annuler</button>
                            <button onClick={submit} className="px-4 py-2 text-sm bg-orange-600 text-white rounded-lg hover:bg-orange-700">Enregistrer</button>
                        </div>
                    </div>
                </Modal>
            )}
        </AdminLayout>
    );
}
