import PropTypes from 'prop-types';
import SharedButton from '@shared/ui/Button';

const sizeMap = {
    sm: 'sm',
    md: 'md',
    lg: 'lg',
    xl: 'lg',
};

const variantMap = {
    primary: 'primary',
    secondary: 'secondary',
    tertiary: 'secondary',
    outline: 'secondary',
    ghost: 'secondary',
    danger: 'secondary',
};

const EnhancedButton = ({
    variant = 'primary',
    size = 'md',
    icon,
    children,
    ...props
}) => (
    <SharedButton
        variant={variantMap[variant] || 'primary'}
        size={sizeMap[size] || 'md'}
        icon={icon}
        {...props}
    >
        {children}
    </SharedButton>
);

const FloatingActionButton = ({
    children,
    position = 'bottom-right',
    color = 'orange',
    className = '',
    ...props
}) => {
    const positions = {
        'bottom-right': 'bottom-6 right-6',
        'bottom-left': 'bottom-6 left-6',
        'top-right': 'top-6 right-6',
        'top-left': 'top-6 left-6',
    };

    const colors = {
        orange: 'bg-edubot-orange hover:bg-edubot-soft focus:ring-edubot-orange/40',
        green: 'bg-edubot-green hover:bg-emerald-600 focus:ring-edubot-green/40',
        teal: 'bg-edubot-teal hover:bg-teal-600 focus:ring-edubot-teal/40',
    };

    return (
        <button
            type="button"
            className={`fixed ${positions[position] || positions['bottom-right']} flex h-14 w-14 items-center justify-center rounded-full ${colors[color] || colors.orange} text-white shadow-lg transition-colors focus:outline-none focus:ring-2 ${className}`}
            {...props}
        >
            <span className="text-xl">{children}</span>
        </button>
    );
};

const IconButton = ({
    children,
    variant = 'ghost',
    size = 'md',
    tooltip,
    className = '',
    ...props
}) => {
    const sizes = {
        sm: 'h-8 w-8 text-sm',
        md: 'h-10 w-10 text-base',
        lg: 'h-12 w-12 text-lg',
    };

    const variants = {
        ghost: 'text-slate-600 hover:bg-slate-100 focus:ring-slate-400 dark:text-slate-400 dark:hover:bg-slate-700',
        solid: 'bg-edubot-orange text-white hover:bg-edubot-soft focus:ring-edubot-orange',
        outline: 'border border-slate-300 text-slate-600 hover:bg-slate-100 focus:ring-slate-400 dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-700',
    };

    return (
        <button
            type="button"
            className={`inline-flex items-center justify-center rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${sizes[size] || sizes.md} ${variants[variant] || variants.ghost} ${className}`}
            title={tooltip}
            aria-label={props['aria-label'] || tooltip}
            {...props}
        >
            {children}
        </button>
    );
};

const ToggleButton = ({
    pressed = false,
    onPressedChange,
    children,
    className = '',
    ...props
}) => (
    <button
        type="button"
        aria-pressed={pressed}
        className={`inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
            pressed
                ? 'bg-edubot-orange text-white focus:ring-edubot-orange'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 focus:ring-slate-400 dark:bg-slate-700 dark:text-slate-400 dark:hover:bg-slate-600'
        } ${className}`}
        onClick={() => onPressedChange?.(!pressed)}
        {...props}
    >
        {children}
    </button>
);

EnhancedButton.propTypes = {
    variant: PropTypes.oneOf(['primary', 'secondary', 'tertiary', 'outline', 'ghost', 'danger']),
    size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl']),
    icon: PropTypes.node,
    children: PropTypes.node.isRequired,
};

FloatingActionButton.propTypes = {
    children: PropTypes.node.isRequired,
    position: PropTypes.oneOf(['bottom-right', 'bottom-left', 'top-right', 'top-left']),
    color: PropTypes.oneOf(['orange', 'green', 'teal']),
    className: PropTypes.string,
};

IconButton.propTypes = {
    children: PropTypes.node.isRequired,
    variant: PropTypes.oneOf(['ghost', 'solid', 'outline']),
    size: PropTypes.oneOf(['sm', 'md', 'lg']),
    tooltip: PropTypes.string,
    className: PropTypes.string,
};

ToggleButton.propTypes = {
    pressed: PropTypes.bool,
    onPressedChange: PropTypes.func,
    children: PropTypes.node.isRequired,
    className: PropTypes.string,
};

export { EnhancedButton, FloatingActionButton, IconButton, ToggleButton };
