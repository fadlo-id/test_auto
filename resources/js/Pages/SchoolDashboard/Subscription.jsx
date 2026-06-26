import { Head } from '@inertiajs/react';
import SchoolLayout from '@/Layouts/SchoolLayout';

function PlanCard({ plan, isActive, onSelect }) {
    return (
        <div className={`relative rounded-xl border-2 p-5 transition-colors ${isActive ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-orange-300'}`}>
            {isActive && (
                <span className="absolute -top-3 left-4 bg-orange-600 text-white text-xs font-medium px-3 py-0.5 rounded-full">
                    Plan actuel
                </span>
            )}
            <h3 className="font-bold text-gray-900 text-lg">{plan.name}</h3>
            <div className="mt-2 mb-4">
                <span className="text-3xl font-bold text-gray-900">{Number(plan.price).toLocaleString()}</span>
                <span className="text-gray-500 text-sm"> MAD/{plan.billing_period === 'yearly' ? 'an' : 'mois'}</span>
            </div>
            {plan.description && <p className="text-sm text-gray-500 mb-4">{plan.description}</p>}
            {plan.features && (
                <ul className="space-y-1 mb-4">
                    {(Array.isArray(plan.features) ? plan.features : Object.values(plan.features)).map((f, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                            <span className="text-green-500">✓</span> {f}
                        </li>
                    ))}
                </ul>
            )}
            {!isActive && (
                <button onClick={() => onSelect(plan)}
                    className="w-full py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700">
                    Choisir ce plan
                </button>
            )}
        </div>
    );
}

export default function Subscription({ school, subscription, plans, payments }) {
    const handleSelect = (plan) => {
        alert(`Paiement Stripe pour "${plan.name}" — fonctionnalite disponible en Phase 8.`);
    };

    return (
        <SchoolLayout title="Abonnement" school={school}>
            <Head title="Abonnement" />

            {/* Current subscription status */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Statut de votre abonnement</h3>
                {subscription && subscription.status === 'active' ? (
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-green-600 text-xl">✓</div>
                        <div>
                            <p className="font-semibold text-gray-900">{subscription.plan?.name}</p>
                            <p className="text-sm text-gray-500">
                                Expire le {subscription.expires_at ? new Date(subscription.expires_at).toLocaleDateString('fr-FR') : 'N/A'}
                            </p>
                        </div>
                        <span className="ml-auto px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">Actif</span>
                    </div>
                ) : (
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 text-xl">○</div>
                        <div>
                            <p className="font-semibold text-gray-900">Plan gratuit</p>
                            <p className="text-sm text-gray-500">Upgrade pour plus de visibilite</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Plans */}
            <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-4">Nos plans</h3>
                {plans.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {plans.map((plan) => (
                            <PlanCard
                                key={plan.id}
                                plan={plan}
                                isActive={subscription?.plan_id === plan.id && subscription?.status === 'active'}
                                onSelect={handleSelect}
                            />
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-400 text-sm">Aucun plan disponible pour le moment.</p>
                )}
            </div>

            {/* Payment history */}
            {payments.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200">
                    <div className="p-5 border-b border-gray-100">
                        <h3 className="font-semibold text-gray-900">Historique des paiements</h3>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {payments.map((payment) => (
                            <div key={payment.id} className="px-5 py-3 flex items-center gap-4">
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900">{payment.plan?.name ?? 'Paiement'}</p>
                                    <p className="text-xs text-gray-400">{new Date(payment.created_at).toLocaleDateString('fr-FR')}</p>
                                </div>
                                <span className="text-sm font-semibold">{Number(payment.amount).toLocaleString()} {payment.currency}</span>
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${payment.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                    {payment.status}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </SchoolLayout>
    );
}
