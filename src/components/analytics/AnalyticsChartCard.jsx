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
          <div className="h-full w-full animate-pulse rounded-2xl bg-edubot-surfaceAlt dark:bg-slate-800"></div>
        ) : error ? (
          <div className="text-center text-edubot-muted dark:text-slate-400">
            <svg className="mx-auto mb-2 h-12 w-12 text-edubot-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
