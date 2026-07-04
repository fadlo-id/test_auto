import { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Flag, Search, CheckCircle, XCircle, Trash2, AlertTriangle } from 'lucide-react';

function HandleModal({ signalement, onClose, onSubmit }) {
    const [notes, setNotes] = useState('');
    const [action, setAction] = useState('resolve');
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h2 className="font-semibold text-gray-900">Traiter le signalement #{signalement.id}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
                </div>
                <div className="px-6 py-5 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Action</label>
                        <div className="flex gap-3">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="radio" value="resolve" checked={action === 'resolve'} onChange={() => setAction('resolve')} className="text-orange-600" />
                                <span className="text-sm text-gray-700">Résoudre</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="radio" value="dismiss" checked={action === 'dismiss'} onChange={() => setAction('dismiss')} className="text-orange-600" />
                                <span className="text-sm text-gray-700">Classer sans suite</span>
                            </label>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Notes admin (optionnel)</label>
                        <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500" />
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <button onClick={onClose} className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">Annuler</button>
                        <button onClick={() => onSubmit(action, notes)}
                            className={`px-4 py-2 text-sm text-white rounded-lg ${action === 'resolve' ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-600 hover:bg-gray-700'}`}>
                            Confirmer
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function Signalements({ signalements, filters, stats }) {
    const { flash } = usePage().props;
    const [modal, setModal] = useState(null);
    const [search, setSearch] = useState(filters?.search ?? '');

    const handleSubmit = (action, notes) => {
        const routeName = action === 'resolve' ? 'admin.signalements.resolve' : 'admin.signalements.dismiss';
        router.post(route(routeName, modal.id), { admin_notes: notes }, { onSuccess: () => setModal(null) });
    };

    const del = (id) => { if (confirm('Supprimer ce signalement ?')) router.delete(route('admin.signalements.destroy', id)); };

    const applyFilter = (key, val) => {
        router.get(route('admin.signalements.index'), { ...filters, [key]: val }, { preserveState: true, replace: true });
    };

    const statusConfig = {
        pending:   { label: 'En attente', color: 'yellow' },
        resolved:  { label: 'Résolu',     color: 'green'  },
        dismissed: { label: 'Classé',     color: 'gray'   },
    };

    const typeLabels = { review: 'Avis', school: 'Auto-école', user: 'Utilisateur' };

    return (
        <AdminLayout title="Signalements">
            <Head title="Signalements - Admin" />

            {flash?.success && <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">{flash.success}</div>}

            {/* KPIs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                {[
                    { label: 'Total',       value: stats.total,     color: 'orange' },
                    { label: 'En attente',  value: stats.pending,   color: 'yellow' },
                    { label: 'Résolus',     value: stats.resolved,  color: 'green'  },
                    { label: 'Classés',     value: stats.dismissed, color: 'gray'   },
                ].map((k) => (
                    <div key={k.label} className="bg-white rounded-xl border border-gray-100 p-4">
                        <p className="text-xs text-gray-500">{k.label}</p>
                        <p className={`text-2xl font-bold text-${k.color}-600 mt-1`}>{k.value}</p>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-5">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input value={search} onChange={e => setSearch(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && applyFilter('search', search)}
                        placeholder="Rechercher…" className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500" />
                </div>
                <select value={filters?.status ?? ''} onChange={e => applyFilter('status', e.target.value)}
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500">
                    <option value="">Tous les statuts</option>
                    <option value="pending">En attente</option>
                    <option value="resolved">Résolus</option>
                    <option value="dismissed">Classés</option>
                </select>
                <select value={filters?.type ?? ''} onChange={e => applyFilter('type', e.target.value)}
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500">
                    <option value="">Tous les types</option>
                    <option value="review">Avis</option>
                    <option value="school">Auto-école</option>
                    <option value="user">Utilisateur</option>
                </select>
            </div>

            {/* List */}
            <div className="space-y-3">
                {signalements.data.length === 0 && (
                    <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-gray-400">Aucun signalement trouvé.</div>
                )}
                {signalements.data.map((s) => {
                    const sc = statusConfig[s.status] ?? statusConfig.pending;
                    return (
                        <div key={s.id} className="bg-white rounded-xl border border-gray-100 p-4">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex items-start gap-3 flex-1 min-w-0">
                                    <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <Flag className="w-4 h-4 text-red-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-2 mb-1">
                                            <span className="text-xs font-medium text-gray-500">#{s.id}</span>
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium bg-${sc.color}-100 text-${sc.color}-700`}>{sc.label}</span>
                                            <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600">{typeLabels[s.subject_type]}</span>
                                        </div>
                                        <p className="font-medium text-gray-900 text-sm">{s.reason}</p>
                                        {s.description && <p className="text-sm text-gray-500 mt-1">{s.description}</p>}
                                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                                            {s.reporter && <span>Par : {s.reporter.name} ({s.reporter.email})</span>}
                                            <span>{new Date(s.created_at).toLocaleDateString('fr-FR')}</span>
                                        </div>
                                        {s.admin_notes && (
                                            <div className="mt-2 px-3 py-2 bg-gray-50 rounded-lg text-xs text-gray-600">
                                                <strong>Notes admin :</strong> {s.admin_notes}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    {s.status === 'pending' && (
                                        <button onClick={() => setModal(s)} className="flex items-center gap-1 px-3 py-1.5 bg-orange-600 text-white rounded-lg text-xs hover:bg-orange-700">
                                            <AlertTriangle className="w-3.5 h-3.5" /> Traiter
                                        </button>
                                    )}
                                    <button onClick={() => del(s.id)} aria-label="Supprimer" className="p-1.5 text-gray-400 hover:text-red-600 rounded">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Pagination */}
            {signalements.last_page > 1 && (
                <div className="flex items-center justify-between mt-4">
                    <span className="text-sm text-gray-500">Page {signalements.current_page} / {signalements.last_page}</span>
                    <div className="flex gap-2">
                        {signalements.prev_page_url && <button onClick={() => router.get(signalements.prev_page_url)} className="px-3 py-1 text-sm border rounded hover:bg-gray-50">Précédent</button>}
                        {signalements.next_page_url && <button onClick={() => router.get(signalements.next_page_url)} className="px-3 py-1 text-sm border rounded hover:bg-gray-50">Suivant</button>}
                    </div>
                </div>
            )}

            {modal && <HandleModal signalement={modal} onClose={() => setModal(null)} onSubmit={handleSubmit} />}
        </AdminLayout>
    );
}
