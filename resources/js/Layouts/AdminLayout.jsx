import { useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import FlashMessage from '@/Components/FlashMessage';

const NAV_ITEMS = [
    { label: 'Dashboard',      href: 'admin.dashboard',           icon: '📊' },
    { label: 'Utilisateurs',   href: 'admin.users.index',         icon: '👥' },
    { label: 'Auto-écoles',    href: 'admin.auto-schools.index',  icon: '🏫' },
    { label: 'Avis',           href: 'admin.reviews.index',       icon: '⭐' },
    { label: 'Abonnements',    href: 'admin.subscriptions.index', icon: '📋' },
    { label: 'Paiements',      href: 'admin.payments.index',      icon: '💳' },
    { label: 'Catégories',     href: 'admin.categories.index',    icon: '🏷️' },
    { label: 'Plans',          href: 'admin.plans.index',         icon: '💎' },
    { label: 'Analytics',      href: 'admin.analytics',           icon: '📈' },
];

export default function AdminLayout({ children, title }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { auth } = usePage().props;

    const logout = (e) => {
        e.preventDefault();
        router.post(route('logout'));
    };

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar overlay (mobile) */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-20 bg-black/50 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-30 w-64 bg-gray-900 transform transition-transform lg:translate-x-0 lg:static lg:inset-0 ${
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                {/* Logo */}
                <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-700">
                    <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center font-bold text-white text-sm">
                        AE
                    </div>
                    <span className="text-white font-semibold">Admin Panel</span>
                </div>

                {/* Nav */}
                <nav className="px-3 py-4 flex-1 space-y-1">
                    {NAV_ITEMS.map((item) => {
                        const isActive = route().current(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={route(item.href)}
                                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    isActive
                                        ? 'bg-orange-600 text-white'
                                        : 'text-gray-400 hover:text-white hover:bg-gray-800'
                                }`}
                            >
                                <span>{item.icon}</span>
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                {/* User */}
                <div className="px-4 py-4 border-t border-gray-700">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-medium text-sm">
                            {auth?.user?.name?.[0]?.toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{auth?.user?.name}</p>
                            <p className="text-xs text-gray-400 truncate">{auth?.user?.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={logout}
                        className="w-full text-left text-sm text-gray-400 hover:text-white px-2 py-1 rounded hover:bg-gray-800 transition-colors"
                    >
                        Déconnexion →
                    </button>
                </div>
            </aside>

            {/* Main content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Top bar */}
                <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-4">
                    <button
                        className="lg:hidden p-1 rounded text-gray-500 hover:bg-gray-100"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                    {title && <h1 className="text-lg font-semibold text-gray-900">{title}</h1>}
                </header>

                {/* Page content */}
                <main className="flex-1 p-6">
                    {children}
                </main>
                <FlashMessage />
            </div>
        </div>
    );
}
