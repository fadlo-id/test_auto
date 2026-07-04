import { Head, usePage } from '@inertiajs/react';
import SchoolLayout from '@/Layouts/SchoolLayout';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function StatCard({ label, value, color = 'orange' }) {
    const colors = { orange: 'text-orange-600', blue: 'text-blue-600', green: 'text-green-600', purple: 'text-purple-600' };
    return (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm text-gray-500 mb-1">{label}</p>
            <p className={`text-2xl font-bold ${colors[color]}`}>{value}</p>
        </div>
    );
}

export default function Statistics({ daily = [], monthly = [], totals = {}, ratingBreakdown = {} }) {
    const { school } = usePage().props;

    const ratingData = [1, 2, 3, 4, 5].map((r) => ({ rating: `${r}★`, count: ratingBreakdown[r] ?? 0 }));

    return (
        <SchoolLayout title="Statistiques" school={school}>
            <Head title="Statistiques" />

            {/* Totals (30 jours) */}
            <h2 className="text-lg font-semibold text-gray-900 mb-3">30 derniers jours</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
                <StatCard label="Vues profil" value={totals.views?.toLocaleString() ?? 0} color="blue" />
                <StatCard label="Clics téléphone" value={totals.phone_clicks ?? 0} color="green" />
                <StatCard label="Clics WhatsApp" value={totals.whatsapp_clicks ?? 0} color="green" />
                <StatCard label="Clics site web" value={totals.website_clicks ?? 0} color="orange" />
                <StatCard label="Clics email" value={totals.email_clicks ?? 0} color="purple" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                <StatCard label="Avis total" value={totals.reviews ?? 0} color="orange" />
                <StatCard label="Note moyenne" value={totals.avg_rating ? Number(totals.avg_rating).toFixed(1) + ' / 5' : '-'} color="orange" />
                <StatCard label="Réservations" value={totals.bookings ?? 0} color="blue" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
                {/* Daily views */}
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <h3 className="font-semibold text-gray-900 mb-4">Vues quotidiennes (30 jours)</h3>
                    <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={daily}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                            <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(d) => d?.slice(5)} />
                            <YAxis tick={{ fontSize: 11 }} />
                            <Tooltip />
                            <Line type="monotone" dataKey="total_views" stroke="#3b82f6" strokeWidth={2} dot={false} name="Vues" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Monthly trends */}
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <h3 className="font-semibold text-gray-900 mb-4">Tendances mensuelles (12 mois)</h3>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={monthly}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                            <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                            <YAxis tick={{ fontSize: 11 }} />
                            <Tooltip />
                            <Bar dataKey="views" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Vues" />
                            <Bar dataKey="phone_clicks" fill="#10b981" radius={[4, 4, 0, 0]} name="Tél." />
                            <Bar dataKey="whatsapp_clicks" fill="#f97316" radius={[4, 4, 0, 0]} name="WhatsApp" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Rating breakdown */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="font-semibold text-gray-900 mb-4">Répartition des avis</h3>
                <ResponsiveContainer width="100%" height={160}>
                    <BarChart data={ratingData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                        <XAxis type="number" tick={{ fontSize: 11 }} />
                        <YAxis type="category" dataKey="rating" tick={{ fontSize: 12 }} width={30} />
                        <Tooltip />
                        <Bar dataKey="count" fill="#f97316" radius={[0, 4, 4, 0]} name="Avis" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </SchoolLayout>
    );
}
