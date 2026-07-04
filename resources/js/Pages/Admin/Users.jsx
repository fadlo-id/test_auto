import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import Pagination from '@/Components/UI/Pagination';
import EmptyState from '@/Components/UI/EmptyState';
import { MagnifyingGlassIcon, ArrowDownTrayIcon, UsersIcon } from '@heroicons/react/24/outline';

// status: 0 = normal, 1 = banni (tinyint in DB)
// is_active: boolean
function StatusBadge({ user }) {
    if (user.status === 1) return (
        <span className="badge badge-red">Banni</span>
    );
    if (!user.is_active) return (
        <span className="badge badge-yellow">Désactivé</span>
    );
    return <span className="badge badge-green">Actif</span>;
}

function RoleBadge({ role }) {
    const cfg = {
        admin:        'badge-purple',
        school_owner: 'badge-blue',
        user:         'badge-gray',
    };
    const labels = {
        admin:        'Admin',
        school_owner: 'Propriétaire',
        user:         'Candidat',
    };
    return (
        <span className={`badge ${cfg[role] ?? 'badge-gray'}`}>{labels[role] ?? role}</span>
    );
}

export default function Users({ users, filters }) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [role,   setRole]   = useState(filters.role   ?? '');
    const [status, setStatus] = useState(filters.status ?? '');

    const applyFilters = (overrides = {}) => {
        router.get(
            route('admin.users.index'),
            { search, role, status, ...overrides },
            { preserveState: true, replace: true },
        );
    };

    const handleSearch = (e) => {
        e.preventDefault();
        applyFilters();
    };

    const activate   = (user) => router.post(route('admin.users.activate',   user.id), {}, { preserveScroll: true });
    const deactivate = (user) => router.post(route('admin.users.deactivate', user.id), {}, { preserveScroll: true });
    const ban        = (user) => {
        if (confirm(`Bannir définitivement ${user.name} ?`)) {
            router.post(route('admin.users.ban', user.id), {}, { preserveScroll: true });
        }
    };
    const unban   = (user) => router.post(route('admin.users.unban',   user.id), {}, { preserveScroll: true });
    const destroy = (user) => {
        if (confirm(`Supprimer définitivement le compte de ${user.name} ?`)) {
            router.delete(route('admin.users.destroy', user.id), { preserveScroll: true });
        }
    };

    return (
        <AdminLayout title="Utilisateurs">
            <Head title="Admin — Utilisateurs" />

            {/* Filters */}
            <form onSubmit={handleSearch} className="card p-4 mb-5 flex flex-wrap gap-3 items-center">
                <div className="relative flex-1 min-w-48">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Rechercher par nom ou email…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="input pl-9"
                    />
                </div>
                <select
                    value={role}
                    onChange={(e) => { setRole(e.target.value); applyFilters({ role: e.target.value }); }}
                    className="input w-auto"
                >
                    <option value="">Tous les rôles</option>
                    <option value="admin">Administrateur</option>
                    <option value="school_owner">Propriétaire</option>
                    <option value="user">Utilisateur</option>
                </select>
                <select
                    value={status}
                    onChange={(e) => { setStatus(e.target.value); applyFilters({ status: e.target.value }); }}
                    className="input w-auto"
                >
                    <option value="">Tous les statuts</option>
                    <option value="active">Actif</option>
                    <option value="inactive">Désactivé</option>
                    <option value="banned">Banni</option>
                </select>
                <button type="submit" className="btn-primary">
                    Rechercher
                </button>
                <a
                    href={`${route('admin.users.export')}?search=${encodeURIComponent(search)}&role=${role}&status=${status}`}
                    className="btn-secondary"
                >
                    <ArrowDownTrayIcon className="w-4 h-4" />
                    CSV
                </a>
            </form>

            <div className="card overflow-hidden">
                {users.data.length === 0 ? (
                    <EmptyState
                        icon={UsersIcon}
                        title="Aucun utilisateur trouvé"
                        description="Essayez d'ajuster vos filtres de recherche."
                    />
                ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                {['Utilisateur', 'Contact', 'Rôle', 'État', 'Inscrit le', 'Actions'].map((h) => (
                                    <th key={h} className="table-cell text-left table-header">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {users.data.map((user) => (
                                <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50/70 transition-colors">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-xs flex-shrink-0">
                                                {user.name?.[0]?.toUpperCase()}
                                            </div>
                                            <span className="font-semibold text-gray-900">{user.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <p className="text-gray-700 text-sm">{user.email}</p>
                                        {user.phone && <p className="text-gray-400 text-xs mt-0.5">{user.phone}</p>}
                                    </td>
                                    <td className="px-4 py-3"><RoleBadge role={user.role} /></td>
                                    <td className="px-4 py-3"><StatusBadge user={user} /></td>
                                    <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                                        {new Date(user.created_at).toLocaleDateString('fr-FR')}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                            {user.role !== 'admin' && (
                                                <>
                                                    {!user.is_active && user.status !== 1 && (
                                                        <button onClick={() => activate(user)}
                                                            className="text-xs px-2.5 py-1 rounded-lg font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors">
                                                            Activer
                                                        </button>
                                                    )}
                                                    {user.is_active && user.status !== 1 && (
                                                        <button onClick={() => deactivate(user)}
                                                            className="text-xs px-2.5 py-1 rounded-lg font-semibold bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors">
                                                            Désactiver
                                                        </button>
                                                    )}
                                                    {user.status !== 1 && (
                                                        <button onClick={() => ban(user)}
                                                            className="text-xs px-2.5 py-1 rounded-lg font-semibold bg-red-50 text-red-700 hover:bg-red-100 transition-colors">
                                                            Bannir
                                                        </button>
                                                    )}
                                                    {user.status === 1 && (
                                                        <button onClick={() => unban(user)}
                                                            className="text-xs px-2.5 py-1 rounded-lg font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors">
                                                            Débannir
                                                        </button>
                                                    )}
                                                </>
                                            )}
                                            <button onClick={() => destroy(user)}
                                                className="text-xs px-2.5 py-1 rounded-lg font-semibold bg-gray-100 text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors">
                                                Supprimer
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                )}

                <Pagination paginator={users} />
            </div>
        </AdminLayout>
    );
}
