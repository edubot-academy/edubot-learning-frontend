import React from 'react';
import PropTypes from 'prop-types';
import { useBrand } from '../../../hooks/useBrand';
import { cn } from '../../../lib/utils';

/**
 * Brand Heatmap Component
 * Features calendar-style heatmap with brand color intensity
 */
const BrandHeatmap = ({
  data = [],
  color = 'orange',
  cellSize = 12,
  gap = 2,
  showLabels = true,
  showLegend = true,
  className,
  ...props
}) => {
  const brand = useBrand();

  const getColorClasses = () => {
    const colors = {
      orange: {
        low: '#fef3f2',
        'low-medium': '#fde8e2',
        medium: '#fbd5ce',
        'medium-high': '#f8b4a0',
        high: '#f17e22',
        border: '#fed7d4'
      },
      green: {
        low: '#ecfdf5',
        'low-medium': '#d1fae5',
        medium: '#a7f3d0',
        'medium-high': '#6ee7b7',
        high: '#0ea78b',
        border: '#a7f3d0'
      },
      blue: {
        low: '#eff6ff',
        'low-medium': '#dbeafe',
        medium: '#bfdbfe',
        'medium-high': '#93c5fd',
        high: '#3b82f6',
        border: '#bfdbfe'
      }
    };
    return colors[color] || colors.orange;
  };

  const colorClasses = getColorClasses();

  // Calculate intensity levels (0-4)
  const getIntensityLevel = (value) => {
    if (value === 0 || value === undefined) return 0;
    if (value <= 20) return 1;
    if (value <= 40) return 2;
    if (value <= 60) return 3;
    if (value <= 80) return 4;
    return 5;
  };

  const getCellColor = (value) => {
    const intensity = getIntensityLevel(value);
    const levels = ['low', 'low-medium', 'medium', 'medium-high', 'high'];
    return colorClasses[levels[intensity - 1]] || colorClasses.low;
  };

  // Generate calendar data (last 12 weeks)
  const generateCalendarData = () => {
    const weeks = [];
    const today = new Date();
    
    for (let weekIndex = 0; weekIndex < 12; weekIndex++) {
      const week = [];
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - (weekIndex * 7));
      weekStart.setHours(0, 0, 0, 0);
      
      for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
        const dayDate = new Date(weekStart);
        dayDate.setDate(weekStart.getDate() + dayIndex);
        
        // Find data for this day
        const dayData = data.find(item => {
          const itemDate = new Date(item.date);
          return itemDate.toDateString() === dayDate.toDateString();
        });
        
        week.push({
          date: dayDate,
          value: dayData?.value || 0,
          label: dayData?.label
        });
      }
      
      weeks.unshift(week); // Add weeks in reverse order
    }
    
    return weeks;
  };

  const calendarData = generateCalendarData();
  const weekDays = ['Дүй', 'Шей', 'Шар', 'Бей', 'Жум', 'Иш', 'Жек'];

  const renderLegend = () => {
    if (!showLegend) return null;

    const legendLevels = [
      { label: 'Көп', color: colorClasses.low },
      { label: 'Төмөн', color: colorClasses['low-medium'] },
      { label: 'Орто', color: colorClasses.medium },
      { label: 'Жогору', color: colorClasses['medium-high'] },
      { label: 'Жогорку', color: colorClasses.high }
    ];

    return (
      <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
        <span>Аз:</span>
        {legendLevels.map((level, index) => (
          <div key={index} className="flex items-center gap-1">
            <div 
              className="w-3 h-3 rounded-sm border border-gray-200 dark:border-gray-700"
              style={{ backgroundColor: level.color }}
            />
            <span>{level.label}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className={cn("space-y-4", className)} {...props}>
      {/* Header with legend */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white">
          Активдүүлүк жылык карта
        </h3>
        {renderLegend()}
      </div>

      {/* Calendar heatmap */}
      <div className="space-y-2">
        {/* Day labels */}
        {showLabels && (
          <div className="flex items-center">
            <div className="w-8" /> {/* Spacer for week numbers */}
            {weekDays.map((day, index) => (
              <div 
                key={index} 
                className="flex-1 text-center text-xs text-gray-500 dark:text-gray-400"
                style={{ width: cellSize, height: cellSize }}
              >
                {day.charAt(0)}
              </div>
            ))}
          </div>
        )}

        {/* Calendar weeks */}
        {calendarData.map((week, weekIndex) => (
          <div key={weekIndex} className="flex items-center">
            {/* Week number */}
            {showLabels && (
              <div 
                className="text-xs text-gray-500 dark:text-gray-400 mr-2"
                style={{ width: cellSize, height: cellSize }}
              >
                {weekIndex + 1}
              </div>
            )}
            
            {/* Days of the week */}
            {week.map((day, dayIndex) => {
              const cellColor = getCellColor(day.value);
              const isToday = day.date.toDateString() === new Date().toDateString();
              
              return (
                <div
                  key={dayIndex}
                  className={cn(
                    "rounded-sm border transition-all duration-[var(--brand-duration-normal)] hover:scale-110 cursor-pointer",
                    isToday && "ring-2 ring-brand-primary-orange ring-offset-1"
                  )}
                  style={{
                    width: cellSize,
                    height: cellSize,
                    backgroundColor: cellColor,
                    borderColor: colorClasses.border,
                    marginRight: dayIndex < 6 ? gap : 0
                  }}
                  title={`${day.date.toLocaleDateString('ky-KG')}: ${day.value}% - ${day.label || ''}`}
                />
              );
            })}
          </div>
        ))}
      </div>

      {/* Summary stats */}
      <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
        <span>Жалпы күндөр: {data.length}</span>
        <span>Орточо активдүүлүк: {data.length > 0 ? Math.round(data.reduce((sum, item) => sum + item.value, 0) / data.length) : 0}%</span>
      </div>
    </div>
  );
};

BrandHeatmap.propTypes = {
  data: PropTypes.arrayOf(PropTypes.shape({
    date: PropTypes.oneOfType([PropTypes.string, PropTypes.date]),
    value: PropTypes.number,
    label: PropTypes.string
  })),
  color: PropTypes.oneOf(['orange', 'green', 'blue']),
  cellSize: PropTypes.number,
  gap: PropTypes.number,
  showLabels: PropTypes.bool,
  showLegend: PropTypes.bool,
  className: PropTypes.string,
};

export default BrandHeatmap;
