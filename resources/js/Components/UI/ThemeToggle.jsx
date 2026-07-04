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
            <span className="relative inline-flex w-[18px] h-[18px]">
                <SunIcon
                    className={`absolute inset-0 w-[18px] h-[18px] transition-all duration-200 ease-out
                                ${isDark ? 'opacity-0 -rotate-90 scale-50' : 'opacity-100 rotate-0 scale-100'}`}
                />
                <MoonIcon
                    className={`absolute inset-0 w-[18px] h-[18px] transition-all duration-200 ease-out
                                ${isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 rotate-90 scale-50'}`}
                />
            </span>
        </button>
    );
}
