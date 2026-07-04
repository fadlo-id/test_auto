import { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    ArrowLeft, Mail, Phone, MapPin, Building2, Tag, Star, Calendar,
    MessageSquare, Clock, Send, Bell, CheckCircle, XCircle, Pencil,
    AlertTriangle, Plus, X, Trash2, ChevronDown, Activity,
} from 'lucide-react';

const STATUS_STYLES = { active: 'bg-blue-100 text-blue-700', won: 'bg-green-100 text-green-700', lost: 'bg-red-100 text-red-700', archived: 'bg-gray-100 text-gray-500' };
const STATUS_LABELS = { active: 'Actif', won: 'Gagné', lost: 'Perdu', archived: 'Archivé' };
const NOTE_TYPE_ICONS = { general: MessageSquare, call: Phone, meeting: Calendar, email: Mail, sms: Send };
const NOTE_TYPE_LABELS = { general: 'Note', call: 'Appel', meeting: 'Réunion', email: 'Email', sms: 'SMS' };
const ACTIVITY_ICONS = {
    created: Plus, note_added: MessageSquare, email_sent: Mail, sms_sent: Send,
    stage_changed: ArrowLeft, assigned: Tag, reminder_set: Bell, reminder_done: CheckCircle, updated: Pencil,
};

function formatDate(d) {
    if (!d) return '—';
    return new Date(d).toLocaleString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function formatDateShort(d) {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ── Note Card ──────────────────────────────────────────────────────────────────
function NoteCard({ note, prospectId, onDeleted }) {
    const NoteIcon = NOTE_TYPE_ICONS[note.type] ?? MessageSquare;
    return (
        <div className={`bg-white border rounded-xl p-4 ${note.is_pinned ? 'border-orange-200 ring-1 ring-orange-100' : 'border-gray-100'}`}>
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="p-1.5 rounded-lg bg-gray-100 text-gray-500"><NoteIcon className="w-3.5 h-3.5" /></div>
                    <span className="text-xs font-medium text-gray-500">{NOTE_TYPE_LABELS[note.type]}</span>
                    {note.is_pinned && <span className="text-xs text-orange-600 font-medium">📌 Épinglé</span>}
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">{note.author?.name} · {formatDateShort(note.created_at)}</span>
                    <button onClick={() => {
                        if (!confirm('Supprimer cette note ?')) return;
                        router.delete(route('admin.crm.prospects.notes.destroy', [prospectId, note.id]), { preserveScroll: true });
                    }} className="p-1 hover:bg-red-50 rounded text-red-400">
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>
            <p className="text-sm text-gray-700 mt-2 whitespace-pre-wrap">{note.content}</p>
        </div>
    );
}

// ── Add Note Form ──────────────────────────────────────────────────────────────
function AddNoteForm({ prospectId }) {
    const { data, setData, post, processing, reset } = useForm({ content: '', type: 'general', is_pinned: false });
    const submit = (e) => { e.preventDefault(); post(route('admin.crm.prospects.notes.store', prospectId), { onSuccess: reset, preserveScroll: true }); };
    return (
        <form onSubmit={submit} className="bg-white border border-gray-100 rounded-xl p-4 space-y-3">
            <div className="flex gap-2">
                <select value={data.type} onChange={e => setData('type', e.target.value)}
                    className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-700">
                    {Object.entries(NOTE_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
                <label className="flex items-center gap-1.5 text-xs text-gray-500 cursor-pointer ml-auto">
                    <input type="checkbox" checked={data.is_pinned} onChange={e => setData('is_pinned', e.target.checked)} className="rounded" />
                    Épingler
                </label>
            </div>
            <textarea rows={3} value={data.content} onChange={e => setData('content', e.target.value)}
                placeholder="Ajoutez une note, un résumé d'appel, une info..."
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm resize-none focus:ring-2 focus:ring-orange-500" required />
            <button type="submit" disabled={processing || !data.content.trim()}
                className="px-4 py-2 bg-orange-600 text-white rounded-xl text-sm font-medium hover:bg-orange-700 disabled:opacity-50">
                {processing ? 'Ajout...' : 'Ajouter'}
            </button>
        </form>
    );
}

// ── Send Email Form ────────────────────────────────────────────────────────────
function SendEmailForm({ prospectId, prospectEmail }) {
    const { data, setData, post, processing, reset, errors } = useForm({ subject: '', body: '' });
    if (!prospectEmail) return <p className="text-sm text-gray-400 py-4">Ce prospect n'a pas d'adresse email.</p>;
    const submit = (e) => { e.preventDefault(); post(route('admin.crm.prospects.emails.store', prospectId), { onSuccess: reset, preserveScroll: true }); };
    return (
        <form onSubmit={submit} className="space-y-3">
            <div>
                <label className="text-xs font-medium text-gray-700 block mb-1">Destinataire</label>
                <p className="text-sm text-gray-600 bg-gray-50 rounded-xl px-3 py-2">{prospectEmail}</p>
            </div>
            <div>
                <label className="text-xs font-medium text-gray-700 block mb-1">Sujet *</label>
                <input value={data.subject} onChange={e => setData('subject', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-orange-500" required />
            </div>
            <div>
                <label className="text-xs font-medium text-gray-700 block mb-1">Message *</label>
                <textarea rows={6} value={data.body} onChange={e => setData('body', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm resize-none focus:ring-2 focus:ring-orange-500" required />
            </div>
            <button type="submit" disabled={processing}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
                <Send className="w-4 h-4" /> {processing ? 'Envoi...' : 'Envoyer'}
            </button>
        </form>
    );
}

// ── Send SMS Form ──────────────────────────────────────────────────────────────
function SendSmsForm({ prospectId, prospectPhone }) {
    const { data, setData, post, processing, reset } = useForm({ message: '' });
    if (!prospectPhone) return <p className="text-sm text-gray-400 py-4">Ce prospect n'a pas de numéro de téléphone.</p>;
    const submit = (e) => { e.preventDefault(); post(route('admin.crm.prospects.sms.store', prospectId), { onSuccess: reset, preserveScroll: true }); };
    const remaining = 160 - data.message.length;
    return (
        <form onSubmit={submit} className="space-y-3">
            <p className="text-sm text-gray-600 bg-gray-50 rounded-xl px-3 py-2">{prospectPhone}</p>
            <div>
                <label className="text-xs font-medium text-gray-700 block mb-1">Message ({remaining} caractères restants)</label>
                <textarea rows={4} maxLength={160} value={data.message} onChange={e => setData('message', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm resize-none focus:ring-2 focus:ring-orange-500" required />
            </div>
            <button type="submit" disabled={processing}
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 disabled:opacity-50">
                <Send className="w-4 h-4" /> {processing ? 'Envoi...' : 'Envoyer le SMS'}
            </button>
        </form>
    );
}

// ── Add Reminder Form ──────────────────────────────────────────────────────────
function AddReminderForm({ prospectId, admins }) {
    const { data, setData, post, processing, reset, errors } = useForm({
        title: '', note: '', due_at: '', assigned_to: admins[0]?.id ?? '',
    });
    const submit = (e) => { e.preventDefault(); post(route('admin.crm.prospects.reminders.store', prospectId), { onSuccess: reset, preserveScroll: true }); };
    return (
        <form onSubmit={submit} className="bg-white border border-gray-100 rounded-xl p-4 space-y-3">
            <input value={data.title} onChange={e => setData('title', e.target.value)}
                placeholder="Titre de la relance *" required
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-orange-500" />
            {errors.title && <p className="text-xs text-red-500">{errors.title}</p>}
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="text-xs font-medium text-gray-700 block mb-1">Échéance *</label>
                    <input type="datetime-local" value={data.due_at} onChange={e => setData('due_at', e.target.value)} required
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-orange-500" />
                    {errors.due_at && <p className="text-xs text-red-500 mt-1">{errors.due_at}</p>}
                </div>
                <div>
                    <label className="text-xs font-medium text-gray-700 block mb-1">Assigné à *</label>
                    <select value={data.assigned_to} onChange={e => setData('assigned_to', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-orange-500">
                        {admins.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </select>
                </div>
            </div>
            <textarea rows={2} value={data.note} onChange={e => setData('note', e.target.value)}
                placeholder="Note optionnelle..."
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm resize-none focus:ring-2 focus:ring-orange-500" />
            <button type="submit" disabled={processing}
                className="px-4 py-2 bg-amber-600 text-white rounded-xl text-sm font-medium hover:bg-amber-700 disabled:opacity-50">
                {processing ? 'Planification...' : 'Planifier la relance'}
            </button>
        </form>
    );
}

// ── Edit Prospect Modal ────────────────────────────────────────────────────────
function EditProspectModal({ prospect, stages, tags, admins, onClose }) {
    const { data, setData, put, processing, errors } = useForm({
        name: prospect.name, email: prospect.email ?? '', phone: prospect.phone ?? '',
        city: prospect.city ?? '', company: prospect.company ?? '',
        source: prospect.source ?? 'direct', description: prospect.description ?? '',
        score: prospect.score ?? 0, status: prospect.status,
        tag_ids: prospect.tags.map(t => t.id),
    });

    const submit = (e) => { e.preventDefault(); put(route('admin.crm.prospects.update', prospect.id), { onSuccess: onClose }); };
    const toggleTag = (id) => setData('tag_ids', data.tag_ids.includes(id) ? data.tag_ids.filter(t => t !== id) : [...data.tag_ids, id]);

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-5 border-b border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900">Modifier le prospect</h2>
                    <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4" /></button>
                </div>
                <form onSubmit={submit} className="p-5 space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="col-span-2">
                            <label className="text-xs font-medium text-gray-700 block mb-1">Nom *</label>
                            <input value={data.name} onChange={e => setData('name', e.target.value)}
                                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-orange-500" required />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-gray-700 block mb-1">Email</label>
                            <input type="email" value={data.email} onChange={e => setData('email', e.target.value)}
                                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-orange-500" />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-gray-700 block mb-1">Téléphone</label>
                            <input value={data.phone} onChange={e => setData('phone', e.target.value)}
                                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-orange-500" />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-gray-700 block mb-1">Ville</label>
                            <input value={data.city} onChange={e => setData('city', e.target.value)}
                                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-orange-500" />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-gray-700 block mb-1">Entreprise</label>
                            <input value={data.company} onChange={e => setData('company', e.target.value)}
                                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-orange-500" />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-gray-700 block mb-1">Statut</label>
                            <select value={data.status} onChange={e => setData('status', e.target.value)}
                                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-orange-500">
                                <option value="active">Actif</option>
                                <option value="won">Gagné</option>
                                <option value="lost">Perdu</option>
                                <option value="archived">Archivé</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-gray-700 block mb-1">Score (0-100)</label>
                            <input type="number" min="0" max="100" value={data.score}
                                onChange={e => setData('score', parseInt(e.target.value) || 0)}
                                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-orange-500" />
                        </div>
                        <div className="col-span-2">
                            <label className="text-xs font-medium text-gray-700 block mb-1">Description</label>
                            <textarea rows={3} value={data.description} onChange={e => setData('description', e.target.value)}
                                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm resize-none focus:ring-2 focus:ring-orange-500" />
                        </div>
                    </div>
                    {tags.length > 0 && (
                        <div>
                            <label className="text-xs font-medium text-gray-700 block mb-2">Tags</label>
                            <div className="flex flex-wrap gap-1.5">
                                {tags.map(tag => (
                                    <button key={tag.id} type="button" onClick={() => toggleTag(tag.id)}
                                        className={`text-xs px-2.5 py-1 rounded-full border font-medium transition-all ${data.tag_ids.includes(tag.id) ? 'ring-2 ring-offset-1' : 'opacity-60'}`}
                                        style={{ background: data.tag_ids.includes(tag.id) ? tag.color + '33' : '#f9fafb', borderColor: tag.color, color: tag.color }}>
                                        {tag.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50">Annuler</button>
                        <button type="submit" disabled={processing} className="flex-1 px-4 py-2.5 bg-orange-600 text-white rounded-xl text-sm font-semibold hover:bg-orange-700 disabled:opacity-50">
                            {processing ? 'Sauvegarde...' : 'Sauvegarder'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ── Main Show Page ─────────────────────────────────────────────────────────────
export default function ProspectShow({ prospect, stages, tags, admins }) {
    const [tab, setTab] = useState('notes');
    const [showEdit, setShowEdit] = useState(false);
    const [showMoveStage, setShowMoveStage] = useState(false);

    const moveStageForm = useForm({ stage_id: prospect.stage?.id ?? '' });

    const moveStage = (stageId) => {
        router.post(route('admin.crm.prospects.move', prospect.id), { stage_id: stageId }, { preserveScroll: true });
        setShowMoveStage(false);
    };

    const tabs = [
        { id: 'notes',      label: 'Notes',      count: prospect.notes.length },
        { id: 'reminders',  label: 'Relances',   count: prospect.reminders.filter(r => r.status === 'pending').length },
        { id: 'emails',     label: 'Emails',     count: prospect.emails.length },
        { id: 'sms',        label: 'SMS',        count: prospect.sms.length },
        { id: 'history',    label: 'Historique', count: prospect.activities.length },
    ];

    return (
        <AdminLayout>
            <Head title={`CRM — ${prospect.name}`} />
            {showEdit && <EditProspectModal prospect={prospect} stages={stages} tags={tags} admins={admins} onClose={() => setShowEdit(false)} />}

            <div className="space-y-5">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm">
                    <Link href={route('admin.crm.prospects.index')} className="text-gray-400 hover:text-gray-700 flex items-center gap-1">
                        <ArrowLeft className="w-4 h-4" /> Prospects
                    </Link>
                    <span className="text-gray-300">/</span>
                    <span className="text-gray-900 font-medium">{prospect.name}</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    {/* ── Left column: info ── */}
                    <div className="lg:col-span-1 space-y-4">
                        {/* Profile card */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mb-3">
                                        <span className="text-lg font-bold text-indigo-600">{prospect.name.charAt(0).toUpperCase()}</span>
                                    </div>
                                    <h1 className="text-lg font-bold text-gray-900">{prospect.name}</h1>
                                    {prospect.company && <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5"><Building2 className="w-3.5 h-3.5" />{prospect.company}</p>}
                                </div>
                                <button onClick={() => setShowEdit(true)} className="p-2 hover:bg-gray-100 rounded-xl">
                                    <Pencil className="w-4 h-4 text-gray-400" />
                                </button>
                            </div>

                            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_STYLES[prospect.status]}`}>
                                {STATUS_LABELS[prospect.status]}
                            </span>

                            <div className="mt-4 space-y-2">
                                {prospect.email && (
                                    <a href={`mailto:${prospect.email}`} className="flex items-center gap-2 text-sm text-gray-700 hover:text-indigo-600">
                                        <Mail className="w-4 h-4 text-gray-400" />{prospect.email}
                                    </a>
                                )}
                                {prospect.phone && (
                                    <a href={`tel:${prospect.phone}`} className="flex items-center gap-2 text-sm text-gray-700 hover:text-green-600">
                                        <Phone className="w-4 h-4 text-gray-400" />{prospect.phone}
                                    </a>
                                )}
                                {prospect.city && (
                                    <p className="flex items-center gap-2 text-sm text-gray-600"><MapPin className="w-4 h-4 text-gray-400" />{prospect.city}</p>
                                )}
                            </div>

                            {prospect.score > 0 && (
                                <div className="mt-4">
                                    <p className="text-xs text-gray-500 mb-1">Score</p>
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                            <div className={`h-full rounded-full ${prospect.score >= 70 ? 'bg-green-500' : prospect.score >= 40 ? 'bg-amber-500' : 'bg-red-500'}`}
                                                style={{ width: `${prospect.score}%` }} />
                                        </div>
                                        <span className="text-xs font-bold text-gray-700">{prospect.score}/100</span>
                                    </div>
                                </div>
                            )}

                            {prospect.description && (
                                <p className="mt-4 text-xs text-gray-500 leading-relaxed">{prospect.description}</p>
                            )}

                            {prospect.tags.length > 0 && (
                                <div className="mt-4 flex flex-wrap gap-1.5">
                                    {prospect.tags.map(t => (
                                        <span key={t.id} className="text-xs px-2 py-0.5 rounded-full font-medium"
                                            style={{ background: t.color + '22', color: t.color }}>{t.name}</span>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Stage */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Étape du pipeline</p>
                                <button onClick={() => setShowMoveStage(!showMoveStage)} className="text-xs text-orange-600 hover:text-orange-700">
                                    Changer
                                </button>
                            </div>
                            {prospect.stage ? (
                                <span className="text-sm font-medium px-3 py-1.5 rounded-lg"
                                    style={{ background: prospect.stage.color + '22', color: prospect.stage.color }}>
                                    {prospect.stage.name}
                                </span>
                            ) : <span className="text-sm text-gray-400">Non définie</span>}

                            {showMoveStage && (
                                <div className="mt-3 space-y-1">
                                    {stages.map(s => (
                                        <button key={s.id} onClick={() => moveStage(s.id)}
                                            className={`w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-gray-50 ${prospect.stage?.id === s.id ? 'font-semibold' : ''}`}>
                                            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: s.color }} />
                                            {s.name}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Assignment */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Assigné à</p>
                            <select defaultValue={prospect.assigned_to?.id ?? ''}
                                onChange={e => router.post(route('admin.crm.prospects.assign', prospect.id), { assigned_to: e.target.value }, { preserveScroll: true })}
                                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-orange-500">
                                <option value="">Non assigné</option>
                                {admins.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                            </select>
                        </div>

                        {/* Meta */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-xs text-gray-500 space-y-2">
                            <div className="flex justify-between">
                                <span>Source</span>
                                <span className="font-medium text-gray-700 capitalize">{prospect.source}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Créé le</span>
                                <span className="font-medium text-gray-700">{formatDateShort(prospect.created_at)}</span>
                            </div>
                            {prospect.last_contact_at && (
                                <div className="flex justify-between">
                                    <span>Dernier contact</span>
                                    <span className="font-medium text-gray-700">{formatDateShort(prospect.last_contact_at)}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ── Right column: tabs ── */}
                    <div className="lg:col-span-2 space-y-4">
                        {/* Tabs */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="flex border-b border-gray-100 overflow-x-auto">
                                {tabs.map(t => (
                                    <button key={t.id} onClick={() => setTab(t.id)}
                                        className={`flex-shrink-0 px-4 py-3 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors ${
                                            tab === t.id ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                                        }`}>
                                        {t.label}
                                        {t.count > 0 && (
                                            <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${tab === t.id ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-500'}`}>
                                                {t.count}
                                            </span>
                                        )}
                                    </button>
                                ))}
                            </div>

                            <div className="p-5">
                                {/* Notes tab */}
                                {tab === 'notes' && (
                                    <div className="space-y-4">
                                        <AddNoteForm prospectId={prospect.id} />
                                        {prospect.notes.length === 0 ? (
                                            <p className="text-sm text-gray-400 text-center py-6">Aucune note</p>
                                        ) : prospect.notes.map(n => (
                                            <NoteCard key={n.id} note={n} prospectId={prospect.id} />
                                        ))}
                                    </div>
                                )}

                                {/* Reminders tab */}
                                {tab === 'reminders' && (
                                    <div className="space-y-4">
                                        <AddReminderForm prospectId={prospect.id} admins={admins} />
                                        {prospect.reminders.length === 0 ? (
                                            <p className="text-sm text-gray-400 text-center py-6">Aucune relance</p>
                                        ) : (
                                            <div className="space-y-2">
                                                {prospect.reminders.map(r => (
                                                    <div key={r.id} className={`flex items-start gap-3 p-3.5 rounded-xl border ${
                                                        r.status === 'done' ? 'border-green-100 bg-green-50' :
                                                        r.is_overdue ? 'border-red-100 bg-red-50' : 'border-gray-100'
                                                    }`}>
                                                        <div className={`p-1.5 rounded-lg flex-shrink-0 ${
                                                            r.status === 'done' ? 'bg-green-100 text-green-600' :
                                                            r.is_overdue ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'
                                                        }`}>
                                                            {r.status === 'done' ? <CheckCircle className="w-4 h-4" /> :
                                                             r.is_overdue ? <AlertTriangle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium text-gray-900">{r.title}</p>
                                                            {r.note && <p className="text-xs text-gray-500 mt-0.5">{r.note}</p>}
                                                            <p className="text-xs text-gray-400 mt-1">
                                                                {formatDate(r.due_at)} · {r.assigned_to?.name}
                                                            </p>
                                                        </div>
                                                        {r.status === 'pending' && (
                                                            <div className="flex gap-1">
                                                                <button onClick={() => router.post(route('admin.crm.prospects.reminders.done', [prospect.id, r.id]), {}, { preserveScroll: true })}
                                                                    className="p-1.5 hover:bg-green-100 rounded-lg text-green-600 text-xs">
                                                                    <CheckCircle className="w-4 h-4" />
                                                                </button>
                                                                <button onClick={() => router.delete(route('admin.crm.prospects.reminders.destroy', [prospect.id, r.id]), { preserveScroll: true })}
                                                                    className="p-1.5 hover:bg-red-100 rounded-lg text-red-400 text-xs">
                                                                    <X className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Email tab */}
                                {tab === 'emails' && (
                                    <div className="space-y-5">
                                        <div className="border border-gray-100 rounded-xl p-4">
                                            <h3 className="text-sm font-semibold text-gray-700 mb-3">Envoyer un email</h3>
                                            <SendEmailForm prospectId={prospect.id} prospectEmail={prospect.email} />
                                        </div>
                                        {prospect.emails.length === 0 ? (
                                            <p className="text-sm text-gray-400 text-center py-4">Aucun email envoyé</p>
                                        ) : (
                                            <div className="space-y-2">
                                                {prospect.emails.map(e => (
                                                    <div key={e.id} className="border border-gray-100 rounded-xl p-3">
                                                        <div className="flex items-center justify-between mb-1">
                                                            <span className="text-sm font-medium text-gray-900">{e.subject}</span>
                                                            <span className={`text-xs px-2 py-0.5 rounded-full ${e.status === 'sent' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                                {e.status === 'sent' ? 'Envoyé' : 'Échoué'}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-gray-400">{e.sent_by?.name} · {formatDate(e.sent_at)}</p>
                                                        <p className="text-xs text-gray-600 mt-2 line-clamp-2">{e.body}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* SMS tab */}
                                {tab === 'sms' && (
                                    <div className="space-y-5">
                                        <div className="border border-gray-100 rounded-xl p-4">
                                            <h3 className="text-sm font-semibold text-gray-700 mb-3">Envoyer un SMS</h3>
                                            <SendSmsForm prospectId={prospect.id} prospectPhone={prospect.phone} />
                                        </div>
                                        {prospect.sms.length === 0 ? (
                                            <p className="text-sm text-gray-400 text-center py-4">Aucun SMS envoyé</p>
                                        ) : (
                                            <div className="space-y-2">
                                                {prospect.sms.map(s => (
                                                    <div key={s.id} className="border border-gray-100 rounded-xl p-3">
                                                        <div className="flex items-center justify-between mb-1">
                                                            <span className="text-xs text-gray-400">{s.to_phone}</span>
                                                            <span className={`text-xs px-2 py-0.5 rounded-full ${s.status === 'sent' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                                {s.status === 'sent' ? 'Envoyé' : 'Échoué'}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-gray-700">{s.message}</p>
                                                        <p className="text-xs text-gray-400 mt-1">{s.sent_by?.name} · {formatDate(s.sent_at)}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* History tab */}
                                {tab === 'history' && (
                                    <div className="relative">
                                        {prospect.activities.length === 0 ? (
                                            <p className="text-sm text-gray-400 text-center py-6">Aucune activité</p>
                                        ) : (
                                            <div className="space-y-0">
                                                {prospect.activities.map((a, i) => {
                                                    const Icon = ACTIVITY_ICONS[a.type] ?? Activity;
                                                    return (
                                                        <div key={a.id} className="flex gap-3 relative">
                                                            {i < prospect.activities.length - 1 && (
                                                                <div className="absolute left-4 top-8 bottom-0 w-px bg-gray-100" />
                                                            )}
                                                            <div className="w-8 h-8 flex-shrink-0 rounded-full bg-gray-100 flex items-center justify-center mt-1 relative z-10">
                                                                <Icon className="w-3.5 h-3.5 text-gray-500" />
                                                            </div>
                                                            <div className="flex-1 pb-4">
                                                                <p className="text-sm text-gray-800">{a.description}</p>
                                                                <p className="text-xs text-gray-400 mt-0.5">
                                                                    {a.user?.name ?? 'Système'} · {formatDate(a.occurred_at)}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
