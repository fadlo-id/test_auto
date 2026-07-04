import { usePage } from '@inertiajs/react';
import { useEffect, useState, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon, InformationCircleIcon, XMarkIcon } from '@heroicons/react/24/solid';

const CONFIG = {
    success: {
        bg:   'bg-white dark:bg-zinc-900',
        border: 'border-emerald-200 dark:border-emerald-500/30',
        bar:  'bg-emerald-500',
        icon: (
            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
                <CheckCircleIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </span>
        ),
        title: 'Succès',
        text:  'text-emerald-700 dark:text-emerald-400',
    },
    error: {
        bg:   'bg-white dark:bg-zinc-900',
        border: 'border-red-200 dark:border-red-500/30',
        bar:  'bg-red-500',
        icon: (
            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center">
                <XCircleIcon className="w-5 h-5 text-red-600 dark:text-red-400" />
            </span>
        ),
        title: 'Erreur',
        text:  'text-red-700 dark:text-red-400',
    },
    warning: {
        bg:   'bg-white dark:bg-zinc-900',
        border: 'border-amber-200 dark:border-amber-500/30',
        bar:  'bg-amber-500',
        icon: (
            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center">
                <ExclamationTriangleIcon className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </span>
        ),
        title: 'Attention',
        text:  'text-amber-700 dark:text-amber-400',
    },
    info: {
        bg:   'bg-white dark:bg-zinc-900',
        border: 'border-blue-200 dark:border-blue-500/30',
        bar:  'bg-blue-500',
        icon: (
            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
                <InformationCircleIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </span>
        ),
        title: 'Info',
        text:  'text-blue-700 dark:text-blue-400',
    },
};

const DURATION = 5000;

export default function FlashMessage() {
    const { flash } = usePage().props;
    const [visible, setVisible]       = useState(false);
    const [progress, setProgress]     = useState(100);
    const [currentFlash, setCurrentFlash] = useState(null);
    const timerRef = useRef(null);
    const startRef = useRef(null);

    const dismiss = () => {
        setVisible(false);
        clearInterval(timerRef.current);
    };

    useEffect(() => {
        const msg  = flash?.success || flash?.error || flash?.warning || flash?.info;
        const type = flash?.success ? 'success' : flash?.error ? 'error' : flash?.warning ? 'warning' : 'info';
        if (!msg) return;

        setCurrentFlash({ type, message: msg });
        setVisible(true);
        setProgress(100);
        startRef.current = Date.now();

        clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
            const elapsed = Date.now() - startRef.current;
            const pct = Math.max(0, 100 - (elapsed / DURATION) * 100);
            setProgress(pct);
            if (pct <= 0) {
                setVisible(false);
                clearInterval(timerRef.current);
            }
        }, 50);

        return () => clearInterval(timerRef.current);
    }, [flash?.success, flash?.error, flash?.warning, flash?.info]);

    const cfg = CONFIG[currentFlash?.type] ?? CONFIG.success;

    return (
        <AnimatePresence>
            {visible && currentFlash && (
                <motion.div
                    role="alert"
                    aria-live="assertive"
                    initial={{ opacity: 0, y: 16, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96, transition: { duration: 0.15 } }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    className={`fixed bottom-5 right-5 z-[9999] w-full max-w-sm ${cfg.bg} border ${cfg.border} rounded-2xl shadow-xl dark:shadow-black/40 overflow-hidden`}
                >
                    {/* Progress bar */}
                    <div className={`h-0.5 ${cfg.bar} transition-all ease-linear`} style={{ width: `${progress}%` }} />

                    <div className="flex items-start gap-3 p-4">
                        {cfg.icon}
                        <div className="flex-1 min-w-0 pt-0.5">
                            <p className={`text-sm font-semibold ${cfg.text}`}>{cfg.title}</p>
                            <p className="text-sm text-gray-600 dark:text-zinc-400 mt-0.5 leading-snug">{currentFlash.message}</p>
                        </div>
                        <button
                            onClick={dismiss}
                            aria-label="Fermer"
                            className="flex-shrink-0 mt-0.5 w-6 h-6 rounded-full bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 flex items-center justify-center text-gray-500 dark:text-zinc-400 hover:text-gray-700 dark:hover:text-zinc-200 transition-colors"
                        >
                            <XMarkIcon className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
