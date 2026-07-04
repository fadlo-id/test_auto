import { Head, Link } from '@inertiajs/react';

export default function Maintenance() {
    return (
        <>
            <Head>
                <title>Maintenance — AutoEcoles Maroc</title>
                <meta name="robots" content="noindex, nofollow" />
            </Head>
            <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center px-4 text-center">
                <div className="text-6xl mb-6">🔧</div>
                <h1 className="text-3xl font-bold text-white mb-3">Site en maintenance</h1>
                <p className="text-gray-400 max-w-md leading-relaxed mb-8">
                    Nous effectuons des mises à jour pour améliorer votre expérience.
                    Le site sera de nouveau disponible très prochainement.
                </p>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                    Maintenance en cours
                </div>
                <div className="mt-12">
                    <Link href={route('login')} className="text-xs text-gray-600 hover:text-gray-400 underline underline-offset-2">
                        Accès administrateur
                    </Link>
                </div>
            </div>
        </>
    );
}
