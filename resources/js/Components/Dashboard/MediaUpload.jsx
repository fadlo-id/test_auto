import React, { useState } from 'react';
import axios from 'axios';

export default function MediaUpload({ school, onSuccess, onError }) {
    const [uploading, setUploading] = useState(false);
    const [logoPreview, setLogoPreview] = useState(school?.logo ? `/storage/${school.logo}` : null);
    const [bannerPreview, setBannerPreview] = useState(school?.banner ? `/storage/${school.banner}` : null);

    const handleLogoUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Preview
        const reader = new FileReader();
        reader.onloadend = () => setLogoPreview(reader.result);
        reader.readAsDataURL(file);

        // Upload
        const formData = new FormData();
        formData.append('logo', file);

        setUploading(true);
        try {
            await axios.post(`/api/v1/school/${school.id}/upload-logo`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            onSuccess();
        } catch (error) {
            onError(error.response?.data?.message || 'Error uploading logo');
            setLogoPreview(school?.logo ? `/storage/${school.logo}` : null);
        } finally {
            setUploading(false);
        }
    };

    const handleBannerUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Preview
        const reader = new FileReader();
        reader.onloadend = () => setBannerPreview(reader.result);
        reader.readAsDataURL(file);

        // Upload
        const formData = new FormData();
        formData.append('banner', file);

        setUploading(true);
        try {
            await axios.post(`/api/v1/school/${school.id}/upload-banner`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            onSuccess();
        } catch (error) {
            onError(error.response?.data?.message || 'Error uploading banner');
            setBannerPreview(school?.banner ? `/storage/${school.banner}` : null);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="p-6 space-y-8">
            <h2 className="text-2xl font-bold">Upload Media</h2>

            {/* Logo Upload */}
            <div>
                <h3 className="text-lg font-semibold mb-4">School Logo</h3>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition cursor-pointer">
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        disabled={uploading}
                        className="hidden"
                        id="logo-input"
                    />
                    <label htmlFor="logo-input" className="cursor-pointer">
                        {logoPreview ? (
                            <div className="space-y-4">
                                <img src={logoPreview} alt="Logo preview" className="w-32 h-32 object-contain mx-auto rounded" />
                                <p className="text-sm text-gray-600">Click to change</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <p className="text-3xl">🖼️</p>
                                <p className="text-gray-600">Drag and drop your logo here or click to select</p>
                                <p className="text-xs text-gray-500">PNG, JPG or GIF (MAX. 5MB)</p>
                            </div>
                        )}
                    </label>
                </div>
            </div>

            {/* Banner Upload */}
            <div>
                <h3 className="text-lg font-semibold mb-4">School Banner</h3>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition cursor-pointer">
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleBannerUpload}
                        disabled={uploading}
                        className="hidden"
                        id="banner-input"
                    />
                    <label htmlFor="banner-input" className="cursor-pointer">
                        {bannerPreview ? (
                            <div className="space-y-4">
                                <img src={bannerPreview} alt="Banner preview" className="w-full h-40 object-cover rounded" />
                                <p className="text-sm text-gray-600">Click to change</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <p className="text-3xl">🎨</p>
                                <p className="text-gray-600">Drag and drop your banner here or click to select</p>
                                <p className="text-xs text-gray-500">PNG, JPG or GIF (MAX. 10MB)</p>
                            </div>
                        )}
                    </label>
                </div>
            </div>

            {uploading && (
                <div className="flex items-center justify-center p-4 bg-blue-50 rounded-lg">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <p className="ml-3 text-blue-600">Uploading...</p>
                </div>
            )}
        </div>
    );
}
