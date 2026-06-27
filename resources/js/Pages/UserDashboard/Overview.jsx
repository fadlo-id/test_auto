import { Head, Link } from '@inertiajs/react';
import UserLayout from '@/Layouts/UserLayout';

function StatCard({ label, value, icon, href, color = 'orange' }) {
    const colors = {
        orange: 'bg-orange-50 text-orange-600',
        green:  'bg-green-50 text-green-600',
        blue:   'bg-blue-50 text-blue-600',
        red:    'bg-red-50 text-red-600',
    };
    const inner = (
        <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${colors[color]}`}>{icon}</div>
            <div>
                <p className="text-sm text-gray-500">{label}</p>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
            </div>
        </div>
    );
    return href ? <Link href={href}>{inner}</Link> : inner;
}

function StarRating({ value }) {
    return (
        <span>
            {[1,2,3,4,5].map(i => (
                <span key={i} className={i <= value ? 'text-yellow-400' : 'text-gray-200'}>★</span>
            ))}
        </span>
    );
}

export default function Overview({ stats, recentReviews, favoriteSchools }) {
    return (
        <UserLayout title="Mon espace">
            <Head title="Mon tableau de bord" />

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StatCard label="Avis publiés"      value={stats.approved_reviews} icon="⭐" color="orange" href={route('user.reviews', { status: 'approved' })} />
                <StatCard label="Avis en attente"   value={stats.pending_reviews}  icon="⏳" color="red"    href={route('user.reviews', { status: 'pending' })} />
                <StatCard label="Total avis"        value={stats.total_reviews}    icon="📝" color="blue"   href={route('user.reviews')} />
                <StatCard label="Écoles favorites"  value={stats.favorites}        icon="❤️" color="green"  href={route('user.favorites')} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent reviews */}
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-900">Mes derniers avis</h3>
                        <Link href={route('user.reviews')} className="text-sm text-orange-600 hover:underline">Voir tout →</Link>
                    </div>
                    {recentReviews.length > 0 ? (
                        <div className="space-y-3">
                            {recentReviews.map(r => (
                                <div key={r.id} className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0">
                                    <div className="w-9 h-9 bg-orange-100 rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0">
                                        {r.auto_school?.logo_url
                                            ? <img src={`/storage/${r.auto_school.logo_url}`} alt="" className="w-full h-full object-cover" />
                                            : <span className="text-orange-500 text-sm">🏫</span>}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                                            <p className="text-sm font-medium text-gray-900 truncate">{r.auto_school?.name}</p>
                                            <StarRating value={r.rating} />
                                        </div>
                                        <p className="text-xs text-gray-500 truncate">{r.title}</p>
                                        <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full font-medium ${
                                            r.status === 'approved' ? 'bg-green-100 text-green-700'
                                            : r.status === 'rejected' ? 'bg-red-100 text-red-700'
                                            : 'bg-yellow-100 text-yellow-700'
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
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-900">Mes écoles favorites</h3>
                        <Link href={route('user.favorites')} className="text-sm text-orange-600 hover:underline">Voir tout →</Link>
                    </div>
                    {favoriteSchools.length > 0 ? (
                        <div className="space-y-3">
                            {favoriteSchools.map(s => (
                                <Link key={s.id} href={route('school.detail', s.slug)}
                                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group">
                                    <div className="w-9 h-9 bg-orange-100 rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0">
                                        {s.logo_url
                                            ? <img src={`/storage/${s.logo_url}`} alt="" className="w-full h-full object-cover" />
                                            : <span className="text-orange-500 text-sm">🚗</span>}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 group-hover:text-orange-600 truncate">{s.name}</p>
                                        <p className="text-xs text-gray-400">📍 {s.city}</p>
                                    </div>
                                    <div className="flex gap-1">
                                        {s.categories?.slice(0, 2).map(c => (
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

            {/* Quick links */}
            <div className="mt-6 bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="font-semibold text-gray-900 mb-4">Accès rapide</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                        { label: 'Rechercher',    href: route('search'),          icon: '🔍' },
                        { label: 'Mes avis',      href: route('user.reviews'),    icon: '⭐' },
                        { label: 'Favoris',       href: route('user.favorites'),  icon: '❤️' },
                        { label: 'Mon profil',    href: route('profile.edit'),    icon: '👤' },
                    ].map(a => (
                        <Link key={a.href} href={a.href}
                            className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-colors text-center">
                            <span className="text-2xl">{a.icon}</span>
                            <span className="text-xs font-medium text-gray-700">{a.label}</span>
                        </Link>
                    ))}
                </div>
            </div>
        </UserLayout>
    );
}
