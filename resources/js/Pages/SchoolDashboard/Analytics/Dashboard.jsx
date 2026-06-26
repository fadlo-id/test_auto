import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import StatsCard from '@/Components/Analytics/StatsCard';
import LineChart from '@/Components/Analytics/LineChart';
import BarChart from '@/Components/Analytics/BarChart';
import PieChart from '@/Components/Analytics/PieChart';
import DateRangePicker from '@/Components/Analytics/DateRangePicker';

export default function AnalyticsDashboard() {
    const [days, setDays] = useState(30);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [comparison, setComparison] = useState(null);

    useEffect(() => {
        fetchAnalytics();
    }, [days]);

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            const [dashboardRes, comparisonRes] = await Promise.all([
                axios.get(`/api/v1/school/analytics/dashboard?days=${days}`),
                axios.get(`/api/v1/school/analytics/comparison?days=${days}`)
            ]);

            setData(dashboardRes.data);
            setComparison(comparisonRes.data);
        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">No analytics data available</p>
            </div>
        );
    }

    const { summary, chart_data, top_clicks, devices, traffic_sources } = data;

    return (
        <>
            <Head title="Analytics Dashboard" />

            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
                            <p className="text-gray-600 mt-2">Track your school's performance and ROI</p>
                        </div>
                        <DateRangePicker days={days} onChange={setDays} />
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <StatsCard
                            title="Total Views"
                            value={summary.total_views.toLocaleString()}
                            change={comparison?.views?.change}
                            icon="👁️"
                        />
                        <StatsCard
                            title="Total Clicks"
                            value={summary.total_clicks.toLocaleString()}
                            change={comparison?.clicks?.change}
                            icon="👆"
                        />
                        <StatsCard
                            title="New Leads"
                            value={summary.new_leads.toLocaleString()}
                            change={comparison?.leads?.change}
                            icon="📞"
                        />
                        <StatsCard
                            title="Conversion Rate"
                            value={`${summary.avg_conversion_rate}%`}
                            change={0}
                            icon="📈"
                        />
                    </div>

                    {/* Charts Row 1 */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                        {/* Views Chart */}
                        <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
                            <h2 className="text-lg font-semibold mb-4">Views Over Time</h2>
                            <LineChart
                                labels={chart_data.views.labels}
                                datasets={[
                                    {
                                        label: 'Total Views',
                                        data: chart_data.views.data,
                                        borderColor: 'rgb(59, 130, 246)',
                                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                    },
                                    {
                                        label: 'Unique Visitors',
                                        data: chart_data.views.unique,
                                        borderColor: 'rgb(34, 197, 94)',
                                        backgroundColor: 'rgba(34, 197, 94, 0.1)',
                                    },
                                ]}
                            />
                        </div>

                        {/* Device Breakdown */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-lg font-semibold mb-4">Device Types</h2>
                            <PieChart
                                labels={['Desktop', 'Mobile', 'Tablet']}
                                data={[devices.desktop, devices.mobile, devices.tablet]}
                                colors={['#3B82F6', '#EF4444', '#F59E0B']}
                            />
                        </div>
                    </div>

                    {/* Charts Row 2 */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        {/* Clicks Chart */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-lg font-semibold mb-4">Clicks Over Time</h2>
                            <LineChart
                                labels={chart_data.clicks.labels}
                                datasets={[
                                    {
                                        label: 'Total Clicks',
                                        data: chart_data.clicks.data,
                                        borderColor: 'rgb(255, 99, 132)',
                                        backgroundColor: 'rgba(255, 99, 132, 0.1)',
                                    },
                                ]}
                            />
                        </div>

                        {/* Traffic Sources */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-lg font-semibold mb-4">Traffic Sources</h2>
                            <PieChart
                                labels={['Direct', 'Organic', 'Referral', 'Paid']}
                                data={[
                                    traffic_sources.direct,
                                    traffic_sources.organic,
                                    traffic_sources.referral,
                                    traffic_sources.paid,
                                ]}
                                colors={['#3B82F6', '#10B981', '#F59E0B', '#EF4444']}
                            />
                        </div>
                    </div>

                    {/* Top Clicks */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-lg font-semibold mb-4">Click Breakdown</h2>
                        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-4">
                            {Object.entries(top_clicks).map(([type, count]) => (
                                <div key={type} className="text-center p-4 bg-gray-50 rounded-lg">
                                    <div className="text-2xl mb-2">
                                        {type === 'phone' && '☎️'}
                                        {type === 'whatsapp' && '💬'}
                                        {type === 'website' && '🌐'}
                                        {type === 'facebook' && 'f'}
                                        {type === 'instagram' && '📷'}
                                        {type === 'email' && '✉️'}
                                        {type === 'maps' && '📍'}
                                    </div>
                                    <div className="text-xl font-bold text-gray-900">{count}</div>
                                    <div className="text-sm text-gray-600 capitalize">{type}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
