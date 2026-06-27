import { useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';

const NAV = [
    { label: 'Tableau de bord', href: 'user.dashboard',  icon: '🏠' },
    { label: 'Mes avis',        href: 'user.reviews',    icon: '⭐' },
    { label: 'Favoris',         href: 'user.favorites',  icon: '❤️' },
    { label: 'Mon profil',      href: 'user.profile',    icon: '👤' },
];

export default function UserLayout({ children, title }) {
    const [open, setOpen] = useState(false);
    const { auth } = usePage().props;

    const logout = (e) => { e.preventDefault(); router.post(route('logout')); };

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {open && <div className="fixed inset-0 z-20 bg-black/50 lg:hidden" onClick={() => setOpen(false)} />}

            <aside className={`fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 transform transition-transform lg:translate-x-0 lg:static lg:inset-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="px-4 py-5 border-b border-gray-200">
                    <Link href={route('home')} className="flex items-center gap-2 mb-4">
                        <div className="w-7 h-7 bg-orange-600 rounded-lg flex items-center justify-center font-bold text-white text-xs">AE</div>
                        <span className="text-xs text-gray-500 font-medium">AutoÉcoles Maroc</span>
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold text-sm flex-shrink-0">
                            {auth?.user?.name?.[0]?.toUpperCase()}
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">{auth?.user?.name}</p>
                            <p className="text-xs text-gray-500 truncate">{auth?.user?.email}</p>
                        </div>
                    </div>
                </div>

                <nav className="px-3 py-4 space-y-1 flex-1">
                    {NAV.map((item) => {
                        const isActive = route().current(item.href);
                        return (
                            <Link key={item.href} href={route(item.href)}
                                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-orange-50 text-orange-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}>
                                <span>{item.icon}</span>
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="px-4 py-4 border-t border-gray-200 space-y-2">
                    <Link href={route('search')} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-orange-600 rounded-lg hover:bg-orange-50 transition-colors">
                        🔍 Rechercher des écoles
                    </Link>
                    <button onClick={logout} className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm text-gray-500 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors">
                        🚪 Déconnexion
                    </button>
                </div>
            </aside>

            <div className="flex-1 flex flex-col min-w-0">
                <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-4">
                    <button className="lg:hidden p-1 rounded text-gray-500 hover:bg-gray-100" onClick={() => setOpen(true)}>
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                    {title && <h1 className="text-lg font-semibold text-gray-900">{title}</h1>}
                    <Link href={route('search')} className="ml-auto text-sm text-orange-600 hover:underline">
                        🔍 Trouver une école
                    </Link>
                </header>
                <main className="flex-1 p-6">{children}</main>
            </div>
        </div>
    );
}
