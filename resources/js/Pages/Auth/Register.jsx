import { useEffect, useState } from 'react';
import GuestLayout from '@/Layouts/GuestLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        phone: '',
        role: 'user',
        password: '',
        password_confirmation: '',
    });

    useEffect(() => {
        return () => {
            reset('password', 'password_confirmation');
        };
    }, []);

    const submit = (e) => {
        e.preventDefault();
        post(route('register'));
    };

    return (
        <GuestLayout>
            <Head title="Créer un compte" />

            <div className="mb-6 text-center">
                <h1 className="text-2xl font-bold text-gray-900">Créer un compte</h1>
                <p className="mt-1 text-sm text-gray-500">
                    Rejoignez la plateforme des auto-écoles marocaines
                </p>
            </div>

            <form onSubmit={submit} className="space-y-4">
                {/* Account type */}
                <div>
                    <InputLabel value="Type de compte" />
                    <div className="mt-2 grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            onClick={() => setData('role', 'user')}
                            className={`flex flex-col items-center p-3 rounded-lg border-2 transition-colors ${
                                data.role === 'user'
                                    ? 'border-orange-500 bg-orange-50 text-orange-700'
                                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                            }`}
                        >
                            <span className="text-xl">👤</span>
                            <span className="text-sm font-medium mt-1">Candidat</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setData('role', 'school_owner')}
                            className={`flex flex-col items-center p-3 rounded-lg border-2 transition-colors ${
                                data.role === 'school_owner'
                                    ? 'border-orange-500 bg-orange-50 text-orange-700'
                                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                            }`}
                        >
                            <span className="text-xl">🏫</span>
                            <span className="text-sm font-medium mt-1">Auto-école</span>
                        </button>
                    </div>
                </div>

                <div>
                    <InputLabel htmlFor="name" value="Nom complet" />
                    <TextInput
                        id="name"
                        name="name"
                        value={data.name}
                        className="mt-1 block w-full"
                        autoComplete="name"
                        isFocused={true}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                    />
                    <InputError message={errors.name} className="mt-2" />
                </div>

                <div>
                    <InputLabel htmlFor="email" value="Email" />
                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full"
                        autoComplete="username"
                        onChange={(e) => setData('email', e.target.value)}
                        required
                    />
                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div>
                    <InputLabel htmlFor="phone" value="Téléphone" />
                    <TextInput
                        id="phone"
                        type="tel"
                        name="phone"
                        value={data.phone}
                        className="mt-1 block w-full"
                        autoComplete="tel"
                        placeholder="+212 6XX XXX XXX"
                        onChange={(e) => setData('phone', e.target.value)}
                    />
                    <InputError message={errors.phone} className="mt-2" />
                </div>

                <div>
                    <InputLabel htmlFor="password" value="Mot de passe" />
                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full"
                        autoComplete="new-password"
                        onChange={(e) => setData('password', e.target.value)}
                        required
                    />
                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div>
                    <InputLabel htmlFor="password_confirmation" value="Confirmer le mot de passe" />
                    <TextInput
                        id="password_confirmation"
                        type="password"
                        name="password_confirmation"
                        value={data.password_confirmation}
                        className="mt-1 block w-full"
                        autoComplete="new-password"
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                        required
                    />
                    <InputError message={errors.password_confirmation} className="mt-2" />
                </div>

                <div className="flex items-center justify-between pt-2">
                    <Link
                        href={route('login')}
                        className="text-sm text-orange-600 hover:text-orange-700 underline"
                    >
                        Déjà inscrit ?
                    </Link>
                    <PrimaryButton disabled={processing} className="bg-orange-600 hover:bg-orange-700">
                        {processing ? 'Inscription...' : "S'inscrire"}
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}
