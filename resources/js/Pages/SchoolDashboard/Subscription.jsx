import { Head, router, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import SchoolLayout from '@/Layouts/SchoolLayout';
import {
    AlertCircle, ArrowUpCircle, ArrowDownCircle, CheckCircle,
    Clock, CreditCard, FileText, Gift, RefreshCw, Shield, Zap
} from 'lucide-react';

// ── Helpers ────────────────────────────────────────────────────────────────

const fmt   = (n) => Number(n ?? 0).toLocaleString('fr-FR', { minimumFractionDigits: 2 });
const fmtD  = (d) => d ? new Date(d).toLocaleDateString('fr-FR') : '—';

// ── Sub-components ─────────────────────────────────────────────────────────

function StatusBadge({ subscription }) {
    if (!subscription) return null;
    const { status, on_trial } = subscription;
    if (on_trial)             return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">🎁 Essai gratuit</span>;
    if (status === 'active')  return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">✓ Actif</span>;
    if (status === 'past_due')return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">⚠ Paiement en retard</span>;
    if (status === 'cancelled')return<span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">✗ Annulé</span>;
    return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">{status}</span>;
}

function CouponInput({ planPrice, onCoupon }) {
    const [code, setCode]   = useState('');
    const [msg, setMsg]     = useState(null);
    const [loading, setLoading] = useState(false);

    const validate = async () => {
        if (!code.trim()) return;
        setLoading(true); setMsg(null);
        try {
            const r = await fetch(route('school.payment.validate-coupon'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': document.querySelector('meta[name=csrf-token]')?.content ?? '' },
                body: JSON.stringify({ code: code.trim(), plan_id: planPrice?.id }),
            });
            const d = await r.json();
            if (!r.ok) { setMsg({ type: 'error', text: d.error }); onCoupon(null); }
            else       { setMsg({ type: 'ok',    text: `−${fmt(d.discount_amount)} MAD (total: ${fmt(d.final_price)} MAD)` }); onCoupon(d); }
        } catch { setMsg({ type: 'error', text: 'Erreur réseau' }); }
        setLoading(false);
    };

    return (
        <div className="mt-3">
            <label className="text-xs font-medium text-gray-600 mb-1 block">Code promo</label>
            <div className="flex gap-2">
                <input value={code} onChange={e => setCode(e.target.value.toUpperCase())} onKeyDown={e => e.key === 'Enter' && validate()}
                    placeholder="EX: SUMMER20" className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 ring-orange-200 outline-none uppercase" />
                <button onClick={validate} disabled={loading}
                    className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 disabled:opacity-50">
                    {loading ? '…' : 'Appliquer'}
                </button>
            </div>
            {msg && (
                <p className={`text-xs mt-1.5 ${msg.type === 'ok' ? 'text-green-600' : 'text-red-600'}`}>
                    {msg.type === 'ok' ? '✓' : '✗'} {msg.text}
                </p>
            )}
        </div>
    );
}

function CheckoutModal({ plan, mode = 'subscribe', currentSub, vatRate, onClose }) {
    const [step, setStep]       = useState('form'); // form | processing | done | error
    const [couponData, setCouponData] = useState(null);
    const [prorationData, setProrationData] = useState(null);
    const [stripeEl, setStripeEl] = useState(null);
    const [stripeObj, setStripeObj] = useState(null);
    const [errMsg, setErrMsg]   = useState('');
    const cardRef               = useRef(null);
    const stripeKey             = usePage().props.stripe_key ?? import.meta.env.VITE_STRIPE_KEY;

    const isUpgrade  = mode === 'upgrade';
    const finalPrice = couponData ? couponData.final_price : Number(plan.price);
    const proratonAmt = prorationData?.proration_amount ?? null;

    // Load proration for upgrades
    useEffect(() => {
        if (!isUpgrade || !currentSub) return;
        fetch(route('school.payment.upgrade-intent'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': document.querySelector('meta[name=csrf-token]')?.content ?? '' },
            body: JSON.stringify({ plan_id: plan.id }),
        }).then(r => r.json()).then(d => {
            if (d.client_secret) setProrationData(d);
            else setErrMsg(d.error ?? 'Erreur calcul prorata');
        }).catch(() => setErrMsg('Erreur réseau'));
    }, []);

    // Load Stripe
    useEffect(() => {
        if (!stripeKey) return;
        const sc = document.createElement('script');
        sc.src = 'https://js.stripe.com/v3/';
        sc.onload = () => {
            const s = window.Stripe(stripeKey);
            setStripeObj(s);
            const els = s.elements();
            const card = els.create('card', { style: { base: { fontSize: '14px' } } });
            card.mount(cardRef.current);
            setStripeEl(card);
        };
        document.head.appendChild(sc);
        return () => { stripeEl?.destroy(); };
    }, [prorationData, stripeKey]);

    const handlePay = async () => {
        if (!stripeObj || !stripeEl) return;
        setStep('processing'); setErrMsg('');

        try {
            // Get client_secret
            let secret;
            if (isUpgrade && prorationData?.client_secret) {
                secret = prorationData.client_secret;
            } else {
                const r = await fetch(route('school.payment.intent'), {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': document.querySelector('meta[name=csrf-token]')?.content ?? '' },
                    body: JSON.stringify({ plan_id: plan.id, coupon_code: couponData?.coupon?.code }),
                });
                const d = await r.json();
                if (!r.ok) throw new Error(d.error);
                secret = d.client_secret;
            }

            const { error, paymentIntent } = await stripeObj.confirmCardPayment(secret, { payment_method: { card: stripeEl } });

            if (error) throw new Error(error.message);

            const successUrl = new URL(route('school.payment.success'), window.location.origin);
            successUrl.searchParams.set('payment_intent', paymentIntent.id);
            successUrl.searchParams.set('plan_id', plan.id);
            if (isUpgrade) successUrl.searchParams.set('type', 'upgrade');
            if (couponData) successUrl.searchParams.set('coupon_id', couponData.coupon.id);
            window.location.href = successUrl.toString();
        } catch (e) {
            setErrMsg(e.message); setStep('form');
        }
    };

    const displayPrice = proratonAmt !== null ? proratonAmt : finalPrice;
    const netDisplay   = displayPrice / (1 + vatRate / 100);
    const vatDisplay   = displayPrice - netDisplay;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                <div className="flex items-center justify-between p-5 border-b border-gray-100">
                    <h2 className="font-bold text-gray-900 text-lg">
                        {isUpgrade ? '🚀 Mise à niveau' : '💳 Paiement'} — {plan.name}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
                </div>

                <div className="p-5 space-y-4">
                    {/* Price summary */}
                    <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
                        <div className="flex justify-between text-gray-600">
                            <span>Plan {plan.name}</span>
                            <span>{fmt(plan.price)} MAD</span>
                        </div>
                        {isUpgrade && proratonAmt !== null && (
                            <div className="flex justify-between text-blue-600">
                                <span>Prorata ({fmtD(currentSub?.expires_at)})</span>
                                <span>{fmt(proratonAmt)} MAD</span>
                            </div>
                        )}
                        {couponData && (
                            <div className="flex justify-between text-green-600">
                                <span>Coupon {couponData.coupon.code}</span>
                                <span>−{fmt(couponData.discount_amount)} MAD</span>
                            </div>
                        )}
                        <div className="border-t border-gray-200 pt-2 space-y-1">
                            <div className="flex justify-between text-gray-500 text-xs">
                                <span>Montant HT</span><span>{fmt(netDisplay)} MAD</span>
                            </div>
                            <div className="flex justify-between text-gray-500 text-xs">
                                <span>TVA ({vatRate}%)</span><span>{fmt(vatDisplay)} MAD</span>
                            </div>
                            <div className="flex justify-between font-bold text-gray-900 text-base pt-1">
                                <span>Total TTC</span><span>{fmt(displayPrice)} MAD</span>
                            </div>
                        </div>
                    </div>

                    {/* Coupon — only for new subscriptions */}
                    {!isUpgrade && <CouponInput planPrice={plan} onCoupon={setCouponData} />}

                    {/* Card input */}
                    <div>
                        <label className="text-xs font-medium text-gray-600 mb-1.5 block">Carte bancaire</label>
                        <div ref={cardRef} className="border border-gray-200 rounded-lg p-3 bg-white min-h-[40px]" />
                    </div>

                    {errMsg && (
                        <div className="flex items-center gap-2 text-red-600 bg-red-50 rounded-lg p-3 text-sm">
                            <AlertCircle className="w-4 h-4 shrink-0" /> {errMsg}
                        </div>
                    )}

                    <button
                        onClick={handlePay}
                        disabled={step === 'processing' || (isUpgrade && !prorationData)}
                        className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {step === 'processing' ? (
                            <><RefreshCw className="w-4 h-4 animate-spin" /> Traitement en cours…</>
                        ) : (
                            <><Shield className="w-4 h-4" /> Payer {fmt(displayPrice)} MAD</>
                        )}
                    </button>
                    <p className="text-center text-xs text-gray-400">Paiement sécurisé par Stripe • Facture TVA fournie</p>
                </div>
            </div>
        </div>
    );
}

function DowngradeModal({ plan, currentSub, onClose }) {
    const [loading, setLoading] = useState(false);
    const [error, setError]     = useState('');

    const confirm = async () => {
        setLoading(true); setError('');
        try {
            const r = await fetch(route('school.payment.downgrade'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': document.querySelector('meta[name=csrf-token]')?.content ?? '' },
                body: JSON.stringify({ plan_id: plan.id }),
            });
            const d = await r.json();
            if (!r.ok) { setError(d.error ?? 'Erreur'); }
            else { router.reload(); onClose(); }
        } catch { setError('Erreur réseau'); }
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
                <h2 className="font-bold text-gray-900 text-lg mb-2">⬇ Rétrograder vers {plan.name}</h2>
                <p className="text-sm text-gray-600 mb-4">
                    Le changement sera effectif le <strong>{fmtD(currentSub?.expires_at)}</strong>.
                    Vous conservez votre plan actuel jusqu'à cette date.
                </p>
                {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
                <div className="flex gap-3">
                    <button onClick={onClose} className="flex-1 py-2 border border-gray-200 rounded-lg text-gray-700 text-sm font-medium hover:bg-gray-50">Annuler</button>
                    <button onClick={confirm} disabled={loading}
                        className="flex-1 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-medium disabled:opacity-50">
                        {loading ? 'Confirmation…' : 'Confirmer'}
                    </button>
                </div>
            </div>
        </div>
    );
}

function PlanCard({ plan, currentSub, onAction, vatRate }) {
    const currentPlanId = currentSub?.plan_id;
    const currentPrice  = Number(currentSub?.plan?.price ?? 0);
    const isCurrentPlan = currentSub?.status === 'active' && plan.id === currentPlanId;
    const canUpgrade    = currentSub?.status === 'active' && Number(plan.price) > currentPrice;
    const canDowngrade  = currentSub?.status === 'active' && Number(plan.price) < currentPrice && !isCurrentPlan;
    const monthlyEq     = plan.billing_period === 'yearly' ? (Number(plan.price) / 12).toFixed(2) : null;

    return (
        <div className={`relative rounded-xl border-2 p-5 transition-all ${isCurrentPlan ? 'border-orange-500 bg-orange-50 shadow-md' : 'border-gray-200 hover:border-orange-300 hover:shadow-sm'}`}>
            {isCurrentPlan && (
                <span className="absolute -top-3 left-4 bg-orange-600 text-white text-xs font-medium px-3 py-0.5 rounded-full shadow">
                    Plan actuel
                </span>
            )}
            {plan.trial_days > 0 && !currentSub && (
                <span className="absolute -top-3 right-4 bg-blue-600 text-white text-xs font-medium px-3 py-0.5 rounded-full shadow">
                    🎁 {plan.trial_days}j gratuits
                </span>
            )}

            <h3 className="font-bold text-gray-900 text-lg">{plan.name}</h3>
            <div className="mt-2 mb-1">
                <span className="text-3xl font-extrabold text-gray-900">{fmt(plan.price)}</span>
                <span className="text-gray-500 text-sm"> MAD/{plan.billing_period === 'yearly' ? 'an' : 'mois'}</span>
            </div>
            {monthlyEq && <p className="text-xs text-gray-500 mb-2">≈ {monthlyEq} MAD/mois</p>}
            {plan.description && <p className="text-sm text-gray-500 mb-4 leading-relaxed">{plan.description}</p>}

            {plan.features && (
                <ul className="space-y-1 mb-5 text-sm">
                    {(Array.isArray(plan.features)
                        ? plan.features.map((f, i) => ({ label: String(f), enabled: true, k: i }))
                        : Object.entries(plan.features).map(([k, v]) => ({
                            label: { listing:'Listing public', reviews:'Gestion des avis', analytics:'Analytics', featured:'Mise en avant', support:'Support prioritaire' }[k] ?? k,
                            enabled: v === true || (typeof v === 'number' && v > 0),
                            k,
                          }))
                    ).map(({ label, enabled, k }) => (
                        <li key={k} className={`flex items-center gap-2 ${enabled ? 'text-gray-700' : 'text-gray-400 line-through'}`}>
                            <span className={enabled ? 'text-green-500' : 'text-gray-300'}>✓</span> {label}
                        </li>
                    ))}
                </ul>
            )}

            <div className="space-y-2">
                {/* No active subscription → Subscribe or Trial */}
                {!currentSub && (
                    <>
                        {plan.trial_days > 0 && (
                            <button onClick={() => onAction('trial', plan)}
                                className="w-full py-2 border-2 border-blue-500 text-blue-600 rounded-lg text-sm font-semibold hover:bg-blue-50 transition-colors flex items-center justify-center gap-1">
                                <Gift className="w-4 h-4" /> Démarrer l'essai gratuit
                            </button>
                        )}
                        <button onClick={() => onAction('subscribe', plan)}
                            className="w-full py-2 bg-orange-600 text-white rounded-lg text-sm font-semibold hover:bg-orange-700 transition-colors flex items-center justify-center gap-1">
                            <CreditCard className="w-4 h-4" /> S'abonner
                        </button>
                    </>
                )}

                {/* Trial active → only subscribe to convert */}
                {currentSub?.on_trial && isCurrentPlan && (
                    <button onClick={() => onAction('subscribe', plan)}
                        className="w-full py-2 bg-orange-600 text-white rounded-lg text-sm font-semibold hover:bg-orange-700 transition-colors">
                        Convertir en abonnement payant
                    </button>
                )}

                {/* Upgrade */}
                {canUpgrade && (
                    <button onClick={() => onAction('upgrade', plan)}
                        className="w-full py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-1">
                        <ArrowUpCircle className="w-4 h-4" /> Upgrader (prorata)
                    </button>
                )}

                {/* Downgrade */}
                {canDowngrade && (
                    <button onClick={() => onAction('downgrade', plan)}
                        className="w-full py-2 border border-gray-300 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-1">
                        <ArrowDownCircle className="w-4 h-4" /> Rétrograder
                    </button>
                )}

                {isCurrentPlan && !currentSub?.on_trial && (
                    <div className="text-center text-sm text-gray-500 py-2 font-medium">✓ Abonnement actif</div>
                )}
            </div>
        </div>
    );
}

// ── Main page ──────────────────────────────────────────────────────────────

export default function Subscription({ school, subscription, plans, payments, vat_rate: vatRate = 20, stripe_key }) {
    const { flash } = usePage().props;
    const [modal, setModal] = useState(null); // { mode: 'subscribe'|'upgrade'|'downgrade', plan }

    const openAction = (mode, plan) => setModal({ mode, plan });
    const closeModal = () => setModal(null);

    const daysLeft       = subscription?.isInTrial ? subscription.trialDaysRemaining : null;
    const trialEndsDate  = subscription?.trial_ends_at ? fmtD(subscription.trial_ends_at) : null;

    return (
        <SchoolLayout>
            <Head title="Mon abonnement" />
            <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">

                {/* Flash */}
                {flash?.success && (
                    <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-xl text-green-800 text-sm">
                        <CheckCircle className="w-5 h-5 shrink-0" /> {flash.success}
                    </div>
                )}
                {flash?.error && (
                    <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 text-sm">
                        <AlertCircle className="w-5 h-5 shrink-0" /> {flash.error}
                    </div>
                )}

                {/* Current subscription card */}
                {subscription ? (
                    <div className={`rounded-2xl border-2 p-6 ${subscription.status === 'active' ? 'border-orange-500 bg-orange-50' : 'border-red-200 bg-red-50'}`}>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <h2 className="text-xl font-bold text-gray-900">{subscription.plan?.name}</h2>
                                    <StatusBadge subscription={subscription} />
                                    {subscription.cancel_at_period_end && (
                                        <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                                            Changement programmé
                                        </span>
                                    )}
                                </div>

                                {subscription.on_trial && (
                                    <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
                                        🎁 Essai gratuit — expire le <strong>{trialEndsDate}</strong>
                                        {daysLeft !== null && <span className="ml-2">({daysLeft} jour{daysLeft > 1 ? 's' : ''} restant{daysLeft > 1 ? 's' : ''})</span>}
                                    </div>
                                )}

                                <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-600">
                                    <div className="flex items-center gap-1.5">
                                        <Clock className="w-4 h-4" />
                                        Débuté le {fmtD(subscription.started_at)}
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Zap className="w-4 h-4" />
                                        Expire le <strong className="ml-1">{fmtD(subscription.expires_at)}</strong>
                                    </div>
                                </div>

                                {subscription.status === 'past_due' && (
                                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                                        ⚠ Paiement en retard — Tentative {subscription.payment_retry_count}/3.
                                        Mettez à jour votre moyen de paiement pour éviter la suspension.
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col gap-2 shrink-0">
                                <a href={route('school.invoices.index')}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-white flex items-center gap-2 transition-colors">
                                    <FileText className="w-4 h-4" /> Mes factures
                                </a>
                                {subscription.status === 'active' && !subscription.on_trial && (
                                    <button
                                        onClick={() => {
                                            if (window.confirm('Confirmer l\'annulation de votre abonnement ?')) {
                                                router.post(route('school.subscription.cancel'), { reason: 'Annulé par le propriétaire' });
                                            }
                                        }}
                                        className="px-4 py-2 border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors"
                                    >
                                        Annuler l'abonnement
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="rounded-2xl border-2 border-dashed border-gray-300 p-8 text-center">
                        <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <h2 className="text-lg font-semibold text-gray-700">Aucun abonnement actif</h2>
                        <p className="text-gray-500 text-sm mt-1">Choisissez un plan ci-dessous pour démarrer</p>
                    </div>
                )}

                {/* Plans grid */}
                <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Plans disponibles</h3>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {plans.map(plan => (
                            <PlanCard
                                key={plan.id}
                                plan={plan}
                                currentSub={subscription}
                                onAction={openAction}
                                vatRate={vatRate}
                            />
                        ))}
                    </div>
                </div>

                {/* Recent payments */}
                {payments.length > 0 && (
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-lg font-bold text-gray-900">Derniers paiements</h3>
                            <a href={route('school.invoices.index')} className="text-sm text-orange-600 hover:underline">
                                Voir toutes les factures →
                            </a>
                        </div>
                        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="text-left px-4 py-3 font-semibold text-gray-700">Facture</th>
                                        <th className="text-left px-4 py-3 font-semibold text-gray-700">Date</th>
                                        <th className="text-left px-4 py-3 font-semibold text-gray-700">Plan</th>
                                        <th className="text-right px-4 py-3 font-semibold text-gray-700">Montant TTC</th>
                                        <th className="text-center px-4 py-3 font-semibold text-gray-700">Statut</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {payments.map(p => (
                                        <tr key={p.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 font-mono text-xs text-orange-600">
                                                {p.invoice_number ?? '—'}
                                            </td>
                                            <td className="px-4 py-3 text-gray-600">{fmtD(p.paid_at)}</td>
                                            <td className="px-4 py-3 text-gray-700">{p.plan?.name ?? '—'}</td>
                                            <td className="px-4 py-3 text-right font-semibold text-gray-900">{fmt(p.amount)} MAD</td>
                                            <td className="px-4 py-3 text-center">
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                                    p.status === 'success'  ? 'bg-green-100 text-green-700' :
                                                    p.status === 'failed'   ? 'bg-red-100 text-red-700' :
                                                    p.status === 'refunded' ? 'bg-purple-100 text-purple-700' :
                                                    'bg-gray-100 text-gray-600'
                                                }`}>{p.status}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Modals */}
            {modal?.mode === 'downgrade' && (
                <DowngradeModal plan={modal.plan} currentSub={subscription} onClose={closeModal} />
            )}
            {(modal?.mode === 'subscribe' || modal?.mode === 'upgrade') && (
                <CheckoutModal
                    plan={modal.plan}
                    mode={modal.mode}
                    currentSub={subscription}
                    vatRate={vatRate}
                    onClose={closeModal}
                />
            )}
            {modal?.mode === 'trial' && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={e => e.target === e.currentTarget && closeModal()}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
                        <h2 className="font-bold text-gray-900 text-lg mb-2">🎁 Essai gratuit — {modal.plan.name}</h2>
                        <p className="text-sm text-gray-600 mb-4">
                            Activez <strong>{modal.plan.trial_days} jours</strong> d'essai gratuit sans carte bancaire.
                            Toutes les fonctionnalités Premium incluses.
                        </p>
                        <div className="flex gap-3">
                            <button onClick={closeModal} className="flex-1 py-2 border border-gray-200 rounded-lg text-gray-700 text-sm hover:bg-gray-50">Annuler</button>
                            <button onClick={() => router.post(route('school.payment.trial'), { plan_id: modal.plan.id })}
                                className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700">
                                Démarrer l'essai
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </SchoolLayout>
    );
}
