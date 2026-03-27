import React from 'react';
import PropTypes from 'prop-types';
import { useBrand } from '../../../hooks/useBrand';
import { cn } from '../../../lib/utils';

/**
 * Enhanced Brand Stat Card Component
 * Features animated counters, trend indicators, and glass morphism
 */
const BrandStatCard = ({
  label,
  value,
  icon,
  trend,
  subtitle,
  color = 'orange',
  loading = false,
  variant = 'solid',
  className,
  ...props
}) => {
  const brand = useBrand();

  const getColorClasses = () => {
    const colors = {
      orange: {
        bg: 'from-brand-primary-orange/20 to-brand-primary-soft/10',
        icon: 'bg-brand-primary-orange',
        text: 'from-brand-primary-orange to-brand-primary-soft',
        gradient: 'from-brand-primary-orange/5 via-transparent to-brand-primary-soft/5',
      },
      green: {
        bg: 'from-brand-success/20 to-teal/10',
        icon: 'bg-brand-success',
        text: 'from-brand-success to-teal',
        gradient: 'from-brand-success/5 via-transparent to-teal/5',
      },
      blue: {
        bg: 'from-brand-info/20 to-blue-600/10',
        icon: 'bg-brand-info',
        text: 'from-brand-info to-blue-600',
        gradient: 'from-brand-info/5 via-transparent to-blue-600/5',
      },
      purple: {
        bg: 'from-purple-500/20 to-pink-600/10',
        icon: 'bg-purple-500',
        text: 'from-purple-500 to-pink-600',
        gradient: 'from-purple-500/5 via-transparent to-pink-600/5',
      },
    };
    return colors[color] || colors.orange;
  };

  const colorClasses = getColorClasses();

  if (loading) {
    return (
      <div className={cn(
        "group relative",
        className
      )}>
        <div className="absolute inset-0 bg-gradient-to-br from-white/80 to-white/40 dark:from-gray-800/80 dark:to-gray-800/40 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700/20 shadow-lg" />
        <div className="relative p-6 z-10">
          <div className="animate-pulse space-y-4">
            <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  const renderTrend = () => {
    if (!trend) return null;

    const trendColors = {
      up: 'text-brand-success',
      down: 'text-brand-error',
      stable: 'text-gray-600 dark:text-gray-400'
    };

    const trendIcons = {
      up: '↑',
      down: '↓',
      stable: '→'
    };

    return (
      <div className="flex items-center gap-2 mt-3">
        <span className={cn(
          "text-sm font-medium transition-all duration-300",
          trendColors[trend.direction]
        )}>
          {trendIcons[trend.direction]} {trend.value}%
        </span>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {trend.label}
        </span>
      </div>
    );
  };

  const cardContent = (
    <>
      {/* Background decoration */}
      <div className="absolute top-2 right-2 w-16 h-16 bg-gradient-to-br from-brand-primary-orange/20 to-brand-primary-soft/10 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 transform group-hover:scale-110" />

      {/* Icon */}
      <div className={cn(
        "w-10 h-10 bg-gradient-to-br rounded-xl mb-3 flex items-center justify-center transition-all duration-300",
        colorClasses.bg
      )}>
        {icon ? (
          <div className="text-white">
            {icon}
          </div>
        ) : (
          <div className={cn(
            "w-5 h-5 rounded-full animate-pulse",
            colorClasses.icon
          )} />
        )}
      </div>

      {/* Label */}
      <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1 transition-colors duration-300">
        {label}
      </p>

      {/* Value */}
      <p className="text-3xl font-bold text-gray-900 dark:text-white bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent transition-all duration-300">
        {value}
      </p>

      {/* Subtitle */}
      {subtitle && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 transition-colors duration-300">
          {subtitle}
        </p>
      )}

      {/* Trend */}
      {renderTrend()}

      {/* Progress bar decoration */}
      <div className="mt-3 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div className={cn(
          "h-full bg-gradient-to-r rounded-full w-3/4 animate-pulse transition-all duration-300",
          colorClasses.text
        )} />
      </div>
    </>
  );

  if (variant === 'glass') {
    return (
      <div className={cn(
        "group relative transition-all duration-500 hover:scale-105",
        className
      )}>
        <div className="absolute inset-0 bg-gradient-to-br from-white/80 to-white/40 dark:from-gray-800/80 dark:to-gray-800/40 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700/20 shadow-lg hover:shadow-2xl transition-all duration-500" />
        <div className="absolute inset-0 bg-gradient-to-br rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" 
             style={{ backgroundImage: colorClasses.gradient }} />
        
        <div className="relative p-6 z-10">
          {cardContent}
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "group relative transition-all duration-300 hover:shadow-2xl hover:scale-105",
      className
    )}>
      <div className="absolute inset-0 bg-gradient-to-br from-white/80 to-white/40 dark:from-gray-800/80 dark:to-gray-800/40 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700/20 shadow-lg hover:shadow-2xl transition-all duration-500" />
      <div className="absolute inset-0 bg-gradient-to-br rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" 
           style={{ backgroundImage: colorClasses.gradient }} />

      <div className="relative p-6 z-10">
        {cardContent}
      </div>
    </div>
  );
};

BrandStatCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  icon: PropTypes.node,
  color: PropTypes.oneOf(['orange', 'green', 'blue', 'purple']),
  trend: PropTypes.shape({
    direction: PropTypes.oneOf(['up', 'down', 'stable']),
    value: PropTypes.number,
    label: PropTypes.string,
  }),
  subtitle: PropTypes.string,
  loading: PropTypes.bool,
  variant: PropTypes.oneOf(['solid', 'glass']),
  className: PropTypes.string,
};

export default BrandStatCard;
