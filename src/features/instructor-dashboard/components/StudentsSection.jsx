import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    FiActivity,
    FiBookOpen,
    FiCalendar,
    FiChevronLeft,
    FiChevronRight,
    FiLayers,
    FiMail,
    FiPhone,
    FiSearch,
    FiUsers,
} from 'react-icons/fi';
import {
    DashboardCardSkeleton,
    DashboardInsetPanel,
    DashboardMetricCard,
    DashboardSectionHeader,
    DashboardTableSkeleton,
    EmptyState,
} from '@components/ui/dashboard';
import { downloadCourseCertificatePdf } from '@features/courses/api';

const formatDate = (value, language = 'ky') => {
    if (!value) return '—';
    const date = new Date(value);
    const locale = language === 'ru' ? 'ru-RU' : language === 'en' ? 'en-US' : 'ky-KG';
    return Number.isNaN(date.getTime())
        ? '—'
        : date.toLocaleDateString(locale, {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
          });
};

const formatLastViewed = (student, t) => {
    if (!student.lastViewedLessonId) return '—';

    const rawTime = Number(student.lastVideoTime) || 0;
    const totalSeconds = rawTime > 1000 ? Math.round(rawTime / 1000) : Math.round(rawTime);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = String(totalSeconds % 60).padStart(2, '0');
    const timeText = totalSeconds ? ` (${minutes}:${seconds})` : '';

    return t('instructorDashboard.studentsSection.studentCard.lessonNumber', {
        id: student.lastViewedLessonId,
        time: timeText,
    });
};

const getCourseStatusLabel = (course, t) => {
    if (course.isPublished) return t('instructorDashboard.studentsSection.courseStatus.published');
    if (course.status === 'approved') return t('instructorDashboard.studentsSection.courseStatus.approved');
    if (course.status === 'rejected') return t('instructorDashboard.studentsSection.courseStatus.rejected');
    if (course.status === 'draft') return t('instructorDashboard.studentsSection.courseStatus.draft');
    return t('instructorDashboard.studentsSection.courseStatus.pending');
};

const getCertificateStatusLabel = (status, t) => {
    if (status === 'issued') return t('adminCertificates.status.issued');
    if (status === 'pending_approval') return t('adminCertificates.status.pending_approval');
    if (status === 'rejected') return t('adminCertificates.status.rejected');
    if (status === 'revoked') return t('adminCertificates.status.revoked');
    return t('adminCertificates.status.none');
};

const StudentsSection = ({
    total,
    courses = [],
    loadingCourses,
    selectedCourseId,
    onSelectCourse,
    courseStudents,
    courseMeta,
    loadingStudents,
    error,
    refreshCourses,
    studentsPage,
    onChangePage,
    search,
    onSearchChange,
    progressMin,
    progressMax,
    onProgressMinChange,
    onProgressMaxChange,
}) => {
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const selectedCourse = courses.find((course) => course.id === selectedCourseId) || null;

    const sortedStudents = (courseStudents || []).slice().sort((a, b) => {
        const aDate = a.enrolledAt ? new Date(a.enrolledAt).getTime() : 0;
        const bDate = b.enrolledAt ? new Date(b.enrolledAt).getTime() : 0;
        return bDate - aDate;
    });

    const averageProgress = sortedStudents.length
        ? Math.round(
              sortedStudents.reduce(
                  (sum, student) => sum + Math.max(0, Math.min(100, Number(student.progressPercent || 0))),
                  0
              ) / sortedStudents.length
          )
        : 0;

    const completedCount = sortedStudents.filter((student) => student.completed).length;
    return (
        <div className="space-y-5">
            <div className="dashboard-panel overflow-hidden">
                <DashboardSectionHeader
                    eyebrow={t('instructorDashboard.studentsSection.hero.eyebrow')}
                    title={t('instructorDashboard.studentsSection.hero.title')}
                    description={t('instructorDashboard.studentsSection.hero.description')}
                    action={
                        <button
                            type="button"
                            onClick={refreshCourses}
                            disabled={loadingCourses}
                            className="dashboard-button-secondary"
                        >
                            {t('common.refresh')}
                        </button>
                    }
                />

                <div className="grid gap-3 px-6 pb-6 md:grid-cols-2 xl:grid-cols-4">
                    <DashboardMetricCard
                        label={t('instructorDashboard.studentsSection.metrics.totalStudents')}
                        value={total ?? '—'}
                        icon={FiUsers}
                    />
                    <DashboardMetricCard
                        label={t('instructorDashboard.studentsSection.metrics.courses')}
                        value={courses.length}
                        icon={FiBookOpen}
                        tone="blue"
                    />
                    <DashboardMetricCard
                        label={t('instructorDashboard.studentsSection.metrics.selectedCourseStudents')}
                        value={selectedCourseId ? sortedStudents.length : '—'}
                        icon={FiLayers}
                        tone="green"
                    />
                    <DashboardMetricCard
                        label={t('instructorDashboard.studentsSection.metrics.averageProgress')}
                        value={selectedCourseId ? `${averageProgress}%` : '—'}
                        icon={FiActivity}
                        tone="amber"
                    />
                </div>
            </div>

            {error ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
                    {error}
                </div>
            ) : null}

            {!selectedCourseId ? (
                <DashboardInsetPanel
                    title={t('instructorDashboard.studentsSection.courseSelection.title')}
                    description={t('instructorDashboard.studentsSection.courseSelection.description')}
                >
                    {loadingCourses && !courses.length ? (
                        <div className="mt-4">
                            <DashboardCardSkeleton cards={6} />
                        </div>
                    ) : courses.length ? (
                        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                            {courses.map((course) => (
                                <button
                                    type="button"
                                    key={course.id || course.title}
                                    onClick={() => onSelectCourse(course.id)}
                                    className="group overflow-hidden rounded-panel border border-edubot-line/80 bg-white/90 text-left shadow-edubot-card transition-all duration-300 hover:-translate-y-1 hover:border-edubot-orange/60 hover:shadow-edubot-hover dark:border-slate-700 dark:bg-slate-900/80"
                                >
                                    <div className="h-36 w-full overflow-hidden">
                                        {course.coverImageUrl ? (
                                            <img
                                                src={course.coverImageUrl}
                                                alt={course.title || t('instructorDashboard.studentsSection.courseSelection.courseImageAlt')}
                                                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center bg-edubot-surfaceAlt text-sm font-semibold text-edubot-muted dark:bg-slate-800 dark:text-slate-300">
                                                {t('instructorDashboard.studentsSection.courseSelection.noCourseImage')}
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-3 p-5">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <p className="line-clamp-2 text-base font-semibold text-edubot-ink dark:text-white">
                                                    {course.title}
                                                </p>
                                            </div>
                                            <span
                                                className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                                                    course.isPublished
                                                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300'
                                                        : 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300'
                                                }`}
                                            >
                                                {getCourseStatusLabel(course, t)}
                                            </span>
                                        </div>

                                        <div className="grid gap-2 text-sm text-edubot-muted dark:text-slate-400">
                                            <div className="flex items-center justify-between gap-2">
                                                <span>{t('instructorDashboard.studentsSection.studentCard.students')}</span>
                                                <span className="font-semibold text-edubot-ink dark:text-white">
                                                    {course.studentCount ?? 0}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between gap-2">
                                                <span>{t('instructorDashboard.studentsSection.courseSelection.created')}</span>
                                                <span className="font-semibold text-edubot-ink dark:text-white">
                                                    {formatDate(course.createdAt, i18n.language)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <EmptyState
                            title={t('instructorDashboard.studentsSection.courseSelection.emptyTitle')}
                            subtitle={t('instructorDashboard.studentsSection.courseSelection.emptySubtitle')}
                            action={{
                                label: t('instructorDashboard.coursesSection.actions.createCourse'),
                                onClick: () => navigate('/instructor/course/create'),
                            }}
                            className="py-8"
                        />
                    )}
                </DashboardInsetPanel>
            ) : (
                <>
                    <DashboardInsetPanel
                        title={courseMeta?.title || selectedCourse?.title || t('instructorDashboard.studentsSection.list.fallbackTitle')}
                        description={t('instructorDashboard.studentsSection.courseWorkspace.description')}
                        action={
                            <button
                                type="button"
                                onClick={() => onSelectCourse(null)}
                                className="dashboard-button-secondary"
                            >
                                {t('instructorDashboard.studentsSection.courseWorkspace.backToCourses')}
                            </button>
                        }
                    >
                        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                            <DashboardMetricCard
                                label={t('instructorDashboard.studentsSection.metrics.courseStudents')}
                                value={courseMeta?.studentCount ?? sortedStudents.length}
                                icon={FiUsers}
                            />
                            <DashboardMetricCard
                                label={t('instructorDashboard.studentsSection.metrics.lessons')}
                                value={courseMeta?.lessonCount ?? '—'}
                                icon={FiBookOpen}
                                tone="blue"
                            />
                            <DashboardMetricCard
                                label={t('instructorDashboard.studentsSection.metrics.completed')}
                                value={completedCount}
                                icon={FiCalendar}
                                tone="green"
                            />
                            <DashboardMetricCard
                                label={t('instructorDashboard.studentsSection.metrics.averageProgress')}
                                value={`${averageProgress}%`}
                                icon={FiActivity}
                                tone="amber"
                            />
                        </div>
                    </DashboardInsetPanel>

                    <DashboardInsetPanel
                        title={t('instructorDashboard.studentsSection.filters.title')}
                        description={t('instructorDashboard.studentsSection.filters.description')}
                    >
                        <div className="mt-4 flex flex-wrap gap-3 items-end">
                            <div className="min-w-[220px] flex-1">
                                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-edubot-muted dark:text-slate-400">
                                    {t('instructorDashboard.studentsSection.filters.search')}
                                </label>
                                <div className="relative">
                                    <FiSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-edubot-muted dark:text-slate-500" />
                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(e) => {
                                            onChangePage(1);
                                            onSearchChange(e.target.value);
                                        }}
                                        placeholder={t('instructorDashboard.studentsSection.filters.searchPlaceholder')}
                                        className="dashboard-field dashboard-field-icon pl-10"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-edubot-muted dark:text-slate-400">
                                    {t('instructorDashboard.studentsSection.filters.progressMin')}
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={progressMin}
                                    onChange={(e) => {
                                        onChangePage(1);
                                        onProgressMinChange(e.target.value);
                                    }}
                                    className="dashboard-field w-28"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-edubot-muted dark:text-slate-400">
                                    {t('instructorDashboard.studentsSection.filters.progressMax')}
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={progressMax}
                                    onChange={(e) => {
                                        onChangePage(1);
                                        onProgressMaxChange(e.target.value);
                                    }}
                                    className="dashboard-field w-28"
                                />
                            </div>
                        </div>
                    </DashboardInsetPanel>

                    {loadingStudents ? (
                        <DashboardInsetPanel
                            title={t('instructorDashboard.studentsSection.hero.title')}
                            description={t('instructorDashboard.studentsSection.list.loadingDescription')}
                        >
                            <div className="mt-4">
                                <DashboardTableSkeleton rows={5} columns={5} />
                            </div>
                        </DashboardInsetPanel>
                    ) : sortedStudents.length ? (
                        <DashboardInsetPanel
                            title={t('instructorDashboard.studentsSection.list.title')}
                            description={t('instructorDashboard.studentsSection.list.description')}
                        >
                            <div className="mt-4 grid gap-4 xl:grid-cols-2">
                                {sortedStudents.map((student) => {
                                    const progress = Math.max(
                                        0,
                                        Math.min(100, Number(student.progressPercent || 0))
                                    );
                                    const tests = Array.isArray(student.tests) ? student.tests : [];

                                    return (
                                        <article
                                            key={student.id}
                                            className="dashboard-panel-muted rounded-panel p-5 transition duration-300 hover:-translate-y-1 hover:shadow-edubot-card"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <h3 className="text-base font-semibold text-edubot-ink dark:text-white">
                                                        {student.fullName}
                                                    </h3>
                                                    <div className="mt-2 flex flex-wrap gap-3 text-sm text-edubot-muted dark:text-slate-400">
                                                        <span className="inline-flex items-center gap-2">
                                                            <FiMail className="h-4 w-4 text-edubot-orange" />
                                                            {student.email || '—'}
                                                        </span>
                                                        <span className="inline-flex items-center gap-2">
                                                            <FiPhone className="h-4 w-4 text-edubot-orange" />
                                                            {student.phoneNumber || '—'}
                                                        </span>
                                                    </div>
                                                </div>
                                                <span
                                                    className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                                                        student.completed
                                                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300'
                                                            : 'bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300'
                                                    }`}
                                                >
                                                    {student.completed
                                                        ? t('instructorDashboard.studentsSection.studentCard.completed')
                                                        : t('instructorDashboard.studentsSection.studentCard.inProgress')}
                                                </span>
                                            </div>

                                            <div className="mt-4 flex flex-wrap items-center gap-2">
                                                <span
                                                    className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                                                        student.certificateStatus === 'issued'
                                                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300'
                                                            : student.certificateStatus === 'pending_approval'
                                                                ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300'
                                                                : student.certificateStatus === 'rejected'
                                                                    ? 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300'
                                                                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                                                    }`}
                                                >
                                                    {getCertificateStatusLabel(student.certificateStatus, t)}
                                                </span>
                                                {student.certificateStatus === 'issued' ? (
                                                    <>
                                                        {student.certificateDownloadUrl ? (
                                                            <>
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        downloadCourseCertificatePdf(
                                                                            student.certificateDownloadUrl,
                                                                            `certificate-${student.certificatePublicId || student.id}.pdf`,
                                                                        )
                                                                    }
                                                                    className="dashboard-button-secondary"
                                                                >
                                                                    {t('adminCertificates.actions.downloadPdf')}
                                                                </button>
                                                                {student.certificateVerificationUrl ? (
                                                                    <a
                                                                        href={student.certificateVerificationUrl}
                                                                        className="dashboard-button-secondary"
                                                                    >
                                                                        {t('adminCertificates.actions.verify')}
                                                                    </a>
                                                                ) : null}
                                                            </>
                                                        ) : null}
                                                    </>
                                                ) : null}
                                            </div>

                                            <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                                <div className="dashboard-panel rounded-2xl border border-edubot-line/70 px-4 py-3 dark:border-slate-700">
                                                    <div className="text-xs font-semibold uppercase tracking-[0.12em] text-edubot-muted dark:text-slate-400">
                                                        {t('instructorDashboard.studentsSection.studentCard.enrolled')}
                                                    </div>
                                                    <div className="mt-2 text-sm font-semibold text-edubot-ink dark:text-white">
                                                        {formatDate(student.enrolledAt, i18n.language)}
                                                    </div>
                                                </div>
                                                <div className="dashboard-panel rounded-2xl border border-edubot-line/70 px-4 py-3 dark:border-slate-700">
                                                    <div className="text-xs font-semibold uppercase tracking-[0.12em] text-edubot-muted dark:text-slate-400">
                                                        {t('instructorDashboard.studentsSection.studentCard.lastViewed')}
                                                    </div>
                                                    <div className="mt-2 text-sm font-semibold text-edubot-ink dark:text-white">
                                                        {formatLastViewed(student, t)}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mt-4">
                                                <div className="flex items-center justify-between gap-2 text-sm">
                                                    <span className="font-medium text-edubot-ink dark:text-white">
                                                        {t('common.progress')}
                                                    </span>
                                                    <span className="text-edubot-muted dark:text-slate-400">
                                                        {progress}%
                                                    </span>
                                                </div>
                                                <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-edubot-line/50 dark:bg-slate-800">
                                                    <div
                                                        className="h-full rounded-full bg-gradient-to-r from-edubot-orange to-edubot-teal"
                                                        style={{ width: `${progress}%` }}
                                                    />
                                                </div>
                                            </div>

                                            <div className="mt-4">
                                                <div className="text-xs font-semibold uppercase tracking-[0.12em] text-edubot-muted dark:text-slate-400">
                                                    {t('instructorDashboard.studentsSection.studentCard.tests')}
                                                </div>
                                                {tests.length ? (
                                                    <div className="mt-3 flex flex-col gap-2">
                                                        {tests.map((test) => (
                                                            <div
                                                                key={`${test.sectionId}-${test.lessonId}-${test.attemptedAt || ''}`}
                                                                className="flex flex-wrap items-center gap-2 rounded-2xl border border-edubot-line/70 bg-white/80 px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-950"
                                                            >
                                                                <span className="font-medium text-edubot-ink dark:text-white">
                                                                    {test.lessonTitle}
                                                                </span>
                                                                <span
                                                                    className={`rounded-full px-2 py-0.5 font-semibold ${
                                                                        test.passed
                                                                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300'
                                                                            : 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300'
                                                                    }`}
                                                                >
                                                                    {test.passed
                                                                        ? t('instructorDashboard.studentsSection.studentCard.testPassed')
                                                                        : t('instructorDashboard.studentsSection.studentCard.testFailed')}
                                                                </span>
                                                                {typeof test.score === 'number' ? (
                                                                    <span className="text-edubot-muted dark:text-slate-400">
                                                                        {test.score}%
                                                                    </span>
                                                                ) : null}
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className="mt-3 text-sm text-edubot-muted dark:text-slate-400">
                                                        {t('instructorDashboard.studentsSection.studentCard.noTests')}
                                                    </p>
                                                )}
                                            </div>
                                        </article>
                                    );
                                })}
                            </div>
                        </DashboardInsetPanel>
                    ) : (
                        <DashboardInsetPanel
                            title={t('instructorDashboard.studentsSection.hero.title')}
                            description={t('instructorDashboard.studentsSection.empty.description')}
                        >
                            <EmptyState
                                title={t('instructorDashboard.studentsSection.empty.title')}
                                subtitle={t('instructorDashboard.studentsSection.empty.subtitle')}
                                icon={<FiUsers className="h-8 w-8 text-edubot-orange" />}
                                className="py-8"
                            />
                        </DashboardInsetPanel>
                    )}

                    {courseMeta?.totalPages > 1 ? (
                        <div className="flex items-center justify-between gap-3 pt-1 text-sm text-edubot-muted dark:text-slate-400">
                            <button
                                type="button"
                                onClick={() => onChangePage(Math.max(1, studentsPage - 1))}
                                disabled={studentsPage <= 1}
                                className="dashboard-button-secondary disabled:opacity-50"
                            >
                                <FiChevronLeft className="h-4 w-4" />
                                {t('instructorDashboard.studentsSection.pagination.previous')}
                            </button>

                            <span>
                                {t('instructorDashboard.studentsSection.pagination.page', {
                                    page: studentsPage,
                                    total: courseMeta.totalPages,
                                })}
                            </span>

                            <button
                                type="button"
                                onClick={() =>
                                    onChangePage(Math.min(courseMeta.totalPages || 1, studentsPage + 1))
                                }
                                disabled={studentsPage >= (courseMeta.totalPages || 1)}
                                className="dashboard-button-secondary disabled:opacity-50"
                            >
                                {t('instructorDashboard.studentsSection.pagination.next')}
                                <FiChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    ) : null}
                </>
            )}
        </div>
    );
};

export default StudentsSection;
