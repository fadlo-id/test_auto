import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';

const STATUS_LABEL = { new: 'Nouveau', read: 'Lu', replied: 'Répondu' };
const STATUS_CLASS  = { new: 'badge badge-blue', read: 'badge badge-gray', replied: 'badge badge-green' };

function ReplyModal({ request: r, onClose }) {
    const { data, setData, post, processing, errors, reset } = useForm({ reply: '' });

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.contact-requests.reply', r.id), {
            onSuccess: () => { reset(); onClose(); },
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
                <div className="p-5 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-900">Répondre à {r.name}</h3>
                    <p className="text-sm text-gray-500">{r.email}</p>
                </div>

                {/* Original message */}
                <div className="p-5 bg-gray-50 border-b border-gray-100">
                    <p className="text-xs font-medium text-gray-400 uppercase mb-2">Message original</p>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{r.message}</p>
                </div>

                <form onSubmit={submit} className="p-5 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Votre réponse</label>
                        <textarea
                            value={data.reply}
                            onChange={(e) => setData('reply', e.target.value)}
                            rows={5}
                            className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
                            placeholder="Saisissez votre réponse..."
                        />
                        {errors.reply && <p className="text-red-500 text-xs mt-1">{errors.reply}</p>}
                    </div>
                    <div className="flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-4 py-2 text-sm bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
                        >
                            {processing ? 'Envoi…' : 'Marquer comme répondu'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function MessagePreview({ r, onClose }) {
    return (
        <div className="bg-orange-50 border-t border-orange-100 px-4 py-4">
            <div className="flex items-start justify-between mb-2">
                <div>
                    <span className="text-xs font-medium text-orange-700 uppercase">Message complet</span>
                    <p className="text-xs text-gray-500 mt-0.5">Objet : {r.subject ?? '(sans objet)'}</p>
                </div>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg leading-none">×</button>
            </div>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{r.message}</p>
            {r.replied_at && (
                <p className="text-xs text-green-600 mt-2">
                    Répondu le {new Date(r.replied_at).toLocaleString('fr-FR')}
                </p>
            )}
        </div>
    );
}

export default function ContactRequests({ requests, filters }) {
    const { flash } = usePage().props;
    const [expanded, setExpanded] = useState(null);
    const [replyTarget, setReplyTarget] = useState(null);

    const toggleExpand = (id) => setExpanded(expanded === id ? null : id);

    const markRead = (id) => router.post(route('admin.contact-requests.read', id), {}, { preserveScroll: true });
    const destroy  = (id) => {
        if (confirm('Supprimer cette demande définitivement ?')) {
            router.delete(route('admin.contact-requests.destroy', id), { preserveScroll: true });
        }
    };

    const pending = requests.data?.filter((r) => r.status === 'new').length ?? 0;

    return (
        <AdminLayout title="Demandes de contact">
            <Head title="Demandes de contact - Admin" />

            {replyTarget && (
                <ReplyModal request={replyTarget} onClose={() => setReplyTarget(null)} />
            )}

            {flash?.success && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                    {flash.success}
                </div>
            )}

            {/* Summary pill */}
            {pending > 0 && (
                <div className="mb-4 px-4 py-3 bg-blue-50 border border-blue-100 rounded-2xl text-blue-700 text-sm font-medium">
                    {pending} nouvelle{pending > 1 ? 's' : ''} demande{pending > 1 ? 's' : ''} en attente de lecture
                </div>
            )}

            {/* Filters */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-5 flex gap-2.5 flex-wrap">
                <input
                    defaultValue={filters.search}
                    placeholder="Rechercher par nom, email, sujet…"
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            router.get(route('admin.contact-requests.index'), { ...filters, search: e.target.value }, { preserveState: true, replace: true });
                        }
                    }}
                    className="border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm flex-1 min-w-48 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
                <select
                    value={filters.status ?? 'all'}
                    onChange={(e) => router.get(route('admin.contact-requests.index'), { ...filters, status: e.target.value }, { preserveState: true, replace: true })}
                    className="border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white"
                >
                    <option value="all">Tous les statuts</option>
                    <option value="new">Nouveau</option>
                    <option value="read">Lu</option>
                    <option value="replied">Répondu</option>
                </select>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {(requests.data?.length ?? 0) === 0 ? (
                    <div className="py-16 text-center">
                        <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
                            <svg className="w-7 h-7 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                        </div>
                        <p className="text-gray-600 font-semibold">Aucune demande de contact</p>
                        <p className="text-gray-400 text-sm mt-1">Les messages apparaîtront ici dès qu'un visiteur vous contacte.</p>
                    </div>
                ) : (
                    <>
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100">
                                    {['Expéditeur', 'Sujet', 'Statut', 'Date', 'Actions'].map((h) => (
                                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {requests.data.map((r) => (
                                    <>
                                        <tr
                                            key={r.id}
                                            className={`border-b border-gray-50 hover:bg-gray-50/70 cursor-pointer transition-colors ${r.status === 'new' ? 'font-semibold' : ''}`}
                                            onClick={() => toggleExpand(r.id)}
                                        >
                                            <td className="px-4 py-3">
                                                <div className="font-semibold text-gray-900">{r.name}</div>
                                                <div className="text-xs text-gray-400">{r.email}</div>
                                            </td>
                                            <td className="px-4 py-3 text-gray-600 max-w-xs">
                                                <span className="truncate block max-w-[200px]">{r.subject ?? '(sans objet)'}</span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={STATUS_CLASS[r.status] ?? 'badge badge-gray'}>
                                                    {STATUS_LABEL[r.status] ?? r.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                                                {new Date(r.created_at).toLocaleDateString('fr-FR')}
                                            </td>
                                            <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                                                <div className="flex items-center gap-1.5">
                                                    {r.status === 'new' && (
                                                        <button
                                                            onClick={() => markRead(r.id)}
                                                            className="text-xs px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold transition-colors"
                                                        >
                                                            Marquer lu
                                                        </button>
                                                    )}
                                                    {r.status !== 'replied' && (
                                                        <button
                                                            onClick={() => setReplyTarget(r)}
                                                            className="text-xs px-2.5 py-1 rounded-lg bg-orange-50 text-orange-700 hover:bg-orange-100 font-semibold transition-colors"
                                                        >
                                                            Répondre
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => destroy(r.id)}
                                                        className="text-xs px-2.5 py-1 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 font-semibold transition-colors"
                                                    >
                                                        Suppr.
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>

                                        {/* Expandable message preview */}
                                        {expanded === r.id && (
                                            <tr key={`exp-${r.id}`} className="border-b border-gray-100">
                                                <td colSpan={5} className="p-0">
                                                    <MessagePreview r={r} onClose={() => setExpanded(null)} />
                                                </td>
                                            </tr>
                                        )}
                                    </>
                                ))}
                            </tbody>
                        </table>

                        {/* Pagination */}
                        {requests.last_page > 1 && (
                            <div className="px-4 py-4 flex gap-1.5 border-t border-gray-50 flex-wrap justify-center">
                                {requests.links?.map((link, i) => (
                                    <button
                                        key={i}
                                        disabled={!link.url}
                                        onClick={() => link.url && router.get(link.url)}
                                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                            link.active
                                                ? 'bg-orange-600 text-white shadow-sm'
                                                : link.url
                                                ? 'border border-gray-200 text-gray-600 hover:border-orange-300 hover:text-orange-700'
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
