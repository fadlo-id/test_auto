import { Head, Link, router } from '@inertiajs/react';
import { useState, useCallback, useEffect } from 'react';
import { SlidersHorizontal, X, Search, LocateFixed, Loader2 } from 'lucide-react';
import PublicNavbar from '@/Components/PublicNavbar';
import PublicFooter from '@/Components/PublicFooter';
import SchoolCard   from '@/Components/SchoolCard';
import Breadcrumb   from '@/Components/Breadcrumb';
import FilterChip   from '@/Components/UI/FilterChip';
import EmptyState   from '@/Components/UI/EmptyState';
import { SkeletonCard } from '@/Components/UI/Skeleton';

const isFeatured = (school) => !!school.featured_until && new Date(school.featured_until) > new Date();

const SORT_LABELS = {
    name:     'Nom (A–Z)',
    rating:   'Meilleures notes',
    reviews:  "Plus d'avis",
    newest:   'Nouveautés',
};

/* ── Filter panel (reused in sidebar + mobile drawer) ─────── */
function FilterPanel({ filters, setFilters, cities, categories, onApply, onClear }) {
    const [locating, setLocating] = useState(false);

    const field = (key) => ({
        value: filters[key],
        onChange: (e) => setFilters({ ...filters, [key]: e.target.value }),
    });

    const inputCls = 'w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white';

    const useMyLocation = () => {
        if (!navigator.geolocation) return;
        setLocating(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setLocating(false);
                setFilters({
                    ...filters,
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude,
                    sort: 'distance',
                });
                onApply({ lat: pos.coords.latitude, lng: pos.coords.longitude, sort: 'distance' });
            },
            () => setLocating(false),
            { timeout: 8000 }
        );
    };

    return (
        <div className="space-y-5">
            <button type="button" onClick={useMyLocation} disabled={locating}
                className="w-full flex items-center justify-center gap-2 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:border-orange-300 hover:text-orange-700 transition-colors disabled:opacity-60">
                {locating ? <Loader2 className="w-4 h-4 animate-spin" /> : <LocateFixed className="w-4 h-4" />}
                {locating ? 'Localisation…' : 'Auto-écoles près de moi'}
            </button>
            <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Mot-clé</label>
                <input type="text" {...field('search')} placeholder="Nom de l'école…"
                    onKeyDown={(e) => e.key === 'Enter' && onApply()}
                    className={inputCls} />
            </div>

            <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Ville</label>
                <select {...field('city')} className={inputCls}>
                    <option value="">Toutes les villes</option>
                    {cities.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>

            {categories.length > 0 && (
                <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Catégorie de permis</label>
                    <select {...field('category')} className={inputCls}>
                        <option value="">Toutes catégories</option>
                        {categories.map((c) => <option key={c.id} value={c.id}>{c.code} — {c.name_fr}</option>)}
                    </select>
                </div>
            )}

            <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Note minimale</label>
                <select {...field('min_rating')} className={inputCls}>
                    <option value="">Toutes les notes</option>
                    <option value="3">3 étoiles et plus</option>
                    <option value="4">4 étoiles et plus</option>
                    <option value="5">5 étoiles uniquement</option>
                </select>
            </div>

            <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Trier par</label>
                <select {...field('sort')} className={inputCls}>
                    {Object.entries(SORT_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
            </div>

            <button onClick={onApply}
                className="w-full py-2.5 bg-orange-600 text-white rounded-xl text-sm font-semibold hover:bg-orange-700 transition-colors shadow-sm">
                Appliquer les filtres
            </button>
            <button onClick={onClear}
                className="w-full py-2 text-gray-500 text-sm hover:text-orange-600 transition-colors">
                Réinitialiser
            </button>
        </div>
    );
}

/* ── Active filter chips ────────────────────────────────────── */
function ActiveChips({ filters, categories, onRemove }) {
    const chips = [];
    if (filters.search)    chips.push({ key: 'search',    label: `"${filters.search}"` });
    if (filters.city)      chips.push({ key: 'city',      label: filters.city });
    if (filters.min_rating) chips.push({ key: 'min_rating', label: `${filters.min_rating}★ et plus` });
    if (filters.lat && filters.lng) chips.push({ key: 'lat', label: 'Près de moi', extraKeys: ['lng'] });
    if (filters.category) {
        const cat = categories.find((c) => String(c.id) === String(filters.category));
        if (cat) chips.push({ key: 'category', label: `Permis ${cat.code}` });
    }
    if (!chips.length) return null;
    return (
        <div className="flex flex-wrap gap-2 mb-4">
            {chips.map((c) => (
                <FilterChip key={c.key} label={c.label} onRemove={() => onRemove(c.key, c.extraKeys)} />
            ))}
        </div>
    );
}

/* ── Main page ─────────────────────────────────────────────── */
export default function SearchPage({ schools, cities = [], categories = [], filters: serverFilters = {}, seo = {} }) {
    const [filters, setFilters] = useState({
        search:     serverFilters.search     ?? '',
        city:       serverFilters.city       ?? '',
        region:     serverFilters.region     ?? '',
        category:   serverFilters.category   ?? '',
        min_rating: serverFilters.min_rating ?? '',
        sort:       serverFilters.sort       ?? 'name',
    });
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const remove = [
            router.on('start', () => setLoading(true)),
            router.on('finish', () => setLoading(false)),
        ];
        return () => remove.forEach((fn) => fn());
    }, []);

    const applyFilters = useCallback((overrides = {}) => {
        const merged = { ...filters, ...overrides };
        const params = Object.fromEntries(Object.entries(merged).filter(([, v]) => v !== '' && v != null));
        router.get(route('search'), params, { preserveScroll: true, preserveState: true });
        setDrawerOpen(false);
    }, [filters]);

    const removeFilter = useCallback((key, extraKeys = []) => {
        const next = { ...filters, [key]: '' };
        extraKeys.forEach((k) => { next[k] = ''; });
        setFilters(next);
        const params = Object.fromEntries(Object.entries(next).filter(([, v]) => v !== '' && v != null));
        router.get(route('search'), params, { preserveScroll: true, preserveState: true });
    }, [filters]);

    const clearFilters = useCallback(() => {
        const empty = { search: '', city: '', region: '', category: '', min_rating: '', sort: 'name' };
        setFilters(empty);
        router.get(route('search'));
        setDrawerOpen(false);
    }, []);

    const total    = schools?.total ?? 0;
    const sortLabel = SORT_LABELS[filters.sort] ?? 'Nom';

    return (
        <>
            <Head title={seo.title || (filters.city ? `Auto-écoles à ${filters.city}` : 'Rechercher une auto-école')} />
            <PublicNavbar />

            {/* Breadcrumb */}
            {seo.breadcrumb && seo.breadcrumb.length > 1 && (
                <div className="bg-gray-50 border-b border-gray-100 px-4 sm:px-6 py-2.5">
                    <div className="max-w-6xl mx-auto">
                        <Breadcrumb items={seo.breadcrumb} />
                    </div>
                </div>
            )}

            {/* Page header */}
            <div className="bg-white border-b border-gray-100 px-4 sm:px-6 py-5">
                <div className="max-w-6xl mx-auto">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">
                                {filters.city ? `Auto-écoles à ${filters.city}` : 'Toutes les auto-écoles'}
                            </h1>
                            <p className="text-sm text-gray-500 mt-0.5">
                                {total} résultat{total !== 1 ? 's' : ''} — Trié par <span className="font-medium text-gray-700">{sortLabel}</span>
                            </p>
                        </div>
                        {/* Mobile filter button */}
                        <button onClick={() => setDrawerOpen(true)}
                            aria-label="Ouvrir les filtres"
                            aria-expanded={drawerOpen}
                            className="lg:hidden flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:border-orange-300 hover:text-orange-700 transition-colors">
                            <SlidersHorizontal className="w-4 h-4" />
                            Filtres
                        </button>
                    </div>
                </div>
            </div>

            <div className="min-h-screen bg-gray-50">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
                    <div className="flex gap-7">
                        {/* ── Sidebar (desktop) ── */}
                        <aside className="w-60 flex-shrink-0 hidden lg:block">
                            <div className="bg-white rounded-2xl border border-gray-100 p-5 sticky top-20 shadow-sm">
                                <div className="flex items-center justify-between mb-5">
                                    <h2 className="font-bold text-gray-900">Filtres</h2>
                                </div>
                                <FilterPanel
                                    filters={filters} setFilters={setFilters}
                                    cities={cities} categories={categories}
                                    onApply={applyFilters} onClear={clearFilters}
                                />
                            </div>
                        </aside>

                        {/* ── Results ── */}
                        <main className="flex-1 min-w-0">
                            <ActiveChips filters={filters} categories={categories} onRemove={removeFilter} />

                            {loading ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mb-8" aria-live="polite" aria-busy="true">
                                    {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} lines={2} />)}
                                </div>
                            ) : schools?.data?.length > 0 ? (
                                <>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
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
                                                                ? 'bg-orange-600 text-white shadow-sm'
                                                                : 'bg-white border border-gray-200 text-gray-700 hover:border-orange-300 hover:text-orange-700'
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
                                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
                                    <EmptyState
                                        icon={Search}
                                        title="Aucune auto-école trouvée"
                                        description="Essayez d'autres critères ou élargissez votre recherche : une autre ville, une catégorie plus large, ou une note minimale plus basse."
                                        action={
                                            <button onClick={clearFilters}
                                                className="px-5 py-2 bg-orange-600 text-white rounded-xl text-sm font-medium hover:bg-orange-700 transition-colors">
                                                Effacer les filtres
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
                    <div className="absolute inset-0 bg-black/40" onClick={() => setDrawerOpen(false)} aria-hidden="true" />
                    <div role="dialog" aria-modal="true" aria-label="Filtres de recherche"
                        className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6 max-h-[90vh] overflow-y-auto shadow-2xl">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="font-bold text-gray-900 text-lg">Filtrer</h2>
                            <button onClick={() => setDrawerOpen(false)}
                                aria-label="Fermer les filtres"
                                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <FilterPanel
                            filters={filters} setFilters={setFilters}
                            cities={cities} categories={categories}
                            onApply={applyFilters} onClear={clearFilters}
                        />
                    </div>
                </div>
            )}

            <PublicFooter />
        </>
    );
}
