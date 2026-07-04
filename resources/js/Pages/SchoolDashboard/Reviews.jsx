import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import SchoolLayout from '@/Layouts/SchoolLayout';

const stars = (n) => '★'.repeat(n) + '☆'.repeat(5 - n);

function StatusBadge({ status }) {
    const cls = { approved: 'bg-green-100 text-green-700', rejected: 'bg-red-100 text-red-700', pending: 'bg-yellow-100 text-yellow-700' };
    const labels = { approved: 'Approuve', rejected: 'Refuse', pending: 'En attente' };
    return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cls[status] ?? 'bg-gray-100 text-gray-600'}`}>{labels[status] ?? status}</span>;
}

function ReplySection({ review }) {
    const [editing, setEditing] = useState(false);
    const { data, setData, post, processing, reset } = useForm({ owner_reply: review.owner_reply ?? '' });

    const submit = (e) => {
        e.preventDefault();
        post(route('school.reviews.reply', review.id), {
            preserveScroll: true,
            onSuccess: () => setEditing(false),
        });
    };

    const deleteReply = () => {
        router.delete(route('school.reviews.reply.delete', review.id), { preserveScroll: true });
    };

    if (review.owner_reply && !editing) {
        return (
            <div className="mt-3 ml-4 pl-4 border-l-2 border-orange-200 bg-orange-50 rounded-r-lg p-3">
                <p className="text-xs font-medium text-orange-700 mb-1">Votre reponse</p>
                <p className="text-sm text-gray-700">{review.owner_reply}</p>
                <div className="mt-2 flex gap-2">
                    <button onClick={() => setEditing(true)} className="text-xs text-orange-600 hover:underline">Modifier</button>
                    <button onClick={deleteReply} className="text-xs text-red-500 hover:underline">Supprimer</button>
                </div>
            </div>
        );
    }

    if (review.status !== 'approved') return null;

    return (
        <div className="mt-3">
            {!editing ? (
                <button onClick={() => setEditing(true)} className="text-xs text-orange-600 hover:underline">
                    + Repondre a cet avis
                </button>
            ) : (
                <form onSubmit={submit} className="mt-2 space-y-2">
                    <textarea
                        value={data.owner_reply}
                        onChange={(e) => setData('owner_reply', e.target.value)}
                        rows={2}
                        placeholder="Votre reponse..."
                        className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                    <div className="flex gap-2">
                        <button type="submit" disabled={processing}
                            className="px-3 py-1.5 bg-orange-600 text-white rounded-lg text-xs font-medium hover:bg-orange-700 disabled:opacity-50">
                            {processing ? 'Envoi...' : 'Publier'}
                        </button>
                        <button type="button" onClick={() => { setEditing(false); reset(); }}
                            className="px-3 py-1.5 border border-gray-200 text-gray-600 rounded-lg text-xs hover:bg-gray-50">
                            Annuler
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
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
            {flash?.error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200">{flash.error}</div>}

            <div className="bg-white rounded-xl border border-gray-200">
                <div className="p-5 border-b border-gray-100 flex gap-2 flex-wrap">
                    {['all', 'pending', 'approved', 'rejected'].map((s) => (
                        <button key={s} onClick={() => applyFilter(s)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${status === s ? 'bg-orange-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                            {s === 'all' ? 'Tous' : s === 'pending' ? 'En attente' : s === 'approved' ? 'Approuves' : 'Refuses'}
                        </button>
                    ))}
                </div>

                <div className="divide-y divide-gray-100">
                    {reviews.data.map((review) => (
                        <div key={review.id} className="p-5">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-yellow-500 text-sm">{stars(review.rating)}</span>
                                <StatusBadge status={review.status} />
                                <span className="text-xs text-gray-400 ml-auto">
                                    {new Date(review.created_at).toLocaleDateString('fr-FR')}
                                </span>
                            </div>
                            {review.title && <p className="font-medium text-gray-900 mb-1">{review.title}</p>}
                            <p className="text-sm text-gray-600">{review.content}</p>
                            <p className="text-xs text-gray-400 mt-2">Par {review.user?.name}</p>
                            <ReplySection review={review} />
                        </div>
                    ))}
                    {reviews.data.length === 0 && (
                        <div className="p-10 text-center text-gray-400">Aucun avis trouve</div>
                    )}
                </div>

                {reviews.links?.length > 3 && (
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
