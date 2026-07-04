import { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import {
    ArrowLeft, Plus, Minus, RotateCcw, Lock, Unlock,
    Infinity as InfinityIcon, Ban, Zap, Eye, Phone, Mail, Globe,
    MessageCircle, MapPin, Users, CheckCircle, AlertTriangle,
    Clock, ChevronRight, Undo2,
} from 'lucide-react';

const TYPE_ICONS = {
    view: Eye, whatsapp: MessageCircle, phone: Phone, website: Globe,
    facebook: Users, instagram: Zap, maps: MapPin, email: Mail,
};

const TYPE_COLORS = {
    view: '#f97316', whatsapp: '#22c55e', phone: '#3b82f6', website: '#8b5cf6',
    facebook: '#0ea5e9', instagram: '#ec4899', maps: '#f59e0b', email: '#64748b',
};

/* ── Balance card per credit type ──────────────────────────────────────── */
function CreditCard({ type, label, data, onAction, plan }) {
    const Icon = TYPE_ICONS[type] ?? Zap;
    const color = TYPE_COLORS[type] ?? '#6b7280';
    const { balance, total, used, pct, is_unlimited, is_blocked, is_exhausted } = data;

    let statusBg = 'bg-white';
    if (is_blocked)   statusBg = 'bg-gray-50 border-gray-300';
    else if (is_exhausted) statusBg = 'bg-red-50 border-red-200';
    else if (pct >= 80) statusBg = 'bg-amber-50 border-amber-200';

    return (
        <div className={`rounded-xl border ${statusBg} p-4 flex flex-col gap-3`}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: color + '20' }}>
                        <Icon className="w-4 h-4" style={{ color }} />
                    </div>
                    <span className="text-sm font-semibold text-gray-800">{label}</span>
                </div>
                <div className="flex items-center gap-1">
                    {is_blocked   && <Lock    className="w-4 h-4 text-gray-400" title="Bloqué" />}
                    {is_unlimited && <InfinityIcon className="w-4 h-4 text-emerald-500" title="Illimité" />}
                    {is_exhausted && <AlertTriangle className="w-4 h-4 text-red-500" title="Épuisé" />}
                </div>
            </div>

            {/* Balance */}
            <div>
                <div className="flex items-baseline justify-between mb-1">
                    <span className="text-2xl font-bold text-gray-900">
                        {is_unlimited ? '∞' : (balance ?? 0)}
                    </span>
                    {!is_unlimited && total != null && (
                        <span className="text-xs text-gray-400">/ {total}</span>
                    )}
                </div>
                {!is_unlimited && total != null && (
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                            className="h-1.5 rounded-full transition-all"
                            style={{ width: `${Math.min(100, pct ?? 0)}%`, backgroundColor: pct >= 80 ? '#ef4444' : pct >= 60 ? '#f59e0b' : color }}
                        />
                    </div>
                )}
                {!is_unlimited && total != null && (
                    <p className="text-[11px] text-gray-400 mt-0.5">{pct ?? 0}% utilisé · {used ?? 0} consommés</p>
                )}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-1.5 pt-1 border-t border-gray-100">
                <button onClick={() => onAction('add', type)}
                    className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs font-medium bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors">
                    <Plus className="w-3.5 h-3.5" /> Ajouter
                </button>
                <button onClick={() => onAction('remove', type)}
                    className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs font-medium bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors">
                    <Minus className="w-3.5 h-3.5" /> Retirer
                </button>
                <button onClick={() => onAction('reset', type)}
                    className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs font-medium bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
                    <RotateCcw className="w-3 h-3" /> Reset
                </button>
                {is_unlimited ? (
                    <button onClick={() => onAction('remove-unlimited', type)}
                        className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs font-medium bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors">
                        <InfinityIcon className="w-3.5 h-3.5" /> Limiter
                    </button>
                ) : (
                    <button onClick={() => onAction('unlimited', type)}
                        className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs font-medium bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors">
                        <InfinityIcon className="w-3.5 h-3.5" /> Illimité
                    </button>
                )}
                {is_blocked ? (
                    <button onClick={() => onAction('unblock', type)}
                        className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs font-medium bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                        <Unlock className="w-3.5 h-3.5" /> Débloquer
                    </button>
                ) : (
                    <button onClick={() => onAction('block', type)}
                        className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs font-medium bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                        <Lock className="w-3.5 h-3.5" /> Bloquer
                    </button>
                )}
            </div>
        </div>
    );
}

/* ── Modal pour saisie d'un montant ────────────────────────────────────── */
function AmountModal({ title, onConfirm, onClose, withNotes = true }) {
    const [amount, setAmount] = useState('');
    const [notes, setNotes] = useState('');

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4">
                <h3 className="font-bold text-gray-900 mb-4">{title}</h3>
                <input
                    type="number" min="1" max="999999"
                    value={amount} onChange={e => setAmount(e.target.value)}
                    placeholder="Montant" autoFocus
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm mb-3 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
                {withNotes && (
                    <textarea
                        value={notes} onChange={e => setNotes(e.target.value)}
                        placeholder="Notes (optionnel)" rows={2}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm mb-4 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                )}
                <div className="flex gap-2">
                    <button onClick={onClose} className="flex-1 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200">
                        Annuler
                    </button>
                    <button onClick={() => onConfirm(amount, notes)}
                        disabled={!amount || isNaN(Number(amount)) || Number(amount) < 1}
                        className="flex-1 px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-xl hover:bg-orange-700 disabled:opacity-50">
                        Confirmer
                    </button>
                </div>
            </div>
        </div>
    );
}

function ReasonModal({ title, onConfirm, onClose }) {
    const [reason, setReason] = useState('');
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4">
                <h3 className="font-bold text-gray-900 mb-4">{title}</h3>
                <textarea value={reason} onChange={e => setReason(e.target.value)}
                    placeholder="Raison (optionnel)" rows={3}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm mb-4 focus:ring-2 focus:ring-orange-500 focus:border-transparent" />
                <div className="flex gap-2">
                    <button onClick={onClose} className="flex-1 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl">Annuler</button>
                    <button onClick={() => onConfirm(reason)} className="flex-1 px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-xl hover:bg-orange-700">
                        Confirmer
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ── Bar chart: balance par type ───────────────────────────────────────── */
function BalanceChart({ summary, types }) {
    const data = Object.entries(summary.types ?? {}).map(([type, d]) => ({
        name: types[type] ?? type,
        balance: d.is_unlimited ? null : (d.balance ?? 0),
        fill: TYPE_COLORS[type] ?? '#6b7280',
    }));

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-semibold text-gray-800 mb-4">Solde actuel par type</h3>
            <ResponsiveContainer width="100%" height={220}>
                <BarChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v) => v === null ? '∞' : v} />
                    <Bar dataKey="balance" radius={[4, 4, 0, 0]}>
                        {data.map((entry, i) => (
                            <rect key={i} fill={entry.fill} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}

/* ── Line chart: consommation quotidienne ──────────────────────────────── */
function ConsumptionChart({ chartData, types }) {
    const { labels = [], series = {} } = chartData ?? {};

    const data = labels.map((day, i) => {
        const point = { day: day.slice(5) }; // MM-DD
        Object.entries(series).forEach(([type, values]) => {
            point[type] = values[i] ?? 0;
        });
        return point;
    });

    const activeTypes = Object.entries(series).filter(([, vals]) => vals.some(v => v > 0));

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-semibold text-gray-800 mb-4">Consommation — 30 derniers jours</h3>
            <ResponsiveContainer width="100%" height={220}>
                <LineChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis dataKey="day" tick={{ fontSize: 10 }} interval={4} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend formatter={(v) => types[v] ?? v} />
                    {activeTypes.map(([type]) => (
                        <Line key={type} type="monotone" dataKey={type} stroke={TYPE_COLORS[type] ?? '#6b7280'}
                            strokeWidth={2} dot={false} name={type} />
                    ))}
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}

/* ── Transaction history table ─────────────────────────────────────────── */
function ActionLabel({ action }) {
    const map = {
        consumed: ['text-gray-600', 'Consommé'],
        added: ['text-emerald-600', 'Ajouté'],
        removed: ['text-red-600', 'Retiré'],
        reset: ['text-blue-600', 'Réinitialisé'],
        renewal: ['text-blue-600', 'Renouvellement'],
        blocked: ['text-gray-500', 'Bloqué'],
        unblocked: ['text-gray-700', 'Débloqué'],
        set_unlimited: ['text-emerald-700', 'Illimité ↑'],
        remove_unlimited: ['text-amber-600', 'Illimité ↓'],
        exhausted: ['text-red-700', 'Épuisé'],
        reactivated: ['text-emerald-700', 'Réactivé'],
        suspended: ['text-red-700', 'Suspendu'],
        unsuspended: ['text-emerald-700', 'Désuspendu'],
    };
    const [cls, lbl] = map[action] ?? ['text-gray-500', action];
    return <span className={`text-xs font-medium ${cls}`}>{lbl}</span>;
}

export default function CreditDetail({ school, summary = {}, transactions = { data: [] }, chart_data = {}, types = {} }) {
    const { flash } = usePage().props;
    const [modal, setModal] = useState(null); // { action, type }

    const post = (path, data = {}) => {
        router.post(route(path, school.id), data, {
            preserveScroll: true,
            onSuccess: () => setModal(null),
        });
    };

    const handleAction = (action, type) => {
        if (['add', 'remove'].includes(action)) {
            setModal({ action, type });
        } else if (action === 'reset') {
            if (confirm(`Réinitialiser les crédits ${types[type] ?? type} selon le plan actif ?`))
                post('admin.credits.reset', { type });
        } else if (action === 'unlimited') {
            if (confirm(`Définir les crédits ${types[type] ?? type} comme illimités ?`))
                post('admin.credits.unlimited', { type });
        } else if (action === 'remove-unlimited') {
            if (confirm(`Désactiver le mode illimité pour ${types[type] ?? type} ?`))
                post('admin.credits.remove-unlimited', { type });
        } else if (action === 'block') {
            setModal({ action: 'block', type });
        } else if (action === 'unblock') {
            if (confirm(`Débloquer les crédits ${types[type] ?? type} ?`))
                post('admin.credits.unblock', { type });
        }
    };

    const confirmAmount = (amount, notes) => {
        if (!modal) return;
        const routeMap = { add: 'admin.credits.add', remove: 'admin.credits.remove' };
        post(routeMap[modal.action], { type: modal.type, amount: Number(amount), notes });
    };

    const confirmBlock = (reason) => {
        post('admin.credits.block', { type: modal.type, reason });
    };

    return (
        <AdminLayout title={`Crédits — ${school?.name ?? '—'}`}>
            <Head title={`Crédits – ${school?.name}`} />

            {/* Breadcrumb */}
            <div className="mb-5 flex items-center gap-2 text-sm text-gray-500">
                <Link href={route('admin.credits.index')} className="flex items-center gap-1 text-orange-600 hover:underline">
                    <ArrowLeft className="w-4 h-4" /> Crédits
                </Link>
                <ChevronRight className="w-4 h-4" />
                <span className="text-gray-800 font-medium">{school?.name}</span>
            </div>

            {flash?.success && (
                <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700">{flash.success}</div>
            )}
            {flash?.error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{flash.error}</div>
            )}

            {/* School header */}
            <div className={`bg-white rounded-2xl border shadow-sm p-5 mb-6 ${summary.exhausted ? 'border-red-200' : 'border-gray-100'}`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <div>
                        <h2 className="font-bold text-gray-900 text-lg">{school?.name}</h2>
                        <p className="text-sm text-gray-500">{school?.city} · Plan : <strong>{summary.plan_name ?? 'Gratuit'}</strong>
                            {summary.expires_at && <span className="ml-1">· exp. {summary.expires_at}</span>}
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {summary.exhausted && (
                            <button onClick={() => { if (confirm('Forcer la réactivation ?')) post('admin.credits.reactivate'); }}
                                className="px-3 py-2 rounded-xl text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700">
                                Réactiver
                            </button>
                        )}
                        <button onClick={() => { if (confirm('Réinitialiser TOUS les crédits selon le plan actif ?')) post('admin.credits.reset'); }}
                            className="px-3 py-2 rounded-xl text-sm font-medium bg-blue-600 text-white hover:bg-blue-700">
                            Reset tout
                        </button>
                        {summary.is_active ? (
                            <button onClick={() => setModal({ action: 'suspend' })}
                                className="px-3 py-2 rounded-xl text-sm font-medium bg-red-100 text-red-700 hover:bg-red-200">
                                Suspendre
                            </button>
                        ) : (
                            <button onClick={() => { if (confirm('Désuspendre cette école ?')) post('admin.credits.unsuspend'); }}
                                className="px-3 py-2 rounded-xl text-sm font-medium bg-emerald-100 text-emerald-700 hover:bg-emerald-200">
                                Désuspendre
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex flex-wrap gap-3 text-sm">
                    <span className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs ${summary.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                        {summary.is_active ? <CheckCircle className="w-3.5 h-3.5" /> : <Ban className="w-3.5 h-3.5" />}
                        {summary.is_active ? 'Active' : 'Suspendue'}
                    </span>
                    {summary.exhausted && (
                        <span className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs bg-red-50 text-red-700">
                            <AlertTriangle className="w-3.5 h-3.5" /> Crédits épuisés
                        </span>
                    )}
                    {summary.reset_at && (
                        <span className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs bg-gray-50 text-gray-600">
                            <Clock className="w-3.5 h-3.5" /> Dernier reset : {summary.reset_at}
                        </span>
                    )}
                </div>
            </div>

            {/* Credit type cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {Object.entries(summary.types ?? {}).map(([type, data]) => (
                    <CreditCard key={type} type={type} label={types[type] ?? type} data={data} onAction={handleAction} />
                ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                <BalanceChart summary={summary} types={types} />
                <ConsumptionChart chartData={chart_data} types={types} />
            </div>

            {/* Transaction history */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="font-semibold text-gray-800">Historique des transactions</h3>
                    <span className="text-xs text-gray-400">{transactions.total ?? 0} entrées</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="text-left py-2.5 px-4 text-xs text-gray-500 font-semibold">Date</th>
                                <th className="text-left py-2.5 px-4 text-xs text-gray-500 font-semibold">Type</th>
                                <th className="text-left py-2.5 px-4 text-xs text-gray-500 font-semibold">Action</th>
                                <th className="text-right py-2.5 px-4 text-xs text-gray-500 font-semibold">Montant</th>
                                <th className="text-right py-2.5 px-4 text-xs text-gray-500 font-semibold hidden md:table-cell">Avant → Après</th>
                                <th className="text-left py-2.5 px-4 text-xs text-gray-500 font-semibold hidden lg:table-cell">Raison / Notes</th>
                                <th className="text-left py-2.5 px-4 text-xs text-gray-500 font-semibold hidden lg:table-cell">Opérateur</th>
                                <th className="text-right py-2.5 px-4 text-xs text-gray-500 font-semibold">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {(transactions.data ?? []).length === 0 && (
                                <tr><td colSpan={8} className="text-center py-8 text-gray-400 text-sm">Aucune transaction</td></tr>
                            )}
                            {(transactions.data ?? []).map((tx) => {
                                const Icon = TYPE_ICONS[tx.credit_type] ?? Zap;
                                return (
                                    <tr key={tx.id} className="hover:bg-gray-50/40">
                                        <td className="py-2.5 px-4 text-xs text-gray-500 whitespace-nowrap">
                                            {tx.created_at ? new Date(tx.created_at).toLocaleString('fr-MA', { dateStyle: 'short', timeStyle: 'short' }) : '—'}
                                        </td>
                                        <td className="py-2.5 px-4">
                                            <span className="flex items-center gap-1.5 text-xs text-gray-700">
                                                <Icon className="w-3.5 h-3.5" style={{ color: TYPE_COLORS[tx.credit_type] }} />
                                                {types[tx.credit_type] ?? tx.credit_type}
                                            </span>
                                        </td>
                                        <td className="py-2.5 px-4"><ActionLabel action={tx.action} /></td>
                                        <td className="py-2.5 px-4 text-right tabular-nums text-xs font-medium">
                                            <span className={tx.amount > 0 ? 'text-emerald-600' : tx.amount < 0 ? 'text-red-600' : 'text-gray-500'}>
                                                {tx.amount > 0 ? '+' : ''}{tx.amount}
                                            </span>
                                        </td>
                                        <td className="py-2.5 px-4 text-right text-xs text-gray-400 hidden md:table-cell tabular-nums">
                                            {tx.balance_before ?? '∞'} → {tx.balance_after ?? '∞'}
                                        </td>
                                        <td className="py-2.5 px-4 text-xs text-gray-500 hidden lg:table-cell max-w-[200px] truncate">
                                            {tx.notes ?? tx.reason ?? '—'}
                                        </td>
                                        <td className="py-2.5 px-4 text-xs text-gray-500 hidden lg:table-cell">
                                            {tx.performer?.name ?? <span className="text-gray-300">Système</span>}
                                        </td>
                                        <td className="py-2.5 px-4 text-right">
                                            {tx.is_rollbackable ? (
                                                <button
                                                    onClick={() => {
                                                        if (confirm(`Annuler la transaction #${tx.id} (${tx.action}) ? Le solde sera restauré à sa valeur précédente.`)) {
                                                            router.post(route('admin.credits.transactions.rollback', [school.id, tx.id]), {}, { preserveScroll: true });
                                                        }
                                                    }}
                                                    title="Annuler cette transaction"
                                                    className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg text-gray-500 hover:text-orange-600 hover:bg-orange-50 transition-colors">
                                                    <Undo2 className="w-3.5 h-3.5" /> Annuler
                                                </button>
                                            ) : tx.rolled_back_at ? (
                                                <span className="text-[11px] text-gray-300">Annulée</span>
                                            ) : (
                                                <span className="text-[11px] text-gray-200">—</span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {transactions.links && transactions.links.length > 3 && (
                    <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
                        <p className="text-xs text-gray-500">{transactions.from}–{transactions.to} sur {transactions.total}</p>
                        <div className="flex gap-1">
                            {transactions.links.map((link, i) => (
                                <button key={i} onClick={() => link.url && router.get(link.url, {}, { preserveScroll: true })}
                                    disabled={!link.url}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                    className={`px-2.5 py-1 rounded-lg text-xs font-medium ${link.active ? 'bg-orange-600 text-white' : 'text-gray-600 hover:bg-gray-100 disabled:opacity-40'}`}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Modals */}
            {modal?.action === 'add' && (
                <AmountModal
                    title={`Ajouter des crédits ${types[modal.type] ?? modal.type}`}
                    onConfirm={confirmAmount}
                    onClose={() => setModal(null)}
                />
            )}
            {modal?.action === 'remove' && (
                <AmountModal
                    title={`Retirer des crédits ${types[modal.type] ?? modal.type}`}
                    onConfirm={confirmAmount}
                    onClose={() => setModal(null)}
                />
            )}
            {modal?.action === 'block' && (
                <ReasonModal
                    title={`Bloquer les crédits ${types[modal.type] ?? modal.type}`}
                    onConfirm={confirmBlock}
                    onClose={() => setModal(null)}
                />
            )}
            {modal?.action === 'suspend' && (
                <ReasonModal
                    title="Suspendre l'école"
                    onConfirm={(reason) => post('admin.credits.suspend', { reason })}
                    onClose={() => setModal(null)}
                />
            )}
        </AdminLayout>
    );
}
