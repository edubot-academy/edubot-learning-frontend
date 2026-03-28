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
                    ink: '#0f172a',
                    surface: '#fffaf5',
                    surfaceAlt: '#f8fafc',
                    line: '#e2e8f0',
                    muted: '#64748b',
                    warning: '#f59e0b',
                    danger: '#ef4444',
                },
            },
            boxShadow: {
                'edubot-card': '0 18px 45px -26px rgba(18, 33, 68, 0.32)',
                'edubot-soft': '0 14px 32px -24px rgba(241, 126, 34, 0.35)',
                'edubot-glow': '0 0 0 1px rgba(241, 126, 34, 0.08), 0 24px 48px -28px rgba(241, 126, 34, 0.45)',
                'edubot-hover': '0 28px 64px -30px rgba(18, 33, 68, 0.42)',
                'edubot-hover-soft':
                    '0 24px 56px -32px rgba(241, 126, 34, 0.45), 0 10px 24px -18px rgba(18, 33, 68, 0.22)',
            },
            borderRadius: {
                panel: '1.75rem',
            },
            backgroundImage: {
                'edubot-hero':
                    'linear-gradient(135deg, rgba(18,33,68,1) 0%, rgba(30,96,94,0.96) 55%, rgba(241,126,34,0.88) 100%)',
                'edubot-surface':
                    'radial-gradient(circle at top left, rgba(241,126,34,0.14), transparent 34%), radial-gradient(circle at bottom right, rgba(30,96,94,0.12), transparent 28%)',
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            // Mobile-specific responsive breakpoints
            screens: {
                'xs': '475px',
                'sm': '640px',
                'md': '768px',
                'lg': '1024px',
                'xl': '1280px',
                '2xl': '1536px',
                // Touch-friendly breakpoint for mobile
                'touch': '640px',
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
                // Touch-friendly utilities
                '.touch-manipulation': {
                    '@apply select-none': {},
                },
                '.mobile-only': {
                    '@apply sm:hidden': {},
                },
                '.desktop-only': {
                    '@apply hidden sm:block': {},
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
                '.dashboard-panel': {
                    '@apply relative overflow-hidden rounded-panel border border-edubot-line/80 bg-white/90 shadow-edubot-card backdrop-blur-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-edubot-hover dark:border-slate-700 dark:bg-slate-900/90': {},
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        inset: '0',
                        background:
                            'radial-gradient(circle at top left, rgba(241,126,34,0.14), transparent 34%), radial-gradient(circle at bottom right, rgba(30,96,94,0.10), transparent 28%)',
                        opacity: '0.7',
                        transition: 'opacity 300ms ease',
                        pointerEvents: 'none',
                    },
                    '&:hover::before': {
                        opacity: '1',
                    },
                },
                '.dashboard-panel-muted': {
                    '@apply relative overflow-hidden rounded-panel border border-edubot-line/70 bg-edubot-surfaceAlt/80 shadow-edubot-soft transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-edubot-hover-soft dark:border-slate-800 dark:bg-slate-950/80': {},
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        inset: '0',
                        background:
                            'linear-gradient(135deg, rgba(255,255,255,0.24) 0%, rgba(241,126,34,0.06) 52%, rgba(30,96,94,0.08) 100%)',
                        opacity: '0.9',
                        transition: 'opacity 300ms ease',
                        pointerEvents: 'none',
                    },
                    '&:hover::before': {
                        opacity: '1',
                    },
                },
                '.dashboard-pill': {
                    '@apply inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white/80 backdrop-blur-sm transition duration-300 hover:scale-[1.03] hover:bg-white/15': {},
                },
                '.dashboard-field': {
                    '@apply w-full rounded-2xl border border-edubot-line bg-white px-4 py-3 text-sm text-edubot-ink outline-none transition-all duration-300 ease-out focus:-translate-y-0.5 focus:border-edubot-orange focus:ring-4 focus:ring-edubot-orange/10 hover:border-edubot-orange/50 hover:shadow-edubot-soft dark:border-slate-700 dark:bg-slate-900 dark:text-white': {},
                },
                '.dashboard-field-icon': {
                    '@apply pl-11': {},
                },
                '.dashboard-select': {
                    '@apply w-full appearance-none rounded-2xl border border-edubot-line bg-white px-4 py-3 pr-11 text-sm text-edubot-ink outline-none transition-all duration-300 ease-out focus:-translate-y-0.5 focus:border-edubot-orange focus:ring-4 focus:ring-edubot-orange/10 hover:border-edubot-orange/50 hover:shadow-edubot-soft dark:border-slate-700 dark:bg-slate-900 dark:text-white': {},
                    backgroundImage:
                        "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16' fill='none'%3E%3Cpath d='M4 6L8 10L12 6' stroke='%2364758b' stroke-width='1.75' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\")",
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 1rem center',
                    backgroundSize: '1rem 1rem',
                    cursor: 'pointer',
                },
                '.dashboard-button-primary': {
                    '@apply inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-edubot-orange to-edubot-soft px-4 py-2.5 text-sm font-semibold text-white shadow-edubot-soft transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.01] hover:shadow-edubot-hover-soft active:translate-y-0 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60': {},
                },
                '.dashboard-button-primary-lg': {
                    '@apply dashboard-button-primary min-h-[48px] px-5 py-3': {},
                },
                '.dashboard-button-secondary': {
                    '@apply rounded-2xl border border-edubot-line bg-white/70 px-4 py-2.5 text-sm font-medium text-edubot-ink shadow-sm transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-edubot-orange hover:text-edubot-orange hover:shadow-edubot-soft disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200': {},
                },
            });
        },
    ],
};
