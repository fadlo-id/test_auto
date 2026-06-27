import { useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';

const NAV_ITEMS = [
    { label: 'Vue d\'ensemble', href: 'school.dashboard',    icon: '📊' },
    { label: 'Analytics',       href: 'school.analytics',    icon: '📈' },
    { label: 'Avis',            href: 'school.reviews',      icon: '⭐' },
    { label: 'Services',        href: 'school.services',     icon: '📋' },
    { label: 'Galerie',         href: 'school.gallery',      icon: '📷' },
    { label: 'Abonnement',      href: 'school.subscription', icon: '💳' },
    { label: 'Paramètres',      href: 'school.settings',     icon: '⚙️' },
];

export default function SchoolLayout({ children, title, school }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { auth } = usePage().props;

    const logout = (e) => {
        e.preventDefault();
        router.post(route('logout'));
    };

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {sidebarOpen && (
                <div className="fixed inset-0 z-20 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
            )}

            <aside className={`fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 transform transition-transform lg:translate-x-0 lg:static lg:inset-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                {/* School info */}
                <div className="px-4 py-5 border-b border-gray-200">
                    <Link href="/" className="flex items-center gap-2 mb-3">
                        <div className="w-7 h-7 bg-orange-600 rounded-lg flex items-center justify-center font-bold text-white text-xs">AE</div>
                        <span className="text-xs text-gray-500 font-medium">AutoÉcole Maroc</span>
                    </Link>
                    {school && (
                        <div className="flex items-center gap-2">
                            <div className="w-9 h-9 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600 font-bold text-sm flex-shrink-0">
                                {school.name?.[0]?.toUpperCase()}
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-semibold text-gray-900 truncate">{school.name}</p>
                                <p className="text-xs text-gray-500 truncate">{school.city}</p>
                            </div>
                        </div>
                    )}
                </div>

                <nav className="px-3 py-4 space-y-1 flex-1">
                    {NAV_ITEMS.map((item) => {
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

                <div className="px-4 py-4 border-t border-gray-200">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-medium text-sm">
                            {auth?.user?.name?.[0]?.toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{auth?.user?.name}</p>
                            <p className="text-xs text-gray-500 truncate">{auth?.user?.email}</p>
                        </div>
                    </div>
                    <button onClick={logout} className="w-full text-left text-sm text-gray-500 hover:text-gray-900 px-2 py-1 rounded hover:bg-gray-100">
                        Déconnexion →
                    </button>
                </div>
            </aside>

            <div className="flex-1 flex flex-col min-w-0">
                <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-4">
                    <button className="lg:hidden p-1 rounded text-gray-500 hover:bg-gray-100" onClick={() => setSidebarOpen(true)}>
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                    {title && <h1 className="text-lg font-semibold text-gray-900">{title}</h1>}
                    {school?.status === 'pending' && (
                        <span className="ml-auto text-xs bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full font-medium">
                            En attente d'approbation
                        </span>
                    )}
                </header>
                <main className="flex-1 p-6">{children}</main>
            </div>
        </div>
    );
}
