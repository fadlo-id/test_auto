import { Link, router, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { Menu, X, Car, User, LayoutDashboard, LogOut } from 'lucide-react';
import VerificationBanner from '@/Components/VerificationBanner';
import { useLocale } from '@/i18n/LocaleContext';

function LanguageSwitcher() {
    const { locale, setLocale, locales } = useLocale();

    return (
        <div className="flex items-center gap-1" role="group" aria-label="Changer de langue">
            {locales.map((l) => (
                <button key={l.code} type="button" onClick={() => setLocale(l.code)}
                    aria-label={l.label} aria-pressed={locale === l.code}
                    className={`text-base leading-none w-7 h-7 flex items-center justify-center rounded-md transition-all ${
                        locale === l.code ? 'ring-2 ring-red-500 scale-110' : 'opacity-70 hover:opacity-100'
                    }`}>
                    {l.flag}
                </button>
            ))}
        </div>
    );
}

function AccountMenu({ user, light = false, t }) {
    const [open, setOpen] = useState(false);
    const logout = (e) => { e.preventDefault(); router.post(route('logout')); };

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                aria-haspopup="true"
                aria-expanded={open}
                aria-label={t('nav.myAccount')}
                className={`inline-flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl text-sm font-semibold transition-all ${
                    light ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-red-50 text-red-700 hover:bg-red-100'
                }`}
            >
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${light ? 'bg-white/15' : 'bg-red-600 text-white'}`}>
                    {user.name?.[0]?.toUpperCase() ?? <User className="w-3.5 h-3.5" />}
                </span>
                <span className="hidden md:inline max-w-[9rem] truncate">{user.name ?? t('nav.myAccount')}</span>
            </button>
            {open && (
                <>
                    <button type="button" tabIndex={-1} aria-hidden="true"
                        className="fixed inset-0 z-40 cursor-default" onClick={() => setOpen(false)} />
                    <div role="menu" className="absolute right-0 mt-2 w-52 py-1.5 bg-white rounded-2xl border border-gray-100 shadow-elevated z-50 animate-in">
                        <Link href={route('dashboard')} role="menuitem" onClick={() => setOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-red-50 hover:text-red-700 transition-colors">
                            <LayoutDashboard className="w-4 h-4 text-gray-400" />
                            {t('nav.myAccount')}
                        </Link>
                        <button type="button" role="menuitem" onClick={logout}
                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors">
                            <LogOut className="w-4 h-4 text-gray-400" />
                            {t('nav.logout')}
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}

export default function PublicNavbar({ transparent = false }) {
    const { auth } = usePage().props;
    const { t } = useLocale();
    const [open, setOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    const NAV_LINKS = [
        { label: t('nav.home'),   href: () => route('home') },
        { label: t('nav.search'), href: () => route('search') },
        { label: t('nav.blog'),   href: () => route('blog.index') },
        { label: t('nav.contact'), href: () => route('contact') },
        { label: t('nav.about'),  href: () => route('about') },
    ];

    useEffect(() => {
        if (!transparent) return;
        const onScroll = () => setScrolled(window.scrollY > 24);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, [transparent]);

    const isLight = transparent && !scrolled;

    const base = isLight
        ? 'bg-transparent border-transparent'
        : 'bg-white/90 backdrop-blur-xl border-gray-100 shadow-sm';

    const logoColor  = isLight ? 'text-white' : 'text-gray-900';
    const logoAccent = 'text-red-600';
    const linkColor  = isLight ? 'text-white/85 hover:text-white' : 'text-gray-600 hover:text-red-600';
    const linkActive = isLight ? 'bg-white/10' : 'bg-red-50';
    const btnBorder  = isLight ? 'border-white/30 text-white hover:bg-white/10' : 'border-gray-200 text-gray-600 hover:bg-gray-50';

    return (
        <header className={`sticky top-0 z-50 border-b transition-all duration-300 ${base}`}>
            {!isLight && <VerificationBanner />}

            {/* Road lane-marking accent — subtle nod to driving/auto-école identity */}
            {!isLight && (
                <div className="h-[3px] w-full bg-red-600/90 overflow-hidden" aria-hidden="true">
                    <div
                        className="h-full w-full opacity-90"
                        style={{ backgroundImage: 'repeating-linear-gradient(90deg, rgba(255,255,255,0.9) 0 20px, transparent 20px 38px)' }}
                    />
                </div>
            )}

            <div className="container-page h-16 sm:h-[4.5rem] flex items-center justify-between gap-4">
                {/* Logo */}
                <Link href={route('home')} className="flex items-center gap-2.5 shrink-0">
                    <span className="w-9 h-9 rounded-full bg-red-600 flex items-center justify-center shadow-sm ring-2 ring-white/20">
                        <Car className="w-4.5 h-4.5 text-white" strokeWidth={2} />
                    </span>
                    <span className={`font-display font-extrabold text-lg tracking-tight leading-none ${logoColor}`}>
                        Auto<span className={logoAccent}>Ecoles</span>
                        <span className={`block text-[9px] font-bold tracking-[0.2em] uppercase mt-0.5 ${isLight ? 'text-white/60' : 'text-gray-400'}`}>Maroc</span>
                    </span>
                </Link>

                {/* Desktop nav */}
                <nav className="hidden lg:flex items-center gap-1">
                    {NAV_LINKS.map((link) => (
                        <Link key={link.label} href={link.href()}
                            className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-colors hover:${linkActive} ${linkColor}`}>
                            {link.label}
                        </Link>
                    ))}
                </nav>

                {/* Actions */}
                <div className="flex items-center gap-1.5 sm:gap-2">
                    <div className="hidden sm:block">
                        <LanguageSwitcher />
                    </div>

                    {auth?.user ? (
                        <AccountMenu user={auth.user} light={isLight} t={t} />
                    ) : (
                        <>
                            <Link href={route('login')}
                                className={`hidden sm:inline-flex text-sm px-3.5 py-2.5 rounded-xl font-medium border transition-colors ${btnBorder}`}>
                                {t('nav.login')}
                            </Link>
                            <Link href={route('school-application.create')}
                                className="btn-shine text-sm px-3.5 sm:px-4 py-2.5 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-all shadow-sm hover:shadow-glow whitespace-nowrap">
                                <span className="hidden md:inline">{t('nav.registerSchool')}</span>
                                <span className="md:hidden">{t('nav.registerSchoolShort')}</span>
                            </Link>
                        </>
                    )}

                    {/* Mobile menu button */}
                    <button onClick={() => setOpen(!open)} className={`lg:hidden p-2.5 rounded-xl transition-colors ${linkColor}`}
                        aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'} aria-expanded={open}>
                        {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {/* Mobile menu */}
            {open && (
                <div className={`lg:hidden border-t animate-in ${isLight ? 'bg-gray-950/98 border-white/10' : 'bg-white border-gray-100'} px-4 py-3 space-y-1`}>
                    {NAV_LINKS.map((link) => (
                        <Link key={link.label} href={link.href()}
                            className={`block px-3.5 py-2.5 rounded-xl text-sm font-medium ${isLight ? 'text-white/85 hover:bg-white/10 hover:text-white' : 'text-gray-600 hover:bg-red-50 hover:text-red-600'}`}
                            onClick={() => setOpen(false)}>
                            {link.label}
                        </Link>
                    ))}
                    {auth?.user ? (
                        <>
                            <Link href={route('dashboard')}
                                className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-medium ${isLight ? 'text-white/85 hover:bg-white/10 hover:text-white' : 'text-gray-600 hover:bg-red-50 hover:text-red-600'}`}
                                onClick={() => setOpen(false)}>
                                <LayoutDashboard className="w-4 h-4" />
                                {t('nav.myAccount')}
                            </Link>
                            <button type="button" onClick={(e) => { e.preventDefault(); router.post(route('logout')); }}
                                className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-medium ${isLight ? 'text-white/85 hover:bg-white/10 hover:text-white' : 'text-gray-600 hover:bg-red-50 hover:text-red-600'}`}>
                                <LogOut className="w-4 h-4" />
                                {t('nav.logout')}
                            </button>
                        </>
                    ) : (
                        <Link href={route('login')}
                            className={`block px-3.5 py-2.5 rounded-xl text-sm font-medium ${isLight ? 'text-white/85 hover:bg-white/10 hover:text-white' : 'text-gray-600 hover:bg-red-50 hover:text-red-600'}`}
                            onClick={() => setOpen(false)}>
                            {t('nav.login')}
                        </Link>
                    )}
                    <div className="pt-2 border-t border-white/10 mt-2 flex items-center justify-between">
                        <span className={`text-xs font-semibold uppercase tracking-wide ${isLight ? 'text-white/50' : 'text-gray-400'}`}>{t('nav.language')}</span>
                        <LanguageSwitcher />
                    </div>
                </div>
            )}
        </header>
    );
}
