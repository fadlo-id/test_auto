import { useState } from 'react';
import { router, usePage } from '@inertiajs/react';

export default function VerificationBanner() {
    const { auth, verificationBannerDismissed } = usePage().props;
    const [dismissed, setDismissed] = useState(false);
    const [sent, setSent] = useState(false);

    if (! auth?.user || auth.user.role === 'super_admin' || auth.user.email_verified || verificationBannerDismissed || dismissed) {
        return null;
    }

    const resend = () => {
        router.post(route('verification.send'), {}, {
            preserveScroll: true,
            onSuccess: () => setSent(true),
        });
    };

    const dismiss = () => {
        setDismissed(true);
        router.post(route('verification.banner.dismiss'), {}, { preserveScroll: true, preserveState: true });
    };

    return (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-800 text-sm">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3">
                <span>
                    {sent
                        ? "Email de vérification renvoyé — vérifiez votre boîte de réception."
                        : 'Vérifiez votre adresse email pour débloquer toutes les fonctionnalités (avis, modification d\'email...).'}
                </span>
                <div className="flex items-center gap-3 flex-shrink-0">
                    {! sent && (
                        <button onClick={resend} className="font-semibold underline hover:text-amber-900">
                            Renvoyer l'email
                        </button>
                    )}
                    <button onClick={dismiss} aria-label="Fermer" className="text-amber-500 hover:text-amber-700">
                        ✕
                    </button>
                </div>
            </div>
        </div>
    );
}
