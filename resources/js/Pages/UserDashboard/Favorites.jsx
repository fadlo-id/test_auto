import { Head, Link, router } from '@inertiajs/react';
import UserLayout from '@/Layouts/UserLayout';

function StarRating({ value = 0 }) {
    return (
        <span className="text-sm">
            {[1,2,3,4,5].map(i => <span key={i} className={i <= Math.round(value) ? 'text-yellow-400' : 'text-gray-200'}>★</span>)}
        </span>
    );
}

function SchoolCard({ school, onRemove }) {
    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            <div className="h-28 bg-gradient-to-br from-orange-50 to-orange-100 overflow-hidden relative">
                {school.banner_url
                    ? <img src={`/storage/${school.banner_url}`} alt={school.name} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-orange-300 text-3xl">🏫</div>}
                <button onClick={() => onRemove(school)}
                    className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 shadow transition-colors"
                    title="Retirer des favoris">
                    ❤️
                </button>
            </div>
            <div className="p-4">
                <div className="flex items-start gap-3 mb-2">
                    <div className="w-9 h-9 rounded-lg bg-white border border-gray-100 shadow-sm overflow-hidden flex-shrink-0 flex items-center justify-center">
                        {school.logo_url
                            ? <img src={`/storage/${school.logo_url}`} alt="" className="w-full h-full object-cover" />
                            : <span className="text-orange-400 text-sm">🚗</span>}
                    </div>
                    <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-gray-900 text-sm truncate">{school.name}</h3>
                        <p className="text-xs text-gray-400">📍 {school.city}</p>
                    </div>
                </div>
                <div className="flex items-center justify-between mb-3">
                    <StarRating value={school.average_rating} />
                    <span className="text-xs text-gray-400">{school.reviews_count ?? 0} avis</span>
                </div>
                {school.categories?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                        {school.categories.map(c => (
                            <span key={c.id} className="text-xs bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full">{c.code}</span>
                        ))}
                    </div>
                )}
                <Link href={route('school.detail', school.slug)}
                    className="block text-center py-2 text-sm font-medium text-orange-600 border border-orange-200 rounded-lg hover:bg-orange-50 transition-colors">
                    Voir les détails →
                </Link>
            </div>
        </div>
    );
}

export default function Favorites({ favorites }) {
    const removeFavorite = (school) => {
        if (confirm(`Retirer "${school.name}" de vos favoris ?`)) {
            router.post(route('user.favorites.toggle', school.id), {}, { preserveScroll: true });
        }
    };

    return (
        <UserLayout title="Mes favoris">
            <Head title="Mes écoles favorites" />

            {favorites.data?.length > 0 ? (
                <>
                    <p className="text-sm text-gray-500 mb-4">{favorites.total} école(s) en favoris</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                        {favorites.data.map(school => (
                            <SchoolCard key={school.id} school={school} onRemove={removeFavorite} />
                        ))}
                    </div>

                    {favorites.last_page > 1 && (
                        <div className="flex justify-center gap-2 mt-8">
                            {favorites.links?.map((link, i) => (
                                <button key={i} disabled={!link.url}
                                    onClick={() => link.url && router.get(link.url)}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium border ${
                                        link.active ? 'bg-orange-600 text-white border-orange-600'
                                        : link.url ? 'border-gray-200 text-gray-700 hover:border-orange-400'
                                        : 'border-gray-100 text-gray-300 cursor-not-allowed'
                                    }`}
                                    dangerouslySetInnerHTML={{ __html: link.label }} />
                            ))}
                        </div>
                    )}
                </>
            ) : (
                <div className="bg-white rounded-xl border border-gray-200 py-20 text-center">
                    <p className="text-5xl mb-4">❤️</p>
                    <h3 className="text-gray-900 font-semibold text-lg mb-2">Aucun favori pour le moment</h3>
                    <p className="text-gray-500 text-sm mb-6">
                        Ajoutez des auto-écoles à vos favoris pour les retrouver facilement.
                    </p>
                    <Link href={route('search')}
                        className="inline-block px-6 py-2.5 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700">
                        Explorer les auto-écoles
                    </Link>
                </div>
            )}
        </UserLayout>
    );
}
