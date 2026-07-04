import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function Newsletter({ subscribers, filters = {}, stats = {} }) {
    const { flash } = usePage().props;
    const [search, setSearch] = useState(filters.search ?? '');
    const [composing, setComposing] = useState(false);

    const form = useForm({ subject: '', body: '' });

    const sendNewsletter = (e) => {
        e.preventDefault();
        if (! confirm(`Envoyer cette newsletter à ${stats.active ?? 0} abonné(s) actif(s) ?`)) return;
        form.post(route('admin.newsletter.send'), {
            preserveScroll: true,
            onSuccess: () => { form.reset(); setComposing(false); },
        });
    };

    const applySearch = () => {
        router.get(route('admin.newsletter.index'), { ...filters, search }, { preserveState: true, replace: true });
    };

    const destroy = (id) => {
        if (confirm('Supprimer cet abonné définitivement ?')) {
            router.delete(route('admin.newsletter.destroy', id), { preserveScroll: true });
        }
    };

    const unsub = (id) => {
        router.post(route('admin.newsletter.unsubscribe', id), {}, { preserveScroll: true });
    };

    const statusLabel = { active: 'Actif', unsubscribed: 'Désabonné' };
    const statusClass = {
        active:       'bg-green-100 text-green-700',
        unsubscribed: 'bg-gray-100 text-gray-500',
    };

    return (
        <AdminLayout title="Newsletter">
            <Head title="Newsletter - Admin" />

            {flash?.success && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                    {flash.success}
                </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-xl border border-gray-200 p-5 text-center">
                    <p className="text-3xl font-bold text-gray-900">{stats.total ?? 0}</p>
                    <p className="text-sm text-gray-500 mt-1">Total abonnés</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-5 text-center">
                    <p className="text-3xl font-bold text-green-600">{stats.active ?? 0}</p>
                    <p className="text-sm text-gray-500 mt-1">Actifs</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-5 text-center">
                    <p className="text-3xl font-bold text-gray-400">{stats.unsubscribed ?? 0}</p>
                    <p className="text-sm text-gray-500 mt-1">Désabonnés</p>
                </div>
            </div>

            {/* Compose & send */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
                <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-gray-900">Composer une newsletter</h2>
                    <button
                        onClick={() => setComposing((v) => !v)}
                        className="text-sm px-3 py-1.5 rounded-lg bg-orange-50 text-orange-700 hover:bg-orange-100 font-medium"
                    >
                        {composing ? 'Annuler' : 'Nouvelle newsletter'}
                    </button>
                </div>

                {composing && (
                    <form onSubmit={sendNewsletter} className="mt-4 space-y-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Sujet</label>
                            <input
                                value={form.data.subject}
                                onChange={(e) => form.setData('subject', e.target.value)}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                                placeholder="Objet de l'email"
                            />
                            {form.errors.subject && <p className="text-red-600 text-xs mt-1">{form.errors.subject}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                            <textarea
                                value={form.data.body}
                                onChange={(e) => form.setData('body', e.target.value)}
                                rows={8}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                                placeholder="Contenu du message..."
                            />
                            {form.errors.body && <p className="text-red-600 text-xs mt-1">{form.errors.body}</p>}
                        </div>
                        <button
                            type="submit"
                            disabled={form.processing}
                            className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 disabled:opacity-50"
                        >
                            {form.processing ? 'Envoi...' : `Envoyer à ${stats.active ?? 0} abonné(s)`}
                        </button>
                    </form>
                )}
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 mb-5 flex gap-3 flex-wrap">
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && applySearch()}
                    placeholder="Rechercher par email ou nom..."
                    className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm flex-1 min-w-48 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <select
                    value={filters.status ?? 'all'}
                    onChange={(e) => router.get(route('admin.newsletter.index'), { ...filters, search, status: e.target.value }, { preserveState: true, replace: true })}
                    className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm"
                >
                    <option value="all">Tous les statuts</option>
                    <option value="active">Actifs</option>
                    <option value="unsubscribed">Désabonnés</option>
                </select>
                <button
                    onClick={applySearch}
                    className="px-4 py-1.5 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700"
                >
                    Rechercher
                </button>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {/* Empty state */}
                {(subscribers?.data?.length ?? 0) === 0 ? (
                    <div className="py-16 text-center">
                        <div className="text-4xl mb-3">📧</div>
                        <p className="text-gray-500 font-medium">Aucun abonné pour le moment</p>
                        <p className="text-gray-400 text-sm mt-1">
                            Les abonnés apparaîtront ici dès que quelqu'un s'inscrit à la newsletter.
                        </p>
                    </div>
                ) : (
                    <>
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    {['Email', 'Nom', 'Statut', 'Date inscription', 'Actions'].map((h) => (
                                        <th key={h} className="text-left px-4 py-3 font-medium text-gray-600">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {subscribers.data.map((s) => (
                                    <tr key={s.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 font-medium text-gray-900">{s.email}</td>
                                        <td className="px-4 py-3 text-gray-600">{s.name ?? '—'}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusClass[s.status] ?? 'bg-gray-100 text-gray-600'}`}>
                                                {statusLabel[s.status] ?? s.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-gray-400">
                                            {new Date(s.subscribed_at ?? s.created_at).toLocaleDateString('fr-FR')}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                {s.status === 'active' && (
                                                    <button
                                                        onClick={() => unsub(s.id)}
                                                        className="text-xs px-2 py-1 rounded bg-yellow-50 text-yellow-700 hover:bg-yellow-100 font-medium"
                                                    >
                                                        Désabonner
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => destroy(s.id)}
                                                    className="text-xs px-2 py-1 rounded bg-red-50 text-red-600 hover:bg-red-100 font-medium"
                                                >
                                                    Supprimer
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Pagination */}
                        {subscribers.last_page > 1 && (
                            <div className="p-4 flex gap-2 border-t border-gray-100 flex-wrap">
                                {subscribers.links?.map((link, i) => (
                                    <button
                                        key={i}
                                        disabled={!link.url}
                                        onClick={() => link.url && router.get(link.url)}
                                        className={`px-3 py-1 rounded text-xs font-medium ${
                                            link.active
                                                ? 'bg-orange-600 text-white'
                                                : link.url
                                                ? 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                                                : 'border border-gray-100 text-gray-300 cursor-default'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </AdminLayout>
    );
}
