import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';

export default function DashboardPage({ auth, school, plans }) {
    const { data, setData, put, processing } = useForm({
        name: school?.name || '',
        email: school?.email || '',
        phone: school?.phone || '',
        address: school?.address || '',
        city: school?.city || '',
        description: school?.description || '',
    });

    const handleUpdate = (e) => {
        e.preventDefault();
        put(`/api/v1/auto-schools/${school.id}`, {
            onSuccess: () => alert('Mise à jour réussie!')
        });
    };

    if (!school) {
        return (
            <>
                <Head title="Tableau de bord" />
                <div className="min-h-screen bg-gray-50 py-12">
                    <div className="container mx-auto px-4">
                        <h1 className="text-4xl font-bold mb-8">Tableau de bord</h1>
                        <p className="text-gray-600">Vous n'avez pas encore d'auto-école. <a href="/register-school" className="text-blue-600 font-bold">Créez-en une maintenant.</a></p>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Head title="Tableau de bord" />
            
            <div className="min-h-screen bg-gray-50 py-12">
                <div className="container mx-auto px-4">
                    <h1 className="text-4xl font-bold mb-8">Tableau de bord - {school.name}</h1>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {/* Stats */}
                        <div className="bg-white rounded-lg shadow-lg p-6">
                            <h3 className="text-lg font-bold mb-2">Vues</h3>

                            <p className="text-4xl font-bold text-blue-600">
                                {school.views_count ?? 0}
                            </p>
                        </div>

                        <div className="bg-white rounded-lg shadow-lg p-6">
                            <h3 className="text-lg font-bold mb-2">Clics</h3>

                            <p className="text-4xl font-bold text-green-600">
                                {school.clicks_count ?? 0}
                            </p>
                        </div>

                        <div className="bg-white rounded-lg shadow-lg p-6">
                            <h3 className="text-lg font-bold mb-2">Avis</h3>
                            <p className="text-4xl font-bold text-blue-600">{school.review_count}</p>
                        </div>

                        <div className="bg-white rounded-lg shadow-lg p-6">
                            <h3 className="text-lg font-bold mb-2">
                                Note Moyenne
                            </h3>

                            <p className="text-4xl font-bold text-yellow-500">
                                {school.reviews_avg_rating
                                    ? Number(school.reviews_avg_rating).toFixed(1)
                                    : 0}
                                ⭐
                            </p>
                        </div>

                        <div className="bg-white rounded-lg shadow-lg p-6">
                            <h3 className="text-lg font-bold mb-2">Inscription</h3>
                            <p className="text-4xl font-bold text-blue-600">{school.subscription?.plan?.name || 'Gratuit'}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                        {/* Edit School Form */}
                        <div className="bg-white rounded-lg shadow-lg p-6">
                            <h2 className="text-2xl font-bold mb-6">Modifier les informations</h2>
                            
                            <form onSubmit={handleUpdate} className="space-y-4">
                                <div>
                                    <label className="block font-bold mb-2">Nom</label>
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className="w-full px-4 py-2 border rounded-lg"
                                    />
                                </div>

                                <div>
                                    <label className="block font-bold mb-2">Email</label>
                                    <input
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        className="w-full px-4 py-2 border rounded-lg"
                                    />
                                </div>

                                <div>
                                    <label className="block font-bold mb-2">Téléphone</label>
                                    <input
                                        type="tel"
                                        value={data.phone}
                                        onChange={(e) => setData('phone', e.target.value)}
                                        className="w-full px-4 py-2 border rounded-lg"
                                    />
                                </div>

                                <div>
                                    <label className="block font-bold mb-2">Adresse</label>
                                    <input
                                        type="text"
                                        value={data.address}
                                        onChange={(e) => setData('address', e.target.value)}
                                        className="w-full px-4 py-2 border rounded-lg"
                                    />
                                </div>

                                <div>
                                    <label className="block font-bold mb-2">Ville</label>
                                    <input
                                        type="text"
                                        value={data.city}
                                        onChange={(e) => setData('city', e.target.value)}
                                        className="w-full px-4 py-2 border rounded-lg"
                                    />
                                </div>

                                <div>
                                    <label className="block font-bold mb-2">Description</label>
                                    <textarea
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        rows="4"
                                        className="w-full px-4 py-2 border rounded-lg"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 disabled:bg-gray-400"
                                >
                                    {processing ? 'Mise à jour...' : 'Mettre à jour'}
                                </button>
                            </form>
                        </div>

                        {/* Subscription Panel */}
                        <div className="bg-white rounded-lg shadow-lg p-6">
                            <h2 className="text-2xl font-bold mb-6">Abonnement</h2>
                            
                            <div className="space-y-4">
                                <div className="border rounded-lg p-4">
                                    <p className="text-gray-600 text-sm">Plan actuel</p>
                                    <p className="text-2xl font-bold">{school.subscription?.plan?.name || 'Gratuit'}</p>
                                    {school.subscription && (
                                        <p className="text-gray-600 text-sm mt-2">
                                            Expire le: {new Date(school.subscription.expires_at).toLocaleDateString('fr-FR')}
                                        </p>
                                    )}
                                </div>

                                <h3 className="font-bold mt-6 mb-3">Disponibles:</h3>
                                <div className="space-y-3">
                                    {plans.map(plan => (
                                        <button
                                            key={plan.id}
                                            className="w-full border rounded-lg p-4 hover:bg-blue-50 text-left"
                                        >
                                            <p className="font-bold">{plan.name}</p>
                                            <p className="text-blue-600 font-bold">{plan.price} DH/mois</p>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}