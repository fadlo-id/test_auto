import GuestLayout from '@/Layouts/GuestLayout';
import GoogleSignInButton from '@/Components/GoogleSignInButton';
import { User, School } from 'lucide-react';
import { Head, Link } from '@inertiajs/react';

const ROLES = [
    {
        role: 'user',
        title: 'Je cherche une auto-école',
        description: "Comparez les auto-écoles, lisez les avis et trouvez celle qu'il vous faut.",
        icon: <User className="w-7 h-7" strokeWidth={1.7} />,
    },
    {
        role: 'school_owner',
        title: 'Je possède une auto-école',
        description: 'Publiez votre auto-école, gérez vos avis et développez votre visibilité.',
        icon: <School className="w-7 h-7" strokeWidth={1.7} />,
    },
];

export default function ChooseRole() {
    return (
        <GuestLayout>
            <Head title="Créer un compte" />

            <div className="mb-6 text-center">
                <h1 className="text-2xl font-bold text-gray-900">Créer un compte</h1>
                <p className="mt-1 text-sm text-gray-500">
                    Rejoignez la plateforme des auto-écoles marocaines
                </p>
            </div>

            <div className="space-y-3">
                {ROLES.map(({ role, title, description, icon }) => (
                    <div key={role} className="border-2 border-gray-200 hover:border-orange-300 rounded-xl p-4 transition-colors">
                        <div className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-11 h-11 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
                                {icon}
                            </span>
                            <div className="flex-1 min-w-0">
                                <h2 className="font-semibold text-gray-900">{title}</h2>
                                <p className="text-sm text-gray-500 mt-0.5 mb-3">{description}</p>

                                <div className="space-y-2">
                                    <GoogleSignInButton role={role} />
                                    <Link
                                        href={route('register', { role })}
                                        className="flex items-center justify-center w-full py-2.5 px-4 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold transition-colors"
                                    >
                                        S'inscrire avec un email
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <p className="text-center text-sm text-gray-500 mt-6">
                Déjà inscrit ?{' '}
                <Link href={route('login')} className="text-orange-600 hover:text-orange-700 font-medium">
                    Se connecter
                </Link>
            </p>
        </GuestLayout>
    );
}
