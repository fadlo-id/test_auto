import { Link } from '@inertiajs/react';
import { useLocale } from '@/i18n/LocaleContext';

/**
 * Persistent bottom-left WhatsApp shortcut, present on every public page
 * (matches the reference site's floating button). Links to the Contact
 * page rather than a wa.me chat since no site-wide phone number is
 * available via Inertia props on every page.
 */
export default function FloatingWhatsApp() {
    const { t } = useLocale();
    return (
        <Link href={route('contact')}
            aria-label={t('common.contactWhatsapp')}
            className="fixed bottom-5 left-5 z-40 w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#20bd5a] shadow-elevated hover:shadow-xl flex items-center justify-center transition-all hover:scale-105 animate-float-slow">
            <svg viewBox="0 0 32 32" className="w-7 h-7 fill-white">
                <path d="M16.001 3C9.373 3 4 8.373 4 15c0 2.362.687 4.564 1.872 6.417L4 29l7.77-1.831A11.93 11.93 0 0 0 16.001 27C22.628 27 28 21.627 28 15S22.628 3 16.001 3zm6.995 17.043c-.29.816-1.44 1.494-2.35 1.688-.626.132-1.443.238-4.196-.9-3.52-1.457-5.788-5.03-5.965-5.264-.17-.234-1.428-1.9-1.428-3.623 0-1.723.905-2.567 1.226-2.918.32-.351.7-.44.933-.44.234 0 .467.002.671.012.216.01.505-.082.79.603.29.7.984 2.418 1.07 2.594.086.176.144.38.03.614-.116.234-.174.38-.35.585-.176.205-.37.457-.528.614-.176.176-.36.367-.155.72.205.351.912 1.505 1.958 2.437 1.346 1.2 2.48 1.573 2.833 1.75.35.176.556.146.76-.088.205-.234.878-1.023 1.113-1.374.234-.351.468-.293.79-.176.32.117 2.034.96 2.383 1.135.35.176.583.263.67.41.087.146.087.848-.204 1.663z"/>
            </svg>
        </Link>
    );
}
