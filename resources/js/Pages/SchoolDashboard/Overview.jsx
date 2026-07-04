import { Head, Link } from '@inertiajs/react';
import SchoolLayout from '@/Layouts/SchoolLayout';

const stars = (n) => '★'.repeat(Math.round(n)) + '☆'.repeat(5 - Math.round(n));

const SVG_ICONS = {
    eye:        <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
    click:      <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round"><path d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"/></svg>,
    calendar:   <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
    trend:      <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
    star:       <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
    clock:      <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
    tools:      <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/></svg>,
    card:       <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
    settings:   <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>,
    chart:      <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></svg>,
};

function StatCard({ title, value, icon, sub, color = 'gray' }) {
    const colors = {
        orange: 'bg-orange-50 text-orange-600',
        green:  'bg-emerald-50 text-emerald-600',
        blue:   'bg-blue-50 text-blue-600',
        purple: 'bg-purple-50 text-purple-600',
        gray:   'bg-gray-100 text-gray-500',
    };
    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:border-orange-100 hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-gray-500 font-medium">{title}</p>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${colors[color]}`}>{icon}</div>
            </div>
            <p className="text-2xl font-extrabold text-gray-900 tracking-tight">{value ?? '—'}</p>
            {sub && <p className="text-xs text-gray-400 mt-1.5">{sub}</p>}
        </div>
    );
}

function CreditBar({ label, used, total, pct, unlimited, color = 'orange' }) {
    const colors = { orange: 'bg-orange-500', blue: 'bg-blue-500', green: 'bg-emerald-500', red: 'bg-red-500' };
    const barColor = pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-amber-500' : colors[color];

    if (unlimited) {
        return (
            <div>
                <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium text-gray-700">{label}</span>
                    <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Illimité</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-2 bg-emerald-400 rounded-full" style={{ width: '100%' }} />
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-medium text-gray-700">{label}</span>
                <span className="text-xs text-gray-500">{used ?? 0} / {total ?? 0} <span className="text-gray-400">({100 - (pct ?? 0)}% restant)</span></span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-2 rounded-full transition-all ${barColor}`} style={{ width: `${Math.min(pct ?? 0, 100)}%` }} />
            </div>
        </div>
    );
}

export default function Overview({ school, reviewStats, recentReviews, analytics30d, bookingStats, conversionRate, creditSummary }) {
    const avgRating = reviewStats?.avg_rating ? Number(reviewStats.avg_rating).toFixed(1) : null;

    return (
        <SchoolLayout title="Vue d'ensemble" school={school}>
            <Head title="Tableau de bord" />

            {school.status === 'pending' && (
                <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-yellow-800 text-sm">
                    <strong>En attente de validation</strong> — Votre auto-école est en cours de vérification par notre équipe. Vous serez notifié par email.
                </div>
            )}

            {school.status === 'rejected' && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 text-sm">
                    <strong>Inscription refusée</strong> — {school.rejection_reason ?? "Contactez le support pour plus d'informations."}
                </div>
            )}

            {/* ── Main KPIs ── */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
                <StatCard title="Vues (30j)"        value={(analytics30d?.views  ?? 0).toLocaleString('fr-FR')} icon={SVG_ICONS.eye}      color="blue"   />
                <StatCard title="Clics (30j)"        value={(analytics30d?.clicks ?? 0).toLocaleString('fr-FR')} icon={SVG_ICONS.click}    color="orange" />
                <StatCard title="Réservations total" value={bookingStats?.total  ?? 0}  icon={SVG_ICONS.calendar} color="green"
                    sub={`${bookingStats?.month ?? 0} ce mois`} />
                <StatCard title="Taux de conversion" value={`${conversionRate ?? 0}%`}  icon={SVG_ICONS.trend}    color="purple"
                    sub="vues → réservations (30j)" />
            </div>

            {/* ── Reviews + Subscription ── */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
                <StatCard title="Avis total"       value={reviewStats?.total ?? 0}    icon={SVG_ICONS.star}   color="orange"
                    sub={avgRating ? `Note moyenne : ${avgRating}/5` : null} />
                <StatCard title="Avis en attente"  value={reviewStats?.pending ?? 0}  icon={SVG_ICONS.clock}  color="gray" />
                <StatCard title="Services"         value={school.services_count ?? 0} icon={SVG_ICONS.tools}  color="blue" />
                <StatCard
                    title="Abonnement"
                    value={school.subscription?.status === 'active' ? school.subscription?.plan?.name ?? 'Actif' : 'Gratuit'}
                    icon={SVG_ICONS.card} color="purple"
                    sub={school.subscription?.expires_at ? `Expire le ${new Date(school.subscription.expires_at).toLocaleDateString('fr-FR')}` : null}
                />
            </div>

            {/* ── Booking status bar ── */}
            {(bookingStats?.total ?? 0) > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-900">État des réservations</h3>
                        <Link href={route('school.bookings')} className="text-sm text-orange-600 hover:underline">Gérer →</Link>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        {[
                            { label: 'En attente',  value: bookingStats.pending,   color: 'bg-yellow-400', text: 'text-yellow-700' },
                            { label: 'Confirmées',  value: bookingStats.confirmed,  color: 'bg-green-500',  text: 'text-green-700'  },
                            { label: 'Total',       value: bookingStats.total,      color: 'bg-blue-500',   text: 'text-blue-700'   },
                        ].map((s) => (
                            <div key={s.label} className="text-center">
                                <p className={`text-2xl font-bold ${s.text}`}>{s.value}</p>
                                <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ── Credit Widget ── */}
            {creditSummary && (
                <div className={`bg-white rounded-2xl border shadow-sm p-5 mb-6 ${creditSummary.exhausted ? 'border-red-200 bg-red-50/30' : 'border-gray-100'}`}>
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <h3 className="font-semibold text-gray-900">Crédits de visibilité</h3>
                            <p className="text-xs text-gray-500 mt-0.5">Plan : <strong>{creditSummary.plan_name}</strong>
                                {creditSummary.expires_at && <span> · Renouvellement le {creditSummary.expires_at}</span>}
                                {creditSummary.reset_at && <span> · Réinitialisé le {creditSummary.reset_at}</span>}
                            </p>
                        </div>
                        {creditSummary.exhausted && (
                            <span className="badge badge-red text-xs">Crédits épuisés — École masquée</span>
                        )}
                        {!creditSummary.exhausted && (creditSummary.views_pct >= 90 || creditSummary.clicks_pct >= 90) && (
                            <span className="badge badge-yellow text-xs">Crédits presque épuisés</span>
                        )}
                    </div>
                    <div className="space-y-4">
                        <CreditBar
                            label="Vues"
                            used={creditSummary.views_used}
                            total={creditSummary.views_total}
                            pct={creditSummary.views_pct}
                            unlimited={creditSummary.unlimited_views}
                            color="blue"
                        />
                        <CreditBar
                            label="Clics"
                            used={creditSummary.clicks_used}
                            total={creditSummary.clicks_total}
                            pct={creditSummary.clicks_pct}
                            unlimited={creditSummary.unlimited_clicks}
                            color="orange"
                        />
                    </div>
                    {creditSummary.exhausted && (
                        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                            Votre quota de visibilité est atteint. Votre auto-école n'apparaît plus dans les résultats publics. Veuillez renouveler votre abonnement pour restaurer la visibilité.
                        </div>
                    )}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent reviews */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-900">Derniers avis</h3>
                        <Link href={route('school.reviews')} className="text-sm text-orange-600 hover:underline">Voir tout</Link>
                    </div>
                    <div className="space-y-3">
                        {recentReviews?.map((review) => (
                            <div key={review.id} className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0 last:pb-0">
                                <div className="w-8 h-8 bg-orange-50 border border-orange-100 rounded-xl flex items-center justify-center text-orange-600 font-semibold text-sm flex-shrink-0">
                                    {review.user?.name?.[0]?.toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                                        <span className="text-xs font-medium text-gray-900">{review.user?.name}</span>
                                        <span className="text-yellow-500 text-xs">{stars(review.rating)}</span>
                                        <span className={`badge ${review.status === 'approved' ? 'badge-green' : review.status === 'rejected' ? 'badge-red' : 'badge-yellow'}`}>
                                            {review.status === 'approved' ? 'Approuvé' : review.status === 'rejected' ? 'Refusé' : 'En attente'}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 truncate">{review.title}</p>
                                </div>
                            </div>
                        ))}
                        {(!recentReviews || recentReviews.length === 0) && (
                            <p className="text-gray-400 text-sm text-center py-6">Aucun avis pour le moment</p>
                        )}
                    </div>
                </div>

                {/* Quick actions */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <h3 className="font-semibold text-gray-900 mb-4">Actions rapides</h3>
                    <div className="space-y-1">
                        {[
                            { label: 'Réservations',    href: route('school.bookings'),     icon: SVG_ICONS.calendar, desc: `${bookingStats?.pending ?? 0} en attente de confirmation` },
                            { label: 'Services',        href: route('school.services'),     icon: SVG_ICONS.tools,    desc: 'Ajouter ou modifier vos prestations' },
                            { label: 'Avis clients',    href: route('school.reviews'),      icon: SVG_ICONS.star,     desc: 'Consulter les retours de vos candidats' },
                            { label: 'Statistiques',    href: route('school.statistics'),   icon: SVG_ICONS.chart,    desc: 'Vues, clics, contacts, tendances' },
                            { label: 'Abonnement',      href: route('school.subscription'), icon: SVG_ICONS.card,     desc: 'Gérer votre plan et factures' },
                            { label: 'Paramètres',      href: route('school.settings'),     icon: SVG_ICONS.settings, desc: "Modifier votre profil d'auto-école" },
                        ].map((action) => (
                            <Link key={action.href} href={action.href}
                                className="flex items-center gap-3 p-3 rounded-xl hover:bg-orange-50 hover:border-orange-100 transition-colors group border border-transparent">
                                <span className="w-8 h-8 rounded-xl bg-gray-100 group-hover:bg-orange-100 flex items-center justify-center text-gray-500 group-hover:text-orange-600 flex-shrink-0 transition-colors">
                                    {action.icon}
                                </span>
                                <div>
                                    <p className="text-sm font-semibold text-gray-900 group-hover:text-orange-700">{action.label}</p>
                                    <p className="text-xs text-gray-400">{action.desc}</p>
                                </div>
                                <svg className="w-4 h-4 text-gray-300 group-hover:text-orange-400 ml-auto transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </SchoolLayout>
    );
}
