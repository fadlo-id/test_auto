import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import Pagination from '@/Components/UI/Pagination';
import EmptyState from '@/Components/UI/EmptyState';
import { ClipboardDocumentListIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const ACTION_TONE = (action) => {
    if (action.includes('deleted') || action.includes('suspended') || action.includes('banned')) return 'badge-red';
    if (action.includes('created')) return 'badge-green';
    if (action.includes('updated') || action.includes('synced') || action.includes('assigned')) return 'badge-blue';
    return 'badge-gray';
};

export default function AuditLogs({ logs, actions, filters }) {
    const [action, setAction] = useState(filters?.action ?? '');
    const [dateFrom, setDateFrom] = useState(filters?.date_from ?? '');
    const [dateTo, setDateTo] = useState(filters?.date_to ?? '');

    const applyFilters = (overrides = {}) => {
        router.get(route('admin.audit-logs.index'),
            { action, date_from: dateFrom, date_to: dateTo, ...overrides },
            { preserveState: true, replace: true }
        );
    };

    return (
        <AdminLayout title="Journal d'audit">
            <Head title="Admin — Journal d'audit" />

            <form onSubmit={(e) => { e.preventDefault(); applyFilters(); }} className="card p-4 mb-5 flex flex-wrap gap-3 items-center">
                <div className="relative flex-1 min-w-48">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        list="audit-actions"
                        placeholder="Filtrer par action…"
                        value={action}
                        onChange={(e) => setAction(e.target.value)}
                        className="input pl-9"
                    />
                    <datalist id="audit-actions">
                        {actions?.map((a) => <option key={a} value={a} />)}
                    </datalist>
                </div>
                <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="input w-auto" />
                <span className="text-gray-400 text-sm">à</span>
                <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="input w-auto" />
                <button type="submit" className="btn-primary">Filtrer</button>
            </form>

            <div className="card overflow-hidden">
                {logs.data.length === 0 ? (
                    <EmptyState
                        icon={ClipboardDocumentListIcon}
                        title="Aucune entrée d'audit"
                        description="Essayez d'ajuster vos filtres."
                    />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100">
                                    {['Action', 'Auteur', 'Cible', 'IP', 'Date'].map((h) => (
                                        <th key={h} className="table-cell text-left table-header">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {logs.data.map((log) => (
                                    <tr key={log.id} className="table-row">
                                        <td className="table-cell">
                                            <span className={`badge ${ACTION_TONE(log.action)}`}>{log.action}</span>
                                        </td>
                                        <td className="table-cell">
                                            {log.user ? (
                                                <>
                                                    <p className="font-medium text-gray-900">{log.user.name}</p>
                                                    <p className="text-xs text-gray-400">{log.user.email}</p>
                                                </>
                                            ) : (
                                                <span className="text-gray-400">Système</span>
                                            )}
                                        </td>
                                        <td className="table-cell text-gray-500">
                                            {log.subject_type ? `${log.subject_type} #${log.subject_id}` : '—'}
                                        </td>
                                        <td className="table-cell text-gray-400 font-mono text-xs">{log.ip ?? '—'}</td>
                                        <td className="table-cell text-gray-400 text-xs whitespace-nowrap">
                                            {new Date(log.created_at).toLocaleString('fr-FR')}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                <Pagination paginator={logs} />
            </div>
        </AdminLayout>
    );
}
