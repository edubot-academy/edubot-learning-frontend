import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

const vendorChunkGroups = [
    {
        name: 'router',
        packages: ['react-router', 'react-router-dom'],
    },
    {
        name: 'tiptap',
        packages: ['@tiptap', 'prosemirror'],
    },
    {
        name: 'charts',
        packages: ['chart.js', 'react-chartjs-2'],
    },
    {
        name: 'sentry',
        packages: ['@sentry'],
    },
    {
        name: 'i18n',
        packages: ['i18next', 'react-i18next'],
    },
    {
        name: 'markdown',
        packages: [
            'react-markdown',
            'remark-parse',
            'remark-rehype',
            'unified',
            'micromark',
            'mdast-util',
            'hast-util',
            'property-information',
            'space-separated-tokens',
            'comma-separated-tokens',
            'decode-named-character-reference',
            'html-url-attributes',
        ],
    },
    {
        name: 'icons',
        packages: ['react-icons'],
    },
    {
        name: 'toast',
        packages: ['react-hot-toast', 'goober'],
    },
    {
        name: 'http',
        packages: ['axios', 'dompurify', 'linkifyjs', 'html-parse-stringify'],
    },
];

const getPackageName = (id) => {
    const normalizedId = id.split('\\').join('/');
    const nodeModulesIndex = normalizedId.lastIndexOf('/node_modules/');

    if (nodeModulesIndex === -1) {
        return null;
    }

    const packagePath = normalizedId.slice(nodeModulesIndex + '/node_modules/'.length);
    const segments = packagePath.split('/');

    if (segments[0]?.startsWith('@')) {
        return segments.slice(0, 2).join('/');
    }

    return segments[0] || null;
};

const getVendorChunkName = (id) => {
    const packageName = getPackageName(id);

    if (!packageName) {
        return null;
    }

    for (const group of vendorChunkGroups) {
        if (
            group.packages.some(
                (pkg) =>
                    packageName === pkg ||
                    packageName.startsWith(`${pkg}/`) ||
                    packageName.startsWith(`${pkg}-`)
            )
        ) {
            return group.name;
        }
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
        chunkSizeWarningLimit: 1300,
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (!id.includes('node_modules')) {
                        return undefined;
                    }

                    return getVendorChunkName(id);
                },
            },
        },
    },
});
