import { Link } from '@inertiajs/react';

const VARIANTS = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    ghost: 'btn-ghost',
    danger: 'btn-danger',
};

const SIZES = {
    sm: 'btn-sm',
    md: '',
    lg: 'btn-lg',
};

/**
 * Thin wrapper around the .btn-* utility classes (app.css) so every button in
 * the app shares the same shape/weight/transition — renders as <Link> when
 * `href` is passed, otherwise a native <button>.
 */
export default function Button({
    variant = 'primary',
    size = 'md',
    icon: Icon,
    iconPosition = 'left',
    loading = false,
    href,
    className = '',
    children,
    disabled,
    ...props
}) {
    const classes = `${VARIANTS[variant] ?? VARIANTS.primary} ${SIZES[size] ?? ''} ${className}`.trim();

    const content = (
        <>
            {loading ? (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
            ) : (
                Icon && iconPosition === 'left' && <Icon className="w-4 h-4" />
            )}
            {children}
            {!loading && Icon && iconPosition === 'right' && <Icon className="w-4 h-4" />}
        </>
    );

    if (href) {
        return (
            <Link href={href} className={classes} {...props}>
                {content}
            </Link>
        );
    }

    return (
        <button className={classes} disabled={disabled || loading} {...props}>
            {content}
        </button>
    );
}
