import React from 'react';
import PropTypes from 'prop-types';
import { useBrand } from '../../../hooks/useBrand';
import { cn } from '../../../lib/utils';

/**
 * Enhanced Brand Card Component
 * Supports glass morphism and solid variants with EduBot brand styling
 */
const BrandCard = ({
  children,
  variant = 'solid',
  hover = true,
  padding = 'md',
  rounded = '2xl',
  shadow = 'medium',
  className,
  onClick,
  ...props
}) => {
  const brand = useBrand();

  const getVariantClasses = () => {
    const variants = {
      solid: `
        bg-white dark:bg-gray-800
        border border-gray-200 dark:border-gray-700
      `,
      glass: `
        relative
        before:absolute before:inset-0
        before:bg-gradient-to-br before:from-white/80 before:to-white/40
        before:dark:from-gray-800/80 before:dark:to-gray-800/40
        before:backdrop-blur-xl
        before:rounded-inherit
        before:border before:border-white/20 before:dark:border-gray-700/20
        before:shadow-brand-medium
      `,
      elevated: `
        bg-white dark:bg-gray-800
        border border-gray-100 dark:border-gray-700
        shadow-brand-large
      `,
      gradient: `
        bg-gradient-to-br from-brand-primary-orange/5 via-transparent to-brand-primary-soft/5
        border border-brand-primary-orange/20
      `
    };
    return variants[variant] || variants.solid;
  };

  const getPaddingClasses = () => {
    const paddings = {
      none: '',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
      xl: 'p-10'
    };
    return paddings[padding] || paddings.md;
  };

  const getRoundedClasses = () => {
    const roundeds = {
      none: '',
      sm: 'rounded-lg',
      md: 'rounded-xl',
      lg: 'rounded-2xl',
      xl: 'rounded-3xl',
      '2xl': 'rounded-3xl',
      full: 'rounded-full'
    };
    return roundeds[rounded] || roundeds.lg;
  };

  const getShadowClasses = () => {
    const shadows = {
      none: '',
      subtle: 'shadow-brand-subtle',
      medium: 'shadow-brand-medium',
      large: 'shadow-brand-large',
      orange: 'shadow-brand-orange'
    };
    return shadows[shadow] || shadows.medium;
  };

  const getHoverClasses = () => {
    if (!hover) return '';
    
    return `
      hover:shadow-brand-large
      hover:scale-[1.02]
      hover:-translate-y-1
      transition-all
      duration-[var(--brand-duration-normal)]
      ease-[var(--brand-easing-easeOut)]
    `;
  };

  const baseClasses = cn(
    'relative',
    getVariantClasses(),
    getPaddingClasses(),
    getRoundedClasses(),
    getShadowClasses(),
    getHoverClasses(),
    onClick && 'cursor-pointer group',
    className
  );

  const content = variant === 'glass' ? (
    <div className="relative z-10">
      {children}
    </div>
  ) : (
    children
  );

  if (onClick) {
    return (
      <div
        className={baseClasses}
        onClick={onClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick(e);
          }
        }}
        {...props}
      >
        {content}
      </div>
    );
  }

  return (
    <div className={baseClasses} {...props}>
      {content}
    </div>
  );
};

BrandCard.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['solid', 'glass', 'elevated', 'gradient']),
  hover: PropTypes.bool,
  padding: PropTypes.oneOf(['none', 'sm', 'md', 'lg', 'xl']),
  rounded: PropTypes.oneOf(['none', 'sm', 'md', 'lg', 'xl', '2xl', 'full']),
  shadow: PropTypes.oneOf(['none', 'subtle', 'medium', 'large', 'orange']),
  className: PropTypes.string,
  onClick: PropTypes.func,
};

export default BrandCard;
