import { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { ArrowLeft, CheckCircle, XCircle, Trash2 } from 'lucide-react';

const DAYS = [
    ['monday', 'Lundi'], ['tuesday', 'Mardi'], ['wednesday', 'Mercredi'], ['thursday', 'Jeudi'],
    ['friday', 'Vendredi'], ['saturday', 'Samedi'], ['sunday', 'Dimanche'],
];

const STATUS_CONFIG = {
    pending:  { label: 'En attente', color: 'yellow' },
    approved: { label: 'Approuvée', color: 'green' },
    rejected: { label: 'Refusée', color: 'red' },
};

function Section({ title, children }) {
    return (
        <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">{title}</h2>
            {children}
        </div>
    );
}

function Row({ label, value }) {
    if (value === null || value === undefined || value === '') return null;
    return (
        <div className="flex justify-between py-1.5 text-sm border-b border-gray-50 last:border-0">
            <span className="text-gray-500">{label}</span>
            <span className="text-gray-900 font-medium text-right">{value}</span>
        </div>
    );
}

function RejectModal({ onClose, onSubmit }) {
    const [reason, setReason] = useState('');
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h2 className="font-semibold text-gray-900">Refuser la candidature</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
                </div>
                <div className="px-6 py-5 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Motif du refus *</label>
                        <textarea value={reason} onChange={e => setReason(e.target.value)} rows={4}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500" />
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <button onClick={onClose} className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">Annuler</button>
                        <button onClick={() => reason.trim() && onSubmit(reason)} disabled={!reason.trim()}
                            className="px-4 py-2 text-sm text-white rounded-lg bg-red-600 hover:bg-red-700 disabled:opacity-50">
                            Confirmer le refus
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function Show({ application }) {
    const { flash } = usePage().props;
    const [rejectModal, setRejectModal] = useState(false);
    const sc = STATUS_CONFIG[application.status] ?? STATUS_CONFIG.pending;

    const approve = () => {
        if (confirm(`Approuver « ${application.school_name} » ? L'auto-école sera créée et publiée immédiatement.`)) {
            router.post(route('admin.school-applications.approve', application.id));
        }
    };

    const reject = (reason) => {
        router.post(route('admin.school-applications.reject', application.id), { reason }, { onSuccess: () => setRejectModal(false) });
    };

    const destroy = () => {
        if (confirm('Supprimer définitivement cette candidature ?')) {
            router.delete(route('admin.school-applications.destroy', application.id), {
                onSuccess: () => router.visit(route('admin.school-applications.index')),
            });
        }
    };

    const logo = application.media?.find(m => m.type === 'logo');
    const gallery = application.media?.filter(m => m.type === 'gallery') ?? [];

    return (
        <AdminLayout title={application.school_name}>
            <Head title={`Candidature — ${application.school_name}`} />

            <div className="flex items-center justify-between mb-6">
                <Link href={route('admin.school-applications.index')} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700">
                    <ArrowLeft className="w-4 h-4" /> Retour aux candidatures
                </Link>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold bg-${sc.color}-100 text-${sc.color}-700`}>{sc.label}</span>
            </div>

            {flash?.success && <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">{flash.success}</div>}
            {flash?.error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{flash.error}</div>}

            <div className="flex items-center gap-4 mb-6">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">{application.school_name}</h1>
                    <p className="text-sm text-gray-500">Soumise le {new Date(application.created_at).toLocaleDateString('fr-FR')}</p>
                </div>

                {application.status === 'pending' && (
                    <div className="ml-auto flex gap-2">
                        <button onClick={approve} className="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700">
                            <CheckCircle className="w-4 h-4" /> Approuver
                        </button>
                        <button onClick={() => setRejectModal(true)} className="flex items-center gap-1.5 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700">
                            <XCircle className="w-4 h-4" /> Refuser
                        </button>
                    </div>
                )}
                <button onClick={destroy} aria-label="Supprimer" className={`p-2 text-gray-400 hover:text-red-600 rounded-lg ${application.status === 'pending' ? '' : 'ml-auto'}`}>
                    <Trash2 className="w-5 h-5" />
                </button>
            </div>

            {application.status === 'rejected' && application.rejection_reason && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                    <strong>Motif du refus :</strong> {application.rejection_reason}
                </div>
            )}

            {application.status === 'approved' && application.created_auto_school && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700">
                    Auto-école créée : <Link href={route('admin.auto-schools.index')} className="font-semibold underline">{application.created_auto_school.name}</Link>
                </div>
            )}

            <div className="grid lg:grid-cols-2 gap-4">
                <Section title="Informations générales">
                    <Row label="Propriétaire" value={application.owner_name} />
                    <Row label="Date de création" value={application.founded_at} />
                    <Row label="Ville" value={application.city} />
                    <Row label="Quartier" value={application.district} />
                    <Row label="Adresse" value={application.address} />
                    <Row label="Téléphone fixe" value={application.phone_landline} />
                    <Row label="GSM" value={application.phone_mobile} />
                    <Row label="WhatsApp" value={application.whatsapp} />
                    <Row label="Email" value={application.email} />
                </Section>

                <Section title="Présentation">
                    <Row label="Tagline" value={application.tagline} />
                    {application.director_message && (
                        <div className="py-2">
                            <p className="text-gray-500 text-sm mb-1">Mot du directeur</p>
                            <p className="text-sm text-gray-900">{application.director_message}</p>
                        </div>
                    )}
                    <div className="py-2">
                        <p className="text-gray-500 text-sm mb-1">Description</p>
                        <p className="text-sm text-gray-900 whitespace-pre-line">{application.description}</p>
                    </div>
                </Section>

                <Section title="Pédagogie">
                    <div className="flex flex-wrap gap-1.5 mb-2">
                        {(application.languages ?? []).map(l => (
                            <span key={l} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs">{l}</span>
                        ))}
                    </div>
                    <Row label="Moniteur" value={(application.instructor_genders ?? []).includes('male') ? 'Oui' : null} />
                    <Row label="Monitrice" value={(application.instructor_genders ?? []).includes('female') ? 'Oui' : null} />
                </Section>

                <Section title="Horaires">
                    {DAYS.map(([key, label]) => {
                        const h = application.opening_hours?.[key];
                        if (!h) return null;
                        return (
                            <div key={key} className="flex justify-between py-1 text-sm border-b border-gray-50 last:border-0">
                                <span className="text-gray-500">{label}</span>
                                <span className="text-gray-900">{h.closed ? 'Fermé' : `${h.open} – ${h.close}`}</span>
                            </div>
                        );
                    })}
                </Section>

                <Section title="Présence en ligne">
                    <Row label="Facebook" value={application.facebook_url} />
                    <Row label="Instagram" value={application.instagram_url} />
                    <Row label="TikTok" value={application.tiktok_url} />
                    <Row label="Site web" value={application.website_url} />
                    <Row label="Google Maps" value={application.google_maps_url} />
                </Section>

                <Section title="Chiffres clés">
                    <Row label="Ancienneté" value={application.years_experience ? `${application.years_experience} ans` : null} />
                    <Row label="Total candidats" value={application.total_students} />
                    <Row label="Moyenne mensuelle" value={application.avg_students_per_month} />
                    <Row label="Taux de réussite" value={application.success_rate ? `${application.success_rate}%` : null} />
                    <Row label="Personnel" value={application.staff_count} />
                    <Row label="Véhicules" value={application.vehicles_count} />
                </Section>

                <Section title="Services spéciaux">
                    <div className="flex flex-wrap gap-1.5">
                        {(application.special_services ?? []).map(s => (
                            <span key={s} className="px-2 py-0.5 bg-orange-50 text-orange-700 rounded-full text-xs">{s}</span>
                        ))}
                        {application.special_services_other && (
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full text-xs">{application.special_services_other}</span>
                        )}
                    </div>
                </Section>

                {application.projects?.length > 0 && (
                    <Section title="Autres projets">
                        <div className="space-y-2">
                            {application.projects.map((p) => (
                                <div key={p.id} className="p-2 bg-gray-50 rounded-lg">
                                    <p className="text-sm font-medium text-gray-800">{p.title}{p.year ? ` (${p.year})` : ''}</p>
                                    {p.description && <p className="text-xs text-gray-500 mt-0.5">{p.description}</p>}
                                </div>
                            ))}
                        </div>
                    </Section>
                )}

                <Section title="Catégories">
                    <div className="flex flex-wrap gap-1.5">
                        {(application.categories ?? []).length === 0 && <span className="text-sm text-gray-400">Aucune catégorie</span>}
                        {(application.categories ?? []).map(id => (
                            <span key={id} className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-full text-xs">#{id}</span>
                        ))}
                    </div>
                </Section>

                <Section title="Médias">
                    {logo && (
                        <div className="mb-4">
                            <p className="text-xs text-gray-500 mb-2">Logo</p>
                            <img src={`/storage/${logo.path}`} alt="Logo" className="w-24 h-24 object-cover rounded-lg border border-gray-200" />
                        </div>
                    )}
                    {gallery.length > 0 ? (
                        <div>
                            <p className="text-xs text-gray-500 mb-2">Galerie ({gallery.length})</p>
                            <div className="grid grid-cols-4 gap-2">
                                {gallery.map((m) => (
                                    <img key={m.id} src={`/storage/${m.path}`} alt="" className="w-full aspect-square object-cover rounded-lg border border-gray-200" />
                                ))}
                            </div>
                        </div>
                    ) : (
                        !logo && <p className="text-sm text-gray-400">Aucun média fourni.</p>
                    )}
                </Section>
            </div>

            {rejectModal && <RejectModal onClose={() => setRejectModal(false)} onSubmit={reject} />}
        </AdminLayout>
    );
}
