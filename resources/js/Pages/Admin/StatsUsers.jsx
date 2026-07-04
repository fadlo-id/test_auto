import AdminLayout from '@/Layouts/AdminLayout';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const ROLE_LABELS = { super_admin: 'Super Admin', admin: 'Admin', school_owner: 'Propriétaire', user: 'Élève' };
const COLORS = ['#7c3aed', '#2563eb', '#ea580c', '#6b7280'];

export default function StatsUsers({ monthly, byRole, summary }) {
    const roleData = byRole.map((r, i) => ({
        name: ROLE_LABELS[r.role] ?? r.role,
        value: r.count,
        fill: COLORS[i % COLORS.length],
    }));

    return (
        <AdminLayout title="Statistiques Utilisateurs">
            <div className="space-y-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { label: 'Total', value: summary.total, color: 'bg-gray-50 border-gray-200', text: 'text-gray-900' },
                        { label: 'Actifs', value: summary.active, color: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700' },
                        { label: 'Ce mois', value: summary.new_this_month, color: 'bg-blue-50 border-blue-200', text: 'text-blue-700' },
                        { label: 'Cette semaine', value: summary.new_this_week, color: 'bg-orange-50 border-orange-200', text: 'text-orange-700' },
                    ].map(k => (
                        <div key={k.label} className={`rounded-xl border p-5 ${k.color}`}>
                            <p className="text-xs text-gray-500 font-medium mb-1">{k.label}</p>
                            <p className={`text-3xl font-bold ${k.text}`}>{k.value}</p>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5">
                        <h3 className="font-semibold text-gray-900 mb-4">Inscriptions mensuelles (12 mois)</h3>
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={monthly} margin={{ top: 0, right: 0, left: -10, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} />
                                <Tooltip />
                                <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} name="Inscriptions" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 p-5">
                        <h3 className="font-semibold text-gray-900 mb-4">Répartition par rôle</h3>
                        <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                                <Pie data={roleData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                                    {roleData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="mt-3 space-y-1">
                            {roleData.map((r, i) => (
                                <div key={i} className="flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: r.fill }} />
                                        <span className="text-gray-600">{r.name}</span>
                                    </div>
                                    <span className="font-semibold text-gray-900">{r.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
