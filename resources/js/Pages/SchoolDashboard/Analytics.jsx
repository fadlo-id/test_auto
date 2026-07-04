import { Head, router } from '@inertiajs/react';
import SchoolLayout from '@/Layouts/SchoolLayout';
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import KpiCard from '@/Components/Analytics/KpiCard';
import PieCard from '@/Components/Analytics/PieCard';
import TopListChart from '@/Components/Analytics/TopListChart';
import Heatmap from '@/Components/Analytics/Heatmap';
import Funnel from '@/Components/Analytics/Funnel';
import DateRangeFilter from '@/Components/Analytics/DateRangeFilter';
import ExportButtons from '@/Components/Analytics/ExportButtons';

const COLORS = ['#ea580c', '#3b82f6', '#10b981', '#f59e0b'];

function ucfirst(s) {
    return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

function StatCard({ label, value, change, unit = '' }) {
    const positive = change >= 0;
    return (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">{label}</p>
            <p className="text-2xl font-bold text-gray-900">{(value ?? 0).toLocaleString()}{unit}</p>
            {change !== undefined && (
                <p className={`text-xs mt-1 font-medium ${positive ? 'text-green-600' : 'text-red-500'}`}>
                    {positive ? '+' : ''}{change}% vs periode precedente
                </p>
            )}
        </div>
    );
}

export default function Analytics({
    school, analytics, comparison, days, filters = {},
    overview = {}, trafficSources = {}, browserStats = [], countryStats = [], heatmap = [], funnel = {},
}) {
    const hasData = analytics?.summary?.total_views > 0;

    const changeFilter = (d) => router.get(route('school.analytics'), { days: d }, { preserveState: true });
    const applyDateRange = (params) => router.get(route('school.analytics'), params, { preserveState: true, replace: true });

    const trafficData = Object.entries(trafficSources).map(([name, value]) => ({ name: ucfirst(name), value }));
    const browserData = browserStats.map((b) => ({ name: b.name, value: Number(b.count) }));
    const countryData = countryStats.map((c) => ({ name: c.name, value: Number(c.count) }));

    const viewsData = analytics?.chart_data?.views?.labels?.map((label, i) => ({
        date: label,
        vues: analytics.chart_data.views.data[i] ?? 0,
        uniques: analytics.chart_data.views.unique[i] ?? 0,
    })) ?? [];

    const clicksData = analytics?.chart_data?.clicks?.labels?.map((label, i) => ({
        date: label,
        clics: analytics.chart_data.clicks.data[i] ?? 0,
    })) ?? [];

    const deviceData = analytics?.analytics?.devices
        ? [
            { name: 'Desktop', value: analytics.analytics.devices.desktop },
            { name: 'Mobile', value: analytics.analytics.devices.mobile },
            { name: 'Tablette', value: analytics.analytics.devices.tablet },
          ]
        : analytics?.devices
        ? [
            { name: 'Desktop', value: analytics.devices.desktop },
            { name: 'Mobile', value: analytics.devices.mobile },
            { name: 'Tablette', value: analytics.devices.tablet },
          ]
        : [];

    const summary = analytics?.summary ?? {};
    const clicks  = analytics?.top_clicks ?? {};

    return (
        <SchoolLayout title="Analytics" school={school}>
            <Head title="Analytics" />

            {/* Period filter */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                <h2 className="font-semibold text-gray-900">Vue d'ensemble ({days} jours)</h2>
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex gap-1">
                        {[7, 30, 90].map((d) => (
                            <button key={d} onClick={() => changeFilter(d)}
                                className={`px-3 py-1.5 text-sm rounded-lg font-medium ${days === d ? 'bg-orange-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                                {d}j
                            </button>
                        ))}
                    </div>
                    <ExportButtons routeName="school.analytics.export" filters={{ date_from: filters.date_from, date_to: filters.date_to }} />
                </div>
            </div>

            <div className="mb-6">
                <DateRangeFilter dateFrom={filters.date_from} dateTo={filters.date_to} onApply={applyDateRange} />
            </div>

            {/* Summary stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StatCard label="Vues totales" value={summary.total_views} change={comparison?.views?.change} />
                <StatCard label="Visiteurs uniques" value={summary.unique_visitors} />
                <StatCard label="Clics totaux" value={summary.total_clicks} change={comparison?.clicks?.change} />
                <StatCard label="Nouveaux leads" value={summary.new_leads} change={comparison?.leads?.change} />
            </div>

            {/* Enterprise KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <KpiCard label="Visiteurs récurrents" value={overview.returning_visitors} />
                <KpiCard label="Taux de rebond" value={overview.bounce_rate} suffix="%" />
                <KpiCard label="CTR" value={overview.ctr} suffix="%" />
                <KpiCard label="Taux de conversion" value={overview.conversion_rate} suffix="%" color="text-green-700" />
            </div>

            {!hasData ? (
                <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                    <p className="text-4xl mb-3">📊</p>
                    <p className="text-gray-500 text-sm">Aucune donnee pour la periode selectionnee.</p>
                    <p className="text-gray-400 text-xs mt-1">Les donnees apparaissent apres vos premieres visites de fiche.</p>
                </div>
            ) : (
                <>
                    {/* Views chart */}
                    {viewsData.length > 0 && (
                        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-5">
                            <h3 className="font-semibold text-gray-900 mb-4">Evolution des vues</h3>
                            <ResponsiveContainer width="100%" height={220}>
                                <LineChart data={viewsData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                                    <YAxis tick={{ fontSize: 11 }} />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="vues" stroke="#ea580c" strokeWidth={2} dot={false} />
                                    <Line type="monotone" dataKey="uniques" stroke="#3b82f6" strokeWidth={2} dot={false} strokeDasharray="4 2" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
                        {/* Clicks chart */}
                        {clicksData.length > 0 && (
                            <div className="bg-white rounded-xl border border-gray-200 p-5">
                                <h3 className="font-semibold text-gray-900 mb-4">Clics par jour</h3>
                                <ResponsiveContainer width="100%" height={180}>
                                    <BarChart data={clicksData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                                        <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                                        <YAxis tick={{ fontSize: 11 }} />
                                        <Tooltip />
                                        <Bar dataKey="clics" fill="#ea580c" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        )}

                        {/* Device breakdown */}
                        {deviceData.some((d) => d.value > 0) && (
                            <div className="bg-white rounded-xl border border-gray-200 p-5">
                                <h3 className="font-semibold text-gray-900 mb-4">Appareils</h3>
                                <ResponsiveContainer width="100%" height={180}>
                                    <PieChart>
                                        <Pie data={deviceData} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                                            {deviceData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </div>

                    {/* Top clicks breakdown */}
                    {Object.keys(clicks).length > 0 && (
                        <div className="bg-white rounded-xl border border-gray-200 p-5">
                            <h3 className="font-semibold text-gray-900 mb-4">Detail des clics</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                                {Object.entries(clicks).map(([type, count]) => (
                                    <div key={type} className="text-center p-3 bg-gray-50 rounded-lg">
                                        <p className="text-lg font-bold text-gray-900">{count}</p>
                                        <p className="text-xs text-gray-500 capitalize">{type}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Enterprise breakdowns */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-5">
                <PieCard title="Sources de trafic" data={trafficData} />
                <PieCard title="Navigateurs" data={browserData} />
                <TopListChart title="Pays des visiteurs" data={countryData} color="#14b8a6" height={220} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-5">
                <Heatmap data={heatmap} />
                <Funnel funnel={funnel} />
            </div>
        </SchoolLayout>
    );
}
