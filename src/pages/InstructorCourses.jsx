import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../context/AuthContext';
import { useInstructorCourseListPage } from '@features/instructor-dashboard/hooks/useInstructorCourseListPage';
import { useInstructorCoursePageModel } from '@features/instructor-dashboard/hooks/useInstructorCoursePageModel';
import {
    InstructorCourseEmptyStates,
    InstructorCourseFilters,
    InstructorCourseGrid,
    InstructorCourseLoadError,
    InstructorCourseLoadingStatus,
    InstructorCourseSummary,
} from '@features/instructor-dashboard/components/instructor-courses';

const InstructorCourses = () => {
    const { t, i18n } = useTranslation();
    const { user } = useContext(AuthContext);
    const { courses, error, loading, refresh } = useInstructorCourseListPage(user);
    const {
        courseFilters,
        courseTypeFilters,
        filteredCourses,
        lastLoadedLabel,
        lifecycleCounts,
        query,
        setQuery,
        setStatusFilter,
        setTypeFilter,
        statusFilter,
        typeFilter,
        workflowCounts,
    } = useInstructorCoursePageModel({
        courses,
        error,
        i18nLanguage: i18n.language,
        loading,
        t,
        user,
    });

    return (
        <div className="min-h-screen p-6 pt-24 max-w-6xl mx-auto">
            <h1 className="text-4xl font-bold mb-8 text-center">{t('instructorDashboard.coursesPage.title')}</h1>
            <InstructorCourseSummary
                lastLoadedLabel={lastLoadedLabel}
                loading={loading}
                onRefresh={refresh}
                workflowCounts={workflowCounts}
            />
            {error ? <InstructorCourseLoadError onReload={refresh} /> : null}
            {loading ? <InstructorCourseLoadingStatus /> : null}

            <InstructorCourseFilters
                courseFilters={courseFilters}
                courseTypeFilters={courseTypeFilters}
                lifecycleCounts={lifecycleCounts}
                onQueryChange={setQuery}
                onStatusFilterChange={setStatusFilter}
                onTypeFilterChange={setTypeFilter}
                query={query}
                statusFilter={statusFilter}
                typeFilter={typeFilter}
            />

            <InstructorCourseGrid filteredCourses={filteredCourses} />
            <InstructorCourseEmptyStates
                coursesCount={courses.length}
                filteredCoursesCount={filteredCourses.length}
                hasError={Boolean(error)}
                loading={loading}
            />
        </div>
    );
};

export default InstructorCourses;
