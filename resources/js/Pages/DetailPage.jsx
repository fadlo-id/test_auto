import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';

function StarRating({ value = 0, interactive = false, onChange }) {
    const [hover, setHover] = useState(0);
    const display = interactive ? (hover || value) : Math.round(value);
    return (
        <span className={interactive ? 'cursor-pointer' : ''}>
            {[1, 2, 3, 4, 5].map((i) => (
                <span
                    key={i}
                    className={`text-xl ${i <= display ? 'text-yellow-400' : 'text-gray-300'} ${interactive ? 'hover:text-yellow-400' : ''}`}
                    onMouseEnter={interactive ? () => setHover(i) : undefined}
                    onMouseLeave={interactive ? () => setHover(0) : undefined}
                    onClick={interactive ? () => onChange(i) : undefined}
                >
                    ★
                </span>
            ))}
        </span>
    );
}

function ReviewCard({ review }) {
    return (
        <div className="bg-white border border-gray-100 rounded-xl p-4">
            <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                    <p className="font-semibold text-gray-900 text-sm">{review.user?.name ?? 'Utilisateur'}</p>
                    <StarRating value={review.rating} />
                </div>
                <span className="text-xs text-gray-400 whitespace-nowrap">
                    {new Date(review.created_at).toLocaleDateString('fr-FR')}
                </span>
            </div>
            {review.title && <p className="font-medium text-gray-800 text-sm mb-1">{review.title}</p>}
            {review.content && <p className="text-gray-600 text-sm leading-relaxed">{review.content}</p>}
        </div>
    );
}

export default function DetailPage({ school, ratingBreakdown = {}, canReview = false }) {
    const { auth, flash } = usePage().props;
    const [showForm, setShowForm] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        rating: 5,
        title: '',
        content: '',
    });

    const submitReview = (e) => {
        e.preventDefault();
        post(route('school.detail.review', school.slug), {
            onSuccess: () => { setShowForm(false); reset(); },
        });
    };

    const phone = school.phone?.replace(/\s/g, '') ?? '';
    const totalReviews = school.reviews_count ?? school.review_count ?? 0;

    return (
        <>
            <Head title={school.name} />

            {/* Navbar */}
            <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
                <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-3">
                    <Link href={route('home')} className="font-bold text-orange-600 text-base">
                        AutoEcoles<span className="text-gray-900">.ma</span>
                    </Link>
                    <span className="text-gray-300">/</span>
                    <Link href={route('search')} className="text-sm text-gray-500 hover:text-orange-600">Recherche</Link>
                    <span className="text-gray-300">/</span>
                    <span className="text-sm text-gray-700 truncate max-w-xs">{school.name}</span>
                </div>
            </header>

            {/* Banner */}
            <div className="h-52 sm:h-72 bg-gradient-to-br from-orange-100 to-orange-50 overflow-hidden">
                {school.banner_url
                    ? <img src={`/storage/${school.banner_url}`} alt={school.name} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-orange-300 text-6xl">🏫</div>}
            </div>

            <div className="max-w-6xl mx-auto px-4 py-8">
                {flash?.success && (
                    <div className="mb-6 p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">{flash.success}</div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Header */}
                        <div className="flex items-start gap-4">
                            <div className="w-16 h-16 rounded-xl bg-white border border-gray-200 shadow-sm overflow-hidden flex-shrink-0 flex items-center justify-center">
                                {school.logo_url
                                    ? <img src={`/storage/${school.logo_url}`} alt="" className="w-full h-full object-cover" />
                                    : <span className="text-orange-400 text-3xl">🚗</span>}
                            </div>
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">{school.name}</h1>
                                <p className="text-gray-500 text-sm mb-2">📍 {school.address}, {school.city}</p>
                                <div className="flex items-center gap-2">
                                    <StarRating value={school.average_rating} />
                                    <span className="text-sm text-gray-600">
                                        {Number(school.average_rating ?? 0).toFixed(1)}/5
                                    </span>
                                    <span className="text-sm text-gray-400">({totalReviews} avis)</span>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        {school.description && (
                            <div className="bg-white rounded-xl border border-gray-100 p-5">
                                <h2 className="font-semibold text-gray-900 mb-3">A propos</h2>
                                <p className="text-gray-600 text-sm leading-relaxed">{school.description}</p>
                            </div>
                        )}

                        {/* Categories */}
                        {school.categories?.length > 0 && (
                            <div className="bg-white rounded-xl border border-gray-100 p-5">
                                <h2 className="font-semibold text-gray-900 mb-3">Permis disponibles</h2>
                                <div className="flex flex-wrap gap-2">
                                    {school.categories.map((cat) => (
                                        <span key={cat.id} className="px-4 py-1.5 bg-orange-50 text-orange-700 rounded-full font-bold text-sm border border-orange-100">
                                            Permis {cat.code}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Services */}
                        {school.services?.length > 0 && (
                            <div className="bg-white rounded-xl border border-gray-100 p-5">
                                <h2 className="font-semibold text-gray-900 mb-3">Services</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {school.services.map((service) => (
                                        <div key={service.id} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                                            <div className="flex items-center justify-between mb-1">
                                                <p className="font-medium text-gray-900 text-sm">{service.name}</p>
                                                <span className="text-orange-600 font-bold text-sm">{Number(service.price).toLocaleString()} MAD</span>
                                            </div>
                                            {service.description && <p className="text-xs text-gray-500">{service.description}</p>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Reviews */}
                        <div className="bg-white rounded-xl border border-gray-100 p-5">
                            <div className="flex items-center justify-between mb-5">
                                <h2 className="font-semibold text-gray-900">Avis ({totalReviews})</h2>
                                {canReview && !showForm && (
                                    <button onClick={() => setShowForm(true)}
                                        className="text-sm px-3 py-1.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700">
                                        Laisser un avis
                                    </button>
                                )}
                                {!auth?.user && (
                                    <Link href={route('login')} className="text-sm text-orange-600 hover:underline">
                                        Connectez-vous pour noter
                                    </Link>
                                )}
                            </div>

                            {showForm && (
                                <form onSubmit={submitReview} className="mb-6 p-4 bg-orange-50 border border-orange-100 rounded-xl space-y-3">
                                    <h3 className="font-medium text-gray-900 text-sm mb-2">Votre avis</h3>
                                    <div>
                                        <StarRating value={data.rating} interactive onChange={(v) => setData('rating', v)} />
                                        {errors.rating && <p className="text-red-500 text-xs mt-1">{errors.rating}</p>}
                                    </div>
                                    <div>
                                        <input type="text" value={data.title} onChange={(e) => setData('title', e.target.value)}
                                            placeholder="Titre de votre avis"
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
                                    </div>
                                    <div>
                                        <textarea value={data.content} onChange={(e) => setData('content', e.target.value)}
                                            placeholder="Partagez votre experience..." rows={3}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
                                        {errors.content && <p className="text-red-500 text-xs mt-1">{errors.content}</p>}
                                    </div>
                                    <div className="flex gap-2">
                                        <button type="submit" disabled={processing}
                                            className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 disabled:opacity-50">
                                            {processing ? 'Envoi...' : 'Publier'}
                                        </button>
                                        <button type="button" onClick={() => setShowForm(false)}
                                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50">
                                            Annuler
                                        </button>
                                    </div>
                                </form>
                            )}

                            <div className="space-y-3">
                                {school.reviews?.length > 0
                                    ? school.reviews.map((r) => <ReviewCard key={r.id} review={r} />)
                                    : <p className="text-gray-400 text-sm text-center py-6">Aucun avis pour le moment. Soyez le premier !</p>}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <aside className="lg:col-span-1 space-y-4">
                        <div className="bg-white rounded-xl border border-gray-100 p-5 sticky top-20">
                            <h3 className="font-semibold text-gray-900 mb-4">Contact</h3>
                            <div className="space-y-2 mb-4">
                                {school.phone && (
                                    <a href={`tel:${phone}`} className="flex items-center gap-2 text-sm text-gray-600 hover:text-orange-600">
                                        <span>📞</span> {school.phone}
                                    </a>
                                )}
                                {school.email && (
                                    <a href={`mailto:${school.email}`} className="flex items-center gap-2 text-sm text-gray-600 hover:text-orange-600">
                                        <span>✉️</span> {school.email}
                                    </a>
                                )}
                                {school.website_url && (
                                    <a href={school.website_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-orange-600 hover:underline">
                                        <span>🌐</span> Site web
                                    </a>
                                )}
                                {school.facebook_url && (
                                    <a href={school.facebook_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-blue-600 hover:underline">
                                        <span>📘</span> Facebook
                                    </a>
                                )}
                                {school.instagram_url && (
                                    <a href={school.instagram_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-pink-600 hover:underline">
                                        <span>📸</span> Instagram
                                    </a>
                                )}
                            </div>

                            {phone && (
                                <a href={`https://wa.me/212${phone.replace(/^0/, '')}`} target="_blank" rel="noopener noreferrer"
                                    className="block w-full py-2.5 bg-green-500 text-white rounded-xl text-center text-sm font-medium hover:bg-green-600">
                                    Contacter sur WhatsApp
                                </a>
                            )}
                        </div>

                        {/* Rating breakdown */}
                        {totalReviews > 0 && (
                            <div className="bg-white rounded-xl border border-gray-100 p-5">
                                <h3 className="font-semibold text-gray-900 mb-3">Repartition des notes</h3>
                                {[5, 4, 3, 2, 1].map((star) => {
                                    const count = ratingBreakdown[star] ?? 0;
                                    const pct = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
                                    return (
                                        <div key={star} className="flex items-center gap-2 mb-1.5">
                                            <span className="text-xs text-gray-500 w-4">{star}</span>
                                            <span className="text-yellow-400 text-xs">★</span>
                                            <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                                                <div className="bg-yellow-400 h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                                            </div>
                                            <span className="text-xs text-gray-400 w-6">{count}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </aside>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-gray-900 text-gray-400 py-6 px-4 mt-12">
                <div className="max-w-6xl mx-auto text-center">
                    <p className="text-xs">© 2026 AutoEcoles.ma — Tous droits reserves.</p>
                </div>
            </footer>
        </>
    );
}
