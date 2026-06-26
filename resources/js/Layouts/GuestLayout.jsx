import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    return (
        <div className="min-h-screen flex bg-gray-50">
            {/* Left panel — branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-orange-600 flex-col justify-between p-12">
                <Link href="/" className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center font-bold text-orange-600 text-lg">
                        AE
                    </div>
                    <span className="text-white font-bold text-xl">AutoÉcole Maroc</span>
                </Link>
                <div className="text-white">
                    <h2 className="text-4xl font-bold leading-tight mb-4">
                        La plateforme des auto-écoles marocaines
                    </h2>
                    <p className="text-orange-100 text-lg">
                        Trouvez l'auto-école idéale, comparez les avis et obtenez votre permis de conduire.
                    </p>
                    <div className="mt-8 grid grid-cols-3 gap-4">
                        {[
                            { label: 'Auto-écoles', value: '500+' },
                            { label: 'Candidats', value: '10k+' },
                            { label: 'Villes', value: '30+' },
                        ].map((stat) => (
                            <div key={stat.label} className="bg-white/10 rounded-xl p-4 text-center">
                                <div className="text-2xl font-bold">{stat.value}</div>
                                <div className="text-sm text-orange-100">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
                <p className="text-orange-200 text-sm">© 2026 AutoÉcole Maroc. Tous droits réservés.</p>
            </div>

            {/* Right panel — form */}
            <div className="flex-1 flex items-center justify-center p-6">
                <div className="w-full max-w-md">
                    {/* Mobile logo */}
                    <Link href="/" className="lg:hidden flex items-center gap-2 mb-8 justify-center">
                        <div className="w-9 h-9 bg-orange-600 rounded-xl flex items-center justify-center font-bold text-white">
                            AE
                        </div>
                        <span className="font-bold text-gray-900">AutoÉcole Maroc</span>
                    </Link>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
