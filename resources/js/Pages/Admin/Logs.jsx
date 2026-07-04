import { Head, router, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { useState } from 'react';

export default function Logs({ logs = [], filters = {} }) {
    const { flash } = usePage().props;
    const [search, setSearch] = useState(filters.search ?? '');
    const [level, setLevel] = useState(filters.level ?? 'all');

    const applyFilters = () => router.get(route('admin.logs'), { search, level });
    const clearLogs = () => { if (confirm('Effacer tous les logs ?')) router.post(route('admin.logs.clear')); };

    const levelColor = (l) => ({ error: 'text-red-600', warning: 'text-yellow-600', info: 'text-blue-600' }[l] ?? 'text-gray-600');

    return (
        <AdminLayout title="Logs système">
            <Head title="Logs - Admin" />
            {flash?.success && <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">{flash.success}</div>}

            <div className="bg-white rounded-xl border border-gray-200 p-4 mb-5 flex flex-wrap gap-3 items-center">
                <input value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                    placeholder="Rechercher dans les logs..." className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm flex-1 min-w-48" />
                <select value={level} onChange={(e) => { setLevel(e.target.value); }} className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm">
                    <option value="all">Tous les niveaux</option>
                    <option value="error">Erreurs</option>
                    <option value="warning">Avertissements</option>
                    <option value="info">Info</option>
                </select>
                <button onClick={applyFilters} className="px-4 py-1.5 bg-orange-600 text-white rounded-lg text-sm hover:bg-orange-700">Filtrer</button>
                <button onClick={clearLogs} className="px-4 py-1.5 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700">Effacer logs</button>
            </div>

            <div className="bg-gray-900 rounded-xl p-4 font-mono text-xs overflow-auto max-h-[70vh]">
                {logs.length === 0 && <p className="text-gray-400 text-center py-10">Aucun log trouvé</p>}
                {logs.map((log, i) => (
                    <div key={i} className={`py-0.5 border-b border-gray-800 ${levelColor(log.level)}`}>
                        {log.text}
                    </div>
                ))}
            </div>
            <p className="text-xs text-gray-400 mt-2">{logs.length} entrée{logs.length !== 1 ? 's' : ''} affichée{logs.length !== 1 ? 's' : ''} (200 max)</p>
        </AdminLayout>
    );
}
