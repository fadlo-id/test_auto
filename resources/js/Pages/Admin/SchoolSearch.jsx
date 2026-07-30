import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import Pagination from '@/Components/UI/Pagination';
import EmptyState from '@/Components/UI/EmptyState';
import { MagnifyingGlassIcon, BuildingOffice2Icon, XMarkIcon } from '@heroicons/react/24/outline';

function StatusBadge({ status }) {
    const cls = { approved: 'badge badge-green', rejected: 'badge badge-red', pending: 'badge badge-yellow' };
    const labels = { approved: 'Approuvé', rejected: 'Refusé', pending: 'En attente' };
    return <span className={cls[status] ?? 'badge badge-gray'}>{labels[status] ?? status}</span>;
}

export default function SchoolSearch({ schools, filters }) {
    const [form, setForm] = useState({
        name: filters.name ?? '', city: filters.city ?? '', status: filters.status ?? 'all', owner: filters.owner ?? '',
    });

    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

    const search = (e) => {
        e?.preventDefault();
        router.get(route('admin.schools-search.index'), form, { preserveState: true, replace: true });
    };

    const reset = () => {
        const cleared = { name: '', city: '', status: 'all', owner: '' };
        setForm(cleared);
        router.get(route('admin.schools-search.index'), {}, { replace: true });
    };

    const hasFilters = Object.values(filters).some(Boolean);

    return (
        <AdminLayout title="Recherche d'auto-écoles">
            <Head title="Admin — Recherche d'auto-écoles" />

            <form onSubmit={search} className="card p-5 mb-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
                <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-zinc-400 mb-1">Nom</label>
                    <input className="input" placeholder="Nom de l'auto-école" value={form.name} onChange={e => set('name', e.target.value)} />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-zinc-400 mb-1">Ville</label>
                    <input className="input" placeholder="Ville" value={form.city} onChange={e => set('city', e.target.value)} />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-zinc-400 mb-1">Statut</label>
                    <select className="input" value={form.status} onChange={e => set('status', e.target.value)}>
                        <option value="all">Tous les statuts</option>
                        <option value="pending">En attente</option>
                        <option value="approved">Approuvé</option>
                        <option value="rejected">Refusé</option>
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-zinc-400 mb-1">Propriétaire</label>
                    <input className="input" placeholder="Nom ou email du propriétaire" value={form.owner} onChange={e => set('owner', e.target.value)} />
                </div>
                <div className="sm:col-span-2 lg:col-span-4 flex gap-3">
                    <button type="submit" className="btn-primary">
                        <MagnifyingGlassIcon className="w-4 h-4" /> Rechercher
                    </button>
                    {hasFilters && (
                        <button type="button" onClick={reset} className="btn-secondary">
                            <XMarkIcon className="w-4 h-4" /> Réinitialiser
                        </button>
                    )}
                </div>
            </form>

            {!schools ? (
                <div className="card">
                    <EmptyState icon={MagnifyingGlassIcon} title="Lancez une recherche" description="Renseignez au moins un critère (nom, ville, statut ou propriétaire) pour afficher des résultats." />
                </div>
            ) : (
                <div className="card overflow-hidden">
                    {schools.data.length === 0 ? (
                        <EmptyState icon={BuildingOffice2Icon} title="Aucun résultat" description="Aucune auto-école ne correspond à ces critères." />
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-gray-50 dark:bg-zinc-800/50 border-b border-gray-100 dark:border-zinc-800">
                                        {['Auto-école', 'Ville', 'Propriétaire', 'Statut', 'Créé le'].map(h => (
                                            <th key={h} className="table-cell text-left table-header">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {schools.data.map(school => (
                                        <tr key={school.id} className="table-row">
                                            <td className="px-4 py-3">
                                                <Link href={route('admin.auto-schools.index', { search: school.name })} className="flex items-center gap-3 group">
                                                    {school.logo_url ? (
                                                        <img src={school.logo_url} alt="" className="w-8 h-8 rounded-lg object-cover border border-gray-100 dark:border-zinc-800" />
                                                    ) : (
                                                        <div className="w-8 h-8 rounded-lg bg-orange-50 dark:bg-orange-500/10 border border-orange-100 dark:border-orange-500/20 flex items-center justify-center text-orange-600 dark:text-orange-400 font-bold text-xs flex-shrink-0">
                                                            {school.name?.[0]?.toUpperCase()}
                                                        </div>
                                                    )}
                                                    <span className="font-semibold text-gray-900 dark:text-zinc-100 group-hover:text-orange-600 dark:group-hover:text-orange-400">{school.name}</span>
                                                </Link>
                                            </td>
                                            <td className="px-4 py-3 text-gray-700 dark:text-zinc-300">{school.city}</td>
                                            <td className="px-4 py-3">
                                                <p className="text-gray-700 dark:text-zinc-300">{school.user?.name}</p>
                                                <p className="text-xs text-gray-400 dark:text-zinc-500">{school.user?.email}</p>
                                            </td>
                                            <td className="px-4 py-3"><StatusBadge status={school.status} /></td>
                                            <td className="px-4 py-3 text-gray-400 dark:text-zinc-500 text-xs whitespace-nowrap">
                                                {new Date(school.created_at).toLocaleDateString('fr-FR')}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                    <Pagination paginator={schools} />
                </div>
            )}
        </AdminLayout>
    );
}
