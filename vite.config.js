import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        laravel({
            // app.css is also registered standalone so server-rendered Blade-only
            // pages (error pages) can pull in the design system without the JS bundle.
            input: ['resources/js/app.jsx', 'resources/css/app.css'],
            refresh: true,
        }),
        react(),
    ],

    server: {
        // Force IPv4 — on Windows/modern Linux, 'localhost' resolves to ::1 (IPv6)
        // which produces an invalid CSP source. 127.0.0.1 is always safe.
        host: '127.0.0.1',
        port: 5174,
        hmr: {
            host: '127.0.0.1',
            protocol: 'ws',
            port: 5174,
        },
    },
});
