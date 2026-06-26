import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import Alert from '@/Components/Common/Alert';

export default function Users() {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [alert, setAlert] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingUser, setEditingUser] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        filterUsers();
    }, [searchTerm, users]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/v1/admin/users', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            setUsers(response.data.data || response.data);
        } catch (error) {
            setAlert({
                type: 'error',
                message: 'Failed to load users',
            });
        } finally {
            setLoading(false);
        }
    };

    const filterUsers = () => {
        const filtered = users.filter(user =>
            user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredUsers(filtered);
        setCurrentPage(1);
    };

    const handleEdit = (user) => {
        setEditingUser(user.id);
        setEditForm({
            name: user.name,
            email: user.email,
        });
    };

    const handleSaveEdit = async (userId) => {
        try {
            await axios.put(`/api/v1/admin/users/${userId}`, editForm, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            setAlert({
                type: 'success',
                message: 'User updated successfully',
            });
            setEditingUser(null);
            fetchUsers();
        } catch (error) {
            setAlert({
                type: 'error',
                message: error.response?.data?.message || 'Failed to update user',
            });
        }
    };

    const handleDelete = async (userId) => {
        if (confirm('Are you sure you want to delete this user?')) {
            try {
                await axios.delete(`/api/v1/admin/users/${userId}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                });
                setAlert({
                    type: 'success',
                    message: 'User deleted successfully',
                });
                fetchUsers();
            } catch (error) {
                setAlert({
                    type: 'error',
                    message: error.response?.data?.message || 'Failed to delete user',
                });
            }
        }
    };

    const handleBan = async (userId, currentStatus) => {
        try {
            await axios.post(`/api/v1/admin/users/${userId}/ban`, {
                is_banned: !currentStatus,
            }, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            setAlert({
                type: 'success',
                message: `User ${!currentStatus ? 'banned' : 'unbanned'} successfully`,
            });
            fetchUsers();
        } catch (error) {
            setAlert({
                type: 'error',
                message: error.response?.data?.message || 'Failed to update user status',
            });
        }
    };

    const dismissAlert = () => setAlert(null);

    const paginatedUsers = filteredUsers.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

    return (
        <>
            <Head title="Manage Users" />
            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <div className="bg-white shadow">
                    <div className="px-6 py-4">
                        <h1 className="text-3xl font-bold text-gray-900">Manage Users</h1>
                        <p className="text-gray-600 mt-1">View and manage all platform users</p>
                    </div>
                </div>

                {/* Alert */}
                {alert && <Alert type={alert.type} message={alert.message} onClose={dismissAlert} />}

                {/* Content */}
                <div className="p-6">
                    {/* Search Bar */}
                    <div className="mb-6">
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    {/* Users Table */}
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        {loading ? (
                            <div className="p-6 text-center">Loading users...</div>
                        ) : paginatedUsers.length === 0 ? (
                            <div className="p-6 text-center text-gray-500">No users found</div>
                        ) : (
                            <>
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Name</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Email</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Joined</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {paginatedUsers.map((user) => (
                                            <tr key={user.id} className={editingUser === user.id ? 'bg-blue-50' : ''}>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {editingUser === user.id ? (
                                                        <input
                                                            type="text"
                                                            value={editForm.name}
                                                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                                            className="px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                                        />
                                                    ) : (
                                                        <span className="font-medium text-gray-900">{user.name}</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {editingUser === user.id ? (
                                                        <input
                                                            type="email"
                                                            value={editForm.email}
                                                            onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                                            className="px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                                        />
                                                    ) : (
                                                        <span className="text-gray-700">{user.email}</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                        user.is_banned
                                                            ? 'bg-red-100 text-red-800'
                                                            : 'bg-green-100 text-green-800'
                                                    }`}>
                                                        {user.is_banned ? 'Banned' : 'Active'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                    {new Date(user.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                                                    {editingUser === user.id ? (
                                                        <>
                                                            <button
                                                                onClick={() => handleSaveEdit(user.id)}
                                                                className="text-green-600 hover:text-green-900 font-medium"
                                                            >
                                                                Save
                                                            </button>
                                                            <button
                                                                onClick={() => setEditingUser(null)}
                                                                className="text-gray-600 hover:text-gray-900 font-medium"
                                                            >
                                                                Cancel
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <button
                                                                onClick={() => handleEdit(user)}
                                                                className="text-blue-600 hover:text-blue-900 font-medium"
                                                            >
                                                                Edit
                                                            </button>
                                                            <button
                                                                onClick={() => handleBan(user.id, user.is_banned)}
                                                                className={`${user.is_banned ? 'text-green-600 hover:text-green-900' : 'text-yellow-600 hover:text-yellow-900'} font-medium`}
                                                            >
                                                                {user.is_banned ? 'Unban' : 'Ban'}
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(user.id)}
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
                                        Showing {paginatedUsers.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to {Math.min(currentPage * itemsPerPage, filteredUsers.length)} of {filteredUsers.length}
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
