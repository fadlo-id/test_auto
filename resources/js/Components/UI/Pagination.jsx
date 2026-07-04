import { Link } from '@inertiajs/react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/20/solid';

/**
 * Renders a Laravel paginator's `links` array without dangerouslySetInnerHTML —
 * parses the "&laquo; Previous" / "Next &raquo;" labels into real Heroicons
 * chevrons instead of injecting raw HTML entities.
 *
 * Usage: <Pagination paginator={users} />
 */
export default function Pagination({ paginator, preserveScroll = true }) {
    if (!paginator || paginator.last_page <= 1) return null;

    return (
        <div className="px-4 py-4 border-t border-gray-50 dark:border-zinc-800 flex gap-1.5 justify-center flex-wrap">
            {paginator.links.map((link, i) => {
                const isPrev = link.label.includes('Previous') || link.label.includes('laquo');
                const isNext = link.label.includes('Next') || link.label.includes('raquo');
                const disabled = !link.url;

                const baseClasses = 'inline-flex items-center justify-center min-w-[2.25rem] px-3 py-1.5 rounded-lg text-sm font-medium transition-colors';
                const stateClasses = link.active
                    ? 'bg-orange-600 text-white shadow-sm'
                    : disabled
                        ? 'bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 text-gray-300 dark:text-zinc-700 cursor-default pointer-events-none'
                        : 'bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-zinc-400 hover:border-orange-300 dark:hover:border-orange-500/50 hover:text-orange-700 dark:hover:text-orange-400';

                const content = isPrev
                    ? <ChevronLeftIcon className="w-4 h-4" />
                    : isNext
                        ? <ChevronRightIcon className="w-4 h-4" />
                        : link.label;

                return (
                    <Link
                        key={i}
                        href={link.url ?? '#'}
                        preserveScroll={preserveScroll}
                        aria-label={isPrev ? 'Page précédente' : isNext ? 'Page suivante' : `Page ${link.label}`}
                        aria-current={link.active ? 'page' : undefined}
                        className={`${baseClasses} ${stateClasses}`}
                    >
                        {content}
                    </Link>
                );
            })}
        </div>
    );
}
