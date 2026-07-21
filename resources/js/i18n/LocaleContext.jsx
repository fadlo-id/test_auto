import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { LOCALES, translations } from './translations';

const LocaleContext = createContext(null);
const STORAGE_KEY = 'autoecoles_locale';

function getInitialLocale() {
    if (typeof window === 'undefined') return 'fr';
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored && translations[stored]) return stored;
    } catch { /* localStorage unavailable — fall back silently */ }
    return 'fr';
}

function resolve(dict, key) {
    return key.split('.').reduce((acc, part) => (acc && typeof acc === 'object' ? acc[part] : undefined), dict);
}

export function LocaleProvider({ children }) {
    const [locale, setLocaleState] = useState(getInitialLocale);

    const setLocale = (code) => {
        if (!translations[code]) return;
        setLocaleState(code);
        try { localStorage.setItem(STORAGE_KEY, code); } catch { /* best-effort only */ }
    };

    const t = useMemo(() => (key, fallback) => {
        const value = resolve(translations[locale], key) ?? resolve(translations.fr, key);
        return value ?? fallback ?? key;
    }, [locale]);

    const value = useMemo(() => ({ locale, setLocale, t, locales: LOCALES }), [locale]);

    return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

/** Returns { locale, setLocale, t, locales }. `t('nav.home')` reads a dotted key from the dictionary. */
export function useLocale() {
    const ctx = useContext(LocaleContext);
    if (!ctx) throw new Error('useLocale must be used within a LocaleProvider');
    return ctx;
}

/**
 * Applies `dir`/`lang` on <html> for as long as the calling component tree
 * is mounted, resetting to ltr/fr on unmount. Call this from public-facing
 * layouts only (PublicLayout, GuestLayout) — never from dashboard layouts,
 * so switching to Arabic on the public site can never leak RTL into the
 * (untranslated, LTR-only) admin/school/user dashboards.
 */
export function useLocaleDirection() {
    const { locale, locales } = useLocale();

    useEffect(() => {
        const meta = locales.find((l) => l.code === locale) ?? locales[0];
        document.documentElement.lang = locale;
        document.documentElement.dir = meta.dir;
        return () => {
            document.documentElement.lang = 'fr';
            document.documentElement.dir = 'ltr';
        };
    }, [locale, locales]);
}
