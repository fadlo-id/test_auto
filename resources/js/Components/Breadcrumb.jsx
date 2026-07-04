import { Link } from '@inertiajs/react';
import { ChevronRight, Home } from 'lucide-react';

/**
 * Breadcrumb navigation.
 * @param {Array} items - [{label, href}] — last item href=null (current page)
 * @param {string} className - additional wrapper classes
 */
export default function Breadcrumb({ items = [], className = '' }) {
    if (!items || items.length < 2) return null;

    return (
        <nav aria-label="Fil d'Ariane" className={`flex items-center gap-1 text-sm text-gray-500 flex-wrap ${className}`}>
            {items.map((item, idx) => {
                const isLast = idx === items.length - 1;
                return (
                    <span key={idx} className="flex items-center gap-1">
                        {idx === 0 ? (
                            item.href
                                ? <Link href={item.href} className="flex items-center gap-1 hover:text-orange-600 transition-colors">
                                    <Home className="w-3.5 h-3.5" />
                                    <span className="sr-only">{item.label}</span>
                                  </Link>
                                : <span className="flex items-center"><Home className="w-3.5 h-3.5" /></span>
                        ) : (
                            isLast
                                ? <span className="text-gray-800 font-medium truncate max-w-[200px]" aria-current="page">{item.label}</span>
                                : <Link href={item.href} className="hover:text-orange-600 transition-colors truncate max-w-[150px]">{item.label}</Link>
                        )}
                        {!isLast && <ChevronRight className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />}
                    </span>
                );
            })}
        </nav>
    );
}
