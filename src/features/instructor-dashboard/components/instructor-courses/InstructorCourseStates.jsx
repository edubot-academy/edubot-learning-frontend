import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export const InstructorCourseLoadError = ({ onReload }) => {
    const { t } = useTranslation();

    return (
        <div className="mb-6 rounded border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-200">
            <p className="font-semibold">{t('instructorDashboard.coursesPage.errors.load')}</p>
            <button
                type="button"
                onClick={onReload}
                className="mt-2 rounded bg-red-600 px-3 py-1 text-sm font-semibold text-white hover:bg-red-700"
            >
                {t('instructorDashboard.coursesPage.actions.reload')}
            </button>
        </div>
    );
};

InstructorCourseLoadError.propTypes = {
    onReload: PropTypes.func.isRequired,
};

export const InstructorCourseLoadingStatus = () => {
    const { t } = useTranslation();

    return (
        <div className="mb-6 text-center text-gray-600 dark:text-gray-300" role="status">
            {t('instructorDashboard.coursesPage.loading')}
        </div>
    );
};

export const InstructorCourseEmptyStates = ({
    coursesCount,
    filteredCoursesCount,
    hasError,
    loading,
}) => {
    const { t } = useTranslation();

    if (loading || hasError) return null;

    if (!coursesCount) {
        return (
            <div className="rounded border border-gray-200 p-6 text-center text-gray-600 dark:border-gray-800 dark:text-gray-300">
                {t('instructorDashboard.coursesPage.empty.noCourses')}
                <div className="mt-4">
                    <Link
                        to="/instructor/course/create"
                        className="inline-block rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
                    >
                        {t('instructorDashboard.coursesPage.actions.createFirst')}
                    </Link>
                </div>
            </div>
        );
    }

    if (!filteredCoursesCount) {
        return (
            <div className="rounded border border-gray-200 p-6 text-center text-gray-600 dark:border-gray-800 dark:text-gray-300">
                {t('instructorDashboard.coursesPage.empty.noFilteredCourses')}
            </div>
        );
    }

    return null;
};

InstructorCourseEmptyStates.propTypes = {
    coursesCount: PropTypes.number.isRequired,
    filteredCoursesCount: PropTypes.number.isRequired,
    hasError: PropTypes.bool.isRequired,
    loading: PropTypes.bool.isRequired,
};
