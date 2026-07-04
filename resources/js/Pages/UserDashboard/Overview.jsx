import { Head, Link } from '@inertiajs/react';
import UserLayout from '@/Layouts/UserLayout';

const IC = {
    star:     <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
    clock:    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
    heart:    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>,
    calendar: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
    school:   <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
};

function StatCard({ label, value, icon, href, color = 'orange' }) {
    const colors = {
        orange: 'bg-orange-50 text-orange-600',
        green:  'bg-emerald-50 text-emerald-600',
        blue:   'bg-blue-50 text-blue-600',
        red:    'bg-red-50 text-red-600',
        purple: 'bg-purple-50 text-purple-600',
    };
    const inner = (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4 hover:border-orange-100 hover:shadow-md transition-all">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${colors[color]}`}>{icon}</div>
            <div>
                <p className="text-xs text-gray-500 font-medium">{label}</p>
                <p className="text-2xl font-extrabold text-gray-900 tracking-tight">{value}</p>
            </div>
        </div>
    );
    return href ? <Link href={href}>{inner}</Link> : inner;
}

function StarRating({ value }) {
    return (
        <span>
            {[1, 2, 3, 4, 5].map((i) => (
                <span key={i} className={i <= value ? 'text-yellow-400' : 'text-gray-200'}>★</span>
            ))}
        </span>
    );
}

const BOOKING_STATUS = {
    pending:   { label: 'En attente',  cls: 'badge badge-yellow' },
    confirmed: { label: 'Confirmée',   cls: 'badge badge-green'  },
    completed: { label: 'Terminée',    cls: 'badge badge-blue'   },
    cancelled: { label: 'Annulée',     cls: 'badge badge-red'    },
};

export default function Overview({ stats, recentReviews, favoriteSchools, recentBookings }) {
    return (
        <UserLayout title="Mon espace">
            <Head title="Mon tableau de bord" />

            {/* ── KPIs ── */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                <StatCard label="Avis publiés"     value={stats.approved_reviews} icon={IC.star}     color="orange" href={route('user.reviews', { status: 'approved' })} />
                <StatCard label="Avis en attente"  value={stats.pending_reviews}  icon={IC.clock}    color="red"    href={route('user.reviews', { status: 'pending' })} />
                <StatCard label="Écoles favorites" value={stats.favorites}        icon={IC.heart}    color="green"  href={route('user.favorites')} />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
                <StatCard label="Mes réservations"           value={stats.total_bookings}   icon={IC.calendar} color="blue"   />
                <StatCard label="En attente de confirmation" value={stats.pending_bookings} icon={IC.clock}    color="purple" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Recent reviews */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-900">Mes derniers avis</h3>
                        <Link href={route('user.reviews')} className="text-sm text-orange-600 hover:underline">Voir tout →</Link>
                    </div>
                    {recentReviews.length > 0 ? (
                        <div className="space-y-3">
                            {recentReviews.map((r) => (
                                <div key={r.id} className="flex items-start gap-3 pb-3 border-b border-gray-50 last:border-0">
                                    <div className="w-9 h-9 bg-orange-50 border border-orange-100 rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0">
                                        {r.auto_school?.logo_url
                                            ? <img src={`/storage/${r.auto_school.logo_url}`} alt="" className="w-full h-full object-cover" />
                                            : IC.school}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                                            <p className="text-sm font-semibold text-gray-900 truncate">{r.auto_school?.name}</p>
                                            <StarRating value={r.rating} />
                                        </div>
                                        <p className="text-xs text-gray-500 truncate">{r.title}</p>
                                        <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full font-medium ${
                                            r.status === 'approved' ? 'badge-green badge'
                                            : r.status === 'rejected' ? 'badge-red badge'
                                            : 'badge-yellow badge'
                                        }`}>
                                            {r.status === 'approved' ? 'Approuvé' : r.status === 'rejected' ? 'Refusé' : 'En attente'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-8 text-center">
                            <p className="text-gray-400 text-sm mb-3">Vous n'avez pas encore écrit d'avis</p>
                            <Link href={route('search')} className="text-orange-600 hover:underline text-sm">
                                Trouver une auto-école →
                            </Link>
                        </div>
                    )}
                </div>

                {/* Favorite schools */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-900">Mes écoles favorites</h3>
                        <Link href={route('user.favorites')} className="text-sm text-orange-600 hover:underline">Voir tout →</Link>
                    </div>
                    {favoriteSchools.length > 0 ? (
                        <div className="space-y-3">
                            {favoriteSchools.map((s) => (
                                <Link key={s.id} href={route('school.detail', s.slug)}
                                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-orange-50 transition-colors group border border-transparent hover:border-orange-100">
                                    <div className="w-9 h-9 bg-orange-50 border border-orange-100 rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0">
                                        {s.logo_url
                                            ? <img src={`/storage/${s.logo_url}`} alt="" className="w-full h-full object-cover" />
                                            : IC.school}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-gray-900 group-hover:text-orange-700 truncate">{s.name}</p>
                                        <p className="text-xs text-gray-400 flex items-center gap-1">
                                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/></svg>
                                            {s.city}
                                        </p>
                                    </div>
                                    <div className="flex gap-1">
                                        {s.categories?.slice(0, 2).map((c) => (
                                            <span key={c.id} className="text-xs bg-orange-50 text-orange-600 px-1.5 py-0.5 rounded">{c.code}</span>
                                        ))}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="py-8 text-center">
                            <p className="text-gray-400 text-sm mb-3">Aucune école en favoris</p>
                            <Link href={route('search')} className="text-orange-600 hover:underline text-sm">
                                Explorer les auto-écoles →
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Recent Bookings ── */}
            {recentBookings && recentBookings.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Mes dernières demandes de réservation</h3>
                    <div className="space-y-3">
                        {recentBookings.map((b) => {
                            const st = BOOKING_STATUS[b.status] ?? { label: b.status, cls: 'bg-gray-100 text-gray-600' };
                            return (
                                <div key={b.id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:bg-orange-50/50 hover:border-orange-100 transition-colors">
                                    <div className="w-9 h-9 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center text-blue-600 flex-shrink-0">{IC.calendar}</div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">
                                            {b.auto_school?.name ?? b.name ?? '—'}
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            {b.permit_type ? `Permis ${b.permit_type} • ` : ''}
                                            {b.preferred_date
                                                ? new Date(b.preferred_date).toLocaleDateString('fr-FR')
                                                : new Date(b.created_at).toLocaleDateString('fr-FR')}
                                        </p>
                                    </div>
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${st.cls}`}>{st.label}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Quick links */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="font-semibold text-gray-900 mb-4">Accès rapide</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                        { label: 'Rechercher',  href: route('search'),         icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>, color: 'bg-blue-50 text-blue-600' },
                        { label: 'Mes avis',    href: route('user.reviews'),   icon: IC.star,   color: 'bg-orange-50 text-orange-600' },
                        { label: 'Favoris',     href: route('user.favorites'), icon: IC.heart,  color: 'bg-pink-50 text-pink-600'   },
                        { label: 'Mon profil',  href: route('user.profile'),   icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>, color: 'bg-purple-50 text-purple-600' },
                    ].map((a) => (
                        <Link key={a.href} href={a.href}
                            className="flex flex-col items-center gap-2.5 p-4 rounded-xl border border-gray-100 hover:border-orange-200 hover:bg-orange-50/50 transition-all text-center group">
                            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${a.color} group-hover:scale-110 transition-transform`}>{a.icon}</div>
                            <span className="text-xs font-semibold text-gray-700 group-hover:text-orange-700">{a.label}</span>
                        </Link>
                    ))}
                </div>
            </div>
        </UserLayout>
    );
}
