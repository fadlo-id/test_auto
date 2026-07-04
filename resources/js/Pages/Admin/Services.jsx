import { Head, router, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function Services({ services, filters = {} }) {
    const { flash } = usePage().props;
    const destroy = (id) => { if (confirm('Supprimer ce service ?')) router.delete(route('admin.services.destroy', id)); };

    return (
        <AdminLayout title="Services">
            <Head title="Services - Admin" />
            {flash?.success && <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">{flash.success}</div>}

            <div className="bg-white rounded-xl border border-gray-200 p-4 mb-5">
                <input defaultValue={filters.search} placeholder="Rechercher un service..." onKeyDown={(e) => e.key === 'Enter' && router.get(route('admin.services.index'), { search: e.target.value })}
                    className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm w-full max-w-sm" />
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>{['Service', 'Auto-école', 'Ville', 'Prix', 'Actif', 'Actions'].map((h) => <th key={h} className="text-left px-4 py-3 font-medium text-gray-600">{h}</th>)}</tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {services?.data?.length === 0 && <tr><td colSpan={6} className="text-center py-10 text-gray-400">Aucun service</td></tr>}
                        {services?.data?.map((s) => (
                            <tr key={s.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3 font-medium">{s.name}</td>
                                <td className="px-4 py-3 text-gray-600">{s.auto_school?.name ?? '-'}</td>
                                <td className="px-4 py-3 text-gray-500">{s.auto_school?.city ?? '-'}</td>
                                <td className="px-4 py-3">{s.price ? `${Number(s.price).toLocaleString()} MAD` : '-'}</td>
                                <td className="px-4 py-3">
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${s.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                        {s.is_active ? 'Oui' : 'Non'}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    <button onClick={() => destroy(s.id)} className="text-xs text-red-600 hover:underline">Suppr.</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {services?.last_page > 1 && (
                    <div className="p-4 flex gap-2 border-t border-gray-100">
                        {services.links?.map((link, i) => (
                            <button key={i} disabled={!link.url} onClick={() => link.url && router.get(link.url)}
                                className={`px-3 py-1 rounded text-xs ${link.active ? 'bg-orange-600 text-white' : 'border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40'}`}
                                dangerouslySetInnerHTML={{ __html: link.label }} />
                        ))}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
