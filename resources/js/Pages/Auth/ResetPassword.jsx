import { useEffect } from 'react';
import GuestLayout from '@/Layouts/GuestLayout';
import AuthField from '@/Components/UI/AuthField';
import AuthButton from '@/Components/UI/AuthButton';
import { Head, useForm } from '@inertiajs/react';
import { Mail, Lock } from 'lucide-react';
import { useLocale } from '@/i18n/LocaleContext';

export default function ResetPassword({ token, email }) {
    const { t } = useLocale();
    const { data, setData, post, processing, errors, reset } = useForm({
        token: token,
        email: email,
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
        post(route('password.store'));
    };

    return (
        <GuestLayout>
            <Head title={t('auth.resetPasswordTitle')} />

            <div className="mb-7 text-center">
                <h1 className="text-2xl font-extrabold text-gray-900 font-display">{t('auth.resetPasswordTitle')}</h1>
                <p className="mt-1.5 text-sm text-gray-500">{t('auth.resetPasswordSubtitle')}</p>
            </div>

            <form onSubmit={submit} className="space-y-5">
                <AuthField
                    id="email" type="email" icon={Mail}
                    label={t('auth.email')}
                    value={data.email}
                    autoComplete="username"
                    onChange={(e) => setData('email', e.target.value)}
                    error={errors.email}
                />

                <AuthField
                    id="password" type="password" icon={Lock}
                    label={t('auth.password')}
                    value={data.password}
                    autoComplete="new-password"
                    isFocused
                    onChange={(e) => setData('password', e.target.value)}
                    error={errors.password}
                />

                <AuthField
                    id="password_confirmation" type="password" icon={Lock}
                    label={t('auth.confirmPassword')}
                    value={data.password_confirmation}
                    autoComplete="new-password"
                    onChange={(e) => setData('password_confirmation', e.target.value)}
                    error={errors.password_confirmation}
                />

                <AuthButton type="submit" processing={processing}>
                    {processing ? t('auth.saving') : t('auth.resetPassword')}
                </AuthButton>
            </form>
        </GuestLayout>
    );
}
