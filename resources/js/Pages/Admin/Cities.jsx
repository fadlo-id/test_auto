import AdminLayout from '@/Layouts/AdminLayout';
import { router, Link } from '@inertiajs/react';
import { useState } from 'react';
import { Search, MapPin, Building2 } from 'lucide-react';

export default function Cities({ cities, filters, total }) {
    const [search, setSearch] = useState(filters?.search ?? '');

    return (
        <AdminLayout title="Villes">
            <div className="space-y-6">
                <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                        <MapPin className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-gray-900">{total}</p>
                        <p className="text-sm text-gray-500">Villes avec des auto-écoles</p>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <form onSubmit={e => { e.preventDefault(); router.get(route('admin.cities.index'), { search }); }} className="flex gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input value={search} onChange={e => setSearch(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                                placeholder="Rechercher une ville…" />
                        </div>
                        <button type="submit" className="px-4 py-2 bg-orange-600 text-white text-sm font-semibold rounded-lg hover:bg-orange-700 transition-colors">
                            Filtrer
                        </button>
                    </form>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {cities.data?.length === 0 ? (
                        <div className="col-span-3 text-center py-12 text-gray-400">Aucune ville trouvée.</div>
                    ) : cities.data?.map((c, i) => (
                        <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4 hover:border-orange-200 transition-colors">
                            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <MapPin className="w-5 h-5 text-orange-600" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="font-semibold text-gray-900">{c.city}</p>
                                <p className="text-xs text-gray-500">{c.schools_count} auto-école{c.schools_count > 1 ? 's' : ''}</p>
                            </div>
                            <div className="flex-shrink-0">
                                <span className="text-lg font-bold text-orange-600">#{i + 1 + (cities.from - 1)}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {cities.last_page > 1 && (
                    <div className="flex justify-center gap-1">
                        {cities.links?.map((link, i) => (
                            link.url ? <Link key={i} href={link.url} className={`px-3 py-1.5 rounded text-xs font-medium ${link.active ? 'bg-orange-600 text-white' : 'text-gray-600 hover:bg-gray-100 bg-white border border-gray-200'}`} dangerouslySetInnerHTML={{ __html: link.label }} />
                                : <span key={i} className="px-3 py-1.5 rounded text-xs text-gray-300 bg-white border border-gray-200" dangerouslySetInnerHTML={{ __html: link.label }} />
                        ))}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
