module.exports = {
    darkMode: 'class',
    content: ['./src/**/*.{js,ts,jsx,tsx}'],
    theme: {
        extend: {
            colors: {
                edubot: {
                    dark: '#122144',
                    orange: '#f17e22',
                    green: '#0ea78b',
                    soft: '#f39647',
                    teal: '#1e605e',
                },
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
        },
    },
    plugins: [
        require('@tailwindcss/typography'),
        function ({ addUtilities, addComponents, theme }) {
            // Define consistent dark mode utilities
            addComponents({
                '.card': {
                    '@apply bg-white dark:bg-gray-900 rounded-lg shadow-lg': {},
                },
                '.input-field': {
                    '@apply w-full rounded-lg border p-2.5 text-sm bg-white dark:bg-gray-800 dark:text-white': {},
                },
                '.text-primary': {
                    '@apply text-gray-900 dark:text-gray-100': {},
                },
                '.text-secondary': {
                    '@apply text-gray-600 dark:text-gray-400': {},
                },
                '.border-light': {
                    '@apply border-gray-200 dark:border-gray-700': {},
                },
                '.bg-surface': {
                    '@apply bg-white dark:bg-gray-800': {},
                },
                '.bg-surface-secondary': {
                    '@apply bg-gray-50 dark:bg-gray-900': {},
                },
            });
        },
    ],
};
