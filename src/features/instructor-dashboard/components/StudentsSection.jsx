/* eslint-disable react/prop-types */
import { EmptyState, DashboardTableSkeleton, DashboardCardSkeleton } from '@components/ui/dashboard';
import InstructorStatCard from './InstructorStatCard.jsx';

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
    const fallbackCover =
        'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=600&q=80';

    const selectedCourse = courses.find((course) => course.id === selectedCourseId);

    const sortedStudents = (courseStudents || []).slice().sort((a, b) => {
        const aDate = a.enrolledAt ? new Date(a.enrolledAt).getTime() : 0;
        const bDate = b.enrolledAt ? new Date(b.enrolledAt).getTime() : 0;
        return bDate - aDate;
    });

    const formatDate = (value) => {
        if (!value) return '—';
        const date = new Date(value);
        return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString();
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

    return (
        <div className="space-y-6">
            <div className="rounded-3xl p-6 shadow-sm flex items-center justify-between gap-3 flex-wrap">
                <div>
                    <h2 className="text-2xl font-semibold">Студенттер</h2>
                    <p className="text-gray-500 dark:text-[#a6adba] text-sm">
                        Курстарыңыздагы студенттерди курстар боюнча карап чыгыңыз.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <InstructorStatCard label="Жалпы студенттер" value={total ?? '—'} />
                    <button
                        type="button"
                        onClick={refreshCourses}
                        disabled={loadingCourses}
                        className="px-4 py-2 rounded-full border text-sm text-gray-700 dark:text-[#a6adba] disabled:opacity-60"
                    >
                        Жаңыртуу
                    </button>
                </div>
            </div>

            {!selectedCourseId ? (
                <div className="rounded-3xl p-6 shadow-sm space-y-4">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <h3 className="text-lg font-semibold">Курстар</h3>
                            <p className="text-sm text-gray-500 dark:text-[#a6adba]">
                                Курсту тандап студенттердин тизмесин көрүңүз.
                            </p>
                        </div>
                    </div>

                    {error ? (
                        <div className="p-3 rounded-lg bg-red-50 text-red-700 border border-red-100">
                            {error}
                        </div>
                    ) : null}

                    {loadingCourses && !courses.length ? (
                        <DashboardCardSkeleton cards={6} />
                    ) : courses.length ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {courses.map((course) => (
                                <button
                                    type="button"
                                    key={course.id || course.title}
                                    onClick={() => onSelectCourse(course.id)}
                                    className="text-left rounded-2xl border transition-all duration-300 overflow-hidden border-gray-200 hover:shadow-lg hover:border-edubot-orange hover:shadow-edubot-orange/20 transform hover:scale-102 group"
                                >
                                    <div className="h-32 w-full overflow-hidden">
                                        <img
                                            src={course.coverImageUrl || fallbackCover}
                                            alt={course.title}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>

                                    <div className="p-4 space-y-2">
                                        <div className="flex items-start justify-between gap-2">
                                            <p className="font-semibold line-clamp-2">{course.title}</p>
                                            <span
                                                className={`text-xs px-2 py-1 rounded-full ${course.isPublished
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-yellow-100 text-yellow-700'
                                                    }`}
                                            >
                                                {course.isPublished ? 'Жарыяланды' : course.status || 'Каралууда'}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-[#a6adba]">
                                            <span>{course.studentCount ?? 0} студент</span>
                                            <span>{course.createdAt ? formatDate(course.createdAt) : ''}</span>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <EmptyState
                            title="Курстар азырынча жок"
                            subtitle="Биринчи курсуңузду түзүп баштаңыз"
                            action={{
                                label: 'Курс түзүү',
                                onClick: () => {
                                    window.location.href = '/instructor/course/create';
                                },
                            }}
                        />
                    )}
                </div>
            ) : null}

            <div className="rounded-3xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div>
                        <h3 className="text-lg font-semibold">
                            {courseMeta?.title || selectedCourse?.title || 'Студенттер тизмеси'}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-[#a6adba]">
                            {courseMeta
                                ? `Сабактар: ${courseMeta.lessonCount ?? '—'} • Студенттер: ${courseMeta.studentCount ?? 0}`
                                : 'Курс тандаңыз.'}
                        </p>
                    </div>

                    <p className="text-sm text-gray-500 dark:text-[#a6adba]">
                        {courseMeta
                            ? `Сабактар: ${courseMeta.lessonCount ?? '—'} • Студенттер: ${courseMeta.studentCount ?? 0}`
                            : 'Курс тандаңыз.'}
                    </p>
                </div>

                {selectedCourseId ? (
                    <button
                        type="button"
                        onClick={() => onSelectCourse(null)}
                        className="px-4 py-2 rounded-full border text-sm text-gray-700 dark:text-[#a6adba]"
                    >
                        Курстарга кайтуу
                    </button>
                ) : null}
            </div>

            {selectedCourseId ? (
                <div className="flex flex-wrap gap-3 items-end">
                    <div className="flex flex-col">
                        <label className="text-xs text-gray-500 dark:text-[#a6adba]">Издөө</label>
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => {
                                onChangePage(1);
                                onSearchChange(e.target.value);
                            }}
                            placeholder="Ат, email же телефон"
                            className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#111] text-sm"
                        />
                    </div>

                    <div className="flex flex-col">
                        <label className="text-xs text-gray-500 dark:text-[#a6adba]">
                            Прогресс кеминде (%)
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
                            className="w-24 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#111] text-sm"
                        />
                    </div>

                    <div className="flex flex-col">
                        <label className="text-xs text-gray-500 dark:text-[#a6adba]">
                            Прогресс жогору (%)
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
                            className="w-24 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#111] text-sm"
                        />
                    </div>
                </div>
            ) : null}

            {error ? (
                <div className="p-3 rounded-lg bg-red-50 text-red-700 border border-red-100">
                    {error}
                </div>
            ) : null}

            {loadingStudents ? (
                <DashboardTableSkeleton rows={5} columns={5} />
            ) : !selectedCourseId ? (
                <EmptyState
                    title="Студенттер азырынча жок"
                    subtitle="Курстарыңыздагы студенттер бул жерде көрсөтүлөт"
                />
            ) : sortedStudents.length ? (
                <div className="overflow-x-auto rounded-2xl border border-gray-100 dark:border-gray-800 w-full max-w-full bg-white dark:bg-[#0B0B0D] px-4">
                    <table className="table-auto w-full min-w-max divide-y divide-gray-200">
                        <thead>
                            <tr className="text-left text-sm text-gray-500 dark:text-[#a6adba]">
                                <th className="py-2 pr-4 pl-1">Студент</th>
                                <th className="py-2 pr-4">Email</th>
                                <th className="py-2 pr-4">Телефон</th>
                                <th className="py-2 pr-4">Катталды</th>
                                <th className="py-2 pr-4">Процесс</th>
                                <th className="py-2 pr-4">Статус</th>
                                <th className="py-2 pr-4">Тесттер</th>
                                <th className="py-2">Акыркы көргөн</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-100">
                            {sortedStudents.map((student) => {
                                const progress = Math.max(
                                    0,
                                    Math.min(100, Number(student.progressPercent || 0))
                                );
                                const tests = Array.isArray(student.tests) ? student.tests : [];

                                return (
                                    <tr key={student.id} className="bg-white dark:bg-[#0B0B0D]">
                                        <td className="py-3 pr-4">
                                            <p className="font-medium">{student.fullName}</p>
                                        </td>

                                        <td className="py-3 pr-4 text-sm text-gray-600 dark:text-[#a6adba] break-words">
                                            {student.email || '—'}
                                        </td>

                                        <td className="py-3 pr-4 text-sm text-gray-600 dark:text-[#a6adba] whitespace-nowrap">
                                            {student.phoneNumber || '—'}
                                        </td>

                                        <td className="py-3 pr-4 text-sm text-gray-600 dark:text-[#a6adba] whitespace-nowrap">
                                            {formatDate(student.enrolledAt)}
                                        </td>

                                        <td className="py-3 pr-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-28 bg-gray-100 rounded-full h-2 overflow-hidden">
                                                    <div
                                                        className="h-2 bg-blue-600 rounded-full"
                                                        style={{ width: `${progress}%` }}
                                                    />
                                                </div>
                                                <span className="text-sm text-gray-600 dark:text-[#a6adba]">
                                                    {progress}%
                                                </span>
                                            </div>
                                        </td>

                                        <td className="py-3 pr-4">
                                            <span
                                                className={`text-xs px-2 py-1 rounded-full ${student.completed
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-blue-100 text-blue-700'
                                                    }`}
                                            >
                                                {student.completed ? 'Бүттү' : 'Уланууда'}
                                            </span>
                                        </td>

                                        <td className="py-3 pr-4 align-top">
                                            {tests.length ? (
                                                <div className="flex flex-col gap-1">
                                                    {tests.map((test) => (
                                                        <div
                                                            key={`${test.sectionId}-${test.lessonId}-${test.attemptedAt || ''}`}
                                                            className="text-xs flex items-center gap-2"
                                                        >
                                                            <span className="font-medium text-gray-800 dark:text-[#E8ECF3]">
                                                                {test.lessonTitle}
                                                            </span>
                                                            <span
                                                                className={`px-2 py-0.5 rounded-full ${test.passed
                                                                    ? 'bg-green-100 text-green-700'
                                                                    : 'bg-red-100 text-red-700'
                                                                    }`}
                                                            >
                                                                {test.passed ? 'Өттү' : 'Өтпөдү'}
                                                            </span>
                                                            {typeof test.score === 'number' ? (
                                                                <span className="text-gray-500 dark:text-[#a6adba]">
                                                                    {test.score}%
                                                                </span>
                                                            ) : null}
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span className="text-xs text-gray-400 dark:text-[#a6adba]">
                                                    Тест тапшыруулар жок
                                                </span>
                                            )}
                                        </td>

                                        <td className="py-3 text-sm text-gray-600 dark:text-[#a6adba] whitespace-normal break-words leading-5">
                                            {formatLastViewed(student)}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p className="text-sm text-gray-500 dark:text-[#a6adba]">
                    Бул курста азырынча студент жок.
                </p>
            )}

            {selectedCourseId && courseMeta?.totalPages > 1 ? (
                <div className="flex items-center justify-between gap-3 pt-4 text-sm text-gray-600 dark:text-[#a6adba]">
                    <button
                        type="button"
                        onClick={() => onChangePage(Math.max(1, studentsPage - 1))}
                        disabled={studentsPage <= 1}
                        className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-50 hover:border-edubot-orange hover:bg-edubot-orange/10 hover:text-edubot-orange transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100 disabled:hover:translate-y-0 group"
                    >
                        <span className="transition-transform duration-300 group-hover:scale-110 group-hover:-translate-x-1">
                            ← Алдыңкы
                        </span>
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
                        className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-50 hover:border-edubot-orange hover:bg-edubot-orange/10 hover:text-edubot-orange transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100 disabled:hover:translate-y-0 group"
                    >
                        <span className="transition-transform duration-300 group-hover:scale-110 group-hover:translate-x-1">
                            Кийинки →
                        </span>
                    </button>
                </div>
            ) : null}
        </div>
    );
};

export default StudentsSection;
