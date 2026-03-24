// Main course builder hook
// Orchestrates all course builder functionality while maintaining identical behavior
// to CreateCourse.jsx and EditInstructorCourse.jsx

import { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

// Import our shared modules
import {
    DEFAULT_COURSE_INFO,
    DEFAULT_CURRICULUM,
} from '../constants';
import { getStepItems } from '../utils';
import {
    getCourseInfoErrors,
    getLessonIssue,
    getFirstInvalidLessonTarget,
    getCurriculumStats,
    validateCurriculumStructure,
} from '../validation';
import {
    normalizeSkillValue,
    prepareCourseInfoForApi,
    reorderExpandedMap,
    generateSectionChips,
    isAnyLessonUploading,
    safeClone,
} from '../utils';

// Import sub-hooks
import { useCourseBuilderInfo } from './useCourseBuilderInfo';
import { useCourseBuilderCurriculum } from './useCourseBuilderCurriculum';

// API imports (same as original components)
import {
    createCourse,
    updateCourse,
    fetchCourseDetails,
    uploadCourseImage,
    markCoursePending,
    createSection,
    updateSection,
    createLesson,
    updateLesson,
    deleteLesson as deleteLessonApi,
    uploadLessonFile,
    upsertLessonQuiz,
    upsertLessonChallenge,
    fetchLessonQuiz,
    fetchLessonChallenge,
    fetchSections,
    fetchLessons,
} from '../../api';
import { fetchCategories } from '../../../categories/api';
import { fetchSkills } from '../../../skills/api';

// Utils imports (same as original components)
import { getVideoDuration } from '../../../../utils/videoUtils';
import { createEmptyQuiz, ensureQuizShape, normalizeQuizForApi, mapQuizFromApi } from '../../../../utils/quizUtils';
import { createEmptyChallenge, ensureChallengeShape, normalizeChallengeForApi, mapChallengeFromApi } from '../../../../utils/challengeUtils';
import { isForbiddenError, parseApiError } from '../../../../shared/api/error';

/**
 * Main course builder hook
 * @param {Object} options - Hook options
 * @param {string} options.mode - 'create' or 'edit'
 * @param {string} options.courseId - Course ID (for edit mode)
 * @returns {Object} - Course builder state and operations
 */
export const useCourseBuilder = ({ mode = 'create', courseId: initialCourseId = null } = {}) => {
    const navigate = useNavigate();
    const [courseId, setCourseId] = useState(initialCourseId);

    // Basic state (identical to both components)
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(mode === 'edit');
    const [saving, setSaving] = useState(false);

    // Course info state
    const [courseInfo, setCourseInfo] = useState(DEFAULT_COURSE_INFO);
    const [infoTouched, setInfoTouched] = useState({});

    // Curriculum state
    const [curriculum, setCurriculum] = useState(DEFAULT_CURRICULUM);

    // UI state
    const [expandedSections, setExpandedSections] = useState({});
    const [singleSectionFocus, setSingleSectionFocus] = useState(true);
    const [dragSectionIndex, setDragSectionIndex] = useState(null);
    const [dragLesson, setDragLesson] = useState(null);

    // Edit mode specific state
    const [originalCourse, setOriginalCourse] = useState(null);
    const [originalSections, setOriginalSections] = useState([]);
    const [deletedLessons, setDeletedLessons] = useState([]);
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);

    // Data state
    const [categories, setCategories] = useState([]);
    const [skillOptions, setSkillOptions] = useState([{ value: '', label: 'Skill тандаңыз (опция)' }]);
    const [skillsLoading, setSkillsLoading] = useState(false);

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
        originalSections,
        deletedLessons,
        setDeletedLessons,
        showCancelConfirm,
        setShowCancelConfirm,
        categories,
        skillOptions,
        skillsLoading,
        confirmDelete,
        setConfirmDelete,
        courseId,
        setCourseId,
        mode,
        navigate,
    };

    // Use sub-hooks
    const courseInfoOperations = useCourseBuilderInfo(courseBuilderState);
    const curriculumOperations = useCourseBuilderCurriculum(courseBuilderState);

    // Load initial data
    const loadInitialData = useCallback(async () => {
        if (mode === 'create') {
            // Create mode - load categories and skills
            try {
                const [categoriesData] = await Promise.all([fetchCategories()]);
                setCategories(categoriesData);
                loadSkillsList();

                // Load saved draft if exists
                const saved = localStorage.getItem('draftCourse');
                if (saved) {
                    const parsed = JSON.parse(saved);
                    setCourseInfo((prev) => ({
                        ...prev,
                        ...(parsed.courseInfo || {}),
                    }));
                    setStep(parsed.step || 1);
                }
            } catch (error) {
                console.error('Failed to load categories', error);
                if (isForbiddenError(error)) {
                    navigate('/unauthorized');
                    return;
                }
                toast.error(parseApiError(error, 'Маалымат жүктөлбөдү').message);
            }
        } else {
            // Edit mode - load existing course data
            try {
                const [courseData, categoryData, sectionData, skillsData] = await Promise.all([
                    fetchCourseDetails(courseId),
                    fetchCategories(),
                    fetchSections(courseId),
                    fetchSkills().catch(() => []),
                ]);

                // Process skills data
                const mappedSkillOptions = Array.isArray(skillsData) && skillsData.length
                    ? skillsData
                        .filter((s) => s.slug || s.id)
                        .map((s) => ({
                            value: String(s.id ?? s.slug ?? ''),
                            label: s.name || s.slug,
                        }))
                    : [];
                const skillOptionsWithBlank = [
                    { value: '', label: 'Skill тандаңыз (опция)' },
                    ...mappedSkillOptions,
                ];

                // Load lessons for each section
                const allSections = await Promise.all(
                    sectionData.map(async (sec) => {
                        const lessons = await fetchLessons(courseId, sec.id);
                        const sortedLessons = lessons.sort((a, b) => a.order - b.order);
                        const lessonsWithExtras = await Promise.all(
                            sortedLessons.map(async (l) => {
                                const baseLesson = {
                                    ...l,
                                    kind: l.kind || 'video',
                                    content: l.content || '',
                                    resourceName: l.resourceName || '',
                                    quiz: l.kind === 'quiz' ? createEmptyQuiz() : undefined,
                                    challenge: l.kind === 'code' ? createEmptyChallenge() : undefined,
                                    uploadProgress: { video: 0, resource: 0 },
                                    uploading: { video: false, resource: false },
                                };

                                // Load quiz data if needed
                                if (baseLesson.kind === 'quiz') {
                                    try {
                                        const quizData = await fetchLessonQuiz(courseId, sec.id, l.id, true);
                                        baseLesson.quiz = mapQuizFromApi(quizData, true);
                                    } catch (error) {
                                        console.error('Failed to load quiz', error);
                                        toast.error('Квизди жүктөө мүмкүн болбоду');
                                    }
                                }

                                // Load challenge data if needed
                                if (baseLesson.kind === 'code') {
                                    try {
                                        const challengeData = await fetchLessonChallenge(courseId, sec.id, l.id, true);
                                        baseLesson.challenge = mapChallengeFromApi(challengeData, true);
                                    } catch (error) {
                                        console.error('Failed to load challenge', error);
                                        toast.error('Код тапшырманы жүктөө мүмкүн болбоду');
                                    }
                                }

                                return baseLesson;
                            })
                        );

                        return {
                            id: sec.id,
                            title: sec.title,
                            sectionTitle: sec.title, // Keep both for compatibility
                            order: sec.order,
                            skillId: resolveSectionSkillValue(sec, skillOptionsWithBlank),
                            lessons: lessonsWithExtras,
                        };
                    })
                );

                allSections.sort((a, b) => a.order - b.order);

                // Map backend → UI shape for course data
                const learningOutcomesText = Array.isArray(courseData.learningOutcomes)
                    ? courseData.learningOutcomes.join('\n')
                    : '';
                const hydratedCourse = {
                    ...courseData,
                    languageCode: courseData.languageCode || 'ky',
                    isPaid:
                        typeof courseData.isPaid === 'boolean'
                            ? courseData.isPaid
                            : Number(courseData.price) > 0,
                    learningOutcomesText,
                    aiAssistantEnabled: Boolean(courseData.aiAssistantEnabled),
                    categoryId: String(courseData.category?.id ?? courseData.categoryId ?? ''),
                };

                // Set all state
                setSkillOptions(skillOptionsWithBlank);
                setCourseInfo(hydratedCourse);
                setOriginalCourse(hydratedCourse);
                setCategories(categoryData);
                setCurriculum(allSections);
                setOriginalSections(JSON.parse(JSON.stringify(allSections)));
            } catch (err) {
                console.error(err);
                if (isForbiddenError(err)) {
                    navigate('/unauthorized');
                    return;
                }
                toast.error(parseApiError(err, 'Маалыматты жүктөө катасы').message);
            } finally {
                setLoading(false);
            }
        }
    }, [mode, courseId, navigate]);

    // Helper function for edit mode
    const resolveSectionSkillValue = (sectionLike, options = []) => {
        const optionSet = new Set(options.map((o) => o.value));
        const candidates = [
            sectionLike?.skillId,
            sectionLike?.skill?.id,
            sectionLike?.skillSlug,
            sectionLike?.skill?.slug,
        ]
            .map((val) => (val === undefined || val === null ? '' : String(val)))
            .filter(Boolean);
        const match = candidates.find((val) => optionSet.has(val));
        return match ?? (candidates[0] || '');
    };

    // Load skills list
    const loadSkillsList = useCallback(async () => {
        setSkillsLoading(true);
        try {
            const skillsData = await fetchSkills().catch(() => []);
            if (Array.isArray(skillsData) && skillsData.length) {
                const mapped = skillsData
                    .filter((s) => s.slug || s.id)
                    .map((s) => ({
                        value: String(s.id ?? s.slug ?? ''),
                        label: s.name || s.slug,
                    }));
                setSkillOptions([{ value: '', label: 'Skill тандаңыз (опция)' }, ...mapped]);
            }
        } catch (error) {
            console.error('Skills load failed', error);
            toast.error('Skills жүктөлгөн жок.');
        } finally {
            setSkillsLoading(false);
        }
    }, []);

    // Save draft for create mode
    const saveDraft = useCallback(() => {
        if (mode === 'create') {
            localStorage.setItem('draftCourse', JSON.stringify({ courseInfo, courseId, step }));
        }
    }, [mode, courseInfo, courseId, step]);

    // Effects
    useEffect(() => {
        loadInitialData();
    }, [loadInitialData]);

    useEffect(() => {
        if (mode === 'create') {
            saveDraft();
        }
    }, [saveDraft]);

    // Get step items
    const stepItems = getStepItems(mode === 'create' ? courseId : Boolean(courseInfo?.id));

    // Curriculum statistics
    const curriculumStats = getCurriculumStats(curriculum);
    const isUploading = isAnyLessonUploading(curriculum);

    // Course info validation
    const courseInfoErrors = getCourseInfoErrors(courseInfo);

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
        showCancelConfirm,
        categories,
        skillOptions,
        skillsLoading,
        confirmDelete,
        setConfirmDelete,

        // Computed values
        stepItems,
        curriculumStats,
        isUploading,
        courseInfoErrors,

        // Operations from sub-hooks
        ...courseInfoOperations,
        ...curriculumOperations,

        // Basic operations
        loadSkillsList,
        saveDraft,

        // Mode info
        mode,
        courseId,
    };
};
