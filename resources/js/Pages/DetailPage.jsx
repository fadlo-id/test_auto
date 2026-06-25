import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';

export default function DetailPage({ school }) {
    const [showReviewForm, setShowReviewForm] = useState(false);
    const { data, setData, post, processing } = useForm({
        rating: 5,
        title: '',
        content: '',
    });

    const handleSubmitReview = (e) => {
        e.preventDefault();
        post(`/api/v1/auto-schools/${school.id}/reviews`, {
            onSuccess: () => {
                setShowReviewForm(false);
                setData({ rating: 5, title: '', content: '' });
            }
        });
    };

    return (
        <>
            <Head title={school.name} />
            
            <div className="min-h-screen bg-white">
                {/* Header Banner */}
                {school.banner_url && (
                    <div className="relative h-80 bg-gray-300">
                        <img src={school.banner_url} alt={school.name} className="w-full h-full object-cover" />
                    </div>
                )}

                <div className="container mx-auto px-4 py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Content */}
                        <div className="lg:col-span-2">
                            {/* Title & Logo */}
                            <div className="flex items-start gap-6 mb-8">
                                {school.logo_url && (
                                    <img src={school.logo_url} alt={school.name} className="h-24 w-24 rounded-lg" />
                                )}
                                
                                <div>
                                    <h1 className="text-4xl font-bold mb-2">{school.name}</h1>
                                    <p className="text-gray-600">📍 {school.address}, {school.city}</p>
                                    
                                    {/* Rating */}
                                    <div className="flex items-center mt-4">
                                        <div className="flex text-yellow-400 text-2xl">
                                            {[...Array(5)].map((_, i) => (
                                                <span key={i}>
                                                    {i < Math.round(school.average_rating) ? '★' : '☆'}
                                                </span>
                                            ))}
                                        </div>
                                        <span className="ml-2 text-gray-600">
                                            {(school.average_rating ?? 0).toFixed(1)}/5 ({school.review_count ?? 0} avis)
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="mb-8">
                                <h2 className="text-2xl font-bold mb-4">À propos</h2>
                                <p className="text-gray-700 leading-relaxed">{school.description}</p>
                            </div>

                            {/* Services */}
                            {school.services && school.services.length > 0 && (
                                <div className="mb-8">
                                    <h2 className="text-2xl font-bold mb-4">Services</h2>
                                    <div className="space-y-4">
                                        {school.services.map(service => (
                                            <div key={service.id} className="border rounded-lg p-4">
                                                <h3 className="font-bold text-lg">{service.name}</h3>
                                                <p className="text-gray-600 text-sm mb-2">{service.description}</p>
                                                <p className="text-blue-600 font-bold">{service.price} DH</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Reviews */}
                            <div>
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-bold">Avis</h2>
                                    <button
                                        onClick={() => setShowReviewForm(!showReviewForm)}
                                        className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold"
                                    >
                                        Laisser un avis
                                    </button>
                                </div>

                                {/* Review Form */}
                                {showReviewForm && (
                                    <form onSubmit={handleSubmitReview} className="bg-gray-50 p-6 rounded-lg mb-8">
                                        <div className="mb-4">
                                            <label className="block font-bold mb-2">Note</label>
                                            <select
                                                value={data.rating}
                                                onChange={(e) => setData('rating', parseInt(e.target.value))}
                                                className="w-full px-4 py-2 border rounded-lg"
                                            >
                                                {[1, 2, 3, 4, 5].map(r => (
                                                    <option key={r} value={r}>{r} ⭐</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="mb-4">
                                            <label className="block font-bold mb-2">Titre</label>
                                            <input
                                                type="text"
                                                value={data.title}
                                                onChange={(e) => setData('title', e.target.value)}
                                                className="w-full px-4 py-2 border rounded-lg"
                                                placeholder="Résumé de votre avis"
                                            />
                                        </div>

                                        <div className="mb-4">
                                            <label className="block font-bold mb-2">Commentaire</label>
                                            <textarea
                                                value={data.content}
                                                onChange={(e) => setData('content', e.target.value)}
                                                className="w-full px-4 py-2 border rounded-lg"
                                                rows="4"
                                                placeholder="Partagez votre expérience..."
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={processing}
                                            className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 disabled:bg-gray-400"
                                        >
                                            {processing ? 'Envoi...' : 'Publier votre avis'}
                                        </button>
                                    </form>
                                )}

                                {/* Reviews List */}
                                <div className="space-y-4">
                                    {school.reviews && school.reviews.map(review => (
                                        <div key={review.id} className="border rounded-lg p-4">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <p className="font-bold">{review.user?.name}</p>
                                                    <p className="text-yellow-400">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</p>
                                                </div>
                                                <p className="text-gray-500 text-sm">
                                                    {new Date(review.created_at).toLocaleDateString('fr-FR')}
                                                </p>
                                            </div>
                                            <h4 className="font-bold text-lg mb-1">{review.title}</h4>
                                            <p className="text-gray-700">{review.content}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <aside className="lg:col-span-1">
                            {/* Contact Card */}
                            <div className="bg-white rounded-lg shadow-lg p-6 mb-6 sticky top-20">
                                <h3 className="text-xl font-bold mb-4">Contact</h3>
                                <div className="space-y-3">
                                    <p><strong>Email:</strong> {school.email}</p>
                                    <p><strong>Téléphone:</strong> {school.phone}</p>
                                    {school.website_url && (
                                        <p><strong>Site:</strong> <a href={school.website_url} target="_blank" rel="noopener noreferrer" className="text-blue-600">{school.website_url}</a></p>
                                    )}
                                </div>
                                
                                <a
                                    href={`https://wa.me/${school.phone.replace(/\s/g, '')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block w-full mt-4 bg-green-500 text-white text-center py-2 rounded-lg font-bold hover:bg-green-600"
                                >
                                    Contacter via WhatsApp
                                </a>
                            </div>

                            {/* Categories Card */}
                            <div className="bg-white rounded-lg shadow-lg p-6">
                                <h3 className="text-xl font-bold mb-4">Permis disponibles</h3>
                                <div className="flex flex-wrap gap-2">
                                    {school.categories && school.categories.map(cat => (
                                        <span key={cat.id} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-bold text-lg">
                                            {cat.code}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </aside>
                    </div>
                </div>
            </div>
        </>
    );
}