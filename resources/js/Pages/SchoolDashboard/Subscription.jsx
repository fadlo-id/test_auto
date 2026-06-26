import { Head, usePage } from '@inertiajs/react';
import { useState } from 'react';
import SchoolLayout from '@/Layouts/SchoolLayout';

function PlanCard({ plan, isActive, onSelect, loading }) {
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
                <button onClick={() => onSelect(plan)} disabled={loading}
                    className="w-full py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 disabled:opacity-50">
                    {loading ? 'Chargement...' : 'Souscrire'}
                </button>
            )}
        </div>
    );
}

function CheckoutModal({ plan, onClose, stripeKey }) {
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState(null);
    const [cardEl, setCardEl] = useState(null);
    const [stripe, setStripe] = useState(null);

    const initStripe = async (el) => {
        if (!el || !stripeKey) return;
        try {
            const { loadStripe } = await import('@stripe/stripe-js');
            const s = await loadStripe(stripeKey);
            const elements = s.elements();
            const card = elements.create('card', {
                style: { base: { fontSize: '14px', color: '#374151' } },
            });
            card.mount(el);
            setCardEl(card);
            setStripe(s);
        } catch (e) {
            setError('Erreur de chargement Stripe. Verifiez votre configuration.');
        }
    };

    const pay = async () => {
        if (!stripe || !cardEl) return;
        setProcessing(true);
        setError(null);

        try {
            const resp = await fetch(route('school.payment.intent'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': document.querySelector('meta[name=csrf-token]')?.content ?? '' },
                body: JSON.stringify({ plan_id: plan.id }),
            });
            const { client_secret, error: apiError } = await resp.json();
            if (apiError) { setError(apiError); setProcessing(false); return; }

            const { error: stripeError } = await stripe.confirmCardPayment(client_secret, {
                payment_method: { card: cardEl },
            });

            if (stripeError) {
                setError(stripeError.message);
                setProcessing(false);
            } else {
                window.location.href = route('school.payment.success', {
                    payment_intent: client_secret.split('_secret')[0],
                    plan_id: plan.id,
                });
            }
        } catch (e) {
            setError('Une erreur est survenue. Veuillez reessayer.');
            setProcessing(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-900">Paiement — {plan.name}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
                </div>

                <p className="text-2xl font-bold text-orange-600 mb-4">
                    {Number(plan.price).toLocaleString()} MAD
                    <span className="text-sm font-normal text-gray-500">/{plan.billing_period === 'yearly' ? 'an' : 'mois'}</span>
                </p>

                {!stripeKey ? (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-sm">
                        La configuration Stripe n'est pas activee. Ajoutez STRIPE_KEY dans le fichier .env pour activer les paiements.
                    </div>
                ) : (
                    <>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Carte bancaire</label>
                            <div ref={initStripe} className="border border-gray-300 rounded-lg px-3 py-3" />
                        </div>

                        {error && (
                            <p className="text-red-500 text-sm mb-3">{error}</p>
                        )}

                        <button onClick={pay} disabled={processing || !stripe}
                            className="w-full py-3 bg-orange-600 text-white rounded-xl font-medium hover:bg-orange-700 disabled:opacity-50">
                            {processing ? 'Paiement en cours...' : `Payer ${Number(plan.price).toLocaleString()} MAD`}
                        </button>
                    </>
                )}

                <p className="text-xs text-gray-400 text-center mt-3">Paiement securise par Stripe</p>
            </div>
        </div>
    );
}

export default function Subscription({ school, subscription, plans, payments }) {
    const { flash } = usePage().props;
    const stripeKey = import.meta.env.VITE_STRIPE_KEY ?? null;
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [loadingPlan, setLoadingPlan] = useState(null);

    const handleSelect = (plan) => {
        setLoadingPlan(plan.id);
        setSelectedPlan(plan);
        setLoadingPlan(null);
    };

    return (
        <SchoolLayout title="Abonnement" school={school}>
            <Head title="Abonnement" />

            {selectedPlan && (
                <CheckoutModal
                    plan={selectedPlan}
                    stripeKey={stripeKey}
                    onClose={() => setSelectedPlan(null)}
                />
            )}

            {flash?.success && (
                <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm border border-green-200">{flash.success}</div>
            )}
            {flash?.error && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200">{flash.error}</div>
            )}

            {/* Current status */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Votre abonnement actuel</h3>
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
                            <p className="text-sm text-gray-500">Choisissez un plan pour plus de visibilite</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Plans */}
            <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-4">Plans disponibles</h3>
                {plans.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {plans.map((plan) => (
                            <PlanCard
                                key={plan.id}
                                plan={plan}
                                isActive={subscription?.plan_id === plan.id && subscription?.status === 'active'}
                                onSelect={handleSelect}
                                loading={loadingPlan === plan.id}
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
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${payment.status === 'completed' ? 'bg-green-100 text-green-700' : payment.status === 'failed' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
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
