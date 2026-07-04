import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    LineChart, Line, AreaChart, Area, BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import Panel from '@/Components/Analytics/Panel';
import KpiCard from '@/Components/Analytics/KpiCard';
import TopListChart from '@/Components/Analytics/TopListChart';
import PieCard from '@/Components/Analytics/PieCard';
import Heatmap from '@/Components/Analytics/Heatmap';
import Funnel from '@/Components/Analytics/Funnel';
import DateRangeFilter from '@/Components/Analytics/DateRangeFilter';
import ExportButtons from '@/Components/Analytics/ExportButtons';

function ucfirst(s) {
    return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

export default function Analytics({
    filters = {},
    schools = [],
    overview = {},
    viewsPerDay = [],
    clicksPerDay = [],
    bookingsPerDay = [],
    revenuePerMonth = [],
    revenuePerSchool = [],
    mostViewed = [],
    mostClicked = [],
    mostContacted = [],
    topCities = [],
    topCategories = [],
    trafficSources = {},
    deviceStats = [],
    browserStats = [],
    countryStats = [],
    heatmap = [],
    funnel = {},
    monthlySchools = [],
    monthlyUsers = [],
    subscriptionBreakdown = [],
    bookingStats = {},
    totals = {},
}) {
    const applyFilters = (params) => {
        router.get(route('admin.analytics'), params, { preserveState: true, replace: true });
    };

    const exportFilters = {
        date_from: filters.date_from,
        date_to: filters.date_to,
        ...(filters.school_id ? { school_id: filters.school_id } : {}),
    };

    const perDayData = viewsPerDay.map((v, i) => ({
        date: v.date,
        vues: Number(v.count ?? 0),
        clics: Number(clicksPerDay[i]?.count ?? 0),
        reservations: Number(bookingsPerDay[i]?.count ?? 0),
    }));

    const revenueData = revenuePerMonth.map((r) => ({ mois: r.month, revenus: Number(r.revenue ?? 0) }));

    const growthData = monthlyUsers.map((u) => {
        const s = monthlySchools.find((x) => x.month === u.month);
        return { mois: u.month, utilisateurs: u.count, ecoles: s?.count ?? 0 };
    });

    const trafficData = Object.entries(trafficSources).map(([name, value]) => ({ name: ucfirst(name), value }));
    const deviceData = deviceStats.map((d) => ({ name: d.name, value: Number(d.count) }));
    const browserData = browserStats.map((d) => ({ name: d.name, value: Number(d.count) }));
    const subscriptionData = subscriptionBreakdown.map((s) => ({ name: s.plan, value: s.count }));

    const mostViewedData = mostViewed.map((s) => ({ name: s.name, value: Number(s.total) }));
    const mostClickedData = mostClicked.map((s) => ({ name: s.name, value: Number(s.total) }));
    const mostContactedData = mostContacted.map((s) => ({ name: s.name, value: Number(s.total) }));
    const revenuePerSchoolData = revenuePerSchool.map((s) => ({ name: s.name, value: Number(s.revenue) }));
    const topCitiesData = topCities.map((c) => ({ name: c.city, value: Number(c.views) }));
    const topCategoriesData = topCategories.map((c) => ({ name: c.name, value: Number(c.views) }));
    const countryData = countryStats.map((c) => ({ name: c.name, value: Number(c.count) }));

    return (
        <AdminLayout title="Analytics">
            <Head title="Analytics Admin" />

            <div className="space-y-6">
                {/* Filters + exports */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <DateRangeFilter
                        dateFrom={filters.date_from}
                        dateTo={filters.date_to}
                        schools={schools}
                        schoolId={filters.school_id}
                        onApply={applyFilters}
                    />
                    <ExportButtons routeName="admin.analytics.export" filters={exportFilters} />
                </div>

                {/* Lifetime KPIs */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <KpiCard label="Revenus totaux" value={totals.revenue_all_time} suffix=" MAD" color="text-green-700" />
                    <KpiCard label="Auto-écoles actives" value={totals.active_schools} />
                    <KpiCard label="Abonnements actifs" value={totals.active_subs} />
                    <KpiCard label="Avis en attente" value={totals.pending_reviews} color="text-yellow-600" />
                </div>

                {/* Period overview KPIs */}
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                    <KpiCard label="Vues" value={overview.views} color="text-blue-700" />
                    <KpiCard label="Visiteurs uniques" value={overview.unique_visitors} />
                    <KpiCard label="Visiteurs récurrents" value={overview.returning_visitors} />
                    <KpiCard label="Clics" value={overview.clicks} color="text-orange-600" />
                    <KpiCard label="Contacts" value={overview.leads} color="text-green-700" />
                    <KpiCard label="Réservations" value={overview.bookings} color="text-purple-700" />
                    {overview.revenue !== null && overview.revenue !== undefined && (
                        <KpiCard label="Revenus (période)" value={overview.revenue} suffix=" MAD" color="text-green-700" />
                    )}
                    <KpiCard label="Taux de rebond" value={overview.bounce_rate} suffix="%" />
                    <KpiCard label="CTR" value={overview.ctr} suffix="%" />
                    <KpiCard label="Taux de conversion" value={overview.conversion_rate} suffix="%" color="text-green-700" />
                </div>

                {/* Line + Area charts: views/clicks/bookings per day */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {perDayData.length > 0 && (
                        <Panel title="Vues, clics & réservations par jour">
                            <ResponsiveContainer width="100%" height={240}>
                                <LineChart data={perDayData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                                    <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                                    <YAxis tick={{ fontSize: 11 }} />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="vues" stroke="#3b82f6" strokeWidth={2} dot={false} name="Vues" />
                                    <Line type="monotone" dataKey="clics" stroke="#ea580c" strokeWidth={2} dot={false} name="Clics" />
                                    <Line type="monotone" dataKey="reservations" stroke="#10b981" strokeWidth={2} dot={false} name="Réservations" />
                                </LineChart>
                            </ResponsiveContainer>
                        </Panel>
                    )}

                    {perDayData.length > 0 && (
                        <Panel title="Volume cumulé (aire)">
                            <ResponsiveContainer width="100%" height={240}>
                                <AreaChart data={perDayData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                                    <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                                    <YAxis tick={{ fontSize: 11 }} />
                                    <Tooltip />
                                    <Legend />
                                    <Area type="monotone" dataKey="vues" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.35} name="Vues" />
                                    <Area type="monotone" dataKey="clics" stackId="1" stroke="#ea580c" fill="#ea580c" fillOpacity={0.35} name="Clics" />
                                    <Area type="monotone" dataKey="reservations" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.35} name="Réservations" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </Panel>
                    )}
                </div>

                {/* Revenue + growth */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {revenueData.length > 0 && (
                        <Panel title="Revenus mensuels (MAD)">
                            <ResponsiveContainer width="100%" height={220}>
                                <BarChart data={revenueData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                                    <XAxis dataKey="mois" tick={{ fontSize: 11 }} />
                                    <YAxis tick={{ fontSize: 11 }} />
                                    <Tooltip formatter={(v) => `${Number(v).toLocaleString('fr-FR')} MAD`} />
                                    <Bar dataKey="revenus" fill="#ea580c" name="Revenus (MAD)" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </Panel>
                    )}

                    {growthData.length > 0 && (
                        <Panel title="Croissance mensuelle (utilisateurs & écoles)">
                            <ResponsiveContainer width="100%" height={220}>
                                <LineChart data={growthData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                                    <XAxis dataKey="mois" tick={{ fontSize: 11 }} />
                                    <YAxis tick={{ fontSize: 11 }} />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="utilisateurs" stroke="#3b82f6" strokeWidth={2} dot={false} name="Utilisateurs" />
                                    <Line type="monotone" dataKey="ecoles" stroke="#ea580c" strokeWidth={2} dot={false} name="Auto-écoles" />
                                </LineChart>
                            </ResponsiveContainer>
                        </Panel>
                    )}
                </div>

                {/* Top schools */}
                <h2 className="font-semibold text-gray-900 text-lg pt-2">Classements des auto-écoles</h2>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <TopListChart title="Écoles les plus vues" data={mostViewedData} color="#3b82f6" />
                    <TopListChart title="Écoles les plus cliquées" data={mostClickedData} color="#ea580c" />
                    <TopListChart title="Écoles les plus contactées" data={mostContactedData} color="#10b981" />
                    <TopListChart title="Revenus par école" data={revenuePerSchoolData} color="#8b5cf6" />
                    <TopListChart title="Top villes (vues)" data={topCitiesData} color="#f59e0b" />
                    <TopListChart title="Top catégories (vues)" data={topCategoriesData} color="#ec4899" />
                </div>

                {/* Traffic / device / browser / subscription */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <PieCard title="Sources de trafic" data={trafficData} />
                    <PieCard title="Appareils" data={deviceData} />
                    <PieCard title="Navigateurs" data={browserData} />
                    <PieCard title="Abonnements par plan" data={subscriptionData} />
                </div>

                {/* Countries + bookings */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <TopListChart title="Pays des visiteurs" data={countryData} color="#14b8a6" />

                    <Panel title="Réservations (total)">
                        <div className="space-y-3">
                            {[
                                { label: 'Total', value: bookingStats.total ?? 0, color: 'bg-gray-400' },
                                { label: 'En attente', value: bookingStats.pending ?? 0, color: 'bg-yellow-400' },
                                { label: 'Confirmées', value: bookingStats.confirmed ?? 0, color: 'bg-green-500' },
                                { label: 'Terminées', value: bookingStats.completed ?? 0, color: 'bg-blue-500' },
                            ].map((s) => (
                                <div key={s.label} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2.5 h-2.5 rounded-full ${s.color}`} />
                                        <span className="text-sm text-gray-700">{s.label}</span>
                                    </div>
                                    <span className="font-semibold text-gray-900">{s.value}</span>
                                </div>
                            ))}
                        </div>
                    </Panel>
                </div>

                {/* Heatmap + funnel */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Heatmap data={heatmap} />
                    <Funnel funnel={funnel} />
                </div>
            </div>
        </AdminLayout>
    );
}
