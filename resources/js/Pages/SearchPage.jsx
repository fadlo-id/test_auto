import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';

export default function SearchPage({ schools, cities = [] }) {
    const [filters, setFilters] = useState({
        search: '',
        city: '',
    });

    const handleSearch = () => {
        router.get('/search', filters);
    };

    return (
        <>
            <Head title="Rechercher une auto-école" />
            
            <div className="min-h-screen bg-gray-50 py-12">
                <div className="container mx-auto px-4">
                    <h1 className="text-4xl font-bold mb-8">Trouvez une Auto-École</h1>

                    {/* Search Bar */}
                    <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <input
                                type="text"
                                placeholder="Nom ou adresse..."
                                value={filters.search}
                                onChange={(e) => setFilters({...filters, search: e.target.value})}
                                className="px-4 py-2 border border-gray-300 rounded-lg"
                            />
                            
                            <select
                                value={filters.city}
                                onChange={(e) => setFilters({...filters, city: e.target.value})}
                                className="px-4 py-2 border border-gray-300 rounded-lg"
                            >
                                <option value="">Toutes les villes</option>
                                <option value="Casablanca">Casablanca</option>
                                <option value="Fès">Fès</option>
                                <option value="Marrakech">Marrakech</option>
                                <option value="Tanger">Tanger</option>
                                <option value="Agadir">Agadir</option>
                            </select>

                            <button
                                onClick={handleSearch}
                                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700"
                            >
                                Rechercher
                            </button>
                        </div>
                    </div>

                    {/* Schools Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {schools && schools.data && schools.data.map(school => (
                            <div key={school.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition">
                                {school.banner_url && (
                                    <img src={school.banner_url} alt={school.name} className="w-full h-40 object-cover" />
                                )}
                                
                                <div className="p-6">
                                    <h2 className="text-xl font-bold mb-2">{school.name}</h2>
                                    <p className="text-gray-600 text-sm mb-4">📍 {school.city}</p>

                                    {/* Rating */}
                                    <div className="flex items-center mb-4">
                                        <div className="flex text-yellow-400">
                                            {[...Array(5)].map((_, i) => (
                                                <span key={i}>
                                                    {i < Math.round(school.average_rating) ? '★' : '☆'}
                                                </span>
                                            ))}
                                        </div>
                                        <span className="text-sm text-gray-600 ml-2">
                                            ({school.review_count})
                                        </span>
                                    </div>

                                    {/* Categories */}
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {school.categories && school.categories.map(cat => (
                                            <span key={cat.id} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                                {cat.code}
                                            </span>
                                        ))}
                                    </div>

                                    {/* Contact */}
                                    <a href={`/school/${school.slug}`} className="block w-full bg-blue-600 text-white text-center py-2 rounded-lg font-bold hover:bg-blue-700">
                                        Voir détails
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}