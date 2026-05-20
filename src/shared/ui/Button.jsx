import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { FaArrowRight } from 'react-icons/fa6';

const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    type = 'button',
    disabled = false,
    loading = false,
    loadingLabel,
    icon = false,
    className = '',
    onClick,
    ...props
}) => {
    const { t } = useTranslation();
    const base =
        'inline-flex items-center justify-center gap-2 rounded-lg font-medium ' +
        'transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 ' +
        'disabled:cursor-not-allowed';

    const sizes = {
        sm: 'px-3 py-2 text-sm',
        small: 'px-3 py-2 text-sm',
        md: 'px-4 py-2 text-sm md:px-5 md:py-3 md:text-base',
        lg: 'px-6 py-3 text-base',
    };

    const styles = {
        primary: `
      bg-gradient-to-b from-[#FF8C6E] to-[#E14219]
      text-white orange__shadow
      hover:from-[#C2410C] hover:to-[#C2410C]
      active:scale-95
      disabled:bg-[#DFE1E5] disabled:text-[#3E424A]
      disabled:shadow-none disabled:cursor-not-allowed
    `,
        secondary: `
      border dark:border-white border-black dark:text-white text-black
      hover:bg-[#EA580C] hover:border-[#EA580C] hover:text-white
      active:scale-95
      disabled:bg-transparent disabled:border-[#C5C9D1]
      disabled:text-[#C5C9D1] disabled:cursor-not-allowed
    `,
    };

    const isDisabled = disabled || loading;
    const resolvedIcon = icon === true ? <FaArrowRight className="text-sm md:text-base" /> : icon;
    const resolvedLoadingLabel = loadingLabel || t('common.loading');

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={isDisabled}
            aria-busy={loading || undefined}
            className={`${base} ${sizes[size] || sizes.md} ${styles[variant] || styles.primary} ${isDisabled ? 'opacity-80' : ''} ${className}`}
            {...props}
        >
            {loading && (
                <span
                    className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
                    aria-hidden="true"
                />
            )}
            {loading && <span className="sr-only">{resolvedLoadingLabel}</span>}
            {children}
            {!loading && resolvedIcon}
        </button>
    );
};

Button.propTypes = {
    children: PropTypes.node.isRequired,
    variant: PropTypes.oneOf(['primary', 'secondary']),
    size: PropTypes.oneOf(['sm', 'small', 'md', 'lg']),
    type: PropTypes.oneOf(['button', 'submit', 'reset']),
    disabled: PropTypes.bool,
    loading: PropTypes.bool,
    loadingLabel: PropTypes.string,
    icon: PropTypes.oneOfType([PropTypes.bool, PropTypes.node]),
    className: PropTypes.string,
    onClick: PropTypes.func,
};

export default Button;
