import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useBrand } from '../../../hooks/useBrand';
import { cn } from '../../../lib/utils';

/**
 * Animated Progress Ring Component
 * Features smooth animations, gradient fills, and brand styling
 */
const BrandProgressRing = ({
  value = 0,
  max = 100,
  size = 120,
  strokeWidth = 8,
  color = 'orange',
  showPercentage = true,
  animated = true,
  label,
  className,
  ...props
}) => {
  const brand = useBrand();
  const svgRef = useRef(null);
  const [displayValue, setDisplayValue] = useState(0);

  const getColorClasses = () => {
    const colors = {
      orange: 'url(#orangeGradient)',
      green: 'url(#greenGradient)',
      blue: 'url(#blueGradient)',
      purple: 'url(#purpleGradient)',
    };
    return colors[color] || colors.orange;
  };

  const normalizedValue = Math.min(Math.max(value, 0), max);
  const percentage = (normalizedValue / max) * 100;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (normalizedValue / max) * circumference;

  // Animate value on mount and change
  useEffect(() => {
    if (!animated) {
      setDisplayValue(normalizedValue);
      return;
    }

    const duration = 1000; // 1 second animation
    const steps = 60;
    const stepValue = (normalizedValue - displayValue) / steps;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const newValue = displayValue + (stepValue * currentStep);

      if (currentStep >= steps) {
        setDisplayValue(normalizedValue);
        clearInterval(timer);
      } else {
        setDisplayValue(newValue);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value, max, animated]);

  const center = size / 2;

  return (
    <div className={cn(
      "relative inline-flex items-center justify-center",
      className
    )} {...props}>
      <svg
        ref={svgRef}
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Define gradients */}
        <defs>
          <linearGradient id="orangeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f17e22" />
            <stop offset="100%" stopColor="#f39647" />
          </linearGradient>
          <linearGradient id="greenGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0ea78b" />
            <stop offset="100%" stopColor="#1e605e" />
          </linearGradient>
          <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#1e40af" />
          </linearGradient>
          <linearGradient id="purpleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
        </defs>

        {/* Background circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-gray-200 dark:text-gray-700"
        />

        {/* Progress circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          stroke={getColorClasses()}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-[var(--brand-duration-slow)] ease-[var(--brand-easing-easeOut)]"
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {showPercentage && (
          <span className="text-2xl font-bold text-gray-900 dark:text-white">
            {Math.round((displayValue / max) * 100)}%
          </span>
        )}

        {label && (
          <span className="text-xs text-gray-600 dark:text-gray-400 mt-1 text-center">
            {label}
          </span>
        )}
      </div>
    </div>
  );
};

BrandProgressRing.propTypes = {
  value: PropTypes.number,
  max: PropTypes.number,
  size: PropTypes.number,
  strokeWidth: PropTypes.number,
  color: PropTypes.oneOf(['orange', 'green', 'blue', 'purple']),
  showPercentage: PropTypes.bool,
  animated: PropTypes.bool,
  label: PropTypes.string,
  className: PropTypes.string,
};

export default BrandProgressRing;
