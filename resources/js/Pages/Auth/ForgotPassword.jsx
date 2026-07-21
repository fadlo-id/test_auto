import GuestLayout from '@/Layouts/GuestLayout';
import AuthField from '@/Components/UI/AuthField';
import AuthButton from '@/Components/UI/AuthButton';
import { Head, Link, useForm } from '@inertiajs/react';
import { Mail } from 'lucide-react';
import { useLocale } from '@/i18n/LocaleContext';

export default function ForgotPassword({ status }) {
    const { t } = useLocale();
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('password.email'));
    };

    return (
        <GuestLayout>
            <Head title={t('auth.forgotPasswordTitle')} />

            <div className="mb-7 text-center">
                <h1 className="text-2xl font-extrabold text-gray-900 font-display">{t('auth.forgotPasswordTitle')}</h1>
                <p className="mt-1.5 text-sm text-gray-500">{t('auth.forgotPasswordSubtitle')}</p>
            </div>

            {status && (
                <div className="mb-5 p-3 rounded-xl bg-emerald-50 text-sm text-emerald-700 border border-emerald-200">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="space-y-5">
                <AuthField
                    id="email" type="email" icon={Mail}
                    label={t('auth.email')}
                    value={data.email}
                    autoComplete="username"
                    isFocused
                    placeholder={t('auth.emailPlaceholder')}
                    onChange={(e) => setData('email', e.target.value)}
                    error={errors.email}
                />

                <AuthButton type="submit" processing={processing}>
                    {processing ? t('auth.sending') : t('auth.sendResetLink')}
                </AuthButton>

                <p className="text-center text-sm text-gray-500">
                    <Link href={route('login')} className="text-red-600 hover:text-red-700 font-semibold">
                        {t('auth.backToLogin')}
                    </Link>
                </p>
            </form>
        </GuestLayout>
    );
}
