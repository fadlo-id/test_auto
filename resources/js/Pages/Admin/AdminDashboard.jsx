import React, { useState, useEffect } from 'react';
import { Head, usePage } from '@inertiajs/react';
import axios from 'axios';
import Alert from '@/Components/Common/Alert';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function AdminDashboard() {
    const [dashboardData, setDashboardData] = useState({
        total_users: 0,
        total_schools: 0,
        total_subscriptions: 0,
        total_revenue: 0,
        pending_reviews: 0,
        monthly_users: [],
        monthly_revenue: [],
        subscription_breakdown: [],
    });
    const [loading, setLoading] = useState(true);
    const [alert, setAlert] = useState(null);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/v1/admin/dashboard', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            setDashboardData(response.data);
        } catch (error) {
            setAlert({
                type: 'error',
                message: 'Failed to load dashboard data',
            });
        } finally {
            setLoading(false);
        }
    };

    const dismissAlert = () => setAlert(null);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p>Loading dashboard...</p>
                </div>
            </div>
        );
    }

    const statCards = [
        { title: 'Total Users', value: dashboardData.total_users, icon: '👥', color: 'blue' },
        { title: 'Total Schools', value: dashboardData.total_schools, icon: '🏫', color: 'green' },
        { title: 'Active Subscriptions', value: dashboardData.total_subscriptions, icon: '📊', color: 'purple' },
        { title: 'Total Revenue', value: `$${dashboardData.total_revenue.toLocaleString()}`, icon: '💰', color: 'orange' },
        { title: 'Pending Reviews', value: dashboardData.pending_reviews, icon: '⭐', color: 'red', link: '/admin/reviews' },
    ];

    return (
        <>
            <Head title="Admin Dashboard" />
            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <div className="bg-white shadow">
                    <div className="px-6 py-4">
                        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                        <p className="text-gray-600 mt-1">Platform overview and management</p>
                    </div>
                </div>

                {/* Alert */}
                {alert && <Alert type={alert.type} message={alert.message} onClose={dismissAlert} />}

                {/* Main Content */}
                <div className="p-6">
                    {/* Stat Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                        {statCards.map((card, index) => (
                            <div
                                key={index}
                                onClick={() => card.link && (window.location.href = card.link)}
                                className={`bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-shadow ${card.link ? 'hover:bg-gray-50' : ''}`}
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-600 text-sm font-medium">{card.title}</p>
                                        <p className="text-2xl font-bold text-gray-900 mt-2">{card.value}</p>
                                    </div>
                                    <div className="text-3xl opacity-50">{card.icon}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        {/* Monthly Users Chart */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-4">Monthly Users</h2>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={dashboardData.monthly_users}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="count" stroke="#3b82f6" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Monthly Revenue Chart */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-4">Monthly Revenue</h2>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={dashboardData.monthly_revenue}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="revenue" fill="#10b981" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Subscription Breakdown */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Subscription Breakdown</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={dashboardData.subscription_breakdown}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, value }) => `${name}: ${value}`}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="count"
                                >
                                    {dashboardData.subscription_breakdown.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={['#3b82f6', '#10b981', '#f59e0b', '#ef4444'][index % 4]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </>
    );
}
