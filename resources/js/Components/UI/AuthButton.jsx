import { Loader2 } from 'lucide-react';

/**
 * Premium submit button for Auth pages — red brand, shine sweep, loading spinner.
 */
export default function AuthButton({ children, processing, className = '', ...props }) {
    return (
        <button
            {...props}
            disabled={processing || props.disabled}
            className={`btn-shine w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-semibold text-sm text-white
                bg-red-600 hover:bg-red-700 active:bg-red-800 shadow-sm hover:shadow-glow
                transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:shadow-sm ${className}`}
        >
            {processing && <Loader2 className="w-4 h-4 animate-spin" />}
            {children}
        </button>
    );
}
