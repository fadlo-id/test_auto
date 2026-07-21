import GuestLayout from '@/Layouts/GuestLayout';
import AuthButton from '@/Components/UI/AuthButton';
import { Head, Link, useForm } from '@inertiajs/react';
import { MailCheck } from 'lucide-react';
import { useLocale } from '@/i18n/LocaleContext';

export default function VerifyEmail({ status }) {
    const { t } = useLocale();
    const { post, processing } = useForm({});

    const submit = (e) => {
        e.preventDefault();
        post(route('verification.send'));
    };

    return (
        <GuestLayout>
            <Head title={t('auth.verifyEmailTitle')} />

            <div className="mb-6 text-center">
                <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
                    <MailCheck className="w-7 h-7 text-red-600" strokeWidth={1.75} />
                </div>
                <h1 className="text-2xl font-extrabold text-gray-900 font-display mb-2">{t('auth.verifyEmailTitle')}</h1>
                <p className="text-sm text-gray-500 leading-relaxed">{t('auth.verifyEmailSubtitle')}</p>
            </div>

            {status === 'verification-link-sent' && (
                <div className="mb-5 p-3 rounded-xl bg-emerald-50 text-sm text-emerald-700 border border-emerald-200 text-center">
                    {t('auth.verificationSent')}
                </div>
            )}

            <form onSubmit={submit} className="space-y-3">
                <AuthButton type="submit" processing={processing}>
                    {processing ? t('auth.sending') : t('auth.resendEmail')}
                </AuthButton>

                <Link
                    href={route('logout')}
                    method="post"
                    as="button"
                    className="w-full text-center block py-2 text-sm text-gray-500 hover:text-red-600 transition-colors"
                >
                    {t('nav.logout')}
                </Link>
            </form>
        </GuestLayout>
    );
}
