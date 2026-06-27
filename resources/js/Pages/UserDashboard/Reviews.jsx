import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import UserLayout from '@/Layouts/UserLayout';

const STATUS_TABS = [
    { value: 'all',      label: 'Tous' },
    { value: 'pending',  label: 'En attente' },
    { value: 'approved', label: 'Approuvés' },
    { value: 'rejected', label: 'Refusés' },
];

function StarRating({ value }) {
    return (
        <span className="text-sm">
            {[1,2,3,4,5].map(i => <span key={i} className={i <= value ? 'text-yellow-400' : 'text-gray-200'}>★</span>)}
        </span>
    );
}

export default function Reviews({ reviews, filters }) {
    const active = filters?.status ?? 'all';

    const setStatus = (s) => {
        router.get(route('user.reviews'), s === 'all' ? {} : { status: s }, { preserveState: true });
    };

    // Reviews cannot be deleted from user portal — they can be managed from the school detail page

    return (
        <UserLayout title="Mes avis">
            <Head title="Mes avis" />

            {/* Status tabs */}
            <div className="flex gap-1 mb-6 bg-white rounded-xl border border-gray-200 p-1 w-fit">
                {STATUS_TABS.map(t => (
                    <button key={t.value} onClick={() => setStatus(t.value)}
                        className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                            active === t.value ? 'bg-orange-600 text-white' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                        }`}>
                        {t.label}
                    </button>
                ))}
            </div>

            <div className="space-y-4">
                {reviews.data?.length > 0 ? (
                    reviews.data.map(r => (
                        <div key={r.id} className="bg-white rounded-xl border border-gray-200 p-5">
                            <div className="flex items-start gap-4">
                                <div className="w-11 h-11 bg-orange-100 rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0">
                                    {r.auto_school?.logo_url
                                        ? <img src={`/storage/${r.auto_school.logo_url}`} alt="" className="w-full h-full object-cover" />
                                        : <span className="text-orange-500">🏫</span>}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2 flex-wrap">
                                        <div>
                                            <Link href={route('school.detail', r.auto_school?.slug ?? '')}
                                                className="font-semibold text-gray-900 hover:text-orange-600 text-sm">
                                                {r.auto_school?.name}
                                            </Link>
                                            <p className="text-xs text-gray-400">📍 {r.auto_school?.city}</p>
                                        </div>
                                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                                            r.status === 'approved' ? 'bg-green-100 text-green-700'
                                            : r.status === 'rejected' ? 'bg-red-100 text-red-700'
                                            : 'bg-yellow-100 text-yellow-700'
                                        }`}>
                                            {r.status === 'approved' ? 'Approuvé' : r.status === 'rejected' ? 'Refusé' : 'En attente'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 mt-2">
                                        <StarRating value={r.rating} />
                                        <p className="font-medium text-sm text-gray-900">{r.title}</p>
                                    </div>
                                    {r.content && <p className="text-sm text-gray-600 mt-1 line-clamp-2">{r.content}</p>}
                                    {r.status === 'rejected' && r.rejection_reason && (
                                        <p className="mt-2 text-xs text-red-600 bg-red-50 px-3 py-1.5 rounded-lg">
                                            Motif : {r.rejection_reason}
                                        </p>
                                    )}
                                    <p className="text-xs text-gray-400 mt-2">
                                        {new Date(r.created_at).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="bg-white rounded-xl border border-gray-200 py-16 text-center">
                        <p className="text-3xl mb-3">⭐</p>
                        <p className="text-gray-500 font-medium">Aucun avis dans cette catégorie</p>
                        <Link href={route('search')} className="mt-4 inline-block text-sm text-orange-600 hover:underline">
                            Trouver une auto-école pour laisser un avis →
                        </Link>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {reviews.last_page > 1 && (
                <div className="flex justify-center gap-2 mt-6">
                    {reviews.links?.map((link, i) => (
                        <button key={i} disabled={!link.url}
                            onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium border ${
                                link.active ? 'bg-orange-600 text-white border-orange-600'
                                : link.url ? 'border-gray-200 text-gray-700 hover:border-orange-400'
                                : 'border-gray-100 text-gray-300 cursor-not-allowed'
                            }`}
                            dangerouslySetInnerHTML={{ __html: link.label }} />
                    ))}
                </div>
            )}
        </UserLayout>
    );
}
