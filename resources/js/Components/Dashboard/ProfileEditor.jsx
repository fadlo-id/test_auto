import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import axios from 'axios';

export default function ProfileEditor({ school, onSuccess, onError }) {
    const { data, setData, errors, processing } = useForm({
        name: school?.name || '',
        email: school?.email || '',
        phone: school?.phone || '',
        address: school?.address || '',
        city: school?.city || '',
        description: school?.description || '',
        latitude: school?.latitude || '',
        longitude: school?.longitude || '',
        website: school?.website || '',
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`/api/v1/school/${school.id}/profile`, data);
            onSuccess();
        } catch (error) {
            onError(error.response?.data?.message || 'Error updating profile');
        }
    };

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-6">Edit School Profile</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">School Name</label>
                        <input
                            type="text"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                        />
                        {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <input
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                        />
                        {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                        <input
                            type="tel"
                            value={data.phone}
                            onChange={(e) => setData('phone', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                        />
                        {errors.phone && <p className="text-red-600 text-sm mt-1">{errors.phone}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                        <input
                            type="url"
                            value={data.website}
                            onChange={(e) => setData('website', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="https://example.com"
                        />
                        {errors.website && <p className="text-red-600 text-sm mt-1">{errors.website}</p>}
                    </div>
                </div>

                {/* Address Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                        <input
                            type="text"
                            value={data.address}
                            onChange={(e) => setData('address', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                        />
                        {errors.address && <p className="text-red-600 text-sm mt-1">{errors.address}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                        <input
                            type="text"
                            value={data.city}
                            onChange={(e) => setData('city', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                        />
                        {errors.city && <p className="text-red-600 text-sm mt-1">{errors.city}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Latitude</label>
                        <input
                            type="number"
                            step="0.000001"
                            value={data.latitude}
                            onChange={(e) => setData('latitude', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="35.0°"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Longitude</label>
                        <input
                            type="number"
                            step="0.000001"
                            value={data.longitude}
                            onChange={(e) => setData('longitude', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="-5.0°"
                        />
                    </div>
                </div>

                {/* Description */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                        value={data.description}
                        onChange={(e) => setData('description', e.target.value)}
                        rows="5"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Describe your driving school..."
                    />
                    {errors.description && <p className="text-red-600 text-sm mt-1">{errors.description}</p>}
                </div>

                {/* Submit Button */}
                <div className="flex justify-end gap-4">
                    <button
                        type="submit"
                        disabled={processing}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                    >
                        {processing ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
}
