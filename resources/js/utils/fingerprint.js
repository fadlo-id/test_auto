/**
 * Lightweight browser fingerprint — combines a canvas rendering hash with a
 * handful of stable navigator/screen properties. Not meant to be forensically
 * unique (that's not the goal); it's one more signal layered with session,
 * cookie, IP and user id to stop a visitor from inflating view/click counts
 * by clearing cookies alone. Computed once per browser and cached in
 * localStorage so it's stable across visits.
 */
const STORAGE_KEY = '_fp_cache';

function computeCanvasHash() {
    try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return '';

        canvas.width = 200;
        canvas.height = 40;
        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.fillStyle = '#f60';
        ctx.fillRect(0, 0, 100, 20);
        ctx.fillStyle = '#069';
        ctx.fillText('autoecoles.ma fp', 2, 2);
        ctx.fillStyle = 'rgba(102, 200, 0, 0.7)';
        ctx.fillText('autoecoles.ma fp', 4, 8);

        return canvas.toDataURL();
    } catch (_) {
        return '';
    }
}

async function sha256(text) {
    try {
        const data = new TextEncoder().encode(text);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        return Array.from(new Uint8Array(hashBuffer))
            .map((b) => b.toString(16).padStart(2, '0'))
            .join('');
    } catch (_) {
        // crypto.subtle unavailable (very old browser / non-HTTPS context) — degrade gracefully.
        let hash = 0;
        for (let i = 0; i < text.length; i++) {
            hash = (hash * 31 + text.charCodeAt(i)) | 0;
        }
        return String(hash >>> 0);
    }
}

async function computeFingerprint() {
    const parts = [
        navigator.userAgent ?? '',
        navigator.language ?? '',
        String(screen.colorDepth ?? ''),
        `${screen.width ?? ''}x${screen.height ?? ''}`,
        String(new Date().getTimezoneOffset()),
        String(navigator.hardwareConcurrency ?? ''),
        computeCanvasHash(),
    ];
    return sha256(parts.join('|'));
}

let cached = null;

/** Returns a stable per-browser fingerprint, computing it once and caching in localStorage. */
export async function getFingerprint() {
    if (cached) return cached;

    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            cached = stored;
            return stored;
        }
    } catch (_) {
        // localStorage unavailable (private mode) — fall through to a fresh computation.
    }

    const fp = await computeFingerprint();

    try {
        localStorage.setItem(STORAGE_KEY, fp);
    } catch (_) {}

    cached = fp;
    return fp;
}
