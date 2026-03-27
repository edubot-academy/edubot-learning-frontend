import React from 'react';
import PropTypes from 'prop-types';
import { useBrand } from '../../../hooks/useBrand';
import { cn } from '../../../lib/utils';

/**
 * Enhanced Brand Button Component
 * Supports multiple variants with EduBot brand styling
 */
const BrandButton = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  onClick,
  className,
  ...props
}) => {
  const brand = useBrand();

  const getVariantClasses = () => {
    const variants = {
      primary: `
        bg-gradient-to-r from-brand-primary-orange to-brand-primary-soft
        text-white
        shadow-brand-medium
        hover:shadow-brand-large
        hover:scale-105
        active:scale-95
        border-0
      `,
      secondary: `
        bg-white dark:bg-gray-800
        text-brand-primary-orange
        border border-brand-primary-orange
        shadow-brand-medium
        hover:bg-orange-50 dark:hover:bg-gray-700
        hover:shadow-brand-large
        hover:scale-105
        active:scale-95
      `,
      ghost: `
        bg-transparent
        text-brand-primary-orange
        border-0
        hover:bg-orange-50 dark:hover:bg-gray-800
        hover:scale-105
        active:scale-95
      `,
      success: `
        bg-gradient-to-r from-brand-success to-teal
        text-white
        shadow-brand-medium
        hover:shadow-brand-large
        hover:scale-105
        active:scale-95
        border-0
      `,
      danger: `
        bg-gradient-to-r from-brand-error to-red-600
        text-white
        shadow-brand-medium
        hover:shadow-brand-large
        hover:scale-105
        active:scale-95
        border-0
      `
    };
    return variants[variant] || variants.primary;
  };

  const getSizeClasses = () => {
    const sizes = {
      sm: 'px-4 py-2 text-sm min-h-[36px]',
      md: 'px-6 py-3 text-sm min-h-[44px]',
      lg: 'px-8 py-4 text-base min-h-[52px]',
      xl: 'px-10 py-5 text-lg min-h-[60px]'
    };
    return sizes[size] || sizes.md;
  };

  const baseClasses = `
    relative
    inline-flex
    items-center
    justify-center
    gap-2
    font-medium
    rounded-xl
    transition-all
    duration-[var(--brand-duration-normal)]
    ease-[var(--brand-easing-easeOut)]
    focus:outline-none
    focus:ring-2
    focus:ring-brand-primary-orange/50
    disabled:opacity-60
    disabled:cursor-not-allowed
    disabled:hover:scale-100
    disabled:active:scale-100
    touch-manipulation
    ${fullWidth ? 'w-full' : ''}
    ${getVariantClasses()}
    ${getSizeClasses()}
    ${className || ''}
  `;

  return (
    <button
      className={cn(baseClasses)}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {/* Loading Spinner */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/20 rounded-xl backdrop-blur-sm">
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        </div>
      )}

      {/* Left Icon */}
      {leftIcon && !loading && (
        <span className="flex-shrink-0">
          {leftIcon}
        </span>
      )}

      {/* Button Content */}
      <span className={cn(loading && 'opacity-0')}>
        {children}
      </span>

      {/* Right Icon */}
      {rightIcon && !loading && (
        <span className="flex-shrink-0">
          {rightIcon}
        </span>
      )}
    </button>
  );
};

BrandButton.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['primary', 'secondary', 'ghost', 'success', 'danger']),
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl']),
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
  leftIcon: PropTypes.node,
  rightIcon: PropTypes.node,
  fullWidth: PropTypes.bool,
  onClick: PropTypes.func,
  className: PropTypes.string,
};

export default BrandButton;
