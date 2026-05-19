import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { getDashboardPath } from '@shared/utils/navigation';

const MobileDashboardOverview = ({ user, profile, courses, studentCount, publishedCount, pendingCount, aiEnabledCount, analyticsLink }) => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const quickStats = [
        {
            label: t('instructorDashboard.mobileOverview.stats.published'),
            value: publishedCount,
            icon: '✅',
            color: 'text-green-600 dark:text-green-400',
            bgColor: 'bg-green-100 dark:bg-green-900/20',
        },
        {
            label: t('instructorDashboard.mobileOverview.stats.pending'),
            value: pendingCount,
            icon: '⏳',
            color: 'text-yellow-600 dark:text-yellow-400',
            bgColor: 'bg-yellow-100 dark:bg-yellow-900/20',
        },
        {
            label: t('instructorDashboard.mobileOverview.stats.aiCourses'),
            value: aiEnabledCount,
            icon: '🤖',
            color: 'text-blue-600 dark:text-blue-400',
            bgColor: 'bg-blue-100 dark:bg-blue-900/20',
        },
        {
            label: t('instructorDashboard.mobileOverview.stats.students'),
            value: studentCount,
            icon: '👥',
            color: 'text-purple-600 dark:text-purple-400',
            bgColor: 'bg-purple-100 dark:bg-purple-900/20',
        },
    ];

    const recentCourses = courses.slice(0, 3);

    return (
        <div className="space-y-6">
            {/* Welcome Header */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-edubot-orange rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                        {user?.firstName?.charAt(0) || t('instructorDashboard.mobileOverview.fallbacks.instructorInitial')}
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                            {t('instructorDashboard.mobileOverview.welcome', {
                                name: user?.firstName || t('instructorDashboard.mobileOverview.fallbacks.instructor'),
                            })}
                        </h1>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            {t('instructorDashboard.mobileOverview.profileLine', {
                                title: profile?.title || t('instructorDashboard.mobileOverview.fallbacks.instructor'),
                                count: courses.length,
                            })}
                        </p>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={() => navigate('/instructor/course/create')}
                        className="flex items-center justify-center p-4 bg-edubot-orange text-white rounded-lg touch-manipulation active:scale-95 min-h-[48px]"
                    >
                        <span className="mr-2">➕</span>
                        <span className="font-medium">{t('instructorDashboard.mobileOverview.actions.newCourse')}</span>
                    </button>
                    <button
                        onClick={() => navigate(analyticsLink)}
                        className="flex items-center justify-center p-4 bg-edubot-teal text-white rounded-lg touch-manipulation active:scale-95 min-h-[48px]"
                    >
                        <span className="mr-2">📊</span>
                        <span className="font-medium">{t('instructorDashboard.mobileOverview.actions.analytics')}</span>
                    </button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-3">
                {quickStats.map((stat, index) => (
                    <div
                        key={index}
                        className={`${stat.bgColor} rounded-xl p-4 text-center border border-gray-200 dark:border-gray-700`}
                    >
                        <div className="text-2xl mb-1">{stat.icon}</div>
                        <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* Recent Courses */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {t('instructorDashboard.mobileOverview.recentCourses.title')}
                    </h2>
                    <button
                        onClick={() => navigate('/instructor/courses')}
                        className="text-edubot-orange hover:text-edubot-orange/80 font-medium text-sm touch-manipulation active:scale-95 min-h-[44px]"
                    >
                        {t('instructorDashboard.mobileOverview.recentCourses.viewAll')} →
                    </button>
                </div>

                <div className="space-y-3">
                    {recentCourses.map((course) => (
                        <div
                            key={course.id}
                            className="flex items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600"
                        >
                            <div className="w-10 h-10 bg-edubot-orange rounded-lg flex items-center justify-center text-white font-bold text-sm mr-3">
                                {course.title?.charAt(0) || t('instructorDashboard.mobileOverview.fallbacks.courseInitial')}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="font-medium text-gray-900 dark:text-gray-100 text-sm truncate">
                                    {course.title}
                                </div>
                                <div className="text-xs text-gray-600 dark:text-gray-400">
                                    {t('instructorDashboard.mobileOverview.recentCourses.meta', {
                                        students: course.studentsCount || 0,
                                        lessons: course.lessonsCount || 0,
                                    })}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Quick Links */}
            <div className="grid grid-cols-2 gap-3">
                <button
                    onClick={() => navigate(getDashboardPath('instructor', 'students'))}
                    className="flex items-center justify-center p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 touch-manipulation active:scale-95 min-h-[48px]"
                >
                    <span className="mr-2">👥</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{t('instructorDashboard.mobileOverview.actions.students')}</span>
                </button>
                <button
                    onClick={() => navigate(getDashboardPath('instructor', 'profile'))}
                    className="flex items-center justify-center p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 touch-manipulation active:scale-95 min-h-[48px]"
                >
                    <span className="mr-2">👤</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{t('instructorDashboard.mobileOverview.actions.profile')}</span>
                </button>
            </div>
        </div>
    );
};

MobileDashboardOverview.propTypes = {
    user: PropTypes.shape({
        id: PropTypes.string.isRequired,
        firstName: PropTypes.string,
        fullName: PropTypes.string,
        email: PropTypes.string.isRequired,
        role: PropTypes.string.isRequired,
    }),
    profile: PropTypes.shape({
        title: PropTypes.string,
        expertiseTags: PropTypes.array,
        expertiseTagsText: PropTypes.string,
        socialLinks: PropTypes.object,
    }),
    courses: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
            title: PropTypes.string,
            isPublished: PropTypes.bool,
            aiAssistantEnabled: PropTypes.bool,
            studentsCount: PropTypes.number,
            lessonsCount: PropTypes.number,
        })
    ),
    studentCount: PropTypes.number,
    publishedCount: PropTypes.number.isRequired,
    pendingCount: PropTypes.number.isRequired,
    aiEnabledCount: PropTypes.number.isRequired,
    analyticsLink: PropTypes.string.isRequired,
};

MobileDashboardOverview.defaultProps = {
    courses: [],
    studentCount: 0,
};

export default MobileDashboardOverview;
