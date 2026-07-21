import { Head, Link } from '@inertiajs/react';
import { useLocale } from '@/i18n/LocaleContext';

export default function Terms({ content = '' }) {
    const { t } = useLocale();
    const SECTIONS = [
        { title: t('pages.termsSection1Title'), content: t('pages.termsSection1Content') },
        { title: t('pages.termsSection2Title'), content: t('pages.termsSection2Content') },
        { title: t('pages.termsSection3Title'), content: t('pages.termsSection3Content') },
        { title: t('pages.termsSection4Title'), content: t('pages.termsSection4Content') },
        { title: t('pages.termsSection5Title'), content: t('pages.termsSection5Content') },
        { title: t('pages.termsSection6Title'), content: t('pages.termsSection6Content') },
        { title: t('pages.termsSection7Title'), content: t('pages.termsSection7Content') },
    ];

    return (
        <>
            <Head>
                <title>{t('pages.termsMetaTitle')}</title>
                <meta name="description" content={t('pages.termsMetaDesc')} />
            </Head>
            <div className="min-h-screen bg-gray-50">
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 text-white py-16 px-4">
                    <div className="max-w-3xl mx-auto">
                        <h1 className="text-3xl font-bold mb-2">{t('pages.termsTitle')}</h1>
                        <p className="text-gray-400 text-sm">{t('pages.lastUpdatedJan2026')}</p>
                    </div>
                </div>

                <div className="max-w-3xl mx-auto px-4 py-12">
                    {content && (
                        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
                            <div className="prose prose-gray max-w-none text-sm text-gray-600 leading-relaxed"
                                dangerouslySetInnerHTML={{ __html: content }} />
                        </div>
                    )}
                    <div className="bg-white rounded-2xl border border-gray-200 divide-y divide-gray-100">
                        {SECTIONS.map(s => (
                            <div key={s.title} className="p-6">
                                <h2 className="font-semibold text-gray-900 mb-3">{s.title}</h2>
                                <p className="text-sm text-gray-600 leading-relaxed">{s.content}</p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 flex flex-wrap gap-4 justify-center text-sm text-gray-400">
                        <Link href={route('home')} className="hover:text-red-600">{t('nav.home')}</Link>
                        <Link href={route('privacy')} className="hover:text-red-600">{t('footer.privacy')}</Link>
                        <Link href={route('contact')} className="hover:text-red-600">{t('nav.contact')}</Link>
                    </div>
                </div>
            </div>
        </>
    );
}
