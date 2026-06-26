import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

const COLORS = ['#f97316', '#10b981', '#3b82f6', '#8b5cf6'];

function StatCard({ title, value, icon, color = 'orange', href }) {
    const colorMap = {
        orange: 'bg-orange-50 text-orange-600',
        green:  'bg-green-50 text-green-600',
        blue:   'bg-blue-50 text-blue-600',
        purple: 'bg-purple-50 text-purple-600',
        red:    'bg-red-50 text-red-600',
    };
    const card = (
        <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${colorMap[color]}`}>
                {icon}
            </div>
            <div>
                <p className="text-sm text-gray-500">{title}</p>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
            </div>
        </div>
    );
    return href ? <Link href={href}>{card}</Link> : card;
}

export default function Dashboard({ stats, monthlyUsers, monthlyRevenue, subscriptionBreakdown, recentSchools }) {
    return (
        <AdminLayout title="Dashboard">
            <Head title="Admin Dashboard" />

            {/* Stats grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
                <StatCard title="Utilisateurs" value={stats.total_users.toLocaleString()} icon="👥" color="blue" />
                <StatCard title="Auto-écoles" value={stats.total_schools.toLocaleString()} icon="🏫" color="green" />
                <StatCard title="En attente" value={stats.pending_schools} icon="⏳" color="orange" href={route('admin.auto-schools.index') + '?status=pending'} />
                <StatCard title="Abonnements actifs" value={stats.active_subscriptions} icon="📋" color="purple" />
                <StatCard title="Revenu total" value={`${Number(stats.total_revenue).toLocaleString()} MAD`} icon="💰" color="green" />
                <StatCard title="Avis en attente" value={stats.pending_reviews} icon="⭐" color="red" href={route('admin.reviews.index') + '?status=pending'} />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <h3 className="font-semibold text-gray-900 mb-4">Inscriptions mensuelles</h3>
                    <ResponsiveContainer width="100%" height={240}>
                        <LineChart data={monthlyUsers}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                            <YAxis tick={{ fontSize: 11 }} />
                            <Tooltip />
                            <Line type="monotone" dataKey="count" stroke="#f97316" strokeWidth={2} dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <h3 className="font-semibold text-gray-900 mb-4">Revenus mensuels (MAD)</h3>
                    <ResponsiveContainer width="100%" height={240}>
                        <BarChart data={monthlyRevenue}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                            <YAxis tick={{ fontSize: 11 }} />
                            <Tooltip />
                            <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Subscription breakdown */}
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <h3 className="font-semibold text-gray-900 mb-4">Répartition des abonnements</h3>
                    {subscriptionBreakdown.length > 0 ? (
                        <ResponsiveContainer width="100%" height={220}>
                            <PieChart>
                                <Pie data={subscriptionBreakdown} cx="50%" cy="50%" outerRadius={80} dataKey="count" nameKey="name" label={({ name }) => name}>
                                    {subscriptionBreakdown.map((_, i) => (
                                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <p className="text-gray-400 text-sm text-center py-10">Aucun abonnement actif</p>
                    )}
                </div>

                {/* Recent schools */}
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-900">Dernières auto-écoles</h3>
                        <Link href={route('admin.auto-schools.index')} className="text-sm text-orange-600 hover:underline">
                            Voir tout
                        </Link>
                    </div>
                    <div className="space-y-3">
                        {recentSchools.map((school) => (
                            <div key={school.id} className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-sm font-medium text-gray-600">
                                    {school.name[0]}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">{school.name}</p>
                                    <p className="text-xs text-gray-500">{school.city}</p>
                                </div>
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                    school.status === 'approved' ? 'bg-green-100 text-green-700' :
                                    school.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                    'bg-yellow-100 text-yellow-700'
                                }`}>
                                    {school.status}
                                </span>
                            </div>
                        ))}
                        {recentSchools.length === 0 && (
                            <p className="text-gray-400 text-sm text-center py-6">Aucune auto-école</p>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
