import GuestLayout from '@/Layouts/GuestLayout';
import GoogleSignInButton from '@/Components/GoogleSignInButton';
import { User, School } from 'lucide-react';
import { Head, Link } from '@inertiajs/react';
import { useLocale } from '@/i18n/LocaleContext';

export default function ChooseRole() {
    const { t } = useLocale();

    const ROLES = [
        {
            role: 'user',
            title: t('auth.roleUserTitle'),
            description: t('auth.roleUserDesc'),
            icon: <User className="w-7 h-7" strokeWidth={1.7} />,
        },
        {
            role: 'school_owner',
            title: t('auth.roleSchoolTitle'),
            description: t('auth.roleSchoolDesc'),
            icon: <School className="w-7 h-7" strokeWidth={1.7} />,
        },
    ];

    return (
        <GuestLayout>
            <Head title={t('auth.chooseRoleTitle')} />

            <div className="mb-7 text-center">
                <h1 className="text-2xl font-extrabold text-gray-900 font-display">{t('auth.chooseRoleTitle')}</h1>
                <p className="mt-1.5 text-sm text-gray-500">{t('auth.chooseRoleSubtitle')}</p>
            </div>

            <div className="space-y-3">
                {ROLES.map(({ role, title, description, icon }) => (
                    <div key={role} className="border border-gray-200 hover:border-red-300 hover:shadow-md rounded-2xl p-4 transition-all duration-200">
                        <div className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-11 h-11 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                                {icon}
                            </span>
                            <div className="flex-1 min-w-0">
                                <h2 className="font-semibold text-gray-900">{title}</h2>
                                <p className="text-sm text-gray-500 mt-0.5 mb-3">{description}</p>

                                <div className="space-y-2">
                                    <GoogleSignInButton role={role} />
                                    <Link
                                        href={route('register', { role })}
                                        className="btn-shine flex items-center justify-center w-full py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold shadow-sm hover:shadow-glow transition-all"
                                    >
                                        {t('auth.signUpWithEmail')}
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <p className="text-center text-sm text-gray-500 mt-6">
                {t('auth.alreadyRegistered')}{' '}
                <Link href={route('login')} className="text-red-600 hover:text-red-700 font-semibold">
                    {t('auth.logIn')}
                </Link>
            </p>
        </GuestLayout>
    );
}
