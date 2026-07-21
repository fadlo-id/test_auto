import { X } from 'lucide-react';

/**
 * Removable pill representing one active filter on the search page.
 * Usage: <FilterChip label="Rabat" onRemove={() => ...} />
 */
export default function FilterChip({ label, onRemove, removeLabel, className = '' }) {
    return (
        <span
            className={`inline-flex items-center gap-1.5 pl-3 pr-2 py-1.5 rounded-full text-sm font-medium
                        bg-red-50 text-red-700 border border-red-200
                        dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/30 ${className}`}
        >
            {label}
            <button
                type="button"
                onClick={onRemove}
                aria-label={removeLabel || `Retirer le filtre ${label}`}
                className="w-4 h-4 rounded-full flex items-center justify-center hover:bg-red-200/70 dark:hover:bg-red-500/20 transition-colors"
            >
                <X className="w-3 h-3" />
            </button>
        </span>
    );
}
