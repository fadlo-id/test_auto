import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#f97316', '#10b981', '#3b82f6', '#8b5cf6', '#ef4444'];

function StatCard({ title, value, sub }) {
    return (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500 mb-1">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
        </div>
    );
}

export default function Reports({ revenueByMonth = [], registrationsByMonth = [], schoolsByStatus = [], reviewsByRating = [], summary = {}, period }) {
    return (
        <AdminLayout title="Rapports">
            <Head title="Rapports - Admin" />

            {/* Summary */}
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
                <StatCard title="Revenu total" value={`${Number(summary.total_revenue ?? 0).toLocaleString()} MAD`} />
                <StatCard title={`Revenu (${period}j)`} value={`${Number(summary.revenue_period ?? 0).toLocaleString()} MAD`} />
                <StatCard title="Nouveaux users" value={summary.new_users ?? 0} sub={`${period} derniers jours`} />
                <StatCard title="Nouvelles écoles" value={summary.new_schools ?? 0} sub={`${period} derniers jours`} />
                <StatCard title="Abonnements actifs" value={summary.active_subs ?? 0} />
                <StatCard title="Écoles en attente" value={summary.pending_schools ?? 0} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
                {/* Revenue */}
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <h3 className="font-semibold text-gray-900 mb-4">Revenu mensuel (12 mois)</h3>
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={revenueByMonth}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                            <YAxis tick={{ fontSize: 11 }} />
                            <Tooltip formatter={(v) => `${Number(v).toLocaleString()} MAD`} />
                            <Bar dataKey="total" fill="#f97316" radius={[4, 4, 0, 0]} name="Revenu" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Registrations */}
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <h3 className="font-semibold text-gray-900 mb-4">Inscriptions mensuelles (12 mois)</h3>
                    <ResponsiveContainer width="100%" height={220}>
                        <LineChart data={registrationsByMonth}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                            <YAxis tick={{ fontSize: 11 }} />
                            <Tooltip />
                            <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} dot={false} name="Inscriptions" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Schools by status */}
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <h3 className="font-semibold text-gray-900 mb-4">Auto-écoles par statut</h3>
                    <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                            <Pie data={schoolsByStatus} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={80} label={({ name, value }) => `${name}: ${value}`}>
                                {schoolsByStatus.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Reviews by rating */}
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <h3 className="font-semibold text-gray-900 mb-4">Avis par note</h3>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={reviewsByRating} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                            <XAxis type="number" tick={{ fontSize: 11 }} />
                            <YAxis type="category" dataKey="rating" tick={{ fontSize: 11 }} />
                            <Tooltip />
                            <Bar dataKey="count" fill="#10b981" radius={[0, 4, 4, 0]} name="Avis" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </AdminLayout>
    );
}
