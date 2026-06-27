import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

function StarRating({ value = 0 }) {
    const stars = Math.round(value);
    return (
        <span className="text-sm">
            {[1, 2, 3, 4, 5].map((i) => (
                <span key={i} className={i <= stars ? 'text-yellow-400' : 'text-gray-300'}>★</span>
            ))}
        </span>
    );
}

function SchoolCard({ school }) {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
            <div className="h-32 bg-gradient-to-br from-orange-50 to-orange-100 overflow-hidden">
                {school.banner_url
                    ? <img src={`/storage/${school.banner_url}`} alt={school.name} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-orange-300 text-3xl">🏫</div>}
            </div>
            <div className="p-4">
                <div className="flex items-start gap-3 mb-2">
                    <div className="w-9 h-9 rounded-lg bg-white border border-gray-100 shadow-sm overflow-hidden flex-shrink-0 flex items-center justify-center">
                        {school.logo_url
                            ? <img src={`/storage/${school.logo_url}`} alt="" className="w-full h-full object-cover" />
                            : <span className="text-orange-400">🚗</span>}
                    </div>
                    <div className="min-w-0 flex-1">
                        <h2 className="font-semibold text-gray-900 text-sm truncate">{school.name}</h2>
                        <p className="text-xs text-gray-500">📍 {school.city}{school.region ? `, ${school.region}` : ''}</p>
                    </div>
                </div>
                <div className="flex items-center justify-between mb-3">
                    <StarRating value={school.average_rating} />
                    <span className="text-xs text-gray-400">{school.reviews_count ?? school.review_count ?? 0} avis</span>
                </div>
                {school.categories?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                        {school.categories.map((c) => (
                            <span key={c.id} className="text-xs bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full">{c.code}</span>
                        ))}
                    </div>
                )}
                <Link href={route('school.detail', school.slug)}
                    className="block text-center py-2 text-sm font-medium text-orange-600 border border-orange-200 rounded-lg hover:bg-orange-50 transition-colors">
                    Voir les details →
                </Link>
            </div>
        </div>
    );
}

export default function SearchPage({ schools, cities = [], categories = [], filters: serverFilters = {} }) {
    const [filters, setFilters] = useState({
        search: serverFilters.search ?? '',
        city: serverFilters.city ?? '',
        region: serverFilters.region ?? '',
        category: serverFilters.category ?? '',
        min_rating: serverFilters.min_rating ?? '',
        sort: serverFilters.sort ?? 'name',
    });

    const update = (key) => (e) => setFilters({ ...filters, [key]: e.target.value });

    const applyFilters = () => {
        const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== ''));
        router.get(route('search'), params, { preserveScroll: true, preserveState: true });
    };

    const onKeyDown = (e) => { if (e.key === 'Enter') applyFilters(); };

    const clearFilters = () => {
        const empty = { search: '', city: '', region: '', category: '', min_rating: '', sort: 'name' };
        setFilters(empty);
        router.get(route('search'));
    };

    const total = schools?.total ?? 0;

    return (
        <>
            <Head title="Rechercher une auto-ecole" />

            {/* Navbar */}
            <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
                <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-4">
                    <Link href={route('home')} className="font-bold text-orange-600 text-lg">
                        AutoEcoles<span className="text-gray-900">.ma</span>
                    </Link>
                    <div className="flex-1 max-w-sm">
                        <input
                            type="text"
                            placeholder="Rechercher..."
                            value={filters.search}
                            onChange={update('search')}
                            onKeyDown={onKeyDown}
                            className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                    </div>
                    <button onClick={applyFilters} className="px-4 py-1.5 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700">
                        Rechercher
                    </button>
                </div>
            </header>

            <div className="min-h-screen bg-gray-50">
                <div className="max-w-6xl mx-auto px-4 py-8">
                    <div className="flex gap-8">
                        {/* Sidebar filters */}
                        <aside className="w-56 flex-shrink-0 hidden lg:block">
                            <div className="bg-white rounded-xl border border-gray-100 p-4 sticky top-20">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-semibold text-gray-900 text-sm">Filtres</h3>
                                    <button onClick={clearFilters} className="text-xs text-orange-600 hover:underline">Effacer</button>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1 block">Ville</label>
                                        <select value={filters.city} onChange={update('city')}
                                            className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500">
                                            <option value="">Toutes</option>
                                            {cities.map((c) => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>

                                    {categories.length > 0 && (
                                        <div>
                                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1 block">Permis</label>
                                            <select value={filters.category} onChange={update('category')}
                                                className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500">
                                                <option value="">Tous</option>
                                                {categories.map((c) => <option key={c.id} value={c.id}>{c.code} — {c.name_fr}</option>)}
                                            </select>
                                        </div>
                                    )}

                                    <div>
                                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1 block">Note minimum</label>
                                        <select value={filters.min_rating} onChange={update('min_rating')}
                                            className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500">
                                            <option value="">Toutes</option>
                                            {[3, 4, 5].map((r) => <option key={r} value={r}>{r}+ etoiles</option>)}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1 block">Trier par</label>
                                        <select value={filters.sort} onChange={update('sort')}
                                            className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500">
                                            <option value="name">Nom</option>
                                            <option value="rating">Meilleures notes</option>
                                            <option value="reviews">Plus d'avis</option>
                                        </select>
                                    </div>

                                    <button onClick={applyFilters}
                                        className="w-full py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700">
                                        Appliquer
                                    </button>
                                </div>
                            </div>
                        </aside>

                        {/* Main content */}
                        <main className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-sm text-gray-600">
                                    {total} auto-ecole{total !== 1 ? 's' : ''} trouvee{total !== 1 ? 's' : ''}
                                </p>
                            </div>

                            {schools?.data?.length > 0 ? (
                                <>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
                                        {schools.data.map((school) => <SchoolCard key={school.id} school={school} />)}
                                    </div>

                                    {/* Pagination */}
                                    {schools.links?.length > 3 && (
                                        <div className="flex justify-center gap-1">
                                            {schools.links.map((link, i) => (
                                                link.url ? (
                                                    <Link key={i} href={link.url}
                                                        className={`px-3 py-1.5 rounded-lg text-sm ${link.active ? 'bg-orange-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                                                        dangerouslySetInnerHTML={{ __html: link.label }} />
                                                ) : (
                                                    <span key={i} className="px-3 py-1.5 text-gray-300 text-sm" dangerouslySetInnerHTML={{ __html: link.label }} />
                                                )
                                            ))}
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center text-gray-400">
                                    <p className="text-4xl mb-4">🔍</p>
                                    <p className="font-medium text-gray-600 mb-2">Aucune auto-ecole trouvee</p>
                                    <p className="text-sm">Essayez d'autres criteres de recherche</p>
                                    <button onClick={clearFilters} className="mt-4 text-orange-600 text-sm hover:underline">
                                        Effacer les filtres
                                    </button>
                                </div>
                            )}
                        </main>
                    </div>
                </div>
            </div>
        </>
    );
}
