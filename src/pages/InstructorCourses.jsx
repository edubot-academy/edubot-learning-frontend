import { useContext, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useInstructorCourseListPage } from '@features/instructor-dashboard/hooks/useInstructorCourseListPage';
import {
    COURSE_LIFECYCLE_STATES,
    getCourseLifecycleMeta,
} from '@features/instructor-dashboard/utils/courseLifecycle';

const COURSE_FILTERS = [
    { value: 'all', label: 'Баары' },
    { value: COURSE_LIFECYCLE_STATES.DRAFT, label: 'Черновик' },
    { value: COURSE_LIFECYCLE_STATES.PENDING, label: 'Каралууда' },
    { value: COURSE_LIFECYCLE_STATES.PUBLISHED, label: 'Жарыяланган' },
    { value: COURSE_LIFECYCLE_STATES.REJECTED, label: 'Оңдоо керек' },
];

const courseTypeLabel = (type) => {
    const normalized = String(type || 'video').toLowerCase();
    if (normalized === 'offline') return 'Offline';
    if (normalized === 'online_live') return 'Online Live';
    return 'Video';
};

const getCourseDisplayData = (course, user) => {
    const courseId = course?.id ?? course?.courseId ?? '';
    const rawTitle = typeof course?.title === 'string' ? course.title.trim() : '';
    const title = rawTitle || (courseId ? `Курс ${courseId}` : 'Аталышы жок курс');
    const instructorName = course?.instructor?.fullName || user?.fullName || 'Инструктор көрсөтүлгөн эмес';
    const hasPrice = course?.price !== null && course?.price !== undefined && course?.price !== '';
    const price = hasPrice ? Number(course.price) : Number.NaN;
    const lifecycle = getCourseLifecycleMeta(course);

    return {
        courseId,
        coverImageUrl: typeof course?.coverImageUrl === 'string' ? course.coverImageUrl.trim() : '',
        instructorName,
        lifecycle,
        priceLabel: Number.isFinite(price) ? `${price} с` : 'Баасы көрсөтүлгөн эмес',
        title,
        typeLabel: courseTypeLabel(course?.courseType || course?.type),
    };
};

const InstructorCourses = () => {
    const { user } = useContext(AuthContext);
    const { courses, error, loading, refresh } = useInstructorCourseListPage(user);
    const [query, setQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const courseDisplayItems = useMemo(
        () => courses.map((course) => ({
            raw: course,
            display: getCourseDisplayData(course, user),
        })),
        [courses, user]
    );

    const lifecycleCounts = useMemo(
        () =>
            courseDisplayItems.reduce(
                (acc, item) => ({
                    ...acc,
                    [item.display.lifecycle.state]: (acc[item.display.lifecycle.state] || 0) + 1,
                }),
                {}
            ),
        [courseDisplayItems]
    );

    const filteredCourses = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase();

        return courseDisplayItems.filter(({ display }) => {
            const matchesStatus =
                statusFilter === 'all' || display.lifecycle.state === statusFilter;
            const matchesQuery =
                !normalizedQuery ||
                display.title.toLowerCase().includes(normalizedQuery) ||
                display.instructorName.toLowerCase().includes(normalizedQuery) ||
                display.typeLabel.toLowerCase().includes(normalizedQuery);

            return matchesStatus && matchesQuery;
        });
    }, [courseDisplayItems, query, statusFilter]);

    return (
        <div className="min-h-screen p-6 pt-24 max-w-6xl mx-auto">
            <h1 className="text-4xl font-bold mb-8 text-center">Менин курстарым</h1>
            {error && (
                <div className="mb-6 rounded border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-200">
                    <p className="font-semibold">Курстарды алуу ишке ашкан жок.</p>
                    <button
                        type="button"
                        onClick={refresh}
                        className="mt-2 rounded bg-red-600 px-3 py-1 text-sm font-semibold text-white hover:bg-red-700"
                    >
                        Кайра жүктөө
                    </button>
                </div>
            )}
            {loading && (
                <div className="mb-6 text-center text-gray-600 dark:text-gray-300" role="status">
                    Курстар жүктөлүүдө...
                </div>
            )}

            <section
                aria-label="Курс башкаруу чыпкалары"
                className="mb-6 rounded border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-[#141619]"
            >
                <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
                    <div>
                        <label htmlFor="instructor-course-search" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
                            Курс издөө
                        </label>
                        <input
                            id="instructor-course-search"
                            type="search"
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                            placeholder="Аталыш, окутуучу же түрү боюнча"
                        />
                    </div>

                    <div>
                        <label htmlFor="instructor-course-status" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
                            Статус
                        </label>
                        <select
                            id="instructor-course-status"
                            value={statusFilter}
                            onChange={(event) => setStatusFilter(event.target.value)}
                            className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white md:min-w-48"
                        >
                            {COURSE_FILTERS.map((filter) => (
                                <option key={filter.value} value={filter.value}>
                                    {filter.label}
                                    {filter.value !== 'all' && lifecycleCounts[filter.value]
                                        ? ` (${lifecycleCounts[filter.value]})`
                                        : ''}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </section>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCourses.map(({ display }, index) => {
                    return (
                        <article
                            key={display.courseId || `course-${index}`}
                            aria-labelledby={`instructor-course-${display.courseId || index}`}
                            className="bg-white dark:bg-[#141619] rounded shadow p-4 relative"
                        >
                            {display.coverImageUrl ? (
                                <img
                                    src={display.coverImageUrl}
                                    alt={display.title}
                                    className="w-full h-48 object-cover mb-4"
                                    loading="lazy"
                                    decoding="async"
                                />
                            ) : (
                                <div className="mb-4 flex h-48 w-full items-center justify-center rounded bg-gray-100 text-sm font-medium text-gray-500 dark:bg-gray-800 dark:text-gray-300">
                                    Курс сүрөтү жок
                                </div>
                            )}
                            <h2 id={`instructor-course-${display.courseId || index}`} className="text-xl font-semibold mb-2">{display.title}</h2>
                            <span className="inline-flex mb-2 text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-700">
                                {display.typeLabel}
                            </span>
                            <p className="text-gray-700 dark:text-[#a6adba] mb-2">
                                {display.instructorName}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-[#a6adba] mb-2">Баасы: {display.priceLabel}</p>
                            <span
                                aria-label={`Курс статусу: ${display.lifecycle.label}`}
                                className={`absolute top-2 right-2 px-2 py-1 text-xs rounded ${display.lifecycle.badgeClass}`}
                            >
                                {display.lifecycle.label}
                            </span>
                            {display.courseId ? (
                                <Link
                                    to={`/instructor/courses/edit/${display.courseId}`}
                                    className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded transition duration-300 hover:bg-blue-500 hover:shadow-lg"
                                >
                                    {display.lifecycle.primaryActionLabel}
                                </Link>
                            ) : (
                                <span className="inline-block mt-4 rounded bg-gray-200 px-4 py-2 text-gray-500 dark:bg-gray-800 dark:text-gray-300">
                                    Өзгөртүү жеткиликсиз
                                </span>
                            )}
                        </article>
                    );
                })}
            </div>
            {!loading && !error && !courses.length && (
                <div className="rounded border border-gray-200 p-6 text-center text-gray-600 dark:border-gray-800 dark:text-gray-300">
                    Азырынча курстарыңыз жок.
                    <div className="mt-4">
                        <Link
                            to="/instructor/course/create"
                            className="inline-block rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
                        >
                            Биринчи курсту түзүү
                        </Link>
                    </div>
                </div>
            )}
            {!loading && !error && Boolean(courses.length) && !filteredCourses.length && (
                <div className="rounded border border-gray-200 p-6 text-center text-gray-600 dark:border-gray-800 dark:text-gray-300">
                    Бул чыпкалар боюнча курс табылган жок.
                </div>
            )}
        </div>
    );
};

export default InstructorCourses;
