import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';

function Badge({ active }) {
    return (
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
            active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
            {active ? 'Actif' : 'Suspendu'}
        </span>
    );
}

function RoleBadge({ role }) {
    const map = {
        admin: 'bg-purple-100 text-purple-700',
        school_owner: 'bg-blue-100 text-blue-700',
        user: 'bg-gray-100 text-gray-600',
    };
    return (
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${map[role] ?? 'bg-gray-100 text-gray-600'}`}>
            {role}
        </span>
    );
}

export default function Users({ users, filters }) {
    const { flash } = usePage().props;
    const [search, setSearch] = useState(filters.search ?? '');

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('admin.users.index'), { search }, { preserveState: true, replace: true });
    };

    const toggleBan = (user) => {
        router.post(route('admin.users.ban', user.id), {}, { preserveScroll: true });
    };

    const deleteUser = (user) => {
        if (confirm(`Supprimer ${user.name} ?`)) {
            router.delete(route('admin.users.destroy', user.id), { preserveScroll: true });
        }
    };

    return (
        <AdminLayout title="Utilisateurs">
            <Head title="Admin — Utilisateurs" />

            {flash?.success && (
                <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm border border-green-200">
                    {flash.success}
                </div>
            )}
            {flash?.error && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200">
                    {flash.error}
                </div>
            )}

            <div className="bg-white rounded-xl border border-gray-200">
                <div className="p-5 border-b border-gray-100 flex items-center gap-3">
                    <form onSubmit={handleSearch} className="flex-1 flex gap-2">
                        <input
                            type="text"
                            placeholder="Rechercher par nom ou email..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                        <button
                            type="submit"
                            className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700"
                        >
                            Rechercher
                        </button>
                    </form>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                {['Nom', 'Email', 'Téléphone', 'Rôle', 'Statut', 'Inscrit le', 'Actions'].map((h) => (
                                    <th key={h} className="px-4 py-3 text-left font-medium text-gray-600">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {users.data.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 font-medium text-gray-900">{user.name}</td>
                                    <td className="px-4 py-3 text-gray-600">{user.email}</td>
                                    <td className="px-4 py-3 text-gray-600">{user.phone ?? '—'}</td>
                                    <td className="px-4 py-3"><RoleBadge role={user.role} /></td>
                                    <td className="px-4 py-3"><Badge active={user.is_active} /></td>
                                    <td className="px-4 py-3 text-gray-500">
                                        {new Date(user.created_at).toLocaleDateString('fr-FR')}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            {!user.role === 'admin' && (
                                                <button
                                                    onClick={() => toggleBan(user)}
                                                    className={`text-xs px-2 py-1 rounded font-medium ${
                                                        user.is_active
                                                            ? 'bg-red-50 text-red-600 hover:bg-red-100'
                                                            : 'bg-green-50 text-green-600 hover:bg-green-100'
                                                    }`}
                                                >
                                                    {user.is_active ? 'Suspendre' : 'Réactiver'}
                                                </button>
                                            )}
                                            <button
                                                onClick={() => deleteUser(user)}
                                                className="text-xs px-2 py-1 rounded font-medium bg-gray-50 text-gray-600 hover:bg-red-50 hover:text-red-600"
                                            >
                                                Supprimer
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {users.data.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-4 py-10 text-center text-gray-400">
                                        Aucun utilisateur trouvé
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {users.links && (
                    <div className="p-4 border-t border-gray-100 flex gap-1 justify-center">
                        {users.links.map((link, i) => (
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
        </AdminLayout>
    );
}
