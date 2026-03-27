import React from 'react';
import PropTypes from 'prop-types';
import { useBrand } from '../../../hooks/useBrand';
import { cn } from '../../../lib/utils';

/**
 * Mini Sparkline Chart Component
 * Features smooth curves, gradient fills, and brand styling
 */
const BrandSparklineChart = ({
  data = [],
  width = 100,
  height = 40,
  color = 'orange',
  showArea = true,
  showPoints = false,
  smooth = true,
  className,
  ...props
}) => {
  const brand = useBrand();

  const getColorClasses = () => {
    const colors = {
      orange: {
        stroke: '#f17e22',
        fill: 'url(#orangeSparkFill)',
        gradient: ['#f17e22', '#f39647']
      },
      green: {
        stroke: '#0ea78b',
        fill: 'url(#greenSparkFill)',
        gradient: ['#0ea78b', '#1e605e']
      },
      blue: {
        stroke: '#3b82f6',
        fill: 'url(#blueSparkFill)',
        gradient: ['#3b82f6', '#1e40af']
      },
      red: {
        stroke: '#ef4444',
        fill: 'url(#redSparkFill)',
        gradient: ['#ef4444', '#dc2626']
      }
    };
    return colors[color] || colors.orange;
  };

  const colorClasses = getColorClasses();

  if (!data || data.length === 0) {
    return (
      <div className={cn("flex items-center justify-center text-gray-400", className)} {...props}>
        <span className="text-xs">No data</span>
      </div>
    );
  }

  // Normalize data to fit the chart dimensions
  const minValue = Math.min(...data);
  const maxValue = Math.max(...data);
  const range = maxValue - minValue || 1;

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - ((value - minValue) / range) * height;
    return `${x},${y}`;
  });

  // Create smooth curve path
  const createPath = (points) => {
    if (points.length < 2) return '';
    
    if (!smooth) {
      return `M ${points.join(' L ')}`;
    }

    // Create smooth curve using quadratic bezier curves
    let path = `M ${points[0]}`;
    
    for (let i = 1; i < points.length; i++) {
      const prevPoint = points[i - 1].split(',');
      const currentPoint = points[i].split(',');
      
      const prevX = parseFloat(prevPoint[0]);
      const prevY = parseFloat(prevPoint[1]);
      const currentX = parseFloat(currentPoint[0]);
      const currentY = parseFloat(currentPoint[1]);
      
      const controlX = prevX + (currentX - prevX) / 2;
      
      path += ` Q ${controlX},${prevY} ${currentX},${currentY}`;
    }
    
    return path;
  };

  const pathData = createPath(points);

  return (
    <div className={cn("inline-block", className)} {...props}>
      <svg
        width={width}
        height={height}
        className="overflow-visible"
      >
        {/* Define gradients */}
        <defs>
          <linearGradient id="orangeSparkFill" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#f17e22" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#f39647" stopOpacity="0.1" />
          </linearGradient>
          <linearGradient id="greenSparkFill" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0ea78b" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#1e605e" stopOpacity="0.1" />
          </linearGradient>
          <linearGradient id="blueSparkFill" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#1e40af" stopOpacity="0.1" />
          </linearGradient>
          <linearGradient id="redSparkFill" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ef4444" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#dc2626" stopOpacity="0.1" />
          </linearGradient>
        </defs>

        {/* Area fill */}
        {showArea && (
          <path
            d={`${pathData} L ${width},${height} L 0,${height} Z`}
            fill={colorClasses.fill}
            className="transition-all duration-[var(--brand-duration-normal)]"
          />
        )}

        {/* Line */}
        <path
          d={pathData}
          stroke={colorClasses.stroke}
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="transition-all duration-[var(--brand-duration-normal)]"
        />

        {/* Data points */}
        {showPoints && points.map((point, index) => {
          const [x, y] = point.split(',');
          return (
            <circle
              key={index}
              cx={parseFloat(x)}
              cy={parseFloat(y)}
              r="3"
              fill={colorClasses.stroke}
              className="transition-all duration-[var(--brand-duration-normal)] hover:r-4"
            />
          );
        })}
      </svg>
    </div>
  );
};

BrandSparklineChart.propTypes = {
  data: PropTypes.arrayOf(PropTypes.number).isRequired,
  width: PropTypes.number,
  height: PropTypes.number,
  color: PropTypes.oneOf(['orange', 'green', 'blue', 'red']),
  showArea: PropTypes.bool,
  showPoints: PropTypes.bool,
  smooth: PropTypes.bool,
  className: PropTypes.string,
};

export default BrandSparklineChart;
