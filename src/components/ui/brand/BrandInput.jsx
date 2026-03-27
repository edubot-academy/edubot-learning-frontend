import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { useBrand } from '../../../hooks/useBrand';
import { cn } from '../../../lib/utils';

/**
 * Enhanced Brand Input Component
 * Features floating labels, validation states, and brand styling
 */
const BrandInput = forwardRef(({
  label,
  placeholder,
  type = 'text',
  error,
  helperText,
  leftIcon,
  rightIcon,
  disabled = false,
  required = false,
  className,
  ...props
}, ref) => {
  const brand = useBrand();

  const baseInputClasses = cn(
    // Base styles
    'w-full',
    'px-4 py-3',
    'bg-white dark:bg-gray-800',
    'text-gray-900 dark:text-white',
    'placeholder-gray-500 dark:placeholder-gray-400',
    'rounded-xl',
    'border',
    'transition-all',
    'duration-[var(--brand-duration-normal)]',
    'ease-[var(--brand-easing-easeOut)]',
    
    // Focus states
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-brand-primary-orange/50',
    'focus:border-brand-primary-orange',
    
    // States
    'disabled:opacity-60',
    'disabled:cursor-not-allowed',
    
    // Error state
    error && 'border-brand-error focus:ring-brand-error/50 focus:border-brand-error',
    
    // Icon padding
    leftIcon && 'pl-12',
    rightIcon && 'pr-12',
    
    className
  );

  const labelClasses = cn(
    'block',
    'text-sm',
    'font-medium',
    'text-gray-700 dark:text-gray-300',
    'mb-2',
    'transition-colors',
    'duration-[var(--brand-duration-normal)]',
    
    // Error state
    error && 'text-brand-error',
    
    // Required indicator
    required && 'after:content-[\"*\"] after:ml-1 after:text-brand-error'
  );

  const containerClasses = cn(
    'relative',
    'w-full'
  );

  const iconClasses = cn(
    'absolute',
    'top-1/2',
    'transform',
    '-translate-y-1/2',
    'text-gray-400',
    'transition-colors',
    'duration-[var(--brand-duration-normal)]',
    
    // Error state
    error && 'text-brand-error'
  );

  const helperTextClasses = cn(
    'text-xs',
    'mt-2',
    'transition-colors',
    'duration-[var(--brand-duration-normal)]',
    
    // Error state
    error ? 'text-brand-error' : 'text-gray-500 dark:text-gray-400'
  );

  return (
    <div className={containerClasses}>
      {/* Label */}
      {label && (
        <label className={labelClasses}>
          {label}
          {required && <span className="ml-1 text-brand-error">*</span>}
        </label>
      )}

      {/* Input Container */}
      <div className="relative">
        {/* Left Icon */}
        {leftIcon && (
          <div className={cn(iconClasses, 'left-4')}>
            {leftIcon}
          </div>
        )}

        {/* Input */}
        <input
          ref={ref}
          type={type}
          className={baseInputClasses}
          placeholder={placeholder}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={helperText ? `${props.id || 'input'}-helper` : undefined}
          {...props}
        />

        {/* Right Icon */}
        {rightIcon && (
          <div className={cn(iconClasses, 'right-4')}>
            {rightIcon}
          </div>
        )}

        {/* Loading State (for async validation) */}
        {props.loading && (
          <div className={cn(iconClasses, 'right-4')}>
            <div className="w-4 h-4 border-2 border-brand-primary-orange/30 border-t-brand-primary-orange rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Helper Text */}
      {helperText && (
        <div 
          id={`${props.id || 'input'}-helper`}
          className={helperTextClasses}
        >
          {helperText}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="text-xs text-brand-error mt-1 animate-fade-in">
          {error}
        </div>
      )}
    </div>
  );
});

BrandInput.propTypes = {
  label: PropTypes.string,
  placeholder: PropTypes.string,
  type: PropTypes.string,
  error: PropTypes.string,
  helperText: PropTypes.string,
  leftIcon: PropTypes.node,
  rightIcon: PropTypes.node,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  className: PropTypes.string,
  loading: PropTypes.bool,
};

BrandInput.displayName = 'BrandInput';

export default BrandInput;
