import PropTypes from 'prop-types';

const StudentStatCard = ({ label, value }) => (
    <div className="group relative">
        {/* Glass morphism background */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/80 to-white/40 dark:from-gray-800/80 dark:to-gray-800/40 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700/20 shadow-lg hover:shadow-2xl transition-all duration-500"></div>

        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-edubot-orange/5 via-transparent to-edubot-soft/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

        {/* Content */}
        <div className="relative p-6 z-10">
            {/* Animated corner accent */}
            <div className="absolute top-2 right-2 w-16 h-16 bg-gradient-to-br from-edubot-orange/20 to-edubot-soft/10 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 transform group-hover:scale-110"></div>

            {/* Icon placeholder */}
            <div className="w-10 h-10 bg-gradient-to-br from-edubot-orange/20 to-edubot-soft/10 rounded-xl mb-3 flex items-center justify-center">
                <div className="w-5 h-5 bg-edubot-orange rounded-full animate-pulse"></div>
            </div>

            <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">{label}</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent">{value}</p>

            {/* Subtle progress indicator */}
            <div className="mt-3 h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-edubot-orange to-edubot-soft rounded-full w-3/4 animate-pulse"></div>
            </div>
        </div>
    </div>
);

StudentStatCard.propTypes = {
    label: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

export default StudentStatCard;
