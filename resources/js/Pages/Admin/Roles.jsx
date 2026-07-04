import React, { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Link, router, useForm } from '@inertiajs/react';
import {
    ShieldCheckIcon, UserIcon, CheckIcon, MinusIcon, ArrowLeftIcon,
    UsersIcon, KeyIcon, InformationCircleIcon, MagnifyingGlassIcon,
    PlusIcon, TrashIcon, XMarkIcon,
} from '@heroicons/react/24/outline';

/* ── Role color config ──────────────────────────────────────── */
const ROLE_STYLE = {
    purple: { header: 'bg-purple-600', badge: 'bg-purple-100 text-purple-700', border: 'border-purple-200' },
    blue:   { header: 'bg-blue-600',   badge: 'bg-blue-100 text-blue-700',     border: 'border-blue-200'   },
    green:  { header: 'bg-emerald-600',badge: 'bg-emerald-100 text-emerald-700',border: 'border-emerald-200'},
    orange: { header: 'bg-orange-600', badge: 'bg-orange-100 text-orange-700', border: 'border-orange-200' },
    teal:   { header: 'bg-teal-600',   badge: 'bg-teal-100 text-teal-700',     border: 'border-teal-200'   },
    amber:  { header: 'bg-amber-600',  badge: 'bg-amber-100 text-amber-700',   border: 'border-amber-200'  },
    gray:   { header: 'bg-gray-600',   badge: 'bg-gray-100 text-gray-700',     border: 'border-gray-200'   },
};
const rs = (color) => ROLE_STYLE[color] ?? ROLE_STYLE.blue;

/* ── Role summary card ──────────────────────────────────────── */
function RoleCard({ role, totalPerms, onDelete, canManage }) {
    const style = rs(role.color);
    const isFull = role.name === 'super_admin';
    const count  = isFull ? totalPerms : role.permissions.length;
    const pct    = totalPerms > 0 ? Math.round((count / totalPerms) * 100) : 0;

    return (
        <div className={`rounded-xl border overflow-hidden ${style.border}`}>
            <div className={`${style.header} p-4 text-white`}>
                <div className="flex items-center gap-2.5 mb-1">
                    <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                        {role.name === 'super_admin' ? <ShieldCheckIcon className="w-4 h-4" /> : <UserIcon className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm leading-tight truncate">{role.label}</p>
                        <p className="text-white/60 text-[11px] font-mono">{role.name}{role.level ? ` · niveau ${role.level}` : ''}</p>
                    </div>
                    {canManage && !role.is_system && (
                        <button onClick={() => onDelete(role)} title="Supprimer ce rôle personnalisé"
                            className="text-white/60 hover:text-white shrink-0">
                            <TrashIcon className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>
            <div className="bg-white p-3 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500 flex items-center gap-1"><UsersIcon className="w-3.5 h-3.5" /> Utilisateurs</span>
                    <span className="font-bold text-gray-800 tabular-nums">{role.user_count}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500 flex items-center gap-1"><KeyIcon className="w-3.5 h-3.5" /> Couverture</span>
                    <span className={`font-bold tabular-nums ${isFull ? 'text-purple-600' : 'text-emerald-600'}`}>
                        {isFull ? '100%' : `${pct}%`}
                        <span className="text-gray-400 font-normal ml-1">({count}/{totalPerms})</span>
                    </span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${isFull ? 'bg-purple-500' : 'bg-emerald-500'}`}
                        style={{ width: `${isFull ? 100 : pct}%` }} />
                </div>
                {role.description && (
                    <p className="text-[11px] text-gray-400 leading-relaxed pt-1 border-t border-gray-50">
                        {role.description}
                    </p>
                )}
            </div>
        </div>
    );
}

/* ── New Role modal ──────────────────────────────────────────── */
function NewRoleModal({ onClose }) {
    const { data, setData, post, processing, errors } = useForm({
        name: '', label: '', description: '', color: 'gray', level: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.roles.store'), { onSuccess: onClose });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
            <form onSubmit={submit} className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full space-y-4" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-gray-900">Nouveau rôle</h3>
                    <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600"><XMarkIcon className="w-5 h-5" /></button>
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Identifiant (unique, snake_case) *</label>
                    <input value={data.name} onChange={e => setData('name', e.target.value)} className="input-field" placeholder="regional_manager" required />
                    {errors.name && <p className="text-red-500 text-xs mt-0.5">{errors.name}</p>}
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Libellé *</label>
                    <input value={data.label} onChange={e => setData('label', e.target.value)} className="input-field" placeholder="Responsable régional" required />
                    {errors.label && <p className="text-red-500 text-xs mt-0.5">{errors.label}</p>}
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                    <textarea value={data.description} onChange={e => setData('description', e.target.value)} className="input-field resize-none" rows={2} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Couleur</label>
                        <select value={data.color} onChange={e => setData('color', e.target.value)} className="input-field">
                            {Object.keys(ROLE_STYLE).map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Niveau hiérarchique</label>
                        <input type="number" min="1" max="100" value={data.level} onChange={e => setData('level', e.target.value)} className="input-field" placeholder="ex. 3" />
                    </div>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                    <button type="button" onClick={onClose} className="btn-secondary">Annuler</button>
                    <button type="submit" disabled={processing} className="btn-primary">Créer le rôle</button>
                </div>
            </form>
        </div>
    );
}

/* ── New Permission modal ─────────────────────────────────────── */
function NewPermissionModal({ groups, onClose }) {
    const { data, setData, post, processing, errors } = useForm({
        key: '', label: '', group: groups[0] ?? 'Général', description: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.permissions.store'), { onSuccess: onClose });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
            <form onSubmit={submit} className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full space-y-4" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-gray-900">Nouvelle permission</h3>
                    <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600"><XMarkIcon className="w-5 h-5" /></button>
                </div>
                <p className="text-xs text-gray-500 -mt-2">
                    Créée ici, elle devient immédiatement assignable à un rôle et vérifiable via <code className="bg-gray-100 px-1 rounded">$user-&gt;can('clé')</code> — aucun déploiement requis.
                </p>
                <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Clé (unique, snake_case) *</label>
                    <input value={data.key} onChange={e => setData('key', e.target.value)} className="input-field" placeholder="manage_something" required />
                    {errors.key && <p className="text-red-500 text-xs mt-0.5">{errors.key}</p>}
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Libellé *</label>
                    <input value={data.label} onChange={e => setData('label', e.target.value)} className="input-field" placeholder="Quelque chose" required />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Groupe *</label>
                    <input list="perm-groups" value={data.group} onChange={e => setData('group', e.target.value)} className="input-field" required />
                    <datalist id="perm-groups">{groups.map(g => <option key={g} value={g} />)}</datalist>
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                    <textarea value={data.description} onChange={e => setData('description', e.target.value)} className="input-field resize-none" rows={2} />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                    <button type="button" onClick={onClose} className="btn-secondary">Annuler</button>
                    <button type="submit" disabled={processing} className="btn-primary">Créer la permission</button>
                </div>
            </form>
        </div>
    );
}

/* ── Main Page ──────────────────────────────────────────────── */
export default function Roles({ roles, permissions, grouped_permissions, can_manage }) {
    const [filter, setFilter] = useState('');
    const [pending, setPending] = useState({});   // { [roleId]: Set(permissionKeys) } — dirty edits not yet saved
    const [saving, setSaving] = useState(null);   // roleId currently saving
    const [showNewRole, setShowNewRole] = useState(false);
    const [showNewPerm, setShowNewPerm] = useState(false);
    const [confirmDeleteRole, setConfirmDeleteRole] = useState(null);

    const totalPerms = permissions.length;

    const filteredGroups = filter
        ? Object.fromEntries(
            Object.entries(grouped_permissions)
                .map(([g, items]) => [
                    g,
                    items.filter(p =>
                        p.label.toLowerCase().includes(filter.toLowerCase()) ||
                        p.key.toLowerCase().includes(filter.toLowerCase())
                    )
                ])
                .filter(([, items]) => items.length > 0)
          )
        : grouped_permissions;

    // Effective permission set per role: pending edits override the server state.
    const effectiveSet = (role) => pending[role.id] ?? new Set(role.permissions);

    const isEditable = (role) => can_manage && role.name !== 'super_admin';

    const toggleCell = (role, key) => {
        if (!isEditable(role)) return;
        setPending(prev => {
            const current = new Set(prev[role.id] ?? role.permissions);
            current.has(key) ? current.delete(key) : current.add(key);
            return { ...prev, [role.id]: current };
        });
    };

    const isDirty = (role) => pending[role.id] !== undefined;

    const save = (role) => {
        setSaving(role.id);
        router.put(route('admin.roles.permissions.update', role.id), {
            permissions: Array.from(pending[role.id] ?? role.permissions),
        }, {
            preserveScroll: true,
            onFinish: () => setSaving(null),
            onSuccess: () => setPending(prev => { const { [role.id]: _, ...rest } = prev; return rest; }),
        });
    };

    const discard = (role) => setPending(prev => { const { [role.id]: _, ...rest } = prev; return rest; });

    const doDeleteRole = (role) => {
        router.delete(route('admin.roles.destroy', role.id), { onSuccess: () => setConfirmDeleteRole(null) });
    };

    const groupNames = Object.keys(filteredGroups);
    const allGroupNames = Object.keys(grouped_permissions);

    return (
        <AdminLayout title="Rôles & Permissions">
            <div className="space-y-6">

                {/* Header */}
                <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Matrice des rôles et permissions</h1>
                        <p className="text-sm text-gray-500 mt-0.5">
                            {roles.length} rôles · {totalPerms} permissions
                        </p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                        {can_manage && (
                            <>
                                <button onClick={() => setShowNewPerm(true)} className="btn-secondary btn-sm">
                                    <PlusIcon className="w-4 h-4" /> Permission
                                </button>
                                <button onClick={() => setShowNewRole(true)} className="btn-secondary btn-sm">
                                    <PlusIcon className="w-4 h-4" /> Rôle
                                </button>
                            </>
                        )}
                        <Link href={route('admin.admins.index')} className="btn-secondary btn-sm">
                            <ArrowLeftIcon className="w-4 h-4" /> Retour aux admins
                        </Link>
                    </div>
                </div>

                {/* Info banner */}
                <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-100 rounded-xl text-sm text-blue-700">
                    <InformationCircleIcon className="w-5 h-5 shrink-0 mt-0.5" />
                    <span>
                        Cliquez une cellule pour modifier les permissions d'un rôle, puis <strong>Enregistrer</strong> la colonne.
                        Le Super Admin a toujours accès total et n'est pas modifiable. Pour des permissions individuelles
                        exceptionnelles, utilisez la{' '}
                        <Link href={route('admin.admins.index')} className="underline font-medium">page des administrateurs</Link>.
                    </span>
                </div>

                {/* Role cards */}
                <div className={`grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`}>
                    {roles.map(role => (
                        <RoleCard key={role.id} role={role} totalPerms={totalPerms} canManage={can_manage} onDelete={setConfirmDeleteRole} />
                    ))}
                </div>

                {/* Matrix table */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    {/* Toolbar */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
                        <h2 className="text-sm font-semibold text-gray-700">Matrice détaillée</h2>
                        <div className="relative">
                            <MagnifyingGlassIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                            <input
                                value={filter}
                                onChange={e => setFilter(e.target.value)}
                                className="pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-orange-300 w-52"
                                placeholder="Filtrer les permissions…"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-100">
                                    <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wide w-64">
                                        Permission
                                    </th>
                                    {roles.map(role => (
                                        <th key={role.id} className="px-3 py-3 text-center min-w-[130px]">
                                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-semibold ${rs(role.color).badge}`}>
                                                {role.name === 'super_admin' ? <ShieldCheckIcon className="w-3.5 h-3.5" /> : <UserIcon className="w-3.5 h-3.5" />}
                                                {role.label}
                                            </span>
                                            {isDirty(role) && (
                                                <div className="flex items-center justify-center gap-1 mt-1.5">
                                                    <button onClick={() => save(role)} disabled={saving === role.id}
                                                        className="text-[10px] px-1.5 py-0.5 rounded bg-orange-600 text-white hover:bg-orange-700 disabled:opacity-50">
                                                        {saving === role.id ? '…' : 'Enregistrer'}
                                                    </button>
                                                    <button onClick={() => discard(role)} className="text-[10px] px-1.5 py-0.5 rounded border border-gray-200 text-gray-500 hover:bg-gray-50">
                                                        Annuler
                                                    </button>
                                                </div>
                                            )}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {groupNames.length === 0 ? (
                                    <tr>
                                        <td colSpan={roles.length + 1} className="text-center py-12 text-gray-400 text-sm">
                                            Aucune permission ne correspond au filtre.
                                        </td>
                                    </tr>
                                ) : groupNames.map(group => (
                                    <React.Fragment key={group}>
                                        <tr className="bg-gray-50/80 border-t border-gray-100">
                                            <td colSpan={roles.length + 1} className="px-4 py-2">
                                                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{group}</span>
                                            </td>
                                        </tr>

                                        {filteredGroups[group].map((perm) => (
                                            <tr key={perm.key} className="border-t border-gray-50 hover:bg-orange-50/20 transition-colors">
                                                <td className="px-4 py-2.5">
                                                    <p className="text-sm font-medium text-gray-800">{perm.label}</p>
                                                    <p className="text-[11px] text-gray-400 font-mono">{perm.key}</p>
                                                </td>
                                                {roles.map(role => {
                                                    const isFull = role.name === 'super_admin';
                                                    const hasIt  = isFull || effectiveSet(role).has(perm.key);
                                                    const editable = isEditable(role);
                                                    return (
                                                        <td key={role.id} className="px-3 py-2.5 text-center">
                                                            <button
                                                                type="button"
                                                                disabled={!editable}
                                                                onClick={() => toggleCell(role, perm.key)}
                                                                aria-label={`${hasIt ? 'Retirer' : 'Accorder'} ${perm.label} pour ${role.label}`}
                                                                className={`mx-auto w-6 h-6 rounded-full flex items-center justify-center transition-colors
                                                                    ${hasIt ? (isFull ? 'bg-purple-500 text-white' : 'bg-emerald-500 text-white') : 'bg-gray-100 text-gray-300'}
                                                                    ${editable ? 'hover:ring-2 hover:ring-orange-300 cursor-pointer' : 'cursor-default'}`}
                                                            >
                                                                {hasIt ? <CheckIcon className="w-3.5 h-3.5" /> : <MinusIcon className="w-3.5 h-3.5" />}
                                                            </button>
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        ))}
                                    </React.Fragment>
                                ))}
                            </tbody>

                            <tfoot>
                                <tr className="border-t-2 border-gray-200 bg-gray-50">
                                    <td className="px-4 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wide">
                                        Couverture totale
                                    </td>
                                    {roles.map(role => {
                                        const isFull = role.name === 'super_admin';
                                        const count  = isFull ? totalPerms : effectiveSet(role).size;
                                        const pct    = totalPerms > 0 ? Math.round((count / totalPerms) * 100) : 0;
                                        return (
                                            <td key={role.id} className="px-3 py-3 text-center">
                                                <p className={`text-sm font-bold tabular-nums ${isFull ? 'text-purple-600' : 'text-emerald-600'}`}>
                                                    {isFull ? '100%' : `${pct}%`}
                                                </p>
                                                <p className="text-[11px] text-gray-400 tabular-nums">{count}/{totalPerms}</p>
                                            </td>
                                        );
                                    })}
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>

                {/* Legend */}
                <div className="flex items-center gap-6 text-xs text-gray-500 flex-wrap">
                    <span className="font-semibold text-gray-600">Légende :</span>
                    <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center text-white"><CheckIcon className="w-3.5 h-3.5" /></div>
                        <span>Accès total (Super Admin)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-white"><CheckIcon className="w-3.5 h-3.5" /></div>
                        <span>Permission accordée</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-gray-300"><MinusIcon className="w-3.5 h-3.5" /></div>
                        <span>Non accordée</span>
                    </div>
                </div>
            </div>

            {showNewRole && <NewRoleModal onClose={() => setShowNewRole(false)} />}
            {showNewPerm && <NewPermissionModal groups={allGroupNames} onClose={() => setShowNewPerm(false)} />}

            {confirmDeleteRole && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                                <TrashIcon className="w-5 h-5" />
                            </div>
                            <h3 className="text-base font-bold text-gray-900">Supprimer le rôle</h3>
                        </div>
                        <p className="text-sm text-gray-600 mb-5">
                            Supprimer <strong>{confirmDeleteRole.label}</strong> ? Les comptes qui l'utilisent perdront
                            ce rattachement (leurs autres droits ne sont pas affectés).
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button onClick={() => setConfirmDeleteRole(null)} className="btn-secondary">Annuler</button>
                            <button onClick={() => doDeleteRole(confirmDeleteRole)} className="btn-danger">Supprimer</button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
