import { useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import FlashMessage from '@/Components/FlashMessage';
import ThemeToggle from '@/Components/UI/ThemeToggle';
import {
    HomeIcon, ChartBarIcon, ArrowTrendingUpIcon, CalendarIcon, StarIcon,
    WrenchScrewdriverIcon, PhotoIcon, CreditCardIcon, ReceiptPercentIcon,
    BellIcon, UserIcon, Cog6ToothIcon, ArrowRightStartOnRectangleIcon, Bars3Icon,
} from '@heroicons/react/24/outline';

/* ── Icon set (Heroicons, 17px to match the compact sidebar rhythm) ─── */
const iconCls = 'w-[17px] h-[17px] flex-shrink-0';
const Ic = {
    home:     <HomeIcon className={iconCls} />,
    chart:    <ChartBarIcon className={iconCls} />,
    trend:    <ArrowTrendingUpIcon className={iconCls} />,
    calendar: <CalendarIcon className={iconCls} />,
    star:     <StarIcon className={iconCls} />,
    tools:    <WrenchScrewdriverIcon className={iconCls} />,
    photo:    <PhotoIcon className={iconCls} />,
    card:     <CreditCardIcon className={iconCls} />,
    receipt:  <ReceiptPercentIcon className={iconCls} />,
    bell:     <BellIcon className={iconCls} />,
    user:     <UserIcon className={iconCls} />,
    settings: <Cog6ToothIcon className={iconCls} />,
    logout:   <ArrowRightStartOnRectangleIcon className={iconCls} />,
    menu:     <Bars3Icon className="w-5 h-5" />,
};

const NAV_ITEMS = [
    { label: "Vue d'ensemble", href: 'school.dashboard',    icon: Ic.home     },
    { label: 'Analytics',      href: 'school.analytics',    icon: Ic.chart    },
    { label: 'Statistiques',   href: 'school.statistics',   icon: Ic.trend    },
    { label: 'Réservations',   href: 'school.bookings',     icon: Ic.calendar },
    { label: 'Avis',           href: 'school.reviews',      icon: Ic.star     },
    { label: 'Services',       href: 'school.services',     icon: Ic.tools    },
    { label: 'Galerie',        href: 'school.gallery',      icon: Ic.photo    },
    { label: 'Abonnement',     href: 'school.subscription', icon: Ic.card     },
    { label: 'Facturation',    href: 'school.billing',      icon: Ic.receipt  },
    { label: 'Notifications',  href: 'school.notifications',icon: Ic.bell     },
    { label: 'Mon profil',     href: 'school.profile',      icon: Ic.user     },
    { label: 'Paramètres',     href: 'school.settings',     icon: Ic.settings },
];

export default function SchoolLayout({ children, title, school }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { auth } = usePage().props;
    const logout = (e) => { e.preventDefault(); router.post(route('logout')); };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex">
            {sidebarOpen && (
                <div className="fixed inset-0 z-20 bg-black/50 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />
            )}

            <aside className={`fixed inset-y-0 left-0 z-30 w-[216px] bg-white dark:bg-zinc-900 border-r border-gray-100 dark:border-zinc-800 shadow-sm flex flex-col transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${sidebarOpen ? 'translate-x-0 shadow-xl' : '-translate-x-full'}`}>
                {/* Header */}
                <div className="px-4 py-4 border-b border-gray-100 dark:border-zinc-800 flex-shrink-0">
                    <Link href={route('home')} className="flex items-center gap-2 mb-4">
                        <div className="w-7 h-7 bg-orange-600 rounded-xl flex items-center justify-center">
                            <span className="text-white font-extrabold text-[10px]">AE</span>
                        </div>
                        <span className="text-xs text-gray-400 dark:text-zinc-500 font-medium tracking-wide">AutoÉcoles Maroc</span>
                    </Link>
                    {school && (
                        <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 bg-orange-50 dark:bg-orange-500/10 border border-orange-100 dark:border-orange-500/20 rounded-xl flex items-center justify-center text-orange-600 dark:text-orange-400 font-extrabold text-sm flex-shrink-0">
                                {school.name?.[0]?.toUpperCase()}
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-semibold text-gray-900 dark:text-zinc-100 truncate leading-tight">{school.name}</p>
                                <p className="text-xs text-gray-400 dark:text-zinc-500 truncate">{school.city}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Nav */}
                <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5" aria-label="Navigation école">
                    {NAV_ITEMS.map((item) => {
                        let isActive = false;
                        try { isActive = route().current(item.href); } catch (_) {}
                        return (
                            <Link key={item.href} href={route(item.href)}
                                onClick={() => setSidebarOpen(false)}
                                className={`flex items-center gap-2.5 px-3 py-[7px] rounded-lg text-[13px] font-medium transition-all duration-100 ${
                                    isActive
                                        ? 'bg-orange-50 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400'
                                        : 'text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-100 hover:bg-gray-50 dark:hover:bg-zinc-800'
                                }`}>
                                <span className={isActive ? 'text-orange-500 dark:text-orange-400' : 'text-gray-400 dark:text-zinc-500'}>{item.icon}</span>
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer */}
                <div className="px-3 py-3 border-t border-gray-100 dark:border-zinc-800 flex-shrink-0">
                    <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl mb-1">
                        <div className="w-7 h-7 bg-orange-100 dark:bg-orange-500/10 rounded-full flex items-center justify-center text-orange-600 dark:text-orange-400 font-bold text-xs flex-shrink-0">
                            {auth?.user?.name?.[0]?.toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-medium text-gray-800 dark:text-zinc-200 truncate">{auth?.user?.name}</p>
                            <p className="text-[11px] text-gray-400 dark:text-zinc-500 truncate">{auth?.user?.email}</p>
                        </div>
                    </div>
                    <button onClick={logout}
                        className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-[13px] text-gray-400 dark:text-zinc-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
                        {Ic.logout}
                        Déconnexion
                    </button>
                </div>
            </aside>

            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <header className="bg-white dark:bg-zinc-900 border-b border-gray-100 dark:border-zinc-800 px-5 py-3 flex items-center gap-4 sticky top-0 z-10">
                    <button className="lg:hidden p-2 -ml-1 rounded-lg text-gray-500 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                        onClick={() => setSidebarOpen(true)} aria-label="Ouvrir le menu">
                        {Ic.menu}
                    </button>
                    {title && <h1 className="text-base font-semibold text-gray-900 dark:text-zinc-100">{title}</h1>}
                    {school?.status === 'pending' && (
                        <span className="inline-flex items-center gap-1.5 text-xs bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 text-amber-700 dark:text-amber-400 px-3 py-1 rounded-full font-medium">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 8 8"><circle cx="4" cy="4" r="3" className="animate-pulse"/></svg>
                            En attente d'approbation
                        </span>
                    )}
                    <ThemeToggle className="ml-auto" />
                </header>
                <main className="flex-1 p-5 sm:p-6">{children}</main>
                <FlashMessage />
            </div>
        </div>
    );
}
