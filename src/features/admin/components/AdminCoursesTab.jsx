/* eslint-disable react/prop-types */
import { useState, useEffect, useCallback } from 'react';
import {
    DashboardInsetPanel,
    DashboardMetricCard,
    DashboardSectionHeader,
    EmptyState,
} from '@components/ui/dashboard';
import { Link } from 'react-router-dom';
import Loader from '@shared/ui/Loader';
import { FiBookOpen, FiEye, FiFolder, FiLayers, FiTrash2, FiUploadCloud, FiUsers } from 'react-icons/fi';
import DeliveryCourseDetailsModal from './DeliveryCourseDetailsModal';
import { fetchSections, fetchLessons, getTranscodeStatus, retryTranscodeLessonHls, transcodeLessonHls, bulkTranscodeLessonHls } from '@features/courses/api';
import useTranscodingStatus from '@hooks/useTranscodingStatus';
import TranscodingStatusBadge from '@features/courses/components/TranscodingStatusBadge';
import RetryTranscodeButton from '@features/courses/components/RetryTranscodeButton';

const getCourseTypeLabel = (courseType) => {
    switch (courseType) {
        case 'offline':
            return 'Оффлайн';
        case 'online_live':
            return 'Онлайн түз эфир';
        default:
            return 'Видео';
    }
};

const AdminCoursesTab = ({
    courses,
    categories,
    users,
    courseGroupsByCourseId,
    newCategory,
    editingCategoryId,
    editingCategoryName,
    selectedEnrollmentGroupIds,
    transcodeCourseId,
    transcodeSectionId,
    transcodeLessonId,
    transcodeLessonIds,
    transcodeLoading,
    setNewCategory,
    setEditingCategoryId,
    setEditingCategoryName,
    setSelectedEnrollmentGroupIds,
    setTranscodeCourseId,
    setTranscodeSectionId,
    setTranscodeLessonId,
    setTranscodeLessonIds,
    handleDeleteCourse,
    handleEnrollUser,
    handleAddCategory,
    handleUpdateCategory,
    handleDeleteCategory,
    handleTranscode,
    handleBulkTranscode,
}) => {
    const [detailCourse, setDetailCourse] = useState(null);
    const [sections, setSections] = useState([]);
    const [lessons, setLessons] = useState([]);
    const [sectionsLoading, setSectionsLoading] = useState(false);
    const [lessonsLoading, setLessonsLoading] = useState(false);
    const [lastTranscodedLessonId, setLastTranscodedLessonId] = useState(null);
    const [isBulkTranscoding, setIsBulkTranscoding] = useState(false);
    const [transcodingContextCourseId, setTranscodingContextCourseId] = useState(null);
    const [transcodingContextSectionId, setTranscodingContextSectionId] = useState(null);
    const [pendingTranscodeAction, setPendingTranscodeAction] = useState(null);

    // Handle transcode after state is set
    useEffect(() => {
        if (pendingTranscodeAction) {

            // Execute API call directly without calling parent handlers (which clear state)
            if (pendingTranscodeAction.type === 'individual' && lastTranscodedLessonId && transcodingContextCourseId && transcodingContextSectionId) {
                // Call the individual transcode API directly
                (async () => {
                    try {
                        await transcodeLessonHls({
                            courseId: Number(transcodingContextCourseId),
                            sectionId: Number(transcodingContextSectionId),
                            lessonId: Number(lastTranscodedLessonId),
                        });
                    } catch (err) {
                        console.error('[AdminCoursesTab] Transcode API error:', err);
                    }
                })();
            } else if (pendingTranscodeAction.type === 'bulk' && transcodingContextCourseId && transcodingContextSectionId) {
                // Call the bulk transcode API directly (transcode all lessons in section)
                (async () => {
                    try {
                        await bulkTranscodeLessonHls({
                            courseId: Number(transcodingContextCourseId),
                            sectionId: Number(transcodingContextSectionId),
                            lessonIds: [], // Empty array means transcode all
                        });
                    } catch (err) {
                        console.error('[AdminCoursesTab] Bulk transcode API error:', err);
                    }
                })();
            }

            setPendingTranscodeAction(null);
        }
    }, [pendingTranscodeAction, lastTranscodedLessonId, transcodingContextCourseId, transcodingContextSectionId]);

    const publishedCourses = courses.filter((course) => course.isPublished).length;
    const deliveryCourses = courses.filter((course) => course.courseType !== 'video').length;

    // Fetch sections when course is selected
    useEffect(() => {
        if (!transcodeCourseId) {
            setSections([]);
            setLessons([]);
            setTranscodeSectionId('');
            setTranscodeLessonId('');
            return;
        }

        const loadSections = async () => {
            setSectionsLoading(true);
            try {
                const data = await fetchSections(Number(transcodeCourseId));
                setSections(data);
            } catch {
                setSections([]);
            } finally {
                setSectionsLoading(false);
            }
        };

        loadSections();
    }, [transcodeCourseId, setTranscodeSectionId]);

    // Fetch lessons when section is selected
    useEffect(() => {
        if (!transcodeCourseId || !transcodeSectionId) {
            setLessons([]);
            setTranscodeLessonId('');
            return;
        }

        const loadLessons = async () => {
            setLessonsLoading(true);
            try {
                const data = await fetchLessons(Number(transcodeCourseId), Number(transcodeSectionId));
                // Only video lessons
                setLessons(data.filter((l) => l.kind === 'video'));
            } catch {
                setLessons([]);
            } finally {
                setLessonsLoading(false);
            }
        };

        loadLessons();
    }, [transcodeCourseId, transcodeSectionId, setTranscodeLessonId]);

    // Fetch function for transcoding status polling
    const fetchTranscodingStatus = useCallback(async () => {
        if (!lastTranscodedLessonId || !transcodingContextCourseId || !transcodingContextSectionId) {
            throw new Error('Missing required IDs for transcoding status check');
        }

        try {
            const response = await getTranscodeStatus({
                courseId: transcodingContextCourseId,
                sectionId: transcodingContextSectionId,
                lessonId: lastTranscodedLessonId,
            });
            return response;
        } catch (error) {
            console.error('[AdminCoursesTab] Failed to fetch transcode status:', error);
            throw error; // Let hook handle error state
        }
    }, [lastTranscodedLessonId, transcodingContextCourseId, transcodingContextSectionId]);

    // Use polling hook to monitor transcoding status
    const { status, error, isPolling, manualRefresh } = useTranscodingStatus(
        lastTranscodedLessonId,
        'missing',
        fetchTranscodingStatus,
        Boolean(lastTranscodedLessonId) // Enable when a lesson is being transcoded
    );

    // Handle successful transcode - reset after completion
    useEffect(() => {
        if (lastTranscodedLessonId && status === 'ready') {
            // Refresh lessons list to show updated status
            if (transcodingContextCourseId && transcodingContextSectionId) {
                const loadLessons = async () => {
                    try {
                        const data = await fetchLessons(Number(transcodingContextCourseId), Number(transcodingContextSectionId));
                        setLessons(data.filter((l) => l.kind === 'video'));
                    } catch {
                        // Silent fail - polling will retry
                    }
                };
                loadLessons();
            }
        }
    }, [lastTranscodedLessonId, status, transcodingContextCourseId, transcodingContextSectionId]);

    // Get selected course, section, lesson names for display
    const selectedCourse = courses.find((c) => String(c.id) === String(transcodeCourseId));
    const selectedSection = sections.find((s) => String(s.id) === String(transcodeSectionId));
    const selectedLesson = lessons.find((l) => String(l.id) === String(transcodeLessonId));

    return (
        <div className="space-y-6">
            <DashboardSectionHeader
                eyebrow="Catalog operations"
                title="Курстар жана категориялар"
                description="Курстарды, категорияларды жана техникалык курс операцияларын ушул жерден башкарыңыз."
            />

            <div className="grid gap-4 md:grid-cols-4">
                <DashboardMetricCard label="Курстар" value={courses.length} icon={FiBookOpen} />
                <DashboardMetricCard
                    label="Жарыяланган"
                    value={publishedCourses}
                    icon={FiLayers}
                    tone={publishedCourses ? 'green' : 'default'}
                />
                <DashboardMetricCard label="Категориялар" value={categories.length} icon={FiFolder} />
                <DashboardMetricCard
                    label="Delivery курстар"
                    value={deliveryCourses}
                    icon={FiUsers}
                    tone={deliveryCourses ? 'blue' : 'default'}
                />
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.35fr_0.95fr]">
                <DashboardInsetPanel
                    title="Курстар"
                    description="Курс карталарын карап чыгып, алдын ала көрүп жана студент жаздырыңыз."
                >
                    {courses.length ? (
                        <div className="mt-4 space-y-3">
                            {courses.map((course) => (
                                (() => {
                                    const isDeliveryCourse =
                                        course.courseType === 'offline' || course.courseType === 'online_live';
                                    const groupOptions = courseGroupsByCourseId?.[String(course.id)] || [];
                                    const selectedGroupId = selectedEnrollmentGroupIds?.[String(course.id)] || '';

                                    return (
                                        <article
                                            key={course.id}
                                            className="rounded-2xl border border-edubot-line/70 bg-edubot-surfaceAlt/40 px-4 py-4 dark:border-slate-700 dark:bg-slate-900/60"
                                        >
                                            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                                <div className="min-w-0">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <p className="font-semibold text-edubot-ink dark:text-white">{course.title}</p>
                                                        <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-500/15 dark:text-slate-300">
                                                            {getCourseTypeLabel(course.courseType)}
                                                        </span>
                                                        {course.isPublished ? (
                                                            <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                                                                Жарыяланган
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">
                                                                Даярдалууда
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="mt-2 text-sm text-edubot-muted dark:text-slate-400">
                                                        Окутуучу: {course.instructor?.fullName || '—'}
                                                    </p>
                                                    {course.shortDescription ? (
                                                        <p className="mt-2 line-clamp-2 text-sm text-edubot-muted dark:text-slate-400">
                                                            {course.shortDescription}
                                                        </p>
                                                    ) : null}
                                                </div>

                                                <div className="flex flex-wrap gap-2">
                                                    {isDeliveryCourse ? (
                                                        <button
                                                            type="button"
                                                            onClick={() => setDetailCourse(course)}
                                                            className="dashboard-button-secondary"
                                                        >
                                                            <FiEye className="h-4 w-4" />
                                                            Ички маалымат
                                                        </button>
                                                    ) : (
                                                        <Link to={`/courses/${course.id}`} className="dashboard-button-secondary">
                                                            <FiEye className="h-4 w-4" />
                                                            Көрүү
                                                        </Link>
                                                    )}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeleteCourse(course.id)}
                                                        className="dashboard-button-secondary"
                                                    >
                                                        <FiTrash2 className="h-4 w-4" />
                                                        Өчүрүү
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="mt-4">
                                                {isDeliveryCourse ? (
                                                    <div className="mb-3">
                                                        <label className="mb-2 block text-sm font-medium text-edubot-muted dark:text-slate-400">
                                                            Группа тандаңыз
                                                        </label>
                                                        <select
                                                            value={selectedGroupId}
                                                            onChange={(e) =>
                                                                setSelectedEnrollmentGroupIds((prev) => ({
                                                                    ...prev,
                                                                    [String(course.id)]: e.target.value,
                                                                }))
                                                            }
                                                            className="dashboard-select w-full"
                                                        >
                                                            <option value="">Группа тандаңыз</option>
                                                            {groupOptions.map((group) => (
                                                                <option key={group.id} value={group.id}>
                                                                    {(group.name || `Group #${group.id}`) +
                                                                        ` (${group.code || '—'})`}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                ) : null}

                                                <label className="mb-2 block text-sm font-medium text-edubot-muted dark:text-slate-400">
                                                    {isDeliveryCourse
                                                        ? 'Колдонуучуну группага жазуу'
                                                        : 'Колдонуучуну курска жазуу'}
                                                </label>
                                                <select
                                                    onChange={(e) => handleEnrollUser(e.target.value, course.id)}
                                                    className="dashboard-select w-full"
                                                    defaultValue=""
                                                    disabled={isDeliveryCourse && !selectedGroupId}
                                                >
                                                    <option value="" disabled>
                                                        {isDeliveryCourse && !selectedGroupId
                                                            ? 'Адегенде группа тандаңыз'
                                                            : 'Колдонуучуну тандаңыз'}
                                                    </option>
                                                    {users.map((u) => (
                                                        <option key={u.id} value={u.id}>
                                                            {u.fullName} ({u.role})
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </article>
                                    );
                                })()
                            ))}
                        </div>
                    ) : (
                        <div className="mt-4">
                            <EmptyState
                                title="Системада курстар жок"
                                subtitle="Платформада курстар жазылган эмес"
                            />
                        </div>
                    )}
                </DashboardInsetPanel>

                <div className="space-y-6">
                    <DashboardInsetPanel
                        title="Категориялар"
                        description="Категорияларды кошуп, атын өзгөртүп жана тазалаңыз."
                    >
                        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                            <input
                                value={newCategory || ''}
                                onChange={(e) => setNewCategory(e.target.value)}
                                className="dashboard-field flex-1"
                                placeholder="Жаңы категориянын аталышы"
                            />
                            <button
                                type="button"
                                onClick={handleAddCategory}
                                className="dashboard-button-primary self-start"
                            >
                                Кошуу
                            </button>
                        </div>

                        <div className="mt-4 space-y-3">
                            {categories.map((category) => (
                                <div
                                    key={category.id}
                                    className="rounded-2xl border border-edubot-line/70 bg-edubot-surfaceAlt/40 px-4 py-4 dark:border-slate-700 dark:bg-slate-900/60"
                                >
                                    {editingCategoryId === category.id ? (
                                        <div className="flex flex-col gap-3">
                                            <input
                                                value={editingCategoryName}
                                                onChange={(e) => setEditingCategoryName(e.target.value)}
                                                className="dashboard-field"
                                            />
                                            <div className="flex flex-wrap gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => handleUpdateCategory(category.id)}
                                                    className="dashboard-button-primary"
                                                >
                                                    Сактоо
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setEditingCategoryId(null);
                                                        setEditingCategoryName('');
                                                    }}
                                                    className="dashboard-button-secondary"
                                                >
                                                    Жокко чыгаруу
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                            <span className="font-medium text-edubot-ink dark:text-white">
                                                {category.name}
                                            </span>
                                            <div className="flex flex-wrap gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setEditingCategoryId(category.id);
                                                        setEditingCategoryName(category.name);
                                                    }}
                                                    className="dashboard-button-secondary"
                                                >
                                                    Өзгөртүү
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteCategory(category.id)}
                                                    className="dashboard-button-secondary"
                                                >
                                                    Өчүрүү
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </DashboardInsetPanel>

                    <DashboardInsetPanel
                        title="HLS транс коддоо"
                        description="Видеолор азыр автоматтык түрдө HLSке транскоддолот. Бул жерде тек ката кеткен же эски видеолор үчүн колдонуңуз."
                    >
                        <div className="mt-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 p-3 text-sm text-blue-700 dark:text-blue-300">
                            <p>Авто-транскоддоо иштейет: жаңы видеолор жүктөлгөндө автоматтык түрдө HLSке айланат.</p>
                        </div>

                        {/* Selection summary */}
                        {(selectedCourse || selectedSection) && (
                            <div className="mt-3 rounded-lg bg-slate-100 dark:bg-slate-800 p-2 text-sm">
                                {selectedCourse && <p className="text-slate-700 dark:text-slate-300">Курс: <span className="font-medium">{selectedCourse.title}</span></p>}
                                {selectedSection && <p className="text-slate-700 dark:text-slate-300">Секция: <span className="font-medium">{selectedSection.title}</span></p>}
                                {selectedLesson && <p className="text-slate-700 dark:text-slate-300">Сабак: <span className="font-medium">{selectedLesson.title}</span></p>}
                            </div>
                        )}

                        <div className="mt-4 grid gap-3">
                            {/* Course selector */}
                            <div>
                                <label className="mb-1 block text-sm font-medium text-edubot-muted dark:text-slate-400">
                                    Курс тандаңыз
                                </label>
                                <select
                                    value={transcodeCourseId || ''}
                                    onChange={(e) => {
                                        setTranscodeCourseId(e.target.value ? Number(e.target.value) : '');
                                        setTranscodeSectionId('');
                                        setTranscodeLessonId('');
                                    }}
                                    className="dashboard-select w-full"
                                >
                                    <option value="">Курс тандаңыз</option>
                                    {courses.filter(c => c.courseType === 'video').map((course) => (
                                        <option key={course.id} value={course.id}>
                                            {course.title}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Section selector */}
                            <div>
                                <label className="mb-1 block text-sm font-medium text-edubot-muted dark:text-slate-400">
                                    Секция тандаңыз
                                </label>
                                <select
                                    value={transcodeSectionId || ''}
                                    onChange={(e) => {
                                        setTranscodeSectionId(e.target.value ? Number(e.target.value) : '');
                                        setTranscodeLessonId('');
                                    }}
                                    disabled={!transcodeCourseId || sectionsLoading}
                                    className="dashboard-select w-full disabled:opacity-50"
                                >
                                    <option value="">{sectionsLoading ? 'Жүктөлүүдө...' : 'Секция тандаңыз'}</option>
                                    {sections.map((section) => (
                                        <option key={section.id} value={section.id}>
                                            {section.title || `Секция #${section.id}`}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Lesson selector */}
                            <div>
                                <label className="mb-1 block text-sm font-medium text-edubot-muted dark:text-slate-400">
                                    Сабак тандаңыз (же бош калтырыңыз бардыгы үчүн)
                                </label>
                                <select
                                    value={transcodeLessonId || ''}
                                    onChange={(e) => setTranscodeLessonId(e.target.value ? Number(e.target.value) : '')}
                                    disabled={!transcodeSectionId || lessonsLoading}
                                    className="dashboard-select w-full disabled:opacity-50"
                                >
                                    <option value="">{lessonsLoading ? 'Жүктөлүүдө...' : 'Бардык видео сабактар'}</option>
                                    {lessons.map((lesson) => (
                                        <option key={lesson.id} value={lesson.id}>
                                            {lesson.title || `Сабак #${lesson.id}`} {lesson.playbackStatus === 'processing' ? '(транскоддолууда)' : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Lesson IDs input for specific lessons */}
                            <div>
                                <label className="mb-1 block text-sm font-medium text-edubot-muted dark:text-slate-400">
                                    Же ID ларды киргизиңиз (бөлүүчү: 61,62,63)
                                </label>
                                <input
                                    type="text"
                                    placeholder="Lesson IDs (топтук үчүн)"
                                    value={transcodeLessonIds || ''}
                                    onChange={(e) => setTranscodeLessonIds(e.target.value)}
                                    disabled={transcodeLessonId}
                                    className="dashboard-field disabled:opacity-50"
                                />
                            </div>
                        </div>

                        <div className="mt-4 flex flex-wrap items-center gap-3">
                            <button
                                type="button"
                                onClick={() => {
                                    if (transcodeLessonId && transcodeCourseId && transcodeSectionId) {
                                        // Store context for status polling
                                        setTranscodingContextCourseId(transcodeCourseId);
                                        setTranscodingContextSectionId(transcodeSectionId);
                                        setLastTranscodedLessonId(transcodeLessonId);
                                        setIsBulkTranscoding(false);
                                        // Queue the action to run after state is set
                                        setPendingTranscodeAction({ type: 'individual' });
                                    } else if (transcodeCourseId && transcodeSectionId) {
                                        // Store context for status polling
                                        setTranscodingContextCourseId(transcodeCourseId);
                                        setTranscodingContextSectionId(transcodeSectionId);
                                        setLastTranscodedLessonId(null);
                                        setIsBulkTranscoding(true);
                                        // Queue the action to run after state is set
                                        setPendingTranscodeAction({ type: 'bulk' });
                                    }
                                }}
                                disabled={transcodeLoading || !transcodeCourseId || !transcodeSectionId}
                                className="dashboard-button-primary disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <FiUploadCloud className="h-4 w-4" />
                                {transcodeLoading ? <Loader fullScreen={false} /> : transcodeLessonId ? 'Кайра транскоддоо' : 'Топтук транскоддоо'}
                            </button>
                            <p className="text-xs text-edubot-muted dark:text-slate-400">
                                Курс жана секция милдеттүү. Бардык видео сабактарды же конкреттүү бирөөнү тандаңыз.
                            </p>
                        </div>

                        {/* Transcoding Status Display - Individual Lesson */}
                        {lastTranscodedLessonId && (
                            <div className="mt-6 space-y-3 border-t border-edubot-line/50 dark:border-slate-700 pt-4">
                                <div className="flex items-center justify-between gap-3">
                                    <div className="text-sm text-edubot-muted dark:text-slate-400">
                                        Транскоддоо статусу: <span className="font-medium">{lessons.find(l => l.id === lastTranscodedLessonId)?.title || `Сабак #${lastTranscodedLessonId}`}</span>
                                    </div>
                                    <button
                                        onClick={manualRefresh}
                                        disabled={isPolling}
                                        aria-label="Транскоддоо статусун кайра текшеңиз"
                                        className="text-xs px-2 py-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 disabled:text-gray-400 transition-colors"
                                        title="Статусун кайра текшеңиз"
                                    >
                                        <span aria-hidden="true">🔄</span>
                                    </button>
                                </div>

                                <TranscodingStatusBadge
                                    status={status}
                                    error={error}
                                    isPolling={isPolling}
                                    onRetry={status === 'failed' ? async () => {
                                        try {
                                            await retryTranscodeLessonHls({
                                                courseId: transcodingContextCourseId,
                                                sectionId: transcodingContextSectionId,
                                                lessonId: lastTranscodedLessonId,
                                            });
                                            setTimeout(manualRefresh, 1000);
                                        } catch (err) {
                                            console.error('[AdminCoursesTab] Retry failed:', err);
                                        }
                                    } : null}
                                />

                                {status === 'failed' && error && (
                                    <div className="mt-3 space-y-2" role="alert">
                                        <div className="px-3 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-md">
                                            <p className="text-xs font-medium text-red-700 dark:text-red-300 mb-1">Трансформация ката</p>
                                            <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
                                        </div>
                                        <RetryTranscodeButton
                                            courseId={transcodingContextCourseId}
                                            sectionId={transcodingContextSectionId}
                                            lessonId={lastTranscodedLessonId}
                                            retryFn={async (cid, sid, lid) => {
                                                await retryTranscodeLessonHls({ courseId: cid, sectionId: sid, lessonId: lid });
                                            }}
                                            onSuccess={() => {
                                                setTimeout(manualRefresh, 1000);
                                            }}
                                            onError={(err) => {
                                                console.error('[AdminCoursesTab] Retry error:', err);
                                            }}
                                            className="w-full"
                                        />
                                    </div>
                                )}

                                {status === 'ready' && (
                                    <div className="px-3 py-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900/50 rounded-md">
                                        <p className="text-xs text-green-700 dark:text-green-300">✅ Транскоддоо ийгиликтүү аякталды. Видео ойнотууга даяр!</p>
                                    </div>
                                )}

                                {(status === 'starting' || status === 'processing') && (
                                    <div className="px-3 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900/50 rounded-md">
                                        <p className="text-xs text-blue-700 dark:text-blue-300">⏳ Видеонун HLS форматына айларын күтүүдө...</p>
                                    </div>
                                )}

                                <button
                                    onClick={() => {
                                        setLastTranscodedLessonId(null);
                                        setTranscodingContextCourseId(null);
                                        setTranscodingContextSectionId(null);
                                    }}
                                    className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                                >
                                    Жабуу
                                </button>
                            </div>
                        )}

                        {/* Transcoding Status Display - Bulk */}
                        {isBulkTranscoding && (
                            <div className="mt-6 space-y-3 border-t border-edubot-line/50 dark:border-slate-700 pt-4">
                                <div className="text-sm text-edubot-muted dark:text-slate-400">
                                    Топтук транскоддоо статусу: <span className="font-medium">{courses.find(c => c.id === transcodingContextCourseId)?.title || 'Курс'} - {sections.find(s => s.id === transcodingContextSectionId)?.title || 'Секция'}</span>
                                </div>

                                <div className="px-3 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900/50 rounded-md">
                                    <p className="text-xs text-blue-700 dark:text-blue-300">⏳ Бул секциядагы бардык видеолор HLS форматына айланып жатат. Бул процесс бир нече мүнөт мүмкүн. Статусун көрүү үчүн секцияны кайра жүктөңүз.</p>
                                </div>

                                <button
                                    onClick={() => {
                                        setIsBulkTranscoding(false);
                                        setTranscodingContextCourseId(null);
                                        setTranscodingContextSectionId(null);
                                    }}
                                    className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                                >
                                    Жабуу
                                </button>
                            </div>
                        )}
                    </DashboardInsetPanel>
                </div>
            </div>
            <DeliveryCourseDetailsModal
                course={detailCourse}
                isOpen={Boolean(detailCourse)}
                onClose={() => setDetailCourse(null)}
            />
        </div>
    );
};

export default AdminCoursesTab;
