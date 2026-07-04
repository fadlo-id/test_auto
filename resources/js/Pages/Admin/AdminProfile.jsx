import AdminLayout from '@/Layouts/AdminLayout';
import { useForm } from '@inertiajs/react';
import { User, Mail, Phone, Shield, Calendar, Clock } from 'lucide-react';

const ROLE_LABELS = { super_admin: 'Super Admin', admin: 'Administrateur' };
const ROLE_COLORS = { super_admin: 'bg-purple-100 text-purple-700', admin: 'bg-blue-100 text-blue-700' };

export default function AdminProfile({ user }) {
    const form = useForm({
        name:  user.name ?? '',
        phone: user.phone ?? '',
        notes: user.notes ?? '',
    });

    return (
        <AdminLayout title="Mon profil">
            <div className="max-w-2xl mx-auto space-y-6">
                {/* Avatar card */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 flex items-center gap-5">
                    <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-2xl flex-shrink-0">
                        {user.name?.[0]?.toUpperCase()}
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
                        <p className="text-sm text-gray-500">{user.email}</p>
                        <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${ROLE_COLORS[user.role] ?? 'bg-gray-100 text-gray-600'}`}>
                            {ROLE_LABELS[user.role] ?? user.role}
                        </span>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-gray-400" />
                        <div>
                            <p className="text-xs text-gray-500">Membre depuis</p>
                            <p className="font-semibold text-gray-900 text-sm">{user.created_at ? new Date(user.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}</p>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
                        <Clock className="w-5 h-5 text-gray-400" />
                        <div>
                            <p className="text-xs text-gray-500">Dernière connexion</p>
                            <p className="font-semibold text-gray-900 text-sm">{user.last_login_at ? new Date(user.last_login_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}</p>
                        </div>
                    </div>
                </div>

                {/* Edit form */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h3 className="font-semibold text-gray-900 mb-5">Modifier le profil</h3>
                    <form onSubmit={e => { e.preventDefault(); form.patch(route('admin.profile'), { preserveScroll: true }); }}
                        className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input type="text" value={form.data.name} onChange={e => form.setData('name', e.target.value)}
                                    className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300" />
                            </div>
                            {form.errors.name && <p className="text-xs text-red-500 mt-1">{form.errors.name}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <div className="relative opacity-60">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input type="email" value={user.email} readOnly
                                    className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 cursor-not-allowed" />
                            </div>
                            <p className="text-xs text-gray-400 mt-1">L'email ne peut pas être modifié ici.</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input type="text" value={form.data.phone} onChange={e => form.setData('phone', e.target.value)}
                                    className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                                    placeholder="+212 6XX XXX XXX" />
                            </div>
                        </div>

                        <div className="pt-2">
                            <button type="submit" disabled={form.processing}
                                className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 disabled:opacity-60 text-white text-sm font-semibold rounded-lg transition-colors">
                                {form.processing ? 'Enregistrement…' : 'Enregistrer les modifications'}
                            </button>
                        </div>

                        {form.recentlySuccessful && (
                            <p className="text-sm text-emerald-600 font-medium">Profil mis à jour avec succès.</p>
                        )}
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
}
