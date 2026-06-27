import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';

function Modal({ title, onClose, children }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-xl w-full max-w-md">
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-900">{title}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
                </div>
                <div className="p-5">{children}</div>
            </div>
        </div>
    );
}

function CategoryForm({ initial, onSubmit, processing, errors }) {
    const [data, setData] = useState({
        code:    initial?.code    ?? '',
        name_fr: initial?.name_fr ?? '',
        name_ar: initial?.name_ar ?? '',
        name_en: initial?.name_en ?? '',
    });
    const set = k => e => setData(d => ({ ...d, [k]: e.target.value }));
    return (
        <form onSubmit={e => { e.preventDefault(); onSubmit(data); }} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Code *</label>
                    <input value={data.code} onChange={set('code')} required maxLength={10}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
                    {errors?.code && <p className="text-xs text-red-500 mt-1">{errors.code}</p>}
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Nom (FR) *</label>
                    <input value={data.name_fr} onChange={set('name_fr')} required
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
                    {errors?.name_fr && <p className="text-xs text-red-500 mt-1">{errors.name_fr}</p>}
                </div>
            </div>
            <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Nom (AR)</label>
                <input value={data.name_ar} onChange={set('name_ar')} dir="rtl"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
            </div>
            <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Nom (EN)</label>
                <input value={data.name_en} onChange={set('name_en')}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
            </div>
            <button type="submit" disabled={processing}
                className="w-full py-2.5 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 disabled:opacity-50">
                {processing ? 'Enregistrement...' : 'Sauvegarder'}
            </button>
        </form>
    );
}

export default function Categories({ categories }) {
    const { flash } = usePage().props;
    const [showAdd, setShowAdd] = useState(false);
    const [editing, setEditing] = useState(null);
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState({});

    const submit = (data, isEdit) => {
        setProcessing(true);
        setErrors({});
        const method = isEdit ? 'put' : 'post';
        const url    = isEdit ? route('admin.categories.update', editing.id) : route('admin.categories.store');
        router[method](url, data, {
            preserveScroll: true,
            onSuccess: () => { setShowAdd(false); setEditing(null); setProcessing(false); },
            onError:   e  => { setErrors(e); setProcessing(false); },
        });
    };

    const destroy = (cat) => {
        if (confirm(`Supprimer la catégorie "${cat.name_fr}" ? Les auto-écoles seront détachées.`)) {
            router.delete(route('admin.categories.destroy', cat.id), { preserveScroll: true });
        }
    };

    return (
        <AdminLayout title="Catégories de permis">
            <Head title="Catégories" />

            {showAdd && (
                <Modal title="Nouvelle catégorie" onClose={() => setShowAdd(false)}>
                    <CategoryForm onSubmit={d => submit(d, false)} processing={processing} errors={errors} />
                </Modal>
            )}
            {editing && (
                <Modal title="Modifier la catégorie" onClose={() => setEditing(null)}>
                    <CategoryForm initial={editing} onSubmit={d => submit(d, true)} processing={processing} errors={errors} />
                </Modal>
            )}

            {flash?.success && <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm border border-green-200">{flash.success}</div>}
            {flash?.error   && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200">{flash.error}</div>}

            <div className="bg-white rounded-xl border border-gray-200">
                <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">Catégories ({categories.length})</h3>
                    <button onClick={() => setShowAdd(true)}
                        className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700">
                        + Ajouter
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="text-left px-5 py-3 font-medium text-gray-600">Code</th>
                                <th className="text-left px-5 py-3 font-medium text-gray-600">Nom FR</th>
                                <th className="text-left px-5 py-3 font-medium text-gray-600">Nom AR</th>
                                <th className="text-left px-5 py-3 font-medium text-gray-600">Écoles</th>
                                <th className="px-5 py-3"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {categories.map(cat => (
                                <tr key={cat.id} className="hover:bg-gray-50">
                                    <td className="px-5 py-3">
                                        <span className="inline-block bg-orange-100 text-orange-700 text-xs font-bold px-2 py-0.5 rounded">{cat.code}</span>
                                    </td>
                                    <td className="px-5 py-3 font-medium text-gray-900">{cat.name_fr}</td>
                                    <td className="px-5 py-3 text-gray-600" dir="rtl">{cat.name_ar ?? '—'}</td>
                                    <td className="px-5 py-3 text-gray-500">{cat.auto_schools_count ?? 0}</td>
                                    <td className="px-5 py-3">
                                        <div className="flex gap-2 justify-end">
                                            <button onClick={() => setEditing(cat)}
                                                className="text-xs px-2 py-1 rounded bg-blue-50 text-blue-600 hover:bg-blue-100">
                                                Modifier
                                            </button>
                                            <button onClick={() => destroy(cat)}
                                                className="text-xs px-2 py-1 rounded bg-red-50 text-red-600 hover:bg-red-100">
                                                Supprimer
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {categories.length === 0 && (
                        <p className="p-10 text-center text-gray-400 text-sm">Aucune catégorie</p>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
