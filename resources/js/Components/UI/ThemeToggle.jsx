import { AnimatePresence, motion } from 'framer-motion';
import { MoonIcon, SunIcon } from '@heroicons/react/24/outline';
import useDarkMode from '@/hooks/useDarkMode';

/**
 * Light/dark theme switch. Drop into any topbar — reads/writes the same
 * shared `theme` localStorage key via useDarkMode, so all layouts stay in sync.
 */
export default function ThemeToggle({ className = '' }) {
    const [isDark, toggle] = useDarkMode();

    return (
        <button
            type="button"
            onClick={toggle}
            aria-label={isDark ? 'Passer en mode clair' : 'Passer en mode sombre'}
            aria-pressed={isDark}
            title={isDark ? 'Mode clair' : 'Mode sombre'}
            className={`relative inline-flex items-center justify-center w-9 h-9 rounded-lg text-gray-500 dark:text-zinc-400
                        hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-gray-900 dark:hover:text-zinc-100
                        transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 ${className}`}
        >
            <AnimatePresence mode="wait" initial={false}>
                <motion.span
                    key={isDark ? 'moon' : 'sun'}
                    initial={{ opacity: 0, rotate: -90, scale: 0.6 }}
                    animate={{ opacity: 1, rotate: 0, scale: 1 }}
                    exit={{ opacity: 0, rotate: 90, scale: 0.6 }}
                    transition={{ duration: 0.18 }}
                    className="flex"
                >
                    {isDark ? <MoonIcon className="w-[18px] h-[18px]" /> : <SunIcon className="w-[18px] h-[18px]" />}
                </motion.span>
            </AnimatePresence>
        </button>
    );
}
