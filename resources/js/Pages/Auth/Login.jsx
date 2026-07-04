import { useEffect } from 'react';
import Checkbox from '@/Components/Checkbox';
import GuestLayout from '@/Layouts/GuestLayout';
import GoogleSignInButton from '@/Components/GoogleSignInButton';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm, usePage } from '@inertiajs/react';

export default function Login({ status, canResetPassword }) {
    const { flash } = usePage().props;

    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    useEffect(() => {
        return () => {
            reset('password');
        };
    }, []);

    const submit = (e) => {
        e.preventDefault();
        post(route('login'));
    };

    return (
        <GuestLayout>
            <Head title="Connexion" />

            <div className="mb-6 text-center">
                <h1 className="text-2xl font-bold text-gray-900">Connexion</h1>
                <p className="mt-1 text-sm text-gray-500">
                    Accédez à votre espace auto-école
                </p>
            </div>

            {status && (
                <div className="mb-4 p-3 rounded-lg bg-green-50 text-sm text-green-700 border border-green-200">
                    {status}
                </div>
            )}

            {flash?.error && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 text-sm text-red-700 border border-red-200">
                    {flash.error}
                </div>
            )}

            <div className="mb-4">
                <GoogleSignInButton />
                <div className="flex items-center gap-3 my-4">
                    <div className="flex-1 h-px bg-gray-200" />
                    <span className="text-xs text-gray-400">ou par email</span>
                    <div className="flex-1 h-px bg-gray-200" />
                </div>
            </div>

            <form onSubmit={submit} className="space-y-4">
                <div>
                    <InputLabel htmlFor="email" value="Adresse email" />
                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full"
                        autoComplete="username"
                        isFocused={true}
                        onChange={(e) => setData('email', e.target.value)}
                        placeholder="votre@email.com"
                    />
                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div>
                    <div className="flex items-center justify-between">
                        <InputLabel htmlFor="password" value="Mot de passe" />
                        {canResetPassword && (
                            <Link
                                href={route('password.request')}
                                className="text-sm text-orange-600 hover:text-orange-700"
                            >
                                Mot de passe oublié ?
                            </Link>
                        )}
                    </div>
                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full"
                        autoComplete="current-password"
                        onChange={(e) => setData('password', e.target.value)}
                    />
                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="flex items-center">
                    <Checkbox
                        name="remember"
                        checked={data.remember}
                        onChange={(e) => setData('remember', e.target.checked)}
                    />
                    <span className="ms-2 text-sm text-gray-600">Se souvenir de moi</span>
                </div>

                <PrimaryButton
                    className="w-full justify-center bg-orange-600 hover:bg-orange-700"
                    disabled={processing}
                >
                    {processing ? 'Connexion...' : 'Se connecter'}
                </PrimaryButton>

                <p className="text-center text-sm text-gray-500">
                    Pas encore de compte ?{' '}
                    <Link href={route('register')} className="text-orange-600 hover:text-orange-700 font-medium">
                        Créer un compte
                    </Link>
                </p>
            </form>
        </GuestLayout>
    );
}
