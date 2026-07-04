import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link } from '@inertiajs/react';
import {
    Users, TrendingUp, CheckCircle, XCircle, Bell, Calendar,
    Plus, ArrowRight, Clock, AlertTriangle,
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend,
} from 'recharts';

const SOURCE_LABELS = {
    website: 'Site web', referral: 'Référence', social: 'Réseaux sociaux',
    direct: 'Direct', event: 'Événement', other: 'Autre',
};

const COLORS = ['#6366f1', '#3b82f6', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444'];

function StatCard({ label, value, sub, icon: Icon, color = 'indigo' }) {
    const bg = {
        indigo: 'bg-indigo-50 text-indigo-600',
        green:  'bg-green-50 text-green-600',
        red:    'bg-red-50 text-red-600',
        amber:  'bg-amber-50 text-amber-600',
        blue:   'bg-blue-50 text-blue-600',
    };
    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-start gap-4">
            <div className={`p-3 rounded-xl ${bg[color] || bg.indigo}`}>
                <Icon className="w-5 h-5" />
            </div>
            <div>
                <p className="text-xs font-medium text-gray-500 mb-0.5">{label}</p>
                <p className="text-2xl font-extrabold text-gray-900">{value}</p>
                {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
            </div>
        </div>
    );
}

export default function CRMDashboard({ stats, by_stage, by_source, monthly, due_reminders = [], recent = [] }) {
    const pieData = Object.entries(by_source ?? {}).map(([key, val]) => ({
        name: SOURCE_LABELS[key] ?? key,
        value: val,
    }));

    const barData = Object.entries(monthly ?? {}).map(([month, total]) => ({
        month: month.slice(5),
        total,
    }));

    return (
        <AdminLayout>
            <Head title="CRM — Tableau de bord" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">CRM</h1>
                        <p className="text-sm text-gray-500 mt-0.5">Gestion des prospects et de la relation client</p>
                    </div>
                    <div className="flex gap-2">
                        <Link href={route('admin.crm.pipeline')}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50">
                            Pipeline
                        </Link>
                        <Link href={route('admin.crm.prospects.index')}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-xl text-sm font-semibold hover:bg-orange-700">
                            <Plus className="w-4 h-4" /> Nouveau prospect
                        </Link>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    <StatCard label="Total prospects" value={stats.total}           icon={Users}         color="indigo" />
                    <StatCard label="Actifs"          value={stats.active}          icon={TrendingUp}    color="blue"  />
                    <StatCard label="Gagnés"          value={stats.won}             icon={CheckCircle}   color="green"
                        sub={`${stats.conversion_rate}% de conversion`} />
                    <StatCard label="Perdus"          value={stats.lost}            icon={XCircle}       color="red"   />
                    <StatCard label="Ce mois-ci"      value={stats.added_this_month} icon={Plus}         color="indigo"/>
                    <StatCard label="Relances aujourd'hui" value={stats.reminders_due_today}
                        sub={stats.reminders_overdue > 0 ? `${stats.reminders_overdue} en retard` : null}
                        icon={Bell} color={stats.reminders_overdue > 0 ? 'red' : 'amber'} />
                </div>

                {/* Charts row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Monthly bar chart */}
                    <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                        <h2 className="text-sm font-semibold text-gray-700 mb-4">Nouveaux prospects (6 derniers mois)</h2>
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={barData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                                <Tooltip />
                                <Bar dataKey="total" fill="#6366f1" radius={[4, 4, 0, 0]} name="Prospects" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Source pie */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                        <h2 className="text-sm font-semibold text-gray-700 mb-4">Sources</h2>
                        <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80}
                                    dataKey="value" nameKey="name">
                                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                </Pie>
                                <Legend iconSize={10} />
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Pipeline funnel */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <h2 className="text-sm font-semibold text-gray-700 mb-4">Pipeline par étape</h2>
                    <div className="flex gap-2 overflow-x-auto pb-2">
                        {(by_stage ?? []).map(stage => (
                            <Link key={stage.id}
                                href={`${route('admin.crm.prospects.index')}?stage_id=${stage.id}`}
                                className="flex-shrink-0 flex flex-col items-center gap-1.5 px-4 py-3 rounded-xl border border-gray-100 hover:bg-gray-50 min-w-[90px]">
                                <div className="w-3 h-3 rounded-full" style={{ background: stage.color }} />
                                <span className="text-xl font-bold text-gray-900">{stage.count}</span>
                                <span className="text-xs text-gray-500 text-center leading-tight">{stage.name}</span>
                            </Link>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Due reminders */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-sm font-semibold text-gray-700">Relances à traiter</h2>
                            <span className="text-xs text-gray-400">Aujourd'hui &amp; retard</span>
                        </div>
                        {due_reminders.length === 0 ? (
                            <p className="text-sm text-gray-400 text-center py-6">Aucune relance en attente 🎉</p>
                        ) : (
                            <div className="space-y-2">
                                {due_reminders.map(r => (
                                    <Link key={r.id}
                                        href={route('admin.crm.prospects.show', r.prospect.id)}
                                        className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 group">
                                        <div className={`p-1.5 rounded-lg flex-shrink-0 ${r.is_overdue ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
                                            {r.is_overdue ? <AlertTriangle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">{r.title}</p>
                                            <p className="text-xs text-gray-500">{r.prospect.name} · {r.assigned_to.name}</p>
                                        </div>
                                        <span className={`text-xs font-medium flex-shrink-0 ${r.is_overdue ? 'text-red-600' : 'text-amber-600'}`}>
                                            {r.is_overdue ? 'Retard' : 'Aujourd\'hui'}
                                        </span>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Recent prospects */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-sm font-semibold text-gray-700">Derniers prospects</h2>
                            <Link href={route('admin.crm.prospects.index')}
                                className="text-xs text-orange-600 hover:text-orange-700 flex items-center gap-1">
                                Voir tout <ArrowRight className="w-3 h-3" />
                            </Link>
                        </div>
                        <div className="space-y-2">
                            {recent.map(p => (
                                <Link key={p.id}
                                    href={route('admin.crm.prospects.show', p.id)}
                                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 group">
                                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                                        <span className="text-xs font-bold text-indigo-600">{p.name.charAt(0).toUpperCase()}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">{p.name}</p>
                                        <p className="text-xs text-gray-500 truncate">{p.email ?? p.phone}</p>
                                    </div>
                                    {p.stage && (
                                        <span className="text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0"
                                            style={{ background: p.stage.color + '22', color: p.stage.color }}>
                                            {p.stage.name}
                                        </span>
                                    )}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
