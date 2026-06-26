import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';

function StatusBadge({ status }) {
    const map = {
        approved: 'bg-green-100 text-green-700',
        rejected: 'bg-red-100 text-red-700',
        pending:  'bg-yellow-100 text-yellow-700',
    };
    const labels = { approved: 'Approuvé', rejected: 'Refusé', pending: 'En attente' };
    return (
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${map[status] ?? 'bg-gray-100 text-gray-600'}`}>
            {labels[status] ?? status}
        </span>
    );
}

export default function AutoSchools({ schools, filters }) {
    const { flash } = usePage().props;
    const [search, setSearch] = useState(filters.search ?? '');
    const [status, setStatus] = useState(filters.status ?? 'all');
    const [rejectModal, setRejectModal] = useState(null);
    const [rejectReason, setRejectReason] = useState('');

    const applyFilters = (newStatus) => {
        const s = newStatus ?? status;
        router.get(route('admin.auto-schools.index'), { search, status: s }, { preserveState: true, replace: true });
    };

    const approve = (school) => {
        router.post(route('admin.auto-schools.approve', school.id), {}, { preserveScroll: true });
    };

    const openReject = (school) => {
        setRejectModal(school);
        setRejectReason('');
    };

    const submitReject = () => {
        router.post(route('admin.auto-schools.reject', rejectModal.id), { reason: rejectReason }, {
            preserveScroll: true,
            onSuccess: () => setRejectModal(null),
        });
    };

    const deleteSchool = (school) => {
        if (confirm(`Supprimer "${school.name}" ?`)) {
            router.delete(route('admin.auto-schools.destroy', school.id), { preserveScroll: true });
        }
    };

    return (
        <AdminLayout title="Auto-écoles">
            <Head title="Admin — Auto-écoles" />

            {flash?.success && (
                <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm border border-green-200">{flash.success}</div>
            )}
            {flash?.error && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200">{flash.error}</div>
            )}

            <div className="bg-white rounded-xl border border-gray-200">
                <div className="p-5 border-b border-gray-100">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <input
                            type="text"
                            placeholder="Rechercher..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                        <select
                            value={status}
                            onChange={(e) => { setStatus(e.target.value); applyFilters(e.target.value); }}
                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                        >
                            <option value="all">Tous les statuts</option>
                            <option value="pending">En attente</option>
                            <option value="approved">Approuvés</option>
                            <option value="rejected">Refusés</option>
                        </select>
                        <button
                            onClick={() => applyFilters()}
                            className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700"
                        >
                            Filtrer
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                {['Nom', 'Ville', 'Propriétaire', 'Statut', 'Créé le', 'Actions'].map((h) => (
                                    <th key={h} className="px-4 py-3 text-left font-medium text-gray-600">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {schools.data.map((school) => (
                                <tr key={school.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 font-medium text-gray-900">{school.name}</td>
                                    <td className="px-4 py-3 text-gray-600">{school.city}</td>
                                    <td className="px-4 py-3 text-gray-600">
                                        <div>{school.user?.name}</div>
                                        <div className="text-xs text-gray-400">{school.user?.email}</div>
                                    </td>
                                    <td className="px-4 py-3"><StatusBadge status={school.status} /></td>
                                    <td className="px-4 py-3 text-gray-500">
                                        {new Date(school.created_at).toLocaleDateString('fr-FR')}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-1">
                                            {school.status !== 'approved' && (
                                                <button
                                                    onClick={() => approve(school)}
                                                    className="text-xs px-2 py-1 rounded bg-green-50 text-green-700 hover:bg-green-100 font-medium"
                                                >
                                                    Approuver
                                                </button>
                                            )}
                                            {school.status !== 'rejected' && (
                                                <button
                                                    onClick={() => openReject(school)}
                                                    className="text-xs px-2 py-1 rounded bg-red-50 text-red-700 hover:bg-red-100 font-medium"
                                                >
                                                    Refuser
                                                </button>
                                            )}
                                            <button
                                                onClick={() => deleteSchool(school)}
                                                className="text-xs px-2 py-1 rounded bg-gray-50 text-gray-600 hover:bg-red-50 hover:text-red-600 font-medium"
                                            >
                                                Supprimer
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {schools.data.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-4 py-10 text-center text-gray-400">
                                        Aucune auto-école trouvée
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {schools.links && (
                    <div className="p-4 border-t border-gray-100 flex gap-1 justify-center">
                        {schools.links.map((link, i) => (
                            <Link
                                key={i}
                                href={link.url ?? '#'}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                                className={`px-3 py-1.5 rounded text-sm ${
                                    link.active
                                        ? 'bg-orange-600 text-white'
                                        : link.url
                                        ? 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                                        : 'bg-white border border-gray-100 text-gray-300 cursor-default'
                                }`}
                                preserveScroll
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Reject modal */}
            {rejectModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
                        <h3 className="font-semibold text-gray-900 mb-3">
                            Refuser « {rejectModal.name} »
                        </h3>
                        <textarea
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            placeholder="Raison du refus..."
                            rows={3}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                        <div className="flex justify-end gap-3 mt-4">
                            <button
                                onClick={() => setRejectModal(null)}
                                className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={submitReject}
                                disabled={!rejectReason.trim()}
                                className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                            >
                                Confirmer le refus
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
