import { useState } from 'react';
import { Head, router, Link, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    Search, Plus, Minus, RotateCcw, Eye, Ban, Zap, X,
    Infinity, Filter, TrendingDown, AlertTriangle, CheckCircle,
    CreditCard, BarChart3, Lock, Unlock, Phone, Mail, Globe,
    MessageCircle, MapPin, Users, ShieldOff,
} from 'lucide-react';

const TYPE_ICONS = {
    view: Eye,
    whatsapp: MessageCircle,
    phone: Phone,
    website: Globe,
    facebook: Users,
    instagram: Zap,
    maps: MapPin,
    email: Mail,
};

function ProgressBar({ balance, total, unlimited, blocked }) {
    if (blocked) {
        return (
            <div className="flex items-center gap-1.5">
                <div className="flex-1 h-1.5 bg-gray-200 rounded-full">
                    <div className="h-1.5 bg-gray-400 rounded-full w-full" />
                </div>
                <Lock className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            </div>
        );
    }
    if (unlimited || total === null) {
        return (
            <div className="flex items-center gap-1.5">
                <div className="flex-1 h-1.5 bg-emerald-100 rounded-full">
                    <div className="h-1.5 bg-emerald-400 rounded-full w-full" />
                </div>
                <Infinity className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
            </div>
        );
    }
    const used = Math.max(0, total - (balance ?? 0));
    const pct  = total > 0 ? Math.min(100, Math.round(used / total * 100)) : 0;
    const color = pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-amber-500' : 'bg-blue-500';
    return (
        <div className="flex items-center gap-1.5">
            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-1.5 rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
            </div>
            <span className="text-[11px] text-gray-500 tabular-nums w-7 text-right">{pct}%</span>
        </div>
    );
}

function StatusBadge({ school }) {
    if (!school?.is_active)            return <span className="badge-red">Suspendu</span>;
    if (school?.credits_exhausted)     return <span className="badge-red">Épuisés</span>;
    if (school?.status !== 'approved') return <span className="badge-gray">{school?.status ?? '—'}</span>;
    if (school?.is_critical)           return <span className="badge-red">Critique</span>;
    if (school?.has_any_exhausted)     return <span className="badge-amber">Partiel</span>;
    if (school?.has_any_blocked)       return <span className="badge-gray">Bloqué</span>;
    return <span className="badge-green">Actif</span>;
}

function SubBadge({ status }) {
    const map = { active: ['badge-green', 'Actif'], expired: ['badge-red', 'Expiré'], cancelled: ['badge-gray', 'Annulé'], none: ['badge-gray', 'Aucun'] };
    const [cls, lbl] = map[status] ?? ['badge-gray', status ?? '—'];
    return <span className={cls}>{lbl}</span>;
}

function KpiCard({ label, value, color = 'gray', icon: Icon }) {
    const ring = { gray: 'bg-gray-50 border-gray-200', green: 'bg-emerald-50 border-emerald-200', red: 'bg-red-50 border-red-200', amber: 'bg-amber-50 border-amber-200', blue: 'bg-blue-50 border-blue-200' };
    const txt  = { gray: 'text-gray-900', green: 'text-emerald-700', red: 'text-red-700', amber: 'text-amber-700', blue: 'text-blue-700' };
    return (
        <div className={`rounded-xl border p-4 ${ring[color]}`}>
            <div className="flex items-center justify-between mb-1">
                <p className="text-xs text-gray-500 font-medium">{label}</p>
                {Icon && <Icon className="w-4 h-4 text-gray-300" />}
            </div>
            <p className={`text-2xl font-bold ${txt[color]}`}>{value ?? 0}</p>
        </div>
    );
}

const FILTERS = [
    { value: '', label: 'Toutes' },
    { value: 'exhausted', label: 'Épuisées' },
    { value: 'low', label: 'Faibles' },
    { value: 'blocked', label: 'Bloquées' },
    { value: 'suspended', label: 'Suspendues' },
    { value: 'unlimited', label: 'Illimitées' },
];

export default function CreditManagement({ schools = { data: [] }, filters = {}, stats = {}, types = {} }) {
    const { flash } = usePage().props;
    const [search, setSearch] = useState(filters.search ?? '');
    const [activeFilter, setFilter] = useState(filters.filter ?? '');

    const applyFilter = (f) => {
        setFilter(f);
        router.get(route('admin.credits.index'), { search, filter: f }, { preserveState: true, replace: true });
    };

    const applySearch = (e) => {
        e.preventDefault();
        router.get(route('admin.credits.index'), { search, filter: activeFilter }, { preserveState: true, replace: true });
    };

    return (
        <AdminLayout title="Gestion des crédits">
            <Head title="Crédits" />

            {flash?.success && (
                <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700">{flash.success}</div>
            )}
            {flash?.error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{flash.error}</div>
            )}

            {/* KPI */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
                <KpiCard label="Total écoles"  value={stats.total}     color="gray"  icon={CreditCard} />
                <KpiCard label="Épuisées"      value={stats.exhausted} color="red"   icon={AlertTriangle} />
                <KpiCard label="Faibles"       value={stats.low}       color="amber" icon={TrendingDown} />
                <KpiCard label="Bloquées"      value={stats.blocked}   color="gray"  icon={Lock} />
                <KpiCard label="Suspendues"    value={stats.suspended} color="red"   icon={Ban} />
                <KpiCard label="Illimitées"    value={stats.unlimited} color="green" icon={Infinity} />
            </div>

            {/* Search + filters */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-4">
                <div className="flex flex-col sm:flex-row gap-3">
                    <form onSubmit={applySearch} className="flex flex-1 gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Rechercher par nom ou ville…"
                                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            />
                        </div>
                        <button type="submit" className="px-4 py-2 text-sm font-medium bg-orange-600 text-white rounded-xl hover:bg-orange-700">
                            Rechercher
                        </button>
                    </form>

                    <div className="flex flex-wrap gap-1.5">
                        {FILTERS.map(f => (
                            <button key={f.value} onClick={() => applyFilter(f.value)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${activeFilter === f.value ? 'bg-orange-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                                {f.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">École</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Statut</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Vues restantes</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Contacts</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Plan / Abo</th>
                                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {schools.data.length === 0 && (
                                <tr><td colSpan={6} className="text-center py-12 text-gray-400">Aucune école trouvée</td></tr>
                            )}
                            {schools.data.map(school => {
                                const viewB = school.balances?.view;
                                return (
                                    <tr key={school.id} className="hover:bg-gray-50/50">
                                        <td className="py-3 px-4">
                                            <div className="font-medium text-gray-900 truncate max-w-[180px]">{school.name}</div>
                                            <div className="text-xs text-gray-400">{school.city}</div>
                                        </td>
                                        <td className="py-3 px-4"><StatusBadge school={school} /></td>
                                        <td className="py-3 px-4 w-40">
                                            <div className="text-sm font-medium text-gray-700 mb-1">
                                                {viewB?.is_unlimited ? '∞' : (viewB?.balance ?? '—')}
                                                {school.view_total ? <span className="text-xs text-gray-400"> / {school.view_total}</span> : null}
                                            </div>
                                            <ProgressBar
                                                balance={viewB?.balance}
                                                total={school.view_total}
                                                unlimited={viewB?.is_unlimited}
                                                blocked={viewB?.is_blocked}
                                            />
                                        </td>
                                        <td className="py-3 px-4 hidden lg:table-cell">
                                            <div className="flex flex-wrap gap-1">
                                                {['whatsapp', 'phone', 'website', 'facebook', 'instagram', 'maps', 'email'].map(t => {
                                                    const b = school.balances?.[t];
                                                    const Icon = TYPE_ICONS[t] ?? Zap;
                                                    const color = b?.is_blocked ? 'text-gray-400' : b?.is_exhausted ? 'text-red-400' : b?.is_unlimited ? 'text-emerald-500' : 'text-blue-500';
                                                    const title = `${types[t] ?? t}: ${b?.is_unlimited ? '∞' : b?.is_blocked ? 'Bloqué' : (b?.balance ?? 0)}`;
                                                    return (
                                                        <span key={t} title={title} className={`inline-flex items-center gap-0.5 text-xs ${color}`}>
                                                            <Icon className="w-3 h-3" />
                                                            <span className="tabular-nums">{b?.is_unlimited ? '∞' : b?.is_blocked ? '✕' : (b?.balance ?? 0)}</span>
                                                        </span>
                                                    );
                                                })}
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="text-xs font-medium text-gray-700">{school.plan_name}</div>
                                            <SubBadge status={school.sub_status} />
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            <Link
                                                href={route('admin.credits.show', school.id)}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 transition-colors">
                                                <BarChart3 className="w-3.5 h-3.5" />
                                                Gérer
                                            </Link>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {schools.links && schools.links.length > 3 && (
                    <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
                        <p className="text-xs text-gray-500">
                            {schools.from}–{schools.to} sur {schools.total}
                        </p>
                        <div className="flex gap-1">
                            {schools.links.map((link, i) => (
                                <button key={i}
                                    onClick={() => link.url && router.get(link.url)}
                                    disabled={!link.url}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${link.active ? 'bg-orange-600 text-white' : 'text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed'}`}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
