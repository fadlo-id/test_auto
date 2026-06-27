import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';

const FEATURE_LABELS = {
    listing:   'Listing public',
    reviews:   'Gestion des avis',
    analytics: 'Analytics avancées',
    featured:  'Mise en avant',
    support:   'Support prioritaire',
};

function Modal({ title, onClose, children }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 sticky top-0 bg-white">
                    <h3 className="font-semibold text-gray-900">{title}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
                </div>
                <div className="p-5">{children}</div>
            </div>
        </div>
    );
}

function PlanForm({ initial, onSubmit, processing, errors }) {
    const [data, setData] = useState({
        name:            initial?.name            ?? '',
        slug:            initial?.slug            ?? '',
        description:     initial?.description     ?? '',
        price:           initial?.price           ?? '',
        billing_period:  initial?.billing_period  ?? 'monthly',
        stripe_price_id: initial?.stripe_price_id ?? '',
        max_listings:    initial?.max_listings    ?? 1,
        is_active:       initial?.is_active       ?? true,
        analytics:       initial?.features?.analytics  ?? false,
        featured:        initial?.features?.featured   ?? false,
        support:         initial?.features?.support    ?? false,
    });
    const set = k => e => setData(d => ({ ...d, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));
    const isEdit = !!initial;

    return (
        <form onSubmit={e => { e.preventDefault(); onSubmit(data); }} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Nom *</label>
                    <input value={data.name} onChange={set('name')} required
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
                    {errors?.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                </div>
                {!isEdit && (
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Slug *</label>
                        <input value={data.slug} onChange={set('slug')} required
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
                        {errors?.slug && <p className="text-xs text-red-500 mt-1">{errors.slug}</p>}
                    </div>
                )}
            </div>
            <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                <textarea value={data.description} onChange={set('description')} rows={2}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
            </div>
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Prix (MAD) *</label>
                    <input type="number" min="0" step="0.01" value={data.price} onChange={set('price')} required
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Période *</label>
                    <select value={data.billing_period} onChange={set('billing_period')}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500">
                        <option value="monthly">Mensuel</option>
                        <option value="yearly">Annuel</option>
                    </select>
                </div>
            </div>
            <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Stripe Price ID</label>
                <input value={data.stripe_price_id} onChange={set('stripe_price_id')} placeholder="price_xxx"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
            </div>
            <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">Fonctionnalités incluses</label>
                <div className="space-y-2">
                    {['analytics', 'featured', 'support'].map(f => (
                        <label key={f} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                            <input type="checkbox" checked={!!data[f]} onChange={set(f)}
                                className="rounded text-orange-600 focus:ring-orange-500" />
                            {FEATURE_LABELS[f]}
                        </label>
                    ))}
                </div>
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input type="checkbox" checked={!!data.is_active} onChange={set('is_active')}
                    className="rounded text-orange-600 focus:ring-orange-500" />
                Plan actif (visible dans l'abonnement)
            </label>
            <button type="submit" disabled={processing}
                className="w-full py-2.5 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 disabled:opacity-50">
                {processing ? 'Enregistrement...' : 'Sauvegarder'}
            </button>
        </form>
    );
}

export default function Plans({ plans }) {
    const { flash } = usePage().props;
    const [showAdd, setShowAdd] = useState(false);
    const [editing, setEditing] = useState(null);
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState({});

    const submit = (data, isEdit) => {
        setProcessing(true);
        setErrors({});
        const method = isEdit ? 'put' : 'post';
        const url    = isEdit ? route('admin.plans.update', editing.id) : route('admin.plans.store');
        router[method](url, data, {
            preserveScroll: true,
            onSuccess: () => { setShowAdd(false); setEditing(null); setProcessing(false); },
            onError:   e  => { setErrors(e); setProcessing(false); },
        });
    };

    const deactivate = (plan) => {
        if (confirm(`Désactiver le plan "${plan.name}" ?`)) {
            router.delete(route('admin.plans.destroy', plan.id), { preserveScroll: true });
        }
    };

    return (
        <AdminLayout title="Plans tarifaires">
            <Head title="Plans" />

            {showAdd && (
                <Modal title="Nouveau plan" onClose={() => setShowAdd(false)}>
                    <PlanForm onSubmit={d => submit(d, false)} processing={processing} errors={errors} />
                </Modal>
            )}
            {editing && (
                <Modal title="Modifier le plan" onClose={() => setEditing(null)}>
                    <PlanForm initial={editing} onSubmit={d => submit(d, true)} processing={processing} errors={errors} />
                </Modal>
            )}

            {flash?.success && <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm border border-green-200">{flash.success}</div>}
            {flash?.error   && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200">{flash.error}</div>}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                {plans.map(plan => (
                    <div key={plan.id} className={`relative bg-white rounded-xl border-2 p-5 ${plan.is_active ? 'border-gray-200' : 'border-dashed border-gray-300 opacity-60'}`}>
                        {!plan.is_active && (
                            <span className="absolute top-2 right-2 text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">Inactif</span>
                        )}
                        <div className="flex items-start justify-between mb-3">
                            <div>
                                <h3 className="font-bold text-gray-900">{plan.name}</h3>
                                <p className="text-2xl font-bold text-orange-600 mt-1">
                                    {Number(plan.price).toLocaleString()} <span className="text-sm font-normal text-gray-500">MAD/{plan.billing_period === 'yearly' ? 'an' : 'mois'}</span>
                                </p>
                            </div>
                        </div>
                        {plan.description && <p className="text-xs text-gray-500 mb-3">{plan.description}</p>}
                        <p className="text-xs text-gray-400 mb-4">{plan.subscriptions_count ?? 0} abonnements actifs</p>
                        {plan.features && (
                            <ul className="space-y-1 mb-4">
                                {Object.entries(typeof plan.features === 'object' ? plan.features : {}).map(([k, v]) => (
                                    <li key={k} className={`flex items-center gap-1.5 text-xs ${v ? 'text-gray-700' : 'text-gray-300 line-through'}`}>
                                        <span className={v ? 'text-green-500' : 'text-gray-300'}>✓</span>
                                        {FEATURE_LABELS[k] ?? k}
                                    </li>
                                ))}
                            </ul>
                        )}
                        <div className="flex gap-2">
                            <button onClick={() => setEditing(plan)}
                                className="flex-1 py-1.5 text-xs border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50">
                                Modifier
                            </button>
                            {plan.is_active && (
                                <button onClick={() => deactivate(plan)}
                                    className="px-3 py-1.5 text-xs border border-red-200 rounded-lg text-red-600 hover:bg-red-50">
                                    Désactiver
                                </button>
                            )}
                        </div>
                    </div>
                ))}

                <button onClick={() => setShowAdd(true)}
                    className="flex flex-col items-center justify-center gap-2 bg-white rounded-xl border-2 border-dashed border-gray-300 p-8 hover:border-orange-400 hover:bg-orange-50 transition-colors cursor-pointer text-gray-400 hover:text-orange-500">
                    <span className="text-3xl">+</span>
                    <span className="text-sm font-medium">Nouveau plan</span>
                </button>
            </div>
        </AdminLayout>
    );
}
