import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import Pagination from '@/Components/UI/Pagination';
import EmptyState from '@/Components/UI/EmptyState';
import {
    BuildingOffice2Icon, PlusIcon, PencilSquareIcon, TrashIcon, MagnifyingGlassIcon,
    ArrowDownTrayIcon, ChevronUpIcon, ChevronDownIcon, XMarkIcon,
} from '@heroicons/react/24/outline';

function StatusBadge({ status }) {
    const cls = { approved: 'badge badge-green', rejected: 'badge badge-red', pending: 'badge badge-yellow' };
    const labels = { approved: 'Approuvé', rejected: 'Refusé', pending: 'En attente' };
    return <span className={cls[status] ?? 'badge badge-gray'}>{labels[status] ?? status}</span>;
}

const emptyForm = { name: '', email: '', phone: '', city: '', address: '', logo_url: '', status: 'approved', owner_mode: 'existing', existing_user_id: '', new_owner_name: '', new_owner_email: '' };

function SchoolModal({ school, availableOwners, onClose }) {
    const isEdit = !!school;
    const [form, setForm] = useState(() => school ? {
        name: school.name ?? '', email: school.email ?? '', phone: school.phone ?? '',
        city: school.city ?? '', address: school.address ?? '', logo_url: school.logo_url ?? '',
        status: school.status ?? 'pending',
    } : emptyForm);
    const [errors, setErrors] = useState({});
    const [processing, setProcessing] = useState(false);

    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

    const submit = (e) => {
        e.preventDefault();
        setProcessing(true);
        const opts = {
            preserveScroll: true,
            onError: (errs) => setErrors(errs),
            onSuccess: () => onClose(),
            onFinish: () => setProcessing(false),
        };
        if (isEdit) {
            router.put(route('admin.auto-schools.update', school.id), form, opts);
        } else {
            router.post(route('admin.auto-schools.store'), form, opts);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-zinc-800">
                    <h3 className="font-bold text-gray-900 dark:text-zinc-100">{isEdit ? `Modifier « ${school.name} »` : 'Nouvelle auto-école'}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-700 dark:hover:text-zinc-200"><XMarkIcon className="w-5 h-5" /></button>
                </div>
                <form onSubmit={submit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 dark:text-zinc-400 mb-1">Nom *</label>
                        <input className="input" value={form.name} onChange={e => set('name', e.target.value)} required />
                        {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 dark:text-zinc-400 mb-1">Email *</label>
                            <input type="email" className="input" value={form.email} onChange={e => set('email', e.target.value)} required />
                            {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 dark:text-zinc-400 mb-1">Téléphone *</label>
                            <input className="input" value={form.phone} onChange={e => set('phone', e.target.value)} required />
                            {errors.phone && <p className="text-xs text-red-600 mt-1">{errors.phone}</p>}
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 dark:text-zinc-400 mb-1">Ville *</label>
                            <input className="input" value={form.city} onChange={e => set('city', e.target.value)} required />
                            {errors.city && <p className="text-xs text-red-600 mt-1">{errors.city}</p>}
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 dark:text-zinc-400 mb-1">Statut</label>
                            <select className="input" value={form.status} onChange={e => set('status', e.target.value)}>
                                <option value="pending">En attente</option>
                                <option value="approved">Approuvé</option>
                                <option value="rejected">Refusé</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 dark:text-zinc-400 mb-1">Adresse</label>
                        <input className="input" value={form.address} onChange={e => set('address', e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 dark:text-zinc-400 mb-1">Logo (URL)</label>
                        <input className="input" value={form.logo_url} onChange={e => set('logo_url', e.target.value)} placeholder="https://…" />
                        {errors.logo_url && <p className="text-xs text-red-600 mt-1">{errors.logo_url}</p>}
                    </div>

                    {!isEdit && (
                        <div className="border-t border-gray-100 dark:border-zinc-800 pt-4">
                            <label className="block text-xs font-semibold text-gray-500 dark:text-zinc-400 mb-2">Propriétaire</label>
                            <div className="flex gap-2 mb-3">
                                <button type="button" onClick={() => set('owner_mode', 'existing')}
                                    className={`flex-1 px-3 py-2 rounded-lg text-xs font-semibold border transition-colors ${form.owner_mode === 'existing' ? 'bg-orange-50 dark:bg-orange-500/10 border-orange-300 dark:border-orange-500/40 text-orange-700 dark:text-orange-400' : 'border-gray-200 dark:border-zinc-700 text-gray-500 dark:text-zinc-400'}`}>
                                    Compte existant
                                </button>
                                <button type="button" onClick={() => set('owner_mode', 'new')}
                                    className={`flex-1 px-3 py-2 rounded-lg text-xs font-semibold border transition-colors ${form.owner_mode === 'new' ? 'bg-orange-50 dark:bg-orange-500/10 border-orange-300 dark:border-orange-500/40 text-orange-700 dark:text-orange-400' : 'border-gray-200 dark:border-zinc-700 text-gray-500 dark:text-zinc-400'}`}>
                                    Nouveau compte
                                </button>
                            </div>

                            {form.owner_mode === 'existing' ? (
                                <div>
                                    <select className="input" value={form.existing_user_id} onChange={e => set('existing_user_id', e.target.value)} required>
                                        <option value="">— Sélectionner un propriétaire —</option>
                                        {availableOwners.map(o => (
                                            <option key={o.id} value={o.id}>{o.name} ({o.email})</option>
                                        ))}
                                    </select>
                                    {availableOwners.length === 0 && (
                                        <p className="text-xs text-gray-400 mt-1">Aucun propriétaire disponible sans auto-école — créez un nouveau compte.</p>
                                    )}
                                    {errors.existing_user_id && <p className="text-xs text-red-600 mt-1">{errors.existing_user_id}</p>}
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <input className="input" placeholder="Nom du propriétaire" value={form.new_owner_name} onChange={e => set('new_owner_name', e.target.value)} required />
                                        {errors.new_owner_name && <p className="text-xs text-red-600 mt-1">{errors.new_owner_name}</p>}
                                    </div>
                                    <div>
                                        <input type="email" className="input" placeholder="Email du propriétaire" value={form.new_owner_email} onChange={e => set('new_owner_email', e.target.value)} required />
                                        {errors.new_owner_email && <p className="text-xs text-red-600 mt-1">{errors.new_owner_email}</p>}
                                    </div>
                                    <p className="col-span-2 text-xs text-gray-400">Un lien de création de mot de passe sera envoyé par email au nouveau propriétaire.</p>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={onClose} className="btn-secondary">Annuler</button>
                        <button type="submit" disabled={processing} className="btn-primary">
                            {isEdit ? 'Enregistrer' : 'Créer'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function SortHeader({ label, field, sort, direction, onSort }) {
    const active = sort === field;
    return (
        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
            <button onClick={() => onSort(field)} className="inline-flex items-center gap-1 hover:text-gray-900 dark:hover:text-zinc-100">
                {label}
                {active && (direction === 'asc' ? <ChevronUpIcon className="w-3 h-3" /> : <ChevronDownIcon className="w-3 h-3" />)}
            </button>
        </th>
    );
}

export default function AutoSchools({ schools, filters, cities = [], available_owners = [] }) {
    const { flash } = usePage().props;
    const [search, setSearch] = useState(filters.search ?? '');
    const [status, setStatus] = useState(filters.status ?? 'all');
    const [city, setCity] = useState(filters.city ?? 'all');
    const [rejectModal, setRejectModal] = useState(null);
    const [rejectReason, setRejectReason] = useState('');
    const [modal, setModal] = useState(null); // 'create' | school object | null

    const applyFilters = (overrides = {}) => {
        router.get(route('admin.auto-schools.index'), {
            search, status, city, sort: filters.sort, direction: filters.direction, ...overrides,
        }, { preserveState: true, replace: true });
    };

    const onSort = (field) => {
        const direction = filters.sort === field && filters.direction === 'asc' ? 'desc' : 'asc';
        applyFilters({ sort: field, direction });
    };

    const approve = (school) => router.post(route('admin.auto-schools.approve', school.id), {}, { preserveScroll: true });
    const openReject = (school) => { setRejectModal(school); setRejectReason(''); };
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

            {flash?.success && <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm border border-green-200">{flash.success}</div>}
            {flash?.error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200">{flash.error}</div>}

            <div className="card overflow-hidden">
                <div className="p-4 border-b border-gray-50 dark:border-zinc-800">
                    <div className="flex flex-col sm:flex-row gap-3 items-center">
                        <div className="relative flex-1 min-w-48 w-full">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Rechercher par nom, ville, email, téléphone…"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                                className="input pl-9"
                            />
                        </div>
                        <select value={status} onChange={(e) => { setStatus(e.target.value); applyFilters({ status: e.target.value }); }} className="input w-auto">
                            <option value="all">Tous les statuts</option>
                            <option value="pending">En attente</option>
                            <option value="approved">Approuvés</option>
                            <option value="rejected">Refusés</option>
                        </select>
                        <select value={city} onChange={(e) => { setCity(e.target.value); applyFilters({ city: e.target.value }); }} className="input w-auto">
                            <option value="all">Toutes les villes</option>
                            {cities.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <button onClick={() => applyFilters()} className="btn-primary">Filtrer</button>
                        <a href={`${route('admin.auto-schools.export')}?search=${encodeURIComponent(search)}&status=${status}`} className="btn-secondary">
                            <ArrowDownTrayIcon className="w-4 h-4" /> CSV
                        </a>
                        <button onClick={() => setModal('create')} className="btn-primary whitespace-nowrap">
                            <PlusIcon className="w-4 h-4" /> Nouvelle auto-école
                        </button>
                    </div>
                </div>

                {schools.data.length === 0 ? (
                    <EmptyState icon={BuildingOffice2Icon} title="Aucune auto-école trouvée" description="Essayez d'ajuster vos filtres, ou créez-en une nouvelle." />
                ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-zinc-800/50 border-b border-gray-100 dark:border-zinc-800">
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">Logo</th>
                                <SortHeader label="Nom" field="name" sort={filters.sort} direction={filters.direction} onSort={onSort} />
                                <SortHeader label="Ville" field="city" sort={filters.sort} direction={filters.direction} onSort={onSort} />
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">Téléphone</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">Email</th>
                                <SortHeader label="Statut" field="status" sort={filters.sort} direction={filters.direction} onSort={onSort} />
                                <SortHeader label="Créé le" field="created_at" sort={filters.sort} direction={filters.direction} onSort={onSort} />
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {schools.data.map((school) => (
                                <tr key={school.id} className="table-row">
                                    <td className="px-4 py-3">
                                        {school.logo_url ? (
                                            <img src={school.logo_url} alt={school.name} className="w-9 h-9 rounded-xl object-cover border border-gray-100 dark:border-zinc-800" />
                                        ) : (
                                            <div className="w-9 h-9 rounded-xl bg-orange-50 dark:bg-orange-500/10 border border-orange-100 dark:border-orange-500/20 flex items-center justify-center text-orange-600 dark:text-orange-400 font-bold text-xs flex-shrink-0">
                                                {school.name?.[0]?.toUpperCase()}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        <p className="font-semibold text-gray-900 dark:text-zinc-100 text-sm">{school.name}</p>
                                        {school.user?.name && <p className="text-xs text-gray-400 dark:text-zinc-500">{school.user.name}</p>}
                                    </td>
                                    <td className="px-4 py-3 text-gray-700 dark:text-zinc-300">{school.city}</td>
                                    <td className="px-4 py-3 text-gray-700 dark:text-zinc-300">{school.phone}</td>
                                    <td className="px-4 py-3 text-gray-700 dark:text-zinc-300">{school.email}</td>
                                    <td className="px-4 py-3"><StatusBadge status={school.status} /></td>
                                    <td className="px-4 py-3 text-gray-400 dark:text-zinc-500 text-xs whitespace-nowrap">
                                        {new Date(school.created_at).toLocaleDateString('fr-FR')}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                            {school.status !== 'approved' && (
                                                <button onClick={() => approve(school)} className="text-xs px-2.5 py-1 rounded-lg font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors">Approuver</button>
                                            )}
                                            {school.status !== 'rejected' && (
                                                <button onClick={() => openReject(school)} className="text-xs px-2.5 py-1 rounded-lg font-semibold bg-red-50 text-red-700 hover:bg-red-100 transition-colors">Refuser</button>
                                            )}
                                            {school.status === 'approved' && school.is_active && (
                                                <button onClick={() => router.post(route('admin.auto-schools.deactivate', school.id), {}, { preserveScroll: true })} className="text-xs px-2 py-1 rounded bg-amber-50 text-amber-700 hover:bg-amber-100 font-medium">Désactiver</button>
                                            )}
                                            {school.status === 'approved' && !school.is_active && (
                                                <button onClick={() => router.post(route('admin.auto-schools.activate', school.id), {}, { preserveScroll: true })} className="text-xs px-2 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium">Activer</button>
                                            )}
                                            <button onClick={() => setModal(school)} aria-label="Modifier" title="Modifier" className="p-1.5 rounded-lg bg-gray-50 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-700 hover:text-gray-700 dark:hover:text-zinc-200">
                                                <PencilSquareIcon className="w-3.5 h-3.5" />
                                            </button>
                                            <button onClick={() => deleteSchool(school)} aria-label="Supprimer" title="Supprimer" className="p-1.5 rounded-lg bg-gray-50 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400">
                                                <TrashIcon className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                )}

                <Pagination paginator={schools} />
            </div>

            {rejectModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 w-full max-w-md shadow-xl">
                        <h3 className="font-semibold text-gray-900 dark:text-zinc-100 mb-3">Refuser « {rejectModal.name} »</h3>
                        <textarea
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            placeholder="Raison du refus..."
                            rows={3}
                            className="input"
                        />
                        <div className="flex justify-end gap-3 mt-4">
                            <button onClick={() => setRejectModal(null)} className="btn-secondary">Annuler</button>
                            <button onClick={submitReject} disabled={!rejectReason.trim()} className="btn-danger">Confirmer le refus</button>
                        </div>
                    </div>
                </div>
            )}

            {modal && (
                <SchoolModal
                    school={modal === 'create' ? null : modal}
                    availableOwners={available_owners}
                    onClose={() => setModal(null)}
                />
            )}
        </AdminLayout>
    );
}
