import { Head, router, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { useState } from 'react';

function SettingsGroup({ title, fields, data, onChange }) {
    return (
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-5">
            <h3 className="font-semibold text-gray-900 mb-4">{title}</h3>
            <div className="space-y-4">
                {fields.map(({ key, label, type = 'text', hint }) => (
                    <div key={key}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                        {type === 'textarea' ? (
                            <textarea value={data[key] ?? ''} onChange={(e) => onChange(key, e.target.value)}
                                rows={6} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500" />
                        ) : type === 'checkbox' ? (
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" checked={data[key] === '1'} onChange={(e) => onChange(key, e.target.checked ? '1' : '0')}
                                    className="rounded border-gray-300 text-orange-600" />
                                <span className="text-sm text-gray-600">{hint}</span>
                            </label>
                        ) : (
                            <input type={type} value={data[key] ?? ''} onChange={(e) => onChange(key, e.target.value)}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500" />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function SystemSettings({ settings = {} }) {
    const { flash } = usePage().props;
    const [activeTab, setActiveTab] = useState('general');

    const [generalData, setGeneralData] = useState(settings.general ?? {});
    const [seoData, setSeoData] = useState(settings.seo ?? {});
    const [cmsData, setCmsData] = useState(settings.cms ?? {});

    const [processing, setProcessing] = useState(false);

    const saveGroup = (group, data) => {
        setProcessing(true);
        router.put(route('admin.settings.update'), { group, settings: data }, {
            preserveScroll: true,
            onFinish: () => setProcessing(false),
        });
    };

    const tabs = [
        { id: 'general', label: 'Général' },
        { id: 'seo', label: 'SEO' },
        { id: 'cms', label: 'CMS / Pages' },
    ];

    return (
        <AdminLayout title="Paramètres système">
            <Head title="Paramètres - Admin" />
            {flash?.success && <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">{flash.success}</div>}

            {/* Tabs */}
            <div className="flex gap-1 mb-5 bg-white border border-gray-200 rounded-xl p-1 w-fit">
                {tabs.map((t) => (
                    <button key={t.id} onClick={() => setActiveTab(t.id)}
                        className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${activeTab === t.id ? 'bg-orange-600 text-white' : 'text-gray-600 hover:text-gray-900'}`}>
                        {t.label}
                    </button>
                ))}
            </div>

            {activeTab === 'general' && (
                <>
                    <SettingsGroup title="Paramètres généraux" data={generalData} onChange={(k, v) => setGeneralData(p => ({ ...p, [k]: v }))}
                        fields={[
                            { key: 'site_name', label: 'Nom du site' },
                            { key: 'site_tagline', label: 'Slogan' },
                            { key: 'site_email', label: 'Email contact', type: 'email' },
                            { key: 'site_phone', label: 'Téléphone contact' },
                            { key: 'maintenance_mode', label: 'Mode maintenance', type: 'checkbox', hint: 'Activer le mode maintenance' },
                            { key: 'allow_reviews', label: 'Avis autorisés', type: 'checkbox', hint: 'Permettre les avis utilisateurs' },
                            { key: 'require_approval', label: 'Approbation requise', type: 'checkbox', hint: 'Approuver les écoles avant publication' },
                        ]} />
                    <button onClick={() => saveGroup('general', generalData)} disabled={processing}
                        className="px-5 py-2 bg-orange-600 text-white rounded-lg text-sm hover:bg-orange-700 disabled:opacity-50">
                        Enregistrer les paramètres généraux
                    </button>
                </>
            )}

            {activeTab === 'seo' && (
                <>
                    <SettingsGroup title="Paramètres SEO" data={seoData} onChange={(k, v) => setSeoData(p => ({ ...p, [k]: v }))}
                        fields={[
                            { key: 'meta_title', label: 'Titre méta (homepage)' },
                            { key: 'meta_description', label: 'Description méta', type: 'textarea' },
                            { key: 'meta_keywords', label: 'Mots-clés méta' },
                            { key: 'og_image', label: 'Image Open Graph (URL)' },
                            { key: 'google_analytics', label: 'ID Google Analytics (G-XXXXXX)' },
                        ]} />
                    <button onClick={() => saveGroup('seo', seoData)} disabled={processing}
                        className="px-5 py-2 bg-orange-600 text-white rounded-lg text-sm hover:bg-orange-700 disabled:opacity-50">
                        Enregistrer les paramètres SEO
                    </button>
                </>
            )}

            {activeTab === 'cms' && (
                <>
                    <SettingsGroup title="Contenu des pages statiques" data={cmsData} onChange={(k, v) => setCmsData(p => ({ ...p, [k]: v }))}
                        fields={[
                            { key: 'about_content', label: 'Page À propos (Markdown)', type: 'textarea' },
                            { key: 'contact_content', label: 'Page Contact - intro', type: 'textarea' },
                            { key: 'faq_content', label: 'Page FAQ (Markdown)', type: 'textarea' },
                            { key: 'terms_content', label: 'Conditions d\'utilisation (Markdown)', type: 'textarea' },
                            { key: 'privacy_content', label: 'Politique de confidentialité (Markdown)', type: 'textarea' },
                        ]} />
                    <button onClick={() => saveGroup('cms', cmsData)} disabled={processing}
                        className="px-5 py-2 bg-orange-600 text-white rounded-lg text-sm hover:bg-orange-700 disabled:opacity-50">
                        Enregistrer le contenu CMS
                    </button>
                </>
            )}
        </AdminLayout>
    );
}
