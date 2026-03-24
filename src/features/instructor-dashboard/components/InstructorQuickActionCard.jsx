import { Link } from 'react-router-dom';

const InstructorQuickActionCard = ({ title, description, link, buttonText, accent = 'orange' }) => {
    const accentClasses =
        {
            orange:
                'bg-gradient-to-r from-edubot-orange to-edubot-soft hover:from-edubot-soft hover:to-edubot-orange',
            green:
                'bg-gradient-to-r from-edubot-green to-emerald-600 hover:from-emerald-600 hover:to-edubot-green',
            teal: 'bg-gradient-to-r from-edubot-teal to-teal-600 hover:from-teal-600 hover:to-edubot-teal',
            amber: 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-orange-500 hover:to-amber-500',
            blue: 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-cyan-600 hover:to-blue-600',
        }[accent] || 'bg-gradient-to-r from-edubot-orange to-edubot-soft';

    return (
        <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-white/80 to-white/40 dark:from-gray-800/80 dark:to-gray-800/40 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700/20 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1" />
            <div className={`absolute inset-0 ${accentClasses} opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-2xl`} />

            <div className="relative p-6 z-10">
                <div className="absolute -top-3 -right-3 w-12 h-12 bg-gradient-to-br from-edubot-orange to-edubot-soft rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-500 transform group-hover:scale-110 group-hover:rotate-12 flex items-center justify-center">
                    <span className="text-white text-lg">✨</span>
                </div>

                <div className="mb-4">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2 group-hover:text-edubot-orange transition-colors duration-300">
                        {title}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                        {description}
                    </p>
                </div>

                <Link
                    to={link}
                    className={`${accentClasses} text-white rounded-xl px-6 py-3 text-sm font-medium transform transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 relative overflow-hidden group`}
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                    <span className="relative z-10 flex items-center justify-center gap-2">
                        {buttonText}
                        <span className="transform group-hover:translate-x-1 transition-transform duration-300">
                            →
                        </span>
                    </span>
                </Link>
            </div>
        </div>
    );
};

export default InstructorQuickActionCard;
