import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

const vendorChunk = (id) => {
    const normalizedId = id.replace(/\\/g, '/');

    if (normalizedId.includes('/src/i18n/locales/en')) {
        return 'app-i18n-en';
    }

    if (normalizedId.includes('/src/i18n/locales/ky')) {
        return 'app-i18n-ky';
    }

    if (normalizedId.includes('/src/i18n/locales/ru')) {
        return 'app-i18n-ru';
    }

    if (normalizedId.includes('/src/i18n/')) {
        return 'app-i18n-core';
    }

    if (!id.includes('node_modules')) return undefined;

    if (/[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/.test(id)) {
        return 'react-vendor';
    }

    if (id.includes('react-icons')) {
        return 'icons';
    }

    if (id.includes('i18next') || id.includes('react-i18next')) {
        return 'i18n-vendor';
    }

    if (id.includes('chart.js') || id.includes('react-chartjs-2')) {
        return 'charts';
    }

    if (id.includes('hls.js') || /[\\/]node_modules[\\/]hls[\\/]/.test(id)) {
        return 'media';
    }

    if (id.includes('dompurify')) {
        return 'sanitizer';
    }

    return 'vendor';
};

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@app': fileURLToPath(new URL('./src/app', import.meta.url)),
            '@shared': fileURLToPath(new URL('./src/shared', import.meta.url)),
            '@features': fileURLToPath(new URL('./src/features', import.meta.url)),
            '@components': fileURLToPath(new URL('./src/components', import.meta.url)),
            '@shared-ui': fileURLToPath(new URL('./src/shared/ui', import.meta.url)),
            '@pages': fileURLToPath(new URL('./src/pages', import.meta.url)),
            '@utils': fileURLToPath(new URL('./src/utils', import.meta.url)),
            '@assets': fileURLToPath(new URL('./src/assets', import.meta.url)),
            '@services': fileURLToPath(new URL('./src/services', import.meta.url)),
            '@hooks': fileURLToPath(new URL('./src/hooks', import.meta.url)),
        },
    },
    server: {
        proxy: {
            '/sitemap.xml': 'http://localhost:3000',
        },
    },
    build: {
        rollupOptions: {
            output: {
                manualChunks: vendorChunk,
            },
        },
    },
});
