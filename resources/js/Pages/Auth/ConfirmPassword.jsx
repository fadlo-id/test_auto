import { useEffect } from 'react';
import GuestLayout from '@/Layouts/GuestLayout';
import AuthField from '@/Components/UI/AuthField';
import AuthButton from '@/Components/UI/AuthButton';
import { Head, useForm } from '@inertiajs/react';
import { Lock, ShieldCheck } from 'lucide-react';
import { useLocale } from '@/i18n/LocaleContext';

export default function ConfirmPassword() {
    const { t } = useLocale();
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
            <Head title={t('auth.confirmPasswordTitle')} />

            <div className="mb-7 text-center">
                <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
                    <ShieldCheck className="w-7 h-7 text-red-600" strokeWidth={1.75} />
                </div>
                <h1 className="text-2xl font-extrabold text-gray-900 font-display">{t('auth.confirmPasswordTitle')}</h1>
                <p className="mt-1.5 text-sm text-gray-500">{t('auth.confirmPasswordSubtitle')}</p>
            </div>

            <form onSubmit={submit} className="space-y-5">
                <AuthField
                    id="password" type="password" icon={Lock}
                    label={t('auth.password')}
                    value={data.password}
                    isFocused
                    onChange={(e) => setData('password', e.target.value)}
                    error={errors.password}
                />

                <AuthButton type="submit" processing={processing}>
                    {processing ? t('auth.confirming') : t('auth.confirm')}
                </AuthButton>
            </form>
        </GuestLayout>
    );
}
