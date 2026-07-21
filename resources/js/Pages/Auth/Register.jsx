import { useEffect } from 'react';
import GuestLayout from '@/Layouts/GuestLayout';
import GoogleSignInButton from '@/Components/GoogleSignInButton';
import AuthField from '@/Components/UI/AuthField';
import AuthButton from '@/Components/UI/AuthButton';
import { Head, Link, useForm } from '@inertiajs/react';
import { User, Mail, Phone, Lock } from 'lucide-react';
import { useLocale } from '@/i18n/LocaleContext';

export default function Register({ role }) {
    const { t } = useLocale();
    const ROLE_LABELS = { user: t('auth.roleUser'), school_owner: t('auth.roleSchoolOwner') };

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        phone: '',
        role,
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
            <Head title={t('auth.createAccountTitle')} />

            <div className="mb-7 text-center">
                <h1 className="text-2xl font-extrabold text-gray-900 font-display">
                    {t('auth.createAccountTitle')}{ROLE_LABELS[role] ? ` — ${ROLE_LABELS[role]}` : ''}
                </h1>
                <p className="mt-1.5 text-sm text-gray-500">
                    {t('auth.registerSubtitle')}{' '}
                    <Link href={route('register')} className="text-red-600 hover:text-red-700 underline underline-offset-2">
                        {t('auth.changeAccountType')}
                    </Link>
                </p>
            </div>

            <div className="mb-5">
                <GoogleSignInButton role={role} />
                <div className="flex items-center gap-3 my-5">
                    <div className="flex-1 h-px bg-gray-200" />
                    <span className="text-xs text-gray-400 font-medium">{t('auth.orByEmail')}</span>
                    <div className="flex-1 h-px bg-gray-200" />
                </div>
            </div>

            <form onSubmit={submit} className="space-y-5">
                <AuthField
                    id="name" icon={User}
                    label={t('auth.name')}
                    value={data.name}
                    autoComplete="name"
                    isFocused
                    required
                    onChange={(e) => setData('name', e.target.value)}
                    error={errors.name}
                />

                <AuthField
                    id="email" type="email" icon={Mail}
                    label={t('auth.email')}
                    value={data.email}
                    autoComplete="username"
                    required
                    onChange={(e) => setData('email', e.target.value)}
                    error={errors.email}
                />

                <AuthField
                    id="phone" type="tel" icon={Phone}
                    label={t('auth.phone')}
                    value={data.phone}
                    autoComplete="tel"
                    placeholder={t('auth.phonePlaceholder')}
                    onChange={(e) => setData('phone', e.target.value)}
                    error={errors.phone}
                />

                <AuthField
                    id="password" type="password" icon={Lock}
                    label={t('auth.password')}
                    value={data.password}
                    autoComplete="new-password"
                    required
                    onChange={(e) => setData('password', e.target.value)}
                    error={errors.password}
                />

                <AuthField
                    id="password_confirmation" type="password" icon={Lock}
                    label={t('auth.confirmPassword')}
                    value={data.password_confirmation}
                    autoComplete="new-password"
                    required
                    onChange={(e) => setData('password_confirmation', e.target.value)}
                    error={errors.password_confirmation}
                />

                <AuthButton type="submit" processing={processing}>
                    {processing ? t('auth.registering') : t('auth.createAccount')}
                </AuthButton>

                <p className="text-center text-sm text-gray-500">
                    {t('auth.alreadyRegistered')}{' '}
                    <Link href={route('login')} className="text-red-600 hover:text-red-700 font-semibold">
                        {t('auth.logIn')}
                    </Link>
                </p>
            </form>
        </GuestLayout>
    );
}
