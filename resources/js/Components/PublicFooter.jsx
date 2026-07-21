import { Link } from '@inertiajs/react';
import { MapPin, Mail } from 'lucide-react';
import { useLocale } from '@/i18n/LocaleContext';

const TOP_CITIES = ['Fès', 'Rabat', 'Marrakech', 'Tanger', 'Casablanca'];

const SOCIALS = [
    { label: 'Facebook', href: '#', viewBox: '0 0 24 24', path: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z' },
    { label: 'Pinterest', href: '#', viewBox: '0 0 24 24', path: 'M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.163-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.995-.285 1.194.6 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345-.09.375-.293 1.199-.333 1.363-.053.225-.172.271-.402.163-1.495-.696-2.436-2.878-2.436-4.631 0-3.769 2.738-7.229 7.892-7.229 4.144 0 7.365 2.953 7.365 6.899 0 4.117-2.595 7.431-6.199 7.431-1.211 0-2.348-.629-2.738-1.373 0 0-.599 2.282-.744 2.84-.269 1.037-1.001 2.339-1.49 3.132 1.123.345 2.31.53 3.541.53 6.62 0 11.988-5.367 11.988-11.987C24.005 5.367 18.637.001 12.017.001z' },
    { label: 'LinkedIn', href: '#', viewBox: '0 0 24 24', path: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z' },
    { label: 'WhatsApp', href: 'https://wa.me/', viewBox: '0 0 32 32', path: 'M16.001 3C9.373 3 4 8.373 4 15c0 2.362.687 4.564 1.872 6.417L4 29l7.77-1.831A11.93 11.93 0 0 0 16.001 27C22.628 27 28 21.627 28 15S22.628 3 16.001 3zm6.995 17.043c-.29.816-1.44 1.494-2.35 1.688-.626.132-1.443.238-4.196-.9-3.52-1.457-5.788-5.03-5.965-5.264-.17-.234-1.428-1.9-1.428-3.623 0-1.723.905-2.567 1.226-2.918.32-.351.7-.44.933-.44.234 0 .467.002.671.012.216.01.505-.082.79.603.29.7.984 2.418 1.07 2.594.086.176.144.38.03.614-.116.234-.174.38-.35.585-.176.205-.37.457-.528.614-.176.176-.36.367-.155.72.205.351.912 1.505 1.958 2.437 1.346 1.2 2.48 1.573 2.833 1.75.35.176.556.146.76-.088.205-.234.878-1.023 1.113-1.374.234-.351.468-.293.79-.176.32.117 2.034.96 2.383 1.135.35.176.583.263.67.41.087.146.087.848-.204 1.663z' },
];

export default function PublicFooter() {
    const year = new Date().getFullYear();
    const { t, locales } = useLocale();
    return (
        <footer className="bg-gray-950 text-gray-400 relative overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-red-500/40 to-transparent" />

            <div className="container-page py-14 relative">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
                    {/* Brand */}
                    <div>
                        <Link href={route('home')} className="flex items-center gap-2.5 mb-4">
                            <span className="w-9 h-9 rounded-full bg-red-600 flex items-center justify-center shadow-sm">
                                <MapPin className="w-4.5 h-4.5 text-white" strokeWidth={2} />
                            </span>
                            <span className="font-display font-extrabold text-white text-lg tracking-tight leading-none">
                                Auto<span className="text-red-500">Ecoles</span>
                                <span className="block text-[9px] font-bold tracking-[0.2em] uppercase mt-0.5 text-white/50">Maroc</span>
                            </span>
                        </Link>
                        <div className="flex items-center gap-1.5 mb-4">
                            {locales.map((l) => <span key={l.code} className="text-base leading-none">{l.flag}</span>)}
                        </div>
                        <p className="text-sm leading-relaxed text-gray-500">
                            {t('footer.tagline')}
                        </p>
                        <div className="mt-5">
                            <p className="text-xs font-semibold text-gray-500 mb-2.5">{t('footer.share')}</p>
                            <div className="flex gap-2.5">
                                {SOCIALS.map((s) => (
                                    <a key={s.label} href={s.href} aria-label={s.label}
                                        className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-red-600 hover:border-red-600 hover:scale-110 hover:-translate-y-0.5 transition-all duration-200 text-gray-400 hover:text-white">
                                        <svg className="w-4 h-4 fill-current" viewBox={s.viewBox}><path d={s.path} /></svg>
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Liens rapides */}
                    <div>
                        <h3 className="text-white font-semibold text-sm mb-4 uppercase tracking-wide">{t('footer.quickLinks')}</h3>
                        <ul className="space-y-2.5">
                            {[
                                { label: t('footer.home'),         href: route('home') },
                                { label: t('footer.contactUs'),    href: route('contact') },
                                { label: t('footer.aboutUs'),      href: route('about') },
                                { label: t('footer.registerSchool'), href: route('school-application.create') },
                            ].map((l) => (
                                <li key={l.href}>
                                    <Link href={l.href} className="text-sm hover:text-red-400 transition-colors">{l.label}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Top Villes */}
                    <div>
                        <h3 className="text-white font-semibold text-sm mb-4 uppercase tracking-wide">{t('footer.topCities')}</h3>
                        <ul className="space-y-2.5">
                            {TOP_CITIES.map((city) => (
                                <li key={city}>
                                    <Link href={route('search.city', encodeURIComponent(city))}
                                        className="text-sm hover:text-red-400 transition-colors">
                                        {city}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="text-white font-semibold text-sm mb-4 uppercase tracking-wide">{t('footer.contact')}</h3>
                        <ul className="space-y-3 text-sm">
                            <li className="flex items-start gap-2.5">
                                <Mail className="w-4 h-4 text-gray-600 shrink-0 mt-0.5" />
                                <a href="mailto:contact@autoecoles.ma" className="hover:text-red-400 transition-colors">contact@autoecoles.ma</a>
                            </li>
                            <li className="flex items-start gap-2.5">
                                <MapPin className="w-4 h-4 text-gray-600 shrink-0 mt-0.5" />
                                <span>Maroc</span>
                            </li>
                            <li>
                                <Link href={route('contact')} className="text-sm text-red-400 hover:underline font-medium">
                                    {t('footer.seeContact')}
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                    <p>© {year} autoecoles.ma. {t('footer.rights')}</p>
                    <div className="flex gap-5">
                        <Link href={route('privacy')} className="hover:text-white transition-colors">{t('footer.privacy')}</Link>
                        <Link href={route('terms')}   className="hover:text-white transition-colors">{t('footer.terms')}</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
