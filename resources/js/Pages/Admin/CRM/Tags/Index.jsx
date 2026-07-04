import { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { Plus, Pencil, Trash2, X } from 'lucide-react';

const PRESET_COLORS = ['#6366f1','#3b82f6','#8b5cf6','#f59e0b','#10b981','#ef4444','#ec4899','#14b8a6','#f97316','#64748b'];

function TagForm({ initial, onSubmit, onCancel, processing }) {
    const [name, setName]   = useState(initial?.name ?? '');
    const [color, setColor] = useState(initial?.color ?? '#6366f1');

    const submit = (e) => { e.preventDefault(); onSubmit({ name, color }); };

    return (
        <form onSubmit={submit} className="space-y-3">
            <div>
                <label className="text-xs font-medium text-gray-700 block mb-1">Nom *</label>
                <input value={name} onChange={e => setName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-orange-500"
                    placeholder="Nom du tag" required maxLength={80} />
            </div>
            <div>
                <label className="text-xs font-medium text-gray-700 block mb-2">Couleur</label>
                <div className="flex flex-wrap gap-2 mb-2">
                    {PRESET_COLORS.map(c => (
                        <button key={c} type="button" onClick={() => setColor(c)}
                            className={`w-7 h-7 rounded-full border-2 transition-transform ${color === c ? 'border-gray-800 scale-110' : 'border-transparent'}`}
                            style={{ background: c }} />
                    ))}
                </div>
                <div className="flex items-center gap-2">
                    <input type="color" value={color} onChange={e => setColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer border-0" />
                    <input value={color} onChange={e => setColor(e.target.value)}
                        pattern="^#[0-9a-fA-F]{6}$"
                        className="w-24 px-2 py-1 rounded-lg border border-gray-200 text-xs font-mono" />
                </div>
            </div>
            <div className="flex items-center gap-2 justify-between pt-1">
                <span className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-full font-medium"
                    style={{ background: color + '22', color }}>
                    {name || 'Aperçu'}
                </span>
                <div className="flex gap-2">
                    {onCancel && (
                        <button type="button" onClick={onCancel}
                            className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg hover:bg-gray-50">
                            Annuler
                        </button>
                    )}
                    <button type="submit" disabled={processing}
                        className="px-3 py-1.5 text-xs bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 disabled:opacity-50">
                        {processing ? '...' : initial ? 'Mettre à jour' : 'Créer'}
                    </button>
                </div>
            </div>
        </form>
    );
}

export default function TagsIndex({ tags }) {
    const [editingId, setEditingId] = useState(null);
    const [showCreate, setShowCreate] = useState(false);
    const createForm  = useForm({ name: '', color: '#6366f1' });
    const updateForms = {};

    const handleCreate = (data) => {
        createForm.setData(data);
        router.post(route('admin.crm.tags.store'), data, {
            onSuccess: () => { setShowCreate(false); },
            preserveScroll: true,
        });
    };

    const handleUpdate = (tag, data) => {
        router.put(route('admin.crm.tags.update', tag.id), data, {
            onSuccess: () => setEditingId(null),
            preserveScroll: true,
        });
    };

    const handleDestroy = (tag) => {
        if (tag.prospects_count > 0 && !confirm(`Ce tag est utilisé par ${tag.prospects_count} prospect(s). Supprimer quand même ?`)) return;
        if (!tag.prospects_count && !confirm('Supprimer ce tag ?')) return;
        router.delete(route('admin.crm.tags.destroy', tag.id), { preserveScroll: true });
    };

    return (
        <AdminLayout>
            <Head title="CRM — Tags" />

            <div className="max-w-2xl space-y-5">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Tags CRM</h1>
                        <p className="text-xs text-gray-500 mt-0.5">{tags.length} tag{tags.length !== 1 ? 's' : ''}</p>
                    </div>
                    <button onClick={() => setShowCreate(s => !s)}
                        className="inline-flex items-center gap-2 px-3 py-2 bg-orange-600 text-white rounded-xl text-sm font-semibold hover:bg-orange-700">
                        {showCreate ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                        {showCreate ? 'Annuler' : 'Nouveau tag'}
                    </button>
                </div>

                {showCreate && (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                        <h2 className="text-sm font-semibold text-gray-700 mb-4">Nouveau tag</h2>
                        <TagForm onSubmit={handleCreate} processing={createForm.processing} />
                    </div>
                )}

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    {tags.length === 0 ? (
                        <div className="py-16 text-center">
                            <p className="text-gray-400 text-sm">Aucun tag créé</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-50">
                            {tags.map(tag => (
                                <div key={tag.id} className="p-4">
                                    {editingId === tag.id ? (
                                        <div>
                                            <TagForm initial={tag}
                                                onSubmit={(data) => handleUpdate(tag, data)}
                                                onCancel={() => setEditingId(null)}
                                                processing={false} />
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-3">
                                            <span className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full font-medium"
                                                style={{ background: tag.color + '22', color: tag.color }}>
                                                <span className="w-2 h-2 rounded-full" style={{ background: tag.color }} />
                                                {tag.name}
                                            </span>
                                            <span className="text-xs text-gray-400 ml-1">
                                                {tag.prospects_count} prospect{tag.prospects_count !== 1 ? 's' : ''}
                                            </span>
                                            <div className="ml-auto flex gap-1">
                                                <button onClick={() => setEditingId(tag.id)}
                                                    className="p-1.5 hover:bg-indigo-50 rounded-lg text-indigo-500">
                                                    <Pencil className="w-3.5 h-3.5" />
                                                </button>
                                                <button onClick={() => handleDestroy(tag)}
                                                    className="p-1.5 hover:bg-red-50 rounded-lg text-red-400">
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
