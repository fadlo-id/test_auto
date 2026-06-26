import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import Alert from '@/Components/Common/Alert';

export default function Payments() {
    const [payments, setPayments] = useState([]);
    const [filteredPayments, setFilteredPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [alert, setAlert] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterType, setFilterType] = useState('all');
    const [summary, setSummary] = useState({
        total_revenue: 0,
        total_transactions: 0,
        pending_transactions: 0,
        last_30_days_revenue: 0,
    });
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        fetchPayments();
    }, []);

    useEffect(() => {
        filterPayments();
    }, [searchTerm, filterStatus, filterType, payments]);

    const fetchPayments = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/v1/admin/payments', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            setPayments(response.data.data || response.data);
            setSummary(response.data.summary || {});
        } catch (error) {
            setAlert({
                type: 'error',
                message: 'Failed to load payments',
            });
        } finally {
            setLoading(false);
        }
    };

    const filterPayments = () => {
        let filtered = payments;

        // Filter by status
        if (filterStatus !== 'all') {
            filtered = filtered.filter(payment => payment.status === filterStatus);
        }

        // Filter by type
        if (filterType !== 'all') {
            filtered = filtered.filter(payment => payment.type === filterType);
        }

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(payment =>
                payment.school_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                payment.transaction_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                payment.user_email?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredPayments(filtered);
        setCurrentPage(1);
    };

    const dismissAlert = () => setAlert(null);

    const getStatusBadge = (status) => {
        const statusMap = {
            pending: 'bg-yellow-100 text-yellow-800',
            completed: 'bg-green-100 text-green-800',
            failed: 'bg-red-100 text-red-800',
            refunded: 'bg-blue-100 text-blue-800',
        };
        return statusMap[status] || 'bg-gray-100 text-gray-800';
    };

    const getTypeColor = (type) => {
        const typeMap = {
            subscription: 'text-blue-600',
            one_time: 'text-green-600',
            refund: 'text-red-600',
        };
        return typeMap[type] || 'text-gray-600';
    };

    const paginatedPayments = filteredPayments.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );
    const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);

    return (
        <>
            <Head title="Manage Payments" />
            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <div className="bg-white shadow">
                    <div className="px-6 py-4">
                        <h1 className="text-3xl font-bold text-gray-900">Payment Management</h1>
                        <p className="text-gray-600 mt-1">View transactions and revenue</p>
                    </div>
                </div>

                {/* Alert */}
                {alert && <Alert type={alert.type} message={alert.message} onClose={dismissAlert} />}

                {/* Content */}
                <div className="p-6">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        <div className="bg-white rounded-lg shadow p-6">
                            <p className="text-gray-600 text-sm font-medium">Total Revenue</p>
                            <p className="text-2xl font-bold text-gray-900 mt-2">${summary.total_revenue?.toLocaleString()}</p>
                        </div>
                        <div className="bg-white rounded-lg shadow p-6">
                            <p className="text-gray-600 text-sm font-medium">Total Transactions</p>
                            <p className="text-2xl font-bold text-gray-900 mt-2">{summary.total_transactions}</p>
                        </div>
                        <div className="bg-white rounded-lg shadow p-6">
                            <p className="text-gray-600 text-sm font-medium">Pending Transactions</p>
                            <p className="text-2xl font-bold text-yellow-600 mt-2">{summary.pending_transactions}</p>
                        </div>
                        <div className="bg-white rounded-lg shadow p-6">
                            <p className="text-gray-600 text-sm font-medium">Last 30 Days Revenue</p>
                            <p className="text-2xl font-bold text-green-600 mt-2">${summary.last_30_days_revenue?.toLocaleString()}</p>
                        </div>
                    </div>

                    {/* Search and Filter */}
                    <div className="mb-6 space-y-4">
                        <input
                            type="text"
                            placeholder="Search by school, transaction ID, or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="all">All Status</option>
                                <option value="pending">Pending</option>
                                <option value="completed">Completed</option>
                                <option value="failed">Failed</option>
                                <option value="refunded">Refunded</option>
                            </select>
                            <select
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="all">All Types</option>
                                <option value="subscription">Subscription</option>
                                <option value="one_time">One-time</option>
                                <option value="refund">Refund</option>
                            </select>
                        </div>
                    </div>

                    {/* Payments Table */}
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        {loading ? (
                            <div className="p-6 text-center">Loading payments...</div>
                        ) : paginatedPayments.length === 0 ? (
                            <div className="p-6 text-center text-gray-500">No payments found</div>
                        ) : (
                            <>
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Transaction ID</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">School</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Amount</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Type</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {paginatedPayments.map((payment) => (
                                            <tr key={payment.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap font-mono text-sm text-gray-900">{payment.transaction_id}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div>
                                                        <p className="text-gray-900 font-medium">{payment.school_name}</p>
                                                        <p className="text-gray-600 text-sm">{payment.user_email}</p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">${payment.amount.toLocaleString()}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`text-sm font-medium ${getTypeColor(payment.type)}`}>
                                                        {payment.type.replace('_', ' ').charAt(0).toUpperCase() + payment.type.slice(1).replace('_', ' ')}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(payment.status)}`}>
                                                        {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                    {new Date(payment.created_at).toLocaleDateString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                {/* Pagination */}
                                <div className="px-6 py-4 bg-gray-50 flex items-center justify-between border-t border-gray-200">
                                    <span className="text-sm text-gray-700">
                                        Showing {paginatedPayments.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to {Math.min(currentPage * itemsPerPage, filteredPayments.length)} of {filteredPayments.length}
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
