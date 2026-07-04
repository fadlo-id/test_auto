import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';

function StatusBadge({ status }) {
    const cls = {
        approved: 'badge badge-green',
        rejected: 'badge badge-red',
        pending:  'badge badge-yellow',
    };
    const labels = { approved: 'Approuvé', rejected: 'Refusé', pending: 'En attente' };
    return <span className={cls[status] ?? 'badge badge-gray'}>{labels[status] ?? status}</span>;
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

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-50">
                    <div className="flex flex-col sm:flex-row gap-3 items-center">
                        <input
                            type="text"
                            placeholder="Rechercher par nom ou ville…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                            className="flex-1 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        />
                        <select
                            value={status}
                            onChange={(e) => { setStatus(e.target.value); applyFilters(e.target.value); }}
                            className="border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white"
                        >
                            <option value="all">Tous les statuts</option>
                            <option value="pending">En attente</option>
                            <option value="approved">Approuvés</option>
                            <option value="rejected">Refusés</option>
                        </select>
                        <button
                            onClick={() => applyFilters()}
                            className="px-4 py-2.5 bg-orange-600 text-white rounded-xl text-sm font-semibold hover:bg-orange-700 transition-colors shadow-sm"
                        >
                            Filtrer
                        </button>
                        <a
                            href={`${route('admin.auto-schools.export')}?search=${encodeURIComponent(search)}&status=${status}`}
                            className="px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:border-gray-300 hover:bg-gray-50 inline-flex items-center gap-1.5 transition-colors shadow-sm"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                            CSV
                        </a>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                {['Auto-école', 'Propriétaire', 'Statut', 'Créé le', 'Actions'].map((h) => (
                                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {schools.data.map((school) => (
                                <tr key={school.id} className="border-b border-gray-50 hover:bg-gray-50/70 transition-colors">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600 font-bold text-xs flex-shrink-0">
                                                {school.name?.[0]?.toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900 text-sm">{school.name}</p>
                                                <p className="text-xs text-gray-400">{school.city}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <p className="text-sm text-gray-700">{school.user?.name}</p>
                                        <p className="text-xs text-gray-400">{school.user?.email}</p>
                                    </td>
                                    <td className="px-4 py-3"><StatusBadge status={school.status} /></td>
                                    <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                                        {new Date(school.created_at).toLocaleDateString('fr-FR')}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                            {school.status !== 'approved' && (
                                                <button onClick={() => approve(school)} className="text-xs px-2.5 py-1 rounded-lg font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors">
                                                    Approuver
                                                </button>
                                            )}
                                            {school.status !== 'rejected' && (
                                                <button onClick={() => openReject(school)} className="text-xs px-2.5 py-1 rounded-lg font-semibold bg-red-50 text-red-700 hover:bg-red-100 transition-colors">
                                                    Refuser
                                                </button>
                                            )}
                                            {school.status === 'approved' && school.is_active && (
                                                <button onClick={() => router.post(route('admin.auto-schools.deactivate', school.id), {}, { preserveScroll: true })} className="text-xs px-2 py-1 rounded bg-yellow-50 text-yellow-700 hover:bg-yellow-100 font-medium">
                                                    Désactiver
                                                </button>
                                            )}
                                            {school.status === 'approved' && !school.is_active && (
                                                <button onClick={() => router.post(route('admin.auto-schools.activate', school.id), {}, { preserveScroll: true })} className="text-xs px-2 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium">
                                                    Activer
                                                </button>
                                            )}
                                            <button onClick={() => deleteSchool(school)} className="text-xs px-2 py-1 rounded bg-gray-50 text-gray-600 hover:bg-red-50 hover:text-red-600 font-medium">
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
