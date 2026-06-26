import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import StatsCard from '@/Components/Analytics/StatsCard';
import LineChart from '@/Components/Analytics/LineChart';
import BarChart from '@/Components/Analytics/BarChart';
import PieChart from '@/Components/Analytics/PieChart';

export default function AdminAnalyticsDashboard() {
    const [days, setDays] = useState(30);
    const [data, setData] = useState(null);
    const [topSchools, setTopSchools] = useState([]);
    const [topClicks, setTopClicks] = useState(null);
    const [devices, setDevices] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, [days]);

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            const [dashboardRes, schoolsRes, clicksRes, devicesRes] = await Promise.all([
                axios.get(`/api/v1/admin/analytics/dashboard?days=${days}`),
                axios.get('/api/v1/admin/analytics/top-schools?limit=10'),
                axios.get(`/api/v1/admin/analytics/top-clicks?days=${days}`),
                axios.get(`/api/v1/admin/analytics/devices?days=${days}`),
            ]);

            setData(dashboardRes.data);
            setTopSchools(schoolsRes.data);
            setTopClicks(clicksRes.data);
            setDevices(devicesRes.data);
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

    const { summary, chart_data } = data;

    return (
        <>
            <Head title="Admin Analytics Dashboard" />

            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
                            <p className="text-gray-600 mt-2">Platform-wide analytics and insights</p>
                        </div>
                        <select
                            value={days}
                            onChange={(e) => setDays(parseInt(e.target.value))}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value={7}>Last 7 days</option>
                            <option value={30}>Last 30 days</option>
                            <option value={60}>Last 60 days</option>
                            <option value={90}>Last 90 days</option>
                        </select>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                        <StatsCard title="Total Views" value={summary.total_views.toLocaleString()} icon="👁️" />
                        <StatsCard title="Total Clicks" value={summary.total_clicks.toLocaleString()} icon="👆" />
                        <StatsCard title="Total Leads" value={summary.total_leads.toLocaleString()} icon="📞" />
                        <StatsCard title="Active Schools" value={summary.total_schools.toLocaleString()} icon="🏢" />
                        <StatsCard title="Avg CTR" value={`${summary.avg_ctr}%`} icon="📊" />
                    </div>

                    {/* Charts Row 1 */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        {/* Views Chart */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-lg font-semibold mb-4">Platform Views</h2>
                            <LineChart
                                labels={chart_data.views.labels}
                                datasets={[
                                    {
                                        label: 'Total Views',
                                        data: chart_data.views.data,
                                        borderColor: 'rgb(59, 130, 246)',
                                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                    },
                                ]}
                            />
                        </div>

                        {/* Clicks Chart */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-lg font-semibold mb-4">Platform Clicks</h2>
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
                    </div>

                    {/* Charts Row 2 */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        {/* Device Breakdown */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-lg font-semibold mb-4">Device Types</h2>
                            {devices && (
                                <PieChart
                                    labels={['Desktop', 'Mobile', 'Tablet']}
                                    data={[devices.desktop, devices.mobile, devices.tablet]}
                                    colors={['#3B82F6', '#EF4444', '#F59E0B']}
                                />
                            )}
                        </div>

                        {/* Top Clicks */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-lg font-semibold mb-4">Click Types</h2>
                            {topClicks && (
                                <div className="space-y-4">
                                    {Object.entries(topClicks).map(([type, count], index) => (
                                        <div key={type} className="flex items-center">
                                            <div className="flex-1">
                                                <div className="text-sm font-medium text-gray-900 capitalize">
                                                    {type}
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                                                    <div
                                                        className="bg-blue-600 h-2 rounded-full"
                                                        style={{
                                                            width: `${Math.max(
                                                                (count / Math.max(...Object.values(topClicks))) * 100,
                                                                5
                                                            )}%`,
                                                        }}
                                                    ></div>
                                                </div>
                                            </div>
                                            <div className="ml-4 text-sm font-bold text-gray-900">{count}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Top Schools */}
                    <div className="bg-white rounded-lg shadow p-6 mb-8">
                        <h2 className="text-lg font-semibold mb-4">Top Performing Schools</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="border-b-2 border-gray-200">
                                    <tr>
                                        <th className="px-4 py-3 font-semibold text-gray-900">School</th>
                                        <th className="px-4 py-3 font-semibold text-gray-900">Views</th>
                                        <th className="px-4 py-3 font-semibold text-gray-900">Reviews</th>
                                        <th className="px-4 py-3 font-semibold text-gray-900">Rating</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {topSchools.map((school, index) => (
                                        <tr key={school.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center">
                                                    <span className="mr-3 text-gray-500 font-semibold">
                                                        {index + 1}
                                                    </span>
                                                    <span className="font-medium text-gray-900">{school.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-gray-600">
                                                {school.views.toLocaleString()}
                                            </td>
                                            <td className="px-4 py-3 text-gray-600">{school.reviews_count}</td>
                                            <td className="px-4 py-3">
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                                                    ⭐ {school.rating?.toFixed(1) || 'N/A'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Leads Chart */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-lg font-semibold mb-4">Platform Leads</h2>
                        <LineChart
                            labels={chart_data.leads.labels}
                            datasets={[
                                {
                                    label: 'New Leads',
                                    data: chart_data.leads.data,
                                    borderColor: 'rgb(34, 197, 94)',
                                    backgroundColor: 'rgba(34, 197, 94, 0.1)',
                                },
                            ]}
                        />
                    </div>
                </div>
            </div>
        </>
    );
}
