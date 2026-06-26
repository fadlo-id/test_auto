import { Head, Link } from '@inertiajs/react';
import SchoolLayout from '@/Layouts/SchoolLayout';

const stars = (n) => '★'.repeat(n) + '☆'.repeat(5 - n);

function StatCard({ title, value, icon, sub }) {
    return (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-500">{title}</p>
                <span className="text-xl">{icon}</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{value ?? '—'}</p>
            {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
        </div>
    );
}

export default function Overview({ school, reviewStats, recentReviews }) {
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
                    <strong>Inscription refusée</strong> — {school.rejection_reason ?? 'Contactez le support pour plus d\'informations.'}
                </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
                <StatCard title="Avis total" value={reviewStats?.total ?? 0} icon="⭐" sub={avgRating ? `Note moyenne : ${avgRating}/5` : null} />
                <StatCard title="Avis en attente" value={reviewStats?.pending ?? 0} icon="⏳" />
                <StatCard title="Services" value={school.services_count ?? school.services?.length ?? 0} icon="📋" />
                <StatCard
                    title="Abonnement"
                    value={school.subscription?.status === 'active' ? school.subscription?.plan?.name ?? 'Actif' : 'Gratuit'}
                    icon="💳"
                    sub={school.subscription?.expires_at ? `Expire le ${new Date(school.subscription.expires_at).toLocaleDateString('fr-FR')}` : null}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent reviews */}
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-900">Derniers avis</h3>
                        <Link href={route('school.reviews')} className="text-sm text-orange-600 hover:underline">Voir tout</Link>
                    </div>
                    <div className="space-y-3">
                        {recentReviews?.map((review) => (
                            <div key={review.id} className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0 last:pb-0">
                                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-medium text-sm flex-shrink-0">
                                    {review.user?.name?.[0]?.toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <span className="text-xs font-medium text-gray-900">{review.user?.name}</span>
                                        <span className="text-yellow-500 text-xs">{stars(review.rating)}</span>
                                        <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${review.status === 'approved' ? 'bg-green-100 text-green-700' : review.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
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
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <h3 className="font-semibold text-gray-900 mb-4">Actions rapides</h3>
                    <div className="space-y-2">
                        {[
                            { label: 'Gérer les services', href: route('school.services'), icon: '📋', desc: 'Ajouter ou modifier vos prestations' },
                            { label: 'Voir les avis', href: route('school.reviews'), icon: '⭐', desc: 'Consulter les retours de vos candidats' },
                            { label: 'Abonnement', href: route('school.subscription'), icon: '💳', desc: 'Gérer votre plan et factures' },
                            { label: 'Paramètres', href: route('school.settings'), icon: '⚙️', desc: 'Modifier votre profil d\'auto-école' },
                        ].map((action) => (
                            <Link key={action.href} href={action.href} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group">
                                <span className="text-xl">{action.icon}</span>
                                <div>
                                    <p className="text-sm font-medium text-gray-900 group-hover:text-orange-600">{action.label}</p>
                                    <p className="text-xs text-gray-400">{action.desc}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </SchoolLayout>
    );
}
