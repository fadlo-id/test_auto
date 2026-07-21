import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { useState, useEffect, useCallback } from 'react';
import {
    Phone, Mail, Globe, Heart, MapPin, ShieldCheck, Check, X,
    ChevronLeft, ChevronRight, AlertTriangle, Car, CheckCircle2, School, MessageCircle, Images, ArrowRight,
} from 'lucide-react';
import PublicLayout from '@/Layouts/PublicLayout';
import Breadcrumb from '@/Components/Breadcrumb';
import RatingStars from '@/Components/UI/RatingStars';
import Accordion from '@/Components/UI/Accordion';
import ReviewCard from '@/Components/ReviewCard';
import ServiceCard from '@/Components/ServiceCard';
import { getFingerprint } from '@/utils/fingerprint';
import { useLocale } from '@/i18n/LocaleContext';

/* ── Section shell ─────────────────────────────────────────── */
function Section({ title, icon: Icon, children, className = '' }) {
    return (
        <div className={`card-premium p-5 sm:p-6 ${className}`}>
            {title && (
                <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    {Icon && <Icon className="w-4 h-4 text-red-500" />}
                    {title}
                </h2>
            )}
            {children}
        </div>
    );
}

/* ── Stars (interactive for the review form) ─────────────────── */
function StarRating({ value = 0, interactive = false, onChange }) {
    const [hover, setHover] = useState(0);
    const display = interactive ? (hover || value) : Math.round(value);
    return (
        <span className={interactive ? 'cursor-pointer select-none' : ''}>
            {[1, 2, 3, 4, 5].map((i) => (
                <span key={i}
                    className={`text-xl ${i <= display ? 'text-red-400' : 'text-gray-200'}`}
                    onMouseEnter={interactive ? () => setHover(i) : undefined}
                    onMouseLeave={interactive ? () => setHover(0) : undefined}
                    onClick={interactive ? () => onChange(i) : undefined}>★</span>
            ))}
        </span>
    );
}

/* ── Booking form ──────────────────────────────────────────── */
function BookingForm({ school }) {
    const { t } = useLocale();
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
            <div className="bg-green-50 border border-green-200 rounded-3xl p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                    <CheckCircle2 className="w-6 h-6 text-green-600" strokeWidth={2.5} />
                </div>
                <p className="font-semibold text-green-800 mb-1">{t('detail.requestSentTitle')}</p>
                <p className="text-green-700 text-sm">{t('detail.requestSentDesc')}</p>
                <button onClick={() => setSubmitted(false)} className="mt-4 text-xs text-green-600 hover:underline">
                    {t('detail.sendAnotherRequest')}
                </button>
            </div>
        );
    }

    return (
        <div className="card-premium p-5">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-7 h-7 bg-red-100 rounded-lg flex items-center justify-center text-red-600">
                    <CheckCircle2 className="w-4 h-4" />
                </span>
                {t('detail.bookingFormTitle')}
            </h3>
            <form onSubmit={submit} className="space-y-3">
                <div>
                    <input value={data.name} onChange={(e) => setData('name', e.target.value)}
                        placeholder={t('detail.namePlaceholder')}
                        aria-label={t('auth.name')}
                        className={`input ${errors.name ? 'input-error' : ''}`} required />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>
                <div>
                    <input type="email" value={data.email} onChange={(e) => setData('email', e.target.value)}
                        placeholder={t('detail.emailPlaceholder')}
                        aria-label={t('auth.email')}
                        className={`input ${errors.email ? 'input-error' : ''}`} required />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>
                <input type="tel" value={data.phone} onChange={(e) => setData('phone', e.target.value)}
                    placeholder={t('auth.phone')} aria-label={t('auth.phone')} className="input" />
                <select value={data.permit_type} onChange={(e) => setData('permit_type', e.target.value)}
                    aria-label={t('search.category')} className="input">
                    <option value="">{t('search.category')}</option>
                    {['A', 'A1', 'B', 'B+E', 'C', 'D', 'D+E', 'AM'].map((p) => (
                        <option key={p} value={p}>{t('search.license')} {p}</option>
                    ))}
                </select>
                <input type="date" value={data.preferred_date}
                    onChange={(e) => setData('preferred_date', e.target.value)}
                    min={new Date(Date.now() + 86400000).toISOString().slice(0, 10)}
                    aria-label={t('detail.preferredDate')} className="input" />
                <textarea value={data.message} onChange={(e) => setData('message', e.target.value)}
                    placeholder={t('detail.messageOptional')} rows={3} aria-label={t('detail.messageOptional')} className="input resize-none" />
                <button type="submit" disabled={processing}
                    className="w-full py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 disabled:opacity-50 text-sm transition-all shadow-sm hover:shadow-glow">
                    {processing ? t('auth.sending') : t('detail.sendRequest')}
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
    const { t } = useLocale();
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

    const DETAIL_FAQ = [
        { question: t('detail.faq1Q'), answer: t('detail.faq1A') },
        { question: t('detail.faq2Q'), answer: t('detail.faq2A') },
        { question: t('detail.faq3Q'), answer: t('detail.faq3A') },
        { question: t('detail.faq4Q'), answer: t('detail.faq4A') },
    ];

    return (
        <>
            <Head title={seo.title || `${school.name} — ${t('detail.schoolMetaConnector')} ${school.city}`} />

            <PublicLayout>
                {/* Breadcrumb */}
                <div className="bg-gray-50 border-b border-gray-100 px-4 sm:px-6 py-2.5">
                    <div className="container-page">
                        <Breadcrumb items={seo.breadcrumb || [
                            { label: t('nav.home'),   href: '/' },
                            { label: t('nav.search'), href: '/search' },
                            { label: school.city, href: `/ville/${encodeURIComponent(school.city ?? '')}` },
                            { label: school.name, href: null },
                        ]} />
                    </div>
                </div>

                {/* ── Hero banner ── */}
                <div className="h-56 sm:h-96 bg-gradient-to-br from-red-100 to-amber-50 overflow-hidden relative">
                    {school.banner_url
                        ? <img src={`/storage/${school.banner_url}`} alt={school.name} className="w-full h-full object-cover" loading="eager" />
                        : <div className="w-full h-full flex items-center justify-center text-red-200"><School className="w-24 h-24" strokeWidth={1.25} /></div>}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />

                    {/* Identity overlay */}
                    <div className="absolute inset-x-0 bottom-0">
                        <div className="container-page pb-5 sm:pb-7">
                            <div className="flex items-end gap-4">
                                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white border-4 border-white shadow-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
                                    {school.logo_url
                                        ? <img src={`/storage/${school.logo_url}`} alt="" className="w-full h-full object-cover" />
                                        : <Car className="w-8 h-8 text-red-400" strokeWidth={1.75} />}
                                </div>
                                <div className="min-w-0 pb-1">
                                    <div className="flex items-center gap-2 flex-wrap mb-1">
                                        <h1 className="text-xl sm:text-3xl font-extrabold text-white drop-shadow-sm font-display">{school.name}</h1>
                                        {verified && (
                                            <span className="inline-flex items-center gap-1 bg-emerald-500/90 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-0.5 rounded-full">
                                                <ShieldCheck className="w-3 h-3" />
                                                {t('common.verified')}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-white/90 text-sm flex items-center gap-1">
                                        <MapPin className="w-3.5 h-3.5" />
                                        {school.address ? `${school.address}, ` : ''}{school.city}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="container-page py-8">
                    {flash?.success && (
                        <div className="mb-6 p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">{flash.success}</div>
                    )}
                    {flash?.error && (
                        <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{flash.error}</div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* ── Main column ── */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Rating + favorite bar */}
                            <div className="card-premium p-5 flex items-center justify-between gap-3 flex-wrap">
                                <RatingStars rating={avgRating} count={totalReviews} size="lg" />
                                <button onClick={toggleFavorite} disabled={favLoading}
                                    aria-label={favorited ? t('detail.removeFromFavorites') : t('detail.addToFavorites')}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                                        favorited
                                            ? 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100'
                                            : 'bg-white border-gray-200 text-gray-500 hover:border-red-300 hover:text-red-600'
                                    }`}>
                                    <Heart className="w-4 h-4" fill={favorited ? 'currentColor' : 'none'} />
                                    {favorited ? t('detail.favorited') : t('detail.addToFavorites')}
                                </button>
                            </div>

                            {/* Mobile CTAs */}
                            {!creditsExhausted && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:hidden">
                                    {phone && (
                                        <a href={`tel:${phone}`} onClick={() => trackClick(school.id, 'phone')}
                                            className="flex items-center justify-center gap-2 py-3 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition-colors shadow-sm">
                                            <Phone className="w-4 h-4" fill="currentColor" />
                                            {t('common.call')}
                                        </a>
                                    )}
                                    {phone && (
                                        <a href={`https://wa.me/212${phone.replace(/^0/, '')}`} target="_blank" rel="noopener noreferrer"
                                            onClick={() => trackClick(school.id, 'whatsapp')}
                                            className="flex items-center justify-center gap-2 py-3 bg-green-500 text-white rounded-xl text-sm font-semibold hover:bg-green-600 transition-colors">
                                            <MessageCircle className="w-4 h-4" fill="currentColor" />
                                            {t('detail.whatsapp')}
                                        </a>
                                    )}
                                </div>
                            )}

                            {/* Informations */}
                            {school.description && (
                                <Section title={t('detail.about')}>
                                    <p className="text-gray-600 text-sm leading-relaxed">{school.description}</p>
                                </Section>
                            )}

                            {/* Permis */}
                            {school.categories?.length > 0 && (
                                <Section title={t('detail.availablePermits')}>
                                    <div className="flex flex-wrap gap-2">
                                        {school.categories.map((cat) => (
                                            <span key={cat.id}
                                                className="inline-flex items-center gap-1.5 px-5 py-2 bg-red-50 text-red-700 rounded-xl font-bold text-sm border border-red-100 hover:bg-red-100 transition-colors">
                                                <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
                                                {cat.code}
                                                {cat.name_fr && <span className="font-normal text-red-500 ml-1">— {cat.name_fr}</span>}
                                            </span>
                                        ))}
                                    </div>
                                </Section>
                            )}

                            {/* Services */}
                            {school.services?.length > 0 && (
                                <Section title={t('detail.servicesAndPricing')}>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {school.services.map((service) => (
                                            <ServiceCard key={service.id} service={service} />
                                        ))}
                                    </div>
                                </Section>
                            )}

                            {/* Gallery */}
                            {school.photos?.length > 0 && (
                                <Section title={`${t('detail.gallery')} (${school.photos.length} ${t('detail.photos')})`} icon={Images}>
                                    <div className="grid grid-cols-3 gap-2">
                                        {school.photos.slice(0, 6).map((photo, i) => (
                                            <button key={photo.id} onClick={() => setLightboxIndex(i)}
                                                className="aspect-square rounded-2xl overflow-hidden bg-gray-100 hover:opacity-90 transition-opacity relative group"
                                                aria-label={`${t('detail.viewPhoto')} ${i + 1}`}>
                                                <img src={`/storage/${photo.path}`} alt={photo.caption ?? ''}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                                                {i === 5 && school.photos.length > 6 && (
                                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-bold text-lg rounded-2xl">
                                                        +{school.photos.length - 6}
                                                    </div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </Section>
                            )}

                            {/* Avis */}
                            <Section>
                                <div className="flex items-center justify-between mb-5">
                                    <h2 className="font-bold text-gray-900">{t('detail.reviewsTitle')} ({totalReviews})</h2>
                                    <div className="flex gap-2">
                                        {canReview && !showForm && (
                                            <button onClick={() => setShowForm(true)}
                                                className="text-sm px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 font-medium transition-colors">
                                                {t('detail.leaveReview')}
                                            </button>
                                        )}
                                        {!auth?.user && (
                                            <Link href={route('login')} className="text-sm text-red-600 hover:underline font-medium">
                                                {t('detail.loginToRate')}
                                            </Link>
                                        )}
                                    </div>
                                </div>

                                {showForm && (
                                    <form onSubmit={submitReview} className="mb-6 p-5 bg-red-50 border border-red-100 rounded-2xl space-y-3">
                                        <h3 className="font-semibold text-gray-900 text-sm">{t('detail.yourReview')}</h3>
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">{t('detail.ratingLabel')}</p>
                                            <StarRating value={data.rating} interactive onChange={(v) => setData('rating', v)} />
                                            {errors.rating && <p className="text-red-500 text-xs mt-1">{errors.rating}</p>}
                                        </div>
                                        <input type="text" value={data.title} onChange={(e) => setData('title', e.target.value)}
                                            placeholder={t('detail.reviewTitlePlaceholder')} className="input bg-white" />
                                        <textarea value={data.content} onChange={(e) => setData('content', e.target.value)}
                                            placeholder={t('detail.reviewContentPlaceholder')} rows={3} className="input bg-white resize-none" />
                                        {errors.content && <p className="text-red-500 text-xs">{errors.content}</p>}
                                        <div className="flex gap-2">
                                            <button type="submit" disabled={processing}
                                                className="px-5 py-2 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 disabled:opacity-50 transition-colors">
                                                {processing ? t('detail.sendingShort') : t('detail.publish')}
                                            </button>
                                            <button type="button" onClick={() => setShowForm(false)}
                                                className="px-5 py-2 border border-gray-200 text-gray-600 rounded-xl text-sm hover:bg-gray-50 transition-colors">
                                                {t('detail.cancel')}
                                            </button>
                                        </div>
                                    </form>
                                )}

                                <div className="space-y-3">
                                    {school.reviews?.length > 0
                                        ? school.reviews.map((r) => <ReviewCard key={r.id} review={r} />)
                                        : (
                                            <div className="text-center py-10">
                                                <p className="text-gray-400 text-sm mb-2">{t('detail.noReviewsYet')}</p>
                                                <p className="text-gray-400 text-xs">{t('detail.beFirstReview')}</p>
                                            </div>
                                        )}
                                </div>
                            </Section>

                            {/* Google Maps */}
                            {school.latitude && school.longitude && (
                                <Section title={t('search.location')}>
                                    <div className="rounded-2xl overflow-hidden border border-gray-100 aspect-video">
                                        <iframe
                                            title={`${t('detail.mapTitlePrefix')} — ${school.name}`}
                                            className="w-full h-full"
                                            loading="lazy"
                                            src={`https://www.openstreetmap.org/export/embed.html?bbox=${school.longitude - 0.01}%2C${school.latitude - 0.01}%2C${school.longitude + 0.01}%2C${school.latitude + 0.01}&layer=mapnik&marker=${school.latitude}%2C${school.longitude}`}
                                        />
                                    </div>
                                    <a
                                        href={`https://www.openstreetmap.org/?mlat=${school.latitude}&mlon=${school.longitude}#map=16/${school.latitude}/${school.longitude}`}
                                        target="_blank" rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 text-sm text-red-600 hover:underline font-medium mt-3"
                                    >
                                        <MapPin className="w-3.5 h-3.5" />
                                        {t('detail.viewOnGoogleMaps')}
                                    </a>
                                </Section>
                            )}

                            {/* Auto-écoles similaires */}
                            <div className="card-premium p-6 sm:p-7 bg-gradient-to-br from-red-50 to-white text-center">
                                <h2 className="font-bold text-gray-900 mb-2">{t('detail.similarSchools')}</h2>
                                <p className="text-sm text-gray-500 mb-5 max-w-md mx-auto">
                                    {t('detail.similarSchoolsDesc').replace('{city}', school.city ? `${t('detail.inCity')} ${school.city}` : t('detail.nearYou'))}
                                </p>
                                <Link href={route('search', { city: school.city })}
                                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition-colors shadow-sm">
                                    {t('detail.viewSchoolsInCity')} {school.city} <ArrowRight className="w-3.5 h-3.5" />
                                </Link>
                            </div>

                            {/* FAQ */}
                            <Section title={t('detail.faqTitle')}>
                                <Accordion items={DETAIL_FAQ} />
                            </Section>
                        </div>

                        {/* ── Sidebar ── */}
                        <aside className="lg:col-span-1 space-y-4">
                            {/* Sticky contact card */}
                            <div className={`card-premium p-5 sticky top-24 ${creditsExhausted ? 'border-amber-200' : ''}`}>
                                <h3 className="font-bold text-gray-900 mb-4">{t('detail.contactTitle')}</h3>

                                {creditsExhausted ? (
                                    <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 text-center">
                                        <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2" strokeWidth={1.75} />
                                        <p className="text-sm font-semibold text-amber-800 mb-1">{t('detail.quotaReachedTitle')}</p>
                                        <p className="text-xs text-amber-700">{t('detail.quotaReachedDesc')}</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2 mb-5">
                                        {phone && (
                                            <a href={`tel:${phone}`} onClick={() => trackClick(school.id, 'phone')}
                                                className="btn-shine flex items-center justify-center gap-2.5 w-full py-3 bg-red-600 text-white rounded-xl font-semibold text-sm hover:bg-red-700 transition-all shadow-sm hover:shadow-glow">
                                                <Phone className="w-4 h-4" fill="currentColor" />
                                                {t('common.call')} — {school.phone}
                                            </a>
                                        )}
                                        {phone && (
                                            <a href={`https://wa.me/212${phone.replace(/^0/, '')}`}
                                                target="_blank" rel="noopener noreferrer"
                                                onClick={() => trackClick(school.id, 'whatsapp')}
                                                className="flex items-center justify-center gap-2.5 w-full py-3 bg-green-500 text-white rounded-xl font-semibold text-sm hover:bg-green-600 transition-colors">
                                                <MessageCircle className="w-4 h-4" fill="currentColor" />
                                                {t('detail.whatsapp')}
                                            </a>
                                        )}
                                    </div>
                                )}

                                {/* Secondary links — hidden when credits exhausted */}
                                {!creditsExhausted && (
                                    <div className="space-y-2 pt-3 border-t border-gray-100">
                                        {school.email && (
                                            <a href={`mailto:${school.email}`} onClick={() => trackClick(school.id, 'email')}
                                                className="flex items-center gap-2.5 text-sm text-gray-600 hover:text-red-600 py-1.5 transition-colors">
                                                <Mail className="w-4 h-4 text-gray-400" />
                                                {school.email}
                                            </a>
                                        )}
                                        {school.website_url && (
                                            <a href={school.website_url} target="_blank" rel="noopener noreferrer"
                                                onClick={() => trackClick(school.id, 'website')}
                                                className="flex items-center gap-2.5 text-sm text-red-600 hover:underline py-1.5 transition-colors">
                                                <Globe className="w-4 h-4" />
                                                {t('detail.website')}
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
                                <Section title={t('detail.overallRating')}>
                                    <div className="flex items-center gap-3 mb-4">
                                        <span className="text-4xl font-extrabold text-gray-900 font-display">{avgRating.toFixed(1)}</span>
                                        <div>
                                            <RatingStars rating={avgRating} />
                                            <p className="text-xs text-gray-400 mt-0.5">{totalReviews} {t('common.reviews')}</p>
                                        </div>
                                    </div>
                                    {[5, 4, 3, 2, 1].map((star) => {
                                        const count = ratingBreakdown[star] ?? 0;
                                        const pct   = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
                                        return (
                                            <div key={star} className="flex items-center gap-2 mb-1.5">
                                                <span className="text-xs text-gray-500 w-3">{star}</span>
                                                <span className="text-red-400 text-xs">★</span>
                                                <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                                                    <div className="bg-red-400 h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
                                                </div>
                                                <span className="text-xs text-gray-400 w-6 text-right">{count}</span>
                                            </div>
                                        );
                                    })}
                                </Section>
                            )}
                        </aside>
                    </div>
                </div>

                {/* Lightbox */}
                {lightboxIndex !== null && photos[lightboxIndex] && (
                    <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
                        onClick={closeLightbox}
                        role="dialog" aria-modal="true" aria-label={t('detail.galleryDialog')}
                        tabIndex={-1}>
                        <img src={`/storage/${photos[lightboxIndex].path}`} alt={photos[lightboxIndex].caption ?? ''}
                            className="max-w-full max-h-[90vh] rounded-xl object-contain shadow-2xl" />

                        <button className="absolute top-5 right-5 w-10 h-10 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-colors"
                            onClick={(e) => { e.stopPropagation(); closeLightbox(); }}
                            aria-label={t('detail.closeGallery')}><X className="w-5 h-5" /></button>

                        {photos.length > 1 && (
                            <>
                                <button className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-colors"
                                    onClick={(e) => { e.stopPropagation(); showPrev(); }}
                                    aria-label={t('detail.prevPhoto')}><ChevronLeft className="w-5 h-5" /></button>
                                <button className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-colors"
                                    onClick={(e) => { e.stopPropagation(); showNext(); }}
                                    aria-label={t('detail.nextPhoto')}><ChevronRight className="w-5 h-5" /></button>
                                <span className="absolute bottom-5 left-1/2 -translate-x-1/2 text-white/70 text-xs font-medium tabular-nums">
                                    {lightboxIndex + 1} / {photos.length}
                                </span>
                            </>
                        )}
                    </div>
                )}
            </PublicLayout>
        </>
    );
}
