import { useEffect, useRef, useState } from 'react';

/**
 * Fades/slides a section in the first time it scrolls into view. Marketing
 * pages only — one IntersectionObserver per instance, no motion library.
 * No-ops (renders visible immediately) when prefers-reduced-motion is set.
 */
export default function Reveal({ as: Tag = 'div', delay = 0, className = '', children, ...props }) {
    const ref = useRef(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
            setVisible(true);
            return;
        }
        const node = ref.current;
        if (!node) return;
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setVisible(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.15 }
        );
        observer.observe(node);
        return () => observer.disconnect();
    }, []);

    return (
        <Tag
            ref={ref}
            className={`transition-all duration-700 ease-out ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'} ${className}`}
            style={{ transitionDelay: visible ? `${delay}ms` : '0ms' }}
            {...props}
        >
            {children}
        </Tag>
    );
}
