import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

/**
 * Anchor-linkable FAQ accordion. Each item gets a stable id (slugified from
 * the question unless `id` is provided) so questions can be deep-linked from
 * support messages or search results.
 */
export default function Accordion({ items = [], defaultOpenId = null, className = '' }) {
    const [openId, setOpenId] = useState(defaultOpenId);

    return (
        <div className={`divide-y divide-gray-100 dark:divide-zinc-800 ${className}`}>
            {items.map((item, idx) => {
                const id = item.id ?? slugify(item.question) ?? `faq-${idx}`;
                const isOpen = openId === id;

                return (
                    <div key={id} id={id} className="scroll-mt-24">
                        <h3>
                            <button
                                type="button"
                                onClick={() => setOpenId(isOpen ? null : id)}
                                aria-expanded={isOpen}
                                aria-controls={`${id}-panel`}
                                className="w-full flex items-center justify-between gap-4 py-5 text-left text-gray-900 dark:text-zinc-100 font-semibold hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                            >
                                <span>{item.question}</span>
                                <ChevronDown
                                    className={`w-5 h-5 flex-shrink-0 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-orange-600' : ''}`}
                                />
                            </button>
                        </h3>
                        <div
                            id={`${id}-panel`}
                            role="region"
                            className={`grid transition-all duration-200 ease-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
                        >
                            <div className="overflow-hidden">
                                <p className="pb-5 text-sm text-gray-500 dark:text-zinc-400 leading-relaxed max-w-2xl">
                                    {item.answer}
                                </p>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

function slugify(text) {
    if (!text) return null;
    const diacritics = new RegExp('[\\u0300-\\u036f]', 'g');
    return text
        .toLowerCase()
        .normalize('NFD').replace(diacritics, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
}
