import { useState, useMemo } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import FlashMessage from '@/Components/FlashMessage';
import ThemeToggle from '@/Components/UI/ThemeToggle';
import {
    Squares2X2Icon as LayoutDashboard,
    UsersIcon as Users, WrenchScrewdriverIcon as UserCog, BuildingOffice2Icon as Building2, AcademicCapIcon as GraduationCap, BookOpenIcon as BookOpen,
    CreditCardIcon as CreditCard, ReceiptPercentIcon as Receipt, BanknotesIcon as Banknote, TicketIcon as Ticket, CubeIcon as Package,
    TagIcon as Tags, MapPinIcon as MapPin, MapIcon as Map, MegaphoneIcon as Megaphone, StarIcon as Star, FlagIcon as Flag, NewspaperIcon as Newspaper,
    ArrowTrendingUpIcon as TrendingUp, ChartBarIcon as BarChart3, ChartPieIcon as PieChart, DocumentTextIcon as FileText,
    Cog6ToothIcon as Settings, AdjustmentsHorizontalIcon as Sliders, ShieldCheckIcon as ShieldCheck, ClipboardDocumentListIcon as ScrollText, CircleStackIcon as Database,
    UserIcon as User, ArrowRightStartOnRectangleIcon as LogOut, MagnifyingGlassIcon as Search, Bars3Icon as Menu, XMarkIcon as X, ChevronDownIcon as ChevronDown, ArrowTopRightOnSquareIcon as ExternalLink,
    EnvelopeIcon as Mail, InboxStackIcon as InboxIcon, UserCircleIcon as ContactRound, Square3Stack3DIcon as KanbanSquare, TagIcon as Tag,
} from '@heroicons/react/24/outline';

/* ── Navigation structure ──────────────────────────────────────────── */
const NAV_SECTIONS = [
    {
        label: null,
        items: [
            { label: 'Tableau de bord', href: 'admin.dashboard', icon: LayoutDashboard, permission: null },
        ],
    },
    {
        label: 'Gestion',
        icon: Users,
        items: [
            { label: 'Utilisateurs',    href: 'admin.users.index',          icon: Users,        permission: 'manage_users'   },
            { label: 'Administrateurs', href: 'admin.admins.index',         icon: ShieldCheck,  permission: 'super_admin'    },
            { label: 'Auto-écoles',     href: 'admin.auto-schools.index',   icon: Building2,    permission: 'manage_schools' },
            { label: 'Instructeurs',    href: 'admin.instructors.index',    icon: GraduationCap,permission: 'manage_users'   },
            { label: 'Élèves',          href: 'admin.students.index',       icon: BookOpen,     permission: 'manage_users'   },
        ],
    },
    {
        label: 'Abonnements',
        icon: CreditCard,
        items: [
            { label: 'Plans',          href: 'admin.plans.index',           icon: Package,   permission: 'manage_plans'         },
            { label: 'Abonnements',    href: 'admin.subscriptions.index',   icon: CreditCard,permission: 'manage_subscriptions' },
            { label: 'Crédits',        href: 'admin.credits.index',         icon: Banknote,  permission: 'manage_credits'       },
            { label: 'Paiements',      href: 'admin.payments.index',        icon: Receipt,   permission: 'manage_payments'      },
            { label: 'Factures',       href: 'admin.invoices.index',        icon: FileText,  permission: 'manage_payments'      },
            { label: 'Coupons',        href: 'admin.coupons.index',         icon: Ticket,    permission: 'manage_plans'         },
        ],
    },
    {
        label: 'Contenu',
        icon: Tags,
        items: [
            { label: 'Catégories',   href: 'admin.categories.index',   icon: Tags,      permission: 'manage_categories' },
            { label: 'Villes',       href: 'admin.cities.index',       icon: MapPin,    permission: 'manage_categories' },
            { label: 'Régions',      href: 'admin.regions.index',      icon: Map,       permission: 'manage_categories' },
            { label: 'Publicités',   href: 'admin.ads.index',          icon: Megaphone, permission: 'manage_settings'   },
            { label: 'Avis',         href: 'admin.reviews.index',      icon: Star,      permission: 'manage_reviews'    },
            { label: 'Signalements', href: 'admin.signalements.index', icon: Flag,      permission: 'manage_reviews'    },
            { label: 'Actualités',   href: 'admin.news.index',         icon: Newspaper, permission: 'manage_settings'   },
        ],
    },
    {
        label: 'Statistiques',
        icon: BarChart3,
        items: [
            { label: 'Revenus',          href: 'admin.revenue',          icon: TrendingUp, permission: 'manage_payments'  },
            { label: 'Utilisateurs',     href: 'admin.stats.users',      icon: Users,      permission: 'manage_analytics' },
            { label: 'Auto-écoles',      href: 'admin.stats.schools',    icon: Building2,  permission: 'manage_analytics' },
            { label: 'Graphiques',       href: 'admin.analytics',        icon: BarChart3,  permission: 'manage_analytics' },
            { label: 'Rapports',         href: 'admin.reports',          icon: PieChart,   permission: 'manage_reports'   },
        ],
    },
    {
        label: 'CRM',
        icon: ContactRound,
        items: [
            { label: 'Tableau de bord CRM', href: 'admin.crm.dashboard',       icon: LayoutDashboard, permission: null },
            { label: 'Pipeline',            href: 'admin.crm.pipeline',        icon: KanbanSquare,    permission: null },
            { label: 'Prospects',           href: 'admin.crm.prospects.index', icon: ContactRound,    permission: null },
            { label: 'Tags',                href: 'admin.crm.tags.index',      icon: Tag,             permission: null },
        ],
    },
    {
        label: 'Support',
        icon: Mail,
        items: [
            { label: 'Contact',        href: 'admin.contact-requests.index', icon: InboxIcon, permission: 'manage_contacts'   },
            { label: 'Newsletter',     href: 'admin.newsletter.index',       icon: Mail,      permission: 'manage_newsletter' },
            { label: 'Services',       href: 'admin.services.index',         icon: UserCog,   permission: 'manage_services'   },
        ],
    },
    {
        label: 'Administration',
        icon: Settings,
        items: [
            { label: 'Paramètres',          href: 'admin.settings',      icon: Settings,   permission: 'manage_settings' },
            { label: 'Configuration',       href: 'admin.configuration', icon: Sliders,    permission: 'manage_settings' },
            { label: 'Rôles & Permissions', href: 'admin.roles.index',   icon: ShieldCheck,permission: 'super_admin'     },
            { label: 'Journal d\'audit',    href: 'admin.audit-logs.index', icon: ScrollText, permission: 'super_admin' },
            { label: 'Journal d\'activité', href: 'admin.logs',          icon: ScrollText, permission: 'manage_logs'     },
            { label: 'Sauvegardes',         href: 'admin.backups',       icon: Database,   permission: 'super_admin'     },
        ],
    },
    {
        label: 'Compte',
        icon: User,
        items: [
            { label: 'Mon profil',          href: 'admin.profile',    icon: User,    permission: null },
            { label: 'Paramètres du compte',href: 'admin.settings',   icon: Settings,permission: 'manage_settings' },
        ],
    },
];

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

/* ── Sidebar component ──────────────────────────────────────────────── */
function SidebarContent({ onClose, collapsed, setCollapsed }) {
    const { auth } = usePage().props;
    const [search, setSearch] = useState('');

    const logout = (e) => { e.preventDefault(); router.post(route('logout')); };

    // Find which section contains the active route to auto-open it
    const getDefaultOpen = () => {
        const set = new Set();
        NAV_SECTIONS.forEach(section => {
            if (!section.label) return;
            section.items.forEach(item => {
                if (isRouteActive(item.href)) set.add(section.label);
            });
        });
        // If nothing is open, open Gestion by default
        if (set.size === 0) set.add('Gestion');
        return set;
    };

    const [openSections, setOpenSections] = useState(() => getDefaultOpen());

    const toggleSection = (label) => {
        setOpenSections(prev => {
            const next = new Set(prev);
            if (next.has(label)) next.delete(label);
            else next.add(label);
            return next;
        });
    };

    // Filter items from all sections based on search
    const searchResults = useMemo(() => {
        if (!search.trim()) return null;
        const q = search.toLowerCase();
        const results = [];
        NAV_SECTIONS.forEach(section => {
            section.items.forEach(item => {
                if (item.label.toLowerCase().includes(q) && canSeeItem(item, auth)) {
                    results.push({ ...item, sectionLabel: section.label });
                }
            });
        });
        return results;
    }, [search, auth]);

    return (
        <div className="flex flex-col h-full bg-[#0f0f11]">
            {/* Logo */}
            <div className="flex items-center gap-3 px-4 py-4 border-b border-white/[0.07] flex-shrink-0">
                <div className="w-8 h-8 bg-orange-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-extrabold text-xs tracking-wide">AE</span>
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-bold leading-tight">AutoÉcoles</p>
                    <p className="text-[11px] text-gray-500">Administration</p>
                </div>
                {onClose && (
                    <button onClick={onClose} aria-label="Fermer" className="text-gray-600 hover:text-gray-300 lg:hidden transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* Search */}
            <div className="px-3 py-2 flex-shrink-0">
                <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-600" />
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Rechercher un menu…"
                        className="w-full bg-white/[0.06] border border-white/[0.06] text-gray-300 text-xs placeholder-gray-600 rounded-lg pl-8 pr-3 py-2 focus:outline-none focus:border-orange-500/50 focus:bg-white/[0.08] transition-all"
                    />
                    {search && (
                        <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-300">
                            <X className="w-3 h-3" />
                        </button>
                    )}
                </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 overflow-y-auto px-2 py-1 scrollbar-thin" aria-label="Navigation">
                {/* Search results mode */}
                {searchResults !== null ? (
                    <div>
                        {searchResults.length === 0 ? (
                            <p className="text-xs text-gray-600 text-center py-6">Aucun résultat</p>
                        ) : (
                            <>
                                <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest px-3 mb-1.5 mt-2">
                                    {searchResults.length} résultat{searchResults.length > 1 ? 's' : ''}
                                </p>
                                {searchResults.map((item, i) => {
                                    const Icon = item.icon;
                                    const isActive = isRouteActive(item.href);
                                    return (
                                        <NavLink key={i} item={item} isActive={isActive} onClose={onClose} />
                                    );
                                })}
                            </>
                        )}
                    </div>
                ) : (
                    /* Normal nav sections */
                    <>
                        {NAV_SECTIONS.map((section, si) => {
                            const visible = section.items.filter(item => canSeeItem(item, auth));
                            if (visible.length === 0) return null;

                            // Top-level items (no label / Dashboard)
                            if (!section.label) {
                                return (
                                    <div key={si} className="mb-1">
                                        {visible.map((item, ii) => {
                                            const isActive = isRouteActive(item.href);
                                            return <NavLink key={ii} item={item} isActive={isActive} onClose={onClose} />;
                                        })}
                                    </div>
                                );
                            }

                            const isOpen = openSections.has(section.label);
                            const SectionIcon = section.icon;

                            return (
                                <div key={si} className="mb-0.5">
                                    {/* Section header (collapsible) */}
                                    <button
                                        onClick={() => toggleSection(section.label)}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-[11px] font-bold text-gray-500 uppercase tracking-widest hover:text-gray-300 transition-colors rounded-lg hover:bg-white/[0.04] group"
                                    >
                                        {SectionIcon && <SectionIcon className="w-3.5 h-3.5 text-gray-600 group-hover:text-gray-400 transition-colors" />}
                                        <span className="flex-1 text-left">{section.label}</span>
                                        <ChevronDown className={`w-3 h-3 text-gray-600 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                                    </button>

                                    {/* Section items */}
                                    {isOpen && (
                                        <div className="mt-0.5 mb-1">
                                            {visible.map((item, ii) => {
                                                const isActive = isRouteActive(item.href);
                                                return <NavLink key={ii} item={item} isActive={isActive} onClose={onClose} indent />;
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </>
                )}
            </nav>

            {/* User footer */}
            <div className="px-3 py-3 border-t border-white/[0.07] flex-shrink-0">
                <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl mb-1">
                    <div className="w-7 h-7 bg-orange-500/20 border border-orange-400/20 rounded-full flex items-center justify-center text-orange-400 font-bold text-xs flex-shrink-0">
                        {auth?.user?.name?.[0]?.toUpperCase() ?? 'A'}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium text-gray-200 truncate">{auth?.user?.name}</p>
                        <p className="text-[11px] truncate">
                            {auth?.user?.is_super_admin
                                ? <span className="text-orange-400 font-semibold">Super Admin</span>
                                : <span className="text-gray-600">{auth?.user?.email}</span>}
                        </p>
                    </div>
                </div>
                <button
                    onClick={logout}
                    className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-[13px] text-gray-500 hover:text-red-400 hover:bg-red-500/[0.06] transition-colors"
                >
                    <LogOut className="w-4 h-4 flex-shrink-0" />
                    Déconnexion
                </button>
            </div>
        </div>
    );
}

function NavLink({ item, isActive, onClose, indent = false }) {
    const Icon = item.icon;
    return (
        <Link
            href={route(item.href)}
            onClick={onClose}
            className={`flex items-center gap-2.5 ${indent ? 'pl-4 pr-3' : 'px-3'} py-[7px] rounded-lg text-[13px] font-medium transition-all duration-100 mb-0.5 ${
                isActive
                    ? 'bg-orange-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/[0.06]'
            }`}
        >
            <Icon className={`w-[15px] h-[15px] flex-shrink-0 ${isActive ? 'text-white/90' : 'text-gray-600'}`} />
            <span className="truncate">{item.label}</span>
        </Link>
    );
}

/* ── Breadcrumbs ────────────────────────────────────────────────────── */
function Breadcrumbs({ title }) {
    const allItems = NAV_SECTIONS.flatMap(s => s.items.map(item => ({ ...item, section: s.label })));
    const active = allItems.find(item => isRouteActive(item.href));
    const section = active?.section;

    return (
        <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-zinc-500">
            <Link href={route('admin.dashboard')} className="hover:text-orange-600 dark:hover:text-orange-400 transition-colors font-medium">
                Admin
            </Link>
            {section && (
                <>
                    <span className="text-gray-300 dark:text-zinc-700">/</span>
                    <span className="text-gray-500 dark:text-zinc-500">{section}</span>
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

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex">
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-20 bg-black/60 backdrop-blur-sm lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar — intentionally always dark, matching Linear/Vercel-style persistent dark nav rails */}
            <aside
                className={`fixed inset-y-0 left-0 z-30 w-[230px] flex flex-col transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
                    sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
                }`}
            >
                <SidebarContent onClose={() => setSidebarOpen(false)} />
            </aside>

            {/* Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
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
                    <div className="bg-white dark:bg-zinc-900 border-b border-gray-100 dark:border-zinc-800 px-5 py-3">
                        <h1 className="text-lg font-bold text-gray-900 dark:text-zinc-100">{title}</h1>
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
