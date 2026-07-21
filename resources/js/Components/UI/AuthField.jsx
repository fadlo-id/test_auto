import { forwardRef, useEffect, useRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

/**
 * Premium input used across the Auth pages (Login/Register/Reset…) — icon,
 * password-visibility toggle, and elegant error state. Kept separate from
 * the dashboard's <TextInput> so dashboard forms are untouched.
 */
export default forwardRef(function AuthField(
    { id, label, type = 'text', icon: Icon, error, isFocused, labelRight, className = '', ...props },
    forwardedRef
) {
    const innerRef = useRef(null);
    const inputRef = forwardedRef ?? innerRef;
    const [show, setShow] = useState(false);
    const isPassword = type === 'password';
    const resolvedType = isPassword ? (show ? 'text' : 'password') : type;

    useEffect(() => {
        if (isFocused && inputRef.current) inputRef.current.focus();
    }, []);

    return (
        <div className={className}>
            <div className="flex items-center justify-between mb-1.5">
                <label htmlFor={id} className="text-sm font-semibold text-gray-700">{label}</label>
                {labelRight}
            </div>
            <div className="relative">
                {Icon && (
                    <Icon className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none transition-colors ${error ? 'text-red-400' : 'text-gray-400'}`} />
                )}
                <input
                    {...props}
                    ref={inputRef}
                    id={id}
                    name={props.name ?? id}
                    type={resolvedType}
                    className={`w-full ${Icon ? 'pl-10' : 'pl-4'} ${isPassword ? 'pr-11' : 'pr-4'} py-3 rounded-2xl border text-sm text-gray-900 placeholder-gray-400 bg-white
                        focus:outline-none focus:ring-2 transition-all duration-150
                        ${error
                            ? 'border-red-300 bg-red-50/60 focus:ring-red-400 focus:border-red-400'
                            : 'border-gray-200 hover:border-gray-300 focus:ring-red-500 focus:border-red-500'}`}
                />
                {isPassword && (
                    <button type="button" onClick={() => setShow((s) => !s)} tabIndex={-1}
                        aria-label={show ? 'Hide password' : 'Show password'}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                )}
            </div>
            {error && (
                <p className="flex items-center gap-1.5 text-xs text-red-600 mt-1.5">
                    <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {error}
                </p>
            )}
        </div>
    );
});
