import { useState, useRef } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { Plus, Search, Users, MessageSquare, Bell, Mail, Phone, X, ChevronDown } from 'lucide-react';

const SOURCE_COLORS = {
    website: 'bg-blue-100 text-blue-700',
    referral: 'bg-green-100 text-green-700',
    social: 'bg-purple-100 text-purple-700',
    direct: 'bg-gray-100 text-gray-700',
    event: 'bg-orange-100 text-orange-700',
    other: 'bg-slate-100 text-slate-700',
};

function ProspectCard({ prospect, stages, onDragStart }) {
    return (
        <div
            draggable
            onDragStart={() => onDragStart(prospect.id)}
            className="bg-white rounded-xl border border-gray-100 shadow-sm p-3.5 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
        >
            <Link href={route('admin.crm.prospects.show', prospect.id)}
                className="block" onClick={e => e.stopPropagation()}>
                <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="font-medium text-gray-900 text-sm leading-tight">{prospect.name}</span>
                    {prospect.score > 0 && (
                        <span className={`text-xs px-1.5 py-0.5 rounded font-bold flex-shrink-0 ${
                            prospect.score >= 70 ? 'bg-green-100 text-green-700' :
                            prospect.score >= 40 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                        }`}>{prospect.score}</span>
                    )}
                </div>

                {prospect.company && (
                    <p className="text-xs text-gray-500 mb-2 truncate">{prospect.company}</p>
                )}

                <div className="flex flex-wrap gap-1 mb-2">
                    {prospect.tags.map(tag => (
                        <span key={tag.id} className="text-xs px-1.5 py-0.5 rounded-full font-medium"
                            style={{ background: tag.color + '22', color: tag.color }}>
                            {tag.name}
                        </span>
                    ))}
                </div>

                <div className="flex items-center gap-2 text-xs text-gray-400">
                    {prospect.notes_count > 0 && (
                        <span className="flex items-center gap-0.5">
                            <MessageSquare className="w-3 h-3" /> {prospect.notes_count}
                        </span>
                    )}
                    {prospect.reminders_count > 0 && (
                        <span className="flex items-center gap-0.5 text-amber-500">
                            <Bell className="w-3 h-3" /> {prospect.reminders_count}
                        </span>
                    )}
                    {prospect.email && <Mail className="w-3 h-3" />}
                    {prospect.phone && <Phone className="w-3 h-3" />}
                    {prospect.source && (
                        <span className={`ml-auto text-xs px-1.5 py-0.5 rounded-full ${SOURCE_COLORS[prospect.source] ?? 'bg-gray-100 text-gray-600'}`}>
                            {prospect.source}
                        </span>
                    )}
                </div>

                {prospect.assigned_to && (
                    <div className="mt-2 flex items-center gap-1.5">
                        <div className="w-4 h-4 rounded-full bg-indigo-100 flex items-center justify-center">
                            <span className="text-[9px] font-bold text-indigo-600">
                                {prospect.assigned_to.name.charAt(0)}
                            </span>
                        </div>
                        <span className="text-xs text-gray-400 truncate">{prospect.assigned_to.name}</span>
                    </div>
                )}
            </Link>
        </div>
    );
}

function StageColumn({ stage, onDrop, onDragOver, onDragStart }) {
    const typeRing = stage.type === 'won' ? 'ring-green-200' : stage.type === 'lost' ? 'ring-red-200' : 'ring-gray-100';

    return (
        <div
            className={`flex-shrink-0 w-72 bg-gray-50 rounded-2xl ring-1 ${typeRing} flex flex-col max-h-[calc(100vh-240px)]`}
            onDragOver={e => { e.preventDefault(); onDragOver(stage.id); }}
            onDrop={() => onDrop(stage.id)}
        >
            {/* Column header */}
            <div className="p-3 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ background: stage.color }} />
                    <span className="text-sm font-semibold text-gray-700">{stage.name}</span>
                    <span className="text-xs bg-white border border-gray-200 text-gray-500 px-1.5 py-0.5 rounded-full font-medium">
                        {stage.prospects.length}
                    </span>
                </div>
            </div>

            {/* Cards */}
            <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-2">
                {stage.prospects.map(p => (
                    <ProspectCard key={p.id} prospect={p} stages={[]} onDragStart={onDragStart} />
                ))}
                {stage.prospects.length === 0 && (
                    <div className="py-8 text-center">
                        <p className="text-xs text-gray-400">Aucun prospect</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function Pipeline({ stages, filters, admins }) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [assignedTo, setAssignedTo] = useState(filters.assigned_to ?? '');
    const [dragProspectId, setDragProspectId] = useState(null);
    const [dropTargetId, setDropTargetId] = useState(null);

    const applyFilters = (updates) => {
        const params = { search, assigned_to: assignedTo, ...updates };
        router.get(route('admin.crm.pipeline'), params, { preserveState: true, replace: true });
    };

    const handleDrop = (targetStageId) => {
        if (!dragProspectId) return;
        router.post(route('admin.crm.pipeline.move'), {
            prospect_id: dragProspectId,
            stage_id: targetStageId,
        }, { preserveScroll: true });
        setDragProspectId(null);
        setDropTargetId(null);
    };

    return (
        <AdminLayout>
            <Head title="CRM — Pipeline" />

            <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center justify-between mb-4 flex-shrink-0">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Pipeline</h1>
                        <p className="text-xs text-gray-500 mt-0.5">Glissez les prospects entre les étapes</p>
                    </div>
                    <Link href={route('admin.crm.prospects.index')}
                        className="inline-flex items-center gap-2 px-3 py-2 bg-orange-600 text-white rounded-xl text-sm font-semibold hover:bg-orange-700">
                        <Plus className="w-4 h-4" /> Prospect
                    </Link>
                </div>

                {/* Filters */}
                <div className="flex gap-3 mb-4 flex-shrink-0">
                    <div className="relative flex-1 max-w-xs">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Rechercher..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && applyFilters({ search })}
                            className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                    </div>
                    <select
                        value={assignedTo}
                        onChange={e => { setAssignedTo(e.target.value); applyFilters({ assigned_to: e.target.value }); }}
                        className="px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-700 focus:ring-2 focus:ring-orange-500">
                        <option value="">Tous les assignés</option>
                        {admins.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </select>
                </div>

                {/* Kanban board */}
                <div className="flex gap-4 overflow-x-auto pb-4">
                    {stages.map(stage => (
                        <StageColumn
                            key={stage.id}
                            stage={stage}
                            onDragStart={setDragProspectId}
                            onDragOver={setDropTargetId}
                            onDrop={handleDrop}
                        />
                    ))}
                </div>
            </div>
        </AdminLayout>
    );
}
