import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { filterOptionShape } from './propTypes';

const InstructorCourseFilters = ({
    courseFilters,
    courseTypeFilters,
    lifecycleCounts,
    onQueryChange,
    onStatusFilterChange,
    onTypeFilterChange,
    query,
    statusFilter,
    typeFilter,
}) => {
    const { t } = useTranslation();

    return (
        <section
            aria-label={t('instructorDashboard.coursesPage.filtersLabel')}
            className="mb-6 rounded border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-[#141619]"
        >
            <div className="grid gap-3 md:grid-cols-[1fr_auto_auto] md:items-end">
                <div>
                    <label htmlFor="instructor-course-search" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
                        {t('instructorDashboard.coursesPage.filters.search')}
                    </label>
                    <input
                        id="instructor-course-search"
                        type="search"
                        value={query}
                        onChange={(event) => onQueryChange(event.target.value)}
                        className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                        placeholder={t('instructorDashboard.coursesPage.filters.searchPlaceholder')}
                    />
                </div>

                <div>
                    <label htmlFor="instructor-course-status" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
                        {t('instructorDashboard.coursesPage.filters.status')}
                    </label>
                    <select
                        id="instructor-course-status"
                        value={statusFilter}
                        onChange={(event) => onStatusFilterChange(event.target.value)}
                        className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white md:min-w-48"
                    >
                        {courseFilters.map((filter) => (
                            <option key={filter.value} value={filter.value}>
                                {filter.label}
                                {filter.value !== 'all' && lifecycleCounts[filter.value]
                                    ? ` (${lifecycleCounts[filter.value]})`
                                    : ''}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label htmlFor="instructor-course-type" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
                        {t('instructorDashboard.coursesPage.filters.workflow')}
                    </label>
                    <select
                        id="instructor-course-type"
                        value={typeFilter}
                        onChange={(event) => onTypeFilterChange(event.target.value)}
                        className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white md:min-w-48"
                    >
                        {courseTypeFilters.map((filter) => (
                            <option key={filter.value} value={filter.value}>
                                {filter.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
        </section>
    );
};

InstructorCourseFilters.propTypes = {
    courseFilters: PropTypes.arrayOf(filterOptionShape).isRequired,
    courseTypeFilters: PropTypes.arrayOf(filterOptionShape).isRequired,
    lifecycleCounts: PropTypes.objectOf(PropTypes.number).isRequired,
    onQueryChange: PropTypes.func.isRequired,
    onStatusFilterChange: PropTypes.func.isRequired,
    onTypeFilterChange: PropTypes.func.isRequired,
    query: PropTypes.string.isRequired,
    statusFilter: PropTypes.string.isRequired,
    typeFilter: PropTypes.string.isRequired,
};

export default InstructorCourseFilters;
