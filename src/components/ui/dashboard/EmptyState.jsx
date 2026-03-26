import PropTypes from 'prop-types';

const EmptyState = ({
  title,
  subtitle,
  icon,
  action,
  illustration,
  className = '',
}) => {
  const defaultIcon = (
    <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );

  return (
    <div className={`text-center py-12 ${className}`}>
      <div className="flex flex-col items-center space-y-6">
        {/* Icon or Illustration */}
        <div className="relative">
          {illustration || (
            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center border border-gray-200 dark:border-gray-700">
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
  className: PropTypes.string,
};

export default EmptyState;
