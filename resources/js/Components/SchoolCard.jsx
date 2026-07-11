import { Link } from '@inertiajs/react';
import { MapPin, ShieldCheck, Sparkles, Car } from 'lucide-react';
import RatingStars from '@/Components/UI/RatingStars';

export default function SchoolCard({ school, priority = false, featured = false }) {
    const reviews = school.reviews_count ?? school.review_count ?? 0;
    const rating  = Number(school.average_rating ?? 0);
    const verified = !!school.verified_at;

    return (
        <Link href={route('school.detail', school.slug)}
            className={`group bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden transition-all duration-200 flex flex-col ${
                featured
                    ? 'border-2 border-orange-300 dark:border-orange-500/40 shadow-lg shadow-orange-100 dark:shadow-none hover:shadow-xl hover:border-orange-400'
                    : 'border border-gray-100 dark:border-zinc-800 hover:border-orange-200 dark:hover:border-orange-500/30 hover:shadow-lg'
            }`}>

            {/* Banner */}
            <div className="h-40 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-zinc-800 dark:to-zinc-800 overflow-hidden relative">
                {school.banner_url
                    ? <img src={`/storage/${school.banner_url}`} alt={school.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading={priority ? 'eager' : 'lazy'} />
                    : <div className="w-full h-full flex items-center justify-center text-orange-200 dark:text-zinc-700">
                        <Car className="w-12 h-12" strokeWidth={1.25} />
                      </div>}

                <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2">
                    {featured ? (
                        <span className="inline-flex items-center gap-1 bg-orange-600 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
                            <Sparkles className="w-3 h-3" />
                            En vedette
                        </span>
                    ) : <span />}
                    {verified && (
                        <span className="inline-flex items-center gap-1 bg-white/95 dark:bg-zinc-900/90 backdrop-blur-sm text-emerald-600 dark:text-emerald-400 text-xs font-semibold px-2 py-0.5 rounded-full border border-emerald-100 dark:border-emerald-500/30">
                            <ShieldCheck className="w-3 h-3" />
                            Vérifié
                        </span>
                    )}
                </div>
            </div>

            {/* Body */}
            <div className="p-4 flex flex-col gap-3 flex-1">
                <div className="flex items-start gap-3">
                    {/* Logo */}
                    <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 overflow-hidden flex-shrink-0 flex items-center justify-center shadow-sm">
                        {school.logo_url
                            ? <img src={`/storage/${school.logo_url}`} alt="" className="w-full h-full object-cover" loading="lazy" />
                            : <Car className="w-5 h-5 text-orange-400" strokeWidth={1.5} />}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h2 className="font-semibold text-gray-900 dark:text-zinc-100 text-sm leading-snug truncate group-hover:text-orange-700 dark:group-hover:text-orange-400 transition-colors">
                            {school.name}
                        </h2>
                        <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-gray-400 dark:text-zinc-500 shrink-0" />
                            {school.city}{school.region ? `, ${school.region}` : ''}
                        </p>
                    </div>
                </div>

                {/* Rating */}
                <div className="flex items-center justify-between">
                    <RatingStars rating={rating} size="sm" />
                    <span className="text-xs text-gray-400 dark:text-zinc-500">{reviews} avis</span>
                </div>

                {/* Categories */}
                {school.categories?.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                        {school.categories.slice(0, 4).map((c) => (
                            <span key={c.id} className="text-xs bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 px-2 py-0.5 rounded-full font-medium border border-orange-100 dark:border-orange-500/20">
                                {c.code}
                            </span>
                        ))}
                        {school.categories.length > 4 && (
                            <span className="text-xs text-gray-400 dark:text-zinc-500 px-1 py-0.5">+{school.categories.length - 4}</span>
                        )}
                    </div>
                )}

                {/* CTA */}
                <div className="mt-auto pt-1">
                    <span className="block text-center py-2 text-sm font-medium text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-500/10 rounded-xl group-hover:bg-orange-100 dark:group-hover:bg-orange-500/20 transition-colors border border-orange-100 dark:border-orange-500/20">
                        Voir les détails →
                    </span>
                </div>
            </div>
        </Link>
    );
}
