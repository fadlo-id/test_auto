import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import SchoolLayout from '@/Layouts/SchoolLayout';

const stars = (n) => '★'.repeat(n) + '☆'.repeat(5 - n);

function StatusBadge({ status }) {
    const map = { approved: 'bg-green-100 text-green-700', rejected: 'bg-red-100 text-red-700', pending: 'bg-yellow-100 text-yellow-700' };
    const labels = { approved: 'Approuvé', rejected: 'Refusé', pending: 'En attente' };
    return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${map[status] ?? 'bg-gray-100 text-gray-600'}`}>{labels[status] ?? status}</span>;
}

export default function Reviews({ school, reviews, filters }) {
    const { flash } = usePage().props;
    const [status, setStatus] = useState(filters.status ?? 'all');

    const applyFilter = (s) => {
        setStatus(s);
        router.get(route('school.reviews'), { status: s }, { preserveState: true, replace: true });
    };

    return (
        <SchoolLayout title="Avis" school={school}>
            <Head title="Mes avis" />

            {flash?.success && <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm border border-green-200">{flash.success}</div>}

            <div className="bg-white rounded-xl border border-gray-200">
                <div className="p-5 border-b border-gray-100 flex gap-2 flex-wrap">
                    {['all', 'pending', 'approved', 'rejected'].map((s) => (
                        <button key={s} onClick={() => applyFilter(s)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${status === s ? 'bg-orange-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                            {s === 'all' ? 'Tous' : s === 'pending' ? 'En attente' : s === 'approved' ? 'Approuvés' : 'Refusés'}
                        </button>
                    ))}
                </div>

                <div className="divide-y divide-gray-100">
                    {reviews.data.map((review) => (
                        <div key={review.id} className="p-5">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-yellow-500 text-sm">{stars(review.rating)}</span>
                                <StatusBadge status={review.status} />
                                <span className="text-xs text-gray-400 ml-auto">{new Date(review.created_at).toLocaleDateString('fr-FR')}</span>
                            </div>
                            <p className="font-medium text-gray-900 mb-1">{review.title}</p>
                            <p className="text-sm text-gray-600">{review.content}</p>
                            <p className="text-xs text-gray-400 mt-2">Par {review.user?.name}</p>
                        </div>
                    ))}
                    {reviews.data.length === 0 && (
                        <div className="p-10 text-center text-gray-400">Aucun avis trouvé</div>
                    )}
                </div>

                {reviews.links && (
                    <div className="p-4 border-t border-gray-100 flex gap-1 justify-center">
                        {reviews.links.map((link, i) => (
                            <Link key={i} href={link.url ?? '#'} dangerouslySetInnerHTML={{ __html: link.label }}
                                className={`px-3 py-1.5 rounded text-sm ${link.active ? 'bg-orange-600 text-white' : link.url ? 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50' : 'bg-white border border-gray-100 text-gray-300 cursor-default'}`}
                                preserveScroll />
                        ))}
                    </div>
                )}
            </div>
        </SchoolLayout>
    );
}
