import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import Alert from '@/Components/Common/Alert';

export default function AutoSchools() {
    const [schools, setSchools] = useState([]);
    const [filteredSchools, setFilteredSchools] = useState([]);
    const [loading, setLoading] = useState(true);
    const [alert, setAlert] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [editingSchool, setEditingSchool] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        fetchSchools();
    }, []);

    useEffect(() => {
        filterSchools();
    }, [searchTerm, filterStatus, schools]);

    const fetchSchools = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/v1/admin/schools', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            setSchools(response.data.data || response.data);
        } catch (error) {
            setAlert({
                type: 'error',
                message: 'Failed to load schools',
            });
        } finally {
            setLoading(false);
        }
    };

    const filterSchools = () => {
        let filtered = schools;

        // Filter by status
        if (filterStatus !== 'all') {
            filtered = filtered.filter(school => school.status === filterStatus);
        }

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(school =>
                school.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                school.email?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredSchools(filtered);
        setCurrentPage(1);
    };

    const handleEdit = (school) => {
        setEditingSchool(school.id);
        setEditForm({
            name: school.name,
            email: school.email,
            phone: school.phone,
        });
    };

    const handleSaveEdit = async (schoolId) => {
        try {
            await axios.put(`/api/v1/admin/schools/${schoolId}`, editForm, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            setAlert({
                type: 'success',
                message: 'School updated successfully',
            });
            setEditingSchool(null);
            fetchSchools();
        } catch (error) {
            setAlert({
                type: 'error',
                message: error.response?.data?.message || 'Failed to update school',
            });
        }
    };

    const handleApprove = async (schoolId) => {
        try {
            await axios.post(`/api/v1/admin/schools/${schoolId}/approve`, {}, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            setAlert({
                type: 'success',
                message: 'School approved successfully',
            });
            fetchSchools();
        } catch (error) {
            setAlert({
                type: 'error',
                message: error.response?.data?.message || 'Failed to approve school',
            });
        }
    };

    const handleReject = async (schoolId) => {
        const reason = prompt('Enter rejection reason:');
        if (!reason) return;

        try {
            await axios.post(`/api/v1/admin/schools/${schoolId}/reject`, { reason }, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            setAlert({
                type: 'success',
                message: 'School rejected successfully',
            });
            fetchSchools();
        } catch (error) {
            setAlert({
                type: 'error',
                message: error.response?.data?.message || 'Failed to reject school',
            });
        }
    };

    const handleDelete = async (schoolId) => {
        if (confirm('Are you sure you want to delete this school?')) {
            try {
                await axios.delete(`/api/v1/admin/schools/${schoolId}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                });
                setAlert({
                    type: 'success',
                    message: 'School deleted successfully',
                });
                fetchSchools();
            } catch (error) {
                setAlert({
                    type: 'error',
                    message: error.response?.data?.message || 'Failed to delete school',
                });
            }
        }
    };

    const dismissAlert = () => setAlert(null);

    const getStatusBadge = (status) => {
        const statusMap = {
            pending: 'bg-yellow-100 text-yellow-800',
            approved: 'bg-green-100 text-green-800',
            rejected: 'bg-red-100 text-red-800',
        };
        return statusMap[status] || 'bg-gray-100 text-gray-800';
    };

    const paginatedSchools = filteredSchools.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );
    const totalPages = Math.ceil(filteredSchools.length / itemsPerPage);

    return (
        <>
            <Head title="Manage Schools" />
            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <div className="bg-white shadow">
                    <div className="px-6 py-4">
                        <h1 className="text-3xl font-bold text-gray-900">Manage Schools</h1>
                        <p className="text-gray-600 mt-1">Approve, reject, or manage driving schools</p>
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
                            placeholder="Search by name or email..."
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
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                        </select>
                    </div>

                    {/* Schools Table */}
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        {loading ? (
                            <div className="p-6 text-center">Loading schools...</div>
                        ) : paginatedSchools.length === 0 ? (
                            <div className="p-6 text-center text-gray-500">No schools found</div>
                        ) : (
                            <>
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Name</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Email</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Phone</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {paginatedSchools.map((school) => (
                                            <tr key={school.id} className={editingSchool === school.id ? 'bg-blue-50' : ''}>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {editingSchool === school.id ? (
                                                        <input
                                                            type="text"
                                                            value={editForm.name}
                                                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                                            className="px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                                        />
                                                    ) : (
                                                        <span className="font-medium text-gray-900">{school.name}</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {editingSchool === school.id ? (
                                                        <input
                                                            type="email"
                                                            value={editForm.email}
                                                            onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                                            className="px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                                        />
                                                    ) : (
                                                        <span className="text-gray-700">{school.email}</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {editingSchool === school.id ? (
                                                        <input
                                                            type="tel"
                                                            value={editForm.phone}
                                                            onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                                                            className="px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                                        />
                                                    ) : (
                                                        <span className="text-gray-700">{school.phone}</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(school.status)}`}>
                                                        {school.status.charAt(0).toUpperCase() + school.status.slice(1)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                                                    {editingSchool === school.id ? (
                                                        <>
                                                            <button
                                                                onClick={() => handleSaveEdit(school.id)}
                                                                className="text-green-600 hover:text-green-900 font-medium"
                                                            >
                                                                Save
                                                            </button>
                                                            <button
                                                                onClick={() => setEditingSchool(null)}
                                                                className="text-gray-600 hover:text-gray-900 font-medium"
                                                            >
                                                                Cancel
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <button
                                                                onClick={() => handleEdit(school)}
                                                                className="text-blue-600 hover:text-blue-900 font-medium"
                                                            >
                                                                Edit
                                                            </button>
                                                            {school.status === 'pending' && (
                                                                <>
                                                                    <button
                                                                        onClick={() => handleApprove(school.id)}
                                                                        className="text-green-600 hover:text-green-900 font-medium"
                                                                    >
                                                                        Approve
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleReject(school.id)}
                                                                        className="text-red-600 hover:text-red-900 font-medium"
                                                                    >
                                                                        Reject
                                                                    </button>
                                                                </>
                                                            )}
                                                            <button
                                                                onClick={() => handleDelete(school.id)}
                                                                className="text-red-600 hover:text-red-900 font-medium"
                                                            >
                                                                Delete
                                                            </button>
                                                        </>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                {/* Pagination */}
                                <div className="px-6 py-4 bg-gray-50 flex items-center justify-between border-t border-gray-200">
                                    <span className="text-sm text-gray-700">
                                        Showing {paginatedSchools.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to {Math.min(currentPage * itemsPerPage, filteredSchools.length)} of {filteredSchools.length}
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
