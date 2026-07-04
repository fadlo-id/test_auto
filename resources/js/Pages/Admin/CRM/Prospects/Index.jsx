import { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    Plus, Search, Filter, ChevronUp, ChevronDown, Mail, Phone,
    MessageSquare, Bell, Pencil, Trash2, X, Building2,
} from 'lucide-react';

const STATUS_STYLES = {
    active:   'bg-blue-100 text-blue-700',
    won:      'bg-green-100 text-green-700',
    lost:     'bg-red-100 text-red-700',
    archived: 'bg-gray-100 text-gray-500',
};

const STATUS_LABELS = { active: 'Actif', won: 'Gagné', lost: 'Perdu', archived: 'Archivé' };

const SOURCE_LABELS = {
    website: 'Site web', referral: 'Référence', social: 'Social',
    direct: 'Direct', event: 'Événement', other: 'Autre',
};

function CreateModal({ stages, tags, admins, sources, onClose }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '', email: '', phone: '', city: '', company: '',
        source: 'direct', stage_id: stages[0]?.id ?? '', assigned_to: '',
        description: '', score: 0, tag_ids: [],
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.crm.prospects.store'), {
            onSuccess: () => { reset(); onClose(); },
        });
    };

    const toggleTag = (id) => {
        const ids = data.tag_ids.includes(id)
            ? data.tag_ids.filter(t => t !== id)
            : [...data.tag_ids, id];
        setData('tag_ids', ids);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-5 border-b border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900">Nouveau prospect</h2>
                    <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <form onSubmit={submit} className="p-5 space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="col-span-2">
                            <label className="text-xs font-medium text-gray-700 block mb-1">Nom *</label>
                            <input value={data.name} onChange={e => setData('name', e.target.value)}
                                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-orange-500"
                                placeholder="Nom complet" required />
                            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                        </div>
                        <div>
                            <label className="text-xs font-medium text-gray-700 block mb-1">Email</label>
                            <input type="email" value={data.email} onChange={e => setData('email', e.target.value)}
                                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-orange-500"
                                placeholder="email@exemple.com" />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-gray-700 block mb-1">Téléphone</label>
                            <input value={data.phone} onChange={e => setData('phone', e.target.value)}
                                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-orange-500"
                                placeholder="+212 6XX XXX XXX" />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-gray-700 block mb-1">Ville</label>
                            <input value={data.city} onChange={e => setData('city', e.target.value)}
                                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-orange-500"
                                placeholder="Casablanca" />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-gray-700 block mb-1">Entreprise</label>
                            <input value={data.company} onChange={e => setData('company', e.target.value)}
                                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-orange-500" />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-gray-700 block mb-1">Source</label>
                            <select value={data.source} onChange={e => setData('source', e.target.value)}
                                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-orange-500">
                                {sources.map(s => <option key={s} value={s}>{SOURCE_LABELS[s] ?? s}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-gray-700 block mb-1">Étape</label>
                            <select value={data.stage_id} onChange={e => setData('stage_id', e.target.value)}
                                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-orange-500">
                                {stages.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-gray-700 block mb-1">Assigné à</label>
                            <select value={data.assigned_to} onChange={e => setData('assigned_to', e.target.value)}
                                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-orange-500">
                                <option value="">Non assigné</option>
                                {admins.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-gray-700 block mb-1">Score (0-100)</label>
                            <input type="number" min="0" max="100" value={data.score}
                                onChange={e => setData('score', parseInt(e.target.value) || 0)}
                                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-orange-500" />
                        </div>
                        <div className="col-span-2">
                            <label className="text-xs font-medium text-gray-700 block mb-1">Description</label>
                            <textarea rows={3} value={data.description}
                                onChange={e => setData('description', e.target.value)}
                                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-orange-500 resize-none"
                                placeholder="Notes sur le prospect..." />
                        </div>
                    </div>

                    {tags.length > 0 && (
                        <div>
                            <label className="text-xs font-medium text-gray-700 block mb-2">Tags</label>
                            <div className="flex flex-wrap gap-1.5">
                                {tags.map(tag => (
                                    <button key={tag.id} type="button" onClick={() => toggleTag(tag.id)}
                                        className={`text-xs px-2.5 py-1 rounded-full border font-medium transition-all ${
                                            data.tag_ids.includes(tag.id) ? 'ring-2 ring-offset-1' : 'opacity-60'
                                        }`}
                                        style={{
                                            background: data.tag_ids.includes(tag.id) ? tag.color + '33' : '#f9fafb',
                                            borderColor: tag.color,
                                            color: tag.color,
                                            ringColor: tag.color,
                                        }}>
                                        {tag.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose}
                            className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50">
                            Annuler
                        </button>
                        <button type="submit" disabled={processing}
                            className="flex-1 px-4 py-2.5 bg-orange-600 text-white rounded-xl text-sm font-semibold hover:bg-orange-700 disabled:opacity-50">
                            {processing ? 'Création...' : 'Créer'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function SortHeader({ label, field, filters, onSort }) {
    const isActive = filters.sort === field;
    const isAsc    = filters.dir === 'asc';
    return (
        <button onClick={() => onSort(field, isActive && isAsc ? 'desc' : 'asc')}
            className={`flex items-center gap-1 text-xs font-semibold uppercase tracking-wide ${isActive ? 'text-orange-600' : 'text-gray-500 hover:text-gray-700'}`}>
            {label}
            {isActive ? (isAsc ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />) : null}
        </button>
    );
}

export default function ProspectsIndex({ prospects, filters, stages, tags, admins, sources }) {
    const [showCreate, setShowCreate] = useState(false);
    const [search, setSearch] = useState(filters.search ?? '');

    const applyFilter = (updates) => {
        router.get(route('admin.crm.prospects.index'), { ...filters, ...updates, page: 1 },
            { preserveState: true, replace: true });
    };

    const sort = (field, dir) => applyFilter({ sort: field, dir });

    const destroy = (id) => {
        if (!confirm('Archiver ce prospect ?')) return;
        router.delete(route('admin.crm.prospects.destroy', id), { preserveScroll: true });
    };

    return (
        <AdminLayout>
            <Head title="CRM — Prospects" />
            {showCreate && (
                <CreateModal stages={stages} tags={tags} admins={admins} sources={sources}
                    onClose={() => setShowCreate(false)} />
            )}

            <div className="space-y-5">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Prospects</h1>
                        <p className="text-xs text-gray-500 mt-0.5">{prospects.total} prospect{prospects.total !== 1 ? 's' : ''}</p>
                    </div>
                    <button onClick={() => setShowCreate(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-xl text-sm font-semibold hover:bg-orange-700">
                        <Plus className="w-4 h-4" /> Nouveau
                    </button>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                    <div className="flex flex-wrap gap-3">
                        <div className="relative flex-1 min-w-[200px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input value={search} onChange={e => setSearch(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && applyFilter({ search })}
                                placeholder="Nom, email, téléphone..."
                                className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 text-sm" />
                        </div>
                        <select value={filters.status ?? ''} onChange={e => applyFilter({ status: e.target.value })}
                            className="px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-700">
                            <option value="">Tous les statuts</option>
                            <option value="active">Actif</option>
                            <option value="won">Gagné</option>
                            <option value="lost">Perdu</option>
                            <option value="archived">Archivé</option>
                        </select>
                        <select value={filters.stage_id ?? ''} onChange={e => applyFilter({ stage_id: e.target.value })}
                            className="px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-700">
                            <option value="">Toutes les étapes</option>
                            {stages.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                        <select value={filters.assigned_to ?? ''} onChange={e => applyFilter({ assigned_to: e.target.value })}
                            className="px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-700">
                            <option value="">Tous les assignés</option>
                            {admins.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                        </select>
                        <select value={filters.source ?? ''} onChange={e => applyFilter({ source: e.target.value })}
                            className="px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-700">
                            <option value="">Toutes les sources</option>
                            {sources.map(s => <option key={s} value={s}>{SOURCE_LABELS[s] ?? s}</option>)}
                        </select>
                        {tags.length > 0 && (
                            <select value={filters.tag_id ?? ''} onChange={e => applyFilter({ tag_id: e.target.value })}
                                className="px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-700">
                                <option value="">Tous les tags</option>
                                {tags.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                        )}
                        {Object.values(filters).some(Boolean) && (
                            <button onClick={() => applyFilter({ search: '', status: '', stage_id: '', assigned_to: '', source: '', tag_id: '' })}
                                className="px-3 py-2 text-xs text-gray-500 hover:text-red-600 border border-gray-200 rounded-xl">
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="text-left px-4 py-3">
                                        <SortHeader label="Prospect" field="name" filters={filters} onSort={sort} />
                                    </th>
                                    <th className="text-left px-4 py-3 hidden md:table-cell">
                                        <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Contact</span>
                                    </th>
                                    <th className="text-left px-4 py-3 hidden lg:table-cell">
                                        <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Étape</span>
                                    </th>
                                    <th className="text-left px-4 py-3 hidden lg:table-cell">
                                        <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Assigné</span>
                                    </th>
                                    <th className="text-left px-4 py-3">
                                        <SortHeader label="Score" field="score" filters={filters} onSort={sort} />
                                    </th>
                                    <th className="text-left px-4 py-3">
                                        <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Activité</span>
                                    </th>
                                    <th className="w-20 px-4 py-3" />
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {prospects.data.map(p => (
                                    <tr key={p.id} className="hover:bg-gray-50 group">
                                        <td className="px-4 py-3">
                                            <Link href={route('admin.crm.prospects.show', p.id)} className="block">
                                                <div className="font-medium text-gray-900 text-sm">{p.name}</div>
                                                {p.company && <div className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                                                    <Building2 className="w-3 h-3" /> {p.company}
                                                </div>}
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    {p.tags.map(t => (
                                                        <span key={t.id} className="text-xs px-1.5 py-0.5 rounded-full"
                                                            style={{ background: t.color + '22', color: t.color }}>{t.name}</span>
                                                    ))}
                                                </div>
                                            </Link>
                                        </td>
                                        <td className="px-4 py-3 hidden md:table-cell">
                                            {p.email && <div className="flex items-center gap-1.5 text-xs text-gray-600">
                                                <Mail className="w-3 h-3 text-gray-400" /> {p.email}
                                            </div>}
                                            {p.phone && <div className="flex items-center gap-1.5 text-xs text-gray-600 mt-0.5">
                                                <Phone className="w-3 h-3 text-gray-400" /> {p.phone}
                                            </div>}
                                        </td>
                                        <td className="px-4 py-3 hidden lg:table-cell">
                                            {p.stage ? (
                                                <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                                                    style={{ background: p.stage.color + '22', color: p.stage.color }}>
                                                    {p.stage.name}
                                                </span>
                                            ) : '—'}
                                        </td>
                                        <td className="px-4 py-3 hidden lg:table-cell">
                                            <span className="text-xs text-gray-600">{p.assigned_to?.name ?? '—'}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            {p.score > 0 ? (
                                                <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                                                    p.score >= 70 ? 'bg-green-100 text-green-700' :
                                                    p.score >= 40 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                                                }`}>{p.score}</span>
                                            ) : <span className="text-gray-300">—</span>}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2 text-xs text-gray-400">
                                                {p.notes_count > 0 && (
                                                    <span className="flex items-center gap-0.5">
                                                        <MessageSquare className="w-3 h-3" /> {p.notes_count}
                                                    </span>
                                                )}
                                                {p.reminders_count > 0 && (
                                                    <span className="flex items-center gap-0.5 text-amber-500">
                                                        <Bell className="w-3 h-3" /> {p.reminders_count}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Link href={route('admin.crm.prospects.show', p.id)}
                                                    aria-label="Voir / modifier"
                                                    className="p-1.5 hover:bg-indigo-50 rounded-lg text-indigo-600">
                                                    <Pencil className="w-3.5 h-3.5" />
                                                </Link>
                                                <button onClick={() => destroy(p.id)}
                                                    aria-label="Supprimer"
                                                    className="p-1.5 hover:bg-red-50 rounded-lg text-red-500">
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {prospects.data.length === 0 && (
                        <div className="py-16 text-center">
                            <p className="text-gray-400 text-sm">Aucun prospect trouvé</p>
                        </div>
                    )}

                    {/* Pagination */}
                    {prospects.last_page > 1 && (
                        <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
                            <span className="text-xs text-gray-500">
                                {prospects.from}–{prospects.to} sur {prospects.total}
                            </span>
                            <div className="flex gap-1">
                                {prospects.links.map((link, i) => (
                                    <button key={i} disabled={!link.url}
                                        onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                                            link.active ? 'bg-orange-600 text-white' :
                                            link.url ? 'border border-gray-200 hover:bg-gray-50 text-gray-700' :
                                            'border border-gray-100 text-gray-300 cursor-not-allowed'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
