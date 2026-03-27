/* eslint-disable react/prop-types */
import {
    FiActivity,
    FiBookOpen,
    FiCalendar,
    FiChevronLeft,
    FiChevronRight,
    FiClock,
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

const fallbackCover =
    'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=600&q=80';

const formatDate = (value) => {
    if (!value) return '—';
    const date = new Date(value);
    return Number.isNaN(date.getTime())
        ? '—'
        : date.toLocaleDateString('ky-KG', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
          });
};

const formatLastViewed = (student) => {
    if (!student.lastViewedLessonId) return '—';

    const rawTime = Number(student.lastVideoTime) || 0;
    const totalSeconds = rawTime > 1000 ? Math.round(rawTime / 1000) : Math.round(rawTime);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = String(totalSeconds % 60).padStart(2, '0');
    const timeText = totalSeconds ? ` (${minutes}:${seconds})` : '';

    return `Сабак #${student.lastViewedLessonId}${timeText}`;
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
                    eyebrow="Student Workspace"
                    title="Студенттер"
                    description="Курстарыңыздагы студенттерди курс боюнча бөлүп, прогрессти жана акыркы активдүүлүктү бир жерден көзөмөлдөңүз."
                    action={
                        <button
                            type="button"
                            onClick={refreshCourses}
                            disabled={loadingCourses}
                            className="dashboard-button-secondary"
                        >
                            Жаңыртуу
                        </button>
                    }
                />

                <div className="grid gap-3 px-6 pb-6 md:grid-cols-2 xl:grid-cols-4">
                    <DashboardMetricCard label="Жалпы студенттер" value={total ?? '—'} icon={FiUsers} />
                    <DashboardMetricCard
                        label="Курстар"
                        value={courses.length}
                        icon={FiBookOpen}
                        tone="blue"
                    />
                    <DashboardMetricCard
                        label="Тандалган курстагы студент"
                        value={selectedCourseId ? sortedStudents.length : '—'}
                        icon={FiLayers}
                        tone="green"
                    />
                    <DashboardMetricCard
                        label="Орточо прогресс"
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
                    title="Курсту тандаңыз"
                    description="Курсту тандасаңыз, ошол агымдагы студенттердин толук тизмеси жана прогресс деталдары ачылат."
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
                                        <img
                                            src={course.coverImageUrl || fallbackCover}
                                            alt={course.title}
                                            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                                        />
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
                                                {course.isPublished ? 'Жарыяланды' : course.status || 'Каралууда'}
                                            </span>
                                        </div>

                                        <div className="grid gap-2 text-sm text-edubot-muted dark:text-slate-400">
                                            <div className="flex items-center justify-between gap-2">
                                                <span>Студенттер</span>
                                                <span className="font-semibold text-edubot-ink dark:text-white">
                                                    {course.studentCount ?? 0}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between gap-2">
                                                <span>Түзүлгөн</span>
                                                <span className="font-semibold text-edubot-ink dark:text-white">
                                                    {formatDate(course.createdAt)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <EmptyState
                            title="Курстар азырынча жок"
                            subtitle="Алгач курс түзүп баштаңыз, андан кийин студент агымдары ушул жерде көрүнөт."
                            action={{
                                label: 'Курс түзүү',
                                onClick: () => {
                                    window.location.href = '/instructor/course/create';
                                },
                            }}
                            className="py-8"
                        />
                    )}
                </DashboardInsetPanel>
            ) : (
                <>
                    <DashboardInsetPanel
                        title={courseMeta?.title || selectedCourse?.title || 'Студенттер тизмеси'}
                        description="Курс тандалгандан кийин издөө, прогресс фильтри жана студент активдүүлүк деталдары ушул блокто иштейт."
                        action={
                            <button
                                type="button"
                                onClick={() => onSelectCourse(null)}
                                className="dashboard-button-secondary"
                            >
                                Курстарга кайтуу
                            </button>
                        }
                    >
                        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                            <DashboardMetricCard
                                label="Бул курстагы студент"
                                value={courseMeta?.studentCount ?? sortedStudents.length}
                                icon={FiUsers}
                            />
                            <DashboardMetricCard
                                label="Сабактар"
                                value={courseMeta?.lessonCount ?? '—'}
                                icon={FiBookOpen}
                                tone="blue"
                            />
                            <DashboardMetricCard
                                label="Бүтүргөн"
                                value={completedCount}
                                icon={FiCalendar}
                                tone="green"
                            />
                            <DashboardMetricCard
                                label="Орточо прогресс"
                                value={`${averageProgress}%`}
                                icon={FiActivity}
                                tone="amber"
                            />
                        </div>
                    </DashboardInsetPanel>

                    <DashboardInsetPanel
                        title="Фильтрлер"
                        description="Студенттерди аталышы, байланыш маалыматы жана прогресс диапазону боюнча чыпкалаңыз."
                    >
                        <div className="mt-4 flex flex-wrap gap-3 items-end">
                            <div className="min-w-[220px] flex-1">
                                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-edubot-muted dark:text-slate-400">
                                    Издөө
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
                                        placeholder="Ат, email же телефон"
                                        className="dashboard-field dashboard-field-icon pl-10"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-edubot-muted dark:text-slate-400">
                                    Прогресс кеминде
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
                                    Прогресс жогору
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
                        <DashboardInsetPanel title="Студенттер" description="Тизме жүктөлүүдө.">
                            <div className="mt-4">
                                <DashboardTableSkeleton rows={5} columns={5} />
                            </div>
                        </DashboardInsetPanel>
                    ) : sortedStudents.length ? (
                        <DashboardInsetPanel
                            title="Студенттер тизмеси"
                            description="Ар бир студенттин байланыш маалыматы, прогресси жана акыркы көргөн сабагы көрсөтүлөт."
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
                                                    {student.completed ? 'Бүттү' : 'Уланууда'}
                                                </span>
                                            </div>

                                            <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                                <div className="dashboard-panel rounded-2xl border border-edubot-line/70 px-4 py-3 dark:border-slate-700">
                                                    <div className="text-xs font-semibold uppercase tracking-[0.12em] text-edubot-muted dark:text-slate-400">
                                                        Катталды
                                                    </div>
                                                    <div className="mt-2 text-sm font-semibold text-edubot-ink dark:text-white">
                                                        {formatDate(student.enrolledAt)}
                                                    </div>
                                                </div>
                                                <div className="dashboard-panel rounded-2xl border border-edubot-line/70 px-4 py-3 dark:border-slate-700">
                                                    <div className="text-xs font-semibold uppercase tracking-[0.12em] text-edubot-muted dark:text-slate-400">
                                                        Акыркы көргөн
                                                    </div>
                                                    <div className="mt-2 text-sm font-semibold text-edubot-ink dark:text-white">
                                                        {formatLastViewed(student)}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mt-4">
                                                <div className="flex items-center justify-between gap-2 text-sm">
                                                    <span className="font-medium text-edubot-ink dark:text-white">
                                                        Прогресс
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
                                                    Тесттер
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
                                                                    {test.passed ? 'Өттү' : 'Өтпөдү'}
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
                                                        Тест тапшыруулар жок.
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
                            title="Студенттер"
                            description="Бул курс боюнча тизмек азырынча бош."
                        >
                            <EmptyState
                                title="Бул курста азырынча студент жок"
                                subtitle="Башка курсту тандап көрүңүз же катталууларды күтүңүз."
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
                                Алдыңкы
                            </button>

                            <span>
                                Барак {studentsPage} / {courseMeta.totalPages}
                            </span>

                            <button
                                type="button"
                                onClick={() =>
                                    onChangePage(Math.min(courseMeta.totalPages || 1, studentsPage + 1))
                                }
                                disabled={studentsPage >= (courseMeta.totalPages || 1)}
                                className="dashboard-button-secondary disabled:opacity-50"
                            >
                                Кийинки
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
