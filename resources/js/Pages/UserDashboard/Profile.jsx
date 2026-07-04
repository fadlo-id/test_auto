import { Head, useForm, usePage } from '@inertiajs/react';
import UserLayout from '@/Layouts/UserLayout';

export default function Profile() {
    const { auth, flash } = usePage().props;
    const user = auth.user;

    const { data: profileData, setData: setProfile, patch: patchProfile, processing: savingProfile, errors: profileErrors, reset: resetProfile } = useForm({
        name:  user.name  ?? '',
        email: user.email ?? '',
        phone: user.phone ?? '',
    });

    const { data: pwData, setData: setPw, put: updatePw, processing: savingPw, errors: pwErrors, reset: resetPw } = useForm({
        current_password:      '',
        password:              '',
        password_confirmation: '',
    });

    const saveProfile = (e) => {
        e.preventDefault();
        patchProfile(route('profile.update'), { preserveScroll: true });
    };

    const savePassword = (e) => {
        e.preventDefault();
        updatePw(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => resetPw(),
        });
    };

    return (
        <UserLayout title="Mon profil">
            <Head title="Mon profil" />

            {flash?.success && <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm border border-green-200">{flash.success}</div>}
            {flash?.status === 'profile-updated' && <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm border border-green-200">Profil mis à jour avec succès.</div>}
            {flash?.status === 'password-updated' && <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm border border-green-200">Mot de passe modifié.</div>}

            <div className="max-w-2xl space-y-6">
                {/* Avatar + name */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold text-2xl">
                            {user.name?.[0]?.toUpperCase()}
                        </div>
                        <div>
                            <p className="font-semibold text-gray-900">{user.name}</p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                            <span className="inline-block mt-1 text-xs bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full font-medium">
                                {user.role === 'admin' ? 'Administrateur' : user.role === 'school_owner' ? 'Propriétaire' : 'Candidat'}
                            </span>
                        </div>
                    </div>

                    {/* Profile form */}
                    <h3 className="font-medium text-gray-900 mb-4">Informations personnelles</h3>
                    <form onSubmit={saveProfile} className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Nom complet *</label>
                            <input value={profileData.name} onChange={e => setProfile('name', e.target.value)} required
                                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500" />
                            {profileErrors.name && <p className="text-xs text-red-500 mt-1">{profileErrors.name}</p>}
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Adresse e-mail *</label>
                            <input type="email" value={profileData.email} onChange={e => setProfile('email', e.target.value)} required
                                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500" />
                            {profileErrors.email && <p className="text-xs text-red-500 mt-1">{profileErrors.email}</p>}
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Téléphone</label>
                            <input type="tel" value={profileData.phone ?? ''} onChange={e => setProfile('phone', e.target.value)}
                                placeholder="+212 6XX XXX XXX"
                                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500" />
                        </div>
                        <button type="submit" disabled={savingProfile}
                            className="px-6 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 disabled:opacity-50">
                            {savingProfile ? 'Enregistrement...' : 'Sauvegarder les modifications'}
                        </button>
                    </form>
                </div>

                {/* Password */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h3 className="font-medium text-gray-900 mb-4">Changer le mot de passe</h3>
                    <form onSubmit={savePassword} className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Mot de passe actuel</label>
                            <input type="password" value={pwData.current_password} onChange={e => setPw('current_password', e.target.value)} required
                                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500" />
                            {pwErrors.current_password && <p className="text-xs text-red-500 mt-1">{pwErrors.current_password}</p>}
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Nouveau mot de passe</label>
                            <input type="password" value={pwData.password} onChange={e => setPw('password', e.target.value)} required
                                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500" />
                            {pwErrors.password && <p className="text-xs text-red-500 mt-1">{pwErrors.password}</p>}
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Confirmer le nouveau mot de passe</label>
                            <input type="password" value={pwData.password_confirmation} onChange={e => setPw('password_confirmation', e.target.value)} required
                                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500" />
                        </div>
                        <button type="submit" disabled={savingPw}
                            className="px-6 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 disabled:opacity-50">
                            {savingPw ? 'Modification...' : 'Modifier le mot de passe'}
                        </button>
                    </form>
                </div>

                {/* Danger zone */}
                <div className="bg-white rounded-xl border border-red-200 p-6">
                    <h3 className="font-medium text-red-700 mb-2">Zone dangereuse</h3>
                    <p className="text-sm text-gray-500 mb-4">La suppression de votre compte est irréversible. Toutes vos données seront supprimées.</p>
                    <a href={route('profile.edit')} className="text-sm text-red-600 hover:underline">
                        Supprimer mon compte →
                    </a>
                </div>
            </div>
        </UserLayout>
    );
}
