import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Database, HardDrive, Download, AlertTriangle, CheckCircle } from 'lucide-react';

export default function Backups({ db, storage }) {
    const checks = [
        { label: 'Base de données accessible',  ok: true,  note: `${db.driver} — ${db.database}` },
        { label: `${db.tables} tables détectées`, ok: db.tables > 0, note: `${db.size_mb} MB` },
        { label: 'Répertoire uploads',           ok: true,  note: storage.uploads_path },
        { label: 'Répertoire logs',              ok: true,  note: storage.logs_path },
    ];

    return (
        <AdminLayout title="Sauvegardes">
            <Head title="Sauvegardes - Admin" />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-xl border border-gray-100 p-5">
                    <Database className="w-8 h-8 text-orange-600 mb-2" />
                    <p className="text-2xl font-bold text-gray-900">{db.tables}</p>
                    <p className="text-sm text-gray-500">Tables en base</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 p-5">
                    <HardDrive className="w-8 h-8 text-blue-600 mb-2" />
                    <p className="text-2xl font-bold text-gray-900">{db.size_mb} MB</p>
                    <p className="text-sm text-gray-500">Taille de la base</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 p-5">
                    <CheckCircle className="w-8 h-8 text-green-600 mb-2" />
                    <p className="text-2xl font-bold text-gray-900">OK</p>
                    <p className="text-sm text-gray-500">Connexion DB active</p>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 p-5 mb-5">
                <h3 className="font-semibold text-gray-900 mb-4">Diagnostic du système</h3>
                <div className="space-y-3">
                    {checks.map((c, i) => (
                        <div key={i} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                            {c.ok
                                ? <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                                : <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
                            }
                            <span className="text-sm text-gray-800 flex-1">{c.label}</span>
                            <span className="text-xs text-gray-400">{c.note}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 p-5 mb-5">
                <h3 className="font-semibold text-gray-900 mb-3">Sauvegardes manuelles</h3>
                <p className="text-sm text-gray-500 mb-4">
                    Pour réaliser une sauvegarde complète, exécutez ces commandes sur votre serveur :
                </p>
                <div className="space-y-3">
                    <div className="bg-gray-900 rounded-lg p-4">
                        <p className="text-xs text-gray-400 mb-1">Export base de données :</p>
                        <code className="text-green-400 text-xs font-mono">
                            mysqldump -u [user] -p [database] &gt; backup_$(date +%Y%m%d).sql
                        </code>
                    </div>
                    <div className="bg-gray-900 rounded-lg p-4">
                        <p className="text-xs text-gray-400 mb-1">Archive des fichiers :</p>
                        <code className="text-green-400 text-xs font-mono">
                            tar -czf backup_files_$(date +%Y%m%d).tar.gz storage/app/public
                        </code>
                    </div>
                    <div className="bg-gray-900 rounded-lg p-4">
                        <p className="text-xs text-gray-400 mb-1">Via artisan (si laravel-backup installé) :</p>
                        <code className="text-green-400 text-xs font-mono">
                            php artisan backup:run
                        </code>
                    </div>
                </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-medium text-yellow-800">Recommandation</p>
                        <p className="text-sm text-yellow-700 mt-1">
                            Installez le package <code className="bg-yellow-100 px-1 rounded">spatie/laravel-backup</code> pour des sauvegardes automatiques planifiées avec stockage S3/cloud.
                        </p>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
