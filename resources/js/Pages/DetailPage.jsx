import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { useState, useEffect, useCallback } from 'react';
import {
    Phone, Mail, Globe, Heart, MapPin, ShieldCheck, Check, X,
    ChevronLeft, ChevronRight, AlertTriangle, Car, CheckCircle2, School, MessageCircle, Images,
} from 'lucide-react';
import PublicNavbar from '@/Components/PublicNavbar';
import PublicFooter from '@/Components/PublicFooter';
import Breadcrumb from '@/Components/Breadcrumb';
import RatingStars from '@/Components/UI/RatingStars';
import Accordion from '@/Components/UI/Accordion';
import { getFingerprint } from '@/utils/fingerprint';

const DETAIL_FAQ = [
    { question: 'Comment réserver une place dans cette auto-école ?', answer: "Utilisez le formulaire « Demande d'inscription » dans la colonne de droite, ou contactez directement l'auto-école par téléphone ou WhatsApp." },
    { question: 'Les avis affichés sont-ils vérifiés ?', answer: "Oui. Chaque avis est modéré avant publication et ne peut être laissé que par un utilisateur connecté n'ayant pas déjà noté cette auto-école." },
    { question: 'Que signifie le badge « Vérifié » ?', answer: "Il indique que l'identité et les documents de l'auto-école ont été contrôlés par notre équipe lors de son inscription sur la plateforme." },
    { question: "Puis-je annuler ou modifier ma demande d'inscription ?", answer: "Votre demande n'est qu'une prise de contact — l'inscription définitive et les conditions d'annulation se font directement avec l'auto-école." },
];

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
                    <CheckCircle2 className="w-6 h-6 text-green-600" strokeWidth={2} />
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
                <span className="w-7 h-7 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600">
                    <CheckCircle2 className="w-4 h-4" />
                </span>
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
    const [lightboxIndex, setLightboxIndex] = useState(null);
    const photos = school.photos ?? [];

    const closeLightbox = useCallback(() => setLightboxIndex(null), []);
    const showPrev = useCallback(() => setLightboxIndex((i) => (i === null ? i : (i - 1 + photos.length) % photos.length)), [photos.length]);
    const showNext = useCallback(() => setLightboxIndex((i) => (i === null ? i : (i + 1) % photos.length)), [photos.length]);

    useEffect(() => {
        if (lightboxIndex === null) return;
        const onKey = (e) => {
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowLeft') showPrev();
            if (e.key === 'ArrowRight') showNext();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [lightboxIndex, closeLightbox, showPrev, showNext]);

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
                    : <div className="w-full h-full flex items-center justify-center text-orange-200"><School className="w-24 h-24" strokeWidth={1} /></div>}
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
                                        : <Car className="w-7 h-7 text-orange-400" strokeWidth={1.5} />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-3 flex-wrap">
                                        <div>
                                            <div className="flex items-center gap-2 flex-wrap mb-1">
                                                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">{school.name}</h1>
                                                {verified && (
                                                    <span className="inline-flex items-center gap-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                                                        <ShieldCheck className="w-3 h-3" />
                                                        Vérifié
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-gray-500 text-sm mb-2 flex items-center gap-1">
                                                <MapPin className="w-3.5 h-3.5 text-gray-400" />
                                                {school.address ? `${school.address}, ` : ''}{school.city}
                                            </p>
                                            <RatingStars rating={avgRating} count={totalReviews} />
                                        </div>
                                        <button onClick={toggleFavorite} disabled={favLoading}
                                            aria-label={favorited ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                                                favorited
                                                    ? 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100'
                                                    : 'bg-white border-gray-200 text-gray-500 hover:border-orange-300 hover:text-orange-600'
                                            }`}>
                                            <Heart className="w-4 h-4" fill={favorited ? 'currentColor' : 'none'} />
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
                                        <Phone className="w-4 h-4" fill="currentColor" />
                                        Appeler
                                    </a>
                                )}
                                {phone && (
                                    <a href={`https://wa.me/212${phone.replace(/^0/, '')}`} target="_blank" rel="noopener noreferrer"
                                        onClick={() => trackClick(school.id, 'whatsapp')}
                                        className="flex items-center justify-center gap-2 py-3 bg-green-500 text-white rounded-xl text-sm font-semibold hover:bg-green-600 transition-colors">
                                        <MessageCircle className="w-4 h-4" fill="currentColor" />
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
                                            className="inline-flex items-center gap-1.5 px-5 py-2 bg-orange-50 text-orange-700 rounded-xl font-bold text-sm border border-orange-100 hover:bg-orange-100 transition-colors">
                                            <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
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
                                <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <Images className="w-4 h-4 text-gray-400" />
                                    Galerie ({school.photos.length} photos)
                                </h2>
                                <div className="grid grid-cols-3 gap-2">
                                    {school.photos.slice(0, 6).map((photo, i) => (
                                        <button key={photo.id} onClick={() => setLightboxIndex(i)}
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

                        {/* Map */}
                        {school.latitude && school.longitude && (
                            <div className="bg-white rounded-2xl border border-gray-100 p-5">
                                <h2 className="font-bold text-gray-900 mb-4">Localisation</h2>
                                <div className="rounded-xl overflow-hidden border border-gray-100 aspect-video">
                                    <iframe
                                        title={`Carte — ${school.name}`}
                                        className="w-full h-full"
                                        loading="lazy"
                                        src={`https://www.openstreetmap.org/export/embed.html?bbox=${school.longitude - 0.01}%2C${school.latitude - 0.01}%2C${school.longitude + 0.01}%2C${school.latitude + 0.01}&layer=mapnik&marker=${school.latitude}%2C${school.longitude}`}
                                    />
                                </div>
                                <a
                                    href={`https://www.openstreetmap.org/?mlat=${school.latitude}&mlon=${school.longitude}#map=16/${school.latitude}/${school.longitude}`}
                                    target="_blank" rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 text-sm text-orange-600 hover:underline font-medium mt-3"
                                >
                                    <MapPin className="w-3.5 h-3.5" />
                                    Voir en plein écran
                                </a>
                            </div>
                        )}

                        {/* FAQ */}
                        <div className="bg-white rounded-2xl border border-gray-100 p-5">
                            <h2 className="font-bold text-gray-900 mb-2">Questions fréquentes</h2>
                            <Accordion items={DETAIL_FAQ} />
                        </div>
                    </div>

                    {/* ── Sidebar ── */}
                    <aside className="lg:col-span-1 space-y-4">
                        {/* Sticky contact card */}
                        <div className={`bg-white rounded-2xl border p-5 sticky top-20 shadow-sm ${creditsExhausted ? 'border-amber-200' : 'border-gray-100'}`}>
                            <h3 className="font-bold text-gray-900 mb-4">Contact</h3>

                            {creditsExhausted ? (
                                <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-center">
                                    <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2" strokeWidth={1.7} />
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
                                        <Phone className="w-4 h-4" fill="currentColor" />
                                        Appeler — {school.phone}
                                    </a>
                                )}
                                {phone && (
                                    <a href={`https://wa.me/212${phone.replace(/^0/, '')}`}
                                        target="_blank" rel="noopener noreferrer"
                                        onClick={() => trackClick(school.id, 'whatsapp')}
                                        className="flex items-center justify-center gap-2.5 w-full py-3 bg-green-500 text-white rounded-xl font-semibold text-sm hover:bg-green-600 transition-colors">
                                        <MessageCircle className="w-4 h-4" fill="currentColor" />
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
                                        <Mail className="w-4 h-4 text-gray-400" />
                                        {school.email}
                                    </a>
                                )}
                                {school.website_url && (
                                    <a href={school.website_url} target="_blank" rel="noopener noreferrer"
                                        onClick={() => trackClick(school.id, 'website')}
                                        className="flex items-center gap-2.5 text-sm text-orange-600 hover:underline py-1.5 transition-colors">
                                        <Globe className="w-4 h-4" />
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
                                        <RatingStars rating={avgRating} />
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
            {lightboxIndex !== null && photos[lightboxIndex] && (
                <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
                    onClick={closeLightbox}
                    role="dialog" aria-modal="true" aria-label="Galerie photo"
                    tabIndex={-1}>
                    <img src={`/storage/${photos[lightboxIndex].path}`} alt={photos[lightboxIndex].caption ?? ''}
                        className="max-w-full max-h-[90vh] rounded-xl object-contain shadow-2xl" />

                    <button className="absolute top-5 right-5 w-10 h-10 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-colors"
                        onClick={(e) => { e.stopPropagation(); closeLightbox(); }}
                        aria-label="Fermer la galerie"><X className="w-5 h-5" /></button>

                    {photos.length > 1 && (
                        <>
                            <button className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-colors"
                                onClick={(e) => { e.stopPropagation(); showPrev(); }}
                                aria-label="Photo précédente"><ChevronLeft className="w-5 h-5" /></button>
                            <button className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-colors"
                                onClick={(e) => { e.stopPropagation(); showNext(); }}
                                aria-label="Photo suivante"><ChevronRight className="w-5 h-5" /></button>
                            <span className="absolute bottom-5 left-1/2 -translate-x-1/2 text-white/70 text-xs font-medium tabular-nums">
                                {lightboxIndex + 1} / {photos.length}
                            </span>
                        </>
                    )}
                </div>
            )}
        </>
    );
}
