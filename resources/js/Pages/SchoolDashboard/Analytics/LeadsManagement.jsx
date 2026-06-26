import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import axios from 'axios';

export default function LeadsManagement() {
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState('new');
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState(null);

    useEffect(() => {
        fetchLeads();
    }, [status, search, page]);

    const fetchLeads = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                status: status || undefined,
                search: search || undefined,
                page,
            });

            const res = await axios.get(`/api/v1/school/analytics/leads?${params}`);
            setLeads(res.data.data);
            setPagination({
                current_page: res.data.current_page,
                last_page: res.data.last_page,
                total: res.data.total,
            });
        } catch (error) {
            console.error('Error fetching leads:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateLeadStatus = async (leadId, newStatus) => {
        try {
            await axios.put(`/api/v1/school/analytics/leads/${leadId}`, {
                status: newStatus,
            });
            fetchLeads();
        } catch (error) {
            console.error('Error updating lead:', error);
        }
    };

    const getStatusColor = (s) => {
        switch (s) {
            case 'new':
                return 'bg-blue-100 text-blue-800';
            case 'contacted':
                return 'bg-yellow-100 text-yellow-800';
            case 'converted':
                return 'bg-green-100 text-green-800';
            case 'archived':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusLabel = (s) => {
        return s.charAt(0).toUpperCase() + s.slice(1);
    };

    return (
        <>
            <Head title="Lead Management" />

            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">Lead Management</h1>
                        <p className="text-gray-600 mt-2">Track and manage all incoming leads</p>
                    </div>

                    {/* Filters */}
                    <div className="bg-white rounded-lg shadow p-6 mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Status
                                </label>
                                <select
                                    value={status}
                                    onChange={(e) => {
                                        setStatus(e.target.value);
                                        setPage(1);
                                    }}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">All Statuses</option>
                                    <option value="new">New</option>
                                    <option value="contacted">Contacted</option>
                                    <option value="converted">Converted</option>
                                    <option value="archived">Archived</option>
                                </select>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Search
                                </label>
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => {
                                        setSearch(e.target.value);
                                        setPage(1);
                                    }}
                                    placeholder="Search by name or email..."
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Leads Table */}
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        {loading ? (
                            <div className="flex items-center justify-center p-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                            </div>
                        ) : leads.length > 0 ? (
                            <>
                                <table className="w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                                Name
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                                Email
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                                Phone
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                                Date
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {leads.map(lead => (
                                            <tr key={lead.id} className="hover:bg-gray-50 transition">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {lead.visitor_name}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                    {lead.visitor_email}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                    {lead.visitor_phone}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(lead.status)}`}>
                                                        {getStatusLabel(lead.status)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                    {new Date(lead.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                                                    {lead.status !== 'contacted' && (
                                                        <button
                                                            onClick={() => updateLeadStatus(lead.id, 'contacted')}
                                                            className="text-blue-600 hover:text-blue-800 font-medium"
                                                        >
                                                            Contact
                                                        </button>
                                                    )}
                                                    {lead.status !== 'converted' && lead.status !== 'archived' && (
                                                        <button
                                                            onClick={() => updateLeadStatus(lead.id, 'converted')}
                                                            className="text-green-600 hover:text-green-800 font-medium"
                                                        >
                                                            Convert
                                                        </button>
                                                    )}
                                                    {lead.status !== 'archived' && (
                                                        <button
                                                            onClick={() => updateLeadStatus(lead.id, 'archived')}
                                                            className="text-gray-600 hover:text-gray-800 font-medium"
                                                        >
                                                            Archive
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                {/* Pagination */}
                                {pagination && pagination.last_page > 1 && (
                                    <div className="bg-white px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                                        <div className="text-sm text-gray-600">
                                            Page {pagination.current_page} of {pagination.last_page} •{' '}
                                            {pagination.total} total leads
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setPage(page - 1)}
                                                disabled={page === 1}
                                                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                                            >
                                                Previous
                                            </button>
                                            <button
                                                onClick={() => setPage(page + 1)}
                                                disabled={page === pagination.last_page}
                                                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                                            >
                                                Next
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-12">
                                <p className="text-gray-500">No leads found</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
