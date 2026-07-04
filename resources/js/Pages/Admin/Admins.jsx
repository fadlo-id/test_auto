import React, { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { router, Link, useForm, usePage } from '@inertiajs/react';

/* ── Icons ─────────────────────────────────────────────────── */
const Ic = {
    search: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>,
    plus:   <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path d="M12 5v14M5 12h14"/></svg>,
    edit:   <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
    trash:  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>,
    ban:    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><circle cx="12" cy="12" r="10"/><path d="M4.93 4.93l14.14 14.14"/></svg>,
    check:  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><polyline points="20 6 9 17 4 12"/></svg>,
    key:    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>,
    x:      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M18 6L6 18M6 6l12 12"/></svg>,
    shield: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    user:   <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    lock:   <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>,
    note:   <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
    link:   <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>,
};

/* ── Color config for roles ─────────────────────────────────── */
const ROLE_COLORS = {
    purple: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200', dot: 'bg-purple-500' },
    blue:   { bg: 'bg-blue-100',   text: 'text-blue-700',   border: 'border-blue-200',   dot: 'bg-blue-500'   },
    green:  { bg: 'bg-emerald-100',text: 'text-emerald-700',border: 'border-emerald-200',dot: 'bg-emerald-500' },
    orange: { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200', dot: 'bg-orange-500'  },
    teal:   { bg: 'bg-teal-100',   text: 'text-teal-700',   border: 'border-teal-200',   dot: 'bg-teal-500'    },
    amber:  { bg: 'bg-amber-100',  text: 'text-amber-700',  border: 'border-amber-200',  dot: 'bg-amber-500'   },
    gray:   { bg: 'bg-gray-100',   text: 'text-gray-700',   border: 'border-gray-200',   dot: 'bg-gray-500'    },
};
const roleColor = (color) => ROLE_COLORS[color] ?? ROLE_COLORS.blue;

/* ── Badges ─────────────────────────────────────────────────── */
/** hierarchyRole: { name, label, color, level } — the fine-grained tier (Super Admin/Admin/Support/Moderator). */
function RoleBadge({ hierarchyRole }) {
    const c = roleColor(hierarchyRole?.color ?? 'blue');
    const label = hierarchyRole?.label ?? 'Admin';
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${c.bg} ${c.text}`}>
            {hierarchyRole?.name === 'super_admin' ? Ic.shield : Ic.user}
            {label}
        </span>
    );
}

function StatusBadge({ statusLabel }) {
    const map = {
        active:   'bg-emerald-100 text-emerald-700',
        inactive: 'bg-gray-100 text-gray-500',
        banned:   'bg-red-100 text-red-700',
    };
    const labels = { active: 'Actif', inactive: 'Suspendu', banned: 'Banni' };
    return <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${map[statusLabel] ?? map.inactive}`}>{labels[statusLabel] ?? statusLabel}</span>;
}

/* ── Permission Groups ──────────────────────────────────────── */
function PermissionCards({ permissions_map, selected, onChange }) {
    const [pSearch, setPSearch] = useState('');

    const grouped = Object.entries(permissions_map).reduce((acc, [key, val]) => {
        if (!acc[val.group]) acc[val.group] = [];
        acc[val.group].push({ key, ...val });
        return acc;
    }, {});

    const filteredGrouped = pSearch
        ? Object.fromEntries(
            Object.entries(grouped)
                .map(([g, items]) => [g, items.filter(i => i.label.toLowerCase().includes(pSearch.toLowerCase()))])
                .filter(([, items]) => items.length > 0)
          )
        : grouped;

    const allKeys = Object.keys(permissions_map);
    const allSelected = allKeys.every(k => selected.includes(k));

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2">
                <div className="relative flex-1">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400">{Ic.search}</span>
                    <input value={pSearch} onChange={e => setPSearch(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-orange-300"
                        placeholder="Filtrer les permissions…" />
                </div>
                <button type="button"
                    onClick={() => onChange(allSelected ? [] : allKeys)}
                    className="px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap">
                    {allSelected ? 'Désélectionner tout' : 'Tout sélectionner'}
                </button>
            </div>

            {/* Progress indicator */}
            <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-orange-500 rounded-full transition-all duration-300"
                        style={{ width: `${Math.round((selected.length / allKeys.length) * 100)}%` }} />
                </div>
                <span className="text-[11px] text-gray-500 whitespace-nowrap tabular-nums">
                    {selected.length}/{allKeys.length}
                </span>
            </div>

            {Object.entries(filteredGrouped).map(([group, items]) => {
                const groupKeys = items.map(i => i.key);
                const groupAll = groupKeys.every(k => selected.includes(k));
                const groupSome = groupKeys.some(k => selected.includes(k));

                const toggleGroup = () => {
                    if (groupAll) onChange(selected.filter(k => !groupKeys.includes(k)));
                    else onChange([...new Set([...selected, ...groupKeys])]);
                };

                return (
                    <div key={group} className={`border rounded-xl overflow-hidden transition-colors ${groupSome ? 'border-orange-200' : 'border-gray-100'}`}>
                        <div className={`flex items-center justify-between px-3 py-2 border-b transition-colors ${groupSome ? 'bg-orange-50 border-orange-100' : 'bg-gray-50 border-gray-100'}`}>
                            <div className="flex items-center gap-2">
                                <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">{group}</span>
                                {groupSome && !groupAll && (
                                    <span className="text-[10px] text-orange-500 font-medium">partiel</span>
                                )}
                            </div>
                            <button type="button" onClick={toggleGroup}
                                className="text-[11px] text-orange-600 hover:text-orange-700 font-medium">
                                {groupAll ? 'Désélectionner' : 'Tout sélectionner'}
                            </button>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 p-2">
                            {items.map(item => (
                                <label key={item.key}
                                    className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg cursor-pointer transition-colors text-xs select-none
                                        ${selected.includes(item.key) ? 'bg-orange-50 text-orange-700 font-medium' : 'hover:bg-gray-50 text-gray-600'}`}>
                                    <input type="checkbox" className="accent-orange-600 shrink-0"
                                        checked={selected.includes(item.key)}
                                        onChange={() => {
                                            if (selected.includes(item.key)) onChange(selected.filter(k => k !== item.key));
                                            else onChange([...selected, item.key]);
                                        }} />
                                    {item.label}
                                </label>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

/* ── Admin Form Modal ───────────────────────────────────────── */
function AdminFormModal({ admin, roles, permissions_map, onClose }) {
    const isEdit = !!admin;
    const [tab, setTab] = useState('info');

    const defaultRoleId = admin?.role_id ?? roles?.find(r => r.name === 'admin')?.id ?? roles?.[0]?.id;

    const { data, setData, post, put, processing, errors } = useForm({
        name:                  admin?.name ?? '',
        email:                 admin?.email ?? '',
        phone:                 admin?.phone ?? '',
        role_id:               defaultRoleId,
        password:              '',
        password_confirmation: '',
        notes:                 admin?.notes ?? '',
        permissions:           admin?.permissions ?? [],
    });

    const selectedRole = roles?.find(r => r.id === Number(data.role_id));
    const isSuperAdminTier = selectedRole?.name === 'super_admin';

    const submit = (e) => {
        e.preventDefault();
        if (isEdit) {
            put(route('admin.admins.update', admin.id), { onSuccess: onClose });
        } else {
            post(route('admin.admins.store'), { onSuccess: onClose });
        }
    };

    const tabs = [
        { id: 'info',   label: 'Informations', icon: Ic.user },
        { id: 'perms',  label: 'Permissions',  icon: Ic.shield },
        { id: 'notes',  label: 'Notes',         icon: Ic.note },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto"
            onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-6" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-gray-100">
                    <div>
                        <h3 className="text-base font-bold text-gray-900">
                            {isEdit ? `Modifier — ${admin.name}` : 'Nouvel administrateur'}
                        </h3>
                        {isEdit && (
                            <p className="text-xs text-gray-400 mt-0.5">{admin.email}</p>
                        )}
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">{Ic.x}</button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-100 px-5 gap-1">
                    {tabs.map(t => (
                        <button key={t.id} type="button"
                            onClick={() => setTab(t.id)}
                            className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold border-b-2 transition-colors -mb-px
                                ${tab === t.id ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                            {t.icon} {t.label}
                            {t.id === 'perms' && !isSuperAdminTier && (
                                <span className={`ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] tabular-nums
                                    ${data.permissions.length > 0 ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-400'}`}>
                                    {data.permissions.length}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                <form onSubmit={submit} className="p-5">
                    {/* ── Tab: Informations ── */}
                    {tab === 'info' && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Nom complet *</label>
                                    <input value={data.name} onChange={e => setData('name', e.target.value)}
                                        className="input-field" placeholder="Jean Dupont" required />
                                    {errors.name && <p className="text-red-500 text-xs mt-0.5">{errors.name}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Adresse email *</label>
                                    <input type="email" value={data.email} onChange={e => setData('email', e.target.value)}
                                        className="input-field" placeholder="admin@exemple.ma" required />
                                    {errors.email && <p className="text-red-500 text-xs mt-0.5">{errors.email}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Téléphone</label>
                                    <input value={data.phone} onChange={e => setData('phone', e.target.value)}
                                        className="input-field" placeholder="+212 6XX XXX XXX" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Rôle (hiérarchie) *</label>
                                    <select value={data.role_id ?? ''} onChange={e => {
                                        const id = Number(e.target.value);
                                        setData('role_id', id);
                                        if (roles?.find(r => r.id === id)?.name === 'super_admin') setTab('info');
                                    }} className="input-field">
                                        {roles?.map(r => (
                                            <option key={r.id} value={r.id}>{r.label}</option>
                                        ))}
                                    </select>
                                    {errors.role_id && <p className="text-red-500 text-xs mt-0.5">{errors.role_id}</p>}
                                </div>
                            </div>

                            {/* Role description */}
                            {selectedRole && (
                                <div className={`flex items-start gap-2 p-3 rounded-xl text-xs border ${
                                    isSuperAdminTier
                                        ? 'bg-purple-50 border-purple-100 text-purple-700'
                                        : 'bg-blue-50 border-blue-100 text-blue-700'
                                }`}>
                                    <span className="mt-0.5 shrink-0">{isSuperAdminTier ? Ic.shield : Ic.user}</span>
                                    <span>{selectedRole.description ?? ''}</span>
                                </div>
                            )}

                            {/* Password fields — only on create */}
                            {!isEdit && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-gray-100">
                                    <div>
                                        <label className="flex items-center gap-1 text-xs font-medium text-gray-600 mb-1">{Ic.lock} Mot de passe *</label>
                                        <input type="password" value={data.password} onChange={e => setData('password', e.target.value)}
                                            className="input-field" required autoComplete="new-password" />
                                        {errors.password && <p className="text-red-500 text-xs mt-0.5">{errors.password}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">Confirmer *</label>
                                        <input type="password" value={data.password_confirmation} onChange={e => setData('password_confirmation', e.target.value)}
                                            className="input-field" required autoComplete="new-password" />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── Tab: Permissions ── */}
                    {tab === 'perms' && (
                        <div>
                            {isSuperAdminTier ? (
                                <div className="py-8 text-center">
                                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-purple-100 mb-3">
                                        {Ic.shield}
                                    </div>
                                    <p className="text-sm font-semibold text-purple-700 mb-1">Accès total</p>
                                    <p className="text-xs text-gray-500">Un Super Administrateur dispose de toutes les permissions sans restriction. Aucune configuration nécessaire.</p>
                                </div>
                            ) : (
                                <PermissionCards
                                    permissions_map={permissions_map}
                                    selected={data.permissions}
                                    onChange={p => setData('permissions', p)}
                                />
                            )}
                        </div>
                    )}

                    {/* ── Tab: Notes ── */}
                    {tab === 'notes' && (
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-2">
                                Notes internes
                                <span className="ml-1 text-gray-400 font-normal">(non visible par l'admin)</span>
                            </label>
                            <textarea
                                value={data.notes}
                                onChange={e => setData('notes', e.target.value)}
                                rows={6}
                                className="input-field resize-none"
                                placeholder="Notes sur cet administrateur, raisons de suspension éventuelle, historique…"
                            />
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-4 mt-4 border-t border-gray-100">
                        <button type="button" onClick={onClose}
                            className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                            Annuler
                        </button>
                        <button type="submit" disabled={processing}
                            className="px-5 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-60">
                            {processing ? 'Enregistrement…' : isEdit ? 'Mettre à jour' : "Créer l'administrateur"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

/* ── KPI Card ───────────────────────────────────────────────── */
function KpiCard({ label, value, color = 'gray', icon }) {
    const styles = {
        gray:   { wrap: 'bg-white border-gray-200',    num: 'text-gray-900',     icon: 'bg-gray-100 text-gray-500'   },
        purple: { wrap: 'bg-purple-50 border-purple-200', num: 'text-purple-700', icon: 'bg-purple-100 text-purple-600' },
        green:  { wrap: 'bg-emerald-50 border-emerald-200', num: 'text-emerald-700', icon: 'bg-emerald-100 text-emerald-600' },
        red:    { wrap: 'bg-red-50 border-red-200',    num: 'text-red-700',      icon: 'bg-red-100 text-red-500'     },
    };
    const s = styles[color];
    return (
        <div className={`rounded-xl border p-4 flex items-center gap-3 ${s.wrap}`}>
            {icon && <div className={`p-2 rounded-lg ${s.icon}`}>{icon}</div>}
            <div>
                <p className="text-xs text-gray-500 font-medium">{label}</p>
                <p className={`text-2xl font-bold tabular-nums ${s.num}`}>{value}</p>
            </div>
        </div>
    );
}

/* ── Permission bar ─────────────────────────────────────────── */
function PermBar({ count, total, isSuperAdmin }) {
    if (isSuperAdmin) return <span className="text-[11px] text-purple-600 font-medium">Toutes ({total})</span>;
    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
    return (
        <div className="flex items-center gap-2">
            <div className="w-16 h-1 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-orange-400 rounded-full" style={{ width: `${pct}%` }} />
            </div>
            <span className="text-[11px] text-gray-500 tabular-nums">{count}/{total}</span>
        </div>
    );
}

/* ── Main Page ──────────────────────────────────────────────── */
export default function Admins({ admins, stats, roles, filters, permissions_map }) {
    const { auth } = usePage().props;
    const [search, setSearch] = useState(filters?.search ?? '');
    const [role, setRole]     = useState(filters?.role ?? '');
    const [status, setStatus] = useState(filters?.status ?? '');
    const [showForm, setShowForm] = useState(false);
    const [editTarget, setEditTarget] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState(null);

    const totalPerms = Object.keys(permissions_map).length;

    const applyFilters = (params) => {
        router.get(route('admin.admins.index'), { ...filters, ...params }, { preserveState: true, replace: true });
    };

    const handleSearch = (e) => { e.preventDefault(); applyFilters({ search, role, status }); };

    const toggleStatus = (admin) => {
        router.post(route('admin.admins.toggle-status', admin.id), {
            action: admin.is_active ? 'suspend' : 'activate',
        });
    };

    const doDelete = (admin) => {
        router.delete(route('admin.admins.destroy', admin.id), { onSuccess: () => setConfirmDelete(null) });
    };

    const resetPassword = (admin) => {
        if (confirm(`Réinitialiser le mot de passe de ${admin.name} ?`)) {
            router.post(route('admin.admins.reset-password', admin.id));
        }
    };

    return (
        <AdminLayout title="Gestion des administrateurs">
            <div className="space-y-6">

                {/* KPI */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <KpiCard label="Total admins"   value={stats.total}        color="gray"   icon={Ic.user}   />
                    <KpiCard label="Super Admins"   value={stats.super_admins} color="purple" icon={Ic.shield} />
                    <KpiCard label="Actifs"         value={stats.active}       color="green"  icon={Ic.check}  />
                    <KpiCard label="Suspendus"      value={stats.suspended}    color="red"    icon={Ic.ban}    />
                </div>

                {/* Filters + Add */}
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{Ic.search}</span>
                            <input value={search} onChange={e => setSearch(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                                placeholder="Rechercher un admin…" />
                        </div>
                        <select value={role} onChange={e => { setRole(e.target.value); applyFilters({ search, role: e.target.value, status }); }}
                            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white">
                            <option value="">Tous les rôles</option>
                            {roles?.map(r => (
                                <option key={r.name} value={r.name}>{r.label}</option>
                            ))}
                        </select>
                        <select value={status} onChange={e => { setStatus(e.target.value); applyFilters({ search, role, status: e.target.value }); }}
                            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white">
                            <option value="">Tous les états</option>
                            <option value="active">Actif</option>
                            <option value="inactive">Suspendu</option>
                            <option value="banned">Banni</option>
                        </select>
                        <button type="submit" className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-lg transition-colors">
                            Filtrer
                        </button>
                        <button type="button"
                            onClick={() => { setEditTarget(null); setShowForm(true); }}
                            className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold rounded-lg transition-colors">
                            {Ic.plus} Nouvel admin
                        </button>
                    </form>
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100">
                                    <th className="text-left px-4 py-3 text-[12px] font-semibold text-gray-500 uppercase tracking-wide">Administrateur</th>
                                    <th className="text-left px-4 py-3 text-[12px] font-semibold text-gray-500 uppercase tracking-wide">Rôle</th>
                                    <th className="text-left px-4 py-3 text-[12px] font-semibold text-gray-500 uppercase tracking-wide">État</th>
                                    <th className="text-left px-4 py-3 text-[12px] font-semibold text-gray-500 uppercase tracking-wide">Permissions</th>
                                    <th className="text-left px-4 py-3 text-[12px] font-semibold text-gray-500 uppercase tracking-wide">Connexion</th>
                                    <th className="text-right px-4 py-3 text-[12px] font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {admins.data?.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="text-center py-14 text-gray-400 text-sm">
                                            <div className="flex flex-col items-center gap-2">
                                                {Ic.user}
                                                <span>Aucun administrateur trouvé.</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : admins.data?.map(a => (
                                    <tr key={a.id} className="hover:bg-gray-50/60 transition-colors group">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0 ${a.is_super_admin ? 'bg-gradient-to-br from-purple-400 to-purple-600' : 'bg-gradient-to-br from-blue-400 to-blue-600'}`}>
                                                    {a.name[0]?.toUpperCase()}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-medium text-gray-900 truncate">
                                                        {a.name}
                                                        {a.id === auth?.user?.id && (
                                                            <span className="ml-1.5 text-[10px] text-gray-400 font-normal">(vous)</span>
                                                        )}
                                                    </p>
                                                    <p className="text-[11px] text-gray-400 truncate">{a.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <RoleBadge hierarchyRole={a.hierarchy_role} />
                                        </td>
                                        <td className="px-4 py-3">
                                            <StatusBadge statusLabel={a.status_label} />
                                        </td>
                                        <td className="px-4 py-3">
                                            <PermBar count={a.permissions_count} total={totalPerms} isSuperAdmin={a.is_super_admin} />
                                        </td>
                                        <td className="px-4 py-3 text-[11px] text-gray-400">
                                            {a.last_login_at
                                                ? new Date(a.last_login_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: '2-digit', hour: '2-digit', minute: '2-digit' })
                                                : <span className="text-gray-300">Jamais</span>}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-end gap-1">
                                                {a.can_edit && (
                                                    <button onClick={() => { setEditTarget(a); setShowForm(true); }}
                                                        title="Modifier"
                                                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                                        {Ic.edit}
                                                    </button>
                                                )}
                                                {a.can_toggle && (
                                                    <button onClick={() => toggleStatus(a)}
                                                        title={a.is_active ? 'Suspendre' : 'Réactiver'}
                                                        className={`p-1.5 rounded-lg transition-colors ${a.is_active
                                                            ? 'text-gray-400 hover:text-amber-600 hover:bg-amber-50'
                                                            : 'text-gray-400 hover:text-emerald-600 hover:bg-emerald-50'}`}>
                                                        {a.is_active ? Ic.ban : Ic.check}
                                                    </button>
                                                )}
                                                {a.can_reset_pw && (
                                                    <button onClick={() => resetPassword(a)}
                                                        title="Réinitialiser le mot de passe"
                                                        className="p-1.5 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors">
                                                        {Ic.key}
                                                    </button>
                                                )}
                                                {a.can_delete && (
                                                    <button onClick={() => setConfirmDelete(a)}
                                                        title="Supprimer"
                                                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                                        {Ic.trash}
                                                    </button>
                                                )}
                                                {!a.can_edit && !a.can_toggle && !a.can_reset_pw && !a.can_delete && (
                                                    <span className="text-[11px] text-gray-300 pr-2">—</span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {admins.last_page > 1 && (
                        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                            <p className="text-xs text-gray-500">{admins.from}–{admins.to} sur {admins.total}</p>
                            <div className="flex items-center gap-1">
                                {admins.links?.map((link, i) => (
                                    link.url
                                        ? <Link key={i} href={link.url}
                                            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${link.active ? 'bg-orange-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                                            dangerouslySetInnerHTML={{ __html: link.label }} />
                                        : <span key={i} className="px-3 py-1.5 rounded text-xs text-gray-300"
                                            dangerouslySetInnerHTML={{ __html: link.label }} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Quick link to Roles page */}
                <div className="flex items-center justify-end">
                    <a href={route('admin.roles.index')}
                        className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-orange-600 transition-colors">
                        {Ic.link} Gérer la matrice des rôles et permissions
                    </a>
                </div>
            </div>

            {/* Create / Edit Modal */}
            {showForm && (
                <AdminFormModal
                    admin={editTarget}
                    roles={roles}
                    permissions_map={permissions_map}
                    onClose={() => { setShowForm(false); setEditTarget(null); }}
                />
            )}

            {/* Delete Confirm */}
            {confirmDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                                {Ic.trash}
                            </div>
                            <h3 className="text-base font-bold text-gray-900">Supprimer l'administrateur</h3>
                        </div>
                        <p className="text-sm text-gray-600 mb-5">
                            Êtes-vous sûr de vouloir supprimer <strong>{confirmDelete.name}</strong> ?
                            Cette action est <span className="text-red-600 font-semibold">irréversible</span>.
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button onClick={() => setConfirmDelete(null)}
                                className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-gray-600">
                                Annuler
                            </button>
                            <button onClick={() => doDelete(confirmDelete)}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition-colors">
                                Supprimer définitivement
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
