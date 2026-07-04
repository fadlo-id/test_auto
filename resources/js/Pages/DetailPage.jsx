import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import PublicNavbar from '@/Components/PublicNavbar';
import PublicFooter from '@/Components/PublicFooter';
import Breadcrumb from '@/Components/Breadcrumb';
import { getFingerprint } from '@/utils/fingerprint';

/* ── Stars ─────────────────────────────────────────────────── */
function StarRating({ value = 0, interactive = false, onChange }) {
    const [hover, setHover] = useState(0);
    const display = interactive ? (hover || value) : Math.round(value);
    return (
        <span className={interactive ? 'cursor-pointer select-none' : ''}>
            {[1, 2, 3, 4, 5].map((i) => (
                <span key={i}
                    className={`text-xl ${i <= display ? 'text-yellow-400' : 'text-gray-200'}`}
                    onMouseEnter={interactive ? () => setHover(i) : undefined}
                    onMouseLeave={interactive ? () => setHover(0) : undefined}
                    onClick={interactive ? () => onChange(i) : undefined}>★</span>
            ))}
        </span>
    );
}

/* ── Review card ───────────────────────────────────────────── */
function ReviewCard({ review }) {
    return (
        <div className="bg-white border border-gray-100 rounded-2xl p-4 hover:border-orange-100 transition-colors">
            <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center text-orange-700 font-bold text-sm flex-shrink-0">
                        {review.user?.name?.[0]?.toUpperCase() ?? '?'}
                    </div>
                    <div>
                        <p className="font-semibold text-gray-900 text-sm">{review.user?.name ?? 'Utilisateur'}</p>
                        <StarRating value={review.rating} />
                    </div>
                </div>
                <span className="text-xs text-gray-400 whitespace-nowrap mt-1">
                    {new Date(review.created_at).toLocaleDateString('fr-FR')}
                </span>
            </div>
            {review.title && <p className="font-medium text-gray-800 text-sm mb-1">{review.title}</p>}
            {review.content && <p className="text-gray-600 text-sm leading-relaxed">{review.content}</p>}
            {review.owner_reply && (
                <div className="mt-3 ml-4 pl-3 border-l-2 border-orange-200 bg-orange-50 rounded-r-xl p-3">
                    <p className="text-xs font-semibold text-orange-700 mb-1">Réponse de l'auto-école</p>
                    <p className="text-sm text-gray-700 leading-relaxed">{review.owner_reply}</p>
                </div>
            )}
        </div>
    );
}

/* ── Booking form ──────────────────────────────────────────── */
function BookingForm({ school }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '', email: '', phone: '', permit_type: '', message: '', preferred_date: '',
    });
    const [submitted, setSubmitted] = useState(false);

    const submit = (e) => {
        e.preventDefault();
        post(route('school.detail.booking', school.slug), {
            onSuccess: () => { reset(); setSubmitted(true); },
        });
    };

    if (submitted) {
        return (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <p className="font-semibold text-green-800 mb-1">Demande envoyée !</p>
                <p className="text-green-700 text-sm">L'auto-école vous contactera bientôt.</p>
                <button onClick={() => setSubmitted(false)} className="mt-4 text-xs text-green-600 hover:underline">
                    Envoyer une autre demande
                </button>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl border border-orange-200 p-5">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-7 h-7 bg-orange-100 rounded-lg flex items-center justify-center text-sm">📋</span>
                Demande d'inscription
            </h3>
            <form onSubmit={submit} className="space-y-3">
                <div>
                    <input value={data.name} onChange={(e) => setData('name', e.target.value)}
                        placeholder="Votre nom *"
                        aria-label="Nom"
                        className={`w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 ${errors.name ? 'border-red-300 bg-red-50' : 'border-gray-200'}`} required />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>
                <div>
                    <input type="email" value={data.email} onChange={(e) => setData('email', e.target.value)}
                        placeholder="Email *"
                        aria-label="Email"
                        className={`w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 ${errors.email ? 'border-red-300 bg-red-50' : 'border-gray-200'}`} required />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>
                <input type="tel" value={data.phone} onChange={(e) => setData('phone', e.target.value)}
                    placeholder="Téléphone" aria-label="Téléphone"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
                <select value={data.permit_type} onChange={(e) => setData('permit_type', e.target.value)}
                    aria-label="Catégorie de permis"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white">
                    <option value="">Catégorie de permis</option>
                    {['A', 'A1', 'B', 'B+E', 'C', 'D', 'D+E', 'AM'].map((p) => (
                        <option key={p} value={p}>Permis {p}</option>
                    ))}
                </select>
                <input type="date" value={data.preferred_date}
                    onChange={(e) => setData('preferred_date', e.target.value)}
                    min={new Date(Date.now() + 86400000).toISOString().slice(0, 10)}
                    aria-label="Date souhaitée"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
                <textarea value={data.message} onChange={(e) => setData('message', e.target.value)}
                    placeholder="Message (optionnel)" rows={3} aria-label="Message"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none" />
                <button type="submit" disabled={processing}
                    className="w-full py-3 bg-orange-600 text-white rounded-xl font-semibold hover:bg-orange-700 disabled:opacity-50 text-sm transition-colors shadow-sm">
                    {processing ? 'Envoi en cours…' : 'Envoyer la demande'}
                </button>
            </form>
        </div>
    );
}

/* ── Click tracker ─────────────────────────────────────────── */
async function trackClick(schoolId, clickType) {
    try {
        const fp = await getFingerprint().catch(() => null);
        fetch('/api/track/click', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name=csrf-token]')?.content ?? '',
                ...(fp ? { 'X-Visitor-Fp': fp } : {}),
            },
            body: JSON.stringify({ school_id: schoolId, click_type: clickType }),
        }).catch(() => {});
    } catch (_) {}
}

/* ── Main page ─────────────────────────────────────────────── */
export default function DetailPage({ school, ratingBreakdown = {}, canReview = false, isFavorited = false, creditsExhausted = false, seo = {} }) {
    const { auth, flash } = usePage().props;
    const [showForm, setShowForm]   = useState(false);
    const [favorited, setFavorited] = useState(isFavorited);
    const [favLoading, setFavLoading] = useState(false);
    const [lightboxImg, setLightboxImg] = useState(null);

    const toggleFavorite = () => {
        if (!auth?.user) { router.visit(route('login')); return; }
        setFavLoading(true);
        setFavorited((f) => !f);
        router.post(route('user.favorites.toggle', school.id), {}, {
            preserveScroll: true,
            only: ['isFavorited'],
            onError:  () => { setFavorited((f) => !f); setFavLoading(false); },
            onFinish: () => setFavLoading(false),
        });
    };

    const { data, setData, post, processing, errors, reset } = useForm({ rating: 5, title: '', content: '' });

    const submitReview = (e) => {
        e.preventDefault();
        post(route('school.detail.review', school.slug), {
            onSuccess: () => { setShowForm(false); reset(); },
        });
    };

    const phone        = school.phone?.replace(/\s/g, '') ?? '';
    const totalReviews = school.reviews_count ?? school.review_count ?? 0;
    const avgRating    = Number(school.average_rating ?? 0);
    const verified = !!school.verified_at;

    return (
        <>
            <Head title={seo.title || `${school.name} — Auto-école ${school.city}`} />

            <PublicNavbar />

            {/* Breadcrumb */}
            <div className="bg-gray-50 border-b border-gray-100 px-4 sm:px-6 py-2.5">
                <div className="max-w-6xl mx-auto">
                    <Breadcrumb items={seo.breadcrumb || [
                        { label: 'Accueil',   href: '/' },
                        { label: 'Recherche', href: '/search' },
                        { label: school.city, href: `/ville/${encodeURIComponent(school.city ?? '')}` },
                        { label: school.name, href: null },
                    ]} />
                </div>
            </div>

            {/* Banner */}
            <div className="h-56 sm:h-80 bg-gradient-to-br from-orange-100 to-amber-50 overflow-hidden relative">
                {school.banner_url
                    ? <img src={`/storage/${school.banner_url}`} alt={school.name} className="w-full h-full object-cover" loading="eager" />
                    : <div className="w-full h-full flex items-center justify-center text-orange-200 text-8xl">🏫</div>}
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
                {flash?.success && (
                    <div className="mb-6 p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">{flash.success}</div>
                )}
                {flash?.error && (
                    <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{flash.error}</div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* ── Main column ── */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Header */}
                        <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6">
                            <div className="flex items-start gap-4">
                                <div className="w-16 h-16 rounded-2xl bg-gray-50 border border-gray-200 shadow-sm overflow-hidden flex-shrink-0 flex items-center justify-center">
                                    {school.logo_url
                                        ? <img src={`/storage/${school.logo_url}`} alt="" className="w-full h-full object-cover" />
                                        : <span className="text-orange-400 text-3xl">🚗</span>}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-3 flex-wrap">
                                        <div>
                                            <div className="flex items-center gap-2 flex-wrap mb-1">
                                                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">{school.name}</h1>
                                                {verified && (
                                                    <span className="inline-flex items-center gap-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                                                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                        </svg>
                                                        Vérifié
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-gray-500 text-sm mb-2 flex items-center gap-1">
                                                <svg className="w-3.5 h-3.5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                                </svg>
                                                {school.address ? `${school.address}, ` : ''}{school.city}
                                            </p>
                                            <div className="flex items-center gap-2">
                                                <StarRating value={avgRating} />
                                                <span className="text-sm font-semibold text-gray-700">
                                                    {avgRating > 0 ? avgRating.toFixed(1) : '—'}/5
                                                </span>
                                                <span className="text-sm text-gray-400">({totalReviews} avis)</span>
                                            </div>
                                        </div>
                                        <button onClick={toggleFavorite} disabled={favLoading}
                                            aria-label={favorited ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                                                favorited
                                                    ? 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100'
                                                    : 'bg-white border-gray-200 text-gray-500 hover:border-orange-300 hover:text-orange-600'
                                            }`}>
                                            <svg className="w-4 h-4" fill={favorited ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
                                            <span className="hidden sm:inline">{favorited ? 'Favori' : 'Ajouter'}</span>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Mobile CTAs */}
                            {!creditsExhausted && (
                            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3 lg:hidden">
                                {phone && (
                                    <a href={`tel:${phone}`} onClick={() => trackClick(school.id, 'phone')}
                                        className="flex items-center justify-center gap-2 py-3 bg-orange-600 text-white rounded-xl text-sm font-semibold hover:bg-orange-700 transition-colors">
                                        📞 Appeler
                                    </a>
                                )}
                                {phone && (
                                    <a href={`https://wa.me/212${phone.replace(/^0/, '')}`} target="_blank" rel="noopener noreferrer"
                                        onClick={() => trackClick(school.id, 'whatsapp')}
                                        className="flex items-center justify-center gap-2 py-3 bg-green-500 text-white rounded-xl text-sm font-semibold hover:bg-green-600 transition-colors">
                                        WhatsApp
                                    </a>
                                )}
                            </div>
                            )}
                        </div>

                        {/* Description */}
                        {school.description && (
                            <div className="bg-white rounded-2xl border border-gray-100 p-5">
                                <h2 className="font-bold text-gray-900 mb-3">À propos</h2>
                                <p className="text-gray-600 text-sm leading-relaxed">{school.description}</p>
                            </div>
                        )}

                        {/* Categories */}
                        {school.categories?.length > 0 && (
                            <div className="bg-white rounded-2xl border border-gray-100 p-5">
                                <h2 className="font-bold text-gray-900 mb-4">Permis disponibles</h2>
                                <div className="flex flex-wrap gap-2">
                                    {school.categories.map((cat) => (
                                        <span key={cat.id}
                                            className="px-5 py-2 bg-orange-50 text-orange-700 rounded-xl font-bold text-sm border border-orange-100 hover:bg-orange-100 transition-colors">
                                            {cat.code}
                                            {cat.name_fr && <span className="font-normal text-orange-500 ml-1">— {cat.name_fr}</span>}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Services */}
                        {school.services?.length > 0 && (
                            <div className="bg-white rounded-2xl border border-gray-100 p-5">
                                <h2 className="font-bold text-gray-900 mb-4">Services & Tarifs</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {school.services.map((service) => (
                                        <div key={service.id} className="p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-orange-100 transition-colors">
                                            <div className="flex items-start justify-between gap-2 mb-1">
                                                <p className="font-semibold text-gray-900 text-sm">{service.name}</p>
                                                {service.price > 0 && (
                                                    <span className="text-orange-600 font-bold text-sm whitespace-nowrap">
                                                        {Number(service.price).toLocaleString('fr-FR')} MAD
                                                    </span>
                                                )}
                                            </div>
                                            {service.description && <p className="text-xs text-gray-500 leading-relaxed">{service.description}</p>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Gallery */}
                        {school.photos?.length > 0 && (
                            <div className="bg-white rounded-2xl border border-gray-100 p-5">
                                <h2 className="font-bold text-gray-900 mb-4">Galerie ({school.photos.length} photos)</h2>
                                <div className="grid grid-cols-3 gap-2">
                                    {school.photos.slice(0, 6).map((photo, i) => (
                                        <button key={photo.id} onClick={() => setLightboxImg(`/storage/${photo.path}`)}
                                            className="aspect-square rounded-xl overflow-hidden bg-gray-100 hover:opacity-90 transition-opacity relative group"
                                            aria-label={`Voir photo ${i + 1}`}>
                                            <img src={`/storage/${photo.path}`} alt={photo.caption ?? ''}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                                            {i === 5 && school.photos.length > 6 && (
                                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-bold text-lg rounded-xl">
                                                    +{school.photos.length - 6}
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Reviews */}
                        <div className="bg-white rounded-2xl border border-gray-100 p-5">
                            <div className="flex items-center justify-between mb-5">
                                <h2 className="font-bold text-gray-900">Avis ({totalReviews})</h2>
                                <div className="flex gap-2">
                                    {canReview && !showForm && (
                                        <button onClick={() => setShowForm(true)}
                                            className="text-sm px-4 py-2 bg-orange-600 text-white rounded-xl hover:bg-orange-700 font-medium transition-colors">
                                            Laisser un avis
                                        </button>
                                    )}
                                    {!auth?.user && (
                                        <Link href={route('login')} className="text-sm text-orange-600 hover:underline font-medium">
                                            Connectez-vous pour noter
                                        </Link>
                                    )}
                                </div>
                            </div>

                            {showForm && (
                                <form onSubmit={submitReview} className="mb-6 p-5 bg-orange-50 border border-orange-100 rounded-2xl space-y-3">
                                    <h3 className="font-semibold text-gray-900 text-sm">Votre avis</h3>
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Note</p>
                                        <StarRating value={data.rating} interactive onChange={(v) => setData('rating', v)} />
                                        {errors.rating && <p className="text-red-500 text-xs mt-1">{errors.rating}</p>}
                                    </div>
                                    <input type="text" value={data.title} onChange={(e) => setData('title', e.target.value)}
                                        placeholder="Titre de votre avis"
                                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white" />
                                    <textarea value={data.content} onChange={(e) => setData('content', e.target.value)}
                                        placeholder="Partagez votre expérience…" rows={3}
                                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white resize-none" />
                                    {errors.content && <p className="text-red-500 text-xs">{errors.content}</p>}
                                    <div className="flex gap-2">
                                        <button type="submit" disabled={processing}
                                            className="px-5 py-2 bg-orange-600 text-white rounded-xl text-sm font-semibold hover:bg-orange-700 disabled:opacity-50 transition-colors">
                                            {processing ? 'Envoi…' : 'Publier'}
                                        </button>
                                        <button type="button" onClick={() => setShowForm(false)}
                                            className="px-5 py-2 border border-gray-200 text-gray-600 rounded-xl text-sm hover:bg-gray-50 transition-colors">
                                            Annuler
                                        </button>
                                    </div>
                                </form>
                            )}

                            <div className="space-y-3">
                                {school.reviews?.length > 0
                                    ? school.reviews.map((r) => <ReviewCard key={r.id} review={r} />)
                                    : (
                                        <div className="text-center py-10">
                                            <p className="text-gray-400 text-sm mb-2">Aucun avis pour le moment.</p>
                                            <p className="text-gray-400 text-xs">Soyez le premier à donner votre avis !</p>
                                        </div>
                                    )}
                            </div>
                        </div>
                    </div>

                    {/* ── Sidebar ── */}
                    <aside className="lg:col-span-1 space-y-4">
                        {/* Sticky contact card */}
                        <div className={`bg-white rounded-2xl border p-5 sticky top-20 shadow-sm ${creditsExhausted ? 'border-amber-200' : 'border-gray-100'}`}>
                            <h3 className="font-bold text-gray-900 mb-4">Contact</h3>

                            {creditsExhausted ? (
                                <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-center">
                                    <svg className="w-8 h-8 text-amber-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/>
                                    </svg>
                                    <p className="text-sm font-semibold text-amber-800 mb-1">Quota de visibilité atteint</p>
                                    <p className="text-xs text-amber-700">Cette auto-école a atteint son quota mensuel. Les coordonnées ne sont temporairement plus disponibles.</p>
                                </div>
                            ) : (
                                <>
                            {/* Primary CTAs */}
                            <div className="space-y-2 mb-5">
                                {phone && (
                                    <a href={`tel:${phone}`} onClick={() => trackClick(school.id, 'phone')}
                                        className="flex items-center justify-center gap-2.5 w-full py-3 bg-orange-600 text-white rounded-xl font-semibold text-sm hover:bg-orange-700 transition-colors shadow-sm">
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
                                        </svg>
                                        Appeler — {school.phone}
                                    </a>
                                )}
                                {phone && (
                                    <a href={`https://wa.me/212${phone.replace(/^0/, '')}`}
                                        target="_blank" rel="noopener noreferrer"
                                        onClick={() => trackClick(school.id, 'whatsapp')}
                                        className="flex items-center justify-center gap-2.5 w-full py-3 bg-green-500 text-white rounded-xl font-semibold text-sm hover:bg-green-600 transition-colors">
                                        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                                            <path d="M12.004 0C5.374 0 0 5.373 0 12c0 2.117.553 4.104 1.523 5.828L.057 23.8l6.064-1.589A11.948 11.948 0 0012.004 24C18.625 24 24 18.627 24 12S18.625 0 12.004 0zm0 21.818a9.797 9.797 0 01-5.003-1.371l-.357-.213-3.713.973 1.001-3.618-.232-.37A9.833 9.833 0 012.18 12c0-5.422 4.413-9.836 9.824-9.836 5.413 0 9.828 4.414 9.828 9.836 0 5.424-4.415 9.818-9.828 9.818z"/>
                                        </svg>
                                        WhatsApp
                                    </a>
                                )}
                            </div>
                                </>
                            )}

                            {/* Secondary links — hidden when credits exhausted */}
                            {!creditsExhausted && (
                            <div className="space-y-2 pt-3 border-t border-gray-100">
                                {school.email && (
                                    <a href={`mailto:${school.email}`} onClick={() => trackClick(school.id, 'email')}
                                        className="flex items-center gap-2.5 text-sm text-gray-600 hover:text-orange-600 py-1.5 transition-colors">
                                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                                        </svg>
                                        {school.email}
                                    </a>
                                )}
                                {school.website_url && (
                                    <a href={school.website_url} target="_blank" rel="noopener noreferrer"
                                        onClick={() => trackClick(school.id, 'website')}
                                        className="flex items-center gap-2.5 text-sm text-orange-600 hover:underline py-1.5 transition-colors">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                                        </svg>
                                        Site web
                                    </a>
                                )}
                                {school.facebook_url && (
                                    <a href={school.facebook_url} target="_blank" rel="noopener noreferrer"
                                        onClick={() => trackClick(school.id, 'facebook')}
                                        className="flex items-center gap-2.5 text-sm text-blue-600 hover:underline py-1.5">
                                        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                                        Facebook
                                    </a>
                                )}
                                {school.instagram_url && (
                                    <a href={school.instagram_url} target="_blank" rel="noopener noreferrer"
                                        onClick={() => trackClick(school.id, 'instagram')}
                                        className="flex items-center gap-2.5 text-sm text-pink-600 hover:underline py-1.5">
                                        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                                        Instagram
                                    </a>
                                )}
                            </div>
                            )}
                        </div>

                        {/* Booking form — hidden when credits exhausted */}
                        {!creditsExhausted && <BookingForm school={school} />}

                        {/* Rating breakdown */}
                        {totalReviews > 0 && (
                            <div className="bg-white rounded-2xl border border-gray-100 p-5">
                                <h3 className="font-bold text-gray-900 mb-1">Note globale</h3>
                                <div className="flex items-center gap-3 mb-4">
                                    <span className="text-4xl font-extrabold text-gray-900">{avgRating.toFixed(1)}</span>
                                    <div>
                                        <StarRating value={avgRating} />
                                        <p className="text-xs text-gray-400 mt-0.5">{totalReviews} avis</p>
                                    </div>
                                </div>
                                {[5, 4, 3, 2, 1].map((star) => {
                                    const count = ratingBreakdown[star] ?? 0;
                                    const pct   = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
                                    return (
                                        <div key={star} className="flex items-center gap-2 mb-1.5">
                                            <span className="text-xs text-gray-500 w-3">{star}</span>
                                            <span className="text-yellow-400 text-xs">★</span>
                                            <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                                                <div className="bg-yellow-400 h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
                                            </div>
                                            <span className="text-xs text-gray-400 w-6 text-right">{count}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </aside>
                </div>
            </div>

            <PublicFooter />

            {/* Lightbox */}
            {lightboxImg && (
                <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
                    onClick={() => setLightboxImg(null)}
                    onKeyDown={(e) => e.key === 'Escape' && setLightboxImg(null)}
                    role="dialog" aria-modal="true" aria-label="Galerie photo"
                    tabIndex={-1}>
                    <img src={lightboxImg} alt="" className="max-w-full max-h-[90vh] rounded-xl object-contain shadow-2xl" />
                    <button className="absolute top-5 right-5 w-10 h-10 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center text-xl transition-colors"
                        onClick={(e) => { e.stopPropagation(); setLightboxImg(null); }}
                        aria-label="Fermer la galerie">✕</button>
                </div>
            )}
        </>
    );
}
