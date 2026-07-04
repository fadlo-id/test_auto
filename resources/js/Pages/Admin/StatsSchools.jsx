import AdminLayout from '@/Layouts/AdminLayout';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const STATUS_LABELS = { approved: 'Approuvées', pending: 'En attente', rejected: 'Rejetées', suspended: 'Suspendues' };
const STATUS_COLORS = { approved: 'bg-emerald-500', pending: 'bg-amber-500', rejected: 'bg-red-500', suspended: 'bg-gray-400' };

export default function StatsSchools({ monthly, byStatus, byCity, summary }) {
    return (
        <AdminLayout title="Statistiques Auto-écoles">
            <div className="space-y-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { label: 'Total', value: summary.total },
                        { label: 'Approuvées', value: summary.approved, badge: 'badge-green' },
                        { label: 'En attente', value: summary.pending, badge: 'badge-yellow' },
                        { label: 'Actives', value: summary.active, badge: 'badge-blue' },
                    ].map(k => (
                        <div key={k.label} className="bg-white rounded-xl border border-gray-200 p-5">
                            <p className="text-xs text-gray-500 font-medium mb-1">{k.label}</p>
                            <p className="text-3xl font-bold text-gray-900">{k.value}</p>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5">
                        <h3 className="font-semibold text-gray-900 mb-4">Nouvelles auto-écoles (12 mois)</h3>
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={monthly} margin={{ top: 0, right: 0, left: -10, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} />
                                <Tooltip />
                                <Bar dataKey="count" fill="#ea580c" radius={[4, 4, 0, 0]} name="Auto-écoles" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 p-5">
                        <h3 className="font-semibold text-gray-900 mb-4">Par statut</h3>
                        <div className="space-y-3">
                            {byStatus.map((s, i) => {
                                const total = byStatus.reduce((acc, x) => acc + x.count, 0);
                                const pct = total > 0 ? Math.round(s.count / total * 100) : 0;
                                return (
                                    <div key={i}>
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="text-gray-600">{STATUS_LABELS[s.status] ?? s.status}</span>
                                            <span className="font-semibold text-gray-900">{s.count} ({pct}%)</span>
                                        </div>
                                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                            <div className={`h-2 rounded-full ${STATUS_COLORS[s.status] ?? 'bg-gray-400'}`} style={{ width: `${pct}%` }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <h3 className="font-semibold text-gray-900 mb-4">Top 15 villes</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                        {byCity.map((c, i) => (
                            <div key={i} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                                <span className="text-xs font-bold text-gray-400 w-5">#{i + 1}</span>
                                <div className="min-w-0">
                                    <p className="text-xs font-semibold text-gray-900 truncate">{c.city}</p>
                                    <p className="text-[10px] text-gray-400">{c.count} écoles</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
