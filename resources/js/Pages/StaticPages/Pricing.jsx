import { Head, Link } from '@inertiajs/react';
import { Check, Sparkles } from 'lucide-react';
import PublicLayout from '@/Layouts/PublicLayout';
import Accordion from '@/Components/UI/Accordion';
import Reveal from '@/Components/UI/Reveal';
import { useLocale } from '@/i18n/LocaleContext';

function PlanCard({ plan, featured = false, delay = 0 }) {
    const { t } = useLocale();
    const feats = plan.features ?? [];
    return (
        <Reveal delay={delay} className={`relative flex flex-col h-full rounded-3xl border-2 p-6 transition-all duration-300 ${
            featured
                ? 'border-red-500 bg-white shadow-glow lg:-translate-y-2'
                : 'card-premium card-premium-hover border-gray-100'
        }`}>
            {featured && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-red-600 text-white text-xs font-bold px-4 py-1 rounded-full shadow flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    {t('common.mostPopular')}
                </span>
            )}
            <h3 className="font-bold text-gray-900 text-lg mb-1">{plan.name}</h3>
            <div className="mb-4">
                <span className="text-4xl font-extrabold text-gray-900 font-display">{Number(plan.price).toLocaleString('fr-FR')}</span>
                <span className="text-gray-400 ml-1 text-sm">MAD / {plan.billing_period === 'yearly' ? t('common.perYear') : t('common.perMonth')}</span>
            </div>
            {plan.description && <p className="text-gray-500 text-sm mb-5">{plan.description}</p>}
            {feats.length > 0 && (
                <ul className="space-y-2 mb-6 flex-1">
                    {feats.map((f, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                            <Check className="w-4 h-4 text-red-500 shrink-0 mt-0.5" strokeWidth={2.5} />
                            {f}
                        </li>
                    ))}
                </ul>
            )}
            <Link href={route('school-application.create')}
                className={`mt-auto block text-center py-3 rounded-xl font-semibold text-sm transition-colors ${
                    featured
                        ? 'bg-red-600 text-white hover:bg-red-700 shadow-md'
                        : 'border-2 border-red-200 text-red-700 hover:bg-red-50'
                }`}>
                {t('common.getStarted')} →
            </Link>
        </Reveal>
    );
}

export default function Pricing({ plans = [], seo = {} }) {
    const { t } = useLocale();
    const PRICING_FAQ = [
        { question: t('pages.pricingFaq1Q'), answer: t('pages.pricingFaq1A') },
        { question: t('pages.pricingFaq2Q'), answer: t('pages.pricingFaq2A') },
        { question: t('pages.pricingFaq3Q'), answer: t('pages.pricingFaq3A') },
        { question: t('pages.pricingFaq4Q'), answer: t('pages.pricingFaq4A') },
    ];

    return (
        <>
            <Head title={seo.title || t('pages.pricingMetaTitle')}>
                {seo.description && <meta name="description" content={seo.description} />}
            </Head>

            <PublicLayout>
                <div className="relative bg-gradient-to-br from-gray-950 via-red-950 to-gray-900 overflow-hidden py-24 px-4">
                    <div className="absolute inset-0 bg-mesh-brand pointer-events-none" />
                    <Reveal className="relative max-w-2xl mx-auto text-center">
                        <p className="text-red-400 text-sm font-semibold uppercase tracking-widest mb-3">{t('pages.pricingEyebrow')}</p>
                        <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 font-display">{t('pages.pricingHeroTitle')}</h1>
                        <p className="text-gray-300 text-lg leading-relaxed">
                            {t('pages.pricingHeroDesc')}
                        </p>
                    </Reveal>
                </div>

                <div className="container-page py-16">
                    {plans.length > 0 ? (
                        <div className={`grid gap-6 ${plans.length === 1 ? 'max-w-sm mx-auto' : plans.length === 2 ? 'grid-cols-1 sm:grid-cols-2 max-w-2xl mx-auto' : 'grid-cols-1 md:grid-cols-3'}`}>
                            {plans.map((plan, i) => (
                                <PlanCard key={plan.id} plan={plan} featured={i === 1 && plans.length === 3} delay={i * 80} />
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-gray-500">{t('pages.pricingNoPlans')}</p>
                    )}

                    <p className="text-center text-sm text-gray-400 mt-8">
                        {t('pages.pricingAlreadyRegistered')}{' '}
                        <Link href={route('login')} className="text-red-600 hover:underline font-medium">
                            {t('pages.pricingLoginLink')}
                        </Link>{' '}
                        {t('pages.pricingManageSubscription')}
                    </p>
                </div>

                <div className="bg-gray-50 py-16 px-4 sm:px-6">
                    <div className="max-w-2xl mx-auto">
                        <Reveal className="text-center mb-10">
                            <p className="eyebrow">{t('home.faqEyebrow')}</p>
                            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 font-display">{t('pages.pricingFaqTitle')}</h2>
                        </Reveal>
                        <div className="card-premium px-6">
                            <Accordion items={PRICING_FAQ} />
                        </div>
                    </div>
                </div>
            </PublicLayout>
        </>
    );
}
