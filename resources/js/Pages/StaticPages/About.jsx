import { Head, Link } from '@inertiajs/react';
import { Car, CheckCircle2, Eye, Users } from 'lucide-react';
import PublicLayout from '@/Layouts/PublicLayout';
import Reveal from '@/Components/UI/Reveal';
import { useLocale } from '@/i18n/LocaleContext';

function CmsContent({ html }) {
    if (!html) return null;
    return (
        <div
            className="prose prose-gray max-w-none text-gray-600 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: html }}
        />
    );
}

export default function About({ content = '' }) {
    const { t } = useLocale();
    const VALUES = [
        { icon: CheckCircle2, color: 'bg-green-50 text-green-600', title: t('pages.aboutValue1Title'), desc: t('pages.aboutValue1Desc') },
        { icon: Eye, color: 'bg-red-50 text-red-600', title: t('pages.aboutValue2Title'), desc: t('pages.aboutValue2Desc') },
        { icon: Users, color: 'bg-blue-50 text-blue-600', title: t('pages.aboutValue3Title'), desc: t('pages.aboutValue3Desc') },
    ];

    return (
        <>
            <Head>
                <title>{t('pages.aboutMetaTitle')}</title>
                <meta name="description" content={t('pages.aboutMetaDesc')} />
            </Head>

            <PublicLayout>
                {/* Hero */}
                <div className="relative bg-gradient-to-br from-gray-950 via-red-950 to-gray-900 overflow-hidden py-24 px-4">
                    <div className="absolute inset-0 bg-mesh-brand pointer-events-none" />
                    <Reveal className="relative max-w-3xl mx-auto text-center">
                        <p className="text-red-400 text-xs font-bold uppercase tracking-widest mb-3">{t('pages.aboutEyebrow')}</p>
                        <h1 className="text-3xl sm:text-5xl font-extrabold text-white mb-4 font-display">{t('pages.aboutHeroTitle')}</h1>
                        <p className="text-xl text-gray-300">{t('pages.aboutHeroSubtitle')}</p>
                    </Reveal>
                </div>

                <div className="bg-gray-50">
                    <div className="max-w-4xl mx-auto px-4 py-16 space-y-16">
                        {content && (
                            <Reveal className="card-premium p-8">
                                <CmsContent html={content} />
                            </Reveal>
                        )}

                        {/* Mission */}
                        <Reveal className="grid md:grid-cols-2 gap-8 items-center">
                            <div>
                                <p className="eyebrow">{t('pages.aboutMissionEyebrow')}</p>
                                <h2 className="text-2xl font-extrabold text-gray-900 mb-4 font-display">{t('pages.aboutMissionTitle')}</h2>
                                <p className="text-gray-600 leading-relaxed mb-4">
                                    {t('pages.aboutMissionP1')}
                                </p>
                                <p className="text-gray-600 leading-relaxed">
                                    {t('pages.aboutMissionP2')}
                                </p>
                            </div>
                            <div className="card-premium p-8 text-center">
                                <Car className="w-12 h-12 text-red-300 mx-auto mb-3" strokeWidth={1.25} />
                                <p className="text-3xl font-extrabold text-red-600 font-display">500+</p>
                                <p className="text-gray-500 text-sm">{t('pages.aboutStatSchools')}</p>
                                <div className="mt-4 pt-4 border-t border-gray-100">
                                    <p className="text-3xl font-extrabold text-red-600 font-display">50k+</p>
                                    <p className="text-gray-500 text-sm">{t('pages.aboutStatCandidates')}</p>
                                </div>
                            </div>
                        </Reveal>

                        {/* Values */}
                        <div>
                            <Reveal className="text-center mb-10">
                                <p className="eyebrow">{t('pages.aboutValuesEyebrow')}</p>
                                <h2 className="text-2xl font-extrabold text-gray-900 font-display">{t('pages.aboutValuesTitle')}</h2>
                            </Reveal>
                            <div className="grid md:grid-cols-3 gap-6">
                                {VALUES.map((v, i) => (
                                    <Reveal key={v.title} delay={i * 80} className="card-premium card-premium-hover p-6 text-center">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 ${v.color}`}>
                                            <v.icon className="w-6 h-6" strokeWidth={1.75} />
                                        </div>
                                        <h3 className="font-bold text-gray-900 mb-2">{v.title}</h3>
                                        <p className="text-sm text-gray-500 leading-relaxed">{v.desc}</p>
                                    </Reveal>
                                ))}
                            </div>
                        </div>

                        {/* CTA */}
                        <Reveal className="bg-gradient-to-r from-red-600 to-red-500 rounded-3xl text-white text-center p-10 shadow-glow">
                            <h2 className="text-2xl font-extrabold mb-3 font-display">{t('pages.aboutCtaTitle')}</h2>
                            <p className="text-red-100 mb-6">{t('pages.aboutCtaDesc')}</p>
                            <Link href={route('search')}
                                className="inline-block px-8 py-3 bg-white text-red-600 rounded-xl font-bold hover:bg-red-50 transition-colors">
                                {t('pages.aboutCtaBtn')}
                            </Link>
                        </Reveal>
                    </div>
                </div>
            </PublicLayout>
        </>
    );
}
