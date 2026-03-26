import React from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';

const MobileDashboardOverview = ({ user, profile, courses, publishedCount, pendingCount, aiEnabledCount, analyticsLink }) => {
    const navigate = useNavigate();
    const quickStats = [
        {
            label: 'Жарыяланган',
            value: publishedCount,
            icon: '✅',
            color: 'text-green-600 dark:text-green-400',
            bgColor: 'bg-green-100 dark:bg-green-900/20',
        },
        {
            label: 'Күтүлүүдө',
            value: pendingCount,
            icon: '⏳',
            color: 'text-yellow-600 dark:text-yellow-400',
            bgColor: 'bg-yellow-100 dark:bg-yellow-900/20',
        },
        {
            label: 'AI Курстар',
            value: aiEnabledCount,
            icon: '🤖',
            color: 'text-blue-600 dark:text-blue-400',
            bgColor: 'bg-blue-100 dark:bg-blue-900/20',
        },
    ];

    const recentCourses = courses.slice(0, 3);

    return (
        <div className="space-y-6">
            {/* Welcome Header */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-edubot-orange rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                        {user?.firstName?.charAt(0) || 'И'}
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                            Кош келиңиз, {user?.firstName || 'Инструктор'}!
                        </h1>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            {profile?.title || 'Инструктор'} • {courses.length} курс
                        </p>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={() => window.location.href = '/instructor/courses/create'}
                        className="flex items-center justify-center p-4 bg-edubot-orange text-white rounded-lg touch-manipulation active:scale-95 min-h-[48px]"
                    >
                        <span className="mr-2">➕</span>
                        <span className="font-medium">Жаңы курс</span>
                    </button>
                    <button
                        onClick={() => window.location.href = analyticsLink}
                        className="flex items-center justify-center p-4 bg-edubot-teal text-white rounded-lg touch-manipulation active:scale-95 min-h-[48px]"
                    >
                        <span className="mr-2">📊</span>
                        <span className="font-medium">Аналитика</span>
                    </button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-3">
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
                        Акыркы курсуулар
                    </h2>
                    <button
                        onClick={() => window.location.href = '/instructor/courses'}
                        className="text-edubot-orange hover:text-edubot-orange/80 font-medium text-sm touch-manipulation active:scale-95 min-h-[44px]"
                    >
                        Бардыгырау →
                    </button>
                </div>

                <div className="space-y-3">
                    {recentCourses.map((course) => (
                        <div
                            key={course.id}
                            className="flex items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600"
                        >
                            <div className="w-10 h-10 bg-edubot-orange rounded-lg flex items-center justify-center text-white font-bold text-sm mr-3">
                                {course.title?.charAt(0) || 'К'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="font-medium text-gray-900 dark:text-gray-100 text-sm truncate">
                                    {course.title}
                                </div>
                                <div className="text-xs text-gray-600 dark:text-gray-400">
                                    {course.studentsCount || 0} окуучу • {course.lessonsCount || 0} сабак
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Quick Links */}
            <div className="grid grid-cols-2 gap-3">
                <button
                    onClick={() => navigate('/instructor/students')}
                    className="flex items-center justify-center p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 touch-manipulation active:scale-95 min-h-[48px]"
                >
                    <span className="mr-2">👥</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">Окуучулар</span>
                </button>
                <button
                    onClick={() => navigate('/instructor/profile')}
                    className="flex items-center justify-center p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 touch-manipulation active:scale-95 min-h-[48px]"
                >
                    <span className="mr-2">👤</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">Профиль</span>
                </button>
            </div>
        </div>
    );
};

MobileDashboardOverview.propTypes = {
    user: PropTypes.shape({
        id: PropTypes.string.isRequired,
        fullName: PropTypes.string,
        email: PropTypes.string.isRequired,
        role: PropTypes.string.isRequired,
    }),
    profile: PropTypes.shape({
        expertiseTags: PropTypes.array,
        expertiseTagsText: PropTypes.string,
        socialLinks: PropTypes.object,
    }),
    courses: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string.isRequired,
            title: PropTypes.string,
            isPublished: PropTypes.bool,
            aiAssistantEnabled: PropTypes.bool,
        })
    ),
    publishedCount: PropTypes.number.isRequired,
    pendingCount: PropTypes.number.isRequired,
    aiEnabledCount: PropTypes.number.isRequired,
    analyticsLink: PropTypes.string.isRequired,
};

export default MobileDashboardOverview;
