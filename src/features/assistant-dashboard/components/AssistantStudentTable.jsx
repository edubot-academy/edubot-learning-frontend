/* eslint-disable react/prop-types */
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
    currentPage,
    totalPages,
    loading,
    search,
    setSearch,
    setCurrentPage,
    setCourseSelections,
    handleEnroll,
    handleUnenroll,
}) => {
    return (
        <div className="space-y-6">
            <DashboardWorkspaceHero
                eyebrow="Assistant workspace"
                title="Студент каттоо агымы"
                description="Компаниядагы студенттерди көрүп, жеткиликтүү курстарга тез каттап же чыгарыңыз."
                metrics={(
                    <>
                        <DashboardMetricCard label="Жалпы студенттер" value={totalStudents} icon={FiUsers} />
                        <DashboardMetricCard label="Катталган студенттер" value={enrolledStudents.length} icon={FiCheckCircle} tone="green" />
                        <DashboardMetricCard label="Жарыяланган курстар" value={courses.length} icon={FiBookOpen} tone="blue" />
                    </>
                )}
                metricsClassName="grid grid-cols-1 gap-3 sm:grid-cols-3"
            >
                <DashboardFilterBar gridClassName="xl:grid-cols-[minmax(0,1fr)]">
                    <label className="relative block">
                        <FiSearch className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-edubot-muted" />
                        <input
                            type="text"
                            placeholder="Студент атын же email изде..."
                            className="dashboard-field dashboard-field-icon"
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setCurrentPage(1);
                            }}
                            disabled={loading}
                        />
                    </label>
                </DashboardFilterBar>
            </DashboardWorkspaceHero>

            <AssistantCourseStats
                courses={courses}
                courseCounts={courseCounts}
                loading={loading}
            />

            <DashboardInsetPanel
                title="Студенттер тизмеси"
                description="Ар бир студент үчүн активдүү курстарды көрүп, жаңы курс тандап каттоо аракетин аткарыңыз."
            >
                {loading ? (
                    <div className="dashboard-panel-muted p-10 text-center text-sm text-edubot-muted dark:text-slate-400">
                        Жүктөлүүдө...
                    </div>
                ) : students.length === 0 ? (
                    <EmptyState
                        title="Бекитилген студенттер жок"
                        subtitle="Ассистент катышуусу үчүн студенттер жок."
                    />
                ) : (
                    <div className="grid gap-4">
                        {students.map((student) => {
                            const selectedCourseId = courseSelections[student.id] || '';
                            const enrolledCourseIds = enrollmentsMap[student.id] || [];
                            const availableCourses = courses.filter(
                                (course) => !enrolledCourseIds.includes(course.id)
                            );
                            const isDisabled = !selectedCourseId || availableCourses.length === 0;

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
                                                                    className="rounded-full bg-red-600 px-2 py-0.5 text-[11px] font-semibold text-white hover:bg-red-700"
                                                                    onClick={() => handleUnenroll(student, courseId)}
                                                                    title="Курстан чыгаруу"
                                                                >
                                                                    Чыгаруу
                                                                </button>
                                                            </div>
                                                        );
                                                    })
                                                ) : (
                                                    <StatusBadge tone="default">Катталган курс жок</StatusBadge>
                                                )}
                                            </div>
                                        </div>

                                        <div className="w-full xl:w-[20rem] space-y-3">
                                            {availableCourses.length > 0 ? (
                                                <select
                                                    className="dashboard-select w-full"
                                                    value={selectedCourseId}
                                                    onChange={(e) =>
                                                        setCourseSelections((prev) => ({
                                                            ...prev,
                                                            [student.id]: e.target.value ? Number(e.target.value) : '',
                                                        }))
                                                    }
                                                >
                                                    <option value="">-- Тандоо --</option>
                                                    {availableCourses.map((course) => (
                                                        <option key={course.id} value={course.id}>
                                                            {course.title}
                                                        </option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <div className="text-sm italic text-edubot-muted dark:text-slate-400">
                                                    Бардык курстарга катталган
                                                </div>
                                            )}

                                            <button
                                                className="dashboard-button-primary w-full justify-center disabled:opacity-50"
                                                disabled={isDisabled}
                                                onClick={() => {
                                                    if (isDisabled) return;
                                                    handleEnroll(student, selectedCourseId);
                                                }}
                                            >
                                                Каттоо
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
