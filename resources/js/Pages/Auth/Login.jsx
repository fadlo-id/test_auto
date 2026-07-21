import { useEffect } from 'react';
import GuestLayout from '@/Layouts/GuestLayout';
import GoogleSignInButton from '@/Components/GoogleSignInButton';
import AuthField from '@/Components/UI/AuthField';
import AuthButton from '@/Components/UI/AuthButton';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { Mail, Lock } from 'lucide-react';
import { useLocale } from '@/i18n/LocaleContext';

export default function Login({ status, canResetPassword }) {
    const { flash } = usePage().props;
    const { t } = useLocale();

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
            <Head title={t('auth.welcomeBack')} />

            <div className="mb-7 text-center">
                <h1 className="text-2xl font-extrabold text-gray-900 font-display">{t('auth.welcomeBack')}</h1>
                <p className="mt-1.5 text-sm text-gray-500">{t('auth.loginSubtitle')}</p>
            </div>

            {status && (
                <div className="mb-5 p-3 rounded-xl bg-emerald-50 text-sm text-emerald-700 border border-emerald-200">
                    {status}
                </div>
            )}

            {flash?.error && (
                <div className="mb-5 p-3 rounded-xl bg-red-50 text-sm text-red-700 border border-red-200">
                    {flash.error}
                </div>
            )}

            <div className="mb-5">
                <GoogleSignInButton />
                <div className="flex items-center gap-3 my-5">
                    <div className="flex-1 h-px bg-gray-200" />
                    <span className="text-xs text-gray-400 font-medium">{t('auth.orByEmail')}</span>
                    <div className="flex-1 h-px bg-gray-200" />
                </div>
            </div>

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

                <AuthField
                    id="password" type="password" icon={Lock}
                    label={t('auth.password')}
                    value={data.password}
                    autoComplete="current-password"
                    onChange={(e) => setData('password', e.target.value)}
                    error={errors.password}
                    labelRight={canResetPassword && (
                        <Link href={route('password.request')} className="text-sm font-medium text-red-600 hover:text-red-700">
                            {t('auth.forgotPassword')}
                        </Link>
                    )}
                />

                <label className="flex items-center gap-2.5 text-sm text-gray-600 cursor-pointer select-none">
                    <input
                        type="checkbox"
                        checked={data.remember}
                        onChange={(e) => setData('remember', e.target.checked)}
                        className="w-4 h-4 rounded-md border-gray-300 text-red-600 focus:ring-red-500 focus:ring-offset-0 transition-colors"
                    />
                    {t('auth.rememberMe')}
                </label>

                <AuthButton type="submit" processing={processing}>
                    {processing ? t('auth.loggingIn') : t('auth.logIn')}
                </AuthButton>

                <p className="text-center text-sm text-gray-500">
                    {t('auth.noAccount')}{' '}
                    <Link href={route('register')} className="text-red-600 hover:text-red-700 font-semibold">
                        {t('auth.createAccount')}
                    </Link>
                </p>
            </form>
        </GuestLayout>
    );
}
