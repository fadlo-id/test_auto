import AdminLayout from '@/Layouts/AdminLayout';
import { router } from '@inertiajs/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, CreditCard, Calendar, DollarSign } from 'lucide-react';

function fmt(amount) {
    return new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD', minimumFractionDigits: 0 }).format(amount / 100);
}

export default function Revenue({ monthly, byPlan, period, summary }) {
    const chartData = monthly.map(m => ({
        month: m.month,
        total: Math.round(m.total / 100),
        count: m.count,
    }));

    const periods = [
        { value: '3',  label: '3 mois' },
        { value: '6',  label: '6 mois' },
        { value: '12', label: '12 mois' },
    ];

    return (
        <AdminLayout title="Revenus">
            <div className="space-y-6">
                {/* KPI */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-5 text-white">
                        <p className="text-xs font-medium text-orange-100 mb-1">Total toutes périodes</p>
                        <p className="text-2xl font-bold">{fmt(summary.total_all_time)}</p>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 p-5">
                        <p className="text-xs text-gray-500 font-medium mb-1">Ce mois</p>
                        <p className="text-2xl font-bold text-gray-900">{fmt(summary.total_month)}</p>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 p-5">
                        <p className="text-xs text-gray-500 font-medium mb-1">Cette année</p>
                        <p className="text-2xl font-bold text-gray-900">{fmt(summary.total_year)}</p>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 p-5">
                        <p className="text-xs text-gray-500 font-medium mb-1">Transactions</p>
                        <p className="text-2xl font-bold text-gray-900">{summary.count_all}</p>
                    </div>
                </div>

                {/* Period selector + Chart */}
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="font-semibold text-gray-900">Évolution du chiffre d'affaires</h3>
                        <div className="flex gap-1">
                            {periods.map(p => (
                                <button key={p.value} onClick={() => router.get(route('admin.revenue'), { period: p.value })}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${period === p.value ? 'bg-orange-600 text-white' : 'text-gray-500 hover:bg-gray-100'}`}>
                                    {p.label}
                                </button>
                            ))}
                        </div>
                    </div>
                    {chartData.length === 0 ? (
                        <div className="text-center py-12 text-gray-400">Aucune donnée disponible.</div>
                    ) : (
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} tickFormatter={v => `${v} MAD`} />
                                <Tooltip formatter={(v) => [`${v} MAD`, 'Revenus']} />
                                <Bar dataKey="total" fill="#ea580c" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>

                {/* By plan */}
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <h3 className="font-semibold text-gray-900 mb-4">Revenus par plan</h3>
                    <div className="space-y-3">
                        {byPlan.length === 0 ? (
                            <p className="text-gray-400 text-sm">Aucune donnée.</p>
                        ) : byPlan.map(p => {
                            const maxTotal = Math.max(...byPlan.map(x => x.total));
                            const pct = maxTotal > 0 ? Math.round(p.total / maxTotal * 100) : 0;
                            return (
                                <div key={p.plan_id} className="flex items-center gap-3">
                                    <div className="w-24 text-xs text-gray-600 font-medium truncate">{p.plan?.name ?? 'Inconnu'}</div>
                                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                        <div className="h-2 bg-orange-500 rounded-full" style={{ width: `${pct}%` }} />
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-semibold text-gray-900">{fmt(p.total)}</p>
                                        <p className="text-[10px] text-gray-400">{p.count} paiements</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
