import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

const COLORS = ['#ea580c', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

function StatCard({ label, value, prefix = '', suffix = '' }) {
    return (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">{label}</p>
            <p className="text-2xl font-bold text-gray-900">{prefix}{Number(value ?? 0).toLocaleString()}{suffix}</p>
        </div>
    );
}

export default function Analytics({
    monthlyRevenue = [],
    monthlySchools = [],
    monthlyUsers = [],
    cityBreakdown = [],
    subscriptionBreakdown = [],
    totals = {},
}) {
    const revenueData = monthlyRevenue.map((r) => ({
        mois: r.month,
        revenus: Number(r.revenue ?? 0),
        paiements: r.count,
    }));

    const growthData = monthlyUsers.map((u) => {
        const schools = monthlySchools.find((s) => s.month === u.month);
        return {
            mois: u.month,
            utilisateurs: u.count,
            ecoles: schools?.count ?? 0,
        };
    });

    return (
        <AdminLayout>
            <Head title="Analytics Admin" />

            <div className="p-6">
                <h1 className="text-xl font-bold text-gray-900 mb-6">Analytics Plateforme</h1>

                {/* Totals */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <StatCard label="Revenus totaux" value={totals.revenue} prefix="" suffix=" MAD" />
                    <StatCard label="Auto-ecoles actives" value={totals.active_schools} />
                    <StatCard label="Abonnements actifs" value={totals.active_subs} />
                    <StatCard label="Avis en attente" value={totals.pending_reviews} />
                </div>

                {/* Revenue chart */}
                {revenueData.length > 0 && (
                    <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
                        <h2 className="font-semibold text-gray-900 mb-4">Revenus mensuels (MAD)</h2>
                        <ResponsiveContainer width="100%" height={240}>
                            <BarChart data={revenueData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                                <XAxis dataKey="mois" tick={{ fontSize: 11 }} />
                                <YAxis tick={{ fontSize: 11 }} />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="revenus" fill="#ea580c" name="Revenus (MAD)" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}

                {/* Growth chart */}
                {growthData.length > 0 && (
                    <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
                        <h2 className="font-semibold text-gray-900 mb-4">Croissance mensuelle</h2>
                        <ResponsiveContainer width="100%" height={220}>
                            <LineChart data={growthData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                                <XAxis dataKey="mois" tick={{ fontSize: 11 }} />
                                <YAxis tick={{ fontSize: 11 }} />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="utilisateurs" stroke="#3b82f6" strokeWidth={2} dot={false} name="Utilisateurs" />
                                <Line type="monotone" dataKey="ecoles" stroke="#ea580c" strokeWidth={2} dot={false} name="Auto-ecoles" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* City breakdown */}
                    {cityBreakdown.length > 0 && (
                        <div className="bg-white rounded-xl border border-gray-200 p-5">
                            <h2 className="font-semibold text-gray-900 mb-4">Top villes (auto-ecoles actives)</h2>
                            <div className="space-y-2">
                                {cityBreakdown.map((city, i) => {
                                    const max = cityBreakdown[0].count;
                                    return (
                                        <div key={i} className="flex items-center gap-3">
                                            <span className="text-sm text-gray-700 w-28 truncate">{city.city}</span>
                                            <div className="flex-1 bg-gray-100 rounded-full h-2">
                                                <div className="bg-orange-500 h-2 rounded-full" style={{ width: `${(city.count / max) * 100}%` }} />
                                            </div>
                                            <span className="text-xs text-gray-500 w-6 text-right">{city.count}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Subscription breakdown */}
                    {subscriptionBreakdown.length > 0 && (
                        <div className="bg-white rounded-xl border border-gray-200 p-5">
                            <h2 className="font-semibold text-gray-900 mb-4">Abonnements par plan</h2>
                            <ResponsiveContainer width="100%" height={200}>
                                <PieChart>
                                    <Pie data={subscriptionBreakdown.map((s) => ({ name: s.plan, value: s.count }))}
                                        cx="50%" cy="50%" outerRadius={80} dataKey="value"
                                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
                                        {subscriptionBreakdown.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
