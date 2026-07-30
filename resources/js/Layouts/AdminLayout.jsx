import { useEffect, useMemo, useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import FlashMessage from '@/Components/FlashMessage';
import ThemeToggle from '@/Components/UI/ThemeToggle';
import {
    Squares2X2Icon as LayoutDashboard,
    UsersIcon as Users, WrenchScrewdriverIcon as UserCog, BuildingOffice2Icon as Building2, AcademicCapIcon as GraduationCap, BookOpenIcon as BookOpen,
    CreditCardIcon as CreditCard, ReceiptPercentIcon as Receipt, BanknotesIcon as Banknote, TicketIcon as Ticket, CubeIcon as Package,
    TagIcon as Tags, MapPinIcon as MapPin, MapIcon as Map, MegaphoneIcon as Megaphone, StarIcon as Star, FlagIcon as Flag, NewspaperIcon as Newspaper,
    ChartBarIcon as BarChart3, DocumentTextIcon as FileText,
    Cog6ToothIcon as Settings, ShieldCheckIcon as ShieldCheck,
    UserIcon as User, ArrowRightStartOnRectangleIcon as LogOut, MagnifyingGlassIcon as Search, Bars3Icon as Menu, XMarkIcon as X, ChevronDownIcon as ChevronDown,
    ChevronDoubleLeftIcon as CollapseIcon, ChevronDoubleRightIcon as ExpandIcon, ArrowTopRightOnSquareIcon as ExternalLink,
    EnvelopeIcon as Mail, InboxStackIcon as InboxIcon, UserCircleIcon as ContactRound, Square3Stack3DIcon as KanbanSquare, TagIcon as Tag,
    ClipboardDocumentCheckIcon as ClipboardCheck, BellIcon as Bell, FolderIcon, IdentificationIcon,
} from '@heroicons/react/24/outline';

/* ── Navigation structure ──────────────────────────────────────────────
 * Two-level: standalone top items (Dashboard, Notifications, Recherche), then
 * exactly two ordered groups — Contenu, Compte — each broken into small,
 * collapsible subsections so the whole admin surface stays reachable without
 * turning into a wall of links. ──────────────────────────────────────── */
const TOP_ITEMS = [
    { label: 'Tableau de bord',        href: 'admin.dashboard',            icon: LayoutDashboard, permission: null },
    { label: 'Notifications',          href: 'admin.notifications.index',  icon: Bell,            permission: null, badgeKey: 'admin_unread_notifications' },
    { label: "Recherche d'auto-écoles", href: 'admin.schools-search.index', icon: Search,          permission: 'manage_schools' },
];

const NAV_GROUPS = [
    {
        key: 'contenu',
        label: 'Contenu',
        icon: FolderIcon,
        subsections: [
            {
                label: 'Auto-écoles',
                items: [
                    { label: 'Auto-écoles',  href: 'admin.auto-schools.index',        icon: Building2,      permission: 'manage_schools' },
                    { label: 'Candidatures', href: 'admin.school-applications.index', icon: ClipboardCheck, permission: 'manage_schools' },
                ],
            },
            {
                label: 'Catalogue',
                items: [
                    { label: 'Catégories', href: 'admin.categories.index', icon: Tags,   permission: 'manage_categories' },
                    { label: 'Villes',     href: 'admin.cities.index',     icon: MapPin, permission: 'manage_categories' },
                    { label: 'Régions',    href: 'admin.regions.index',    icon: Map,    permission: 'manage_categories' },
                ],
            },
            {
                label: 'Avis & signalements',
                items: [
                    { label: 'Avis',         href: 'admin.reviews.index',      icon: Star, permission: 'manage_reviews' },
                    { label: 'Signalements', href: 'admin.signalements.index', icon: Flag, permission: 'manage_reviews' },
                ],
            },
            {
                label: 'CRM',
                items: [
                    { label: 'Tableau de bord CRM', href: 'admin.crm.dashboard',       icon: LayoutDashboard, permission: 'manage_crm' },
                    { label: 'Pipeline',            href: 'admin.crm.pipeline',        icon: KanbanSquare,    permission: 'manage_crm' },
                    { label: 'Prospects',           href: 'admin.crm.prospects.index', icon: ContactRound,    permission: 'manage_crm' },
                    { label: 'Tags',                href: 'admin.crm.tags.index',      icon: Tag,             permission: 'manage_crm' },
                ],
            },
            {
                label: 'Marketing',
                items: [
                    { label: 'Publicités', href: 'admin.ads.index',        icon: Megaphone, permission: 'manage_settings'   },
                    { label: 'Actualités', href: 'admin.news.index',       icon: Newspaper, permission: 'manage_settings'   },
                    { label: 'Newsletter', href: 'admin.newsletter.index', icon: Mail,      permission: 'manage_newsletter' },
                ],
            },
            {
                label: 'Commercial',
                items: [
                    { label: 'Plans',       href: 'admin.plans.index',         icon: Package,    permission: 'manage_plans'         },
                    { label: 'Abonnements', href: 'admin.subscriptions.index', icon: CreditCard, permission: 'manage_subscriptions' },
                    { label: 'Crédits',     href: 'admin.credits.index',       icon: Banknote,   permission: 'manage_credits'       },
                    { label: 'Paiements',   href: 'admin.payments.index',      icon: Receipt,    permission: 'manage_payments'      },
                    { label: 'Factures',    href: 'admin.invoices.index',      icon: FileText,   permission: 'manage_payments'      },
                    { label: 'Coupons',     href: 'admin.coupons.index',       icon: Ticket,     permission: 'manage_plans'         },
                ],
            },
            {
                label: 'Support & services',
                items: [
                    { label: 'Demandes de contact', href: 'admin.contact-requests.index', icon: InboxIcon, permission: 'manage_contacts' },
                    { label: 'Services',            href: 'admin.services.index',         icon: UserCog,   permission: 'manage_services'  },
                ],
            },
            {
                label: 'Statistiques',
                items: [
                    { label: 'Analytics', href: 'admin.analytics', icon: BarChart3, permission: 'manage_analytics' },
                ],
            },
        ],
    },
    {
        key: 'compte',
        label: 'Compte',
        icon: IdentificationIcon,
        subsections: [
            {
                label: 'Utilisateurs & rôles',
                items: [
                    { label: 'Utilisateurs',        href: 'admin.users.index',  icon: Users,       permission: 'manage_users' },
                    { label: 'Rôles & Permissions',  href: 'admin.roles.index',  icon: ShieldCheck, permission: 'super_admin'  },
                    { label: 'Administrateurs',      href: 'admin.admins.index', icon: ShieldCheck, permission: 'super_admin'  },
                ],
            },
            {
                label: 'Mon compte',
                items: [
                    { label: 'Mon profil',           href: 'admin.profile',  icon: User,     permission: null              },
                    { label: 'Paramètres système',   href: 'admin.settings', icon: Settings, permission: 'manage_settings' },
                ],
            },
        ],
    },
];

const SIDEBAR_COLLAPSE_KEY = 'admin_sidebar_collapsed';

/* ── Helpers ────────────────────────────────────────────────────────── */
function canSeeItem(item, auth) {
    if (item.permission === null || item.permission === undefined) return true;
    if (item.permission === 'super_admin') return auth?.user?.is_super_admin === true;
    if (auth?.user?.is_super_admin) return true;
    return (auth?.user?.permissions ?? []).includes(item.permission);
}

function isRouteActive(href) {
    try { return route().current(href); } catch { return false; }
}

function allNavItems() {
    const items = [...TOP_ITEMS.map(i => ({ ...i, groupLabel: null, subsectionLabel: null }))];
    NAV_GROUPS.forEach(group => {
        group.subsections.forEach(sub => {
            sub.items.forEach(item => items.push({ ...item, groupLabel: group.label, subsectionLabel: sub.label }));
        });
    });
    return items;
}

/* ── Nav link ───────────────────────────────────────────────────────── */
function NavLink({ item, isActive, onClose, collapsed = false, badge }) {
    const Icon = item.icon;
    return (
        <Link
            href={route(item.href)}
            onClick={onClose}
            title={collapsed ? item.label : undefined}
            className={`group relative flex items-center gap-3 ${collapsed ? 'justify-center px-2.5' : 'px-3'} py-2 rounded-xl text-[13px] font-medium transition-all duration-100 mb-0.5 ${
                isActive
                    ? 'bg-orange-600 text-white shadow-sm shadow-orange-600/20'
                    : 'text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-100 hover:bg-gray-100 dark:hover:bg-zinc-800'
            }`}
        >
            <Icon className={`w-[18px] h-[18px] flex-shrink-0 ${isActive ? 'text-white' : 'text-gray-400 dark:text-zinc-500 group-hover:text-gray-600 dark:group-hover:text-zinc-300'}`} />
            {!collapsed && <span className="truncate flex-1">{item.label}</span>}
            {badge > 0 && (
                <span className={`flex-shrink-0 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold ${
                    collapsed ? 'absolute -top-0.5 -right-0.5' : ''
                } ${isActive ? 'bg-white/25 text-white' : 'bg-orange-600 text-white'}`}>
                    {badge > 99 ? '99+' : badge}
                </span>
            )}
        </Link>
    );
}

/* ── Subsection (accordion inside a group) ─────────────────────────── */
function Subsection({ sub, auth, onClose, openKey, isOpen, toggle }) {
    const visible = sub.items.filter(item => canSeeItem(item, auth));
    if (visible.length === 0) return null;

    return (
        <div className="mb-0.5">
            <button
                onClick={() => toggle(openKey)}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-[11px] font-semibold text-gray-400 dark:text-zinc-500 uppercase tracking-wider hover:text-gray-600 dark:hover:text-zinc-300 transition-colors rounded-lg"
            >
                <span className="flex-1 text-left">{sub.label}</span>
                <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div className="mb-1.5">
                    {visible.map((item, ii) => (
                        <NavLink key={ii} item={item} isActive={isRouteActive(item.href)} onClose={onClose} />
                    ))}
                </div>
            )}
        </div>
    );
}

/* ── Sidebar content ───────────────────────────────────────────────── */
function SidebarContent({ onClose, collapsed, onToggleCollapse }) {
    const { auth, admin_unread_notifications } = usePage().props;
    const [search, setSearch] = useState('');

    const logout = (e) => { e.preventDefault(); router.post(route('logout')); };

    const getDefaultOpenSubsections = () => {
        const set = new Set();
        NAV_GROUPS.forEach(group => {
            group.subsections.forEach(sub => {
                const key = `${group.key}.${sub.label}`;
                if (sub.items.some(item => isRouteActive(item.href))) set.add(key);
            });
        });
        if (set.size === 0) set.add(`${NAV_GROUPS[0].key}.${NAV_GROUPS[0].subsections[0].label}`);
        return set;
    };

    const [openSubsections, setOpenSubsections] = useState(getDefaultOpenSubsections);
    const toggleSubsection = (key) => {
        setOpenSubsections(prev => {
            const next = new Set(prev);
            next.has(key) ? next.delete(key) : next.add(key);
            return next;
        });
    };

    const searchResults = useMemo(() => {
        if (!search.trim()) return null;
        const q = search.toLowerCase();
        return allNavItems().filter(item => item.label.toLowerCase().includes(q) && canSeeItem(item, auth));
    }, [search, auth]);

    return (
        <div className={`flex flex-col h-full bg-white dark:bg-zinc-900 border-r border-gray-100 dark:border-zinc-800`}>
            {/* Logo */}
            <div className={`flex items-center gap-3 ${collapsed ? 'px-3 justify-center' : 'px-4'} py-4 border-b border-gray-100 dark:border-zinc-800 flex-shrink-0`}>
                <div className="w-9 h-9 bg-orange-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm shadow-orange-600/30">
                    <span className="text-white font-extrabold text-xs tracking-wide">AE</span>
                </div>
                {!collapsed && (
                    <div className="flex-1 min-w-0">
                        <p className="text-gray-900 dark:text-zinc-50 text-[15px] font-bold leading-tight">AutoÉcoles</p>
                        <p className="text-[11px] text-gray-400 dark:text-zinc-500">Administration</p>
                    </div>
                )}
                {onClose && (
                    <button onClick={onClose} aria-label="Fermer" className="text-gray-400 hover:text-gray-700 dark:hover:text-zinc-200 lg:hidden transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* Search */}
            {!collapsed && (
                <div className="px-3 py-3 flex-shrink-0">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 dark:text-zinc-500" />
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Rechercher un menu…"
                            className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-zinc-200 text-xs placeholder-gray-400 dark:placeholder-zinc-500 rounded-xl pl-8 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-400 transition-all"
                        />
                        {search && (
                            <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 dark:hover:text-zinc-200">
                                <X className="w-3 h-3" />
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Nav */}
            <nav className={`flex-1 min-h-0 overflow-y-auto ${collapsed ? 'px-2' : 'px-3'} py-1 scrollbar-thin`} aria-label="Navigation">
                {/* Top standalone items */}
                <div className="mb-3">
                    {TOP_ITEMS.filter(item => canSeeItem(item, auth)).map((item, ii) => (
                        <NavLink key={ii} item={item} isActive={isRouteActive(item.href)} onClose={onClose} collapsed={collapsed}
                            badge={item.badgeKey ? (admin_unread_notifications ?? 0) : 0} />
                    ))}
                </div>

                {searchResults !== null ? (
                    <div>
                        {searchResults.length === 0 ? (
                            <p className="text-xs text-gray-400 text-center py-6">Aucun résultat</p>
                        ) : (
                            <>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-3 mb-1.5">
                                    {searchResults.length} résultat{searchResults.length > 1 ? 's' : ''}
                                </p>
                                {searchResults.map((item, i) => (
                                    <NavLink key={i} item={item} isActive={isRouteActive(item.href)} onClose={onClose} />
                                ))}
                            </>
                        )}
                    </div>
                ) : (
                    NAV_GROUPS.map(group => {
                        const GroupIcon = group.icon;
                        const anyVisible = group.subsections.some(sub => sub.items.some(item => canSeeItem(item, auth)));
                        if (!anyVisible) return null;

                        return (
                            <div key={group.key} className="mb-4">
                                {!collapsed ? (
                                    <div className="flex items-center gap-2 px-3 mb-1.5 mt-3">
                                        <GroupIcon className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                                        <h3 className="text-[13px] font-extrabold text-gray-900 dark:text-zinc-100 tracking-tight">{group.label}</h3>
                                    </div>
                                ) : (
                                    <div className="h-px bg-gray-100 dark:bg-zinc-800 mx-2 my-3" />
                                )}

                                {group.subsections.map((sub, si) => {
                                    if (collapsed) {
                                        const visible = sub.items.filter(item => canSeeItem(item, auth));
                                        return visible.map((item, ii) => (
                                            <NavLink key={`${si}-${ii}`} item={item} isActive={isRouteActive(item.href)} onClose={onClose} collapsed />
                                        ));
                                    }
                                    const key = `${group.key}.${sub.label}`;
                                    return (
                                        <Subsection
                                            key={key}
                                            sub={sub}
                                            auth={auth}
                                            onClose={onClose}
                                            openKey={key}
                                            isOpen={openSubsections.has(key)}
                                            toggle={toggleSubsection}
                                        />
                                    );
                                })}
                            </div>
                        );
                    })
                )}
            </nav>

            {/* Collapse toggle */}
            <div className="px-3 py-2 border-t border-gray-100 dark:border-zinc-800 flex-shrink-0 hidden lg:block">
                <button
                    onClick={onToggleCollapse}
                    className={`flex items-center gap-2.5 w-full ${collapsed ? 'justify-center' : ''} px-3 py-2 rounded-lg text-[12px] font-medium text-gray-400 dark:text-zinc-500 hover:text-gray-700 dark:hover:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors`}
                    title={collapsed ? 'Étendre' : 'Réduire'}
                >
                    {collapsed ? <ExpandIcon className="w-4 h-4" /> : <><CollapseIcon className="w-4 h-4" /> Réduire</>}
                </button>
            </div>

            {/* User footer */}
            <div className={`${collapsed ? 'px-2' : 'px-3'} py-3 border-t border-gray-100 dark:border-zinc-800 flex-shrink-0`}>
                <div className={`flex items-center gap-2.5 ${collapsed ? 'justify-center' : 'px-3'} py-2 rounded-xl mb-1`}>
                    <div className="w-8 h-8 bg-orange-100 dark:bg-orange-500/15 border border-orange-200 dark:border-orange-500/25 rounded-full flex items-center justify-center text-orange-600 dark:text-orange-400 font-bold text-xs flex-shrink-0">
                        {auth?.user?.name?.[0]?.toUpperCase() ?? 'A'}
                    </div>
                    {!collapsed && (
                        <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-semibold text-gray-800 dark:text-zinc-200 truncate">{auth?.user?.name}</p>
                            <p className="text-[11px] truncate">
                                {auth?.user?.is_super_admin
                                    ? <span className="text-orange-600 dark:text-orange-400 font-semibold">Super Admin</span>
                                    : <span className="text-gray-400 dark:text-zinc-500">{auth?.user?.email}</span>}
                            </p>
                        </div>
                    )}
                </div>
                <button
                    onClick={logout}
                    title={collapsed ? 'Déconnexion' : undefined}
                    className={`flex items-center gap-2.5 w-full ${collapsed ? 'justify-center' : ''} px-3 py-2 rounded-lg text-[13px] text-gray-400 dark:text-zinc-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors`}
                >
                    <LogOut className="w-4 h-4 flex-shrink-0" />
                    {!collapsed && 'Déconnexion'}
                </button>
            </div>
        </div>
    );
}

/* ── Breadcrumbs ────────────────────────────────────────────────────── */
function Breadcrumbs({ title }) {
    const active = allNavItems().find(item => isRouteActive(item.href));

    return (
        <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-zinc-500 flex-wrap">
            <Link href={route('admin.dashboard')} className="hover:text-orange-600 dark:hover:text-orange-400 transition-colors font-medium">
                Admin
            </Link>
            {active?.groupLabel && (
                <>
                    <span className="text-gray-300 dark:text-zinc-700">/</span>
                    <span className="text-gray-500 dark:text-zinc-500">{active.groupLabel}</span>
                </>
            )}
            {active?.subsectionLabel && (
                <>
                    <span className="text-gray-300 dark:text-zinc-700">/</span>
                    <span className="text-gray-500 dark:text-zinc-500">{active.subsectionLabel}</span>
                </>
            )}
            {title && (
                <>
                    <span className="text-gray-300 dark:text-zinc-700">/</span>
                    <span className="text-gray-800 dark:text-zinc-300 font-semibold">{title}</span>
                </>
            )}
        </div>
    );
}

/* ── Main layout ────────────────────────────────────────────────────── */
export default function AdminLayout({ children, title }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { admin_unread_notifications } = usePage().props;

    // Sidebar collapse is a pure client UI preference (not business data), so persisting it
    // in localStorage is the deliberate exception to this app's "no localStorage" pattern.
    const [collapsed, setCollapsed] = useState(() => {
        if (typeof window === 'undefined') return false;
        return window.localStorage.getItem(SIDEBAR_COLLAPSE_KEY) === '1';
    });

    useEffect(() => {
        window.localStorage.setItem(SIDEBAR_COLLAPSE_KEY, collapsed ? '1' : '0');
    }, [collapsed]);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-zinc-950">
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-20 bg-black/60 backdrop-blur-sm lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar — always fixed to the viewport (not just on mobile) so it stays in
                view regardless of how far the main content scrolls. */}
            <aside
                className={`fixed inset-y-0 left-0 z-30 ${collapsed ? 'w-[76px]' : 'w-[260px]'} flex flex-col transition-all duration-200 ease-in-out ${
                    sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
                } lg:translate-x-0`}
            >
                <SidebarContent onClose={() => setSidebarOpen(false)} collapsed={collapsed} onToggleCollapse={() => setCollapsed(c => !c)} />
            </aside>

            {/* Content — offset by the sidebar's width on desktop, since the sidebar is
                always fixed/out-of-flow there (0 offset on mobile, where the sidebar is an
                overlay drawer). */}
            <div className={`flex flex-col min-h-screen overflow-hidden transition-[margin] duration-200 ${collapsed ? 'lg:ml-[76px]' : 'lg:ml-[260px]'}`}>
                {/* Header */}
                <header className="bg-white dark:bg-zinc-900 border-b border-gray-100 dark:border-zinc-800 px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
                    <button
                        className="lg:hidden p-2 -ml-1 rounded-lg text-gray-500 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                        onClick={() => setSidebarOpen(true)}
                        aria-label="Ouvrir le menu"
                    >
                        <Menu className="w-5 h-5" />
                    </button>

                    <div className="flex-1 min-w-0">
                        <Breadcrumbs title={title} />
                    </div>

                    <Link
                        href={route('admin.notifications.index')}
                        className="relative inline-flex items-center justify-center p-2 rounded-lg text-gray-400 dark:text-zinc-500 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-500/10 transition-colors"
                        aria-label="Notifications"
                    >
                        <Bell className="w-[18px] h-[18px]" />
                        {admin_unread_notifications > 0 && (
                            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-orange-600 ring-2 ring-white dark:ring-zinc-900" />
                        )}
                    </Link>

                    <Link
                        href={route('home')}
                        target="_blank"
                        className="inline-flex items-center gap-1.5 text-xs text-gray-400 dark:text-zinc-500 hover:text-orange-600 dark:hover:text-orange-400 transition-colors px-2.5 py-1.5 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-500/10 flex-shrink-0"
                    >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Voir le site</span>
                    </Link>

                    <ThemeToggle />
                </header>

                {/* Page title bar */}
                {title && (
                    <div className="bg-white dark:bg-zinc-900 border-b border-gray-100 dark:border-zinc-800 px-5 py-3.5">
                        <h1 className="text-xl font-extrabold text-gray-900 dark:text-zinc-100 tracking-tight">{title}</h1>
                    </div>
                )}

                {/* Main */}
                <main className="flex-1 p-5 sm:p-6">
                    {children}
                </main>

                <FlashMessage />
            </div>
        </div>
    );
}
