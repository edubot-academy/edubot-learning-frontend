/**
 * Design System Constants for Attendance Components
 * Provides consistent styling, spacing, and visual patterns across all attendance UI
 */

// Color palette
export const COLORS = {
  // Primary colors
  primary: {
    50: '#fff7ed',
    100: '#ffedd5',
    500: '#f97316',
    600: '#ea580c',
    700: '#c2410c',
    900: '#7c2d12',
  },

  // Status colors
  status: {
    present: {
      light: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      dark: 'dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-500/30',
      hover: 'hover:bg-emerald-50 dark:hover:bg-emerald-900/20',
    },
    late: {
      light: 'bg-amber-100 text-amber-700 border-amber-200',
      dark: 'dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-500/30',
      hover: 'hover:bg-amber-50 dark:hover:bg-amber-900/20',
    },
    absent: {
      light: 'bg-red-100 text-red-700 border-red-200',
      dark: 'dark:bg-red-900/40 dark:text-red-300 dark:border-red-500/30',
      hover: 'hover:bg-red-50 dark:hover:bg-red-900/20',
    },
    excused: {
      light: 'bg-blue-100 text-blue-700 border-blue-200',
      dark: 'dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-500/30',
      hover: 'hover:bg-blue-50 dark:hover:bg-blue-900/20',
    },
    notScheduled: {
      light: 'bg-gray-100 text-gray-500 border-gray-200',
      dark: 'dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700',
      hover: 'hover:bg-gray-50 dark:hover:bg-gray-900/20',
    },
  },

  // UI colors
  ui: {
    background: {
      primary: 'bg-white dark:bg-gray-900',
      secondary: 'bg-gray-50 dark:bg-gray-800',
      muted: 'bg-gray-100 dark:bg-gray-700',
    },
    border: {
      primary: 'border-gray-200 dark:border-gray-700',
      secondary: 'border-gray-100 dark:border-gray-800',
      accent: 'border-orange-200 dark:border-orange-500/30',
    },
    text: {
      primary: 'text-gray-900 dark:text-white',
      secondary: 'text-gray-600 dark:text-gray-400',
      muted: 'text-gray-500 dark:text-gray-400',
      accent: 'text-orange-600 dark:text-orange-500',
    },
  },
};

// Spacing scale
export const SPACING = {
  0: '0',
  1: '0.25rem', // 4px
  2: '0.5rem',  // 8px
  3: '0.75rem', // 12px
  4: '1rem',    // 16px
  5: '1.25rem', // 20px
  6: '1.5rem',  // 24px
  8: '2rem',    // 32px
  10: '2.5rem', // 40px
  12: '3rem',   // 48px
  16: '4rem',   // 64px
  20: '5rem',   // 80px
};

// Typography scale
export const TYPOGRAPHY = {
  fontSize: {
    xs: 'text-xs',
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl',
    '3xl': 'text-3xl',
  },
  fontWeight: {
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
  },
  lineHeight: {
    tight: 'leading-tight',
    normal: 'leading-normal',
    relaxed: 'leading-relaxed',
  },
  tracking: {
    tight: 'tracking-tight',
    normal: 'tracking-normal',
    wide: 'tracking-wide',
    wider: 'tracking-wider',
  },
};

// Border radius
export const BORDER_RADIUS = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
  full: 'rounded-full',
};

// Shadows
export const SHADOWS = {
  none: 'shadow-none',
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
  xl: 'shadow-xl',
  inner: 'shadow-inner',
};

// Transitions
export const TRANSITIONS = {
  duration: {
    fast: 'duration-150',
    normal: 'duration-200',
    slow: 'duration-300',
    slower: 'duration-500',
  },
  easing: {
    linear: 'ease-linear',
    in: 'ease-in',
    out: 'ease-out',
    'in-out': 'ease-in-out',
  },
  all: 'transition-all',
  colors: 'transition-colors',
  opacity: 'transition-opacity',
  transform: 'transition-transform',
};

// Z-index scale
export const Z_INDEX = {
  base: 'z-0',
  above: 'z-10',
  sticky: 'z-20',
  dropdown: 'z-30',
  modal: 'z-40',
  toast: 'z-50',
  maximum: 'z-999',
};

// Component-specific styles
export const COMPONENT_STYLES = {
  // Table styles
  table: {
    container: 'w-full overflow-x-auto overflow-y-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900',
    header: 'sticky top-0 z-10 bg-gray-50 dark:bg-gray-900',
    headerCell: 'px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400',
    row: 'hover:bg-gray-50 dark:hover:bg-gray-800',
    cell: 'px-3 py-3 text-center',
    stickyLeft: 'sticky left-0 z-10 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700',
    stickyRight: 'sticky right-0 z-10 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700',
  },

  // Button styles
  button: {
    primary: 'dashboard-button-primary bg-orange-500 text-white hover:bg-orange-600 focus:ring-orange-500',
    secondary: 'dashboard-button-secondary border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800',
    danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500',
    success: 'bg-green-500 text-white hover:bg-green-600 focus:ring-green-500',
    icon: 'p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800',
  },

  // Input styles
  input: {
    base: 'dashboard-field border-gray-300 text-gray-900 placeholder-gray-500 focus:border-orange-500 focus:ring-orange-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400',
    withIcon: 'dashboard-field-icon pl-10',
    error: 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500',
  },

  // Card styles
  card: {
    base: 'dashboard-panel bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4',
    muted: 'dashboard-panel-muted bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4',
    elevated: 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-6',
  },

  // Badge styles
  badge: {
    primary: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300',
    success: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
    warning: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
    danger: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
  },

  // Loading states
  loading: {
    overlay: 'fixed inset-0 bg-white/80 dark:bg-gray-900/80 flex items-center justify-center z-50',
    spinner: 'animate-spin h-8 w-8 text-orange-500',
    skeleton: 'animate-pulse bg-gray-200 dark:bg-gray-700 rounded',
  },

  // Empty states
  emptyState: {
    container: 'text-center py-12',
    icon: 'mx-auto h-12 w-12 text-gray-400',
    title: 'mt-2 text-lg font-medium text-gray-900 dark:text-white',
    subtitle: 'mt-1 text-sm text-gray-500 dark:text-gray-400',
  },

  // Filter bar
  filterBar: {
    container: 'DashboardFilterBar flex flex-wrap items-center gap-4',
    group: 'flex items-center gap-2',
    label: 'text-sm font-medium text-gray-700 dark:text-gray-300',
    input: 'dashboard-field h-10 min-w-0',
    select: 'dashboard-select h-10 min-w-0',
  },

  // Status indicators
  status: {
    cell: 'inline-flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-medium transition-all duration-200',
    selected: 'bg-orange-50 dark:bg-orange-900/20 border-orange-300 dark:border-orange-600',
    updating: 'opacity-50',
    disabled: 'cursor-not-allowed grayscale',
  },
};

// Responsive breakpoints
export const BREAKPOINTS = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

// Layout utilities
export const LAYOUT = {
  container: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
  section: 'space-y-6',
  grid: {
    '2': 'grid grid-cols-2 gap-4',
    '3': 'grid grid-cols-3 gap-4',
    '4': 'grid grid-cols-4 gap-4',
    '5': 'grid grid-cols-5 gap-4',
    responsive: 'grid gap-4 lg:grid-cols-5',
  },
  flex: {
    center: 'flex items-center justify-center',
    between: 'flex items-center justify-between',
    start: 'flex items-center justify-start',
    end: 'flex items-center justify-end',
    col: 'flex flex-col',
    wrap: 'flex flex-wrap',
  },
};

// Animation utilities
export const ANIMATIONS = {
  fadeIn: 'animate-fade-in',
  slideUp: 'animate-slide-up',
  slideDown: 'animate-slide-down',
  scale: 'animate-scale',
  spin: 'animate-spin',
  pulse: 'animate-pulse',
  bounce: 'animate-bounce',
};

// Utility functions for dynamic styling
export const getStatusClasses = (status, variant = 'cell') => {
  const statusConfig = COLORS.status[status] || COLORS.status.notScheduled;
  
  if (variant === 'cell') {
    return `${COMPONENT_STYLES.status.cell} ${statusConfig.light} ${statusConfig.dark} ${statusConfig.hover}`;
  }
  
  return statusConfig.light;
};

export const getButtonClasses = (variant = 'primary', size = 'md') => {
  const baseClass = COMPONENT_STYLES.button[variant] || COMPONENT_STYLES.button.primary;
  const sizeClass = size === 'sm' ? 'px-3 py-1.5 text-xs' : size === 'lg' ? 'px-6 py-3 text-base' : 'px-4 py-2 text-sm';
  
  return `${baseClass} ${sizeClass} font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed`;
};

export const getInputClasses = (hasError = false, hasIcon = false) => {
  const baseClass = COMPONENT_STYLES.input.base;
  const errorClass = hasError ? COMPONENT_STYLES.input.error : '';
  const iconClass = hasIcon ? COMPONENT_STYLES.input.withIcon : '';
  
  return `${baseClass} ${errorClass} ${iconClass}`;
};

export default {
  COLORS,
  SPACING,
  TYPOGRAPHY,
  BORDER_RADIUS,
  SHADOWS,
  TRANSITIONS,
  Z_INDEX,
  COMPONENT_STYLES,
  BREAKPOINTS,
  LAYOUT,
  ANIMATIONS,
  getStatusClasses,
  getButtonClasses,
  getInputClasses,
};
