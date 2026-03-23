import { useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
    createCourse,
    updateCourse,
    createLesson,
    updateLesson,
    createSection,
    updateSection,
    uploadCourseImage,
    uploadLessonFile,
    deleteLesson as deleteLessonApi,
    fetchCategories,
    fetchSkills,
    fetchCourseDetails,
    fetchSections,
    fetchLessons,
    fetchLessonQuiz,
    upsertLessonQuiz,
    fetchLessonChallenge,
    upsertLessonChallenge,
    markCoursePending,
} from '@services/api';
import { getVideoDuration } from '../../../utils/videoUtils';
import { isForbiddenError, parseApiError } from '@shared/api/error';
import {
    DEFAULT_COURSE_INFO,
    createDefaultSection,
    createDefaultLesson,
    normalizeSkillValue,
    toSkillValue,
    resolveSectionSkillValue,
    buildLessonPayload,
    buildCoursePayload,
    hydrateCourseFromApi,
    reorderExpandedMap,
    handleLessonKindChange,
} from '../utils/courseBuilder.utils';
import {
    getCourseInfoErrors,
    validateCurriculum,
    getFirstInvalidLessonTarget,
    getSectionReadyCount,
} from '../utils/courseBuilder.validation';
import { createEmptyQuiz, mapQuizFromApi, normalizeQuizForApi } from '../../../utils/quizUtils';
import { createEmptyChallenge, mapChallengeFromApi, normalizeChallengeForApi } from '../../../utils/challengeUtils';

export const useCourseBuilder = ({ mode = 'create', courseId: initialCourseId = null } = {}) => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [courseId, setCourseId] = useState(initialCourseId);
    const [courseInfo, setCourseInfo] = useState(DEFAULT_COURSE_INFO);
    const [originalCourse, setOriginalCourse] = useState(null);
    const [infoTouched, setInfoTouched] = useState({});
    const [curriculum, setCurriculum] = useState([createDefaultSection(0)]);
    const [originalSections, setOriginalSections] = useState([]);
    const [categories, setCategories] = useState([]);
    const [skillOptions, setSkillOptions] = useState([
        { value: '', label: 'Skill тандаңыз (опция)' },
    ]);
    const [skillsLoading, setSkillsLoading] = useState(false);
    const [loading, setLoading] = useState(mode === 'edit');
    const [saving, setSaving] = useState(false);
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);
    const [deletedLessons, setDeletedLessons] = useState([]);
    const [confirmDelete, setConfirmDelete] = useState({
        type: null,
        sectionIndex: null,
        lessonIndex: null,
        title: '',
    });
    const [expandedSections, setExpandedSections] = useState({});
    const [singleSectionFocus, setSingleSectionFocus] = useState(true);
    const [dragSectionIndex, setDragSectionIndex] = useState(null);
    const [dragLesson, setDragLesson] = useState(null);

    const dirtySectionIdsRef = useRef(new Set());
    const dirtyLessonIdsRef = useRef(new Set());

    const loadSkillsList = useCallback(async () => {
        setSkillsLoading(true);
        try {
            const skillsData = await fetchSkills().catch(() => []);
            if (Array.isArray(skillsData) && skillsData.length) {
                const mapped = skillsData
                    .filter((s) => s.slug || s.id)
                    .map((s) => ({
                        value: toSkillValue(s.id ?? s.slug ?? ''),
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

    const loadInitialData = useCallback(async () => {
        if (mode !== 'edit' || !courseId) return;

        try {
            const [courseData, categoryData, sectionData, skillsData] = await Promise.all([
                fetchCourseDetails(courseId),
                fetchCategories(),
                fetchSections(courseId),
                fetchSkills().catch(() => []),
            ]);

            const mappedSkillOptions =
                Array.isArray(skillsData) && skillsData.length
                    ? skillsData
                        .filter((s) => s.slug || s.id)
                        .map((s) => ({
                            value: toSkillValue(s.id ?? s.slug ?? ''),
                            label: s.name || s.slug,
                        }))
                    : [];
            const skillOptionsWithBlank = [
                { value: '', label: 'Skill тандаңыз (опция)' },
                ...mappedSkillOptions,
            ];

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
                                challenge:
                                    l.kind === 'code' ? createEmptyChallenge() : undefined,
                                uploadProgress: { video: 0, resource: 0 },
                                uploading: { video: false, resource: false },
                            };

                            if (baseLesson.kind === 'quiz') {
                                try {
                                    const quizData = await fetchLessonQuiz(
                                        courseId,
                                        sec.id,
                                        l.id,
                                        true
                                    );
                                    baseLesson.quiz = mapQuizFromApi(quizData, true);
                                } catch (error) {
                                    console.error('Failed to load quiz', error);
                                    toast.error('Квизди жүктөө мүмкүн болбоду');
                                }
                            }

                            if (baseLesson.kind === 'code') {
                                try {
                                    const challengeData = await fetchLessonChallenge(
                                        courseId,
                                        sec.id,
                                        l.id,
                                        true
                                    );
                                    baseLesson.challenge = mapChallengeFromApi(
                                        challengeData,
                                        true
                                    );
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
                        order: sec.order,
                        skillId: resolveSectionSkillValue(sec, skillOptionsWithBlank),
                        lessons: lessonsWithExtras,
                    };
                })
            );

            allSections.sort((a, b) => a.order - b.order);

            const hydratedCourse = hydrateCourseFromApi(courseData);

            setSkillOptions(skillOptionsWithBlank);
            setCourse(hydratedCourse);
            setOriginalCourse(hydratedCourse);
            setCategories(categoryData);
            setCurriculum(allSections);
            setOriginalSections(JSON.parse(JSON.stringify(allSections)));
            dirtySectionIdsRef.current.clear();
            dirtyLessonIdsRef.current.clear();
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
    }, [mode, courseId, navigate]);

    const loadCreateData = useCallback(async () => {
        if (mode !== 'create') return;

        try {
            const [categoriesData] = await Promise.all([fetchCategories()]);
            setCategories(categoriesData);
            loadSkillsList();

            const saved = localStorage.getItem('draftCourse');
            if (saved) {
                const parsed = JSON.parse(saved);
                setCourseInfo((prev) => ({
                    ...prev,
                    ...(parsed.courseInfo || {}),
                }));
                setCourseId(parsed.courseId || null);
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
    }, [mode, loadSkillsList, navigate]);

    const setCourse = (courseData) => {
        setCourseInfo(courseData);
    };

    const handleCourseInfoChange = (e) => {
        const { name, value, files, type, checked } = e.target;

        if (name === 'cover' && files && files[0]) {
            const file = files[0];
            if (!file.type.startsWith('image/')) {
                toast.error('Сураныч, сүрөт файлын тандаңыз.');
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Сүрөт көлөмү 5MB ашпашы керек.');
                return;
            }
            setCourseInfo((prev) => ({
                ...prev,
                cover: file,
                coverImageUrl: URL.createObjectURL(file),
            }));
            setInfoTouched((prev) => ({ ...prev, cover: true }));
            return;
        }

        if (type === 'checkbox') {
            if (name === 'isPaid') {
                setCourseInfo((prev) => ({ ...prev, isPaid: checked, price: checked ? prev.price : 0 }));
            } else {
                setCourseInfo((prev) => ({ ...prev, [name]: checked }));
            }
            setInfoTouched((prev) => ({ ...prev, [name]: true }));
            return;
        }

        setCourseInfo((prev) => ({ ...prev, [name]: value }));
        setInfoTouched((prev) => ({ ...prev, [name]: true }));
    };

    const addSection = () => {
        setCurriculum((prev) => [
            ...prev,
            createDefaultSection(prev.length),
        ]);
    };

    const addLesson = (sectionIndex) => {
        setCurriculum((prev) => {
            const updated = [...prev];
            updated[sectionIndex].lessons.push(createDefaultLesson());
            return updated;
        });
    };

    const updateSectionTitle = (index, title) => {
        setCurriculum((prev) => {
            const updated = [...prev];
            updated[index].title = title;
            if (mode === 'edit') {
                markSectionDirtyByIndex(index, updated);
            }
            return updated;
        });
    };

    const updateSectionSkill = (index, skillId) => {
        setCurriculum((prev) => {
            const updated = [...prev];
            updated[index].skillId = toSkillValue(skillId);
            if (mode === 'edit') {
                markSectionDirtyByIndex(index, updated);
            }
            return updated;
        });
    };

    const markSectionDirtyByIndex = (sectionIndex, sourceSections) => {
        const section = sourceSections?.[sectionIndex];
        if (section?.id) dirtySectionIdsRef.current.add(section.id);
    };

    const markLessonDirtyByIndex = (sectionIndex, lessonIndex, sourceSections) => {
        const lesson = sourceSections?.[sectionIndex]?.lessons?.[lessonIndex];
        if (lesson?.id) dirtyLessonIdsRef.current.add(lesson.id);
    };

    const updateLesson = (sectionIndex, lessonIndex, field, value) => {
        setCurriculum((prev) => {
            const updated = [...prev];
            const lesson = updated[sectionIndex].lessons[lessonIndex];

            if (field === 'kind') {
                const updatedLesson = handleLessonKindChange(lesson, value);
                updated[sectionIndex].lessons[lessonIndex] = updatedLesson;
            } else {
                lesson[field] = value;
            }

            if (mode === 'edit') {
                markLessonDirtyByIndex(sectionIndex, lessonIndex, updated);
                markSectionDirtyByIndex(sectionIndex, updated);
            }

            return updated;
        });
    };

    const handleChallengeChange = (sectionIndex, lessonIndex, newChallenge) => {
        setCurriculum((prev) => {
            const updated = [...prev];
            const lesson = updated[sectionIndex].lessons[lessonIndex];
            lesson.challenge = newChallenge;
            if (mode === 'edit') {
                markLessonDirtyByIndex(sectionIndex, lessonIndex, updated);
            }
            return updated;
        });
    };

    const handleQuizChange = (sectionIndex, lessonIndex, newQuiz) => {
        setCurriculum((prev) => {
            const updated = [...prev];
            const lesson = updated[sectionIndex].lessons[lessonIndex];
            lesson.quiz = newQuiz;
            if (mode === 'edit') {
                markLessonDirtyByIndex(sectionIndex, lessonIndex, updated);
            }
            return updated;
        });
    };

    const deleteLesson = (sectionIndex, lessonIndex) => {
        if (mode === 'create') {
            const updated = [...curriculum];
            updated[sectionIndex].lessons.splice(lessonIndex, 1);
            setCurriculum(updated);
        } else {
            setCurriculum((prev) => {
                const updated = [...prev];
                const lesson = updated[sectionIndex].lessons[lessonIndex];
                if (lesson?.id) {
                    setDeletedLessons((prevDeleted) => [
                        ...prevDeleted,
                        { sectionId: updated[sectionIndex].id, lessonId: lesson.id },
                    ]);
                    dirtyLessonIdsRef.current.delete(lesson.id);
                }
                updated[sectionIndex].lessons.splice(lessonIndex, 1);
                markSectionDirtyByIndex(sectionIndex, updated);
                return updated;
            });
        }
    };

    const handleDelete = () => {
        if (confirmDelete.type === 'section' && curriculum.length === 1) {
            toast.error('Кеминде бир бөлүм болушу керек.');
            return;
        }
        if (confirmDelete.type === 'lesson') {
            const lessons = curriculum[confirmDelete.sectionIndex].lessons;
            if (confirmDelete.sectionIndex === 0 && lessons.length === 1) {
                toast.error('Кеминде бир сабак болушу керек.');
                return;
            }
        }
        if (confirmDelete.type === 'section') {
            const updated = curriculum.filter((_, i) => i !== confirmDelete.sectionIndex);
            setCurriculum(updated);
        } else if (confirmDelete.type === 'lesson') {
            deleteLesson(confirmDelete.sectionIndex, confirmDelete.lessonIndex);
        }
        setConfirmDelete({
            type: null,
            sectionIndex: null,
            lessonIndex: null,
            title: '',
        });
    };

    const handleFileUpload = async (sectionIndex, lessonIndex, type, file) => {
        if (!file) return;

        const uploadCourseId = mode === 'create' ? courseId : courseId;
        const sectionId = mode === 'create' ? uploadCourseId : curriculum[sectionIndex]?.id;

        if (!uploadCourseId || (mode === 'edit' && !sectionId)) {
            toast.error(mode === 'create' ? 'Адегенде курс маалыматын сактап, андан кийин файл жүктөңүз.' : 'Адегенде бөлүмдү сактап, андан кийин файл жүктөңүз.');
            return;
        }

        const keyProp = type === 'video' ? 'videoKey' : 'resourceKey';
        const existingKey = curriculum[sectionIndex].lessons[lessonIndex][keyProp];
        if (existingKey) return;

        setCurriculum((prev) => {
            const updated = [...prev];
            updated[sectionIndex].lessons[lessonIndex].uploading[type] = true;
            return updated;
        });

        try {
            const key = await uploadLessonFile(
                uploadCourseId,
                mode === 'create' ? sectionIndex : sectionId,
                type,
                file,
                lessonIndex,
                (percent) => {
                    setCurriculum((prev) => {
                        const updated = [...prev];
                        updated[sectionIndex].lessons[lessonIndex].uploadProgress[type] = percent;
                        return updated;
                    });
                }
            );

            if (type === 'video') {
                try {
                    const duration = await getVideoDuration(file);
                    updateLesson(sectionIndex, lessonIndex, 'duration', duration);
                } catch (err) {
                    console.warn('Failed to extract video duration', err);
                }
            }

            updateLesson(sectionIndex, lessonIndex, keyProp, key);

            if (type === 'resource') {
                updateLesson(sectionIndex, lessonIndex, 'resourceName', file.name);
            }
        } catch (err) {
            toast.error(err.message || 'Файл жүктөөдө ката кетти.');
        } finally {
            setCurriculum((prev) => {
                const updated = [...prev];
                updated[sectionIndex].lessons[lessonIndex].uploading[type] = false;
                return updated;
            });
        }
    };

    const handleCourseSubmit = async () => {
        const errors = getCourseInfoErrors(courseInfo);
        if (Object.keys(errors).length) {
            setInfoTouched({
                title: true,
                subtitle: true,
                description: true,
                categoryId: true,
                price: true,
                languageCode: true,
            });
            toast.error('Маалымат табындагы каталарды оңдоңуз.');
            return;
        }

        try {
            const coursePayload = buildCoursePayload(courseInfo);

            if (mode === 'create') {
                const course = await createCourse(coursePayload);
                setCourseId(course.id);

                if (courseInfo.cover instanceof File) {
                    await uploadCourseImage(course.id, courseInfo.cover);
                }

                toast.success('Курс ийгиликтүү түзүлдү!');
                setStep(2);
            } else {
                await updateCourse(courseId, coursePayload);

                if (courseInfo.cover instanceof File) {
                    await uploadCourseImage(courseId, courseInfo.cover);
                }

                toast.success('Курс ийгиликтүү сакталды!');
                setStep(2);
            }
        } catch (err) {
            console.error(err);
            toast.error(mode === 'create' ? 'Курс түзүүдө ката кетти.' : 'Курс сактоодо ката кетти.');
        }
    };

    const handleCurriculumSubmit = async () => {
        const validation = validateCurriculum(curriculum);

        if (!validation.isValid) {
            expandInvalidSections(validation.invalidSectionIndexes);
            if (validation.firstInvalid) {
                setExpandedSections((prev) => ({ ...prev, [validation.firstInvalid.sIdx]: true }));
                requestAnimationFrame(() => {
                    document
                        .getElementById(`lesson-${validation.firstInvalid.sIdx}-${validation.firstInvalid.lIdx}`)
                        ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                });
                toast.error(`Текшерүү керек: ${validation.firstInvalid.issue}`);
            } else {
                toast.error('Айрым сабактар толук эмес.');
            }
            return;
        }

        try {
            if (mode === 'create') {
                for (const [sIdx, section] of curriculum.entries()) {
                    const sec = await createSection(courseId, {
                        title: section.sectionTitle,
                        order: sIdx,
                        skillId: normalizeSkillValue(section.skillId),
                    });

                    for (const [lIdx, lesson] of section.lessons.entries()) {
                        const lessonPayload = buildLessonPayload(lesson, lIdx);
                        const createdLesson = await createLesson(courseId, sec.id, lessonPayload);

                        if (lesson.kind === 'quiz' && lesson.quiz) {
                            const quizPayload = normalizeQuizForApi(lesson.quiz);
                            await upsertLessonQuiz(courseId, sec.id, createdLesson.id, quizPayload);
                        }

                        if (lesson.kind === 'code' && lesson.challenge) {
                            const challengePayload = normalizeChallengeForApi(lesson.challenge);
                            await upsertLessonChallenge(
                                courseId,
                                sec.id,
                                createdLesson.id,
                                challengePayload
                            );
                        }
                    }
                }
            } else {
                await saveEditCurriculum();
            }

            toast.success('Мазмун сакталды!');
            setStep(3);
        } catch (err) {
            console.error(err);
            if (isForbiddenError(err)) {
                navigate('/unauthorized');
                return;
            }
            toast.error(parseApiError(err, 'Мазмунду сактоодо ката кетти.').message);
        }
    };

    const saveEditCurriculum = async () => {
        const dirtySectionIds = dirtySectionIdsRef.current;
        const dirtyLessonIds = dirtyLessonIdsRef.current;

        let writeCount = 0;
        const nextSections = curriculum.map((section) => ({
            ...section,
            lessons: (section.lessons || []).map((lesson) => ({ ...lesson })),
        }));

        for (const { sectionId, lessonId } of deletedLessons) {
            await deleteLessonApi(courseId, sectionId, lessonId);
            writeCount += 1;
        }

        for (const [sectionIdx, section] of nextSections.entries()) {
            const sectionPayload = {
                title: section.title,
                order: sectionIdx,
                skillId: normalizeSkillValue(section.skillId),
            };

            const originalSection = section.id
                ? originalSections.find((item) => item.id === section.id)
                : null;

            const originalSectionIndex = section.id
                ? originalSections.findIndex((item) => item.id === section.id)
                : -1;

            const sectionChanged =
                !section.id ||
                !originalSection ||
                section.title !== originalSection.title ||
                (originalSectionIndex !== -1 && sectionIdx !== originalSectionIndex) ||
                normalizeSkillValue(section.skillId) !== normalizeSkillValue(originalSection.skillId);

            if (!section.id) {
                const createdSection = await createSection(courseId, sectionPayload);
                section.id = createdSection.id;
                writeCount += 1;
            } else if (sectionChanged) {
                await updateSection(courseId, section.id, sectionPayload);
                writeCount += 1;
            }

            const originalLessonsById = new Map(
                (originalSection?.lessons || []).map((lesson) => [lesson.id, lesson])
            );
            const originalLessonIndexById = new Map(
                (originalSection?.lessons || []).map((lesson, index) => [lesson.id, index])
            );

            const hasNewLessons = section.lessons.some((lesson) => !lesson.id);
            const hasDirtyLessons = section.lessons.some(
                (lesson) => lesson.id && dirtyLessonIds.has(lesson.id)
            );
            const sectionMarkedDirty = Boolean(section.id && dirtySectionIds.has(section.id));

            if (section.id && !sectionMarkedDirty && !hasNewLessons && !hasDirtyLessons) {
                continue;
            }

            for (const [lessonIdx, lesson] of section.lessons.entries()) {
                const isQuiz = lesson.kind === 'quiz';
                const isCode = lesson.kind === 'code';

                const shouldProcessLesson =
                    !lesson.id ||
                    !section.id ||
                    (lesson.id ? dirtyLessonIds.has(lesson.id) : true);
                if (!shouldProcessLesson) {
                    continue;
                }

                const lessonPayload = buildLessonPayload(lesson, lessonIdx);
                const originalLesson = lesson.id ? originalLessonsById.get(lesson.id) : null;
                const originalLessonIndex = lesson.id
                    ? (originalLessonIndexById.get(lesson.id) ?? lessonIdx)
                    : lessonIdx;
                const originalLessonPayload = originalLesson
                    ? buildLessonPayload(originalLesson, originalLessonIndex)
                    : null;
                const lessonChanged =
                    !lesson.id ||
                    !originalLesson ||
                    JSON.stringify(lessonPayload) !== JSON.stringify(originalLessonPayload);

                let savedLessonId = lesson.id;
                if (!lesson.id) {
                    const createdLesson = await createLesson(courseId, section.id, lessonPayload);
                    savedLessonId = createdLesson.id;
                    lesson.id = createdLesson.id;
                    writeCount += 1;
                } else if (lessonChanged) {
                    await updateLesson(courseId, section.id, lesson.id, lessonPayload);
                    writeCount += 1;
                }

                if (isQuiz && lesson.quiz) {
                    const quizPayload = normalizeQuizForApi(lesson.quiz);
                    await upsertLessonQuiz(courseId, section.id, savedLessonId, quizPayload);
                }

                if (isCode && lesson.challenge) {
                    const challengePayload = normalizeChallengeForApi(lesson.challenge);
                    await upsertLessonChallenge(
                        courseId,
                        section.id,
                        savedLessonId,
                        challengePayload
                    );
                }
            }
        }
    };

    const expandInvalidSections = (indexes) => {
        if (!indexes.length) return;
        setExpandedSections((prev) => {
            const next = { ...prev };
            indexes.forEach((idx) => {
                next[idx] = true;
            });
            return next;
        });
    };

    const openSection = (sectionIdx) => {
        if (singleSectionFocus) {
            const next = {};
            for (let idx = 0; idx < curriculum.length; idx += 1) next[idx] = idx === sectionIdx;
            setExpandedSections(next);
            return;
        }
        setExpandedSections((prev) => ({ ...prev, [sectionIdx]: true }));
    };

    const jumpToNextInvalidLesson = () => {
        const target = getFirstInvalidLessonTarget(curriculum);
        if (!target) {
            toast.success('Текшериле турган ката жок.');
            return;
        }
        openSection(target.sIdx);
        requestAnimationFrame(() => {
            document
                .getElementById(`lesson-${target.sIdx}-${target.lIdx}`)
                ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
        toast.error(`Текшерүү керек: ${target.issue}`);
    };

    const expandAllSections = (count) => {
        const next = {};
        for (let idx = 0; idx < count; idx += 1) next[idx] = true;
        setExpandedSections(next);
    };

    const collapseAllSections = (count) => {
        const next = {};
        for (let idx = 0; idx < count; idx += 1) next[idx] = false;
        setExpandedSections(next);
    };

    const scrollToSection = (sectionIdx) => {
        openSection(sectionIdx);
        requestAnimationFrame(() => {
            document
                .getElementById(`section-${sectionIdx}`)
                ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    };

    const handleSectionDrop = (targetIdx) => {
        if (dragSectionIndex === null || dragSectionIndex === targetIdx) return;
        setCurriculum((prev) => {
            const next = [...prev];
            const [moved] = next.splice(dragSectionIndex, 1);
            next.splice(targetIdx, 0, moved);
            setExpandedSections((prevExpanded) =>
                reorderExpandedMap(prevExpanded, prev.length, dragSectionIndex, targetIdx)
            );
            if (mode === 'edit') {
                next.forEach((section) => {
                    if (section.id) dirtySectionIdsRef.current.add(section.id);
                });
            }
            return next;
        });
        setDragSectionIndex(null);
    };

    const handleLessonDrop = (sectionIdx, targetLessonIdx) => {
        if (!dragLesson || dragLesson.sectionIdx !== sectionIdx) return;
        if (dragLesson.lessonIdx === targetLessonIdx) return;

        setCurriculum((prev) => {
            const next = [...prev];
            const lessons = [...next[sectionIdx].lessons];
            const [moved] = lessons.splice(dragLesson.lessonIdx, 1);
            lessons.splice(targetLessonIdx, 0, moved);
            next[sectionIdx] = { ...next[sectionIdx], lessons };
            if (mode === 'edit') {
                lessons.forEach((lesson) => {
                    if (lesson.id) dirtyLessonIdsRef.current.add(lesson.id);
                });
            }
            return next;
        });
        setDragLesson(null);
    };

    const handleSubmitForApproval = async () => {
        try {
            await markCoursePending(courseId);
            toast.success('Курс тастыктоого жөнөтүлдү');
            if (mode === 'create') {
                localStorage.removeItem('draftCourse');
            }
            navigate('/instructor/courses');
        } catch (error) {
            console.error('Failed to submit for approval', error);
            if (isForbiddenError(error)) {
                navigate('/unauthorized');
                return;
            }
            toast.error(parseApiError(error, 'Жөнөтүүдө ката кетти').message);
        }
    };

    const handleSaveDraft = () => {
        if (mode === 'create') {
            toast.success('Курс каралууга сакталды');
            localStorage.removeItem('draftCourse');
        } else {
            toast.success('Өзгөртүүлөр сакталды');
        }
        navigate('/instructor/courses');
    };

    const isUploading = curriculum.some((section) =>
        section.lessons.some((lesson) => lesson.uploading?.video || lesson.uploading?.resource)
    );
    const totalLessons = curriculum.reduce((acc, section) => acc + section.lessons.length, 0);
    const readyLessons = curriculum.reduce((acc, section) => acc + getSectionReadyCount(section), 0);
    const completionPercent = totalLessons > 0 ? Math.round((readyLessons / totalLessons) * 100) : 0;

    const stepItems = [
        { id: 1, label: 'Маалымат', enabled: true },
        { id: 2, label: 'Мазмун', enabled: Boolean(courseId) },
        { id: 3, label: 'Превью', enabled: Boolean(courseId) },
    ];

    return {
        // State
        step,
        courseId,
        courseInfo,
        infoTouched,
        curriculum,
        categories,
        skillOptions,
        skillsLoading,
        loading,
        saving,
        showCancelConfirm,
        confirmDelete,
        expandedSections,
        singleSectionFocus,
        dragSectionIndex,
        dragLesson,
        isUploading,
        totalLessons,
        readyLessons,
        completionPercent,
        stepItems,

        // Actions
        setStep,
        setCourseId,
        setCourse,
        setInfoTouched,
        setCurriculum,
        setShowCancelConfirm,
        setConfirmDelete,
        setExpandedSections,
        setSingleSectionFocus,
        setDragSectionIndex,
        setDragLesson,

        // Handlers
        loadInitialData,
        loadCreateData,
        loadSkillsList,
        handleCourseInfoChange,
        addSection,
        addLesson,
        updateSectionTitle,
        updateSectionSkill,
        updateLesson,
        handleChallengeChange,
        handleQuizChange,
        deleteLesson,
        handleDelete,
        handleFileUpload,
        handleCourseSubmit,
        handleCurriculumSubmit,
        expandInvalidSections,
        openSection,
        jumpToNextInvalidLesson,
        expandAllSections,
        collapseAllSections,
        scrollToSection,
        handleSectionDrop,
        handleLessonDrop,
        handleSubmitForApproval,
        handleSaveDraft,
    };
};
