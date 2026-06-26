import React, { useState, useEffect } from 'react';
import { Head, usePage } from '@inertiajs/react';
import axios from 'axios';
import OverviewCards from '@/Components/Dashboard/OverviewCards';
import AnalyticsCharts from '@/Components/Dashboard/AnalyticsCharts';
import ProfileEditor from '@/Components/Dashboard/ProfileEditor';
import MediaUpload from '@/Components/Dashboard/MediaUpload';
import ServicesManager from '@/Components/Dashboard/ServicesManager';
import Tabs from '@/Components/Common/Tabs';
import Alert from '@/Components/Common/Alert';

export default function DashboardPage({ auth, school, plans }) {
    const { props } = usePage();
    const [activeTab, setActiveTab] = useState('overview');
    const [dashboardData, setDashboardData] = useState(school);
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    useEffect(() => {
        fetchDashboardData();
    }, [refreshTrigger]);

    const fetchDashboardData = async () => {
        if (!school) return;
        setLoading(true);
        try {
            const response = await axios.get(`/api/v1/school/dashboard/${school.id}`);
            setDashboardData(response.data);
        } catch (error) {
            showAlert('Error loading dashboard data', 'error');
            console.error('Dashboard error:', error);
        } finally {
            setLoading(false);
        }
    };

    const showAlert = (message, type = 'success') => {
        setAlert({ message, type });
        setTimeout(() => setAlert(null), 5000);
    };

    const handleRefresh = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    const tabs = [
        { id: 'overview', label: 'Overview', icon: '📊' },
        { id: 'profile', label: 'Profile', icon: '👤' },
        { id: 'media', label: 'Media', icon: '🖼️' },
        { id: 'services', label: 'Services', icon: '🔧' },
        { id: 'analytics', label: 'Analytics', icon: '📈' },
    ];

    if (!school) {
        return (
            <>
                <Head title="Dashboard" />
                <div className="min-h-screen bg-gray-50 py-12">
                    <div className="container mx-auto px-4">
                        <h1 className="text-4xl font-bold mb-8">Dashboard</h1>
                        <p className="text-gray-600">You don't have a school yet. <a href="/register-school" className="text-blue-600 font-bold">Create one now.</a></p>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Head title="School Dashboard" />

            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <div className="bg-white border-b border-gray-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">{school.name}</h1>
                                <p className="text-gray-600 mt-2">Manage your school profile and analytics</p>
                            </div>
                            <button
                                onClick={handleRefresh}
                                disabled={loading}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                            >
                                ↻ Refresh
                            </button>
                        </div>
                    </div>
                </div>

                {/* Alert */}
                {alert && (
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
                        <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
                    </div>
                )}

                {/* Main Content */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Tabs */}
                    <Tabs
                        tabs={tabs}
                        activeTab={activeTab}
                        onChange={setActiveTab}
                        className="mb-8"
                    />

                    {/* Tab Content */}
                    <div className="bg-white rounded-lg shadow">
                        {loading && (
                            <div className="flex items-center justify-center p-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                            </div>
                        )}

                        {!loading && (
                            <>
                                {/* Overview Tab */}
                                {activeTab === 'overview' && dashboardData && (
                                    <div className="p-6 space-y-6">
                                        <OverviewCards data={dashboardData} />
                                        
                                        {/* Quick Stats */}
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6">
                                                <p className="text-gray-600 text-sm font-medium">Subscription Status</p>
                                                <p className="text-2xl font-bold text-gray-900 mt-2">
                                                    {dashboardData.subscription?.plan?.name || 'No Active Plan'}
                                                </p>
                                                {dashboardData.subscription?.ends_at && (
                                                    <p className="text-xs text-gray-600 mt-2">
                                                        Expires: {new Date(dashboardData.subscription.ends_at).toLocaleDateString()}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6">
                                                <p className="text-gray-600 text-sm font-medium">Verification Status</p>
                                                <div className="flex items-center mt-2">
                                                    <span className={`text-2xl font-bold ${dashboardData.is_verified ? 'text-green-600' : 'text-yellow-600'}`}>
                                                        {dashboardData.is_verified ? '✓ Verified' : '⊙ Pending'}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6">
                                                <p className="text-gray-600 text-sm font-medium">Active Listings</p>
                                                <p className="text-2xl font-bold text-gray-900 mt-2">
                                                    {dashboardData.services_count || 0}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Profile Tab */}
                                {activeTab === 'profile' && dashboardData && (
                                    <ProfileEditor
                                        school={dashboardData}
                                        onSuccess={() => {
                                            showAlert('Profile updated successfully!', 'success');
                                            handleRefresh();
                                        }}
                                        onError={(msg) => showAlert(msg, 'error')}
                                    />
                                )}

                                {/* Media Tab */}
                                {activeTab === 'media' && dashboardData && (
                                    <MediaUpload
                                        school={dashboardData}
                                        onSuccess={() => {
                                            showAlert('Media uploaded successfully!', 'success');
                                            handleRefresh();
                                        }}
                                        onError={(msg) => showAlert(msg, 'error')}
                                    />
                                )}

                                {/* Services Tab */}
                                {activeTab === 'services' && dashboardData && (
                                    <ServicesManager
                                        schoolId={dashboardData.id}
                                        services={dashboardData.services || []}
                                        onSuccess={() => {
                                            showAlert('Services updated successfully!', 'success');
                                            handleRefresh();
                                        }}
                                        onError={(msg) => showAlert(msg, 'error')}
                                    />
                                )}

                                {/* Analytics Tab */}
                                {activeTab === 'analytics' && dashboardData && (
                                    <AnalyticsCharts
                                        school={dashboardData}
                                        analytics={dashboardData.analytics}
                                    />
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}