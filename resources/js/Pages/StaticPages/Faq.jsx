import { Head, Link } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import Accordion from '@/Components/UI/Accordion';
import Reveal from '@/Components/UI/Reveal';
import { useLocale } from '@/i18n/LocaleContext';

export default function Faq({ content = '' }) {
    const { t } = useLocale();
    const FAQS = [
        {
            cat: t('pages.faqCatCandidates'),
            items: [
                { question: t('pages.faqCand1Q'), answer: t('pages.faqCand1A') },
                { question: t('pages.faqCand2Q'), answer: t('pages.faqCand2A') },
                { question: t('pages.faqCand3Q'), answer: t('pages.faqCand3A') },
                { question: t('pages.faqCand4Q'), answer: t('pages.faqCand4A') },
            ],
        },
        {
            cat: t('pages.faqCatSchools'),
            items: [
                { question: t('pages.faqSchool1Q'), answer: t('pages.faqSchool1A') },
                { question: t('pages.faqSchool2Q'), answer: t('pages.faqSchool2A') },
                { question: t('pages.faqSchool3Q'), answer: t('pages.faqSchool3A') },
                { question: t('pages.faqSchool4Q'), answer: t('pages.faqSchool4A') },
            ],
        },
    ];

    return (
        <>
            <Head>
                <title>{t('pages.faqMetaTitle')}</title>
                <meta name="description" content={t('pages.faqMetaDesc')} />
            </Head>

            <PublicLayout>
                <div className="relative bg-gradient-to-br from-gray-950 via-red-950 to-gray-900 overflow-hidden py-20 px-4">
                    <div className="absolute inset-0 bg-mesh-brand pointer-events-none" />
                    <Reveal className="relative max-w-3xl mx-auto text-center">
                        <p className="text-red-400 text-xs font-bold uppercase tracking-widest mb-3">{t('pages.faqEyebrow')}</p>
                        <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-3 font-display">{t('pages.faqHeroTitle')}</h1>
                        <p className="text-gray-300">{t('pages.faqHeroSubtitle')}</p>
                    </Reveal>
                </div>

                <div className="bg-gray-50">
                    <div className="max-w-3xl mx-auto px-4 py-16 space-y-12">
                        {content && (
                            <Reveal className="card-premium p-8">
                                <div className="prose prose-gray max-w-none text-gray-600 leading-relaxed"
                                    dangerouslySetInnerHTML={{ __html: content }} />
                            </Reveal>
                        )}
                        {FAQS.map((section, i) => (
                            <Reveal key={section.cat} delay={i * 80}>
                                <h2 className="text-lg font-bold text-gray-900 mb-3">{section.cat}</h2>
                                <div className="card-premium px-5">
                                    <Accordion items={section.items} />
                                </div>
                            </Reveal>
                        ))}

                        <Reveal className="bg-red-50 rounded-3xl p-8 text-center border border-red-100">
                            <p className="text-gray-900 font-semibold mb-2">{t('pages.faqNotListedTitle')}</p>
                            <p className="text-gray-500 text-sm mb-4">{t('pages.faqNotListedDesc')}</p>
                            <Link href={route('contact')}
                                className="inline-block px-6 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors shadow-sm">
                                {t('pages.faqContactBtn')}
                            </Link>
                        </Reveal>
                    </div>
                </div>
            </PublicLayout>
        </>
    );
}
