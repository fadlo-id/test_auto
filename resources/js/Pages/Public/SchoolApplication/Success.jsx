import { Head, Link } from '@inertiajs/react';
import { CheckCircle2, Mail, Search, Rocket } from 'lucide-react';
import PublicNavbar from '@/Components/PublicNavbar';
import PublicFooter from '@/Components/PublicFooter';

const NEXT_STEPS = [
    { icon: Search, title: 'Vérification', desc: 'Notre équipe contrôle vos informations et documents sous 2 à 5 jours ouvrés.' },
    { icon: Mail, title: 'Décision par email', desc: "Vous recevrez un email à l'adresse fournie, que la candidature soit acceptée ou refusée." },
    { icon: Rocket, title: 'Mise en ligne', desc: 'Une fois approuvée, votre fiche est publiée et visible par les candidats au permis.' },
];

export default function Success() {
    return (
        <>
            <Head>
                <title>Candidature envoyée — AutoEcoles Maroc</title>
            </Head>
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <PublicNavbar />

                <div className="flex-1 flex items-center justify-center px-4 py-16">
                    <div className="max-w-lg w-full bg-white rounded-2xl border border-gray-200 shadow-sm p-10 text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-scale-in">
                            <CheckCircle2 className="w-9 h-9 text-green-600" strokeWidth={1.75} />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-3">Candidature envoyée !</h1>
                        <p className="text-gray-600 mb-8">
                            Merci pour votre candidature. Notre équipe va l'examiner dans les meilleurs délais et
                            vous recevrez un email dès qu'une décision aura été prise.
                        </p>

                        <div className="text-left space-y-4 mb-8 pt-6 border-t border-gray-100">
                            {NEXT_STEPS.map(({ icon: Icon, title, desc }) => (
                                <div key={title} className="flex items-start gap-3">
                                    <span className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0">
                                        <Icon className="w-4 h-4 text-orange-600" />
                                    </span>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900">{title}</p>
                                        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <Link href={route('home')}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-xl font-medium hover:bg-orange-700 transition-colors">
                            Retour à l'accueil
                        </Link>
                    </div>
                </div>

                <PublicFooter />
            </div>
        </>
    );
}
