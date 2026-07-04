import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { Bars3Icon, XMarkIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import VerificationBanner from '@/Components/VerificationBanner';

export default function PublicNavbar({ transparent = false }) {
    const { auth } = usePage().props;
    const [open, setOpen] = useState(false);

    const base = transparent
        ? 'bg-transparent text-white border-white/10'
        : 'bg-white text-gray-700 border-gray-100 shadow-sm';

    const logoColor = transparent ? 'text-white' : 'text-orange-600';
    const linkColor = transparent ? 'text-white/80 hover:text-white' : 'text-gray-600 hover:text-orange-600';
    const btnBorder = transparent ? 'border-white/30 text-white hover:bg-white/10' : 'border-gray-200 text-gray-600 hover:bg-gray-50';

    return (
        <header className={`sticky top-0 z-50 border-b transition-all ${base}`}>
            {! transparent && <VerificationBanner />}

            <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
                {/* Logo */}
                <Link href={route('home')} className={`font-bold text-xl shrink-0 ${logoColor}`}>
                    AutoEcoles<span className={transparent ? 'text-orange-300' : 'text-gray-900'}>.ma</span>
                </Link>

                {/* Desktop nav */}
                <nav className="hidden sm:flex items-center gap-1">
                    <Link href={route('search')} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${linkColor}`}>
                        Rechercher
                    </Link>
                    <Link href={route('about')} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${linkColor}`}>
                        À propos
                    </Link>
                </nav>

                {/* Actions */}
                <div className="flex items-center gap-2">
                    {auth?.user ? (
                        <Link href={route('dashboard')}
                            className="inline-flex items-center gap-1.5 text-sm px-4 py-2 bg-orange-600 text-white rounded-xl font-medium hover:bg-orange-700 transition-colors shadow-sm">
                            Mon espace
                            <ArrowRightIcon className="w-3.5 h-3.5" />
                        </Link>
                    ) : (
                        <>
                            <Link href={route('login')}
                                className={`hidden sm:inline-flex text-sm px-3 py-2 rounded-xl font-medium border transition-colors ${btnBorder}`}>
                                Connexion
                            </Link>
                            <Link href={route('register')}
                                className="text-sm px-4 py-2 bg-orange-600 text-white rounded-xl font-medium hover:bg-orange-700 transition-colors shadow-sm">
                                Inscrire mon école
                            </Link>
                        </>
                    )}

                    {/* Mobile menu button */}
                    <button onClick={() => setOpen(!open)} className={`sm:hidden p-2 rounded-lg ${linkColor}`} aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}>
                        {open ? <XMarkIcon className="w-5 h-5" /> : <Bars3Icon className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {/* Mobile menu */}
            {open && (
                <div className={`sm:hidden border-t ${transparent ? 'bg-gray-900/95 border-white/10' : 'bg-white border-gray-100'} px-4 py-3 space-y-1`}>
                    <Link href={route('search')} className={`block px-3 py-2 rounded-lg text-sm font-medium ${linkColor}`} onClick={() => setOpen(false)}>Rechercher</Link>
                    <Link href={route('about')}  className={`block px-3 py-2 rounded-lg text-sm font-medium ${linkColor}`} onClick={() => setOpen(false)}>À propos</Link>
                    {!auth?.user && (
                        <Link href={route('login')} className={`block px-3 py-2 rounded-lg text-sm font-medium ${linkColor}`} onClick={() => setOpen(false)}>Connexion</Link>
                    )}
                </div>
            )}
        </header>
    );
}
