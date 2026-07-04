import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    ComposedChart, AreaChart, Area, LineChart, Line, BarChart, Bar,
    PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import {
    DollarSign, TrendingUp, TrendingDown, BarChart3, CreditCard,
    Activity, Percent, RotateCcw, CheckCircle, Users, Building2,
    AlertTriangle, Download, ChevronDown, FileText, Table2, Printer,
    RefreshCw, MapPin, Tag,
} from 'lucide-react';

// ─── Palette ────────────────────────────────────────────────────────────────

const BRAND   = '#f97316';
const COLORS  = ['#f97316','#10b981','#3b82f6','#8b5cf6','#ec4899','#14b8a6','#f59e0b','#6366f1'];
const PERIODS = { '3M': 3, '6M': 6, '12M': 12 };

// ─── Formatters ─────────────────────────────────────────────────────────────

const fmt    = (n, d = 0) => Number(n ?? 0).toLocaleString('fr-FR', { minimumFractionDigits: d, maximumFractionDigits: d });
const fmtMAD = (n)        => `${fmt(n)} MAD`;
const fmtPct = (n, d = 1) => `${fmt(n, d)} %`;
const fmtK   = (v)        => v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M` : v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(Math.round(v));

// ─── Micro components ────────────────────────────────────────────────────────

function GrowthPill({ pct, inverse = false }) {
    if (pct === null || pct === undefined) return null;
    const good = inverse ? pct <= 0 : pct >= 0;
    const Icon = good ? TrendingUp : TrendingDown;
    return (
        <span className={`inline-flex items-center gap-0.5 text-[11px] font-bold px-1.5 py-0.5 rounded-full
            ${good ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>
            <Icon className="w-2.5 h-2.5" />
            {Math.abs(pct)}%
        </span>
    );
}

function LiveDot({ active }) {
    if (!active) return null;
    return (
        <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
        </span>
    );
}

const ACCENT = {
    orange: { ring: 'border-orange-100',  bg: 'bg-orange-50',  icon: 'text-orange-500',  bar: 'bg-orange-500'  },
    blue:   { ring: 'border-blue-100',    bg: 'bg-blue-50',    icon: 'text-blue-500',    bar: 'bg-blue-500'    },
    green:  { ring: 'border-emerald-100', bg: 'bg-emerald-50', icon: 'text-emerald-600', bar: 'bg-emerald-500' },
    purple: { ring: 'border-purple-100',  bg: 'bg-purple-50',  icon: 'text-purple-500',  bar: 'bg-purple-500'  },
    red:    { ring: 'border-red-100',     bg: 'bg-red-50',     icon: 'text-red-500',     bar: 'bg-red-500'     },
    amber:  { ring: 'border-amber-100',   bg: 'bg-amber-50',   icon: 'text-amber-500',   bar: 'bg-amber-500'   },
};

function KpiCard({ icon: Icon, label, value, sub, growth, inverseGrowth, accent = 'orange', isLive, href }) {
    const a = ACCENT[accent];
    const inner = (
        <div className={`relative bg-white dark:bg-zinc-900 rounded-2xl border ${a.ring} shadow-sm hover:shadow-md transition-shadow p-5 h-full overflow-hidden`}>
            {/* bottom color bar */}
            <div className={`absolute bottom-0 inset-x-0 h-0.5 ${a.bar}`} />

            <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl ${a.bg} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${a.icon}`} />
                </div>
                <div className="flex items-center gap-1.5">
                    {isLive && <LiveDot active />}
                    <GrowthPill pct={growth} inverse={inverseGrowth} />
                </div>
            </div>

            <p className="text-2xl font-extrabold text-gray-900 dark:text-zinc-50 tracking-tight leading-none">{value}</p>
            <p className="text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wide mt-1">{label}</p>
            {sub && <p className="text-[11px] text-gray-400 dark:text-zinc-500 mt-0.5 truncate">{sub}</p>}
        </div>
    );
    return href ? <Link href={href} className="block h-full">{inner}</Link> : inner;
}

// ─── Heatmap (GitHub-style 52-week calendar) ─────────────────────────────────

const HEAT_COLORS = ['bg-gray-100', 'bg-orange-100', 'bg-orange-200', 'bg-orange-400', 'bg-orange-600'];

function Heatmap({ data = [] }) {
    if (!data.length) {
        return <p className="text-gray-300 dark:text-zinc-600 text-sm text-center py-6">Aucune donnée d'activité disponible</p>;
    }

    const maxCount = Math.max(...data.map(d => d.count), 1);
    const intensity = (c) => c === 0 ? 0 : Math.min(4, Math.ceil((c / maxCount) * 4));

    // 2D map: weeks[week][dow] = cell
    const weeks = {};
    const monthLabelMap = {};
    data.forEach(d => {
        weeks[d.week] ??= {};
        weeks[d.week][d.dow] = d;
        // Show month label on the first day of each month
        if (d.date.endsWith('-01')) {
            monthLabelMap[d.week] = new Date(d.date).toLocaleDateString('fr-FR', { month: 'short' });
        }
    });
    const weekNums = Object.keys(weeks).map(Number).sort((a, b) => a - b);

    return (
        <div className="overflow-x-auto pb-1">
            <div className="inline-flex flex-col gap-1 min-w-max select-none">
                {/* Month labels */}
                <div className="flex ml-6">
                    {weekNums.map(w => (
                        <div key={w} className="w-3.5 mr-0.5 text-[9px] text-gray-400 dark:text-zinc-500 font-medium leading-none">
                            {monthLabelMap[w] ?? ''}
                        </div>
                    ))}
                </div>

                {/* Grid */}
                <div className="flex gap-1">
                    {/* Day-of-week labels */}
                    <div className="flex flex-col gap-0.5 mr-1">
                        {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map((d, i) => (
                            <div key={i} className="h-3 w-4 text-[9px] text-gray-400 dark:text-zinc-500 leading-3">
                                {i % 2 !== 0 ? d : ''}
                            </div>
                        ))}
                    </div>
                    {weekNums.map(week => (
                        <div key={week} className="flex flex-col gap-0.5">
                            {[0, 1, 2, 3, 4, 5, 6].map(dow => {
                                const cell = weeks[week]?.[dow];
                                return (
                                    <div key={dow}
                                        title={cell ? `${cell.date} — ${fmt(cell.count)} activités` : undefined}
                                        className={`h-3 w-3 rounded-sm cursor-default transition-colors
                                            ${cell !== undefined ? HEAT_COLORS[intensity(cell.count)] : 'bg-transparent'}`}
                                    />
                                );
                            })}
                        </div>
                    ))}
                </div>

                {/* Legend */}
                <div className="flex items-center gap-1 mt-0.5 ml-6">
                    <span className="text-[9px] text-gray-400 dark:text-zinc-500 mr-1">Moins</span>
                    {HEAT_COLORS.map((c, i) => <div key={i} className={`h-3 w-3 rounded-sm ${c}`} />)}
                    <span className="text-[9px] text-gray-400 dark:text-zinc-500 ml-1">Plus</span>
                </div>
            </div>
        </div>
    );
}

// ─── Top list item with rank bar ─────────────────────────────────────────────

function RankRow({ rank, name, sub, value, maxValue, barColor = 'bg-orange-500' }) {
    const pct = maxValue > 0 ? Math.min(100, (Number(value?.toString().replace(/[^\d.]/g, '')) / maxValue) * 100) : 0;
    return (
        <div className="flex items-center gap-2.5 py-2 first:pt-0 last:pb-0">
            <span className="text-xs font-bold text-gray-300 dark:text-zinc-600 w-4 text-center flex-shrink-0">{rank}</span>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-zinc-50 truncate leading-tight">{name}</p>
                {sub && <p className="text-[11px] text-gray-400 dark:text-zinc-500">{sub}</p>}
                <div className="h-1 bg-gray-100 rounded-full mt-1 overflow-hidden">
                    <div className={`h-1 rounded-full ${barColor}`} style={{ width: `${pct}%` }} />
                </div>
            </div>
            <span className="text-xs font-bold text-gray-700 dark:text-zinc-300 whitespace-nowrap flex-shrink-0">{value}</span>
        </div>
    );
}

// ─── Export dropdown ─────────────────────────────────────────────────────────

function ExportMenu() {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', close);
        return () => document.removeEventListener('mousedown', close);
    }, []);

    const items = [
        { label: 'CSV',        Icon: Table2,   action: () => { window.location.href = route('admin.dashboard.export') + '?format=csv';   } },
        { label: 'Excel',      Icon: FileText,  action: () => { window.location.href = route('admin.dashboard.export') + '?format=excel'; } },
        { label: 'Imprimer',   Icon: Printer,   action: () => window.print() },
    ];

    return (
        <div className="relative print:hidden" ref={ref}>
            <button onClick={() => setOpen(!open)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-gray-200 dark:border-zinc-700 rounded-xl text-sm font-medium text-gray-700 dark:text-zinc-300 hover:bg-gray-50 shadow-sm transition-colors">
                <Download className="w-4 h-4" />
                Exporter
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>
            {open && (
                <div className="absolute right-0 top-full mt-1.5 w-44 bg-white border border-gray-100 dark:border-zinc-800 rounded-xl shadow-xl z-50 py-1 overflow-hidden">
                    {items.map(({ label, Icon, action }) => (
                        <button key={label} onClick={() => { setOpen(false); action(); }}
                            className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-gray-700 dark:text-zinc-300 hover:bg-gray-50 transition-colors">
                            <Icon className="w-4 h-4 text-gray-400 dark:text-zinc-500" />
                            {label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

function ChartTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white border border-gray-100 dark:border-zinc-800 rounded-xl shadow-xl p-3 text-xs">
            <p className="font-semibold text-gray-700 dark:text-zinc-300 mb-1.5">{label}</p>
            {payload.map((p, i) => (
                <div key={i} className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full inline-block" style={{ background: p.color }} />
                    <span className="text-gray-500 dark:text-zinc-400">{p.name}:</span>
                    <span className="font-bold text-gray-800 dark:text-zinc-200">
                        {p.name === 'Revenus' ? `${fmt(p.value)} MAD` : fmt(p.value)}
                    </span>
                </div>
            ))}
        </div>
    );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function Dashboard({
    stats = {},
    monthlyUsers = [], monthlyRevenue = [], monthlySchools = [],
    subscriptionBreakdown = [], cityBreakdown = [],
    topSchools = [], topCategories = [], heatmap = [],
    recentSchools = [], recentPayments = [],
    pendingActions = {},
}) {
    const [period, setPeriod]       = useState('12M');
    const [live, setLive]           = useState(null);
    const [lastPoll, setLastPoll]   = useState(null);
    const [polling, setPolling]     = useState(false);

    // Real-time polling every 60 s
    const poll = useCallback(async () => {
        setPolling(true);
        try {
            const r = await fetch(route('admin.dashboard.live'), {
                credentials: 'same-origin',
                headers: { Accept: 'application/json' },
            });
            if (r.ok) { setLive(await r.json()); setLastPoll(new Date()); }
        } catch (_) {}
        setPolling(false);
    }, []);

    useEffect(() => {
        poll();
        const t = setInterval(poll, 60_000);
        return () => clearInterval(t);
    }, [poll]);

    // Merge live overrides into stats
    const s = {
        ...stats,
        active_subscriptions: live?.active_subscriptions ?? stats.active_subscriptions,
        pending_schools:      live?.pending_schools      ?? stats.pending_schools,
        pending_reviews:      live?.pending_reviews      ?? stats.pending_reviews,
        unread_contacts:      live?.unread_contacts      ?? stats.unread_contacts,
        rev_today:            live?.rev_today            ?? stats.rev_today,
    };

    const totalPending = (s.pending_schools ?? 0) + (s.pending_reviews ?? 0) + (s.unread_contacts ?? 0);

    // Chart data filtered by period
    const monthsBack = PERIODS[period] ?? 12;
    const cutoff     = new Date(); cutoff.setMonth(cutoff.getMonth() - monthsBack);
    const cutoffStr  = cutoff.toISOString().substring(0, 7);

    // Doesn't depend on `live`/`lastPoll`, so memoize to skip recomputing this
    // filter+map+find pass every 60s when the polling tick updates unrelated state.
    const chartData = useMemo(() => (monthlyUsers ?? [])
        .filter(u => u.month >= cutoffStr)
        .map(u => {
            const rev = (monthlyRevenue ?? []).find(r => r.month === u.month);
            const sch = (monthlySchools  ?? []).find(x => x.month === u.month);
            return {
                label:        new Date(u.month + '-01').toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' }),
                Revenus:      Number(rev?.revenue ?? 0),
                Utilisateurs: Number(u.count),
                Écoles:       Number(sch?.count ?? 0),
            };
        }), [monthlyUsers, monthlyRevenue, monthlySchools, cutoffStr]);

    const maxSchoolRev = topSchools[0]?.total_revenue ?? 1;
    const maxCity      = cityBreakdown[0]?.count        ?? 1;
    const maxCat       = topCategories[0]?.school_count ?? 1;

    const secAgo = lastPoll ? Math.round((Date.now() - lastPoll.getTime()) / 1000) : null;

    return (
        <AdminLayout title="Dashboard Premium">
            <Head title="Dashboard" />

            {/* ── Print header (visible only when printing) ─────── */}
            <div className="hidden print:block mb-6 border-b border-gray-200 dark:border-zinc-700 pb-4">
                <h1 className="text-2xl font-extrabold text-gray-900 dark:text-zinc-50">Rapport Dashboard — {new Date().toLocaleDateString('fr-FR', { dateStyle: 'long' })}</h1>
                <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">AutoEcoles SaaS — Exporté le {new Date().toLocaleString('fr-FR')}</p>
            </div>

            {/* ── Header ─────────────────────────────────────────── */}
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3 print:hidden">
                <div>
                    <h1 className="text-2xl font-extrabold text-gray-900 dark:text-zinc-50 leading-tight">Dashboard</h1>
                    <div className="flex items-center gap-2 mt-0.5">
                        <LiveDot active={!!live} />
                        <span className="text-xs text-gray-400 dark:text-zinc-500">
                            {polling
                                ? 'Actualisation…'
                                : secAgo !== null
                                    ? `Mis à jour ${secAgo < 5 ? 'à l\'instant' : `il y a ${secAgo}s`}`
                                    : 'Connexion…'}
                        </span>
                        <button onClick={poll}
                            className={`text-gray-300 dark:text-zinc-600 hover:text-orange-500 dark:hover:text-orange-400 transition-colors ${polling ? 'animate-spin' : ''}`}
                            title="Actualiser">
                            <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {/* Period selector */}
                    <div className="flex bg-gray-100 dark:bg-zinc-800 rounded-xl p-0.5">
                        {Object.keys(PERIODS).map(p => (
                            <button key={p} onClick={() => setPeriod(p)}
                                className={`px-3 py-1.5 rounded-[10px] text-xs font-semibold transition-all
                                    ${period === p ? 'bg-white dark:bg-zinc-700 text-orange-600 dark:text-orange-400 shadow-sm' : 'text-gray-500 dark:text-zinc-400 hover:text-gray-700 dark:hover:text-zinc-200'}`}>
                                {p}
                            </button>
                        ))}
                    </div>
                    <ExportMenu />
                </div>
            </div>

            {/* ── Pending actions ─────────────────────────────────── */}
            {totalPending > 0 && (
                <div className="mb-5 p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex flex-wrap gap-2 items-center print:hidden">
                    <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                    <span className="text-sm font-semibold text-amber-800">Actions requises</span>
                    {s.pending_schools > 0 && (
                        <Link href={`${route('admin.auto-schools.index')}?status=pending`}
                            className="text-xs text-amber-700 bg-white border border-amber-200 px-3 py-1 rounded-full hover:bg-amber-50 font-medium transition-colors">
                            {s.pending_schools} école{s.pending_schools > 1 ? 's' : ''} en attente
                        </Link>
                    )}
                    {s.pending_reviews > 0 && (
                        <Link href={`${route('admin.reviews.index')}?status=pending`}
                            className="text-xs text-amber-700 bg-white border border-amber-200 px-3 py-1 rounded-full hover:bg-amber-50 font-medium transition-colors">
                            {s.pending_reviews} avis à modérer
                        </Link>
                    )}
                    {s.unread_contacts > 0 && (
                        <Link href={route('admin.contact-requests.index')}
                            className="text-xs text-amber-700 bg-white border border-amber-200 px-3 py-1 rounded-full hover:bg-amber-50 font-medium transition-colors">
                            {s.unread_contacts} message{s.unread_contacts > 1 ? 's' : ''} non lu{s.unread_contacts > 1 ? 's' : ''}
                        </Link>
                    )}
                </div>
            )}

            {/* ── KPI Row 1 — Revenue ─────────────────────────────── */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 mb-3">
                <KpiCard icon={DollarSign}  label="Revenu Total"      value={fmtMAD(s.total_revenue)}
                    accent="orange" growth={s.revenue_growth}
                    sub={`Mois préc. : ${fmtMAD(s.rev_prev_month)}`} />
                <KpiCard icon={TrendingUp}  label="MRR"               value={fmtMAD(s.mrr)}
                    accent="green"  sub="Revenu mensuel récurrent" />
                <KpiCard icon={BarChart3}   label="ARR"               value={fmtMAD(s.arr)}
                    accent="blue"   sub="Revenu annuel projeté" />
                <KpiCard icon={CreditCard}  label="Revenu Ce Mois"    value={fmtMAD(s.rev_month)}
                    accent="purple" isLive sub={`Aujourd'hui : ${fmtMAD(s.rev_today)}`} />
            </div>

            {/* ── KPI Row 2 — SaaS metrics ───────────────────────── */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 mb-6">
                <KpiCard icon={Activity}     label="Abonnements"        value={fmt(s.active_subscriptions)}
                    accent="green" isLive
                    sub={`Conversion ${fmtPct(s.conversion_rate)}`}
                    href={route('admin.subscriptions.index')} />
                <KpiCard icon={Percent}      label="Taux de Conversion" value={fmtPct(s.conversion_rate)}
                    accent="blue"  sub="Écoles avec abonnement actif" />
                <KpiCard icon={RotateCcw}    label="Taux de Churn"      value={fmtPct(s.churn_rate)}
                    accent="red"   inverseGrowth
                    sub={`${s.churn_count ?? 0} résiliation${s.churn_count > 1 ? 's' : ''} ce mois`} />
                <KpiCard icon={CheckCircle}  label="Renouvellement"     value={fmtPct(s.renewal_rate)}
                    accent="green" sub={`${s.renewals_count ?? 0} écoles renouvelées`} />
            </div>

            {/* ── Main chart + Donut ──────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
                {/* Area/Line chart */}
                <div className="lg:col-span-2 bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm p-5">
                    <div className="mb-4">
                        <h3 className="font-bold text-gray-900 dark:text-zinc-50">Évolution de la plateforme</h3>
                        <p className="text-xs text-gray-400 dark:text-zinc-500">Revenus, utilisateurs et auto-écoles ({period})</p>
                    </div>
                    {chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={280}>
                            <ComposedChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="gRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%"  stopColor={BRAND}    stopOpacity={0.18} />
                                        <stop offset="95%" stopColor={BRAND}    stopOpacity={0}    />
                                    </linearGradient>
                                    <linearGradient id="gUsr" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.12} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}    />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                                <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                                <YAxis yAxisId="rev" orientation="right"
                                    tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false}
                                    tickFormatter={fmtK} />
                                <YAxis yAxisId="cnt" orientation="left"
                                    tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                                <Tooltip content={<ChartTooltip />} />
                                <Legend iconType="circle" iconSize={7}
                                    formatter={v => <span className="text-xs text-gray-600 dark:text-zinc-400">{v}</span>} />
                                <Area yAxisId="rev" type="monotone" dataKey="Revenus"
                                    stroke={BRAND} fill="url(#gRev)" strokeWidth={2.5} dot={false} />
                                <Area yAxisId="cnt" type="monotone" dataKey="Utilisateurs"
                                    stroke="#3b82f6" fill="url(#gUsr)" strokeWidth={2} dot={false} />
                                <Line yAxisId="cnt" type="monotone" dataKey="Écoles"
                                    stroke="#10b981" strokeWidth={2} dot={false} strokeDasharray="5 3" />
                            </ComposedChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-64 flex items-center justify-center text-gray-200 text-sm">
                            Aucune donnée sur la période sélectionnée
                        </div>
                    )}
                </div>

                {/* Subscription donut */}
                <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm p-5 flex flex-col">
                    <div className="mb-3">
                        <h3 className="font-bold text-gray-900 dark:text-zinc-50">Plans actifs</h3>
                        <p className="text-xs text-gray-400 dark:text-zinc-500">Répartition des abonnements</p>
                    </div>
                    {subscriptionBreakdown.length > 0 ? (
                        <>
                            <ResponsiveContainer width="100%" height={170}>
                                <PieChart>
                                    <Pie data={subscriptionBreakdown} cx="50%" cy="50%"
                                        innerRadius={48} outerRadius={72}
                                        dataKey="count" paddingAngle={3}>
                                        {subscriptionBreakdown.map((_, i) => (
                                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ borderRadius: '10px', fontSize: 11 }} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="space-y-1.5 mt-auto">
                                {subscriptionBreakdown.map((item, i) => (
                                    <div key={i} className="flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
                                                style={{ background: COLORS[i % COLORS.length] }} />
                                            <span className="text-gray-600 dark:text-zinc-400 truncate max-w-[100px]">{item.name}</span>
                                        </div>
                                        <span className="font-bold text-gray-900 dark:text-zinc-50">{item.count}</span>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-gray-200 text-sm">
                            Aucun abonnement actif
                        </div>
                    )}
                </div>
            </div>

            {/* ── KPI Row 3 — Users + Period revenue ──────────────── */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 mb-6">
                <KpiCard icon={Users}      label="Utilisateurs"     value={fmt(s.total_users)}
                    accent="blue"   growth={s.users_growth}
                    sub={`+${s.users_this_month ?? 0} ce mois`}
                    href={route('admin.users.index')} />
                <KpiCard icon={Building2}  label="Auto-Écoles"      value={fmt(s.total_schools)}
                    accent="green"  growth={s.schools_growth}
                    sub={`+${s.schools_this_month ?? 0} ce mois`}
                    href={route('admin.auto-schools.index')} />
                <KpiCard icon={DollarSign} label="Cette Semaine"    value={fmtMAD(s.rev_week)}
                    accent="amber"  sub="Revenus 7 derniers jours" />
                <KpiCard icon={DollarSign} label="Cette Année"      value={fmtMAD(s.rev_year)}
                    accent="orange" sub={`Depuis le 1er janvier`} />
            </div>

            {/* ── Top tables ──────────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
                {/* Top Schools */}
                <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm p-5">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="font-bold text-gray-900 dark:text-zinc-50 flex items-center gap-1.5">
                                <DollarSign className="w-4 h-4 text-orange-500" />Top Écoles
                            </h3>
                            <p className="text-[11px] text-gray-400 dark:text-zinc-500">Par revenu total généré</p>
                        </div>
                        <Link href={route('admin.payments.index')} className="text-xs text-orange-600 hover:underline">Tout →</Link>
                    </div>
                    {topSchools.length > 0 ? (
                        <div className="divide-y divide-gray-50">
                            {topSchools.slice(0, 8).map((sch, i) => (
                                <RankRow key={sch.id} rank={i + 1} name={sch.name} sub={sch.city}
                                    value={`${fmt(sch.total_revenue)} MAD`}
                                    maxValue={Number(maxSchoolRev)} barColor="bg-orange-500" />
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-200 text-sm text-center py-8">Aucune donnée</p>
                    )}
                </div>

                {/* Top Cities */}
                <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm p-5">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="font-bold text-gray-900 dark:text-zinc-50 flex items-center gap-1.5">
                                <MapPin className="w-4 h-4 text-blue-500" />Top Villes
                            </h3>
                            <p className="text-[11px] text-gray-400 dark:text-zinc-500">Auto-écoles actives par ville</p>
                        </div>
                    </div>
                    {cityBreakdown.length > 0 ? (
                        <div className="divide-y divide-gray-50">
                            {cityBreakdown.slice(0, 8).map((city, i) => (
                                <RankRow key={i} rank={i + 1} name={city.city}
                                    value={`${city.count} école${city.count > 1 ? 's' : ''}`}
                                    maxValue={maxCity} barColor="bg-blue-500" />
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-200 text-sm text-center py-8">Aucune donnée</p>
                    )}
                </div>

                {/* Top Categories */}
                <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm p-5">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="font-bold text-gray-900 dark:text-zinc-50 flex items-center gap-1.5">
                                <Tag className="w-4 h-4 text-emerald-500" />Top Catégories
                            </h3>
                            <p className="text-[11px] text-gray-400 dark:text-zinc-500">Formations les plus proposées</p>
                        </div>
                    </div>
                    {topCategories.length > 0 ? (
                        <div className="divide-y divide-gray-50">
                            {topCategories.slice(0, 8).map((cat, i) => (
                                <RankRow key={cat.id} rank={i + 1} name={cat.name_fr ?? cat.code}
                                    value={`${cat.school_count} école${cat.school_count > 1 ? 's' : ''}`}
                                    maxValue={maxCat} barColor="bg-emerald-500" />
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-200 text-sm text-center py-8">Aucune donnée</p>
                    )}
                </div>
            </div>

            {/* ── Activity Heatmap ─────────────────────────────────── */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm p-5 mb-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="font-bold text-gray-900 dark:text-zinc-50">Calendrier d'activité</h3>
                        <p className="text-xs text-gray-400 dark:text-zinc-500">Vues + clics cumulés — 52 dernières semaines</p>
                    </div>
                </div>
                <Heatmap data={heatmap} />
            </div>

            {/* ── Recent feed ──────────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                {/* Recent payments */}
                <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
                        <h3 className="font-bold text-gray-900 dark:text-zinc-50">Derniers paiements</h3>
                        <Link href={route('admin.payments.index')} className="text-xs text-orange-600 hover:underline">Voir tout →</Link>
                    </div>
                    <div className="divide-y divide-gray-50">
                        {recentPayments.length === 0 ? (
                            <p className="text-center text-gray-300 dark:text-zinc-600 py-10 text-sm">Aucun paiement récent</p>
                        ) : recentPayments.map(p => (
                            <div key={p.id} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50/60 transition-colors">
                                <div className="w-9 h-9 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <CreditCard className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-gray-900 dark:text-zinc-50 truncate">{p.auto_school?.name ?? '—'}</p>
                                    <p className="text-[11px] text-gray-400 dark:text-zinc-500">
                                        {p.plan?.name ?? '—'} · {new Date(p.created_at).toLocaleDateString('fr-FR')}
                                    </p>
                                </div>
                                <span className="text-sm font-extrabold text-emerald-700 whitespace-nowrap">
                                    {fmt(p.amount)} MAD
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent schools */}
                <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
                        <h3 className="font-bold text-gray-900 dark:text-zinc-50">Dernières auto-écoles</h3>
                        <Link href={route('admin.auto-schools.index')} className="text-xs text-orange-600 hover:underline">Voir tout →</Link>
                    </div>
                    <div className="divide-y divide-gray-50">
                        {recentSchools.length === 0 ? (
                            <p className="text-center text-gray-300 dark:text-zinc-600 py-10 text-sm">Aucune école récente</p>
                        ) : recentSchools.map(sch => (
                            <div key={sch.id} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50/60 transition-colors">
                                <div className="w-9 h-9 bg-orange-50 text-orange-500 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <Building2 className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-gray-900 dark:text-zinc-50 truncate">{sch.name}</p>
                                    <p className="text-[11px] text-gray-400 dark:text-zinc-500">{sch.city} · {sch.user?.name ?? '—'}</p>
                                </div>
                                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold flex-shrink-0 ${
                                    sch.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                                    sch.status === 'rejected' ? 'bg-red-100 text-red-600' :
                                    'bg-amber-100 text-amber-700'}`}>
                                    {sch.status === 'approved' ? 'Approuvée' : sch.status === 'rejected' ? 'Refusée' : 'Attente'}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
