import React, { useState } from 'react';
import axios from 'axios';

export default function ServicesManager({ schoolId, services: initialServices, onSuccess, onError }) {
    const [services, setServices] = useState(initialServices || []);
    const [editing, setEditing] = useState(null);
    const [newService, setNewService] = useState({ name: '', description: '', price: '', duration: '' });
    const [loading, setLoading] = useState(false);

    const handleAdd = async () => {
        if (!newService.name || !newService.price) {
            onError('Name and price are required');
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post(`/api/v1/school/${schoolId}/services`, newService);
            setServices([...services, response.data]);
            setNewService({ name: '', description: '', price: '', duration: '' });
            onSuccess();
        } catch (error) {
            onError(error.response?.data?.message || 'Error adding service');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = async () => {
        if (!editing.name || !editing.price) {
            onError('Name and price are required');
            return;
        }

        setLoading(true);
        try {
            const response = await axios.put(`/api/v1/school/${schoolId}/services/${editing.id}`, editing);
            setServices(services.map(s => s.id === editing.id ? response.data : s));
            setEditing(null);
            onSuccess();
        } catch (error) {
            onError(error.response?.data?.message || 'Error updating service');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (serviceId) => {
        if (!confirm('Are you sure you want to delete this service?')) return;

        setLoading(true);
        try {
            await axios.delete(`/api/v1/school/${schoolId}/services/${serviceId}`);
            setServices(services.filter(s => s.id !== serviceId));
            onSuccess();
        } catch (error) {
            onError(error.response?.data?.message || 'Error deleting service');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 space-y-6">
            <h2 className="text-2xl font-bold">Manage Services</h2>

            {/* Add New Service */}
            <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Add New Service</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Service Name</label>
                        <input
                            type="text"
                            value={newService.name}
                            onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g., Manual Driving Lessons"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Price (DH)</label>
                        <input
                            type="number"
                            value={newService.price}
                            onChange={(e) => setNewService({ ...newService, price: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="0.00"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Duration (hours)</label>
                        <input
                            type="number"
                            value={newService.duration}
                            onChange={(e) => setNewService({ ...newService, duration: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="1"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                        <input
                            type="text"
                            value={newService.description}
                            onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="Brief description"
                        />
                    </div>
                </div>
                <button
                    onClick={handleAdd}
                    disabled={loading}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                >
                    {loading ? 'Adding...' : '+ Add Service'}
                </button>
            </div>

            {/* Services List */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold">Current Services ({services.length})</h3>

                {services.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <p>No services added yet</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {services.map((service) => (
                            <div key={service.id} className="bg-white border border-gray-200 rounded-lg p-4">
                                {editing?.id === service.id ? (
                                    // Edit Mode
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Service Name</label>
                                                <input
                                                    type="text"
                                                    value={editing.name}
                                                    onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Price (DH)</label>
                                                <input
                                                    type="number"
                                                    value={editing.price}
                                                    onChange={(e) => setEditing({ ...editing, price: e.target.value })}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Duration (hours)</label>
                                                <input
                                                    type="number"
                                                    value={editing.duration}
                                                    onChange={(e) => setEditing({ ...editing, duration: e.target.value })}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                                                <input
                                                    type="text"
                                                    value={editing.description}
                                                    onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={handleEdit}
                                                disabled={loading}
                                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                                            >
                                                Save
                                            </button>
                                            <button
                                                onClick={() => setEditing(null)}
                                                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    // Display Mode
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <h4 className="text-lg font-semibold text-gray-900">{service.name}</h4>
                                            {service.description && (
                                                <p className="text-gray-600 text-sm mt-1">{service.description}</p>
                                            )}
                                            <div className="flex gap-4 mt-2 text-sm text-gray-600">
                                                <span>💰 {service.price} DH</span>
                                                {service.duration && <span>⏱️ {service.duration}h</span>}
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setEditing(service)}
                                                className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(service.id)}
                                                disabled={loading}
                                                className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition disabled:opacity-50"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
