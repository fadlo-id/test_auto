import AdminLayout from '@/Layouts/AdminLayout';
import { router, Link } from '@inertiajs/react';
import { useState } from 'react';
import { Search, GraduationCap, CheckCircle, XCircle } from 'lucide-react';

export default function Instructors({ users, filters, stats }) {
    const [search, setSearch] = useState(filters?.search ?? '');

    return (
        <AdminLayout title="Instructeurs / Propriétaires">
            <div className="space-y-6">
                {/* KPI */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white rounded-xl border border-gray-200 p-5">
                        <p className="text-sm text-gray-500">Total instructeurs</p>
                        <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
                    </div>
                    <div className="bg-emerald-50 rounded-xl border border-emerald-200 p-5">
                        <p className="text-sm text-emerald-600">Actifs</p>
                        <p className="text-3xl font-bold text-emerald-700 mt-1">{stats.active}</p>
                    </div>
                </div>

                {/* Search */}
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <form onSubmit={e => { e.preventDefault(); router.get(route('admin.instructors.index'), { search }); }}
                        className="flex gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input value={search} onChange={e => setSearch(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                                placeholder="Rechercher un instructeur…" />
                        </div>
                        <button type="submit" className="px-4 py-2 bg-orange-600 text-white text-sm font-semibold rounded-lg hover:bg-orange-700 transition-colors">
                            Rechercher
                        </button>
                    </form>
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">Instructeur</th>
                                <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">Auto-école</th>
                                <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">État</th>
                                <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">Inscrit le</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {users.data?.length === 0 ? (
                                <tr><td colSpan={4} className="text-center py-10 text-gray-400">Aucun instructeur trouvé.</td></tr>
                            ) : users.data?.map(u => (
                                <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-4 py-3">
                                        <div>
                                            <p className="font-medium text-gray-900">{u.name}</p>
                                            <p className="text-xs text-gray-400">{u.email}</p>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-gray-600">{u.auto_school?.name ?? <span className="text-gray-300">—</span>}</td>
                                    <td className="px-4 py-3">
                                        {u.is_active
                                            ? <span className="badge-green flex items-center gap-1 w-fit"><CheckCircle className="w-3 h-3" />Actif</span>
                                            : <span className="badge-red flex items-center gap-1 w-fit"><XCircle className="w-3 h-3" />Inactif</span>}
                                    </td>
                                    <td className="px-4 py-3 text-gray-400 text-xs">{new Date(u.created_at).toLocaleDateString('fr-FR')}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {users.last_page > 1 && (
                        <div className="flex justify-center gap-1 px-4 py-3 border-t border-gray-100">
                            {users.links?.map((link, i) => (
                                link.url ? <Link key={i} href={link.url} className={`px-3 py-1.5 rounded text-xs font-medium ${link.active ? 'bg-orange-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`} dangerouslySetInnerHTML={{ __html: link.label }} />
                                    : <span key={i} className="px-3 py-1.5 rounded text-xs text-gray-300" dangerouslySetInnerHTML={{ __html: link.label }} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
