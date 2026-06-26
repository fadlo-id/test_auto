import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import Alert from '@/Components/Common/Alert';

export default function Reviews() {
    const [reviews, setReviews] = useState([]);
    const [filteredReviews, setFilteredReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [alert, setAlert] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [selectedReview, setSelectedReview] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        fetchReviews();
    }, []);

    useEffect(() => {
        filterReviews();
    }, [searchTerm, filterStatus, reviews]);

    const fetchReviews = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/v1/admin/reviews', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            setReviews(response.data.data || response.data);
        } catch (error) {
            setAlert({
                type: 'error',
                message: 'Failed to load reviews',
            });
        } finally {
            setLoading(false);
        }
    };

    const filterReviews = () => {
        let filtered = reviews;

        // Filter by status
        if (filterStatus !== 'all') {
            filtered = filtered.filter(review => review.status === filterStatus);
        }

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(review =>
                review.school_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                review.user_name?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredReviews(filtered);
        setCurrentPage(1);
    };

    const handleApprove = async (reviewId) => {
        try {
            await axios.post(`/api/v1/admin/reviews/${reviewId}/approve`, {}, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            setAlert({
                type: 'success',
                message: 'Review approved successfully',
            });
            setSelectedReview(null);
            fetchReviews();
        } catch (error) {
            setAlert({
                type: 'error',
                message: error.response?.data?.message || 'Failed to approve review',
            });
        }
    };

    const handleReject = async (reviewId) => {
        const reason = prompt('Enter rejection reason:');
        if (!reason) return;

        try {
            await axios.post(`/api/v1/admin/reviews/${reviewId}/reject`, { reason }, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            setAlert({
                type: 'success',
                message: 'Review rejected successfully',
            });
            setSelectedReview(null);
            fetchReviews();
        } catch (error) {
            setAlert({
                type: 'error',
                message: error.response?.data?.message || 'Failed to reject review',
            });
        }
    };

    const handleDelete = async (reviewId) => {
        if (confirm('Are you sure you want to delete this review?')) {
            try {
                await axios.delete(`/api/v1/admin/reviews/${reviewId}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                });
                setAlert({
                    type: 'success',
                    message: 'Review deleted successfully',
                });
                setSelectedReview(null);
                fetchReviews();
            } catch (error) {
                setAlert({
                    type: 'error',
                    message: error.response?.data?.message || 'Failed to delete review',
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

    const renderStars = (rating) => {
        return (
            <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                    <span key={i} className={i < rating ? 'text-yellow-400' : 'text-gray-300'}>★</span>
                ))}
            </div>
        );
    };

    const paginatedReviews = filteredReviews.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );
    const totalPages = Math.ceil(filteredReviews.length / itemsPerPage);

    return (
        <>
            <Head title="Moderate Reviews" />
            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <div className="bg-white shadow">
                    <div className="px-6 py-4">
                        <h1 className="text-3xl font-bold text-gray-900">Moderate Reviews</h1>
                        <p className="text-gray-600 mt-1">Review and approve user reviews</p>
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
                            placeholder="Search by school or user name..."
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

                    {/* Reviews List */}
                    <div className="space-y-4">
                        {loading ? (
                            <div className="bg-white rounded-lg shadow p-6 text-center">Loading reviews...</div>
                        ) : paginatedReviews.length === 0 ? (
                            <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">No reviews found</div>
                        ) : (
                            <>
                                {paginatedReviews.map((review) => (
                                    <div
                                        key={review.id}
                                        className={`bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-shadow ${
                                            selectedReview?.id === review.id ? 'ring-2 ring-blue-500' : ''
                                        }`}
                                        onClick={() => setSelectedReview(selectedReview?.id === review.id ? null : review)}
                                    >
                                        {/* Review Header */}
                                        <div className="flex items-start justify-between mb-4">
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-900">{review.school_name}</h3>
                                                <p className="text-gray-600 text-sm">By {review.user_name}</p>
                                                <p className="text-gray-500 text-xs mt-1">{new Date(review.created_at).toLocaleDateString()}</p>
                                            </div>
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(review.status)}`}>
                                                {review.status.charAt(0).toUpperCase() + review.status.slice(1)}
                                            </span>
                                        </div>

                                        {/* Rating */}
                                        <div className="mb-3">
                                            {renderStars(review.rating)}
                                        </div>

                                        {/* Review Content */}
                                        <p className="text-gray-700 mb-4">{review.comment}</p>

                                        {/* Expanded Actions */}
                                        {selectedReview?.id === review.id && (
                                            <div className="border-t pt-4 mt-4 space-y-3">
                                                {review.status === 'pending' && (
                                                    <div className="flex space-x-2">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleApprove(review.id);
                                                            }}
                                                            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                                                        >
                                                            Approve
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleReject(review.id);
                                                            }}
                                                            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
                                                        >
                                                            Reject
                                                        </button>
                                                    </div>
                                                )}
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDelete(review.id);
                                                    }}
                                                    className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}

                                {/* Pagination */}
                                <div className="flex items-center justify-between mt-6">
                                    <span className="text-sm text-gray-700">
                                        Showing {paginatedReviews.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to {Math.min(currentPage * itemsPerPage, filteredReviews.length)} of {filteredReviews.length}
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
