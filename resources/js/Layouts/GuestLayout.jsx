import { Link } from '@inertiajs/react';
import { Check } from 'lucide-react';

const STATS = [
    { value: '500+', label: 'Auto-écoles' },
    { value: '10k+', label: 'Candidats'   },
    { value: '30+',  label: 'Villes'      },
];

const FEATURES = [
    { text: 'Avis vérifiés & fiches détaillées'   },
    { text: 'Inscription gratuite pour les élèves' },
    { text: 'Comparaison rapide entre écoles'      },
];

export default function GuestLayout({ children }) {
    return (
        <div className="min-h-screen flex bg-gray-50 dark:bg-zinc-950">
            {/* Left branding panel */}
            <div className="hidden lg:flex lg:w-[46%] xl:w-[44%] flex-col relative overflow-hidden"
                style={{ background: 'linear-gradient(145deg, #c2410c 0%, #ea580c 40%, #f97316 100%)' }}>
                {/* Decorative circles */}
                <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/[0.04] pointer-events-none" />
                <div className="absolute bottom-0 -left-16 w-72 h-72 rounded-full bg-black/[0.06] pointer-events-none" />

                <div className="relative flex flex-col h-full p-10 xl:p-12">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                            <span className="font-extrabold text-orange-600 text-sm">AE</span>
                        </div>
                        <span className="text-white font-bold text-xl tracking-tight">AutoÉcoles.ma</span>
                    </Link>

                    {/* Main copy */}
                    <div className="flex-1 flex flex-col justify-center mt-12">
                        <div className="inline-flex items-center gap-2 bg-white/10 text-white/90 text-xs font-semibold px-3 py-1.5 rounded-full mb-6 w-fit">
                            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                            La référence au Maroc
                        </div>
                        <h2 className="text-3xl xl:text-4xl font-extrabold text-white leading-tight mb-4">
                            Trouvez l'auto-école<br />
                            <span className="text-orange-100">idéale pour vous</span>
                        </h2>
                        <p className="text-orange-100 text-base leading-relaxed mb-8 max-w-sm">
                            Comparez les auto-écoles, lisez les avis vérifiés et inscrivez-vous en quelques clics.
                        </p>

                        {/* Features list */}
                        <div className="space-y-2.5 mb-10">
                            {FEATURES.map((f) => (
                                <div key={f.text} className="flex items-center gap-2.5 text-sm text-orange-50">
                                    <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                                        <Check className="w-3 h-3 text-white" strokeWidth={3} />
                                    </span>
                                    {f.text}
                                </div>
                            ))}
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-3">
                            {STATS.map((s) => (
                                <div key={s.label} className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-4 text-center">
                                    <div className="text-2xl font-extrabold text-white">{s.value}</div>
                                    <div className="text-xs text-orange-100 mt-0.5">{s.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <p className="relative text-orange-200/60 text-xs">
                        © {new Date().getFullYear()} AutoÉcoles.ma — Tous droits réservés
                    </p>
                </div>
            </div>

            {/* Right form panel */}
            <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
                <div className="w-full max-w-[420px]">
                    {/* Mobile logo */}
                    <Link href="/" className="lg:hidden flex items-center gap-2.5 mb-8 justify-center">
                        <div className="w-9 h-9 bg-orange-600 rounded-xl flex items-center justify-center">
                            <span className="font-extrabold text-white text-xs">AE</span>
                        </div>
                        <span className="font-bold text-gray-900 dark:text-zinc-100 text-lg">AutoÉcoles.ma</span>
                    </Link>

                    <div className="card p-7 sm:p-8">
                        {children}
                    </div>

                    <p className="text-center text-xs text-gray-400 dark:text-zinc-500 mt-6">
                        En vous connectant, vous acceptez nos{' '}
                        <Link href="#" className="hover:text-orange-600 dark:hover:text-orange-400 underline underline-offset-2">conditions d'utilisation</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
