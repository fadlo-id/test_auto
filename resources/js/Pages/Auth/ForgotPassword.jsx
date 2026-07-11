import GuestLayout from '@/Layouts/GuestLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('password.email'));
    };

    return (
        <GuestLayout>
            <Head title="Mot de passe oublié" />

            <div className="mb-6 text-center">
                <h1 className="text-2xl font-bold text-gray-900">Mot de passe oublié ?</h1>
                <p className="mt-1 text-sm text-gray-500">
                    Indiquez votre adresse email et nous vous enverrons un lien pour en choisir un nouveau.
                </p>
            </div>

            {status && (
                <div className="mb-4 p-3 rounded-lg bg-green-50 text-sm text-green-700 border border-green-200">
                    {status}
                </div>
            )}

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

                <PrimaryButton
                    className="w-full justify-center bg-orange-600 hover:bg-orange-700"
                    disabled={processing}
                >
                    {processing ? 'Envoi en cours…' : 'Envoyer le lien de réinitialisation'}
                </PrimaryButton>

                <p className="text-center text-sm text-gray-500">
                    <Link href={route('login')} className="text-orange-600 hover:text-orange-700 font-medium">
                        Retour à la connexion
                    </Link>
                </p>
            </form>
        </GuestLayout>
    );
}
