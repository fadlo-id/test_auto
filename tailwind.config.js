import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';
import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans:    ['Inter', 'Figtree', ...defaultTheme.fontFamily.sans],
                display: ['Figtree', 'Inter', ...defaultTheme.fontFamily.sans],
            },
            colors: {
                brand: {
                    50:  '#fff7ed',
                    100: '#ffedd5',
                    200: '#fed7aa',
                    300: '#fdba74',
                    400: '#fb923c',
                    500: '#f97316',
                    600: '#ea580c',
                    700: '#c2410c',
                    800: '#9a3412',
                    900: '#7c2d12',
                },
                /* Warm ivory tone — alternated with pure white/gray for a less "generic SaaS" feel */
                cream: {
                    50:  '#fffaf3',
                    100: '#fdf3e7',
                    200: '#faead3',
                },
            },
            animation: {
                'fade-in':    'fadeIn 0.4s ease-out',
                'slide-up':   'slideUp 0.3s ease-out',
                'scale-in':   'scaleIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                'pulse-slow': 'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
                'float-slow': 'floatSlow 7s ease-in-out infinite',
            },
            keyframes: {
                fadeIn:    { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
                slideUp:   { '0%': { opacity: '0', transform: 'translateY(16px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
                scaleIn:   { '0%': { opacity: '0', transform: 'scale(0.9)' }, '100%': { opacity: '1', transform: 'scale(1)' } },
                floatSlow: { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-14px)' } },
            },
            boxShadow: {
                glow:     '0 8px 30px -6px rgba(220, 38, 38, 0.35)',
                elevated: '0 20px 45px -12px rgba(17, 24, 39, 0.18)',
                premium:  '0 2px 8px rgba(17, 24, 39, 0.04), 0 16px 40px -12px rgba(17, 24, 39, 0.12)',
            },
        },
    },

    plugins: [forms, typography],
};
