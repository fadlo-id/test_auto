import { Head } from '@inertiajs/react';
import SchoolLayout from '@/Layouts/SchoolLayout';

export default function Analytics({ school }) {
    return (
        <SchoolLayout title="Analytics" school={school}>
            <Head title="Analytics" />

            <div className="bg-white rounded-xl border border-gray-200 p-10 text-center text-gray-400">
                <div className="text-5xl mb-4">📈</div>
                <h3 className="text-lg font-medium text-gray-600 mb-2">Analytics avancées</h3>
                <p className="text-sm">
                    Les statistiques detaillees (vues, clics, leads) seront disponibles en Phase 10.
                </p>
            </div>
        </SchoolLayout>
    );
}
