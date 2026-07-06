import { Head, Link } from '@inertiajs/react';
import PublicNavbar from '@/Components/PublicNavbar';
import PublicFooter from '@/Components/PublicFooter';

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
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-3">Candidature envoyée !</h1>
                        <p className="text-gray-600 mb-8">
                            Merci pour votre candidature. Notre équipe va l'examiner dans les meilleurs délais et
                            vous recevrez un email dès qu'une décision aura été prise.
                        </p>
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
