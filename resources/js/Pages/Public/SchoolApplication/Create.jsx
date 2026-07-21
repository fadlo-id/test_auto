import { Head, useForm } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import { Check, X, ShieldCheck, TrendingUp, Clock3, CloudCheck, UploadCloud } from 'lucide-react';
import PublicLayout from '@/Layouts/PublicLayout';
import Reveal from '@/Components/UI/Reveal';

const BENEFITS = [
    { icon: TrendingUp, title: 'Plus de visibilité', desc: 'Votre fiche apparaît dans les recherches par ville et par catégorie de permis.' },
    { icon: ShieldCheck, title: 'Badge Vérifié', desc: 'Une fois approuvée, votre auto-école affiche un badge de confiance auprès des candidats.' },
    { icon: Clock3, title: 'Réponse sous 2 à 5 jours', desc: "C'est gratuit — votre candidature est examinée par notre équipe avant mise en ligne." },
];

const DAYS = [
    ['monday', 'Lundi'],
    ['tuesday', 'Mardi'],
    ['wednesday', 'Mercredi'],
    ['thursday', 'Jeudi'],
    ['friday', 'Vendredi'],
    ['saturday', 'Samedi'],
    ['sunday', 'Dimanche'],
];

const LANGUAGES = ['Arabe', 'Français', 'Anglais', 'Amazigh', 'Espagnol'];

const SPECIAL_SERVICES = [
    'Cours de code en ligne',
    'Simulateur de conduite',
    'Cours à domicile',
    'Paiement en plusieurs fois',
    'Véhicules automatiques',
    'Suivi administratif (dossier)',
    'Cours accélérés',
    'Cours réservés aux femmes',
    'Navette / Transport',
    'Cours en langue étrangère',
    'Formation post-permis',
];

const STEPS = [
    'Informations générales',
    'Présentation',
    'Pédagogie',
    'Horaires',
    'Présence en ligne',
    'Chiffres clés',
    'Médias',
    'Services spéciaux',
    'Autres projets',
];

const DEFAULT_HOURS = DAYS.reduce((acc, [key]) => {
    acc[key] = { open: '09:00', close: '18:00', closed: key === 'sunday' };
    return acc;
}, {});

const DRAFT_KEY = 'school_application_draft_v1';

const EMPTY_FORM = {
    school_name: '', owner_name: '', founded_at: '', city: '', district: '', address: '',
    phone_landline: '', phone_mobile: '', whatsapp: '', email: '',
    tagline: '', director_message: '', description: '',
    categories: [], languages: [], instructor_genders: [],
    opening_hours: DEFAULT_HOURS,
    facebook_url: '', instagram_url: '', tiktok_url: '', website_url: '', google_maps_url: '',
    years_experience: '', total_students: '', avg_students_per_month: '', success_rate: '',
    staff_count: '', vehicles_count: '',
    logo: null,
    gallery: [],
    special_services: [], special_services_other: '',
    projects: [],
};

function loadDraft() {
    try {
        const raw = localStorage.getItem(DRAFT_KEY);
        if (! raw) return null;
        const parsed = JSON.parse(raw);
        return { ...EMPTY_FORM, ...parsed, logo: null, gallery: [] };
    } catch {
        return null;
    }
}

function saveDraft(data) {
    try {
        const { logo, gallery, ...rest } = data;
        localStorage.setItem(DRAFT_KEY, JSON.stringify(rest));
    } catch {
        // storage full/unavailable — draft autosave is best-effort only
    }
}

function clearDraft() {
    try { localStorage.removeItem(DRAFT_KEY); } catch { /* noop */ }
}

function Field({ label, error, required, children, hint }) {
    return (
        <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                {label}{required && <span className="text-red-500"> *</span>}
            </label>
            {children}
            {hint && !error && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>
    );
}

const inputClass = 'input';

function Checkbox({ checked, onChange, label }) {
    return (
        <label className={`flex items-center gap-2 text-sm rounded-xl px-2.5 py-2 cursor-pointer transition-colors ${checked ? 'bg-red-50 text-red-800' : 'text-gray-700 hover:bg-gray-50'}`}>
            <input type="checkbox" checked={checked} onChange={onChange} className="rounded border-gray-300 text-red-600 focus:ring-red-500" />
            {label}
        </label>
    );
}

function toggleInArray(arr, value) {
    return arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];
}

function Dropzone({ label, multiple, files, onFiles, error, max = 10 }) {
    const [dragging, setDragging] = useState(false);
    const previews = useMemo(() => {
        const list = multiple ? files : (files ? [files] : []);
        return list.map((f) => (f ? { name: f.name, url: URL.createObjectURL(f) } : null)).filter(Boolean);
    }, [files, multiple]);

    useEffect(() => () => previews.forEach((p) => URL.revokeObjectURL(p.url)), [previews]);

    const handleFiles = (fileList) => {
        const arr = Array.from(fileList);
        if (multiple) {
            onFiles([...(files || []), ...arr].slice(0, max));
        } else {
            onFiles(arr[0] ?? null);
        }
    };

    return (
        <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
            <div
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); }}
                className={`border-2 border-dashed rounded-2xl p-7 text-center transition-all ${dragging ? 'border-red-500 bg-red-50 scale-[1.01]' : 'border-gray-200 bg-gray-50'}`}
            >
                <div className="w-11 h-11 rounded-2xl bg-white border border-gray-200 flex items-center justify-center mx-auto mb-3 shadow-sm">
                    <UploadCloud className="w-5 h-5 text-red-500" strokeWidth={1.75} />
                </div>
                <p className="text-sm text-gray-500 mb-3">Glissez-déposez vos images ici, ou</p>
                <label className="inline-block px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:border-red-300 hover:text-red-700 cursor-pointer transition-colors shadow-sm">
                    Parcourir
                    <input type="file" accept="image/*" multiple={multiple} className="hidden"
                        onChange={(e) => e.target.files.length && handleFiles(e.target.files)} />
                </label>
                {multiple && <p className="text-xs text-gray-400 mt-2">Maximum {max} images</p>}
            </div>
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}

            {previews.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mt-3">
                    {previews.map((p, i) => (
                        <div key={i} className="relative group aspect-square rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                            <img src={p.url} alt={p.name} className="w-full h-full object-cover" />
                            <button type="button"
                                onClick={() => {
                                    if (multiple) onFiles(files.filter((_, idx) => idx !== i));
                                    else onFiles(null);
                                }}
                                aria-label="Retirer l'image"
                                className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/60 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            ><X className="w-3.5 h-3.5" /></button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function DraftIndicator({ pulse }) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (pulse === 0) return;
        setVisible(true);
        const id = setTimeout(() => setVisible(false), 2000);
        return () => clearTimeout(id);
    }, [pulse]);

    return (
        <span className={`inline-flex items-center gap-1.5 text-xs text-gray-400 transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}>
            <CloudCheck className="w-3.5 h-3.5" />
            Brouillon enregistré
        </span>
    );
}

export default function Create({ categories = [] }) {
    const draft = useMemo(() => loadDraft(), []);
    const { data, setData, post, processing, errors, transform } = useForm(draft || EMPTY_FORM);
    const [step, setStep] = useState(0);
    const [projectDraft, setProjectDraft] = useState({ title: '', description: '', year: '' });
    const [savePulse, setSavePulse] = useState(0);

    useEffect(() => {
        const id = setTimeout(() => { saveDraft(data); setSavePulse((n) => n + 1); }, 400);
        return () => clearTimeout(id);
    }, [data]);

    const stepErrors = useMemo(() => Object.keys(errors).length > 0, [errors]);
    const progressPct = ((step + 1) / STEPS.length) * 100;

    const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
    const prev = () => setStep((s) => Math.max(s - 1, 0));

    const submit = (e) => {
        e.preventDefault();
        transform((d) => ({ ...d, gallery: d.gallery ?? [] }));
        post(route('school-application.store'), {
            forceFormData: true,
            onSuccess: () => clearDraft(),
        });
    };

    const setHour = (day, key, value) => {
        setData('opening_hours', { ...data.opening_hours, [day]: { ...data.opening_hours[day], [key]: value } });
    };

    const addProject = () => {
        if (! projectDraft.title.trim()) return;
        setData('projects', [...data.projects, projectDraft]);
        setProjectDraft({ title: '', description: '', year: '' });
    };

    const removeProject = (i) => setData('projects', data.projects.filter((_, idx) => idx !== i));

    return (
        <>
            <Head>
                <title>Ajouter votre auto-école — AutoEcoles Maroc</title>
                <meta name="description" content="Inscrivez gratuitement votre auto-école sur AutoEcoles.ma." />
            </Head>
            <PublicLayout>
                <div className="min-h-screen bg-gray-50">
                    <div className="relative bg-gradient-to-br from-gray-950 via-red-950 to-gray-900 overflow-hidden py-20 px-4">
                        <div className="absolute inset-0 bg-mesh-brand pointer-events-none" />
                        <Reveal className="relative max-w-3xl mx-auto text-center">
                            <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-3 font-display">Ajouter votre auto-école</h1>
                            <p className="text-gray-300 mb-8">Rejoignez AutoEcoles.ma — c'est gratuit et votre candidature sera examinée par notre équipe sous quelques jours.</p>
                            <div className="grid sm:grid-cols-3 gap-4 text-left">
                                {BENEFITS.map(({ icon: Icon, title, desc }) => (
                                    <div key={title} className="glass-panel rounded-2xl p-4">
                                        <Icon className="w-5 h-5 text-red-300 mb-2" strokeWidth={1.75} />
                                        <p className="font-semibold text-sm text-white mb-1">{title}</p>
                                        <p className="text-gray-300 text-xs leading-relaxed">{desc}</p>
                                    </div>
                                ))}
                            </div>
                        </Reveal>
                    </div>

                    <div className="max-w-3xl mx-auto px-4 py-10">
                        {/* Progress indicator */}
                        <div className="mb-8">
                            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden mb-5">
                                <div className="h-full bg-gradient-to-r from-red-500 to-red-600 rounded-full transition-all duration-500 ease-out" style={{ width: `${progressPct}%` }} />
                            </div>
                            <div className="overflow-x-auto pb-1">
                                <ol className="flex items-center gap-1 min-w-max">
                                    {STEPS.map((label, i) => (
                                        <li key={label} className="flex items-center">
                                            <button type="button" onClick={() => setStep(i)}
                                                aria-label={`Étape ${i + 1} : ${label}`}
                                                aria-current={i === step ? 'step' : undefined}
                                                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 transition-all duration-300 ${
                                                    i === step ? 'bg-red-600 text-white shadow-glow scale-110' : i < step ? 'bg-red-100 text-red-700' : 'bg-gray-200 text-gray-500'
                                                }`}>
                                                {i < step ? <Check className="w-4 h-4" strokeWidth={2.5} /> : i + 1}
                                            </button>
                                            {i < STEPS.length - 1 && <div className={`w-6 h-0.5 transition-colors duration-300 ${i < step ? 'bg-red-300' : 'bg-gray-200'}`} />}
                                        </li>
                                    ))}
                                </ol>
                            </div>
                            <div className="flex items-center justify-between mt-3">
                                <p className="text-sm font-semibold text-gray-700">{step + 1}. {STEPS[step]}</p>
                                <DraftIndicator pulse={savePulse} />
                            </div>
                        </div>

                        {stepErrors && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-sm text-red-700">
                                Certains champs contiennent des erreurs. Merci de les corriger avant de continuer.
                            </div>
                        )}

                        <form onSubmit={submit} className="card-premium p-6 sm:p-8">
                            <div key={step} className="space-y-5 animate-in">
                                {/* 1. Informations générales */}
                                {step === 0 && (
                                    <>
                                        <Field label="Nom complet de l'auto-école" required error={errors.school_name}>
                                            <input className={inputClass} value={data.school_name} onChange={e => setData('school_name', e.target.value)} />
                                        </Field>
                                        <Field label="Nom du propriétaire" required error={errors.owner_name}>
                                            <input className={inputClass} value={data.owner_name} onChange={e => setData('owner_name', e.target.value)} />
                                        </Field>
                                        <Field label="Date de création" error={errors.founded_at}>
                                            <input type="date" className={inputClass} value={data.founded_at} onChange={e => setData('founded_at', e.target.value)} />
                                        </Field>
                                        <div className="grid sm:grid-cols-2 gap-4">
                                            <Field label="Ville" required error={errors.city}>
                                                <input className={inputClass} value={data.city} onChange={e => setData('city', e.target.value)} />
                                            </Field>
                                            <Field label="Quartier" error={errors.district}>
                                                <input className={inputClass} value={data.district} onChange={e => setData('district', e.target.value)} />
                                            </Field>
                                        </div>
                                        <Field label="Adresse complète" required error={errors.address}>
                                            <textarea rows={2} className={inputClass} value={data.address} onChange={e => setData('address', e.target.value)} />
                                        </Field>
                                        <div className="grid sm:grid-cols-3 gap-4">
                                            <Field label="Téléphone fixe" error={errors.phone_landline}>
                                                <input className={inputClass} value={data.phone_landline} onChange={e => setData('phone_landline', e.target.value)} />
                                            </Field>
                                            <Field label="GSM" required error={errors.phone_mobile}>
                                                <input className={inputClass} value={data.phone_mobile} onChange={e => setData('phone_mobile', e.target.value)} />
                                            </Field>
                                            <Field label="WhatsApp" error={errors.whatsapp}>
                                                <input className={inputClass} value={data.whatsapp} onChange={e => setData('whatsapp', e.target.value)} />
                                            </Field>
                                        </div>
                                        <Field label="Email" required error={errors.email}>
                                            <input type="email" className={inputClass} value={data.email} onChange={e => setData('email', e.target.value)} />
                                        </Field>
                                    </>
                                )}

                                {/* 2. Présentation */}
                                {step === 1 && (
                                    <>
                                        <Field label="Tagline" hint="Une courte phrase qui vous décrit" error={errors.tagline}>
                                            <input className={inputClass} maxLength={150} value={data.tagline} onChange={e => setData('tagline', e.target.value)} />
                                        </Field>
                                        <Field label="Mot du directeur" error={errors.director_message}>
                                            <textarea rows={4} className={inputClass} value={data.director_message} onChange={e => setData('director_message', e.target.value)} />
                                        </Field>
                                        <Field label="Description complète" required error={errors.description}>
                                            <textarea rows={6} className={inputClass} value={data.description} onChange={e => setData('description', e.target.value)} />
                                        </Field>
                                    </>
                                )}

                                {/* 3. Pédagogie */}
                                {step === 2 && (
                                    <>
                                        <Field label="Catégories proposées" required error={errors.categories}>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
                                                {categories.map((c) => (
                                                    <Checkbox key={c.id} label={c.name_fr}
                                                        checked={data.categories.includes(c.id)}
                                                        onChange={() => setData('categories', toggleInArray(data.categories, c.id))} />
                                                ))}
                                            </div>
                                        </Field>
                                        <Field label="Langues parlées" error={errors.languages}>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
                                                {LANGUAGES.map((lang) => (
                                                    <Checkbox key={lang} label={lang}
                                                        checked={data.languages.includes(lang)}
                                                        onChange={() => setData('languages', toggleInArray(data.languages, lang))} />
                                                ))}
                                            </div>
                                        </Field>
                                        <Field label="Moniteur / Monitrice" error={errors.instructor_genders}>
                                            <div className="flex gap-4">
                                                <Checkbox label="Moniteur (homme)"
                                                    checked={data.instructor_genders.includes('male')}
                                                    onChange={() => setData('instructor_genders', toggleInArray(data.instructor_genders, 'male'))} />
                                                <Checkbox label="Monitrice (femme)"
                                                    checked={data.instructor_genders.includes('female')}
                                                    onChange={() => setData('instructor_genders', toggleInArray(data.instructor_genders, 'female'))} />
                                            </div>
                                        </Field>
                                    </>
                                )}

                                {/* 4. Horaires */}
                                {step === 3 && (
                                    <div className="space-y-1">
                                        {DAYS.map(([key, label]) => (
                                            <div key={key} className="flex items-center gap-3 py-2.5 border-b border-gray-100 last:border-0">
                                                <span className="w-24 text-sm font-medium text-gray-700 shrink-0">{label}</span>
                                                <input type="time" disabled={data.opening_hours[key].closed}
                                                    value={data.opening_hours[key].open ?? ''}
                                                    onChange={e => setHour(key, 'open', e.target.value)}
                                                    className="border border-gray-200 rounded-xl px-2.5 py-1.5 text-sm disabled:bg-gray-50 disabled:text-gray-400" />
                                                <span className="text-gray-400 text-sm">à</span>
                                                <input type="time" disabled={data.opening_hours[key].closed}
                                                    value={data.opening_hours[key].close ?? ''}
                                                    onChange={e => setHour(key, 'close', e.target.value)}
                                                    className="border border-gray-200 rounded-xl px-2.5 py-1.5 text-sm disabled:bg-gray-50 disabled:text-gray-400" />
                                                <label className="flex items-center gap-1.5 text-sm text-gray-500 ml-auto cursor-pointer">
                                                    <input type="checkbox" checked={data.opening_hours[key].closed}
                                                        onChange={e => setHour(key, 'closed', e.target.checked)}
                                                        className="rounded border-gray-300 text-red-600" />
                                                    Fermé
                                                </label>
                                            </div>
                                        ))}
                                        {errors.opening_hours && <p className="text-xs text-red-500 mt-1">{errors.opening_hours}</p>}
                                    </div>
                                )}

                                {/* 5. Présence en ligne */}
                                {step === 4 && (
                                    <>
                                        <Field label="Facebook" error={errors.facebook_url}>
                                            <input className={inputClass} placeholder="https://facebook.com/..." value={data.facebook_url} onChange={e => setData('facebook_url', e.target.value)} />
                                        </Field>
                                        <Field label="Instagram" error={errors.instagram_url}>
                                            <input className={inputClass} placeholder="https://instagram.com/..." value={data.instagram_url} onChange={e => setData('instagram_url', e.target.value)} />
                                        </Field>
                                        <Field label="TikTok" error={errors.tiktok_url}>
                                            <input className={inputClass} placeholder="https://tiktok.com/@..." value={data.tiktok_url} onChange={e => setData('tiktok_url', e.target.value)} />
                                        </Field>
                                        <Field label="Site web" error={errors.website_url}>
                                            <input className={inputClass} placeholder="https://..." value={data.website_url} onChange={e => setData('website_url', e.target.value)} />
                                        </Field>
                                        <Field label="Google Maps" error={errors.google_maps_url}>
                                            <input className={inputClass} placeholder="https://maps.google.com/..." value={data.google_maps_url} onChange={e => setData('google_maps_url', e.target.value)} />
                                        </Field>
                                    </>
                                )}

                                {/* 6. Chiffres clés */}
                                {step === 5 && (
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        <Field label="Ancienneté (années)" error={errors.years_experience}>
                                            <input type="number" min={0} className={inputClass} value={data.years_experience} onChange={e => setData('years_experience', e.target.value)} />
                                        </Field>
                                        <Field label="Nombre total de candidats" error={errors.total_students}>
                                            <input type="number" min={0} className={inputClass} value={data.total_students} onChange={e => setData('total_students', e.target.value)} />
                                        </Field>
                                        <Field label="Nombre moyen par mois" error={errors.avg_students_per_month}>
                                            <input type="number" min={0} className={inputClass} value={data.avg_students_per_month} onChange={e => setData('avg_students_per_month', e.target.value)} />
                                        </Field>
                                        <Field label="Taux de réussite (%)" error={errors.success_rate}>
                                            <input type="number" min={0} max={100} className={inputClass} value={data.success_rate} onChange={e => setData('success_rate', e.target.value)} />
                                        </Field>
                                        <Field label="Personnel" error={errors.staff_count}>
                                            <input type="number" min={0} className={inputClass} value={data.staff_count} onChange={e => setData('staff_count', e.target.value)} />
                                        </Field>
                                        <Field label="Véhicules pédagogiques" error={errors.vehicles_count}>
                                            <input type="number" min={0} className={inputClass} value={data.vehicles_count} onChange={e => setData('vehicles_count', e.target.value)} />
                                        </Field>
                                    </div>
                                )}

                                {/* 7. Médias */}
                                {step === 6 && (
                                    <div className="space-y-6">
                                        <Dropzone label="Logo" files={data.logo} onFiles={(f) => setData('logo', f)} error={errors.logo} />
                                        <Dropzone label="Galerie de véhicules / locaux" multiple files={data.gallery} onFiles={(f) => setData('gallery', f)} error={errors['gallery'] || errors['gallery.0']} />
                                    </div>
                                )}

                                {/* 8. Services spéciaux */}
                                {step === 7 && (
                                    <>
                                        <Field label="Services spéciaux" error={errors.special_services}>
                                            <div className="grid sm:grid-cols-2 gap-1">
                                                {SPECIAL_SERVICES.map((svc) => (
                                                    <Checkbox key={svc} label={svc}
                                                        checked={data.special_services.includes(svc)}
                                                        onChange={() => setData('special_services', toggleInArray(data.special_services, svc))} />
                                                ))}
                                            </div>
                                        </Field>
                                        <Field label="Autre" error={errors.special_services_other}>
                                            <input className={inputClass} value={data.special_services_other} onChange={e => setData('special_services_other', e.target.value)} />
                                        </Field>
                                    </>
                                )}

                                {/* 9. Autres projets */}
                                {step === 8 && (
                                    <div className="space-y-4">
                                        {data.projects.map((p, i) => (
                                            <div key={i} className="flex items-start justify-between gap-3 p-3.5 bg-gray-50 rounded-2xl border border-gray-100">
                                                <div>
                                                    <p className="text-sm font-medium text-gray-800">{p.title}{p.year ? ` (${p.year})` : ''}</p>
                                                    {p.description && <p className="text-xs text-gray-500 mt-0.5">{p.description}</p>}
                                                </div>
                                                <button type="button" onClick={() => removeProject(i)} aria-label="Retirer" className="text-red-400 hover:text-red-600 shrink-0"><X className="w-4 h-4" /></button>
                                            </div>
                                        ))}

                                        <div className="p-5 border-2 border-dashed border-gray-200 rounded-2xl space-y-3 bg-gray-50/50">
                                            <Field label="Titre du projet">
                                                <input className={inputClass} value={projectDraft.title} onChange={e => setProjectDraft(p => ({ ...p, title: e.target.value }))} />
                                            </Field>
                                            <div className="grid sm:grid-cols-3 gap-3">
                                                <div className="sm:col-span-2">
                                                    <Field label="Description">
                                                        <input className={inputClass} value={projectDraft.description} onChange={e => setProjectDraft(p => ({ ...p, description: e.target.value }))} />
                                                    </Field>
                                                </div>
                                                <Field label="Année">
                                                    <input type="number" className={inputClass} value={projectDraft.year} onChange={e => setProjectDraft(p => ({ ...p, year: e.target.value }))} />
                                                </Field>
                                            </div>
                                            <button type="button" onClick={addProject}
                                                className="text-sm font-semibold text-red-600 hover:text-red-700">
                                                + Ajouter ce projet
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Navigation */}
                            <div className="flex items-center justify-between pt-6 mt-6 border-t border-gray-100">
                                <button type="button" onClick={prev} disabled={step === 0}
                                    className="px-5 py-2.5 rounded-xl text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                                    ← Précédent
                                </button>

                                {step < STEPS.length - 1 ? (
                                    <button type="button" onClick={next}
                                        className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-red-600 text-white hover:bg-red-700 transition-all shadow-sm hover:shadow-glow">
                                        Suivant →
                                    </button>
                                ) : (
                                    <button type="submit" disabled={processing}
                                        className="btn-shine px-6 py-2.5 rounded-xl text-sm font-semibold bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition-all shadow-sm hover:shadow-glow">
                                        {processing ? 'Envoi en cours…' : 'Envoyer ma candidature'}
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            </PublicLayout>
        </>
    );
}
