import { Star, MessageCircle } from 'lucide-react';
import { useLocale } from '@/i18n/LocaleContext';

const DATE_LOCALES = { fr: 'fr-FR', en: 'en-US', es: 'es-ES', ar: 'ar-MA' };

export default function ReviewCard({ review }) {
    const { t, locale } = useLocale();
    const rating = Math.round(Number(review.rating) || 0);

    return (
        <div className="bg-white border border-gray-100 rounded-2xl p-5 hover:border-red-100 hover:shadow-sm transition-all">
            <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-400 to-amber-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-sm">
                        {review.user?.name?.[0]?.toUpperCase() ?? '?'}
                    </div>
                    <div>
                        <p className="font-semibold text-gray-900 text-sm">{review.user?.name ?? t('reviewCard.anonymousUser')}</p>
                        <div className="flex items-center gap-0.5 mt-0.5" aria-label={`${rating} ${t('reviewCard.outOf5')}`}>
                            {[1, 2, 3, 4, 5].map((i) => (
                                <Star key={i} className={`w-3.5 h-3.5 ${i <= rating ? 'text-red-400' : 'text-gray-200'}`} fill="currentColor" stroke="none" />
                            ))}
                        </div>
                    </div>
                </div>
                {review.created_at && (
                    <span className="text-xs text-gray-400 whitespace-nowrap mt-1">
                        {new Date(review.created_at).toLocaleDateString(DATE_LOCALES[locale] ?? 'fr-FR')}
                    </span>
                )}
            </div>
            {review.title && <p className="font-semibold text-gray-800 text-sm mb-1">{review.title}</p>}
            {review.content && <p className="text-gray-600 text-sm leading-relaxed">{review.content}</p>}
            {review.owner_reply && (
                <div className="mt-3 ml-4 pl-4 border-l-2 border-red-200 bg-red-50/60 rounded-r-xl p-3.5">
                    <p className="text-xs font-semibold text-red-700 mb-1 flex items-center gap-1.5">
                        <MessageCircle className="w-3 h-3" />
                        {t('reviewCard.ownerReply')}
                    </p>
                    <p className="text-sm text-gray-700 leading-relaxed">{review.owner_reply}</p>
                </div>
            )}
        </div>
    );
}
