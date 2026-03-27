import React from 'react';
import PropTypes from 'prop-types';
import { useBrand } from '../../../hooks/useBrand';
import { cn } from '../../../lib/utils';

/**
 * Enhanced Brand Checkbox Component
 * Features smooth animations, brand colors, and multiple variants
 */
const BrandCheckbox = ({
  checked = false,
  onChange,
  label,
  disabled = false,
  error,
  variant = 'default',
  size = 'md',
  className,
  ...props
}) => {
  const brand = useBrand();

  const getVariantClasses = () => {
    const variants = {
      default: {
        container: 'border-gray-300 dark:border-gray-600',
        checked: 'bg-brand-primary-orange border-brand-primary-orange',
        check: 'text-white'
      },
      success: {
        container: 'border-brand-success',
        checked: 'bg-brand-success border-brand-success',
        check: 'text-white'
      },
      danger: {
        container: 'border-brand-error',
        checked: 'bg-brand-error border-brand-error',
        check: 'text-white'
      },
      glass: {
        container: 'border-white/20 dark:border-gray-700/50 bg-white/10 dark:bg-gray-800/10',
        checked: 'bg-brand-primary-orange/90 border-brand-primary-orange',
        check: 'text-white'
      }
    };
    return variants[variant] || variants.default;
  };

  const getSizeClasses = () => {
    const sizes = {
      sm: {
        container: 'w-4 h-4',
        check: 'w-2.5 h-2.5',
        label: 'text-sm'
      },
      md: {
        container: 'w-5 h-5',
        check: 'w-3 h-3',
        label: 'text-base'
      },
      lg: {
        container: 'w-6 h-6',
        check: 'w-4 h-4',
        label: 'text-lg'
      }
    };
    return sizes[size] || sizes.md;
  };

  const variantClasses = getVariantClasses();
  const sizeClasses = getSizeClasses();

  const handleChange = (e) => {
    if (disabled) return;
    onChange?.(e.target.checked, e);
  };

  const checkboxContent = (
    <>
      {/* Checkbox input */}
      <input
        type="checkbox"
        checked={checked}
        onChange={handleChange}
        disabled={disabled}
        className="sr-only"
        aria-invalid={!!error}
        {...props}
      />

      {/* Custom checkbox */}
      <div className={cn(
        "relative",
        "rounded-md",
        "border-2",
        "transition-all",
        "duration-[var(--brand-duration-normal)]",
        "ease-[var(--brand-easing-easeOut)]",
        "flex items-center justify-center",
        
        // States
        checked ? variantClasses.checked : variantClasses.container,
        disabled && 'opacity-60 cursor-not-allowed',
        error && 'border-brand-error',
        
        // Hover effect
        !disabled && 'hover:shadow-brand-orange/20 hover:scale-110',
        
        sizeClasses.container
      )}>
        {/* Checkmark */}
        <div className={cn(
          "transition-all duration-[var(--brand-duration-fast)]",
          checked ? 'opacity-100 scale-100' : 'opacity-0 scale-50',
          variantClasses.check,
          sizeClasses.check
        )}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        {/* Animated border effect */}
        {checked && (
          <div className="absolute inset-0 rounded-md animate-pulse">
            <div className="w-full h-full rounded-md bg-brand-primary-orange/20" />
          </div>
        )}
      </div>

      {/* Label */}
      {label && (
        <span className={cn(
          "ml-3 select-none transition-colors duration-[var(--brand-duration-normal)]",
          sizeClasses.label,
          disabled && 'text-gray-500 dark:text-gray-400 cursor-not-allowed',
          error && 'text-brand-error'
        )}>
          {label}
        </span>
      )}

      {/* Error message */}
      {error && (
        <div className="text-xs text-brand-error mt-1 animate-fade-in">
          {error}
        </div>
      )}
    </>
  );

  // Glass variant with backdrop blur
  if (variant === 'glass') {
    return (
      <div className={cn("relative", className)}>
        <div className="absolute inset-0 bg-gradient-to-br from-white/80 to-white/40 dark:from-gray-800/80 dark:to-gray-800/40 backdrop-blur-sm rounded-md" />
        <div className="relative z-10 flex items-center">
          {checkboxContent}
        </div>
      </div>
    );
  }

  return (
    <label className={cn(
      "flex items-start cursor-pointer",
      disabled && 'cursor-not-allowed',
      className
    )}>
      {checkboxContent}
    </label>
  );
};

BrandCheckbox.propTypes = {
  checked: PropTypes.bool,
  onChange: PropTypes.func,
  label: PropTypes.node,
  disabled: PropTypes.bool,
  error: PropTypes.string,
  variant: PropTypes.oneOf(['default', 'success', 'danger', 'glass']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  className: PropTypes.string,
};

export default BrandCheckbox;
