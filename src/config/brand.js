/**
 * EduBot Brand Configuration System
 * Centralized brand tokens for consistent design implementation
 */

export const BRAND_COLORS = {
  // Primary Brand Colors
  primary: {
    orange: '#f17e22',
    soft: '#f39647',
    dark: '#122144',
  },

  // Semantic Colors
  semantic: {
    success: '#0ea78b',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
  },

  // Extended Brand Palette
  extended: {
    teal: '#1e605e',
    darkgreen: '#003a45',
    light: '#fef3f2',
    medium: '#e5e7eb',
  },

  // Neutral Colors
  neutral: {
    white: '#ffffff',
    gray50: '#f9fafb',
    gray100: '#f3f4f6',
    gray200: '#e5e7eb',
    gray300: '#d1d5db',
    gray400: '#9ca3af',
    gray500: '#6b7280',
    gray600: '#4b5563',
    gray700: '#374151',
    gray800: '#1f2937',
    gray900: '#111827',
  },

  // Dark Mode Colors
  dark: {
    background: '#222222',
    surface: '#111111',
    border: '#374151',
    text: '#E8ECF3',
    textSecondary: '#a6adba',
  }
};

export const BRAND_GRADIENTS = {
  primary: 'linear-gradient(135deg, #f17e22 0%, #f39647 100%)',
  success: 'linear-gradient(135deg, #0ea78b 0%, #1e605e 100%)',
  dark: 'linear-gradient(135deg, #122144 0%, #003a45 100%)',
  glass: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',

  // Hover Effects
  primaryHover: 'linear-gradient(135deg, #f39647 0%, #f17e22 100%)',
  successHover: 'linear-gradient(135deg, #1e605e 0%, #0ea78b 100%)',
};

export const BRAND_SHADOWS = {
  subtle: '0 1px 3px 0 rgba(241, 126, 34, 0.1)',
  medium: '0 4px 6px -1px rgba(241, 126, 34, 0.15)',
  large: '0 10px 15px -3px rgba(241, 126, 34, 0.2)',
  orange: '2px 8px 25px 1px rgba(225, 66, 25, 0.5)',
  black: '0 10px 30px 5px rgba(0, 0, 0, 0.15)',

  // Glow Effects
  orangeGlow: '0 0 20px rgba(241, 126, 34, 0.3)',
  greenGlow: '0 0 20px rgba(14, 167, 139, 0.3)',
  blueGlow: '0 0 20px rgba(59, 130, 246, 0.3)',
};

export const BRAND_TYPOGRAPHY = {
  fontFamily: {
    primary: "'Inter', system-ui, sans-serif",
    mono: "'JetBrains Mono', 'Fira Code', monospace",
  },

  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',      // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem',    // 48px
  },

  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },

  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
};

export const BRAND_SPACING = {
  0: '0',
  1: '0.25rem',   // 4px
  2: '0.5rem',    // 8px
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px
  5: '1.25rem',   // 20px
  6: '1.5rem',    // 24px
  8: '2rem',      // 32px
  10: '2.5rem',   // 40px
  12: '3rem',      // 48px
  16: '4rem',      // 64px
  20: '5rem',      // 80px
  24: '6rem',      // 96px
};

export const BRAND_BORDER_RADIUS = {
  none: '0',
  sm: '0.25rem',   // 4px
  base: '0.5rem',  // 8px
  md: '0.75rem',   // 12px
  lg: '1rem',      // 16px
  xl: '1.25rem',   // 20px
  '2xl': '1.5rem', // 24px
  full: '9999px',
};

export const BRAND_ANIMATIONS = {
  duration: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
    slower: '1000ms',
  },

  easing: {
    easeOut: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    easeIn: 'cubic-bezier(0.55, 0.055, 0.675, 0.19)',
    easeInOut: 'cubic-bezier(0.645, 0.045, 0.355, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },

  keyframes: {
    fadeIn: {
      from: { opacity: 0, transform: 'translateY(10px)' },
      to: { opacity: 1, transform: 'translateY(0)' }
    },
    slideIn: {
      from: { opacity: 0, transform: 'translateX(-20px)' },
      to: { opacity: 1, transform: 'translateX(0)' }
    },
    scaleIn: {
      from: { opacity: 0, transform: 'scale(0.95)' },
      to: { opacity: 1, transform: 'scale(1)' }
    },
    pulseGlow: {
      '0%, 100%': { boxShadow: '0 0 0 0 rgba(241, 126, 34, 0.4)' },
      '50%': { boxShadow: '0 0 0 10px rgba(241, 126, 34, 0)' }
    }
  }
};

export const BRAND_BREAKPOINTS = {
  xs: '475px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

export const BRAND_Z_INDEX = {
  base: 0,
  dropdown: 10,
  sticky: 20,
  fixed: 30,
  modalBackdrop: 40,
  modal: 50,
  popover: 60,
  tooltip: 70,
  notification: 80,
  maximum: 9999,
};

// Component-specific brand configurations
export const BRAND_COMPONENTS = {
  button: {
    primary: {
      background: BRAND_GRADIENTS.primary,
      color: BRAND_COLORS.neutral.white,
      border: 'none',
      shadow: BRAND_SHADOWS.medium,
      hover: {
        background: BRAND_GRADIENTS.primaryHover,
        shadow: BRAND_SHADOWS.large,
        transform: 'translateY(-2px) scale(1.05)'
      }
    },
    secondary: {
      background: BRAND_COLORS.neutral.white,
      color: BRAND_COLORS.primary.orange,
      border: `1px solid ${BRAND_COLORS.primary.orange}`,
      shadow: BRAND_SHADOWS.subtle,
      hover: {
        background: BRAND_COLORS.extended.light,
        shadow: BRAND_SHADOWS.medium,
        transform: 'translateY(-1px) scale(1.02)'
      }
    },
    ghost: {
      background: 'transparent',
      color: BRAND_COLORS.primary.orange,
      border: 'none',
      hover: {
        background: 'rgba(241, 126, 34, 0.1)',
        transform: 'scale(1.05)'
      }
    }
  },

  card: {
    base: {
      background: BRAND_COLORS.neutral.white,
      border: `1px solid ${BRAND_COLORS.neutral.gray200}`,
      borderRadius: BRAND_BORDER_RADIUS['2xl'],
      shadow: BRAND_SHADOWS.medium,
      hover: {
        shadow: BRAND_SHADOWS.large,
        transform: 'translateY(-4px)'
      }
    },
    glass: {
      background: 'linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.4) 100%)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255,255,255,0.2)',
      borderRadius: BRAND_BORDER_RADIUS['2xl'],
      shadow: BRAND_SHADOWS.large,
    }
  },

  input: {
    base: {
      background: BRAND_COLORS.neutral.white,
      border: `1px solid ${BRAND_COLORS.neutral.gray300}`,
      borderRadius: BRAND_BORDER_RADIUS.xl,
      color: BRAND_COLORS.neutral.gray900,
      placeholder: BRAND_COLORS.neutral.gray500,
      focus: {
        borderColor: BRAND_COLORS.primary.orange,
        boxShadow: `0 0 0 3px ${BRAND_COLORS.primary.orange}20`,
        outline: 'none'
      }
    }
  }
};

// Utility functions for brand colors
export const getBrandColor = (path, opacity = 1) => {
  const keys = path.split('.');
  let color = BRAND_COLORS;

  for (const key of keys) {
    color = color[key];
  }

  if (opacity < 1) {
    // Convert hex to rgba with opacity
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }

  return color;
};

export const getBrandGradient = (type) => {
  return BRAND_GRADIENTS[type] || BRAND_GRADIENTS.primary;
};

export const getBrandShadow = (type) => {
  return BRAND_SHADOWS[type] || BRAND_SHADOWS.medium;
};

// CSS Custom Properties generator
export const generateBrandCSS = () => {
  return `
    :root {
      /* Brand Colors */
      --brand-primary-orange: ${BRAND_COLORS.primary.orange};
      --brand-primary-soft: ${BRAND_COLORS.primary.soft};
      --brand-primary-dark: ${BRAND_COLORS.primary.dark};
      --brand-success: ${BRAND_COLORS.semantic.success};
      --brand-warning: ${BRAND_COLORS.semantic.warning};
      --brand-error: ${BRAND_COLORS.semantic.error};
      --brand-info: ${BRAND_COLORS.semantic.info};
      
      /* Brand Gradients */
      --brand-gradient-primary: ${BRAND_GRADIENTS.primary};
      --brand-gradient-success: ${BRAND_GRADIENTS.success};
      --brand-gradient-dark: ${BRAND_GRADIENTS.dark};
      
      /* Brand Shadows */
      --brand-shadow-orange: ${BRAND_SHADOWS.orangeGlow};
      --brand-shadow-medium: ${BRAND_SHADOWS.medium};
      --brand-shadow-large: ${BRAND_SHADOWS.large};
      
      /* Animation Duration */
      --brand-duration-fast: ${BRAND_ANIMATIONS.duration.fast};
      --brand-duration-normal: ${BRAND_ANIMATIONS.duration.normal};
      --brand-duration-slow: ${BRAND_ANIMATIONS.duration.slow};
    }
  `;
};

export default {
  BRAND_COLORS,
  BRAND_GRADIENTS,
  BRAND_SHADOWS,
  BRAND_TYPHOGRAPHY,
  BRAND_SPACING,
  BRAND_BORDER_RADIUS,
  BRAND_ANIMATIONS,
  BRAND_BREAKPOINTS,
  BRAND_Z_INDEX,
  BRAND_COMPONENTS,
  getBrandColor,
  getBrandGradient,
  getBrandShadow,
  generateBrandCSS,
};
