import { useEffect, useRef, useState } from 'react';

const HIDDEN_TRANSFORM = {
    up:    'opacity-0 translate-y-8',
    down:  'opacity-0 -translate-y-8',
    left:  'opacity-0 translate-x-8',
    right: 'opacity-0 -translate-x-8',
    zoom:  'opacity-0 scale-95',
    none:  'opacity-0',
};

/**
 * Fades/slides/zooms a section in the first time it scrolls into view.
 * Marketing pages only — one IntersectionObserver per instance, no motion
 * library. No-ops (renders visible immediately) when prefers-reduced-motion
 * is set. `direction`: 'up' (default) | 'down' | 'left' | 'right' | 'zoom' | 'none'.
 */
export default function Reveal({ as: Tag = 'div', delay = 0, direction = 'up', className = '', children, ...props }) {
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

    const hidden = HIDDEN_TRANSFORM[direction] ?? HIDDEN_TRANSFORM.up;

    return (
        <Tag
            ref={ref}
            className={`transition-all duration-700 ease-out ${visible ? 'opacity-100 translate-x-0 translate-y-0 scale-100' : hidden} ${className}`}
            style={{ transitionDelay: visible ? `${delay}ms` : '0ms' }}
            {...props}
        >
            {children}
        </Tag>
    );
}
