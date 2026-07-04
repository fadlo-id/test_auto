import { useCallback, useEffect, useState } from 'react';

function getInitialTheme() {
    if (typeof window === 'undefined') return false;
    const stored = window.localStorage.getItem('theme');
    if (stored) return stored === 'dark';
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
}

/**
 * Class-based dark mode (Tailwind `darkMode: 'class'`), persisted to
 * localStorage. The `<html>` class is also set synchronously by an inline
 * script in app.blade.php so there's no flash of the wrong theme on load —
 * this hook just keeps React state and the DOM in sync afterwards.
 */
export default function useDarkMode() {
    const [isDark, setIsDark] = useState(getInitialTheme);

    useEffect(() => {
        document.documentElement.classList.toggle('dark', isDark);
        window.localStorage.setItem('theme', isDark ? 'dark' : 'light');
    }, [isDark]);

    const toggle = useCallback(() => setIsDark((v) => !v), []);

    return [isDark, toggle];
}
