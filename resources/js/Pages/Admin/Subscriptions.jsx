import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import Alert from '@/Components/Common/Alert';

export default function Subscriptions() {
    const [subscriptions, setSubscriptions] = useState([]);
    const [filteredSubscriptions, setFilteredSubscriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [alert, setAlert] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        fetchSubscriptions();
    }, []);

    useEffect(() => {
        filterSubscriptions();
    }, [searchTerm, filterStatus, subscriptions]);

    const fetchSubscriptions = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/v1/admin/subscriptions', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            setSubscriptions(response.data.data || response.data);
        } catch (error) {
            setAlert({
                type: 'error',
                message: 'Failed to load subscriptions',
            });
        } finally {
            setLoading(false);
        }
    };

    const filterSubscriptions = () => {
        let filtered = subscriptions;

        // Filter by status
        if (filterStatus !== 'all') {
            filtered = filtered.filter(sub => sub.status === filterStatus);
        }

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(sub =>
                sub.school_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                sub.plan_name?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredSubscriptions(filtered);
        setCurrentPage(1);
    };

    const handleCancel = async (subscriptionId) => {
        const reason = prompt('Enter cancellation reason:');
        if (!reason) return;

        try {
            await axios.post(`/api/v1/admin/subscriptions/${subscriptionId}/cancel`, { reason }, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            setAlert({
                type: 'success',
                message: 'Subscription cancelled successfully',
            });
            fetchSubscriptions();
        } catch (error) {
            setAlert({
                type: 'error',
                message: error.response?.data?.message || 'Failed to cancel subscription',
            });
        }
    };

    const dismissAlert = () => setAlert(null);

    const getStatusBadge = (status) => {
        const statusMap = {
            active: 'bg-green-100 text-green-800',
            paused: 'bg-yellow-100 text-yellow-800',
            cancelled: 'bg-red-100 text-red-800',
            expired: 'bg-gray-100 text-gray-800',
        };
        return statusMap[status] || 'bg-gray-100 text-gray-800';
    };

    const isExpiringSoon = (expiresAt) => {
        const daysLeft = (new Date(expiresAt) - new Date()) / (1000 * 60 * 60 * 24);
        return daysLeft > 0 && daysLeft <= 7;
    };

    const paginatedSubscriptions = filteredSubscriptions.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );
    const totalPages = Math.ceil(filteredSubscriptions.length / itemsPerPage);

    return (
        <>
            <Head title="Manage Subscriptions" />
            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <div className="bg-white shadow">
                    <div className="px-6 py-4">
                        <h1 className="text-3xl font-bold text-gray-900">Manage Subscriptions</h1>
                        <p className="text-gray-600 mt-1">View and manage all active subscriptions</p>
                    </div>
                </div>

                {/* Alert */}
                {alert && <Alert type={alert.type} message={alert.message} onClose={dismissAlert} />}

                {/* Content */}
                <div className="p-6">
                    {/* Search and Filter */}
                    <div className="mb-6 space-y-4">
                        <input
                            type="text"
                            placeholder="Search by school or plan name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="paused">Paused</option>
                            <option value="cancelled">Cancelled</option>
                            <option value="expired">Expired</option>
                        </select>
                    </div>

                    {/* Subscriptions Table */}
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        {loading ? (
                            <div className="p-6 text-center">Loading subscriptions...</div>
                        ) : paginatedSubscriptions.length === 0 ? (
                            <div className="p-6 text-center text-gray-500">No subscriptions found</div>
                        ) : (
                            <>
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">School</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Plan</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Price</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Start Date</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Expires At</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {paginatedSubscriptions.map((subscription) => (
                                            <tr key={subscription.id} className={isExpiringSoon(subscription.expires_at) ? 'bg-yellow-50' : ''}>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="font-medium text-gray-900">{subscription.school_name}</span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{subscription.plan_name}</td>
                                                <td className="px-6 py-4 whitespace-nowrap font-bold text-gray-900">${subscription.price}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(subscription.status)}`}>
                                                        {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                    {new Date(subscription.start_date).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    <span className={isExpiringSoon(subscription.expires_at) ? 'text-red-600 font-bold' : 'text-gray-600'}>
                                                        {new Date(subscription.expires_at).toLocaleDateString()}
                                                    </span>
                                                    {isExpiringSoon(subscription.expires_at) && (
                                                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                                                            Expiring Soon
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    {subscription.status === 'active' && (
                                                        <button
                                                            onClick={() => handleCancel(subscription.id)}
                                                            className="text-red-600 hover:text-red-900 font-medium"
                                                        >
                                                            Cancel
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                {/* Pagination */}
                                <div className="px-6 py-4 bg-gray-50 flex items-center justify-between border-t border-gray-200">
                                    <span className="text-sm text-gray-700">
                                        Showing {paginatedSubscriptions.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to {Math.min(currentPage * itemsPerPage, filteredSubscriptions.length)} of {filteredSubscriptions.length}
                                    </span>
                                    <div className="space-x-2">
                                        <button
                                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                            disabled={currentPage === 1}
                                            className="px-3 py-1 border border-gray-300 rounded text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                                        >
                                            Previous
                                        </button>
                                        <span className="text-sm text-gray-700">Page {currentPage} of {totalPages}</span>
                                        <button
                                            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                            disabled={currentPage === totalPages}
                                            className="px-3 py-1 border border-gray-300 rounded text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
