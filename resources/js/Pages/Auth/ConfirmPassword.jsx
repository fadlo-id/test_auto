import { useEffect } from 'react';
import GuestLayout from '@/Layouts/GuestLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, useForm } from '@inertiajs/react';

export default function ConfirmPassword() {
    const { data, setData, post, processing, errors, reset } = useForm({
        password: '',
    });

    useEffect(() => {
        return () => {
            reset('password');
        };
    }, []);

    const submit = (e) => {
        e.preventDefault();

        post(route('password.confirm'));
    };

    return (
        <GuestLayout>
            <Head title="Confirmer le mot de passe" />

            <div className="mb-6 text-center">
                <h1 className="text-2xl font-bold text-gray-900">Confirmez votre mot de passe</h1>
                <p className="mt-1 text-sm text-gray-500">
                    Ceci est une zone sécurisée. Merci de confirmer votre mot de passe avant de continuer.
                </p>
            </div>

            <form onSubmit={submit} className="space-y-4">
                <div>
                    <InputLabel htmlFor="password" value="Mot de passe" />
                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full"
                        isFocused={true}
                        onChange={(e) => setData('password', e.target.value)}
                    />
                    <InputError message={errors.password} className="mt-2" />
                </div>

                <PrimaryButton
                    className="w-full justify-center bg-orange-600 hover:bg-orange-700"
                    disabled={processing}
                >
                    {processing ? 'Vérification…' : 'Confirmer'}
                </PrimaryButton>
            </form>
        </GuestLayout>
    );
}
