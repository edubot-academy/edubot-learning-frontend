import React from 'react';

const ProgressIndicator = ({ value = 0, max = 100, size = 'sm', color = 'orange', showLabel = true }) => {
    const sizes = {
        sm: 'h-1',
        md: 'h-2',
        lg: 'h-3'
    };
    
    const colors = {
        orange: 'from-edubot-orange to-edubot-soft',
        green: 'from-edubot-green to-emerald-600',
        teal: 'from-edubot-teal to-teal-600',
        red: 'from-red-500 to-red-400',
        blue: 'from-blue-500 to-blue-400'
    };
    
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
    
    return (
        <div className="w-full">
            {showLabel && (
                <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                        Прогресс
                    </span>
                    <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                        {Math.round(percentage)}%
                    </span>
                </div>
            )}
            <div className={`w-full ${sizes[size]} bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden relative`}>
                <div 
                    className={`h-full bg-gradient-to-r ${colors[color]} rounded-full transition-all duration-700 ease-out relative overflow-hidden`}
                    style={{ width: `${percentage}%` }}
                >
                    {/* Animated shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 -translate-x-full animate-pulse"></div>
                </div>
            </div>
        </div>
    );
};

const StatusBadge = ({ status, size = 'sm', children }) => {
    const baseClasses = "inline-flex items-center gap-1 font-medium rounded-full transition-all duration-200";
    
    const sizes = {
        sm: "px-2 py-1 text-xs",
        md: "px-3 py-1.5 text-sm",
        lg: "px-4 py-2 text-base"
    };
    
    const statusStyles = {
        active: `${baseClasses} ${sizes[size]} bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 ring-1 ring-emerald-200 dark:ring-emerald-800`,
        inactive: `${baseClasses} ${sizes[size]} bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 ring-1 ring-slate-200 dark:ring-slate-700`,
        pending: `${baseClasses} ${sizes[size]} bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 ring-1 ring-amber-200 dark:ring-amber-800`,
        error: `${baseClasses} ${sizes[size]} bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 ring-1 ring-red-200 dark:ring-red-800`,
        success: `${baseClasses} ${sizes[size]} bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 ring-1 ring-green-200 dark:ring-green-800`,
        warning: `${baseClasses} ${sizes[size]} bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300 ring-1 ring-yellow-200 dark:ring-yellow-800`,
        info: `${baseClasses} ${sizes[size]} bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 ring-1 ring-blue-200 dark:ring-blue-800`,
        premium: `${baseClasses} ${sizes[size]} bg-gradient-to-r from-edubot-orange to-edubot-soft text-white shadow-lg`,
        new: `${baseClasses} ${sizes[size]} bg-gradient-to-r from-edubot-green to-emerald-600 text-white shadow-lg`
    };
    
    const icons = {
        active: '✓',
        inactive: '○',
        pending: '⏳',
        error: '✕',
        success: '✓',
        warning: '⚠️',
        info: 'ℹ️',
        premium: '⭐',
        new: '🆕'
    };
    
    return (
        <span className={statusStyles[status] || statusStyles.inactive}>
            {icons[status] && <span className="text-xs">{icons[status]}</span>}
            {children}
        </span>
    );
};

const CircularProgress = ({ value = 0, max = 100, size = 48, strokeWidth = 4, color = 'orange', showLabel = true }) => {
    const colors = {
        orange: '#f17e22',
        green: '#0ea78b',
        teal: '#1e605e',
        red: '#ef4444',
        blue: '#3b82f6'
    };
    
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;
    
    return (
        <div className="relative inline-flex items-center justify-center">
            <svg
                width={size}
                height={size}
                className="transform -rotate-90"
            >
                {/* Background circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    fill="none"
                    className="text-slate-200 dark:text-slate-700"
                />
                {/* Progress circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={colors[color]}
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className="transition-all duration-700 ease-out"
                />
            </svg>
            {showLabel && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                        {Math.round(percentage)}%
                    </span>
                </div>
            )}
        </div>
    );
};

const LoadingSpinner = ({ size = 'md', color = 'orange' }) => {
    const sizes = {
        sm: 'w-4 h-4',
        md: 'w-6 h-6',
        lg: 'w-8 h-8',
        xl: 'w-12 h-12'
    };
    
    const colors = {
        orange: 'text-edubot-orange',
        green: 'text-edubot-green',
        teal: 'text-edubot-teal',
        red: 'text-red-500',
        blue: 'text-blue-500'
    };
    
    return (
        <svg
            className={`animate-spin ${sizes[size]} ${colors[color]}`}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
        >
            <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
            />
            <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
            />
        </svg>
    );
};

export { ProgressIndicator, StatusBadge, CircularProgress, LoadingSpinner };
