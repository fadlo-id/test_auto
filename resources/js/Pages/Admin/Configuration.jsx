import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Server, Database, Globe, Package, Settings, ExternalLink } from 'lucide-react';

function Section({ title, icon: Icon, children }) {
    return (
        <div className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex items-center gap-2 mb-4">
                <Icon className="w-5 h-5 text-orange-600" />
                <h3 className="font-semibold text-gray-900">{title}</h3>
            </div>
            <div className="space-y-2">{children}</div>
        </div>
    );
}

function Row({ label, value, warn = false }) {
    return (
        <div className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
            <span className="text-sm text-gray-500">{label}</span>
            <span className={`text-sm font-medium ${warn ? 'text-red-600' : 'text-gray-800'}`}>{String(value ?? '—')}</span>
        </div>
    );
}

export default function Configuration({ app, php, db, cache }) {
    return (
        <AdminLayout title="Configuration système">
            <Head title="Configuration - Admin" />

            <div className="mb-5 flex items-center justify-between">
                <p className="text-sm text-gray-500">Informations de configuration du système (lecture seule).</p>
                <Link href={route('admin.settings')} className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg text-sm hover:bg-orange-700">
                    <Settings className="w-4 h-4" /> Gérer les paramètres
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <Section title="Application" icon={Globe}>
                    <Row label="Nom" value={app.name} />
                    <Row label="Environnement" value={app.env} warn={app.env === 'production' && app.debug} />
                    <Row label="Mode debug" value={app.debug ? 'Activé' : 'Désactivé'} warn={app.debug && app.env === 'production'} />
                    <Row label="URL" value={app.url} />
                    <Row label="Timezone" value={app.timezone} />
                    <Row label="Locale" value={app.locale} />
                </Section>

                <Section title="PHP" icon={Server}>
                    <Row label="Version PHP" value={php.version} />
                    <Row label="Mémoire limite" value={php.memory_limit} />
                    <Row label="Temps max." value={php.max_execution_time} />
                    <Row label="Upload max" value={php.upload_max_filesize} />
                </Section>

                <Section title="Base de données" icon={Database}>
                    <Row label="Driver" value={db.driver} />
                    <Row label="Base" value={db.database} />
                    <Row label="Tables" value={db.tables} />
                    <Row label="Taille" value={`${db.size_mb} MB`} />
                </Section>

                <Section title="Services" icon={Package}>
                    <Row label="Cache" value={cache.driver} />
                    <Row label="Queue" value={cache.queue} />
                    <Row label="Session" value={cache.session} />
                    <Row label="Mail" value={cache.mail} />
                </Section>
            </div>

            <div className="mt-5 bg-orange-50 border border-orange-200 rounded-xl p-4">
                <p className="text-sm text-orange-800 font-medium">Note de sécurité</p>
                <p className="text-sm text-orange-700 mt-1">
                    {app.debug
                        ? 'Le mode debug est activé. Désactivez-le en production (APP_DEBUG=false dans .env).'
                        : 'Le mode debug est désactivé. Configuration correcte pour la production.'}
                </p>
            </div>
        </AdminLayout>
    );
}
