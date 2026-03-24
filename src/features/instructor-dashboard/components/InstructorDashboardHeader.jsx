import { Link } from 'react-router-dom';

const InstructorDashboardHeader = ({ user, sidebarOpen, setSidebarOpen, analyticsLink }) => (
    <div className="bg-gradient-to-r from-edubot-dark to-slate-900 rounded-2xl p-6 shadow-xl border border-slate-800 text-white">
        <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
                <p className="text-sm uppercase tracking-wide text-edubot-orange font-medium">
                    Инструктор Панели
                </p>
                <h1 className="text-3xl font-bold text-white mt-1">
                    {user.fullName || user.email}
                </h1>
                <p className="text-sm text-slate-300 mt-2">
                    Курстарыңызды жана студенттерди толук көзөмөлдөңүз
                </p>
            </div>

            <div className="flex items-center gap-3">
                <button
                    onClick={() => setSidebarOpen((prev) => !prev)}
                    className="hidden md:inline-flex px-4 py-2 rounded-xl border border-slate-600 text-sm text-slate-300 hover:bg-slate-700 hover:border-edubot-orange hover:text-edubot-orange transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-edubot-orange/20 group"
                    type="button"
                >
                    <span className="transition-transform duration-300 group-hover:scale-110">
                        {sidebarOpen ? 'Менюну жашыруу' : 'Менюну көрсөтүү'}
                    </span>
                </button>

                <Link
                    to={analyticsLink}
                    className="inline-flex px-6 py-3 rounded-xl bg-gradient-to-r from-edubot-orange to-edubot-soft hover:from-edubot-soft hover:to-edubot-orange text-white text-sm font-medium transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-edubot-orange/30 group animate-pulse-glow"
                >
                    <span className="transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                        📊 Аналитика
                    </span>
                </Link>
            </div>
        </div>
    </div>
);

export default InstructorDashboardHeader;
