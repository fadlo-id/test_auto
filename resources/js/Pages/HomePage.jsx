import React from 'react';
import { Head, Link } from '@inertiajs/react';

export default function HomePage({ plans }) {
    return (
        <>
            <Head title="AutoEcoles - Trouvez votre auto-école" />
            
            <div className="min-h-screen bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
                <div className="container mx-auto text-center">
                    <h1 className="text-5xl font-bold mb-6">
                        Trouvez la Meilleure Auto-École
                    </h1>
                    <p className="text-xl mb-8">
                        Comparez, lisez les avis et inscrivez-vous facilement
                    </p>
                    <Link href="/search" className="bg-white text-blue-600 px-8 py-3 rounded-lg font-bold text-lg">
                        Chercher une auto-école
                    </Link>
                </div>
            </div>

            {/* Pricing Section */}
            <div className="py-20 bg-gray-50">
                <div className="container mx-auto">
                    <h2 className="text-4xl font-bold text-center mb-12">Plans de Prix</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {plans.map(plan => (
                            <div key={plan.id} className="bg-white rounded-lg shadow-lg p-8">
                                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                                <p className="text-4xl font-bold text-blue-600 mb-4">
                                    {plan.price} <span className="text-lg">DH/mois</span>
                                </p>
                                
                                <ul className="space-y-2 mb-8">
                                    {Object.entries(plan.features).map(([key, value]) => (
                                        <li key={key} className="text-gray-600">
                                            ✓ {value === true ? key : value}
                                        </li>
                                    ))}
                                </ul>

                                <button className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700">
                                    Choisir
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}