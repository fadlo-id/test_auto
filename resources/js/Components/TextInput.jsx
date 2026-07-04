import { forwardRef, useEffect, useRef } from 'react';

export default forwardRef(function TextInput({ type = 'text', className = '', isFocused = false, hasError = false, ...props }, ref) {
    const input = ref ? ref : useRef();

    useEffect(() => {
        if (isFocused) {
            input.current.focus();
        }
    }, []);

    return (
        <input
            {...props}
            type={type}
            className={[
                'w-full border rounded-xl px-3.5 py-2.5 text-sm text-gray-900 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-500 bg-white dark:bg-zinc-900',
                'focus:outline-none focus:ring-2 transition-colors',
                hasError
                    ? 'border-red-300 dark:border-red-500/50 bg-red-50 dark:bg-red-500/10 focus:ring-red-400 focus:border-red-400'
                    : 'border-gray-200 dark:border-zinc-700 focus:ring-orange-500 focus:border-orange-500',
                className,
            ].join(' ')}
            ref={input}
        />
    );
});
