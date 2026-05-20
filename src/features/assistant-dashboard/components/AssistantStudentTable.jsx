
import { useTranslation } from 'react-i18next';
import {
    DashboardFilterBar,
    DashboardInsetPanel,
    DashboardMetricCard,
    DashboardWorkspaceHero,
    EmptyState,
    StatusBadge,
} from '@components/ui/dashboard';
import AssistantCourseStats from './AssistantCourseStats';
import AssistantPagination from './AssistantPagination';
import { FiBookOpen, FiCheckCircle, FiSearch, FiUsers } from 'react-icons/fi';

const AssistantStudentTable = ({
    students,
    totalStudents,
    enrolledStudents,
    courses,
    courseCounts,
    enrollmentsMap,
    courseSelections,
    coursesById,
    getActionKey,
    currentPage,
    totalPages,
    loading,
    search,
    setSearch,
    setCurrentPage,
    setCourseSelections,
    handleEnroll,
    handleUnenroll,
    isSearchTooShort,
    lastEnrollmentFeedback,
    pendingEnrollmentAction,
}) => {
    const { t } = useTranslation();

    const emptyStateCopy = (() => {
        if (isSearchTooShort) {
            return {
                title: t('assistantDashboard.students.empty.searchTooShort.title'),
                subtitle: t('assistantDashboard.students.empty.searchTooShort.subtitle'),
            };
        }
        if (search.trim().length >= 3) {
            return {
                title: t('assistantDashboard.students.empty.noSearchResults.title'),
                subtitle: t('assistantDashboard.students.empty.noSearchResults.subtitle'),
            };
        }
        if (!courses.length) {
            return {
                title: t('assistantDashboard.students.empty.noCourses.title'),
                subtitle: t('assistantDashboard.students.empty.noCourses.subtitle'),
            };
        }
        return {
            title: t('assistantDashboard.students.empty.noStudents.title'),
            subtitle: t('assistantDashboard.students.empty.noStudents.subtitle'),
        };
    })();

    return (
        <div className="space-y-6">
            <DashboardWorkspaceHero
                eyebrow={t('assistantDashboard.students.hero.eyebrow')}
                title={t('assistantDashboard.students.hero.title')}
                description={t('assistantDashboard.students.hero.description')}
                metrics={(
                    <>
                        <DashboardMetricCard label={t('assistantDashboard.metrics.totalStudents')} value={totalStudents} icon={FiUsers} />
                        <DashboardMetricCard label={t('assistantDashboard.metrics.enrolledStudents')} value={enrolledStudents.length} icon={FiCheckCircle} tone="green" />
                        <DashboardMetricCard label={t('assistantDashboard.metrics.publishedCourses')} value={courses.length} icon={FiBookOpen} tone="blue" />
                    </>
                )}
                metricsClassName="grid grid-cols-1 gap-3 sm:grid-cols-3"
            >
                <DashboardFilterBar gridClassName="xl:grid-cols-[minmax(0,1fr)]">
                    <label className="relative block">
                        <FiSearch className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-edubot-muted" />
                        <input
                            type="text"
                            placeholder={t('assistantDashboard.students.searchPlaceholder')}
                            className="dashboard-field dashboard-field-icon"
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setCurrentPage(1);
                            }}
                            disabled={loading}
                        />
                        {isSearchTooShort && (
                            <p className="mt-2 text-xs text-edubot-muted dark:text-slate-400">
                                {t('assistantDashboard.students.searchTooShortHelp')}
                            </p>
                        )}
                    </label>
                </DashboardFilterBar>
            </DashboardWorkspaceHero>

            <AssistantCourseStats
                courses={courses}
                courseCounts={courseCounts}
                loading={loading}
            />

            <DashboardInsetPanel
                title={t('assistantDashboard.students.list.title')}
                description={t('assistantDashboard.students.list.description')}
            >
                {lastEnrollmentFeedback && (
                    <div
                        className={`mb-4 rounded-2xl border px-4 py-3 text-sm ${
                            lastEnrollmentFeedback.type === 'error'
                                ? 'border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-200'
                                : lastEnrollmentFeedback.type === 'success'
                                    ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-200'
                                    : 'border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-900/60 dark:bg-blue-950/30 dark:text-blue-200'
                        }`}
                        role={lastEnrollmentFeedback.type === 'error' ? 'alert' : 'status'}
                    >
                        {lastEnrollmentFeedback.message}
                    </div>
                )}

                {loading ? (
                    <div className="dashboard-panel-muted p-10 text-center text-sm text-edubot-muted dark:text-slate-400">
                        {t('common.loading')}
                    </div>
                ) : students.length === 0 ? (
                    <EmptyState
                        title={emptyStateCopy.title}
                        subtitle={emptyStateCopy.subtitle}
                    />
                ) : (
                    <div className="grid gap-4">
                        {students.map((student) => {
                            const selectedCourseId = courseSelections[student.id] || '';
                            const enrolledCourseIds = enrollmentsMap[student.id] || [];
                            const availableCourses = courses.filter(
                                (course) => !enrolledCourseIds.some((courseId) => Number(courseId) === Number(course.id))
                            );
                            const isDisabled = !selectedCourseId || availableCourses.length === 0;
                            const selectedCourse = selectedCourseId ? coursesById[selectedCourseId] : null;
                            const enrollActionKey = selectedCourseId
                                ? getActionKey(student.id, selectedCourseId, 'enroll')
                                : null;
                            const isEnrolling = pendingEnrollmentAction === enrollActionKey;
                            const rowFeedback =
                                lastEnrollmentFeedback?.studentId === student.id
                                    ? lastEnrollmentFeedback
                                    : null;

                            return (
                                <article
                                    key={student.id}
                                    className="dashboard-panel-muted rounded-3xl p-4"
                                >
                                    <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                                        <div className="min-w-0 flex-1">
                                            <div className="text-base font-semibold text-edubot-ink dark:text-white">
                                                {student.fullName}
                                            </div>
                                            <div className="mt-1 text-sm text-edubot-muted dark:text-slate-400">
                                                {student.email}
                                            </div>
                                            <div className="text-sm text-edubot-muted dark:text-slate-400">
                                                {student.phoneNumber || '—'}
                                            </div>
                                            {rowFeedback && (
                                                <div
                                                    className={`mt-3 rounded-2xl border px-3 py-2 text-xs ${
                                                        rowFeedback.type === 'error'
                                                            ? 'border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-200'
                                                            : rowFeedback.type === 'success'
                                                                ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-200'
                                                                : 'border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-900/60 dark:bg-blue-950/30 dark:text-blue-200'
                                                    }`}
                                                    role={rowFeedback.type === 'error' ? 'alert' : 'status'}
                                                >
                                                    {rowFeedback.message}
                                                </div>
                                            )}

                                            <div className="mt-4 flex flex-wrap gap-2">
                                                {enrolledCourseIds.length ? (
                                                    enrolledCourseIds.map((courseId) => {
                                                        const course = coursesById[courseId];
                                                        if (!course) return null;

                                                        return (
                                                            <div
                                                                key={courseId}
                                                                className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 dark:border-emerald-500/30 dark:bg-emerald-500/10"
                                                            >
                                                                <span className="text-xs font-medium text-emerald-800 dark:text-emerald-200">
                                                                    {course.title}
                                                                </span>
                                                                <button
                                                                    type="button"
                                                                    className="rounded-full bg-red-600 px-2 py-0.5 text-[11px] font-semibold text-white hover:bg-red-700"
                                                                    disabled={pendingEnrollmentAction === getActionKey(student.id, courseId, 'unenroll')}
                                                                    onClick={() => handleUnenroll(student, courseId)}
                                                                    aria-label={t('assistantDashboard.students.unenrollAria', {
                                                                        student: student.fullName,
                                                                        course: course.title,
                                                                    })}
                                                                    title={t('assistantDashboard.students.unenrollTitle')}
                                                                >
                                                                    {pendingEnrollmentAction === getActionKey(student.id, courseId, 'unenroll')
                                                                        ? t('assistantDashboard.students.unenrolling')
                                                                        : t('assistantDashboard.students.unenroll')}
                                                                </button>
                                                            </div>
                                                        );
                                                    })
                                                ) : (
                                                    <StatusBadge tone="default">{t('assistantDashboard.students.noEnrolledCourse')}</StatusBadge>
                                                )}
                                            </div>
                                        </div>

                                        <div className="w-full xl:w-[20rem] space-y-3">
                                            {availableCourses.length > 0 ? (
                                                <div>
                                                    <label htmlFor={`assistant-course-${student.id}`} className="mb-1 block text-xs font-semibold text-edubot-muted dark:text-slate-400">
                                                        {t('assistantDashboard.students.courseSelectLabel')}
                                                    </label>
                                                    <select
                                                        id={`assistant-course-${student.id}`}
                                                        className="dashboard-select w-full"
                                                        value={selectedCourseId}
                                                        onChange={(e) =>
                                                            setCourseSelections((prev) => ({
                                                                ...prev,
                                                                [student.id]: e.target.value ? Number(e.target.value) : '',
                                                            }))
                                                        }
                                                    >
                                                        <option value="">{t('assistantDashboard.students.courseSelectPlaceholder')}</option>
                                                        {availableCourses.map((course) => (
                                                            <option key={course.id} value={course.id}>
                                                                {course.title}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    {selectedCourse && (
                                                        <p className="mt-1 text-xs text-edubot-muted dark:text-slate-400">
                                                            {t('assistantDashboard.students.selectedCourse', {
                                                                course: selectedCourse.title,
                                                            })}
                                                        </p>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="text-sm italic text-edubot-muted dark:text-slate-400">
                                                    {t('assistantDashboard.students.allCoursesEnrolled')}
                                                </div>
                                            )}

                                            <button
                                                type="button"
                                                className="dashboard-button-primary w-full justify-center disabled:opacity-50"
                                                disabled={isDisabled || Boolean(pendingEnrollmentAction)}
                                                onClick={() => {
                                                    if (isDisabled) return;
                                                    handleEnroll(student, selectedCourseId);
                                                }}
                                            >
                                                {isEnrolling
                                                    ? t('assistantDashboard.students.enrolling')
                                                    : t('assistantDashboard.students.enroll')}
                                            </button>
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}

                <AssistantPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    loading={loading}
                    setCurrentPage={setCurrentPage}
                />
            </DashboardInsetPanel>
        </div>
    );
};

export default AssistantStudentTable;
