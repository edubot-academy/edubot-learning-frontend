// Main course builder hook
// Orchestrates all course builder functionality while maintaining identical behavior
// to CreateCourse.jsx and EditInstructorCourse.jsx

import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

// Import our shared modules
import {
    DEFAULT_COURSE_INFO,
    createDefaultCurriculum,
    getDefaultSectionTitle,
} from '../constants';
import { getStepItems } from '../utils';
import {
    getCourseInfoErrors,
    getCurriculumStats,
} from '../validation';
import {
    isAnyLessonUploading,
} from '../utils';

// Import sub-hooks
import { useCourseBuilderInfo } from './useCourseBuilderInfo';
import { useCourseBuilderCurriculum } from './useCourseBuilderCurriculum';

import { deleteSection } from '../../api';
import { fetchSkills } from '../../../skills/api';
import { isForbiddenError, parseApiError } from '../../../../shared/api/error';
import {
    acceptAiGeneration,
    generateAiCourseDraft,
    getAiLmsCapabilities,
    rejectAiGeneration,
} from '../../../aiLms/api';
import {
    loadCreateCourseBuilderData,
    loadEditCourseBuilderData,
    mapSkillsToOptions,
} from '../utils/courseBuilderDataLoaders';

const getOptionalSkillLabel = (t) =>
    t('instructorDashboard.courseBuilder.placeholders.optionalSkill');

const localizeSkillOptions = (options = [], t) => {
    const placeholder = getOptionalSkillLabel(t);
    const mappedOptions = (Array.isArray(options) ? options : []).map((option) =>
        String(option.value) === ''
            ? { ...option, label: placeholder }
            : option
    );

    return mappedOptions.some((option) => String(option.value) === '')
        ? mappedOptions
        : [{ value: '', label: placeholder }, ...mappedOptions];
};

/**
 * Main course builder hook
 * @param {Object} options - Hook options
 * @param {string} options.mode - 'create' or 'edit'
 * @param {string} options.courseId - Course ID (for edit mode)
 * @returns {Object} - Course builder state and operations
 */
export const useCourseBuilder = ({ mode = 'create', courseId: initialCourseId = null } = {}) => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const tRef = useRef(t);
    const defaultCurriculumRef = useRef(
        createDefaultCurriculum(DEFAULT_COURSE_INFO.languageCode)
    );
    const [courseId, setCourseId] = useState(initialCourseId);
    const lastCoverPreviewUrlRef = useRef('');
    const pendingCoverNameRef = useRef('');

    // Basic state (identical to both components)
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(mode === 'edit');
    const [saving, setSaving] = useState(false);

    // Course info state
    const [courseInfo, setCourseInfo] = useState(DEFAULT_COURSE_INFO);
    const [infoTouched, setInfoTouched] = useState({});

    // Curriculum state
    const [curriculum, setCurriculum] = useState(() => defaultCurriculumRef.current);

    // UI state
    const [expandedSections, setExpandedSections] = useState({});
    const [singleSectionFocus, setSingleSectionFocus] = useState(true);
    const [dragSectionIndex, setDragSectionIndex] = useState(null);
    const [dragLesson, setDragLesson] = useState(null);

    // Edit mode specific state
    const [originalCourse, setOriginalCourse] = useState(null);
    const [originalSections, setOriginalSections] = useState([]);
    const [deletedLessons, setDeletedLessons] = useState([]);
    const [deletedSections, setDeletedSections] = useState([]);
    // Data state
    const [categories, setCategories] = useState([]);
    const [skillOptions, setSkillOptions] = useState([
        { value: '', label: getOptionalSkillLabel(t) },
    ]);
    const [skillsLoading, setSkillsLoading] = useState(false);
    const [draftLoadedAt, setDraftLoadedAt] = useState('');
    const [lastDraftSavedAt, setLastDraftSavedAt] = useState('');
    const [draftHydrated, setDraftHydrated] = useState(mode !== 'create');
    const draftDiscardedRef = useRef(false);
    const [aiCourseDraftEnabled, setAiCourseDraftEnabled] = useState(false);
    const [aiCourseDraft, setAiCourseDraft] = useState(null);
    const [aiCourseDrafting, setAiCourseDrafting] = useState(false);
    const [aiCourseDraftError, setAiCourseDraftError] = useState('');

    // Confirmation state
    const [confirmDelete, setConfirmDelete] = useState({
        type: null,
        sectionIndex: null,
        lessonIndex: null,
        title: '',
    });

    // Create state object for sub-hooks
    const courseBuilderState = {
        step,
        setStep,
        loading,
        saving,
        setSaving,
        courseInfo,
        setCourseInfo,
        infoTouched,
        setInfoTouched,
        curriculum,
        setCurriculum,
        expandedSections,
        setExpandedSections,
        singleSectionFocus,
        setSingleSectionFocus,
        dragSectionIndex,
        setDragSectionIndex,
        dragLesson,
        setDragLesson,
        originalCourse,
        setOriginalCourse,
        originalSections,
        setOriginalSections,
        deletedLessons,
        setDeletedLessons,
        deletedSections,
        setDeletedSections,
        categories,
        skillOptions,
        skillsLoading,
        confirmDelete,
        setConfirmDelete,
        courseId,
        setCourseId,
        mode,
        navigate,
        deleteSection,
        t,
    };

    // Use sub-hooks
    const courseInfoOperations = useCourseBuilderInfo(courseBuilderState);
    const curriculumOperations = useCourseBuilderCurriculum(courseBuilderState);

    // Load initial data
    const loadInitialData = useCallback(async () => {
        const translate = tRef.current;
        const optionalSkillLabel = getOptionalSkillLabel(translate);
        if (mode === 'create') {
            // Create mode - load categories and skills
            try {
                const { categories: categoriesData, skillOptions: loadedSkillOptions } =
                    await loadCreateCourseBuilderData({ optionalSkillLabel });
                setCategories(categoriesData);
                setSkillOptions(localizeSkillOptions(loadedSkillOptions, translate));

                // Load saved draft if exists
                const saved = localStorage.getItem('draftCourse');
                if (saved) {
                    let parsed = null;

                    try {
                        parsed = JSON.parse(saved);
                    } catch (error) {
                        console.warn('Invalid course draft ignored', error);
                        localStorage.removeItem('draftCourse');
                    }

                    if (parsed) {
                        const sanitizedDraftInfo = {
                            ...(parsed.courseInfo || {}),
                        };

                        if (typeof sanitizedDraftInfo.coverImageUrl === 'string' && sanitizedDraftInfo.coverImageUrl.startsWith('blob:')) {
                            sanitizedDraftInfo.coverImageUrl = '';
                        }

                        if (sanitizedDraftInfo.cover && typeof sanitizedDraftInfo.cover === 'object') {
                            sanitizedDraftInfo.cover = null;
                        }

                        pendingCoverNameRef.current =
                            typeof sanitizedDraftInfo.pendingCoverName === 'string'
                                ? sanitizedDraftInfo.pendingCoverName
                                : '';

                        setCourseInfo((prev) => ({
                            ...prev,
                            ...sanitizedDraftInfo,
                        }));
                        setCourseId(parsed.courseId || null);
                        setStep(parsed.step || 1);
                        setDraftLoadedAt(parsed.savedAt || '');
                        setLastDraftSavedAt(parsed.savedAt || '');
                    }
                }
            } catch (error) {
                console.error('Failed to load categories', error);
                if (isForbiddenError(error)) {
                    navigate('/unauthorized');
                    return;
                }
                toast.error(
                    parseApiError(
                        error,
                        translate('instructorDashboard.courseBuilder.toasts.dataLoadError')
                    ).message
                );
            } finally {
                setDraftHydrated(true);
            }
        } else {
            // Edit mode must always hydrate from the API for the current course.
            // The previous localStorage gate could skip fetchSections entirely and leave
            // the builder rendering stale default state.
            try {
                const {
                    categories: categoriesData,
                    courseInfo: loadedCourseInfo,
                    curriculum: loadedCurriculum,
                    lessonExtraWarnings,
                    skillOptions: loadedSkillOptions,
                } = await loadEditCourseBuilderData(courseId, { optionalSkillLabel });

                setCourseInfo(loadedCourseInfo);
                setOriginalCourse(loadedCourseInfo);
                setCategories(categoriesData);
                setSkillOptions(localizeSkillOptions(loadedSkillOptions, translate));
                setCurriculum(loadedCurriculum);
                setOriginalSections(JSON.parse(JSON.stringify(loadedCurriculum)));

                if (lessonExtraWarnings.length) {
                    toast(
                        translate('instructorDashboard.courseBuilder.toasts.lessonExtraWarnings', {
                            count: lessonExtraWarnings.length,
                        })
                    );
                }
            } catch (err) {
                console.error(err);
                if (isForbiddenError(err)) {
                    navigate('/unauthorized');
                    return;
                }
                toast.error(
                    parseApiError(
                        err,
                        translate('instructorDashboard.courseBuilder.toasts.dataLoadError')
                    ).message
                );
            } finally {
                setLoading(false);
            }
        }
    }, [mode, courseId, navigate]);

    // Load skills list
    const loadSkillsList = useCallback(async () => {
        setSkillsLoading(true);
        try {
            const skillsData = await fetchSkills().catch(() => []);
            if (Array.isArray(skillsData) && skillsData.length) {
                setSkillOptions(localizeSkillOptions(
                    mapSkillsToOptions(skillsData, getOptionalSkillLabel(tRef.current)),
                    tRef.current
                ));
            }
        } catch (error) {
            console.error('Skills load failed', error);
            toast.error(tRef.current('instructorDashboard.courseBuilder.toasts.skillsLoadError'));
        } finally {
            setSkillsLoading(false);
        }
    }, []);

    // Save draft for create mode
    const saveDraft = useCallback(() => {
        if (draftDiscardedRef.current) return;

        if (mode === 'create') {
            const draftCourseInfo = {
                ...courseInfo,
                cover: null,
                pendingCoverName:
                    courseInfo.cover instanceof File
                        ? courseInfo.cover.name
                        : courseInfo.pendingCoverName || '',
                coverImageUrl:
                    typeof courseInfo.coverImageUrl === 'string' && courseInfo.coverImageUrl.startsWith('blob:')
                        ? ''
                        : courseInfo.coverImageUrl,
            };
            const savedAt = new Date().toISOString();
            localStorage.setItem('draftCourse', JSON.stringify({ courseInfo: draftCourseInfo, courseId, step, savedAt }));
            setLastDraftSavedAt(savedAt);
        }
    }, [mode, courseInfo, courseId, step]);

    const discardDraft = useCallback(() => {
        if (mode !== 'create') return { cleared: false };

        if (courseId) {
            localStorage.removeItem('draftCourse');
            setDraftLoadedAt('');
            setLastDraftSavedAt('');
            return { cleared: true, preservedServerDraft: true };
        }

        draftDiscardedRef.current = true;
        defaultCurriculumRef.current = createDefaultCurriculum(DEFAULT_COURSE_INFO.languageCode);
        localStorage.removeItem('draftCourse');
        setCourseInfo(DEFAULT_COURSE_INFO);
        setCurriculum(defaultCurriculumRef.current);
        setStep(1);
        setCourseId(null);
        setInfoTouched({});
        setExpandedSections({});
        setDraftLoadedAt('');
        setLastDraftSavedAt('');
        return { cleared: true, preservedServerDraft: false };
    }, [courseId, mode]);

    const courseDraftToCurriculum = useCallback((output) => {
        const sections = Array.isArray(output?.sections) ? output.sections : [];
        if (!sections.length) return curriculum;

        const mappedSections = sections.map((section, sectionIndex) => ({
            sectionTitle:
                section.title ||
                getDefaultSectionTitle(output?.languageCode || courseInfo.languageCode || 'ky', sectionIndex + 1),
            skillId: '',
            lessons: (Array.isArray(section.lessons) ? section.lessons : []).map((lesson, lessonIndex) => {
                const objectiveText = Array.isArray(lesson.objectives) && lesson.objectives.length
                    ? `\n\n${lesson.objectives.map((objective) => `- ${objective}`).join('\n')}`
                    : '';
                return {
                    title:
                        lesson.title ||
                        t('instructorDashboard.courseBuilder.fallbacks.lesson', { number: lessonIndex + 1 }),
                    content: `${lesson.description || section.description || output.description || ''}${objectiveText}`.trim(),
                    kind: 'article',
                    videoKey: '',
                    videoUrl: '',
                    duration: 600,
                    resources: [],
                    quiz: null,
                    challenge: null,
                    uploading: { video: false, resource: false },
                    uploadProgress: { video: 0, resource: 0 },
                };
            }),
        })).filter((section) => section.lessons.length > 0);

        return mappedSections.length ? mappedSections : curriculum;
    }, [courseInfo.languageCode, curriculum, t]);

    const requestAiCourseDraft = useCallback(async () => {
        const topic = courseInfo.title?.trim();
        if (!topic) {
            setAiCourseDraftError(t('ai.courseDraftTopicRequired'));
            return;
        }

        setAiCourseDrafting(true);
        setAiCourseDraftError('');
        try {
            const draft = await generateAiCourseDraft({
                language: courseInfo.languageCode || 'ky',
                topic,
                targetAudience: courseInfo.description?.trim() || undefined,
                courseType: 'video',
                sectionCount: 4,
                lessonsPerSection: 4,
            });
            setAiCourseDraft({ generationId: draft.generationId, output: draft.output });
            toast.success(t('ai.courseDraftReady'));
        } catch (error) {
            const message = parseApiError(error, t('ai.courseDraftFailed')).message;
            setAiCourseDraftError(message);
            toast.error(message);
        } finally {
            setAiCourseDrafting(false);
        }
    }, [courseInfo.description, courseInfo.languageCode, courseInfo.title, t]);

    const useAiCourseDraft = useCallback(async () => {
        if (!aiCourseDraft?.output) return;

        const output = aiCourseDraft.output;
        try {
            await acceptAiGeneration(aiCourseDraft.generationId);
            setCourseInfo((prev) => ({
                ...prev,
                title: output.title || prev.title,
                subtitle: output.subtitle || prev.subtitle,
                description: output.description || prev.description,
                languageCode: output.languageCode || prev.languageCode || 'ky',
                learningOutcomesText: Array.isArray(output.learningOutcomes)
                    ? output.learningOutcomes.join('\n')
                    : prev.learningOutcomesText,
            }));
            setInfoTouched((prev) => ({
                ...prev,
                title: true,
                subtitle: true,
                description: true,
                languageCode: true,
                learningOutcomesText: true,
            }));
            setCurriculum(courseDraftToCurriculum(output));
            setAiCourseDraft(null);
            setAiCourseDraftError('');
            toast.success(t('ai.courseDraftAccepted'));
        } catch (error) {
            toast.error(parseApiError(error, t('ai.feedbackDraftActionFailed')).message);
        }
    }, [aiCourseDraft, courseDraftToCurriculum, setCourseInfo, setCurriculum, setInfoTouched, t]);

    const cancelAiCourseDraft = useCallback(async () => {
        if (!aiCourseDraft) return;

        try {
            await rejectAiGeneration(aiCourseDraft.generationId);
            setAiCourseDraft(null);
            setAiCourseDraftError('');
            toast.success(t('ai.courseDraftRejected'));
        } catch (error) {
            toast.error(parseApiError(error, t('ai.feedbackDraftActionFailed')).message);
        }
    }, [aiCourseDraft, t]);

    // Effects
    useEffect(() => {
        tRef.current = t;
        setSkillOptions((prev) => localizeSkillOptions(prev, t));
    }, [t]);

    useEffect(() => {
        loadInitialData();
    }, [loadInitialData]);

    useEffect(() => {
        if (mode !== 'create') {
            setAiCourseDraftEnabled(false);
            return undefined;
        }

        let cancelled = false;
        getAiLmsCapabilities(courseId)
            .then((capabilities) => {
                if (!cancelled) setAiCourseDraftEnabled(Boolean(capabilities?.courseDraft?.enabled));
            })
            .catch(() => {
                if (!cancelled) setAiCourseDraftEnabled(false);
            });

        return () => {
            cancelled = true;
        };
    }, [courseId, mode]);

    useEffect(() => {
        if (mode === 'create' && draftHydrated) {
            saveDraft();
        }
    }, [mode, draftHydrated, saveDraft]);

    useEffect(() => {
        if (mode !== 'create' || !draftDiscardedRef.current) return;

        const hasUserInput =
            Object.keys(infoTouched).length > 0 ||
            JSON.stringify(courseInfo) !== JSON.stringify(DEFAULT_COURSE_INFO) ||
            JSON.stringify(curriculum) !== JSON.stringify(defaultCurriculumRef.current) ||
            step !== 1 ||
            courseId !== null;

        if (hasUserInput) {
            draftDiscardedRef.current = false;
            saveDraft();
        }
    }, [courseId, courseInfo, curriculum, infoTouched, mode, saveDraft, step]);

    useEffect(() => {
        const currentPreviewUrl = courseInfo.coverImageUrl;
        const previousPreviewUrl = lastCoverPreviewUrlRef.current;

        if (
            previousPreviewUrl &&
            previousPreviewUrl !== currentPreviewUrl &&
            previousPreviewUrl.startsWith('blob:')
        ) {
            URL.revokeObjectURL(previousPreviewUrl);
        }

        lastCoverPreviewUrlRef.current =
            typeof currentPreviewUrl === 'string' && currentPreviewUrl.startsWith('blob:')
                ? currentPreviewUrl
                : '';

        return () => {
            const lastUrl = lastCoverPreviewUrlRef.current;
            if (lastUrl && lastUrl.startsWith('blob:')) {
                URL.revokeObjectURL(lastUrl);
                lastCoverPreviewUrlRef.current = '';
            }
        };
    }, [courseInfo.coverImageUrl]);

    // Get step items
    const stepItems = getStepItems(step, courseInfo, curriculum, t);

    // Curriculum statistics
    const curriculumStats = getCurriculumStats(curriculum, t);
    const isUploading = isAnyLessonUploading(curriculum);

    // Course info validation
    const courseInfoErrors = getCourseInfoErrors(courseInfo, t);
    const hasCurriculumChanges = useMemo(() => {
        const baseline =
            mode === 'edit' || originalSections.length > 0
                ? originalSections
                : defaultCurriculumRef.current;

        return JSON.stringify(curriculum) !== JSON.stringify(baseline);
    }, [curriculum, mode, originalSections]);
    const hasUnsavedChanges =
        !loading &&
        !saving &&
        !isUploading &&
        (
            mode === 'create'
                ? Object.keys(infoTouched).length > 0 || hasCurriculumChanges
                : courseInfoOperations.hasCourseInfoChanges(originalCourse) ||
                hasCurriculumChanges ||
                deletedLessons.length > 0 ||
                deletedSections.length > 0
        );

    useEffect(() => {
        if (!hasUnsavedChanges) return undefined;

        const handleBeforeUnload = (event) => {
            event.preventDefault();
            event.returnValue = '';
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [hasUnsavedChanges]);

    // Return all state and operations
    return {
        // State
        step,
        setStep,
        loading,
        saving,
        courseInfo,
        setCourseInfo,
        infoTouched,
        setInfoTouched,
        curriculum,
        setCurriculum,
        expandedSections,
        setExpandedSections,
        singleSectionFocus,
        setSingleSectionFocus,
        dragSectionIndex,
        setDragSectionIndex,
        dragLesson,
        setDragLesson,
        originalCourse,
        originalSections,
        deletedLessons,
        categories,
        skillOptions,
        skillsLoading,
        confirmDelete,
        setConfirmDelete,
        draftLoadedAt,
        lastDraftSavedAt,
        aiCourseDraftEnabled,
        aiCourseDraft,
        aiCourseDrafting,
        aiCourseDraftError,

        // Computed values
        stepItems,
        curriculumStats,
        isUploading,
        courseInfoErrors,
        hasUnsavedChanges,

        // Operations from sub-hooks
        ...courseInfoOperations,
        ...curriculumOperations,

        // Basic operations
        loadSkillsList,
        saveDraft,
        discardDraft,
        requestAiCourseDraft,
        useAiCourseDraft,
        cancelAiCourseDraft,

        // Mode info
        mode,
        courseId,
    };
};
