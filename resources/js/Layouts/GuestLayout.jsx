import { Link } from '@inertiajs/react';
import { Check, Car } from 'lucide-react';
import { useLocale } from '@/i18n/LocaleContext';

/**
 * Split-screen premium layout for all Auth pages (Login, Register, Forgot/Reset
 * Password, Verify/Confirm). Light-only, red-brand — matches the public site's
 * design system (see app.css "Public site design system" block) rather than the
 * orange dashboard tokens, since these pages are reached from the public navbar.
 */
export default function GuestLayout({ children }) {
    const { t } = useLocale();

    const features = [t('auth.featureReviews'), t('auth.featureFreeSignup'), t('auth.featureCompare')];
    const stats = [
        { value: '500+', label: t('auth.statSchools') },
        { value: '10k+', label: t('auth.statCandidates') },
        { value: '30+',  label: t('auth.statCities') },
    ];

    return (
        <div className="min-h-screen flex bg-gray-50">
            {/* Left branding panel — immersive photo + red gradient */}
            <div className="hidden lg:flex lg:w-[46%] xl:w-[44%] flex-col relative overflow-hidden">
                <img
                    src="/images/marketing/hero-wheel.jpg"
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-red-950/95 via-red-900/85 to-red-700/60" />
                <div className="absolute inset-0 bg-mesh-brand" />

                {/* Decorative blurred orbs */}
                <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/[0.06] blur-2xl pointer-events-none animate-float-slow" />
                <div className="absolute bottom-10 -left-16 w-72 h-72 rounded-full bg-black/[0.15] blur-2xl pointer-events-none" />

                <div className="relative flex flex-col h-full p-10 xl:p-12">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3">
                        <span className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                            <Car className="w-5 h-5 text-red-600" strokeWidth={2} />
                        </span>
                        <span className="text-white font-display font-extrabold text-xl tracking-tight">
                            Auto<span className="text-red-200">Ecoles</span>.ma
                        </span>
                    </Link>

                    {/* Main copy */}
                    <div className="flex-1 flex flex-col justify-center mt-12">
                        <div className="badge-trust mb-6 w-fit">
                            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                            {t('auth.heroBadge')}
                        </div>
                        <h2 className="text-3xl xl:text-4xl font-extrabold text-white leading-tight mb-4 font-display">
                            {t('auth.heroTitleLine1')}<br />
                            <span className="text-red-100">{t('auth.heroTitleAccent')}</span>
                        </h2>
                        <p className="text-red-50/90 text-base leading-relaxed mb-8 max-w-sm">
                            {t('auth.heroSubtitle')}
                        </p>

                        {/* Features */}
                        <div className="space-y-2.5 mb-10">
                            {features.map((f) => (
                                <div key={f} className="flex items-center gap-2.5 text-sm text-red-50">
                                    <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                                        <Check className="w-3 h-3 text-white" strokeWidth={3} />
                                    </span>
                                    {f}
                                </div>
                            ))}
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-3">
                            {stats.map((s) => (
                                <div key={s.label} className="glass-panel rounded-2xl p-4 text-center hover:bg-white/[0.14] transition-colors duration-200">
                                    <div className="text-2xl font-extrabold text-white">{s.value}</div>
                                    <div className="text-xs text-red-100/90 mt-0.5">{s.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <p className="relative text-red-100/50 text-xs">
                        © {new Date().getFullYear()} AutoEcoles.ma — {t('footer.rights')}
                    </p>
                </div>
            </div>

            {/* Right form panel */}
            <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
                <div className="w-full max-w-[420px] animate-in">
                    {/* Mobile logo */}
                    <Link href="/" className="lg:hidden flex items-center gap-2.5 mb-8 justify-center">
                        <span className="w-9 h-9 rounded-full bg-red-600 flex items-center justify-center shadow-sm">
                            <Car className="w-4 h-4 text-white" strokeWidth={2} />
                        </span>
                        <span className="font-display font-extrabold text-gray-900 text-lg">
                            Auto<span className="text-red-600">Ecoles</span>.ma
                        </span>
                    </Link>

                    <div className="card-premium p-7 sm:p-8">
                        {children}
                    </div>

                    <p className="text-center text-xs text-gray-400 mt-6">
                        {t('auth.termsNotice')}{' '}
                        <Link href={route('terms')} className="hover:text-red-600 underline underline-offset-2">{t('footer.terms')}</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
