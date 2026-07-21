import { Link } from '@inertiajs/react';
import { MapPin, BadgeCheck, Sparkles, Car, Phone, Star, ArrowRight } from 'lucide-react';
import { useLocale } from '@/i18n/LocaleContext';

export default function SchoolCard({ school, priority = false, featured = false }) {
    const { t } = useLocale();
    const reviews  = school.reviews_count ?? school.review_count ?? 0;
    const rating   = Number(school.average_rating ?? 0);
    const verified = !!school.verified_at;

    return (
        <Link href={route('school.detail', school.slug)}
            className={`group bg-white rounded-3xl overflow-hidden transition-all duration-300 ease-out flex flex-col will-change-transform hover:-translate-y-1.5 hover:scale-[1.012] ${
                featured
                    ? 'border-2 border-red-300 shadow-glow'
                    : 'border border-gray-100 shadow-premium hover:shadow-elevated hover:border-red-200'
            }`}>

            {/* Banner */}
            <div className="h-48 bg-gradient-to-br from-red-50 to-amber-50 overflow-hidden relative">
                {school.banner_url
                    ? <img src={`/storage/${school.banner_url}`} alt={school.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                        loading={priority ? 'eager' : 'lazy'} />
                    : <div className="w-full h-full flex items-center justify-center text-red-200 group-hover:scale-110 transition-transform duration-700 ease-out">
                        <Car className="w-14 h-14" strokeWidth={1.25} />
                      </div>}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/5 to-transparent" />

                {/* City badge + featured ribbon — top-left */}
                <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2">
                    <div className="flex flex-col gap-1.5 items-start">
                        {featured && (
                            <span className="inline-flex items-center gap-1 bg-red-600 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
                                <Sparkles className="w-3 h-3" />
                                {t('schoolCard.featured')}
                            </span>
                        )}
                        <span className="inline-flex items-center gap-1 bg-black/55 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                            <MapPin className="w-3 h-3" />
                            {school.city}
                        </span>
                    </div>
                    {/* Rating pill — top-right */}
                    {rating > 0 && (
                        <span className="inline-flex items-center gap-1 bg-white/95 backdrop-blur-sm text-gray-900 text-xs font-bold px-2.5 py-1 rounded-full shadow-sm shrink-0">
                            <Star className="w-3 h-3 text-amber-400" fill="currentColor" />
                            {rating.toFixed(1)}
                            {reviews > 0 && <span className="text-gray-400 font-medium">({reviews})</span>}
                        </span>
                    )}
                </div>

                {/* Logo overlapping the banner */}
                <div className="absolute -bottom-6 left-4 w-14 h-14 rounded-2xl bg-white border-4 border-white shadow-md overflow-hidden flex items-center justify-center transition-shadow duration-300 group-hover:ring-2 group-hover:ring-red-400/60">
                    {school.logo_url
                        ? <img src={`/storage/${school.logo_url}`} alt="" className="w-full h-full object-cover" loading="lazy" />
                        : <Car className="w-6 h-6 text-red-400" strokeWidth={1.75} />}
                </div>
            </div>

            {/* Body */}
            <div className="p-4 pt-8 flex flex-col gap-3 flex-1">
                <div>
                    <h2 className="font-bold text-gray-900 text-base leading-snug truncate group-hover:text-red-700 transition-colors flex items-center gap-1.5">
                        <span className="truncate">{school.name}</span>
                        {verified && <BadgeCheck className="w-4 h-4 text-blue-500 shrink-0" fill="currentColor" stroke="white" />}
                    </h2>
                    {school.address && (
                        <p className="text-xs text-gray-500 mt-1 truncate">{school.address}</p>
                    )}
                    {school.phone && (
                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1 truncate">
                            <Phone className="w-3 h-3 text-gray-400 shrink-0" />
                            {school.phone}
                        </p>
                    )}
                </div>

                {/* Categories */}
                {school.categories?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                        {school.categories.slice(0, 4).map((c) => (
                            <span key={c.id} className="text-xs bg-gradient-to-br from-red-50 to-amber-50 text-red-700 px-2.5 py-1 rounded-lg font-semibold border border-red-100">
                                {c.code}
                            </span>
                        ))}
                        {school.categories.length > 4 && (
                            <span className="text-xs text-gray-400 px-1 py-1 font-medium">+{school.categories.length - 4}</span>
                        )}
                    </div>
                )}

                {/* CTA */}
                <div className="mt-auto pt-3 border-t border-gray-50">
                    <span className="btn-shine flex items-center justify-center gap-1.5 text-center py-2.5 text-sm font-semibold text-red-600 bg-red-50 rounded-xl group-hover:bg-red-600 group-hover:text-white transition-colors duration-300">
                        {t('common.viewDetails')}
                        <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                    </span>
                </div>
            </div>
        </Link>
    );
}
