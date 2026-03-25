import React from 'react';
import { FiBookOpen, FiUsers, FiBarChart2, FiCalendar, FiMessageSquare, FiSettings, FiTrendingUp, FiAward } from 'react-icons/fi';

/**
 * EmptyCoursesState - Illustrated empty state for course-related sections
 * Used across Instructor, Admin, and Student dashboards
 */
const EmptyCoursesState = ({ role = 'student', onAction = null, actionLabel = null }) => {
    const getRoleSpecificContent = () => {
        switch (role) {
            case 'instructor':
                return {
                    icon: FiBookOpen,
                    color: 'blue',
                    title: 'Курстар азырынча жок',
                    description: 'Биринчи курсуңузду түзүп баштаңыз',
                    actionLabel: actionLabel || 'Курс түзүү'
                };
            case 'admin':
                return {
                    icon: FiBookOpen,
                    color: 'purple',
                    title: 'Системада курстар жок',
                    description: 'Платформада курстар жазылган эмес',
                    actionLabel: actionLabel || 'Башкаруу'
                };
            case 'assistant':
                return {
                    icon: FiBookOpen,
                    color: 'green',
                    title: 'Бекитилген курстар жок',
                    description: 'Ассистент катышуусу үчүн курстар жок',
                    actionLabel: actionLabel || 'Курстарды көрүү'
                };
            default: // student
                return {
                    icon: FiBookOpen,
                    color: 'blue',
                    title: 'Курстар азырынча жок',
                    description: 'Курстарга катышуу үчүн катталыңыз',
                    actionLabel: actionLabel || 'Курстарды издөө'
                };
        }
    };

    const { icon: Icon, color, title, description, actionLabel: defaultActionLabel } = getRoleSpecificContent();

    const colorClasses = {
        blue: 'from-blue-100 to-blue-200 text-blue-600',
        purple: 'from-purple-100 to-purple-200 text-purple-600',
        green: 'from-green-100 to-green-200 text-green-600',
        orange: 'from-orange-100 to-orange-200 text-orange-600'
    };

    return (
        <div className="text-center py-12">
            {/* Illustrated icon container */}
            <div className={`w-32 h-32 mx-auto mb-6 bg-gradient-to-br ${colorClasses[color]} rounded-full flex items-center justify-center shadow-lg`}>
                <Icon className="w-16 h-16" />
            </div>

            {/* Content */}
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                {title}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                {description}
            </p>

            {/* Action button */}
            {onAction && defaultActionLabel && (
                <button
                    onClick={onAction}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-xl transition-all duration-200 transform hover:scale-105 hover:shadow-lg"
                >
                    {defaultActionLabel}
                </button>
            )}
        </div>
    );
};

/**
 * EmptyStudentsState - Illustrated empty state for student-related sections
 * Used across Instructor and Assistant dashboards
 */
const EmptyStudentsState = ({ role = 'instructor', onAction = null, actionLabel = null }) => {
    const getRoleSpecificContent = () => {
        switch (role) {
            case 'instructor':
                return {
                    icon: FiUsers,
                    color: 'green',
                    title: 'Студенттер азырынча жок',
                    description: 'Биринчи студентиңизди кошуңуз же курска чакырыңыз',
                    actionLabel: actionLabel || 'Студент кошуу'
                };
            case 'assistant':
                return {
                    icon: FiUsers,
                    color: 'blue',
                    title: 'Бекитилген студенттер жок',
                    description: 'Ассистент катышуусу үчүн студенттер жок',
                    actionLabel: actionLabel || 'Студенттерди башкаруу'
                };
            default:
                return {
                    icon: FiUsers,
                    color: 'gray',
                    title: 'Студенттер жок',
                    description: 'Бул бөлүктө студенттер жок',
                    actionLabel: actionLabel || 'Кайтуу'
                };
        }
    };

    const { icon: Icon, color, title, description, actionLabel: defaultActionLabel } = getRoleSpecificContent();

    const colorClasses = {
        blue: 'from-blue-100 to-blue-200 text-blue-600',
        green: 'from-green-100 to-green-200 text-green-600',
        gray: 'from-gray-100 to-gray-200 text-gray-600'
    };

    return (
        <div className="text-center py-12">
            <div className={`w-32 h-32 mx-auto mb-6 bg-gradient-to-br ${colorClasses[color]} rounded-full flex items-center justify-center shadow-lg`}>
                <Icon className="w-16 h-16" />
            </div>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                {title}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                {description}
            </p>

            {onAction && defaultActionLabel && (
                <button
                    onClick={onAction}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium rounded-xl transition-all duration-200 transform hover:scale-105 hover:shadow-lg"
                >
                    {defaultActionLabel}
                </button>
            )}
        </div>
    );
};

/**
 * EmptyStatsState - Illustrated empty state for statistics/analytics sections
 * Used across Admin and Instructor dashboards
 */
const EmptyStatsState = ({ onAction = null, actionLabel = null }) => {
    return (
        <div className="text-center py-12">
            <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center shadow-lg">
                <FiBarChart2 className="w-16 h-16 text-purple-600" />
            </div>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Статистика жок
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                Активдүүлүк үчүн маалымат жок. Кыскача убакыттан кийин статистика пайда болот.
            </p>

            {onAction && actionLabel && (
                <button
                    onClick={onAction}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-medium rounded-xl transition-all duration-200 transform hover:scale-105 hover:shadow-lg"
                >
                    {actionLabel}
                </button>
            )}
        </div>
    );
};

/**
 * EmptyScheduleState - Illustrated empty state for schedule/calendar sections
 * Used across Student and Instructor dashboards
 */
const EmptyScheduleState = ({ role = 'student', onAction = null, actionLabel = null }) => {
    const getRoleSpecificContent = () => {
        switch (role) {
            case 'instructor':
                return {
                    icon: FiCalendar,
                    color: 'orange',
                    title: 'Сабактар жок',
                    description: 'Күн тартибиңиз бош, жаңы сабак жасап көрүңүз',
                    actionLabel: actionLabel || 'Сабак түзүү'
                };
            default: // student
                return {
                    icon: FiCalendar,
                    color: 'blue',
                    title: 'Күн тариби бош',
                    description: 'Жакынкы күндөгү сабактар жок',
                    actionLabel: actionLabel || 'Курстарды көрүү'
                };
        }
    };

    const { icon: Icon, color, title, description, actionLabel: defaultActionLabel } = getRoleSpecificContent();

    const colorClasses = {
        blue: 'from-blue-100 to-blue-200 text-blue-600',
        orange: 'from-orange-100 to-orange-200 text-orange-600'
    };

    return (
        <div className="text-center py-12">
            <div className={`w-32 h-32 mx-auto mb-6 bg-gradient-to-br ${colorClasses[color]} rounded-full flex items-center justify-center shadow-lg`}>
                <Icon className="w-16 h-16" />
            </div>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                {title}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                {description}
            </p>

            {onAction && defaultActionLabel && (
                <button
                    onClick={onAction}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-xl transition-all duration-200 transform hover:scale-105 hover:shadow-lg"
                >
                    {defaultActionLabel}
                </button>
            )}
        </div>
    );
};

/**
 * EmptyMessagesState - Illustrated empty state for messages/communications
 * Used across all dashboards
 */
const EmptyMessagesState = ({ onAction = null, actionLabel = null }) => {
    return (
        <div className="text-center py-12">
            <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center shadow-lg">
                <FiMessageSquare className="w-16 h-16 text-green-600" />
            </div>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Билдирүүлөр жок
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                Сизде жаңы билдирүүлөр жок. Бардык билдирүүлөр бул жерде көрсөтүлөт.
            </p>

            {onAction && actionLabel && (
                <button
                    onClick={onAction}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium rounded-xl transition-all duration-200 transform hover:scale-105 hover:shadow-lg"
                >
                    {actionLabel}
                </button>
            )}
        </div>
    );
};

/**
 * EmptyAchievementsState - Illustrated empty state for achievements/progress
 * Used across Student and Leaderboard dashboards
 */
const EmptyAchievementsState = ({ onAction = null, actionLabel = null }) => {
    return (
        <div className="text-center py-12">
            <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-yellow-100 to-orange-200 rounded-full flex items-center justify-center shadow-lg">
                <FiAward className="w-16 h-16 text-orange-600" />
            </div>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Жетишкендиктер азырынча жок
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                Курстарда активдүү катышып жетишкендиктерге жетүңүз. Биринчи жетишкендигиңизди алыңыз!
            </p>

            {onAction && actionLabel && (
                <button
                    onClick={onAction}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white font-medium rounded-xl transition-all duration-200 transform hover:scale-105 hover:shadow-lg"
                >
                    {actionLabel}
                </button>
            )}
        </div>
    );
};

export {
    EmptyCoursesState,
    EmptyStudentsState,
    EmptyStatsState,
    EmptyScheduleState,
    EmptyMessagesState,
    EmptyAchievementsState
};
