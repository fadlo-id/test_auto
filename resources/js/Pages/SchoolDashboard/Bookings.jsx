import { Head, router, useForm, usePage } from '@inertiajs/react';
import SchoolLayout from '@/Layouts/SchoolLayout';
import { useState } from 'react';

const STATUS_LABELS = { pending: 'En attente', confirmed: 'Confirmé', cancelled: 'Annulé', completed: 'Terminé' };
const STATUS_COLORS = { pending: 'bg-yellow-100 text-yellow-700', confirmed: 'bg-green-100 text-green-700', cancelled: 'bg-red-100 text-red-600', completed: 'bg-blue-100 text-blue-700' };

export default function Bookings({ bookings, stats = {}, filters = {} }) {
    const { flash, school } = usePage().props;
    const [selected, setSelected] = useState(null);
    const { data, setData, put, processing, reset } = useForm({ status: '', admin_notes: '' });

    const openModal = (b) => { setSelected(b); setData({ status: b.status, admin_notes: b.admin_notes ?? '' }); };
    const closeModal = () => { setSelected(null); reset(); };
    const save = () => put(route('school.bookings.update', selected.id), { onSuccess: closeModal });

    return (
        <SchoolLayout title="Réservations" school={school}>
            <Head title="Réservations" />
            {flash?.success && <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">{flash.success}</div>}

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-5">
                <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                    <p className="text-2xl font-bold text-gray-900">{stats.total ?? 0}</p>
                    <p className="text-sm text-gray-500">Total</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                    <p className="text-2xl font-bold text-yellow-600">{stats.pending ?? 0}</p>
                    <p className="text-sm text-gray-500">En attente</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                    <p className="text-2xl font-bold text-green-600">{stats.confirmed ?? 0}</p>
                    <p className="text-sm text-gray-500">Confirmées</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 mb-5 flex gap-3 flex-wrap">
                <input defaultValue={filters.search} placeholder="Rechercher..." onKeyDown={(e) => e.key === 'Enter' && router.get(route('school.bookings'), { ...filters, search: e.target.value })}
                    className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm flex-1 min-w-48" />
                <select value={filters.status ?? 'all'} onChange={(e) => router.get(route('school.bookings'), { ...filters, status: e.target.value })}
                    className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm">
                    <option value="all">Tous</option>
                    <option value="pending">En attente</option>
                    <option value="confirmed">Confirmés</option>
                    <option value="cancelled">Annulés</option>
                    <option value="completed">Terminés</option>
                </select>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>{['Nom', 'Contact', 'Permis', 'Date souhaitée', 'Statut', 'Actions'].map((h) => <th key={h} className="text-left px-4 py-3 font-medium text-gray-600">{h}</th>)}</tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {bookings?.data?.length === 0 && <tr><td colSpan={6} className="text-center py-10 text-gray-400">Aucune réservation</td></tr>}
                        {bookings?.data?.map((b) => (
                            <tr key={b.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3 font-medium">{b.name}</td>
                                <td className="px-4 py-3">
                                    <div className="text-gray-600">{b.email}</div>
                                    {b.phone && <div className="text-gray-400 text-xs">{b.phone}</div>}
                                </td>
                                <td className="px-4 py-3 text-gray-500">{b.permit_type ?? '-'}</td>
                                <td className="px-4 py-3 text-gray-500">{b.preferred_date ? new Date(b.preferred_date).toLocaleDateString('fr') : '-'}</td>
                                <td className="px-4 py-3">
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[b.status]}`}>
                                        {STATUS_LABELS[b.status]}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    <button onClick={() => openModal(b)} className="text-xs text-orange-600 hover:underline">Gérer</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {bookings?.last_page > 1 && (
                    <div className="p-4 flex gap-2 border-t border-gray-100">
                        {bookings.links?.map((link, i) => (
                            <button key={i} disabled={!link.url} onClick={() => link.url && router.get(link.url)}
                                className={`px-3 py-1 rounded text-xs ${link.active ? 'bg-orange-600 text-white' : 'border border-gray-200 text-gray-600 disabled:opacity-40'}`}
                                dangerouslySetInnerHTML={{ __html: link.label }} />
                        ))}
                    </div>
                )}
            </div>

            {/* Modal */}
            {selected && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-xl">
                        <h3 className="font-semibold text-gray-900 mb-4">Réservation de {selected.name}</h3>
                        <div className="space-y-3 text-sm text-gray-600 mb-4">
                            <p><strong>Email:</strong> {selected.email}</p>
                            {selected.phone && <p><strong>Tél:</strong> {selected.phone}</p>}
                            {selected.message && <p><strong>Message:</strong> {selected.message}</p>}
                        </div>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                                <select value={data.status} onChange={(e) => setData('status', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
                                    {Object.entries(STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Notes internes</label>
                                <textarea value={data.admin_notes} onChange={(e) => setData('admin_notes', e.target.value)} rows={3} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                            </div>
                        </div>
                        <div className="flex gap-3 mt-4">
                            <button onClick={save} disabled={processing} className="flex-1 py-2 bg-orange-600 text-white rounded-lg text-sm hover:bg-orange-700 disabled:opacity-50">
                                Enregistrer
                            </button>
                            <button onClick={closeModal} className="flex-1 py-2 border border-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-50">
                                Annuler
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </SchoolLayout>
    );
}
