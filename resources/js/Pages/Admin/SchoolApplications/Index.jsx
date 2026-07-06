import { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { ClipboardCheck, Search, Eye, Trash2 } from 'lucide-react';

const STATUS_CONFIG = {
    pending:  { label: 'En attente', color: 'yellow' },
    approved: { label: 'Approuvée', color: 'green' },
    rejected: { label: 'Refusée', color: 'red' },
};

export default function Index({ applications, filters, stats }) {
    const { flash } = usePage().props;
    const [search, setSearch] = useState(filters?.search ?? '');

    const applyFilter = (key, val) => {
        router.get(route('admin.school-applications.index'), { ...filters, [key]: val }, { preserveState: true, replace: true });
    };

    const del = (id) => {
        if (confirm('Supprimer définitivement cette candidature ?')) {
            router.delete(route('admin.school-applications.destroy', id));
        }
    };

    return (
        <AdminLayout title="Candidatures auto-écoles">
            <Head title="Candidatures - Admin" />

            {flash?.success && <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">{flash.success}</div>}
            {flash?.error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{flash.error}</div>}

            {/* KPIs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                {[
                    { label: 'Total',      value: stats.total,    color: 'orange' },
                    { label: 'En attente', value: stats.pending,  color: 'yellow' },
                    { label: 'Approuvées', value: stats.approved, color: 'green' },
                    { label: 'Refusées',   value: stats.rejected, color: 'red' },
                ].map((k) => (
                    <div key={k.label} className="bg-white rounded-xl border border-gray-100 p-4">
                        <p className="text-xs text-gray-500">{k.label}</p>
                        <p className={`text-2xl font-bold text-${k.color}-600 mt-1`}>{k.value}</p>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-5">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input value={search} onChange={e => setSearch(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && applyFilter('search', search)}
                        placeholder="Nom de l'école, propriétaire, email…"
                        className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500" />
                </div>
                <select value={filters?.status ?? ''} onChange={e => applyFilter('status', e.target.value)}
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500">
                    <option value="">Tous les statuts</option>
                    <option value="pending">En attente</option>
                    <option value="approved">Approuvées</option>
                    <option value="rejected">Refusées</option>
                </select>
            </div>

            {/* List */}
            <div className="space-y-3">
                {applications.data.length === 0 && (
                    <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-gray-400">Aucune candidature trouvée.</div>
                )}
                {applications.data.map((a) => {
                    const sc = STATUS_CONFIG[a.status] ?? STATUS_CONFIG.pending;
                    return (
                        <div key={a.id} className="bg-white rounded-xl border border-gray-100 p-4">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex items-start gap-3 flex-1 min-w-0">
                                    <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                                        <ClipboardCheck className="w-4 h-4 text-orange-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-2 mb-1">
                                            <span className="font-medium text-gray-900 text-sm">{a.school_name}</span>
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium bg-${sc.color}-100 text-${sc.color}-700`}>{sc.label}</span>
                                        </div>
                                        <p className="text-sm text-gray-500">{a.owner_name} · {a.city} · {a.email}</p>
                                        <p className="text-xs text-gray-400 mt-1">{new Date(a.created_at).toLocaleDateString('fr-FR')}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <Link href={route('admin.school-applications.show', a.id)}
                                        className="flex items-center gap-1 px-3 py-1.5 bg-orange-600 text-white rounded-lg text-xs hover:bg-orange-700">
                                        <Eye className="w-3.5 h-3.5" /> Examiner
                                    </Link>
                                    <button onClick={() => del(a.id)} aria-label="Supprimer" className="p-1.5 text-gray-400 hover:text-red-600 rounded">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Pagination */}
            {applications.last_page > 1 && (
                <div className="flex items-center justify-between mt-4">
                    <span className="text-sm text-gray-500">Page {applications.current_page} / {applications.last_page}</span>
                    <div className="flex gap-2">
                        {applications.prev_page_url && <button onClick={() => router.get(applications.prev_page_url)} className="px-3 py-1 text-sm border rounded hover:bg-gray-50">Précédent</button>}
                        {applications.next_page_url && <button onClick={() => router.get(applications.next_page_url)} className="px-3 py-1 text-sm border rounded hover:bg-gray-50">Suivant</button>}
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
