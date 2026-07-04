import { CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon, InformationCircleIcon, XMarkIcon } from '@heroicons/react/24/solid';

const STYLES = {
    success: { classes: 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-400', Icon: CheckCircleIcon },
    error:   { classes: 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/30 text-red-800 dark:text-red-400', Icon: XCircleIcon },
    warning: { classes: 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/30 text-amber-800 dark:text-amber-400', Icon: ExclamationTriangleIcon },
    info:    { classes: 'bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/30 text-blue-800 dark:text-blue-400', Icon: InformationCircleIcon },
};

export default function Alert({ type = 'success', message, onClose }) {
    const { classes, Icon } = STYLES[type] ?? STYLES.info;

    return (
        <div role="alert" className={`border rounded-xl p-4 flex items-center justify-between gap-3 ${classes}`}>
            <div className="flex items-center gap-3">
                <Icon className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm font-medium">{message}</p>
            </div>
            {onClose && (
                <button
                    onClick={onClose}
                    aria-label="Fermer"
                    className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity"
                >
                    <XMarkIcon className="w-4 h-4" />
                </button>
            )}
        </div>
    );
}
