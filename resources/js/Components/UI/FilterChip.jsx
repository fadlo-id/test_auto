import { X } from 'lucide-react';

/**
 * Removable pill representing one active filter on the search page.
 * Usage: <FilterChip label="Rabat" onRemove={() => ...} />
 */
export default function FilterChip({ label, onRemove, className = '' }) {
    return (
        <span
            className={`inline-flex items-center gap-1.5 pl-3 pr-2 py-1.5 rounded-full text-sm font-medium
                        bg-orange-50 text-orange-700 border border-orange-200
                        dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/30 ${className}`}
        >
            {label}
            <button
                type="button"
                onClick={onRemove}
                aria-label={`Retirer le filtre ${label}`}
                className="w-4 h-4 rounded-full flex items-center justify-center hover:bg-orange-200/70 dark:hover:bg-orange-500/20 transition-colors"
            >
                <X className="w-3 h-3" />
            </button>
        </span>
    );
}
