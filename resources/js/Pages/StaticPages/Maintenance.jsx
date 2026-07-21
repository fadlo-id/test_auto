import { Head, Link } from '@inertiajs/react';
import { useLocale } from '@/i18n/LocaleContext';

export default function Maintenance() {
    const { t } = useLocale();
    return (
        <>
            <Head>
                <title>{t('pages.maintenanceMetaTitle')}</title>
                <meta name="robots" content="noindex, nofollow" />
            </Head>
            <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center px-4 text-center">
                <div className="text-6xl mb-6">🔧</div>
                <h1 className="text-3xl font-bold text-white mb-3">{t('pages.maintenanceTitle')}</h1>
                <p className="text-gray-400 max-w-md leading-relaxed mb-8">
                    {t('pages.maintenanceDesc')}
                </p>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    {t('pages.maintenanceStatus')}
                </div>
                <div className="mt-12">
                    <Link href={route('login')} className="text-xs text-gray-600 hover:text-gray-400 underline underline-offset-2">
                        {t('pages.maintenanceAdminAccess')}
                    </Link>
                </div>
            </div>
        </>
    );
}
