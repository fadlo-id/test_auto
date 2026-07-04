import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import SchoolLayout from '@/Layouts/SchoolLayout';
import { FileText, Download, CheckCircle, AlertCircle, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';

const statusConfig = {
    success:  { label: 'Payée',        icon: CheckCircle,  cls: 'bg-green-100 text-green-700' },
    refunded: { label: 'Remboursée',   icon: RefreshCw,    cls: 'bg-purple-100 text-purple-700' },
    failed:   { label: 'Échouée',      icon: AlertCircle,  cls: 'bg-red-100 text-red-700' },
    pending:  { label: 'En attente',   icon: AlertCircle,  cls: 'bg-yellow-100 text-yellow-700' },
};

function StatusBadge({ status }) {
    const cfg = statusConfig[status] ?? { label: status, icon: AlertCircle, cls: 'bg-gray-100 text-gray-700' };
    const Icon = cfg.icon;
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.cls}`}>
            <Icon className="w-3 h-3" />
            {cfg.label}
        </span>
    );
}

function TypeBadge({ type }) {
    const labels = { subscription: 'Abonnement', upgrade: 'Upgrade', renewal: 'Renouvellement', trial_conversion: 'Conversion essai' };
    return (
        <span className="px-2 py-0.5 rounded bg-orange-50 text-orange-700 text-xs font-medium">
            {labels[type] ?? type}
        </span>
    );
}

export default function Invoices({ invoices }) {
    const { flash } = usePage().props;
    const fmt = (n) => Number(n).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    return (
        <SchoolLayout>
            <Head title="Mes factures" />
            <div className="max-w-5xl mx-auto px-4 py-8">

                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <FileText className="w-6 h-6 text-orange-600" />
                            Mes factures
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">Téléchargez et imprimez vos factures avec détail TVA</p>
                    </div>
                    <Link href={route('school.subscription')} className="text-sm text-orange-600 hover:underline">
                        ← Mon abonnement
                    </Link>
                </div>

                {/* Flash */}
                {flash?.success && (
                    <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm">{flash.success}</div>
                )}

                {/* Table */}
                {invoices.data.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
                        <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 font-medium">Aucune facture disponible</p>
                        <p className="text-gray-400 text-sm mt-1">Les factures apparaîtront après votre premier paiement</p>
                    </div>
                ) : (
                    <>
                        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="text-left px-4 py-3 font-semibold text-gray-700">N° Facture</th>
                                        <th className="text-left px-4 py-3 font-semibold text-gray-700">Date</th>
                                        <th className="text-left px-4 py-3 font-semibold text-gray-700">Plan</th>
                                        <th className="text-left px-4 py-3 font-semibold text-gray-700">Type</th>
                                        <th className="text-right px-4 py-3 font-semibold text-gray-700">HT</th>
                                        <th className="text-right px-4 py-3 font-semibold text-gray-700">TVA</th>
                                        <th className="text-right px-4 py-3 font-semibold text-gray-700">TTC</th>
                                        <th className="text-center px-4 py-3 font-semibold text-gray-700">Statut</th>
                                        <th className="text-center px-4 py-3 font-semibold text-gray-700">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {invoices.data.map((inv) => (
                                        <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-3 font-mono text-xs font-semibold text-orange-600">
                                                {inv.invoice_number}
                                            </td>
                                            <td className="px-4 py-3 text-gray-600">
                                                {inv.paid_at ? new Date(inv.paid_at).toLocaleDateString('fr-FR') : '—'}
                                            </td>
                                            <td className="px-4 py-3 font-medium text-gray-900">
                                                {inv.plan?.name ?? '—'}
                                            </td>
                                            <td className="px-4 py-3">
                                                <TypeBadge type={inv.payment_type} />
                                            </td>
                                            <td className="px-4 py-3 text-right text-gray-600">
                                                {fmt(inv.net_amount ?? inv.amount)} MAD
                                            </td>
                                            <td className="px-4 py-3 text-right text-gray-500 text-xs">
                                                {fmt(inv.vat_amount ?? 0)} MAD
                                                <span className="block text-gray-400">({inv.vat_rate ?? 20}%)</span>
                                            </td>
                                            <td className="px-4 py-3 text-right font-semibold text-gray-900">
                                                {fmt(inv.amount)} MAD
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <StatusBadge status={inv.status} />
                                                {Number(inv.refunded_amount) > 0 && (
                                                    <div className="text-xs text-purple-600 mt-0.5">
                                                        -{fmt(inv.refunded_amount)} remb.
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <a
                                                    href={route('school.invoices.download', inv.id)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-xs font-medium transition-colors"
                                                >
                                                    <Download className="w-3 h-3" />
                                                    Télécharger
                                                </a>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {invoices.last_page > 1 && (
                            <div className="flex justify-center items-center gap-2 mt-4">
                                {invoices.links.map((link, i) => (
                                    link.url ? (
                                        <Link
                                            key={i}
                                            href={link.url}
                                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                                link.active
                                                    ? 'bg-orange-600 text-white'
                                                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                                            }`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ) : (
                                        <span key={i} className="px-3 py-1.5 rounded-lg text-sm text-gray-400 border border-gray-100"
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    )
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </SchoolLayout>
    );
}
