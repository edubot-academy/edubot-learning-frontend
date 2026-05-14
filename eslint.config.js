import js from '@eslint/js';
import globals from 'globals';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

export default [
    { ignores: ['dist'] },
    {
        files: ['*.config.js', 'tailwind.config.js'],
        languageOptions: {
            globals: globals.node,
            parserOptions: {
                sourceType: 'module',
            },
        },
    },
    {
        files: ['src/test/setup.js'],
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node,
            },
        },
    },
    {
        files: ['**/*.spec.{js,jsx}'],
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.vitest,
            },
        },
    },
    {
        files: ['**/*.{js,jsx}'],
        languageOptions: {
            ecmaVersion: 2020,
            globals: globals.browser,
            parserOptions: {
                ecmaVersion: 'latest',
                ecmaFeatures: { jsx: true },
                sourceType: 'module',
            },
        },
        settings: { react: { version: '18.3' } },
        plugins: {
            react,
            'react-hooks': reactHooks,
            'react-refresh': reactRefresh,
        },
        rules: {
            ...js.configs.recommended.rules,
            ...react.configs.recommended.rules,
            ...react.configs['jsx-runtime'].rules,
            ...reactHooks.configs.recommended.rules,
            'react/jsx-no-target-blank': 'off',
            // This codebase is plain JS/JSX and does not use PropTypes as its runtime component contract.
            // Keep this disabled until component contracts move to TypeScript or a targeted PropTypes migration.
            'react/prop-types': 'off',
            'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
        },
    },
    {
        files: [
            'src/context/CartContext.jsx',
            'src/context/FavouritesContext.jsx',
            'src/contexts/DarkModeContext.jsx',
        ],
        rules: {
            'react-refresh/only-export-components': 'off',
        },
    },
];
