import { useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import FlashMessage from '@/Components/FlashMessage';
import ThemeToggle from '@/Components/UI/ThemeToggle';
import VerificationBanner from '@/Components/VerificationBanner';
import {
    Squares2X2Icon, StarIcon, HeartIcon, UserIcon, MagnifyingGlassIcon,
    ArrowRightStartOnRectangleIcon, Bars3Icon, ChevronRightIcon,
} from '@heroicons/react/24/outline';

/* ── Icon set (Heroicons, 17px to match the compact sidebar rhythm) ─── */
const iconCls = 'w-[17px] h-[17px] flex-shrink-0';
const Ic = {
    home:   <Squares2X2Icon className={iconCls} />,
    star:   <StarIcon className={iconCls} />,
    heart:  <HeartIcon className={iconCls} />,
    user:   <UserIcon className={iconCls} />,
    search: <MagnifyingGlassIcon className={iconCls} />,
    logout: <ArrowRightStartOnRectangleIcon className={iconCls} />,
    menu:   <Bars3Icon className="w-5 h-5" />,
    arrow:  <ChevronRightIcon className="w-3.5 h-3.5" />,
};

const NAV = [
    { label: 'Tableau de bord', href: 'user.dashboard', icon: Ic.home  },
    { label: 'Mes avis',        href: 'user.reviews',   icon: Ic.star  },
    { label: 'Favoris',         href: 'user.favorites', icon: Ic.heart },
    { label: 'Mon profil',      href: 'user.profile',   icon: Ic.user  },
];

export default function UserLayout({ children, title }) {
    const [open, setOpen] = useState(false);
    const { auth } = usePage().props;
    const logout = (e) => { e.preventDefault(); router.post(route('logout')); };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex">
            {open && <div className="fixed inset-0 z-20 bg-black/50 backdrop-blur-sm lg:hidden" onClick={() => setOpen(false)} />}

            <aside className={`fixed inset-y-0 left-0 z-30 w-[216px] bg-white dark:bg-zinc-900 border-r border-gray-100 dark:border-zinc-800 shadow-sm flex flex-col transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${open ? 'translate-x-0 shadow-xl' : '-translate-x-full'}`}>
                {/* Header */}
                <div className="px-4 py-4 border-b border-gray-100 dark:border-zinc-800 flex-shrink-0">
                    <Link href={route('home')} className="flex items-center gap-2 mb-4">
                        <div className="w-7 h-7 bg-orange-600 rounded-xl flex items-center justify-center">
                            <span className="text-white font-extrabold text-[10px]">AE</span>
                        </div>
                        <span className="text-xs text-gray-400 dark:text-zinc-500 font-medium tracking-wide">AutoÉcoles Maroc</span>
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-sm">
                            {auth?.user?.name?.[0]?.toUpperCase()}
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-900 dark:text-zinc-100 truncate">{auth?.user?.name}</p>
                            <p className="text-xs text-gray-400 dark:text-zinc-500 truncate">{auth?.user?.email}</p>
                        </div>
                    </div>
                </div>

                {/* Nav */}
                <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto" aria-label="Navigation utilisateur">
                    {NAV.map((item) => {
                        let isActive = false;
                        try { isActive = route().current(item.href); } catch (_) {}
                        return (
                            <Link key={item.href} href={route(item.href)}
                                onClick={() => setOpen(false)}
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
                <div className="px-3 py-3 border-t border-gray-100 dark:border-zinc-800 flex-shrink-0 space-y-0.5">
                    <Link href={route('search')}
                        className="flex items-center gap-2.5 px-3 py-[7px] text-[13px] text-gray-500 dark:text-zinc-400 hover:text-orange-700 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-500/10 rounded-lg transition-colors font-medium">
                        {Ic.search}
                        Trouver une école
                    </Link>
                    <button onClick={logout}
                        className="flex items-center gap-2.5 w-full px-3 py-[7px] rounded-lg text-[13px] text-gray-400 dark:text-zinc-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors font-medium">
                        {Ic.logout}
                        Déconnexion
                    </button>
                </div>
            </aside>

            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <header className="bg-white dark:bg-zinc-900 border-b border-gray-100 dark:border-zinc-800 px-5 py-3 flex items-center gap-4 sticky top-0 z-10">
                    <button className="lg:hidden p-2 -ml-1 rounded-lg text-gray-500 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                        onClick={() => setOpen(true)} aria-label="Ouvrir le menu">
                        {Ic.menu}
                    </button>
                    {title && <h1 className="text-base font-semibold text-gray-900 dark:text-zinc-100">{title}</h1>}
                    <Link href={route('search')}
                        className="ml-auto inline-flex items-center gap-1.5 text-xs text-gray-400 dark:text-zinc-500 hover:text-orange-600 dark:hover:text-orange-400 transition-colors px-2.5 py-1.5 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-500/10">
                        {Ic.search}
                        <span className="hidden sm:inline">Trouver une école</span>
                    </Link>
                    <ThemeToggle />
                </header>
                <VerificationBanner />
                <main className="flex-1 p-5 sm:p-6">{children}</main>
                <FlashMessage />
            </div>
        </div>
    );
}
