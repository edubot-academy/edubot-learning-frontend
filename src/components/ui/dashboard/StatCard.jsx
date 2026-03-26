import PropTypes from 'prop-types';

const StatCard = ({
  label,
  value,
  icon,
  color = 'orange',
  trend,
  subtitle,
  loading = false,
  className = '',
}) => {
  const getColorClasses = (color) => {
    const colors = {
      orange: {
        bg: 'from-edubot-orange/20 to-edubot-soft/10',
        icon: 'bg-edubot-orange',
        text: 'from-edubot-orange to-edubot-soft',
        gradient: 'from-edubot-orange/5 via-transparent to-edubot-soft/5',
      },
      green: {
        bg: 'from-edubot-green/20 to-emerald-600/10',
        icon: 'bg-edubot-green',
        text: 'from-edubot-green to-emerald-600',
        gradient: 'from-edubot-green/5 via-transparent to-emerald-600/5',
      },
      blue: {
        bg: 'from-blue-500/20 to-cyan-600/10',
        icon: 'bg-blue-500',
        text: 'from-blue-500 to-cyan-600',
        gradient: 'from-blue-500/5 via-transparent to-cyan-600/5',
      },
      purple: {
        bg: 'from-purple-500/20 to-pink-600/10',
        icon: 'bg-purple-500',
        text: 'from-purple-500 to-pink-600',
        gradient: 'from-purple-500/5 via-transparent to-pink-600/5',
      },
      amber: {
        bg: 'from-amber-500/20 to-orange-500/10',
        icon: 'bg-amber-500',
        text: 'from-amber-500 to-orange-500',
        gradient: 'from-amber-500/5 via-transparent to-orange-500/5',
      },
    };
    return colors[color] || colors.orange;
  };

  const colorClasses = getColorClasses(color);

  if (loading) {
    return (
      <div className={`group relative ${className}`}>
        <div className="absolute inset-0 bg-gradient-to-br from-white/80 to-white/40 dark:from-gray-800/80 dark:to-gray-800/40 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700/20 shadow-lg" />
        <div className="relative p-6 z-10">
          <div className="animate-pulse space-y-4">
            <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`group relative ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-br from-white/80 to-white/40 dark:from-gray-800/80 dark:to-gray-800/40 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700/20 shadow-lg hover:shadow-2xl transition-all duration-500" />
      <div className={`absolute inset-0 bg-gradient-to-br ${colorClasses.gradient} rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

      <div className="relative p-6 z-10">
        <div className="absolute top-2 right-2 w-16 h-16 bg-gradient-to-br from-edubot-orange/20 to-edubot-soft/10 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 transform group-hover:scale-110" />

        <div className={`w-10 h-10 bg-gradient-to-br ${colorClasses.bg} rounded-xl mb-3 flex items-center justify-center`}>
          {icon ? (
            <div className="text-white">{icon}</div>
          ) : (
            <div className={`w-5 h-5 ${colorClasses.icon} rounded-full animate-pulse`} />
          )}
        </div>

        <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">{label}</p>
        <p className="text-3xl font-bold text-slate-900 dark:text-white bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent">
          {value}
        </p>

        {subtitle && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{subtitle}</p>
        )}

        {trend && (
          <div className="flex items-center gap-2 mt-3">
            <span className={`text-sm font-medium ${
              trend.direction === 'up' ? 'text-green-600' : trend.direction === 'down' ? 'text-red-600' : 'text-gray-600'
            }`}>
              {trend.direction === 'up' ? '↑' : trend.direction === 'down' ? '↓' : '→'} {trend.value}%
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">{trend.label}</span>
          </div>
        )}

        <div className="mt-3 h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div className={`h-full bg-gradient-to-r ${colorClasses.text} rounded-full w-3/4 animate-pulse`} />
        </div>
      </div>
    </div>
  );
};

StatCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  icon: PropTypes.node,
  color: PropTypes.oneOf(['orange', 'green', 'blue', 'purple', 'amber']),
  trend: PropTypes.shape({
    direction: PropTypes.oneOf(['up', 'down', 'stable']),
    value: PropTypes.number,
    label: PropTypes.string,
  }),
  subtitle: PropTypes.string,
  loading: PropTypes.bool,
  className: PropTypes.string,
};

export default StatCard;
