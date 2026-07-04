import { Head, useForm, usePage } from '@inertiajs/react';
import SchoolLayout from '@/Layouts/SchoolLayout';

export default function Profile({ user }) {
    const { flash, school } = usePage().props;
    const { data, setData, put, processing, errors } = useForm({
        name:             user?.name ?? '',
        email:            user?.email ?? '',
        phone:            user?.phone ?? '',
        current_password: '',
        password:         '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('school.profile.update'), { preserveScroll: true });
    };

    return (
        <SchoolLayout title="Mon profil" school={school}>
            <Head title="Mon profil" />
            {flash?.success && <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">{flash.success}</div>}

            <div className="max-w-xl">
                <form onSubmit={submit} className="space-y-5">
                    {/* Personal info */}
                    <div className="bg-white rounded-xl border border-gray-200 p-5">
                        <h3 className="font-semibold text-gray-900 mb-4">Informations personnelles</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
                                <input value={data.name} onChange={(e) => setData('name', e.target.value)}
                                    className={`w-full border rounded-lg px-3 py-2 text-sm ${errors.name ? 'border-red-300' : 'border-gray-200'}`} />
                                {errors.name && <p className="text-red-600 text-xs mt-1">{errors.name}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Adresse email</label>
                                <input type="email" value={data.email} onChange={(e) => setData('email', e.target.value)}
                                    className={`w-full border rounded-lg px-3 py-2 text-sm ${errors.email ? 'border-red-300' : 'border-gray-200'}`} />
                                {errors.email && <p className="text-red-600 text-xs mt-1">{errors.email}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                                <input type="tel" value={data.phone} onChange={(e) => setData('phone', e.target.value)}
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                            </div>
                        </div>
                    </div>

                    {/* Password */}
                    <div className="bg-white rounded-xl border border-gray-200 p-5">
                        <h3 className="font-semibold text-gray-900 mb-1">Changer le mot de passe</h3>
                        <p className="text-sm text-gray-500 mb-4">Laissez vide pour garder le mot de passe actuel</p>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe actuel</label>
                                <input type="password" value={data.current_password} onChange={(e) => setData('current_password', e.target.value)}
                                    className={`w-full border rounded-lg px-3 py-2 text-sm ${errors.current_password ? 'border-red-300' : 'border-gray-200'}`} />
                                {errors.current_password && <p className="text-red-600 text-xs mt-1">{errors.current_password}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nouveau mot de passe</label>
                                <input type="password" value={data.password} onChange={(e) => setData('password', e.target.value)}
                                    className={`w-full border rounded-lg px-3 py-2 text-sm ${errors.password ? 'border-red-300' : 'border-gray-200'}`} />
                                {errors.password && <p className="text-red-600 text-xs mt-1">{errors.password}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Confirmer le nouveau mot de passe</label>
                                <input type="password" value={data.password_confirmation} onChange={(e) => setData('password_confirmation', e.target.value)}
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                            </div>
                        </div>
                    </div>

                    <button type="submit" disabled={processing}
                        className="w-full py-2.5 bg-orange-600 text-white rounded-xl font-medium hover:bg-orange-700 disabled:opacity-50 transition-colors">
                        {processing ? 'Enregistrement...' : 'Enregistrer les modifications'}
                    </button>
                </form>

                <div className="mt-4 bg-gray-50 rounded-xl border border-gray-200 p-4 text-sm text-gray-500">
                    <p>Compte créé le : {new Date(user?.created_at).toLocaleDateString('fr')}</p>
                </div>
            </div>
        </SchoolLayout>
    );
}
