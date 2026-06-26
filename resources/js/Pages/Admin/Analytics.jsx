import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Alert from '@/Components/Common/Alert';

export default function Analytics() {
    const [analyticsData, setAnalyticsData] = useState({
        monthly_users: [],
        monthly_revenue: [],
        monthly_subscriptions: [],
        user_growth: [],
        school_growth: [],
        subscription_types: [],
        top_plans: [],
    });
    const [loading, setLoading] = useState(true);
    const [alert, setAlert] = useState(null);
    const [dateRange, setDateRange] = useState('30');

    useEffect(() => {
        fetchAnalytics();
    }, [dateRange]);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`/api/v1/admin/analytics?range=${dateRange}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            setAnalyticsData(response.data);
        } catch (error) {
            setAlert({
                type: 'error',
                message: 'Failed to load analytics data',
            });
        } finally {
            setLoading(false);
        }
    };

    const dismissAlert = () => setAlert(null);

    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p>Loading analytics...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <Head title="Platform Analytics" />
            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <div className="bg-white shadow">
                    <div className="px-6 py-4 flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Platform Analytics</h1>
                            <p className="text-gray-600 mt-1">Global platform statistics and trends</p>
                        </div>
                        <select
                            value={dateRange}
                            onChange={(e) => setDateRange(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="7">Last 7 Days</option>
                            <option value="30">Last 30 Days</option>
                            <option value="90">Last 90 Days</option>
                            <option value="365">Last Year</option>
                        </select>
                    </div>
                </div>

                {/* Alert */}
                {alert && <Alert type={alert.type} message={alert.message} onClose={dismissAlert} />}

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Monthly Users Chart */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Monthly Users Growth</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={analyticsData.monthly_users}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="total_users" stroke="#3b82f6" strokeWidth={2} />
                                <Line type="monotone" dataKey="new_users" stroke="#10b981" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Monthly Revenue Chart */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Monthly Revenue</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={analyticsData.monthly_revenue}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="revenue" fill="#10b981" />
                                <Bar dataKey="refunds" fill="#ef4444" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Growth Metrics */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* User Growth */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-4">User Growth</h2>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={analyticsData.user_growth}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>

                        {/* School Growth */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-4">School Growth</h2>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={analyticsData.school_growth}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="count" stroke="#f59e0b" strokeWidth={2} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Subscription Types */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Subscription Types Distribution</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={analyticsData.subscription_types}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, value }) => `${name}: ${value}`}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="count"
                                >
                                    {analyticsData.subscription_types.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Top Plans */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Top Subscription Plans</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Plan Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Price</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Active Subscriptions</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Monthly Revenue</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Growth %</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {analyticsData.top_plans.map((plan, index) => (
                                        <tr key={index} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{plan.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-gray-700">${plan.price}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-gray-900 font-bold">{plan.subscriptions}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-gray-900 font-bold">${(plan.subscriptions * plan.price).toLocaleString()}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                    plan.growth >= 0
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {plan.growth > 0 ? '+' : ''}{plan.growth}%
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Monthly Subscriptions */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Monthly Subscriptions Trend</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={analyticsData.monthly_subscriptions}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="new" fill="#10b981" name="New Subscriptions" />
                                <Bar dataKey="cancelled" fill="#ef4444" name="Cancelled" />
                                <Bar dataKey="total" fill="#3b82f6" name="Total Active" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </>
    );
}
