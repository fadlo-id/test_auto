import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import {
    MapPin, Star, ClipboardCheck, Check,
    Search as SearchIcon, LocateFixed, Newspaper, ArrowRight, Quote, GraduationCap, Route,
} from 'lucide-react';
import PublicLayout from '@/Layouts/PublicLayout';
import SchoolCard  from '@/Components/SchoolCard';
import RatingStars from '@/Components/UI/RatingStars';
import Reveal from '@/Components/UI/Reveal';
import Accordion from '@/Components/UI/Accordion';
import { useLocale } from '@/i18n/LocaleContext';

/* ── Hero search panel ─────────────────────────────────────── */
function HeroSearch({ categories = [] }) {
    const { t } = useLocale();
    const [city, setCity] = useState('');
    const [category, setCategory] = useState('');
    const [locating, setLocating] = useState(false);

    const go = (e) => {
        e.preventDefault();
        const params = {};
        if (city)     params.city     = city;
        if (category) params.category = category;
        router.get(route('search'), params);
    };

    const useMyLocation = () => {
        if (!navigator.geolocation) return;
        setLocating(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => router.get(route('search'), { lat: pos.coords.latitude, lng: pos.coords.longitude, sort: 'distance' }),
            () => setLocating(false),
            { timeout: 8000 }
        );
    };

    return (
        <form onSubmit={go} className="glass-panel rounded-3xl shadow-2xl p-3 max-w-3xl mx-auto w-full">
            <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1 min-w-0 flex items-center gap-2 bg-white rounded-2xl px-4 py-3.5">
                    <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                    <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder={t('hero.cityPlaceholder')}
                        aria-label={t('hero.cityPlaceholder')}
                        className="w-full bg-transparent text-gray-900 text-sm placeholder-gray-400 focus:outline-none"
                    />
                </div>
                {categories.length > 0 && (
                    <div className="sm:w-52 flex items-center gap-2 bg-white rounded-2xl px-4 py-3.5">
                        <ClipboardCheck className="w-4 h-4 text-gray-400 shrink-0" />
                        <select value={category} onChange={(e) => setCategory(e.target.value)}
                            aria-label={t('search.category')}
                            className="w-full bg-transparent text-gray-900 text-sm focus:outline-none appearance-none">
                            <option value="">{t('hero.allPermits')}</option>
                            {categories.map((c) => <option key={c.id} value={c.id}>{t('search.license')} {c.code}</option>)}
                        </select>
                    </div>
                )}
                <button type="submit"
                    className="btn-shine bg-red-600 hover:bg-red-500 text-white font-semibold px-6 py-3.5 rounded-2xl transition-all shadow-lg hover:shadow-glow whitespace-nowrap flex items-center justify-center gap-2">
                    <SearchIcon className="w-4 h-4" />
                    {t('hero.searchCta')}
                </button>
            </div>
            <button type="button" onClick={useMyLocation} disabled={locating}
                className="mt-2.5 mx-auto flex items-center gap-1.5 text-xs font-medium text-white/80 hover:text-white transition-colors disabled:opacity-60">
                <LocateFixed className="w-3.5 h-3.5" />
                {locating ? t('hero.locating') : t('hero.useMyLocation')}
            </button>
        </form>
    );
}

/* ── How-it-works step ─────────────────────────────────────── */
function Step({ n, icon, title, desc }) {
    return (
        <div className="relative flex flex-col items-center text-center p-7 rounded-3xl bg-white border border-gray-100 hover:border-red-200 hover:shadow-elevated transition-all duration-300">
            <div className="relative mb-5">
                <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center shadow-sm">
                    {icon}
                </div>
                <span className="absolute -top-2 -right-2 min-w-7 h-7 px-1.5 rounded-full bg-red-600 text-white text-xs font-bold flex items-center justify-center shadow ring-4 ring-white">
                    {String(n).padStart(2, '0')}
                </span>
            </div>
            <h3 className="font-bold text-gray-900 mb-2 text-base">{title}</h3>
            <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
        </div>
    );
}

/* ── Plan card ─────────────────────────────────────────────── */
function PlanCard({ plan, featured = false }) {
    const { t } = useLocale();
    const feats = plan.features ?? [];
    return (
        <div className={`relative flex flex-col rounded-3xl border-2 p-6 transition-all duration-300 ${
            featured
                ? 'border-red-500 bg-white shadow-glow lg:-translate-y-2'
                : 'border-white/10 bg-white/5 backdrop-blur-sm hover:border-white/20'
        }`}>
            {featured && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-red-600 text-white text-xs font-bold px-4 py-1 rounded-full shadow">
                    {t('common.mostPopular')}
                </span>
            )}
            <h3 className={`font-bold text-lg mb-1 ${featured ? 'text-gray-900' : 'text-white'}`}>{plan.name}</h3>
            <div className="mb-4">
                <span className={`text-4xl font-extrabold ${featured ? 'text-gray-900' : 'text-white'}`}>{Number(plan.price).toLocaleString('fr-FR')}</span>
                <span className={`ml-1 text-sm ${featured ? 'text-gray-400' : 'text-gray-400'}`}>MAD / {plan.billing_period === 'yearly' ? t('common.perYear') : t('common.perMonth')}</span>
            </div>
            {plan.description && <p className={`text-sm mb-5 ${featured ? 'text-gray-500' : 'text-gray-400'}`}>{plan.description}</p>}
            {feats.length > 0 && (
                <ul className="space-y-2 mb-6 flex-1">
                    {feats.slice(0, 6).map((f, i) => (
                        <li key={i} className={`flex items-start gap-2 text-sm ${featured ? 'text-gray-700' : 'text-gray-300'}`}>
                            <Check className="w-4 h-4 text-red-500 shrink-0 mt-0.5" strokeWidth={2.5} />
                            {f}
                        </li>
                    ))}
                </ul>
            )}
            <Link href={route('school-application.create')}
                className={`mt-auto block text-center py-3 rounded-xl font-semibold text-sm transition-colors ${
                    featured
                        ? 'btn-shine bg-red-600 text-white hover:bg-red-700 shadow-md'
                        : 'border-2 border-white/20 text-white hover:bg-white/10'
                }`}>
                {t('common.getStarted')} →
            </Link>
        </div>
    );
}

/* Curated real photos for major cities — falls back to a plain list-row tile for any city without one */
const CITY_PHOTOS = {
    'Fès':        '/images/marketing/cities/fes.jpg',
    'Fes':        '/images/marketing/cities/fes.jpg',
    'Rabat':      '/images/marketing/cities/rabat.jpg',
    'Marrakech':  '/images/marketing/cities/marrakech.jpg',
    'Tanger':     '/images/marketing/cities/tanger.jpg',
    'Casablanca': '/images/marketing/cities/casablanca.jpg',
};

/* ── Main page ─────────────────────────────────────────────── */
export default function HomePage({ featured = [], latest = [], cities = [], categories = [], plans = [], stats = {}, seo = {} }) {
    const { t } = useLocale();
    const topRated = [...featured, ...latest]
        .filter((s) => Number(s.average_rating) > 0)
        .sort((a, b) => Number(b.average_rating) - Number(a.average_rating))
        .slice(0, 3);

    const HOME_FAQ = [
        { question: t('home.faq1Q'), answer: t('home.faq1A') },
        { question: t('home.faq2Q'), answer: t('home.faq2A') },
        { question: t('home.faq3Q'), answer: t('home.faq3A') },
        { question: t('home.faq4Q'), answer: t('home.faq4A') },
        { question: t('home.faq5Q'), answer: t('home.faq5A') },
    ];

    return (
        <>
            <Head title={seo.title || t('home.metaTitle')} />

            <PublicLayout transparent>
                {/* ── Hero — full-bleed real photo, matching autoecoles.ma's photographic hero ── */}
                <div className="relative overflow-hidden -mt-16 sm:-mt-[4.5rem]">
                    <img src="/images/marketing/hero-wheel.jpg" alt=""
                        className="absolute inset-0 w-full h-full object-cover" loading="eager" aria-hidden="true" />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/55 to-black/80" />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-transparent" />

                    <div className="h-16 sm:h-[4.5rem]" aria-hidden="true" />

                    <div className="relative container-page pt-14 sm:pt-20 pb-20 text-center">
                        <Reveal delay={80}>
                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-4 leading-[1.1] tracking-tight font-display text-balance">
                                {t('hero.titleLine1')} <span className="text-red-500">{t('hero.titleAccent')}</span><br className="hidden sm:block" />
                                {t('hero.titleLine2')}
                            </h1>
                        </Reveal>
                        <Reveal delay={140}>
                            <p className="text-gray-200 text-base sm:text-lg mb-10 max-w-xl mx-auto leading-relaxed">
                                {t('hero.subtitle')}
                            </p>
                        </Reveal>

                        {/* ── Recherche ── */}
                        <Reveal delay={200}>
                            <HeroSearch categories={categories} />
                        </Reveal>

                        {categories.length > 0 && (
                            <Reveal delay={260} className="flex flex-wrap justify-center gap-2 mt-6">
                                {categories.slice(0, 6).map((cat) => (
                                    <Link key={cat.id} href={route('search.category', cat.code)}
                                        className="px-3.5 py-1.5 bg-white/10 hover:bg-white/20 border border-white/15 text-white/80 hover:text-white text-xs font-medium rounded-full transition-all backdrop-blur-sm">
                                        {t('search.license')} {cat.code}
                                    </Link>
                                ))}
                            </Reveal>
                        )}
                    </div>
                </div>

                {/* ── Featured schools ── */}
                {featured.length > 0 && (
                    <section className="py-24 px-4 sm:px-6 bg-white">
                        <div className="container-page">
                            <Reveal direction="left" className="flex items-end justify-between mb-10">
                                <div>
                                    <p className="eyebrow">{t('home.featuredEyebrow')}</p>
                                    <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 font-display">{t('home.featuredTitle')}</h2>
                                </div>
                                <Link href={route('search')} className="text-sm text-red-600 hover:underline font-semibold hidden sm:flex items-center gap-1">
                                    {t('common.seeAll')} <ArrowRight className="w-3.5 h-3.5" />
                                </Link>
                            </Reveal>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {featured.map((s, i) => (
                                    <Reveal key={s.id} delay={i * 60}>
                                        <SchoolCard school={s} priority={i < 3} featured />
                                    </Reveal>
                                ))}
                            </div>
                            <div className="mt-8 text-center sm:hidden">
                                <Link href={route('search')} className="text-sm text-red-600 hover:underline font-semibold">
                                    {t('home.seeAllSchoolsArrow')}
                                </Link>
                            </div>
                        </div>
                    </section>
                )}

                {/* ── Ce que nous faisons ── */}
                <section className="py-24 px-4 sm:px-6 bg-white overflow-hidden">
                    <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
                        {/* Photo collage */}
                        <Reveal direction="left" className="relative h-[360px] sm:h-[440px]">
                            <div className="absolute w-48 h-48 bg-red-100 rounded-[3rem] blur-3xl -top-6 -left-6 opacity-70 pointer-events-none" aria-hidden="true" />
                            <div className="absolute top-0 left-0 w-[68%] h-[72%] rounded-3xl overflow-hidden shadow-elevated border-4 border-white -rotate-3">
                                <img src="/images/marketing/driving-school-cars.jpg"
                                    alt={t('home.whatWeDoImgAlt1')}
                                    className="w-full h-full object-cover" loading="lazy" />
                            </div>
                            <div className="absolute bottom-0 right-0 w-[52%] h-[52%] rounded-3xl overflow-hidden shadow-elevated border-4 border-white rotate-3">
                                <img src="/images/marketing/hero-wheel.jpg" alt={t('home.whatWeDoImgAlt2')}
                                    className="w-full h-full object-cover" loading="lazy" />
                            </div>
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-2xl bg-red-600 text-white flex items-center justify-center shadow-glow rotate-6">
                                <MapPin className="w-6 h-6" strokeWidth={1.75} />
                            </div>
                        </Reveal>

                        {/* Checklist */}
                        <Reveal direction="right">
                            <p className="eyebrow">{t('home.whatWeDoEyebrow')}</p>
                            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-6 font-display">
                                {t('home.whatWeDoTitle')}
                            </h2>
                            <ul className="space-y-5">
                                {[
                                    { title: t('home.feature1Title'), desc: t('home.feature1Desc') },
                                    { title: t('home.feature2Title'), desc: `${Number(stats.schools ?? 0).toLocaleString('fr-FR')}+ ${t('home.feature2Desc')}` },
                                    { title: t('home.feature3Title'), desc: `${Number(stats.reviews ?? 0).toLocaleString('fr-FR')}+ ${t('home.feature3Desc')}` },
                                ].map((item) => (
                                    <li key={item.title} className="flex items-start gap-3.5">
                                        <span className="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                                            <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
                                        </span>
                                        <div>
                                            <p className="font-bold text-gray-900">{item.title}</p>
                                            <p className="text-sm text-gray-500 mt-1 leading-relaxed">{item.desc}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </Reveal>
                    </div>
                </section>

                {/* ── Cities grid — asymmetric bento, real photos where available ── */}
                {cities.length > 0 && (
                    <section className="py-24 px-4 sm:px-6 bg-cream-50">
                        <div className="container-page">
                            <Reveal direction="right" className="text-center mb-10">
                                <p className="eyebrow">{t('home.exploreEyebrow')}</p>
                                <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 font-display uppercase tracking-tight">{t('home.exploreTitle')}</h2>
                            </Reveal>
                            <div className="grid grid-cols-2 md:grid-cols-4 auto-rows-[130px] gap-3.5">
                                {cities.map((c, i) => {
                                    const photo = CITY_PHOTOS[c.city];
                                    const isFeatured = i === 0;
                                    return (
                                        <Reveal key={c.city} delay={i * 30} direction="zoom"
                                            className={isFeatured ? 'col-span-2 row-span-2' : ''}>
                                            {photo ? (
                                                <Link href={route('search.city', encodeURIComponent(c.city))}
                                                    className="group relative flex flex-col justify-end h-full rounded-2xl overflow-hidden shadow-sm hover:shadow-elevated transition-shadow duration-300">
                                                    <img src={photo} alt={c.city}
                                                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                                                        loading="lazy" />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                                                    <div className="relative p-3.5 flex items-center justify-between gap-2">
                                                        <span className={`font-bold text-white leading-tight ${isFeatured ? 'text-xl' : 'text-sm'}`}>{c.city}</span>
                                                        <span className="w-7 h-7 rounded-full bg-white/20 backdrop-blur-sm border border-white/25 flex items-center justify-center shrink-0 group-hover:bg-red-600 group-hover:border-red-600 transition-colors">
                                                            <ArrowRight className="w-3.5 h-3.5 text-white" />
                                                        </span>
                                                    </div>
                                                </Link>
                                            ) : (
                                                <Link href={route('search.city', encodeURIComponent(c.city))}
                                                    className="group flex items-center gap-3 h-full px-4 bg-white rounded-2xl border border-gray-100 hover:border-red-200 hover:shadow-elevated transition-all duration-300">
                                                    <span className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0 group-hover:bg-red-600 transition-colors">
                                                        <MapPin className="w-4.5 h-4.5 text-red-500 group-hover:text-white transition-colors" />
                                                    </span>
                                                    <span className="flex-1 min-w-0">
                                                        <span className="block text-sm font-bold text-gray-800 truncate">{c.city}</span>
                                                        <span className="block text-xs text-gray-400">{c.schools_count} {c.schools_count > 1 ? t('home.schoolWordPlural') : t('home.schoolWord')}</span>
                                                    </span>
                                                    <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-red-600 group-hover:translate-x-0.5 transition-all shrink-0" />
                                                </Link>
                                            )}
                                        </Reveal>
                                    );
                                })}
                            </div>
                        </div>
                    </section>
                )}

                {/* ── CTA partenaire ── */}
                <section className="relative py-24 px-4 sm:px-6 overflow-hidden">
                    <img src="/images/marketing/hero-wheel.jpg" alt=""
                        className="absolute inset-0 w-full h-full object-cover" loading="lazy" aria-hidden="true" />
                    <div className="absolute inset-0 bg-gradient-to-r from-red-700/95 via-red-600/90 to-red-500/85" />
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_100%,rgba(255,255,255,0.15),transparent_70%)] pointer-events-none" />
                    <Reveal direction="zoom" className="relative max-w-3xl mx-auto text-center">
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3 font-display">{t('home.ctaOwnerTitle')}</h2>
                        <p className="text-red-100 mb-8 text-sm sm:text-base">
                            {t('home.ctaOwnerDesc')}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Link href={route('school-application.create')}
                                className="btn-shine px-8 py-3.5 bg-white text-red-700 font-bold rounded-xl hover:bg-red-50 transition-colors shadow-lg text-sm">
                                {t('home.ctaOwnerBtn')}
                            </Link>
                            <Link href={route('about')}
                                className="px-8 py-3.5 bg-transparent border-2 border-white/50 text-white font-semibold rounded-xl hover:bg-white/10 transition-colors text-sm">
                                {t('common.readMore')}
                            </Link>
                        </div>
                    </Reveal>
                </section>

                {/* ── How it works ── */}
                <section className="py-24 px-4 sm:px-6 bg-gray-50">
                    <div className="max-w-5xl mx-auto">
                        <Reveal direction="left" className="text-center mb-12">
                            <p className="eyebrow">{t('home.howItWorksEyebrow')}</p>
                            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 font-display">{t('home.howItWorksTitle')}</h2>
                        </Reveal>
                        <div className="relative">
                            {/* Road connector — domain-specific decorative touch, desktop only */}
                            <div className="hidden md:block absolute top-14 left-[18%] right-[18%] pointer-events-none" aria-hidden="true">
                                <svg className="w-full" height="8" preserveAspectRatio="none" viewBox="0 0 100 8">
                                    <line x1="0" y1="4" x2="100" y2="4" stroke="#fdba74" strokeWidth="2.5" strokeDasharray="5 4" strokeLinecap="round" />
                                </svg>
                                <Route className="w-4 h-4 text-red-400 absolute -top-2.5 left-1/2 -translate-x-1/2 bg-gray-50 rounded-full" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <Step n="1" icon={<SearchIcon className="w-7 h-7 text-red-600" strokeWidth={1.75} />} title={t('home.step1Title')} desc={t('home.step1Desc')} />
                                <Step n="2" icon={<Star className="w-7 h-7 text-red-600" strokeWidth={1.75} />} title={t('home.step2Title')} desc={t('home.step2Desc')} />
                                <Step n="3" icon={<ClipboardCheck className="w-7 h-7 text-red-600" strokeWidth={1.75} />} title={t('home.step3Title')} desc={t('home.step3Desc')} />
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── Avez-vous des questions ── */}
                <section className="relative py-16 px-4 sm:px-6 overflow-hidden">
                    <img src="/images/marketing/morocco-road.jpg" alt=""
                        className="absolute inset-0 w-full h-full object-cover" loading="lazy" aria-hidden="true" />
                    <div className="absolute inset-0 bg-gray-950/80" />
                    <Reveal direction="zoom" className="relative container-page flex flex-col sm:flex-row items-center justify-between gap-5 text-center sm:text-left">
                        <h2 className="text-xl sm:text-2xl font-extrabold text-white font-display">{t('home.questionsTitle')}</h2>
                        <Link href={route('contact')}
                            className="btn-shine shrink-0 px-7 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors shadow-lg text-sm">
                            {t('footer.contactUs')}
                        </Link>
                    </Reveal>
                </section>

                {/* ── Avis (social proof) ── */}
                {topRated.length > 0 && (
                    <section className="py-24 px-4 sm:px-6 bg-white">
                        <div className="max-w-5xl mx-auto">
                            <Reveal direction="right" className="text-center mb-12">
                                <p className="eyebrow">{t('home.trustEyebrow')}</p>
                                <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 font-display">{t('home.trustTitle')}</h2>
                                <p className="text-gray-500 mt-2 text-sm max-w-md mx-auto">
                                    {Number(stats.reviews ?? 0).toLocaleString('fr-FR')} {t('home.trustDesc')}
                                </p>
                            </Reveal>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                {topRated.map((s, i) => (
                                    <Reveal key={s.id} delay={i * 80}>
                                        <Link href={route('school.detail', s.slug)}
                                            className="group flex flex-col h-full p-6 rounded-3xl bg-gray-50 border border-gray-100 hover:border-red-200 hover:shadow-elevated transition-all duration-300">
                                            <Quote className="w-7 h-7 text-red-200 mb-4" strokeWidth={1.75} />
                                            <p className="font-bold text-gray-900 mb-1 group-hover:text-red-700 transition-colors">{s.name}</p>
                                            <p className="text-xs text-gray-400 mb-3 flex items-center gap-1"><MapPin className="w-3 h-3" />{s.city}</p>
                                            <RatingStars rating={Number(s.average_rating)} count={s.reviews_count} />
                                            <span className="mt-auto pt-4 text-sm font-semibold text-red-600 flex items-center gap-1">
                                                {t('home.readReviews')} <ArrowRight className="w-3.5 h-3.5" />
                                            </span>
                                        </Link>
                                    </Reveal>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* ── Articles ── */}
                <section className="py-24 px-4 sm:px-6 bg-gray-50">
                    <div className="max-w-3xl mx-auto text-center">
                        <Reveal direction="zoom">
                            <p className="eyebrow">{t('home.resourcesEyebrow')}</p>
                            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-4 font-display">{t('home.resourcesTitle')}</h2>
                            <p className="text-gray-500 mb-8 max-w-xl mx-auto">
                                {t('home.resourcesDesc')}
                            </p>
                            <Link href={route('blog.index')}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-800 font-semibold rounded-xl hover:border-red-300 hover:text-red-700 hover:shadow-md transition-all text-sm">
                                <Newspaper className="w-4 h-4" />
                                {t('home.discoverBlog')}
                                <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                        </Reveal>
                    </div>
                </section>

                {/* ── Plans ── */}
                {plans.length > 0 && (
                    <section className="py-24 px-4 sm:px-6 bg-gray-950 relative overflow-hidden">
                        <div className="absolute inset-0 bg-mesh-brand pointer-events-none" />
                        <div className="relative max-w-5xl mx-auto">
                            <Reveal direction="left" className="text-center mb-12">
                                <p className="text-red-400 text-xs font-bold uppercase tracking-widest mb-2">{t('pages.pricingEyebrow')}</p>
                                <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-display">{t('home.plansTitle')}</h2>
                                <p className="text-gray-400 mt-2 text-sm max-w-md mx-auto">
                                    {t('home.plansDesc')}
                                </p>
                                <Link href={route('pricing')} className="inline-block mt-3 text-sm text-red-400 hover:underline font-medium">
                                    {t('home.plansSeeDetail')}
                                </Link>
                            </Reveal>
                            <div className={`grid gap-6 ${plans.length === 1 ? 'max-w-sm mx-auto' : plans.length === 2 ? 'grid-cols-1 sm:grid-cols-2 max-w-2xl mx-auto' : 'grid-cols-1 md:grid-cols-3'}`}>
                                {plans.map((plan, i) => (
                                    <PlanCard key={plan.id} plan={plan} featured={i === 1 && plans.length === 3} />
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* ── FAQ ── */}
                <section className="py-24 px-4 sm:px-6 bg-white">
                    <div className="max-w-2xl mx-auto">
                        <Reveal className="text-center mb-10">
                            <p className="eyebrow">{t('home.faqEyebrow')}</p>
                            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 font-display">{t('home.faqTitle')}</h2>
                        </Reveal>
                        <div className="bg-gray-50 rounded-3xl border border-gray-100 px-6">
                            <Accordion items={HOME_FAQ} />
                        </div>
                    </div>
                </section>
            </PublicLayout>
        </>
    );
}
