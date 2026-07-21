import PublicNavbar from '@/Components/PublicNavbar';
import PublicFooter from '@/Components/PublicFooter';
import FloatingWhatsApp from '@/Components/FloatingWhatsApp';
import { useLocaleDirection } from '@/i18n/LocaleContext';

/**
 * Shared chrome for public marketing pages — sticky navbar + footer.
 * Pages compose their own <Head> and content between the two.
 */
export default function PublicLayout({ transparent = false, children }) {
    useLocaleDirection();
    return (
        <div className="min-h-screen bg-white flex flex-col">
            <PublicNavbar transparent={transparent} />
            <main className="flex-1">{children}</main>
            <PublicFooter />
            <FloatingWhatsApp />
        </div>
    );
}
