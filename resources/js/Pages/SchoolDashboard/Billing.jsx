import { Head, Link, usePage } from '@inertiajs/react';
import SchoolLayout from '@/Layouts/SchoolLayout';

const SUB_STATUS = { active: 'Actif', past_due: 'Impayé', canceled: 'Annulé', cancelled: 'Annulé', expired: 'Expiré' };
const SUB_COLORS = { active: 'bg-green-100 text-green-700', past_due: 'bg-yellow-100 text-yellow-700', canceled: 'bg-gray-100 text-gray-600', cancelled: 'bg-gray-100 text-gray-600', expired: 'bg-red-100 text-red-600' };

export default function Billing({ payments, subscriptions = [], currentSubscription, summary = {} }) {
    const { school } = usePage().props;

    return (
        <SchoolLayout title="Facturation" school={school}>
            <Head title="Facturation" />

            {/* Summary */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <p className="text-sm text-gray-500 mb-1">Total payé</p>
                    <p className="text-2xl font-bold text-gray-900">{Number(summary.total_paid ?? 0).toLocaleString()} MAD</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <p className="text-sm text-gray-500 mb-1">Abonnement actuel</p>
                    {currentSubscription ? (
                        <div>
                            <p className="text-lg font-bold text-gray-900">{currentSubscription.plan?.name}</p>
                            <p className="text-sm text-gray-500">Expire le {new Date(currentSubscription.expires_at).toLocaleDateString('fr')}</p>
                        </div>
                    ) : (
                        <div>
                            <p className="text-gray-400 text-sm mb-2">Aucun abonnement actif</p>
                            <Link href={route('school.subscription')} className="text-sm text-orange-600 hover:underline">Voir les plans →</Link>
                        </div>
                    )}
                </div>
            </div>

            {/* Subscription history */}
            {subscriptions.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 p-5 mb-5">
                    <h3 className="font-semibold text-gray-900 mb-4">Historique des abonnements</h3>
                    <div className="space-y-2">
                        {subscriptions.map((sub) => (
                            <div key={sub.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                                <div>
                                    <p className="text-sm font-medium">{sub.plan?.name ?? 'Plan inconnu'}</p>
                                    <p className="text-xs text-gray-400">{new Date(sub.started_at).toLocaleDateString('fr')} → {new Date(sub.expires_at).toLocaleDateString('fr')}</p>
                                </div>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${SUB_COLORS[sub.status] ?? 'bg-gray-100 text-gray-600'}`}>
                                    {SUB_STATUS[sub.status] ?? sub.status}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Payment history */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-900">Historique des paiements</h3>
                </div>
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>{['Date', 'Plan', 'Montant', 'Statut', 'Référence'].map((h) => <th key={h} className="text-left px-4 py-3 font-medium text-gray-600">{h}</th>)}</tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {payments?.data?.length === 0 && <tr><td colSpan={5} className="text-center py-10 text-gray-400">Aucun paiement</td></tr>}
                        {payments?.data?.map((p) => (
                            <tr key={p.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3">{new Date(p.created_at).toLocaleDateString('fr')}</td>
                                <td className="px-4 py-3 text-gray-600">{p.plan?.name ?? '-'}</td>
                                <td className="px-4 py-3 font-medium">{Number(p.amount).toLocaleString()} MAD</td>
                                <td className="px-4 py-3">
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${p.status === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                                        {p.status === 'success' ? 'Payé' : p.status}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-gray-400 text-xs truncate max-w-xs">{p.stripe_payment_intent_id ?? '-'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {payments?.last_page > 1 && (
                    <div className="p-4 flex gap-2 border-t border-gray-100">
                        {payments.links?.map((link, i) => (
                            <button key={i} disabled={!link.url} onClick={() => window.location.href = link.url}
                                className={`px-3 py-1 rounded text-xs ${link.active ? 'bg-orange-600 text-white' : 'border border-gray-200 text-gray-600 disabled:opacity-40'}`}
                                dangerouslySetInnerHTML={{ __html: link.label }} />
                        ))}
                    </div>
                )}
            </div>
        </SchoolLayout>
    );
}
