import PropTypes from 'prop-types';

const variantConfig = {
  default: {
    iconClassName: 'text-gray-400',
    containerClassName: 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700',
  },
  discovery: {
    iconClassName: 'text-edubot-orange',
    containerClassName: 'bg-orange-50 dark:bg-orange-950/20 border-orange-100 dark:border-orange-900/40',
  },
  access: {
    iconClassName: 'text-blue-500',
    containerClassName: 'bg-blue-50 dark:bg-blue-950/20 border-blue-100 dark:border-blue-900/40',
  },
  queue: {
    iconClassName: 'text-emerald-500',
    containerClassName: 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/40',
  },
  error: {
    iconClassName: 'text-red-500',
    containerClassName: 'bg-red-50 dark:bg-red-950/20 border-red-100 dark:border-red-900/40',
  },
};

const variantIcons = {
  default: (
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  ),
  discovery: (
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-4.35-4.35m1.1-5.15a6.25 6.25 0 11-12.5 0 6.25 6.25 0 0112.5 0z" />
  ),
  access: (
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4" />
  ),
  queue: (
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  ),
  error: (
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
  ),
};

const EmptyState = ({
  title,
  subtitle,
  icon,
  action,
  illustration,
  variant = 'default',
  className = '',
  role = 'status',
}) => {
  const config = variantConfig[variant] || variantConfig.default;
  const defaultIcon = (
    <svg className={`w-16 h-16 ${config.iconClassName}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      {variantIcons[variant] || variantIcons.default}
    </svg>
  );

  return (
    <div className={`text-center py-12 ${className}`} role={role}>
      <div className="flex flex-col items-center space-y-6">
        {/* Icon or Illustration */}
        <div className="relative">
          {illustration || (
            <div className={`w-24 h-24 rounded-2xl flex items-center justify-center border ${config.containerClassName}`}>
              {icon || defaultIcon}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="space-y-3 max-w-md mx-auto">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            {title}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* Action Button */}
        {action && (
          <button
            type="button"
            onClick={action.onClick}
            className="bg-gradient-to-r from-edubot-orange to-edubot-soft hover:from-edubot-soft hover:to-edubot-orange text-white rounded-xl px-6 py-3 text-sm font-medium transform transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 touch-manipulation min-h-[44px] min-w-[120px]"
          >
            {action.label}
          </button>
        )}
      </div>
    </div>
  );
};

EmptyState.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string.isRequired,
  icon: PropTypes.node,
  action: PropTypes.shape({
    label: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired,
  }),
  illustration: PropTypes.node,
  variant: PropTypes.oneOf(['default', 'discovery', 'access', 'queue', 'error']),
  className: PropTypes.string,
  role: PropTypes.string,
};

export default EmptyState;
