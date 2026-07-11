import { Star } from 'lucide-react';

/**
 * Read-only star rating display. `rating` is 0-5 and can be fractional —
 * partial stars are clipped with a width mask rather than rounded away.
 */
export default function RatingStars({ rating = 0, count, size = 'md', className = '' }) {
    const clamped = Math.max(0, Math.min(5, Number(rating) || 0));
    const sizeClass = { sm: 'w-3.5 h-3.5', md: 'w-4 h-4', lg: 'w-5 h-5' }[size] ?? 'w-4 h-4';
    const textSize = { sm: 'text-xs', md: 'text-sm', lg: 'text-base' }[size] ?? 'text-sm';

    return (
        <div className={`inline-flex items-center gap-1.5 ${className}`}>
            <div className="relative inline-flex" aria-hidden="true">
                <div className="flex gap-0.5 text-gray-200 dark:text-zinc-700">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={sizeClass} fill="currentColor" stroke="none" />
                    ))}
                </div>
                <div
                    className="absolute inset-0 flex gap-0.5 overflow-hidden text-orange-500"
                    style={{ width: `${(clamped / 5) * 100}%` }}
                >
                    {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={sizeClass} fill="currentColor" stroke="none" />
                    ))}
                </div>
            </div>
            <span className={`sr-only`}>{clamped.toFixed(1)} sur 5</span>
            <span className={`font-semibold text-gray-900 dark:text-zinc-100 tabular-nums ${textSize}`} aria-hidden="true">
                {clamped.toFixed(1)}
            </span>
            {count != null && (
                <span className={`text-gray-400 dark:text-zinc-500 ${textSize}`}>({count})</span>
            )}
        </div>
    );
}
