import { Head, Link, router } from '@inertiajs/react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { SlidersHorizontal, X, Search, LocateFixed, Loader2, MapPin, MessageCircleQuestion } from 'lucide-react';
import PublicLayout from '@/Layouts/PublicLayout';
import SchoolCard   from '@/Components/SchoolCard';
import Breadcrumb   from '@/Components/Breadcrumb';
import FilterChip   from '@/Components/UI/FilterChip';
import EmptyState   from '@/Components/UI/EmptyState';
import { SkeletonCard } from '@/Components/UI/Skeleton';
import { useLocale } from '@/i18n/LocaleContext';

const isFeatured = (school) => !!school.featured_until && new Date(school.featured_until) > new Date();

/* Morocco's 12 official regions — static reference data (mirrors the seeded `regions` table).
   Kept as official French/administrative names across all locales, matching how these are
   commonly referenced regardless of UI language. */
const REGIONS = [
    'Tanger-Tétouan-Al Hoceïma', 'Oriental', 'Fès-Meknès', 'Rabat-Salé-Kénitra',
    'Béni Mellal-Khénifra', 'Casablanca-Settat', 'Marrakech-Safi', 'Drâa-Tafilalet',
    'Souss-Massa', 'Guelmim-Oued Noun', 'Laâyoune-Sakia El Hamra', 'Dakhla-Oued Ed-Dahab',
];

/* Every filter change re-runs the search automatically after this delay — no "Apply" click needed. */
const DEBOUNCE_MS = 400;

/* ── Filter panel (reused in sidebar + mobile drawer) ─────── */
function FilterPanel({ filters, onUpdate, onUpdateMany, cities, categories, onReset, variant = 'sidebar', onClose, total }) {
    const { t, locale } = useLocale();
    const [locating, setLocating] = useState(false);
    const [tab, setTab] = useState('regions');

    const TABS = [
        { key: 'regions',    label: t('search.tabRegions') },
        { key: 'advanced',   label: t('search.tabAdvanced') },
        { key: 'categories', label: t('search.tabCategories') },
    ];

    const sortOptions = useMemo(() => {
        const opts = [
            { value: 'name',    label: t('search.sortName') },
            { value: 'rating',  label: t('search.sortRating') },
            { value: 'reviews', label: t('search.sortReviews') },
            { value: 'newest',  label: t('search.sortNewest') },
        ];
        if (filters.lat && filters.lng) opts.push({ value: 'distance', label: t('search.sortDistance') });
        return opts;
    }, [t, filters.lat, filters.lng]);

    const field = (key) => ({
        value: filters[key],
        onChange: (e) => onUpdate(key, e.target.value),
    });

    const useMyLocation = () => {
        if (!navigator.geolocation) return;
        setLocating(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setLocating(false);
                onUpdateMany({ lat: pos.coords.latitude, lng: pos.coords.longitude, sort: 'distance' });
            },
            () => setLocating(false),
            { timeout: 8000 }
        );
    };

    const clearLocation = () => onUpdateMany({ lat: '', lng: '', sort: filters.sort === 'distance' ? 'name' : filters.sort });

    return (
        <div>
            {/* Tabs */}
            <div className="flex items-center gap-1 border-b border-gray-100 mb-5 -mt-1">
                {TABS.map((tb) => (
                    <button key={tb.key} type="button" onClick={() => setTab(tb.key)}
                        className={`px-2.5 py-2.5 text-xs sm:text-sm font-semibold border-b-2 -mb-px transition-colors ${
                            tab === tb.key ? 'border-red-600 text-red-600' : 'border-transparent text-gray-500 hover:text-gray-800'
                        }`}>
                        {tb.label}
                    </button>
                ))}
            </div>

            <div className="space-y-5 min-h-[220px]">
                {tab === 'regions' && (
                    <>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">{t('search.location')}</label>
                            <button type="button" onClick={useMyLocation} disabled={locating}
                                className="w-full flex items-center justify-center gap-2 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:border-red-300 hover:text-red-700 hover:bg-red-50/50 transition-all disabled:opacity-60">
                                {locating ? <Loader2 className="w-4 h-4 animate-spin" /> : <LocateFixed className="w-4 h-4" />}
                                {locating ? t('hero.locating') : t('search.useMyLocation')}
                            </button>
                            {filters.lat && filters.lng && (
                                <div className="flex items-center justify-between gap-2 bg-red-50 border border-red-100 rounded-xl px-3 py-2 mt-2 text-xs text-red-700">
                                    <span className="flex items-center gap-1.5 truncate">
                                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                                        {Number(filters.lat).toFixed(4)}, {Number(filters.lng).toFixed(4)}
                                    </span>
                                    <button type="button" onClick={clearLocation} aria-label={t('search.removeLocation')} className="shrink-0 hover:text-red-900">
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">{t('search.region')}</label>
                            <select {...field('region')} className="input">
                                <option value="">{t('search.allRegions')}</option>
                                {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">{t('search.city')}</label>
                            <select {...field('city')} className="input">
                                <option value="">{t('search.allCities')}</option>
                                {cities.map((c) => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                    </>
                )}

                {tab === 'advanced' && (
                    <>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">{t('search.bestRated')}</label>
                            <select {...field('min_rating')} className="input">
                                <option value="">{t('search.allRatings')}</option>
                                <option value="3">{t('search.rating3')}</option>
                                <option value="4">{t('search.rating4')}</option>
                                <option value="5">{t('search.rating5')}</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">{t('search.sortBy')}</label>
                            <select {...field('sort')} className="input">
                                {sortOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </select>
                        </div>
                    </>
                )}

                {tab === 'categories' && (
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{t('search.category')}</label>
                        <div className="space-y-1">
                            <label className="flex items-center gap-2.5 text-sm text-gray-700 cursor-pointer py-1.5">
                                <input type="radio" name="category" checked={!filters.category} onChange={() => onUpdate('category', '')}
                                    className="text-red-600 focus:ring-red-500" />
                                {t('search.allCategories')}
                            </label>
                            {categories.map((c) => (
                                <label key={c.id} className="flex items-center gap-2.5 text-sm text-gray-700 cursor-pointer py-1.5">
                                    <input type="radio" name="category" checked={String(filters.category) === String(c.id)}
                                        onChange={() => onUpdate('category', c.id)}
                                        className="text-red-600 focus:ring-red-500" />
                                    {c.code} — {locale === 'ar' ? (c.name_ar || c.name_fr) : c.name_fr}
                                </label>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {variant === 'drawer' ? (
                <div className="sticky bottom-0 -mx-6 px-6 pt-4 pb-1 mt-6 bg-white border-t border-gray-100 space-y-2">
                    <button onClick={onClose}
                        className="btn-shine w-full py-3 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition-all shadow-sm hover:shadow-glow">
                        {t('search.viewResults')}{typeof total === 'number' ? ` (${total})` : ''}
                    </button>
                    <button onClick={onReset} className="w-full py-2 text-gray-500 text-sm hover:text-red-600 transition-colors">
                        {t('search.reset')}
                    </button>
                </div>
            ) : (
                <div className="mt-6 pt-5 border-t border-gray-100">
                    <button onClick={onReset}
                        className="w-full py-2 text-gray-500 text-sm font-medium hover:text-red-600 transition-colors">
                        {t('search.reset')}
                    </button>
                </div>
            )}
        </div>
    );
}

/* ── Active filter chips ────────────────────────────────────── */
function ActiveChips({ filters, categories, onRemove, t, locale }) {
    const chips = [];
    if (filters.region)     chips.push({ key: 'region', label: filters.region });
    if (filters.city)       chips.push({ key: 'city', label: filters.city });
    if (filters.min_rating) chips.push({ key: 'min_rating', label: `${filters.min_rating}★ ${t('search.andAbove')}` });
    if (filters.lat && filters.lng) chips.push({ key: 'lat', label: t('search.nearMe'), extraKeys: ['lng'] });
    if (filters.category) {
        const cat = categories.find((c) => String(c.id) === String(filters.category));
        if (cat) chips.push({ key: 'category', label: `${t('search.license')} ${cat.code}` });
    }
    if (!chips.length) return null;
    return (
        <div className="flex flex-wrap gap-2 mb-4">
            {chips.map((c) => (
                <FilterChip key={c.key} label={c.label} removeLabel={`${t('search.removeFilter')} ${c.label}`}
                    onRemove={() => onRemove(c.key, c.extraKeys)} />
            ))}
        </div>
    );
}

/* ── Main page ─────────────────────────────────────────────── */
export default function SearchPage({ schools, cities = [], categories = [], filters: serverFilters = {}, seo = {} }) {
    const { t, locale } = useLocale();
    const [filters, setFilters] = useState({
        city:       serverFilters.city       ?? '',
        region:     serverFilters.region     ?? '',
        category:   serverFilters.category   ?? '',
        min_rating: serverFilters.min_rating ?? '',
        sort:       serverFilters.sort       ?? 'name',
        lat:        serverFilters.lat        ?? '',
        lng:        serverFilters.lng        ?? '',
    });
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const isFirstRender = useRef(true);
    const debounceRef = useRef(null);

    useEffect(() => {
        const remove = [
            router.on('start', () => setLoading(true)),
            router.on('finish', () => setLoading(false)),
        ];
        return () => remove.forEach((fn) => fn());
    }, []);

    const updateFilters = useCallback((partial) => {
        setFilters((prev) => ({ ...prev, ...partial }));
    }, []);

    const updateFilter = useCallback((key, value) => updateFilters({ [key]: value }), [updateFilters]);

    const runSearch = useCallback((params) => {
        const cleaned = Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v != null));
        router.get(route('search'), cleaned, { preserveScroll: true, preserveState: true, replace: true });
    }, []);

    /* Every filter change (region, city, category, rating, sort, geolocation…) lands here and
       triggers a debounced search automatically — there is no "Apply" button to click. */
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => runSearch(filters), DEBOUNCE_MS);
        return () => clearTimeout(debounceRef.current);
    }, [filters, runSearch]);

    const removeFilter = useCallback((key, extraKeys = []) => {
        setFilters((prev) => {
            const next = { ...prev, [key]: '' };
            extraKeys.forEach((k) => { next[k] = ''; });
            if (key === 'lat' && next.sort === 'distance') next.sort = 'name';
            return next;
        });
    }, []);

    const clearFilters = useCallback(() => {
        setFilters({ city: '', region: '', category: '', min_rating: '', sort: 'name', lat: '', lng: '' });
        setDrawerOpen(false);
    }, []);

    const total = schools?.total ?? 0;
    const sortLabelMap = {
        name: t('search.sortName'), rating: t('search.sortRating'), reviews: t('search.sortReviews'),
        newest: t('search.sortNewest'), distance: t('search.sortDistance'),
    };
    const sortLabel   = sortLabelMap[filters.sort] ?? sortLabelMap.name;
    const activeCount = ['region', 'city', 'category', 'min_rating'].filter((k) => filters[k]).length + (filters.lat && filters.lng ? 1 : 0);
    const pageTitle    = filters.city ? `${t('search.titleCity')} ${filters.city}` : t('search.title');

    return (
        <>
            <Head title={seo.title || pageTitle} />

            <PublicLayout>
                {/* Breadcrumb */}
                {seo.breadcrumb && seo.breadcrumb.length > 1 && (
                    <div className="bg-gray-50 border-b border-gray-100 px-4 sm:px-6 py-2.5">
                        <div className="container-page">
                            <Breadcrumb items={seo.breadcrumb} />
                        </div>
                    </div>
                )}

                {/* Page header */}
                <div className="bg-white border-b border-gray-100 px-4 sm:px-6 py-6">
                    <div className="container-page">
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight font-display">
                                    {pageTitle}
                                </h1>
                                <p className="text-sm text-gray-500 mt-0.5">
                                    {total} {t('search.results')}{total !== 1 ? 's' : ''} — {t('search.sortedBy')} <span className="font-medium text-gray-700">{sortLabel}</span>
                                </p>
                            </div>
                            {/* Mobile filter button */}
                            <button onClick={() => setDrawerOpen(true)}
                                aria-label={t('search.filters')}
                                aria-expanded={drawerOpen}
                                className="relative lg:hidden flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:border-red-300 hover:text-red-700 transition-colors">
                                <SlidersHorizontal className="w-4 h-4" />
                                {t('search.filters')}
                                {activeCount > 0 && (
                                    <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center">
                                        {activeCount}
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Helper bar */}
                <div className="bg-red-50/60 border-b border-red-100 px-4 sm:px-6 py-2.5">
                    <div className="container-page flex items-center gap-2 text-sm text-gray-700">
                        <MessageCircleQuestion className="w-4 h-4 text-red-500 shrink-0" />
                        <span>{t('search.helperText')}</span>
                        <Link href={route('contact')} className="font-semibold text-red-600 hover:underline">
                            {t('search.helperLink')}
                        </Link>
                    </div>
                </div>

                <div className="min-h-screen bg-gray-50">
                    <div className="container-page py-8">
                        <div className="flex gap-7">
                            {/* ── Sidebar (desktop) ── */}
                            <aside className="w-64 flex-shrink-0 hidden lg:block">
                                <div className="card-premium p-5 sticky top-24">
                                    <div className="flex items-center justify-between mb-5">
                                        <h2 className="font-bold text-gray-900">{t('search.filters')}</h2>
                                        {activeCount > 0 && (
                                            <span className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">{activeCount}</span>
                                        )}
                                    </div>
                                    <FilterPanel
                                        filters={filters} onUpdate={updateFilter} onUpdateMany={updateFilters}
                                        cities={cities} categories={categories} onReset={clearFilters}
                                    />
                                </div>
                            </aside>

                            {/* ── Results ── */}
                            <main className="flex-1 min-w-0">
                                <ActiveChips filters={filters} categories={categories} onRemove={removeFilter} t={t} locale={locale} />

                                {loading ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8" aria-live="polite" aria-busy="true">
                                        {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} lines={2} />)}
                                    </div>
                                ) : schools?.data?.length > 0 ? (
                                    <>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8 animate-in">
                                            {schools.data.map((s) => <SchoolCard key={s.id} school={s} featured={isFeatured(s)} />)}
                                        </div>

                                        {/* Pagination */}
                                        {schools.links?.length > 3 && (
                                            <div className="flex justify-center gap-1 flex-wrap">
                                                {schools.links.map((link, i) => (
                                                    link.url ? (
                                                        <Link key={i} href={link.url}
                                                            className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                                                                link.active
                                                                    ? 'bg-red-600 text-white shadow-sm'
                                                                    : 'bg-white border border-gray-200 text-gray-700 hover:border-red-300 hover:text-red-700'
                                                            }`}
                                                            dangerouslySetInnerHTML={{ __html: link.label }} />
                                                    ) : (
                                                        <span key={i} className="px-3 py-2 text-gray-300 text-sm" dangerouslySetInnerHTML={{ __html: link.label }} />
                                                    )
                                                ))}
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="card-premium">
                                        <EmptyState
                                            icon={Search}
                                            title={t('search.noResults')}
                                            description={t('search.noResultsDesc')}
                                            action={
                                                <button onClick={clearFilters}
                                                    className="px-5 py-2 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 transition-colors">
                                                    {t('search.clearFilters')}
                                                </button>
                                            }
                                        />
                                    </div>
                                )}
                            </main>
                        </div>
                    </div>
                </div>

                {/* ── Mobile Drawer ── */}
                {drawerOpen && (
                    <div className="fixed inset-0 z-50 lg:hidden" onKeyDown={(e) => e.key === 'Escape' && setDrawerOpen(false)}>
                        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={() => setDrawerOpen(false)} aria-hidden="true" />
                        <div role="dialog" aria-modal="true" aria-label={t('search.filters')}
                            className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl px-6 pt-6 max-h-[90vh] overflow-y-auto shadow-2xl animate-slide-up flex flex-col">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="font-bold text-gray-900 text-lg">{t('search.filters')}</h2>
                                <button onClick={() => setDrawerOpen(false)}
                                    aria-label="Close"
                                    className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                            <FilterPanel
                                filters={filters} onUpdate={updateFilter} onUpdateMany={updateFilters}
                                cities={cities} categories={categories} onReset={clearFilters}
                                variant="drawer" onClose={() => setDrawerOpen(false)} total={total}
                            />
                        </div>
                    </div>
                )}
            </PublicLayout>
        </>
    );
}
