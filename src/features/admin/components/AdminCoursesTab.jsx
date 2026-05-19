
import { useState, useEffect, useCallback, useRef } from 'react';
import {
    DashboardInsetPanel,
    DashboardMetricCard,
    DashboardSectionHeader,
    EmptyState,
} from '@components/ui/dashboard';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Loader from '@shared/ui/Loader';
import { FiBookOpen, FiEye, FiFolder, FiLayers, FiTrash2, FiUploadCloud, FiUsers } from 'react-icons/fi';
import DeliveryCourseDetailsModal from './DeliveryCourseDetailsModal';
import { fetchSections, fetchLessons, getTranscodeStatus, retryTranscodeLessonHls, forceTranscodeLessonHls, transcodeLessonHls, bulkTranscodeLessonHls } from '@features/courses/api';
import useTranscodingStatus from '@hooks/useTranscodingStatus';
import TranscodingStatusBadge from '@features/courses/components/TranscodingStatusBadge';
import RetryTranscodeButton from '@features/courses/components/RetryTranscodeButton';
import { ADMIN_COURSES_TAB_SECTIONS } from '../utils/adminPanel.constants';

const COURSE_WORKFLOWS = Object.freeze([
    {
        id: 'catalog',
        labelKey: 'adminCourses.workflows.catalog.label',
        descriptionKey: 'adminCourses.workflows.catalog.description',
    },
    {
        id: 'enrollment',
        labelKey: 'adminCourses.workflows.enrollment.label',
        descriptionKey: 'adminCourses.workflows.enrollment.description',
    },
    {
        id: 'media',
        labelKey: 'adminCourses.workflows.media.label',
        descriptionKey: 'adminCourses.workflows.media.description',
    },
]);

const getCourseTypeLabel = (courseType, t) => {
    switch (courseType) {
        case 'offline':
            return t('adminPendingCourses.courseTypes.offline');
        case 'online_live':
            return t('adminPendingCourses.courseTypes.onlineLive');
        default:
            return t('adminPendingCourses.courseTypes.video');
    }
};

const getDeliveryModeLabel = (value, t) =>
    value === 'individual'
        ? t('adminCourses.deliveryModes.individual')
        : t('adminCourses.deliveryModes.group');

const getDeliveryModeClass = (value) =>
    value === 'individual'
        ? 'bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-200'
        : 'bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-200';

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
}) => {
    const { i18n, t } = useTranslation();
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
    const [alreadyTranscodedMessage, setAlreadyTranscodedMessage] = useState('');
    const [transcodeHistory, setTranscodeHistory] = useState([]);
    const [activeWorkflow, setActiveWorkflow] = useState('catalog');
    const lastReadyRecordedRef = useRef(null);

    const recordTranscodeEvent = useCallback((event) => {
        setTranscodeHistory((prev) => [
            {
                id: `${Date.now()}-${prev.length}`,
                createdAt: new Date().toISOString(),
                ...event,
            },
            ...prev,
        ].slice(0, 5));
    }, []);

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
                        recordTranscodeEvent({
                            type: 'error',
                            label: t('adminCourses.transcode.history.singleStartFailed'),
                            detail: err?.message || t('adminCourses.fallback.unknownError'),
                        });
                    }
                })();
            } else if (pendingTranscodeAction.type === 'bulk' && transcodingContextCourseId && transcodingContextSectionId) {
                // Call the bulk transcode API directly with specific untranscoded lesson IDs
                (async () => {
                    try {
                        await bulkTranscodeLessonHls({
                            courseId: Number(transcodingContextCourseId),
                            sectionId: Number(transcodingContextSectionId),
                            lessonIds: pendingTranscodeAction.lessonIds || [], // Send only untranscoded lesson IDs
                        });
                    } catch (err) {
                        console.error('[AdminCoursesTab] Bulk transcode API error:', err);
                        recordTranscodeEvent({
                            type: 'error',
                            label: t('adminCourses.transcode.history.bulkStartFailed'),
                            detail: err?.message || t('adminCourses.fallback.unknownError'),
                        });
                    }
                })();
            }

            setPendingTranscodeAction(null);
        }
    }, [pendingTranscodeAction, lastTranscodedLessonId, recordTranscodeEvent, t, transcodingContextCourseId, transcodingContextSectionId]);

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
    }, [transcodeCourseId, setTranscodeSectionId, setTranscodeLessonId]);

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

    // Clear already transcoded message when selections change
    useEffect(() => {
        setAlreadyTranscodedMessage('');
    }, [transcodeCourseId, transcodeSectionId, transcodeLessonId]);

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
            if (lastReadyRecordedRef.current !== lastTranscodedLessonId) {
                const lessonTitle = lessons.find(l => l.id === lastTranscodedLessonId)?.title || t('adminCourses.fallback.lesson', { id: lastTranscodedLessonId });
                recordTranscodeEvent({
                    type: 'success',
                    label: t('adminCourses.transcode.history.completed'),
                    detail: lessonTitle,
                });
                lastReadyRecordedRef.current = lastTranscodedLessonId;
            }
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
    }, [lastTranscodedLessonId, lessons, recordTranscodeEvent, status, t, transcodingContextCourseId, transcodingContextSectionId]);

    // Get selected course, section, lesson names for display
    const selectedCourse = courses.find((c) => String(c.id) === String(transcodeCourseId));
    const selectedSection = sections.find((s) => String(s.id) === String(transcodeSectionId));
    const selectedLesson = lessons.find((l) => String(l.id) === String(transcodeLessonId));
    const activeWorkflowMeta = COURSE_WORKFLOWS.find((workflow) => workflow.id === activeWorkflow);
    const showCatalogWorkflow = activeWorkflow === 'catalog';
    const showEnrollmentWorkflow = activeWorkflow === 'enrollment';
    const showMediaWorkflow = activeWorkflow === 'media';

    return (
        <div className="space-y-6">
            <DashboardSectionHeader
                eyebrow={t('adminCourses.eyebrow')}
                title={t('adminCourses.title')}
                description={t('adminCourses.description')}
            />

            <div className="grid gap-4 md:grid-cols-4">
                <DashboardMetricCard label={t('adminCourses.metrics.courses')} value={courses.length} icon={FiBookOpen} />
                <DashboardMetricCard
                    label={t('adminCourses.metrics.published')}
                    value={publishedCourses}
                    icon={FiLayers}
                    tone={publishedCourses ? 'green' : 'default'}
                />
                <DashboardMetricCard label={t('adminCourses.metrics.categories')} value={categories.length} icon={FiFolder} />
                <DashboardMetricCard
                    label={t('adminCourses.metrics.delivery')}
                    value={deliveryCourses}
                    icon={FiUsers}
                    tone={deliveryCourses ? 'blue' : 'default'}
                />
            </div>

            <div className="rounded-2xl border border-edubot-line/80 bg-white/90 p-4 shadow-edubot-card dark:border-slate-700 dark:bg-slate-950">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-edubot-muted dark:text-slate-400">
                            {t('adminCourses.operations')}
                        </p>
                        <p className="mt-1 text-sm text-edubot-muted dark:text-slate-400">
                            {activeWorkflowMeta ? t(activeWorkflowMeta.descriptionKey) : ''}
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {COURSE_WORKFLOWS.map((workflow) => (
                            <button
                                key={workflow.id}
                                type="button"
                                onClick={() => setActiveWorkflow(workflow.id)}
                                className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                                    workflow.id === activeWorkflow
                                        ? 'border-edubot-orange bg-edubot-orange text-white'
                                        : 'border-edubot-line bg-white text-edubot-muted hover:border-edubot-orange hover:text-edubot-orange dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'
                                }`}
                            >
                                {t(workflow.labelKey)}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.35fr_0.95fr]">
                {(showCatalogWorkflow || showEnrollmentWorkflow) && (
                    <DashboardInsetPanel
                        title={showEnrollmentWorkflow ? t('adminCourses.enrollment.title') : t('adminCourses.catalog.title')}
                        description={
                            showEnrollmentWorkflow
                                ? t('adminCourses.enrollment.description')
                                : t('adminCourses.catalog.description')
                        }
                        data-workspace-section={
                            showEnrollmentWorkflow
                                ? ADMIN_COURSES_TAB_SECTIONS.ENROLLMENT_OVERSIGHT
                                : ADMIN_COURSES_TAB_SECTIONS.CATALOG_GOVERNANCE
                        }
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
                                                            {getCourseTypeLabel(course.courseType, t)}
                                                        </span>
                                                        {course.isPublished ? (
                                                            <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                                                                {t('adminCourses.status.published')}
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">
                                                                {t('adminCourses.status.draft')}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="mt-2 text-sm text-edubot-muted dark:text-slate-400">
                                                        {t('adminPendingCourses.instructor')}: {course.instructor?.fullName || '—'}
                                                    </p>
                                                    {course.shortDescription ? (
                                                        <p className="mt-2 line-clamp-2 text-sm text-edubot-muted dark:text-slate-400">
                                                            {course.shortDescription}
                                                        </p>
                                                    ) : null}
                                                </div>

                                                {showCatalogWorkflow ? (
                                                    <div className="flex flex-wrap gap-2">
                                                        {isDeliveryCourse ? (
                                                            <button
                                                                type="button"
                                                                onClick={() => setDetailCourse(course)}
                                                                className="dashboard-button-secondary"
                                                            >
                                                                <FiEye className="h-4 w-4" />
                                                                {t('adminPendingCourses.actions.details')}
                                                            </button>
                                                        ) : (
                                                            <Link to={`/courses/${course.id}`} className="dashboard-button-secondary">
                                                                <FiEye className="h-4 w-4" />
                                                                {t('adminCourses.actions.view')}
                                                            </Link>
                                                        )}
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDeleteCourse(course)}
                                                            className="dashboard-button-secondary"
                                                        >
                                                            <FiTrash2 className="h-4 w-4" />
                                                            {t('adminCourses.actions.delete')}
                                                        </button>
                                                    </div>
                                                ) : null}
                                            </div>

                                            {showEnrollmentWorkflow ? (
                                            <div className="mt-4">
                                                {isDeliveryCourse ? (
                                                    <div className="mb-3">
                                                        <label className="mb-2 block text-sm font-medium text-edubot-muted dark:text-slate-400">
                                                            {t('adminCourses.enrollment.selectGroup')}
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
                                                            <option value="">{t('adminCourses.enrollment.selectGroup')}</option>
                                                            {groupOptions.map((group) => (
                                                                <option key={group.id} value={group.id}>
                                                                    {(group.name || t('adminCourses.fallback.group', { id: group.id })) +
                                                                        ` (${group.code || '—'}) · ${getDeliveryModeLabel(group.deliveryMode, t)}`}
                                                                </option>
                                                            ))}
                                                        </select>
                                                        {groupOptions.length ? (
                                                            <div className="mt-2 flex flex-wrap gap-2">
                                                                {groupOptions.map((group) => (
                                                                    <span
                                                                        key={group.id}
                                                                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${getDeliveryModeClass(group.deliveryMode)}`}
                                                                    >
                                                                        {(group.name || t('adminCourses.fallback.group', { id: group.id }))} · {getDeliveryModeLabel(group.deliveryMode, t)}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        ) : null}
                                                    </div>
                                                ) : null}

                                                <label className="mb-2 block text-sm font-medium text-edubot-muted dark:text-slate-400">
                                                    {isDeliveryCourse
                                                        ? t('adminCourses.enrollment.enrollInGroup')
                                                        : t('adminCourses.enrollment.enrollInCourse')}
                                                </label>
                                                <select
                                                    onChange={(e) => handleEnrollUser(e.target.value, course.id)}
                                                    className="dashboard-select w-full"
                                                    defaultValue=""
                                                    disabled={isDeliveryCourse && !selectedGroupId}
                                                >
                                                    <option value="" disabled>
                                                        {isDeliveryCourse && !selectedGroupId
                                                            ? t('adminCourses.enrollment.selectGroupFirst')
                                                            : t('adminCourses.enrollment.selectUser')}
                                                    </option>
                                                    {users.map((u) => (
                                                        <option key={u.id} value={u.id}>
                                                            {u.fullName} ({u.role})
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            ) : null}
                                        </article>
                                    );
                                })()
                            ))}
                        </div>
                    ) : (
                        <div className="mt-4">
                            <EmptyState
                                title={t('adminCourses.empty.title')}
                                subtitle={t('adminCourses.empty.subtitle')}
                            />
                        </div>
                    )}
                    </DashboardInsetPanel>
                )}

                {(showCatalogWorkflow || showMediaWorkflow) && (
                <div className="space-y-6">
                    {showCatalogWorkflow && (
                    <DashboardInsetPanel
                        title={t('adminCourses.categories.title')}
                        description={t('adminCourses.categories.description')}
                        data-workspace-section={ADMIN_COURSES_TAB_SECTIONS.CATALOG_GOVERNANCE}
                    >
                        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                            <input
                                value={newCategory || ''}
                                onChange={(e) => setNewCategory(e.target.value)}
                                className="dashboard-field flex-1"
                                placeholder={t('adminCourses.categories.placeholder')}
                            />
                            <button
                                type="button"
                                onClick={handleAddCategory}
                                className="dashboard-button-primary self-start"
                            >
                                {t('adminCourses.actions.add')}
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
                                                    {t('adminCourses.actions.save')}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setEditingCategoryId(null);
                                                        setEditingCategoryName('');
                                                    }}
                                                    className="dashboard-button-secondary"
                                                >
                                                    {t('adminCourses.actions.cancel')}
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
                                                    {t('adminCourses.actions.edit')}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteCategory(category)}
                                                    className="dashboard-button-secondary"
                                                >
                                                    {t('adminCourses.actions.delete')}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </DashboardInsetPanel>
                    )}

                    {showMediaWorkflow && (
                    <DashboardInsetPanel
                        title={t('adminCourses.transcode.title')}
                        description={t('adminCourses.transcode.description')}
                        data-workspace-section={ADMIN_COURSES_TAB_SECTIONS.MEDIA_OPERATIONS}
                    >
                        <div className="mt-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 p-3 text-sm text-blue-700 dark:text-blue-300">
                            <p>{t('adminCourses.transcode.autoNotice')}</p>
                        </div>

                        {/* Selection summary */}
                        {(selectedCourse || selectedSection) && (
                            <div className="mt-3 rounded-lg bg-slate-100 dark:bg-slate-800 p-2 text-sm">
                                {selectedCourse && <p className="text-slate-700 dark:text-slate-300">{t('adminCourses.transcode.labels.course')}: <span className="font-medium">{selectedCourse.title}</span></p>}
                                {selectedSection && <p className="text-slate-700 dark:text-slate-300">{t('adminCourses.transcode.labels.section')}: <span className="font-medium">{selectedSection.title}</span></p>}
                                {selectedLesson && <p className="text-slate-700 dark:text-slate-300">{t('adminCourses.transcode.labels.lesson')}: <span className="font-medium">{selectedLesson.title}</span></p>}
                            </div>
                        )}

                        <div className="mt-4 grid gap-3">
                            {/* Course selector */}
                            <div>
                                <label className="mb-1 block text-sm font-medium text-edubot-muted dark:text-slate-400">
                                    {t('adminCourses.transcode.selectCourse')}
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
                                    <option value="">{t('adminCourses.transcode.selectCourse')}</option>
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
                                    {t('adminCourses.transcode.selectSection')}
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
                                    <option value="">{sectionsLoading ? t('common.loading') : t('adminCourses.transcode.selectSection')}</option>
                                    {sections.map((section) => (
                                        <option key={section.id} value={section.id}>
                                            {section.title || t('adminCourses.fallback.section', { id: section.id })}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Lesson selector */}
                            <div>
                                <label className="mb-1 block text-sm font-medium text-edubot-muted dark:text-slate-400">
                                    {t('adminCourses.transcode.selectLesson')}
                                </label>
                                <select
                                    value={transcodeLessonId || ''}
                                    onChange={(e) => setTranscodeLessonId(e.target.value ? Number(e.target.value) : '')}
                                    disabled={!transcodeSectionId || lessonsLoading}
                                    className="dashboard-select w-full disabled:opacity-50"
                                >
                                    <option value="">{lessonsLoading ? t('common.loading') : t('adminCourses.transcode.allVideoLessons')}</option>
                                    {lessons.map((lesson) => (
                                        <option key={lesson.id} value={lesson.id}>
                                            {lesson.title || t('adminCourses.fallback.lesson', { id: lesson.id })} {lesson.playbackStatus === 'processing' ? t('adminCourses.transcode.processingSuffix') : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Lesson IDs input for specific lessons */}
                            <div>
                                <label className="mb-1 block text-sm font-medium text-edubot-muted dark:text-slate-400">
                                    {t('adminCourses.transcode.lessonIdsLabel')}
                                </label>
                                <input
                                    type="text"
                                    placeholder={t('adminCourses.transcode.lessonIdsPlaceholder')}
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
                                    setAlreadyTranscodedMessage(''); // Clear previous message

                                    if (transcodeLessonId && transcodeCourseId && transcodeSectionId) {
                                        // Check if lesson is already transcoded
                                        const selectedLesson = lessons.find(l => l.id === transcodeLessonId);
                                        if (selectedLesson?.playbackStatus === 'ready' && selectedLesson?.playbackType === 'hls') {
                                            // Already transcoded - show message
                                            setAlreadyTranscodedMessage(t('adminCourses.transcode.alreadySingle', {
                                                title: selectedLesson.title || t('adminCourses.fallback.lesson', { id: selectedLesson.id }),
                                            }));
                                            recordTranscodeEvent({
                                                type: 'skipped',
                                                label: t('adminCourses.transcode.history.skipped'),
                                                detail: selectedLesson.title || t('adminCourses.fallback.lesson', { id: selectedLesson.id }),
                                            });
                                            return;
                                        }

                                        // Store context for status polling
                                        setTranscodingContextCourseId(transcodeCourseId);
                                        setTranscodingContextSectionId(transcodeSectionId);
                                        setLastTranscodedLessonId(transcodeLessonId);
                                        setIsBulkTranscoding(false);
                                        // Queue the action to run after state is set
                                        setPendingTranscodeAction({ type: 'individual' });
                                    } else if (transcodeCourseId && transcodeSectionId) {
                                        // Check if all video lessons in section are already transcoded
                                        const untranscodedLessons = lessons.filter(l =>
                                            !(l.playbackStatus === 'ready' && l.playbackType === 'hls')
                                        );

                                        if (untranscodedLessons.length === 0) {
                                            // All lessons already transcoded - show message
                                            setAlreadyTranscodedMessage(t('adminCourses.transcode.alreadyBulk'));
                                            recordTranscodeEvent({
                                                type: 'skipped',
                                                label: t('adminCourses.transcode.history.bulkSkipped'),
                                                detail: t('adminCourses.transcode.history.allReady'),
                                            });
                                            return;
                                        }

                                        // Store context for status polling
                                        setTranscodingContextCourseId(transcodeCourseId);
                                        setTranscodingContextSectionId(transcodeSectionId);
                                        setLastTranscodedLessonId(null);
                                        setIsBulkTranscoding(true);
                                        // Queue the action to run after state is set with untranscoded lesson IDs
                                        setPendingTranscodeAction({
                                            type: 'bulk',
                                            lessonIds: untranscodedLessons.map(l => l.id)
                                        });
                                        recordTranscodeEvent({
                                            type: 'started',
                                            label: t('adminCourses.transcode.history.bulkStarted'),
                                            detail: t('adminCourses.transcode.history.videoLessonCount', {
                                                count: untranscodedLessons.length,
                                            }),
                                        });
                                    }
                                }}
                                disabled={transcodeLoading || !transcodeCourseId || !transcodeSectionId}
                                className="dashboard-button-primary disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <FiUploadCloud className="h-4 w-4" />
                                {transcodeLoading ? <Loader fullScreen={false} /> : transcodeLessonId ? t('adminCourses.transcode.actions.retry') : t('adminCourses.transcode.actions.bulk')}
                            </button>
                            <p className="text-xs text-edubot-muted dark:text-slate-400">
                                {t('adminCourses.transcode.help')}
                            </p>

                            {/* Already Transcoded Message */}
                            {alreadyTranscodedMessage && (
                                <div className="mt-2 px-3 py-2 bg-green-50 border border-green-200 rounded-md text-green-700 text-sm">
                                    {alreadyTranscodedMessage}
                                </div>
                            )}
                        </div>

                        {/* Transcoding Status Display - Individual Lesson */}
                        {lastTranscodedLessonId && (
                            <div className="mt-6 space-y-3 border-t border-edubot-line/50 dark:border-slate-700 pt-4">
                                <div className="flex items-center justify-between gap-3">
                                    <div className="text-sm text-edubot-muted dark:text-slate-400">
                                        {t('adminCourses.transcode.statusLabel')}: <span className="font-medium">{lessons.find(l => l.id === lastTranscodedLessonId)?.title || t('adminCourses.fallback.lesson', { id: lastTranscodedLessonId })}</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={manualRefresh}
                                        disabled={isPolling}
                                        aria-label={t('adminCourses.transcode.actions.refreshStatus')}
                                        className="text-xs px-2 py-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 disabled:text-gray-400 transition-colors"
                                        title={t('adminCourses.transcode.actions.refreshStatus')}
                                    >
                                        <span aria-hidden="true">🔄</span>
                                    </button>
                                </div>

                                <TranscodingStatusBadge
                                    status={status}
                                    error={error}
                                    isPolling={isPolling}
                                    playbackType={lessons.find(l => l.id === lastTranscodedLessonId)?.playbackType}
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
                                    onForceRetry={status === 'starting' && lessons.find(l => l.id === lastTranscodedLessonId)?.playbackType === 'hls' ? async () => {
                                        try {
                                            await forceTranscodeLessonHls({
                                                courseId: transcodingContextCourseId,
                                                sectionId: transcodingContextSectionId,
                                                lessonId: lastTranscodedLessonId,
                                            });
                                            setTimeout(manualRefresh, 1000);
                                        } catch (err) {
                                            console.error('[AdminCoursesTab] Force retry failed:', err);
                                        }
                                    } : null}
                                />

                                {status === 'failed' && error && (
                                    <div className="mt-3 space-y-2" role="alert">
                                        <div className="px-3 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-md">
                                            <p className="text-xs font-medium text-red-700 dark:text-red-300 mb-1">{t('adminCourses.transcode.errorTitle')}</p>
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
                                        <p className="text-xs text-green-700 dark:text-green-300">{t('adminCourses.transcode.readyMessage')}</p>
                                    </div>
                                )}

                                {(status === 'starting' || status === 'processing') && (
                                    <div className="px-3 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900/50 rounded-md">
                                        <p className="text-xs text-blue-700 dark:text-blue-300">{t('adminCourses.transcode.processingMessage')}</p>
                                    </div>
                                )}

                                <button
                                    type="button"
                                    onClick={() => {
                                        setLastTranscodedLessonId(null);
                                        setTranscodingContextCourseId(null);
                                        setTranscodingContextSectionId(null);
                                    }}
                                    className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                                >
                                    {t('adminDeliveryCourseDetails.close')}
                                </button>
                            </div>
                        )}

                        {/* Transcoding Status Display - Bulk */}
                        {isBulkTranscoding && (
                            <div className="mt-6 space-y-3 border-t border-edubot-line/50 dark:border-slate-700 pt-4">
                                <div className="text-sm text-edubot-muted dark:text-slate-400">
                                    {t('adminCourses.transcode.bulkStatusLabel')}: <span className="font-medium">{courses.find(c => c.id === transcodingContextCourseId)?.title || t('adminCourses.fallback.courseGeneric')} - {sections.find(s => s.id === transcodingContextSectionId)?.title || t('adminCourses.fallback.sectionGeneric')}</span>
                                </div>

                                <div className="px-3 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900/50 rounded-md">
                                    <p className="text-xs text-blue-700 dark:text-blue-300">{t('adminCourses.transcode.bulkProcessingMessage')}</p>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsBulkTranscoding(false);
                                        setTranscodingContextCourseId(null);
                                        setTranscodingContextSectionId(null);
                                    }}
                                    className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                                >
                                    {t('adminDeliveryCourseDetails.close')}
                                </button>
                            </div>
                        )}

                        {transcodeHistory.length > 0 && (
                            <div className="mt-6 border-t border-edubot-line/50 pt-4 dark:border-slate-700">
                                <p className="text-sm font-semibold text-edubot-ink dark:text-white">
                                    {t('adminCourses.transcode.history.title')}
                                </p>
                                <div className="mt-3 space-y-2">
                                    {transcodeHistory.map((event) => (
                                        <div
                                            key={event.id}
                                            className="rounded-lg border border-edubot-line/60 bg-white/70 px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-900/70"
                                        >
                                            <div className="flex flex-wrap items-center justify-between gap-2">
                                                <span className="font-semibold text-edubot-ink dark:text-white">
                                                    {event.label}
                                                </span>
                                                <span className="text-edubot-muted dark:text-slate-400">
                                                    {new Date(event.createdAt).toLocaleTimeString(i18n.language, {
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })}
                                                </span>
                                            </div>
                                            <p className="mt-1 text-edubot-muted dark:text-slate-400">
                                                {event.detail}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </DashboardInsetPanel>
                    )}
                </div>
                )}
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
