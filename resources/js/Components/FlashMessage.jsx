import { usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export default function FlashMessage() {
    const { flash } = usePage().props;
    const [visible, setVisible] = useState(false);
    const [currentFlash, setCurrentFlash] = useState(null);

    useEffect(() => {
        const msg = flash?.success || flash?.error || flash?.warning;
        if (msg) {
            setCurrentFlash({ type: flash?.success ? 'success' : flash?.error ? 'error' : 'warning', message: msg });
            setVisible(true);
            const t = setTimeout(() => setVisible(false), 5000);
            return () => clearTimeout(t);
        }
    }, [flash?.success, flash?.error, flash?.warning]);

    if (!visible || !currentFlash) return null;

    const styles = {
        success: 'bg-green-50 border-green-200 text-green-800',
        error:   'bg-red-50 border-red-200 text-red-800',
        warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    };
    const icons = { success: '✓', error: '✕', warning: '⚠' };

    return (
        <div className={`fixed bottom-4 right-4 z-50 max-w-sm w-full border rounded-xl p-4 shadow-lg flex items-start gap-3 transition-all ${styles[currentFlash.type]}`}>
            <span className="text-lg font-bold flex-shrink-0">{icons[currentFlash.type]}</span>
            <p className="text-sm flex-1">{currentFlash.message}</p>
            <button onClick={() => setVisible(false)} className="text-lg leading-none opacity-60 hover:opacity-100 flex-shrink-0">×</button>
        </div>
    );
}
