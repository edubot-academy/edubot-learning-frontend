import PropTypes from 'prop-types';
import AnalyticsSection from './AnalyticsSection';

const AnalyticsChartCard = ({
  title,
  subtitle,
  children,
  loading = false,
  error = false,
  action,
  height = 'h-80',
  className = '',
}) => {
  return (
    <AnalyticsSection
      title={title}
      subtitle={subtitle}
      action={action}
      loading={loading}
      error={error}
      className={className}
      contentClassName="p-6"
    >
      <div className={`${height} flex items-center justify-center`}>
        {loading ? (
          <div className="animate-pulse w-full h-full bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
        ) : error ? (
          <div className="text-center text-gray-500 dark:text-gray-400">
            <svg className="w-12 h-12 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p>Unable to load chart</p>
          </div>
        ) : (
          children
        )}
      </div>
    </AnalyticsSection>
  );
};

AnalyticsChartCard.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  children: PropTypes.node.isRequired,
  loading: PropTypes.bool,
  error: PropTypes.bool,
  action: PropTypes.node,
  height: PropTypes.string,
  className: PropTypes.string,
};

export default AnalyticsChartCard;
