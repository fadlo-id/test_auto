import { Link } from '@inertiajs/react';

function Stars({ value = 0, size = 'sm' }) {
    const n = Math.round(Number(value) || 0);
    const cls = size === 'sm' ? 'text-sm' : 'text-base';
    return (
        <span className={cls}>
            {[1, 2, 3, 4, 5].map((i) => (
                <span key={i} className={i <= n ? 'text-yellow-400' : 'text-gray-200'}>★</span>
            ))}
        </span>
    );
}

export default function SchoolCard({ school, priority = false }) {
    const reviews = school.reviews_count ?? school.review_count ?? 0;
    const rating  = Number(school.average_rating ?? 0);
    const verified = !!school.verified_at;

    return (
        <Link href={route('school.detail', school.slug)}
            className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:border-orange-200 hover:shadow-lg transition-all duration-200 flex flex-col">

            {/* Banner */}
            <div className="h-40 bg-gradient-to-br from-orange-50 to-amber-50 overflow-hidden relative">
                {school.banner_url
                    ? <img src={`/storage/${school.banner_url}`} alt={school.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading={priority ? 'eager' : 'lazy'} />
                    : <div className="w-full h-full flex items-center justify-center text-orange-200 text-5xl">🏫</div>}
                {verified && (
                    <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-emerald-600 text-xs font-semibold px-2 py-0.5 rounded-full border border-emerald-100 flex items-center gap-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                        Vérifié
                    </span>
                )}
            </div>

            {/* Body */}
            <div className="p-4 flex flex-col gap-3 flex-1">
                <div className="flex items-start gap-3">
                    {/* Logo */}
                    <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 overflow-hidden flex-shrink-0 flex items-center justify-center shadow-sm">
                        {school.logo_url
                            ? <img src={`/storage/${school.logo_url}`} alt="" className="w-full h-full object-cover" loading="lazy" />
                            : <span className="text-orange-400 text-base">🚗</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h2 className="font-semibold text-gray-900 text-sm leading-snug truncate group-hover:text-orange-700 transition-colors">
                            {school.name}
                        </h2>
                        <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                            <svg className="w-3 h-3 text-gray-400 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
                            </svg>
                            {school.city}{school.region ? `, ${school.region}` : ''}
                        </p>
                    </div>
                </div>

                {/* Rating */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                        <Stars value={rating} />
                        <span className="text-xs font-medium text-gray-700">{rating > 0 ? rating.toFixed(1) : '—'}</span>
                    </div>
                    <span className="text-xs text-gray-400">{reviews} avis</span>
                </div>

                {/* Categories */}
                {school.categories?.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                        {school.categories.slice(0, 4).map((c) => (
                            <span key={c.id} className="text-xs bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full font-medium border border-orange-100">
                                {c.code}
                            </span>
                        ))}
                        {school.categories.length > 4 && (
                            <span className="text-xs text-gray-400 px-1 py-0.5">+{school.categories.length - 4}</span>
                        )}
                    </div>
                )}

                {/* CTA */}
                <div className="mt-auto pt-1">
                    <span className="block text-center py-2 text-sm font-medium text-orange-600 bg-orange-50 rounded-xl group-hover:bg-orange-100 transition-colors border border-orange-100">
                        Voir les détails →
                    </span>
                </div>
            </div>
        </Link>
    );
}
