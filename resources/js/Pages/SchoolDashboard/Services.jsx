import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import SchoolLayout from '@/Layouts/SchoolLayout';

function ServiceForm({ initial, onSubmit, onCancel, processing }) {
    const [data, setData] = useState({
        name: initial?.name ?? '',
        description: initial?.description ?? '',
        price: initial?.price ?? '',
        duration: initial?.duration ?? '',
    });

    const update = (field) => (e) => setData({ ...data, [field]: e.target.value });

    return (
        <form onSubmit={(e) => { e.preventDefault(); onSubmit(data); }} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                    <label className="text-sm font-medium text-gray-700">Nom du service *</label>
                    <input type="text" value={data.name} onChange={update('name')} required
                        className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
                </div>
                <div>
                    <label className="text-sm font-medium text-gray-700">Prix (MAD) *</label>
                    <input type="number" min="0" step="0.01" value={data.price} onChange={update('price')} required
                        className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
                </div>
            </div>
            <div>
                <label className="text-sm font-medium text-gray-700">Description</label>
                <textarea value={data.description} onChange={update('description')} rows={2}
                    className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
            </div>
            <div>
                <label className="text-sm font-medium text-gray-700">Duree (heures)</label>
                <input type="number" min="0" step="0.5" value={data.duration} onChange={update('duration')}
                    className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
            </div>
            <div className="flex gap-2">
                <button type="submit" disabled={processing}
                    className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 disabled:opacity-50">
                    {processing ? 'Enregistrement...' : 'Enregistrer'}
                </button>
                <button type="button" onClick={onCancel}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50">
                    Annuler
                </button>
            </div>
        </form>
    );
}

export default function Services({ school, services: initialServices }) {
    const { flash } = usePage().props;
    const [showAdd, setShowAdd] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [processing, setProcessing] = useState(false);

    const addService = (data) => {
        setProcessing(true);
        router.post(route('school.services.store'), data, {
            preserveScroll: true,
            onSuccess: () => { setShowAdd(false); setProcessing(false); },
            onError: () => setProcessing(false),
        });
    };

    const updateService = (id, data) => {
        setProcessing(true);
        router.put(route('school.services.update', id), data, {
            preserveScroll: true,
            onSuccess: () => { setEditingId(null); setProcessing(false); },
            onError: () => setProcessing(false),
        });
    };

    const deleteService = (id) => {
        if (confirm('Supprimer ce service ?')) {
            router.delete(route('school.services.destroy', id), { preserveScroll: true });
        }
    };

    return (
        <SchoolLayout title="Services" school={school}>
            <Head title="Mes services" />

            {flash?.success && (
                <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm border border-green-200">
                    {flash.success}
                </div>
            )}

            <div className="bg-white rounded-xl border border-gray-200">
                <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">Mes services ({initialServices.length})</h3>
                    {!showAdd && (
                        <button onClick={() => setShowAdd(true)}
                            className="px-3 py-1.5 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700">
                            + Ajouter
                        </button>
                    )}
                </div>

                {showAdd && (
                    <div className="p-5 border-b border-gray-100 bg-orange-50">
                        <p className="text-sm font-medium text-gray-900 mb-3">Nouveau service</p>
                        <ServiceForm onSubmit={addService} onCancel={() => setShowAdd(false)} processing={processing} />
                    </div>
                )}

                <div className="divide-y divide-gray-100">
                    {initialServices.map((service) => (
                        <div key={service.id} className="p-5">
                            {editingId === service.id ? (
                                <ServiceForm
                                    initial={service}
                                    onSubmit={(d) => updateService(service.id, d)}
                                    onCancel={() => setEditingId(null)}
                                    processing={processing}
                                />
                            ) : (
                                <div className="flex items-start gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <p className="font-medium text-gray-900">{service.name}</p>
                                            <span className="text-sm font-semibold text-orange-600">
                                                {Number(service.price).toLocaleString()} MAD
                                            </span>
                                            {service.duration && (
                                                <span className="text-xs text-gray-400">{service.duration}h</span>
                                            )}
                                        </div>
                                        {service.description && (
                                            <p className="text-sm text-gray-500">{service.description}</p>
                                        )}
                                    </div>
                                    <div className="flex gap-1 shrink-0">
                                        <button onClick={() => setEditingId(service.id)}
                                            className="text-xs px-2 py-1 rounded bg-gray-50 text-gray-600 hover:bg-gray-100 font-medium">
                                            Modifier
                                        </button>
                                        <button onClick={() => deleteService(service.id)}
                                            className="text-xs px-2 py-1 rounded bg-red-50 text-red-600 hover:bg-red-100 font-medium">
                                            Supprimer
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                    {initialServices.length === 0 && !showAdd && (
                        <div className="p-10 text-center text-gray-400">
                            <p className="mb-3">Aucun service configure</p>
                            <button onClick={() => setShowAdd(true)}
                                className="text-orange-600 hover:underline text-sm">
                                Ajouter votre premier service
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </SchoolLayout>
    );
}
