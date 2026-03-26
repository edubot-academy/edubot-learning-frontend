import React from 'react';

const EnhancedButton = ({ 
    children, 
    variant = 'primary', 
    size = 'md', 
    disabled = false, 
    loading = false,
    icon,
    onClick,
    className = '',
    ...props 
}) => {
    const baseClasses = "relative inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all duration-300 transform focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
    
    const sizes = {
        sm: "px-4 py-2 text-sm",
        md: "px-6 py-3 text-sm",
        lg: "px-8 py-4 text-base",
        xl: "px-10 py-5 text-lg"
    };
    
    const variants = {
        primary: `${baseClasses} ${sizes[size]} bg-gradient-to-r from-edubot-orange to-edubot-soft hover:from-edubot-soft hover:to-edubot-orange text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 focus:ring-edubot-orange`,
        secondary: `${baseClasses} ${sizes[size]} bg-gradient-to-r from-edubot-green to-emerald-600 hover:from-emerald-600 hover:to-edubot-green text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 focus:ring-edubot-green`,
        tertiary: `${baseClasses} ${sizes[size]} bg-gradient-to-r from-edubot-teal to-teal-600 hover:from-teal-600 hover:to-edubot-teal text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 focus:ring-edubot-teal`,
        outline: `${baseClasses} ${sizes[size]} border-2 border-edubot-orange text-edubot-orange bg-transparent hover:bg-edubot-orange hover:text-white shadow-md hover:shadow-lg hover:scale-105 active:scale-95 focus:ring-edubot-orange`,
        ghost: `${baseClasses} ${sizes[size]} text-edubot-orange bg-transparent hover:bg-edubot-orange/10 hover:scale-105 active:scale-95 focus:ring-edubot-orange`,
        danger: `${baseClasses} ${sizes[size]} bg-gradient-to-r from-red-500 to-red-400 hover:from-red-400 hover:to-red-500 text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 focus:ring-red-500`
    };
    
    return (
        <button
            className={`${variants[variant]} ${className}`}
            disabled={disabled || loading}
            onClick={onClick}
            {...props}
        >
            {/* Button shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 rounded-xl"></div>
            
            {/* Loading spinner */}
            {loading && (
                <svg
                    className="animate-spin h-4 w-4"
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
            )}
            
            {/* Icon */}
            {icon && !loading && (
                <span className="transform group-hover:scale-110 transition-transform duration-200">
                    {icon}
                </span>
            )}
            
            {/* Content */}
            <span className="relative z-10">
                {children}
            </span>
            
            {/* Ripple effect on click */}
            <div className="absolute inset-0 rounded-xl overflow-hidden">
                <div className="ripple absolute inset-0 bg-white/30 scale-0 animate-ping"></div>
            </div>
        </button>
    );
};

const FloatingActionButton = ({ 
    children, 
    position = 'bottom-right',
    color = 'orange',
    onClick,
    className = '',
    ...props 
}) => {
    const positions = {
        'bottom-right': 'bottom-6 right-6',
        'bottom-left': 'bottom-6 left-6',
        'top-right': 'top-6 right-6',
        'top-left': 'top-6 left-6'
    };
    
    const colors = {
        orange: 'bg-gradient-to-r from-edubot-orange to-edubot-soft hover:from-edubot-soft hover:to-edubot-orange',
        green: 'bg-gradient-to-r from-edubot-green to-emerald-600 hover:from-emerald-600 hover:to-edubot-green',
        teal: 'bg-gradient-to-r from-edubot-teal to-teal-600 hover:from-teal-600 hover:to-edubot-teal'
    };
    
    return (
        <button
            className={`fixed ${positions[position]} w-14 h-14 ${colors[color]} text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center z-50 ${className}`}
            onClick={onClick}
            {...props}
        >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full hover:translate-x-full transition-transform duration-700 rounded-full"></div>
            <span className="relative z-10 text-xl">
                {children}
            </span>
        </button>
    );
};

const IconButton = ({ 
    children, 
    variant = 'ghost',
    size = 'md',
    tooltip,
    onClick,
    className = '',
    ...props 
}) => {
    const baseClasses = "relative inline-flex items-center justify-center rounded-xl transition-all duration-300 transform focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
    
    const sizes = {
        sm: "w-8 h-8 text-sm",
        md: "w-10 h-10 text-base",
        lg: "w-12 h-12 text-lg"
    };
    
    const variants = {
        ghost: `${baseClasses} ${sizes[size]} text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:scale-110 active:scale-95 focus:ring-slate-400`,
        solid: `${baseClasses} ${sizes[size]} bg-edubot-orange text-white hover:bg-edubot-soft hover:scale-110 active:scale-95 focus:ring-edubot-orange shadow-md hover:shadow-lg`,
        outline: `${baseClasses} ${sizes[size]} border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:scale-110 active:scale-95 focus:ring-slate-400`
    };
    
    return (
        <button
            className={`${variants[variant]} ${className}`}
            onClick={onClick}
            title={tooltip}
            {...props}
        >
            <div className="absolute inset-0 rounded-xl overflow-hidden">
                <div className="ripple absolute inset-0 bg-slate-200/50 scale-0"></div>
            </div>
            <span className="relative z-10">
                {children}
            </span>
        </button>
    );
};

const ToggleButton = ({ 
    pressed = false, 
    onPressedChange,
    children,
    className = '',
    ...props 
}) => {
    return (
        <button
            className={`relative inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-xl transition-all duration-300 transform focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                pressed 
                    ? 'bg-edubot-orange text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 focus:ring-edubot-orange' 
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600 hover:scale-105 active:scale-95 focus:ring-slate-400'
            } ${className}`}
            onClick={() => onPressedChange?.(!pressed)}
            {...props}
        >
            <div className="absolute inset-0 rounded-xl overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transition-transform duration-700 ${
                    pressed ? 'translate-x-0' : '-translate-x-full'
                }`}></div>
            </div>
            <span className="relative z-10">
                {children}
            </span>
        </button>
    );
};

export { EnhancedButton, FloatingActionButton, IconButton, ToggleButton };
