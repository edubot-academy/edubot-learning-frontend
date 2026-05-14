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
    loadCreateCourseBuilderData,
    loadEditCourseBuilderData,
    mapSkillsToOptions,
} from '../utils/courseBuilderDataLoaders';

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
    const [deletedSections, setDeletedSections] = useState([]);
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
    };

    // Use sub-hooks
    const courseInfoOperations = useCourseBuilderInfo(courseBuilderState);
    const curriculumOperations = useCourseBuilderCurriculum(courseBuilderState);

    // Load initial data
    const loadInitialData = useCallback(async () => {
        if (mode === 'create') {
            // Create mode - load categories and skills
            try {
                const { categories: categoriesData, skillOptions: loadedSkillOptions } =
                    await loadCreateCourseBuilderData();
                setCategories(categoriesData);
                setSkillOptions(loadedSkillOptions);

                // Load saved draft if exists
                const saved = localStorage.getItem('draftCourse');
                if (saved) {
                    const parsed = JSON.parse(saved);
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
                } = await loadEditCourseBuilderData(courseId);

                setCourseInfo(loadedCourseInfo);
                setOriginalCourse(loadedCourseInfo);
                setCategories(categoriesData);
                setSkillOptions(loadedSkillOptions);
                setCurriculum(loadedCurriculum);
                setOriginalSections(JSON.parse(JSON.stringify(loadedCurriculum)));

                if (lessonExtraWarnings.length) {
                    toast(
                        `${lessonExtraWarnings.length} сабактын кошумча материалы жүктөлгөн жок. Курс ачылды, бирок ошол сабактарды текшериңиз.`
                    );
                }
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

    // Load skills list
    const loadSkillsList = useCallback(async () => {
        setSkillsLoading(true);
        try {
            const skillsData = await fetchSkills().catch(() => []);
            if (Array.isArray(skillsData) && skillsData.length) {
                setSkillOptions(mapSkillsToOptions(skillsData));
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
            localStorage.setItem('draftCourse', JSON.stringify({ courseInfo: draftCourseInfo, courseId, step }));
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
    }, [mode, saveDraft]);

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
