import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';

const stars = (n) => '★'.repeat(n) + '☆'.repeat(5 - n);

function StatusBadge({ status }) {
    const cls = { approved: 'badge badge-green', rejected: 'badge badge-red', pending: 'badge badge-yellow' };
    const labels = { approved: 'Approuvé', rejected: 'Refusé', pending: 'En attente' };
    return <span className={cls[status] ?? 'badge badge-gray'}>{labels[status] ?? status}</span>;
}

export default function Reviews({ reviews, filters }) {
    const { flash } = usePage().props;
    const [status, setStatus] = useState(filters.status ?? 'all');

    const applyFilter = (s) => {
        setStatus(s);
        router.get(route('admin.reviews.index'), { status: s }, { preserveState: true, replace: true });
    };

    const approve = (review) => {
        router.post(route('admin.reviews.approve', review.id), {}, { preserveScroll: true });
    };

    const reject = (review) => {
        router.post(route('admin.reviews.reject', review.id), {}, { preserveScroll: true });
    };

    const remove = (review) => {
        if (confirm('Supprimer cet avis ?')) {
            router.delete(route('admin.reviews.destroy', review.id), { preserveScroll: true });
        }
    };

    return (
        <AdminLayout title="Avis">
            <Head title="Admin — Avis" />

            {flash?.success && (
                <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm border border-green-200">{flash.success}</div>
            )}

            <div className="bg-white rounded-xl border border-gray-200">
                <div className="p-5 border-b border-gray-100 flex gap-2 flex-wrap">
                    {['all', 'pending', 'approved', 'rejected'].map((s) => (
                        <button
                            key={s}
                            onClick={() => applyFilter(s)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                status === s ? 'bg-orange-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            {s === 'all' ? 'Tous' : s === 'pending' ? 'En attente' : s === 'approved' ? 'Approuvés' : 'Refusés'}
                        </button>
                    ))}
                </div>

                <div className="divide-y divide-gray-100">
                    {reviews.data.map((review) => (
                        <div key={review.id} className="p-5">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-yellow-500 text-sm">{stars(review.rating)}</span>
                                        <StatusBadge status={review.status} />
                                    </div>
                                    <p className="font-medium text-gray-900 mb-1">{review.title}</p>
                                    <p className="text-sm text-gray-600 line-clamp-2">{review.content}</p>
                                    <div className="mt-2 flex items-center gap-3 text-xs text-gray-400">
                                        <span>Par <strong>{review.user?.name}</strong></span>
                                        <span>·</span>
                                        <span>Auto-école : <strong>{review.auto_school?.name}</strong></span>
                                        <span>·</span>
                                        <span>{new Date(review.created_at).toLocaleDateString('fr-FR')}</span>
                                    </div>
                                </div>
                                <div className="flex gap-1 shrink-0">
                                    {review.status !== 'approved' && (
                                        <button onClick={() => approve(review)} className="text-xs px-2 py-1 rounded bg-green-50 text-green-700 hover:bg-green-100 font-medium">
                                            Approuver
                                        </button>
                                    )}
                                    {review.status !== 'rejected' && (
                                        <button onClick={() => reject(review)} className="text-xs px-2 py-1 rounded bg-red-50 text-red-700 hover:bg-red-100 font-medium">
                                            Refuser
                                        </button>
                                    )}
                                    <button onClick={() => remove(review)} className="text-xs px-2 py-1 rounded bg-gray-50 text-gray-600 hover:bg-red-50 hover:text-red-600 font-medium">
                                        Supprimer
                                    </button>
                                </div>
                            </div>
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
        </AdminLayout>
    );
}
