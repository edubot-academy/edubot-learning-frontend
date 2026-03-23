import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
    fetchCourseDetails,
    updateCourse,
    fetchLessons,
    createLesson,
    updateLesson,
    createSection,
    updateSection,
    fetchCategories,
    fetchSections,
    uploadCourseImage,
    markCoursePending,
    uploadLessonFile,
    deleteLesson as deleteLessonApi,
    fetchLessonQuiz,
    upsertLessonQuiz,
    fetchLessonChallenge,
    upsertLessonChallenge,
    fetchSkills,
} from '@services/api';
import { getVideoDuration } from '../utils/videoUtils';
import LessonQuizEditor from '@features/courses/components/LessonQuizEditor';
import LessonChallengeEditor from '@features/courses/components/LessonChallengeEditor';
import {
    createEmptyQuiz,
    ensureQuizShape,
    normalizeQuizForApi,
    validateQuiz,
    mapQuizFromApi,
} from '../utils/quizUtils';
import {
    createEmptyChallenge,
    ensureChallengeShape,
    normalizeChallengeForApi,
    mapChallengeFromApi,
} from '../utils/challengeUtils';
import { LESSON_KIND_OPTIONS } from '../constants/lessons';
import ArticleEditor from '@features/courses/components/ArticleEditor';
import Loader from '@shared/ui/Loader';
import CourseBuilderStepNav from '@features/courses/components/CourseBuilderStepNav';
import CoursePreviewPanel from '@features/courses/components/CoursePreviewPanel';
import LessonCardHeader from '@features/courses/components/LessonCardHeader';
import LessonMetaFields from '@features/courses/components/LessonMetaFields';
import LessonAssetsPanel from '@features/courses/components/LessonAssetsPanel';
import { minutesInputToSeconds, secondsToMinutesInput } from '@utils/timeUtils';
import { isForbiddenError, parseApiError } from '@shared/api/error';

const EditInstructorCourse = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [course, setCourse] = useState(null);
    const [originalCourse, setOriginalCourse] = useState(null);
    const [infoTouched, setInfoTouched] = useState({});
    const [sections, setSections] = useState([]);
    const [originalSections, setOriginalSections] = useState([]);
    const [categories, setCategories] = useState([]);
    const [skillOptions, setSkillOptions] = useState([{ value: '', label: 'Skill тандаңыз (опция)' }]);
    const [skillsLoading, setSkillsLoading] = useState(false);
    const toSkillValue = (value) => {
        if (value === undefined || value === null) return '';
        return String(value);
    };
    const resolveSectionSkillValue = (sectionLike, options = []) => {
        const optionSet = new Set(options.map((o) => o.value));
        const candidates = [
            sectionLike?.skillId,
            sectionLike?.skill?.id,
            sectionLike?.skillSlug,
            sectionLike?.skill?.slug,
        ]
            .map(toSkillValue)
            .filter(Boolean);
        const match = candidates.find((val) => optionSet.has(val));
        return match ?? (candidates[0] || '');
    };

    const loadSkillsList = useCallback(async () => {
        setSkillsLoading(true);
        try {
            const skillsData = await fetchSkills();
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
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);
    const [deletedLessons, setDeletedLessons] = useState([]);
    const [confirmDelete, setConfirmDelete] = useState({
        type: null,
        sectionIndex: null,
        lessonIndex: null,
        lessonTitle: '',
    });
    const [expandedSections, setExpandedSections] = useState({});
    const [singleSectionFocus, setSingleSectionFocus] = useState(true);
    const [dragSectionIndex, setDragSectionIndex] = useState(null);
    const [dragLesson, setDragLesson] = useState(null);
    const dirtySectionIdsRef = useRef(new Set());
    const dirtyLessonIdsRef = useRef(new Set());

    useEffect(() => {
        const loadData = async () => {
            try {
                const [courseData, categoryData, sectionData, skillsData] = await Promise.all([
                    fetchCourseDetails(id),
                    fetchCategories(),
                    fetchSections(id),
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
                        const lessons = await fetchLessons(id, sec.id);
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
                                            id,
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
                                            id,
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

                // Map backend → UI shape for new fields
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

                setSkillOptions(skillOptionsWithBlank);

                setCourse(hydratedCourse);
                setOriginalCourse(hydratedCourse);
                setCategories(categoryData);
                setSections(allSections);
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
        };
        loadData();
    }, [id]);

    const handleCourseChange = (e) => {
        const { name, value, files, type, checked } = e.target;

        if (files && files[0] && name === 'cover') {
            const selectedFile = files[0];
            if (!selectedFile.type.startsWith('image/')) {
                toast.error('Сүрөт файлын тандаңыз (JPG/PNG).');
                return;
            }
            if (selectedFile.size > 5 * 1024 * 1024) {
                toast.error('Сүрөт 5MB дан ашпашы керек.');
                return;
            }

            setCourse((prev) => ({
                ...prev,
                cover: selectedFile,
                coverImageUrl: URL.createObjectURL(selectedFile),
            }));
            return;
        }

        setInfoTouched((prev) => ({ ...prev, [name]: true }));

        if (type === 'checkbox') {
            if (name === 'isPaid' && !checked) {
                setCourse((prev) => ({ ...prev, isPaid: false, price: 0 }));
                return;
            }
            setCourse((prev) => ({ ...prev, [name]: checked }));
            return;
        }

        setCourse((prev) => ({ ...prev, [name]: value }));
    };

    const updateSectionTitle = (index, title) => {
        setSections((prev) => {
            const updated = [...prev];
            updated[index].title = title;
            markSectionDirtyByIndex(index, updated);
            return updated;
        });
    };

    const updateSectionSkill = (index, skillId) => {
        setSections((prev) => {
            const updated = [...prev];
            updated[index].skillId = toSkillValue(skillId);
            markSectionDirtyByIndex(index, updated);
            return updated;
        });
    };

    const normalizeSkillValue = (value) => {
        if (!value) return undefined;
        const num = Number(value);
        return Number.isFinite(num) ? num : value;
    };

    const markSectionDirtyByIndex = (sectionIndex, sourceSections) => {
        const section = sourceSections?.[sectionIndex];
        if (section?.id) dirtySectionIdsRef.current.add(section.id);
    };

    const markLessonDirtyByIndex = (sectionIndex, lessonIndex, sourceSections) => {
        const lesson = sourceSections?.[sectionIndex]?.lessons?.[lessonIndex];
        if (lesson?.id) dirtyLessonIdsRef.current.add(lesson.id);
    };

    const addSection = () => {
        setSections((prev) => [
            ...prev,
            {
                title: `Бөлүм ${prev.length + 1}`,
                lessons: [],
            },
        ]);
    };

    const addLesson = (sectionIndex) => {
        setSections((prev) => {
            const updated = [...prev];
            const newLesson = {
                title: '',
                content: '',
                kind: 'video',
                videoKey: '',
                resourceKey: '',
                resourceName: '',
                quiz: createEmptyQuiz(),
                previewVideo: false,
                uploadProgress: { video: 0, resource: 0 },
                uploading: { video: false, resource: false },
                duration: undefined,
            };
            updated[sectionIndex] = {
                ...updated[sectionIndex],
                lessons: [...updated[sectionIndex].lessons, newLesson],
            };
            return updated;
        });
    };

    const deleteLesson = (sectionIndex, lessonIndex) => {
        setSections((prev) => {
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
    };

    const handleLessonFieldChange = (sectionIndex, lessonIndex, field, value) => {
        setSections((prev) => {
            const updated = [...prev];
            const lesson = updated[sectionIndex].lessons[lessonIndex];
            lesson[field] = value;
            if (field === 'kind') {
                if (value === 'article') {
                    lesson.previewVideo = false;
                }
                if (value === 'quiz') {
                    lesson.previewVideo = false;
                    lesson.videoKey = '';
                    lesson.quiz = ensureQuizShape(lesson.quiz);
                }
            }
            markLessonDirtyByIndex(sectionIndex, lessonIndex, updated);
            markSectionDirtyByIndex(sectionIndex, updated);
            return updated;
        });
    };

    const handleLessonQuizChange = (sectionIndex, lessonIndex, newQuiz) => {
        setSections((prev) => {
            const updated = [...prev];
            const lesson = updated[sectionIndex].lessons[lessonIndex];
            lesson.quiz = ensureQuizShape(newQuiz);
            markLessonDirtyByIndex(sectionIndex, lessonIndex, updated);
            return updated;
        });
    };

    const handleLessonChallengeChange = (sectionIndex, lessonIndex, newChallenge) => {
        setSections((prev) => {
            const updated = [...prev];
            const lesson = updated[sectionIndex].lessons[lessonIndex];
            lesson.challenge = ensureChallengeShape(newChallenge);
            markLessonDirtyByIndex(sectionIndex, lessonIndex, updated);
            return updated;
        });
    };

    const handleFileUpload = async (sectionIndex, lessonIndex, type, file) => {
        if (!file) return;

        const sectionId = sections[sectionIndex]?.id;
        if (!sectionId) {
            toast.error('Адегенде бөлүмдү сактап, андан кийин файл жүктөңүз.');
            return;
        }

        setSections((prev) => {
            const updated = [...prev];
            updated[sectionIndex].lessons[lessonIndex].uploading[type] = true;
            return updated;
        });

        try {
            const key = await uploadLessonFile(
                id,
                sectionId,
                type,
                file,
                lessonIndex,
                (percent) => {
                    setSections((prev) => {
                        const updated = [...prev];
                        updated[sectionIndex].lessons[lessonIndex].uploadProgress[type] = percent;
                        return updated;
                    });
                }
            );

            if (type === 'video') {
                try {
                    const duration = await getVideoDuration(file);
                    handleLessonFieldChange(sectionIndex, lessonIndex, 'duration', duration);
                } catch (err) {
                    console.warn('Failed to extract video duration:', err);
                }
            }

            handleLessonFieldChange(
                sectionIndex,
                lessonIndex,
                type === 'video' ? 'videoKey' : 'resourceKey',
                key
            );

            if (type === 'resource') {
                handleLessonFieldChange(sectionIndex, lessonIndex, 'resourceName', file.name);
            }
        } catch (err) {
            console.error(err);
            toast.error(err.message || 'Файл жүктөөдө ката кетти.');
        } finally {
            setSections((prev) => {
                const updated = [...prev];
                updated[sectionIndex].lessons[lessonIndex].uploading[type] = false;
                return updated;
            });
        }
    };

    const getCourseInfoErrors = (info) => {
        const errors = {};
        if (!String(info.title || '').trim()) errors.title = 'Курс аталышын киргизиңиз';
        if ((info.title || '').length > 200) errors.title = 'Максимум 200 символ';
        if ((info.subtitle || '').length > 255) errors.subtitle = 'Максимум 255 символ';
        if (!String(info.description || '').trim()) errors.description = 'Сүрөттөмө керек';
        if (!String(info.languageCode || '').trim()) errors.languageCode = 'Тилди тандаңыз';

        const numericPrice = Number(info.price);
        if (info.isPaid && (!Number.isFinite(numericPrice) || numericPrice <= 0)) {
            errors.price = 'Акы төлөнүүчү курс үчүн баа 0дөн жогору болушу керек';
        }

        return errors;
    };

    const handleCourseSubmit = async () => {
        const errors = getCourseInfoErrors(course || {});
        if (Object.keys(errors).length > 0) {
            setInfoTouched({
                title: true,
                subtitle: true,
                description: true,
                categoryId: true,
                price: true,
                languageCode: true,
            });
            toast.error('Сураныч, талаалардагы каталарды оңдоңуз.');
            return;
        }

        const learningOutcomes = (course.learningOutcomesText || '')
            .split('\n')
            .map((s) => s.trim())
            .filter(Boolean);

        try {
            await updateCourse(id, {
                title: course.title,
                description: course.description,
                price: Number(course.isPaid ? course.price : 0),
                subtitle: course.subtitle || undefined,
                languageCode: course.languageCode || 'ky',
                learningOutcomes: learningOutcomes.length > 0 ? learningOutcomes : undefined,
                aiAssistantEnabled: Boolean(course.aiAssistantEnabled),
                isPaid: Boolean(course.isPaid),
            });

            if (course.cover instanceof File) {
                await uploadCourseImage(id, course.cover);
            }

            toast.success('Курс ийгиликтүү сакталды!');
            setStep(2);
        } catch (err) {
            console.error(err);
            toast.error('Курс сактоодо ката кетти.');
        }
    };

    const toComparableSectionSkill = (value) => normalizeSkillValue(value) ?? null;

    const buildLessonPayload = (lesson, lessonIdx) => {
        const isArticle = lesson.kind === 'article';
        const isVideo = lesson.kind === 'video';

        return {
            title: lesson.title.trim(),
            kind: lesson.kind || 'video',
            content: isArticle ? lesson.content?.trim() || undefined : undefined,
            videoKey: isVideo ? lesson.videoKey : undefined,
            resourceKey: lesson.resourceKey,
            resourceName: lesson.resourceName?.trim() || undefined,
            previewVideo: isVideo ? lesson.previewVideo : false,
            order: lessonIdx,
            duration: isVideo || isArticle ? lesson.duration : undefined,
        };
    };

    const safeNormalizeChallenge = (challenge) => {
        try {
            return normalizeChallengeForApi(ensureChallengeShape(challenge));
        } catch {
            return null;
        }
    };

    const getLessonIssue = (lesson) => {
        if (!lesson.title?.trim()) return 'Аталыш жок';
        if (lesson.kind === 'video' && !lesson.videoKey) return 'Видео жүктөлө элек';
        if (
            lesson.kind === 'article' &&
            (!lesson.content?.trim() || !lesson.duration || lesson.duration <= 0)
        ) {
            return 'Макала толук эмес';
        }
        if (lesson.kind === 'quiz') {
            const quizErr = validateQuiz(ensureQuizShape(lesson.quiz));
            if (quizErr) return 'Квиз толук эмес';
        }
        if (lesson.kind === 'code' && !safeNormalizeChallenge(lesson.challenge)) {
            return 'Код тапшырма толук эмес';
        }
        return null;
    };

    const getSectionIssueCount = (section) =>
        section.lessons.reduce((count, lesson) => (getLessonIssue(lesson) ? count + 1 : count), 0);

    const getSectionReadyCount = (section) =>
        section.lessons.reduce((count, lesson) => (getLessonIssue(lesson) ? count : count + 1), 0);

    const getFirstInvalidLessonTarget = () => {
        for (let sIdx = 0; sIdx < sections.length; sIdx += 1) {
            const section = sections[sIdx];
            for (let lIdx = 0; lIdx < section.lessons.length; lIdx += 1) {
                const issue = getLessonIssue(section.lessons[lIdx]);
                if (issue) return { sIdx, lIdx, issue };
            }
        }
        return null;
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
            for (let idx = 0; idx < sections.length; idx += 1) next[idx] = idx === sectionIdx;
            setExpandedSections(next);
            return;
        }
        setExpandedSections((prev) => ({ ...prev, [sectionIdx]: true }));
    };

    const jumpToNextInvalidLesson = () => {
        const target = getFirstInvalidLessonTarget();
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

    const reorderExpandedMap = (prevMap, count, fromIdx, toIdx) => {
        const flags = Array.from({ length: count }, (_, idx) => Boolean(prevMap[idx] ?? idx === 0));
        const [moved] = flags.splice(fromIdx, 1);
        flags.splice(toIdx, 0, moved);
        return flags.reduce((acc, flag, idx) => {
            acc[idx] = flag;
            return acc;
        }, {});
    };

    const handleSectionDrop = (targetIdx) => {
        if (dragSectionIndex === null || dragSectionIndex === targetIdx) return;
        setSections((prev) => {
            const next = [...prev];
            const [moved] = next.splice(dragSectionIndex, 1);
            next.splice(targetIdx, 0, moved);
            setExpandedSections((prevExpanded) =>
                reorderExpandedMap(prevExpanded, prev.length, dragSectionIndex, targetIdx)
            );
            next.forEach((section) => {
                if (section.id) dirtySectionIdsRef.current.add(section.id);
            });
            return next;
        });
        setDragSectionIndex(null);
    };

    const handleLessonDrop = (sectionIdx, targetLessonIdx) => {
        if (!dragLesson || dragLesson.sectionIdx !== sectionIdx) return;
        if (dragLesson.lessonIdx === targetLessonIdx) return;

        setSections((prev) => {
            const next = [...prev];
            const lessons = [...next[sectionIdx].lessons];
            const [moved] = lessons.splice(dragLesson.lessonIdx, 1);
            lessons.splice(targetLessonIdx, 0, moved);
            next[sectionIdx] = { ...next[sectionIdx], lessons };
            lessons.forEach((lesson) => {
                if (lesson.id) dirtyLessonIdsRef.current.add(lesson.id);
            });
            return next;
        });
        setDragLesson(null);
    };

    const handleSaveAll = async () => {
        setSaving(true);
        try {
            const dirtySectionIds = dirtySectionIdsRef.current;
            const dirtyLessonIds = dirtyLessonIdsRef.current;

            const invalidSectionIndexes = sections
                .map((section, idx) => (getSectionIssueCount(section) > 0 ? idx : null))
                .filter((idx) => idx !== null);
            expandInvalidSections(invalidSectionIndexes);

            const firstInvalid = getFirstInvalidLessonTarget();
            if (firstInvalid) {
                toast.error(
                    `Сабак толук эмес: ${firstInvalid.issue} (Бөлүм ${firstInvalid.sIdx + 1}, Сабак ${firstInvalid.lIdx + 1})`
                );
                return;
            }

            let writeCount = 0;
            const nextSections = sections.map((section) => ({
                ...section,
                lessons: (section.lessons || []).map((lesson) => ({ ...lesson })),
            }));

            for (const { sectionId, lessonId } of deletedLessons) {
                await deleteLessonApi(id, sectionId, lessonId);
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
                    toComparableSectionSkill(section.skillId) !==
                        toComparableSectionSkill(originalSection.skillId);

                if (!section.id) {
                    const createdSection = await createSection(id, sectionPayload);
                    section.id = createdSection.id;
                    writeCount += 1;
                } else if (sectionChanged) {
                    await updateSection(id, section.id, sectionPayload);
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
                        const createdLesson = await createLesson(id, section.id, lessonPayload);
                        savedLessonId = createdLesson.id;
                        lesson.id = createdLesson.id;
                        writeCount += 1;
                    } else if (lessonChanged) {
                        await updateLesson(id, section.id, lesson.id, lessonPayload);
                        writeCount += 1;
                    }

                    const quizData = isQuiz ? ensureQuizShape(lesson.quiz) : null;
                    const quizPayload = isQuiz && quizData ? normalizeQuizForApi(quizData) : null;
                    const originalQuizPayload =
                        isQuiz && originalLesson?.quiz
                            ? normalizeQuizForApi(ensureQuizShape(originalLesson.quiz))
                            : null;
                    const quizChanged =
                        Boolean(quizPayload) &&
                        (!originalLesson ||
                            JSON.stringify(quizPayload) !== JSON.stringify(originalQuizPayload));

                    if (isQuiz && savedLessonId && quizPayload && quizChanged) {
                        await upsertLessonQuiz(id, section.id, savedLessonId, quizPayload);
                        writeCount += 1;
                    }

                    const challengePayload =
                        isCode && lesson.challenge
                            ? normalizeChallengeForApi(ensureChallengeShape(lesson.challenge))
                            : null;
                    const originalChallengePayload =
                        isCode && originalLesson?.challenge
                            ? safeNormalizeChallenge(originalLesson.challenge)
                            : null;
                    const challengeChanged =
                        Boolean(challengePayload) &&
                        (!originalLesson ||
                            JSON.stringify(challengePayload) !==
                                JSON.stringify(originalChallengePayload));

                    if (isCode && savedLessonId && challengePayload && challengeChanged) {
                        await upsertLessonChallenge(id, section.id, savedLessonId, challengePayload);
                        writeCount += 1;
                    }
                }
            }

            if (writeCount === 0) {
                toast('Өзгөртүү жок.');
                return;
            }

            setDeletedLessons([]);
            setSections(nextSections);
            setOriginalSections(JSON.parse(JSON.stringify(nextSections)));
            dirtySectionIds.clear();
            dirtyLessonIds.clear();

            toast.success('Мазмун сакталды!');
            setStep(3);
        } catch (err) {
            console.error(err);
            if (isForbiddenError(err)) {
                navigate('/unauthorized');
                return;
            }
            toast.error(parseApiError(err, 'Мазмунду сактоодо ката кетти.').message);
        } finally {
            setSaving(false);
        }
    };

    const handleSubmitForApproval = async () => {
        try {
            await markCoursePending(id);
            toast.success('Курс модераторго жөнөтүлдү');
            navigate('/instructor/courses');
        } catch (err) {
            console.error(err);
            if (isForbiddenError(err)) {
                navigate('/unauthorized');
                return;
            }
            toast.error(parseApiError(err, 'Курс жөнөтүлбөй калды').message);
        }
    };

    const handleConfirmedDelete = () => {
        const { sectionIndex, lessonIndex } = confirmDelete;
        deleteLesson(sectionIndex, lessonIndex);
        setConfirmDelete({
            type: null,
            sectionIndex: null,
            lessonIndex: null,
            lessonTitle: '',
        });
    };

    const isChanged = () =>
        JSON.stringify(course) !== JSON.stringify(originalCourse) ||
        JSON.stringify(sections) !== JSON.stringify(originalSections);

    const confirmCancel = () =>
        isChanged() ? setShowCancelConfirm(true) : navigate('/instructor/courses');

    const handleCancel = () => navigate('/instructor/courses');

    if (loading) return <Loader fullScreen />;
    if (!course) return <div className="p-6 text-red-500">Курс табылган жок</div>;

    const isUploading = sections.some((section) =>
        section.lessons.some((lesson) => lesson.uploading?.video || lesson.uploading?.resource)
    );
    const totalLessons = sections.reduce((acc, section) => acc + section.lessons.length, 0);
    const readyLessons = sections.reduce((acc, section) => acc + getSectionReadyCount(section), 0);
    const completionPercent = totalLessons > 0 ? Math.round((readyLessons / totalLessons) * 100) : 0;
    const courseInfoErrors = getCourseInfoErrors(course || {});
    const stepItems = [
        { id: 1, label: 'Маалымат', enabled: true },
        { id: 2, label: 'Мазмун', enabled: Boolean(course) },
        { id: 3, label: 'Превью', enabled: Boolean(course) },
    ];

    const renderPreview = () => (
        <CoursePreviewPanel
            course={course}
            sections={sections}
            getSectionTitle={(section) => section.title}
            onBack={() => setStep(2)}
            coverAlt="Курс сүрөтү"
            actions={[
                {
                    label: 'Тастыктоого жөнөтүү',
                    onClick: handleSubmitForApproval,
                    requiresClean: true,
                    className: 'rounded-lg bg-edubot-teal px-6 py-2 text-sm font-medium text-white',
                },
            ]}
        />
    );


    return (
        <div className="mx-auto max-w-5xl p-6 pt-24">
            <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-[#111111]">
                <h2 className="text-2xl font-bold text-edubot-dark dark:text-white">Курсту түзөтүү</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Өзгөртүүлөрдү кадам-кадам менен текшерип, акырында превью аркылуу бекитиңиз.
                </p>
            </div>

            <CourseBuilderStepNav step={step} onStepChange={setStep} items={stepItems} />

            {step === 1 && (
                <div className="space-y-5">
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-[#111111]">
                        <h3 className="mb-4 text-lg font-semibold">Негизги маалымат</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="mb-1 block text-sm font-medium">Курс аталышы</label>
                                <input
                                    name="title"
                                    value={course.title || ''}
                                    onChange={handleCourseChange}
                                    placeholder="Курс аталышы"
                                    className="w-full rounded-lg border p-2.5 bg-white dark:bg-[#222222] dark:text-white"
                                />
                                <div className="mt-1 flex items-center justify-between text-xs">
                                    <span className="text-rose-500">{infoTouched.title ? courseInfoErrors.title : ''}</span>
                                    <span className="text-slate-500">{(course.title || '').length}/200</span>
                                </div>
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium">Подзаголовок</label>
                                <input
                                    name="subtitle"
                                    value={course.subtitle || ''}
                                    onChange={handleCourseChange}
                                    placeholder="Кыскача сүрөттөмө"
                                    className="w-full rounded-lg border p-2.5 bg-white dark:bg-[#222222] dark:text-white"
                                />
                                <div className="mt-1 flex items-center justify-between text-xs">
                                    <span className="text-rose-500">{infoTouched.subtitle ? courseInfoErrors.subtitle : ''}</span>
                                    <span className="text-slate-500">{(course.subtitle || '').length}/255</span>
                                </div>
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium">Курс сүрөттөмөсү</label>
                                <textarea
                                    name="description"
                                    value={course.description || ''}
                                    onChange={handleCourseChange}
                                    placeholder="Курс сүрөттөмөсү"
                                    className="min-h-[120px] w-full rounded-lg border p-2.5 bg-white dark:bg-[#222222] dark:text-white"
                                />
                                <p className="mt-1 text-xs text-rose-500">
                                    {infoTouched.description ? courseInfoErrors.description : ''}
                                </p>
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium">Категория</label>
                                <select
                                    name="categoryId"
                                    value={course.categoryId || ''}
                                    disabled
                                    className="w-full rounded-lg border p-2.5 bg-slate-100 text-slate-500 dark:bg-[#1c1c1c] dark:text-slate-400"
                                >
                                    <option value="">Категорияны тандаңыз</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>
                                <p className="mt-1 text-xs text-slate-500">
                                    Категорияны өзгөртүү азыркы backend update API'де колдоого алынбайт.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-[#111111]">
                        <h3 className="mb-4 text-lg font-semibold">Орнотуулар</h3>
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="mb-1 block text-sm font-medium">Курс баасы (сом)</label>
                                    <input
                                        name="price"
                                        type="number"
                                        value={course.price || ''}
                                        onChange={handleCourseChange}
                                        placeholder="Курс баасы"
                                        disabled={!course.isPaid}
                                        className="w-full rounded-lg border p-2.5 bg-white disabled:bg-slate-100 dark:bg-[#222222] dark:text-white dark:disabled:bg-[#1c1c1c]"
                                    />
                                    <p className="mt-1 text-xs text-rose-500">{infoTouched.price ? courseInfoErrors.price : ''}</p>
                                </div>
                                <div className="rounded-lg border p-3">
                                    <label htmlFor="isPaid" className="flex cursor-pointer items-center gap-3 text-sm font-medium">
                                        <input
                                            id="isPaid"
                                            name="isPaid"
                                            type="checkbox"
                                            checked={course.isPaid ?? true}
                                            onChange={handleCourseChange}
                                        />
                                        Бул курс акы төлөнүүчү
                                    </label>
                                </div>
                            </div>

                            <div className="rounded-lg border p-3">
                                <label htmlFor="aiAssistantEnabled" className="flex cursor-pointer items-center gap-3 text-sm font-medium">
                                    <input
                                        id="aiAssistantEnabled"
                                        name="aiAssistantEnabled"
                                        type="checkbox"
                                        checked={course.aiAssistantEnabled ?? false}
                                        onChange={handleCourseChange}
                                    />
                                    EDU AI ассистентин бул курста колдонууга уруксат берүү
                                </label>
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium">Сабак тили (Language)</label>
                                <select
                                    name="languageCode"
                                    value={course.languageCode || 'ky'}
                                    onChange={handleCourseChange}
                                    className="w-full rounded-lg border p-2.5 bg-white dark:bg-[#222222] dark:text-white"
                                >
                                    <option value="ky">Кыргызча</option>
                                    <option value="ru">Русский</option>
                                    <option value="en">English</option>
                                </select>
                                <p className="mt-1 text-xs text-rose-500">
                                    {infoTouched.languageCode ? courseInfoErrors.languageCode : ''}
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm mb-1 font-medium">
                                    Бул курстан эмнени үйрөнөсүз? (ар бир сапка бир пункт)
                                </label>
                                <textarea
                                    name="learningOutcomesText"
                                    value={course.learningOutcomesText || ''}
                                    onChange={handleCourseChange}
                                    placeholder={
                                        'Мисалы:\n- UX негиздери\n- Figma менен иштөө\n- UI китепкана түзүү'
                                    }
                                    className="w-full rounded-lg border p-2.5 text-sm min-h-[110px] bg-white dark:bg-[#222222] dark:text-white"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-[#111111]">
                        <h3 className="mb-3 text-lg font-semibold">Cover сүрөт</h3>
                        {course.coverImageUrl && (
                            <img
                                src={course.coverImageUrl}
                                alt="Курс сүрөтү"
                                className="mb-3 max-h-52 w-full max-w-lg rounded-lg object-cover"
                            />
                        )}
                        <input
                            type="file"
                            name="cover"
                            accept="image/*"
                            onChange={handleCourseChange}
                            className="w-full rounded-lg border p-2.5 bg-white dark:bg-[#222222] dark:text-white"
                        />
                        <p className="mt-1 text-xs text-slate-500">PNG/JPG, максимум 5MB</p>
                    </div>

                    <div className="sticky bottom-4 z-10 flex justify-end gap-3">
                        <button
                            onClick={confirmCancel}
                            className="rounded-xl border border-slate-300 bg-white px-6 py-2.5 dark:border-slate-700 dark:bg-[#1c1c1c]"
                        >
                            Артка
                        </button>
                        <button
                            onClick={handleCourseSubmit}
                            disabled={Object.keys(courseInfoErrors).length > 0}
                            className="rounded-xl bg-slate-900 px-6 py-2.5 text-white disabled:opacity-50 dark:bg-blue-950"
                        >
                            Сактоо жана улантуу
                        </button>
                    </div>
                </div>
            )}

            {/* STEP 2 — CURRICULUM */}

            {step === 2 && (
                <div className="space-y-4">
                    <div className="sticky top-20 z-20 rounded-2xl border border-slate-200/70 bg-white/90 backdrop-blur px-4 py-3 shadow-sm dark:border-slate-700 dark:bg-[#151515]/90">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="space-y-1">
                                <p className="text-xs uppercase tracking-wide text-slate-500">Курулуш режими</p>
                                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                                    Бөлүмдөр: {sections.length} • Сабактар: {totalLessons}
                                </p>
                                <p className="text-xs text-slate-600 dark:text-slate-300">
                                    Даярдык: {readyLessons}/{totalLessons} ({completionPercent}%)
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => expandAllSections(sections.length)}
                                    className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-[#1f1f1f] dark:text-slate-200"
                                >
                                    Баарын ачуу
                                </button>
                                <button
                                    onClick={() => collapseAllSections(sections.length)}
                                    className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-[#1f1f1f] dark:text-slate-200"
                                >
                                    Баарын жабуу
                                </button>
                                <button
                                    onClick={() => {
                                        setSingleSectionFocus((prev) => {
                                            const nextMode = !prev;
                                            if (nextMode) {
                                                const firstOpen = sections.findIndex((_, idx) => expandedSections[idx] ?? idx === 0);
                                                const openIdx = firstOpen >= 0 ? firstOpen : 0;
                                                const nextExpanded = {};
                                                for (let idx = 0; idx < sections.length; idx += 1) {
                                                    nextExpanded[idx] = idx === openIdx;
                                                }
                                                setExpandedSections(nextExpanded);
                                            }
                                            return nextMode;
                                        });
                                    }}
                                    className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-[#1f1f1f] dark:text-slate-200"
                                >
                                    {singleSectionFocus ? 'Single focus: ON' : 'Single focus: OFF'}
                                </button>
                                <button
                                    onClick={addSection}
                                    className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
                                >
                                    + Бөлүм кошуу
                                </button>
                                <button
                                    onClick={jumpToNextInvalidLesson}
                                    className="rounded-xl border border-rose-300 bg-rose-50 px-4 py-2 text-sm font-medium text-rose-700 hover:bg-rose-100 dark:border-rose-800 dark:bg-rose-900/30 dark:text-rose-200"
                                >
                                    Кийинки катаны табуу
                                </button>
                                <button
                                    onClick={handleSaveAll}
                                    disabled={isUploading || saving}
                                    className="rounded-xl bg-slate-900 px-5 py-2 text-sm font-medium text-white disabled:opacity-60 dark:bg-blue-950"
                                >
                                    {saving ? 'Сакталууда...' : 'Сактоо жана улантуу'}
                                </button>
                            </div>
                        </div>
                        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                            {sections.map((section, sIdx) => {
                                const hasIssues = getSectionIssueCount(section) > 0;
                                const label = section.title?.trim() || `Бөлүм ${sIdx + 1}`;
                                return (
                                    <button
                                        key={`section-chip-${sIdx}`}
                                        type="button"
                                        onClick={() => scrollToSection(sIdx)}
                                        className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                                            hasIssues
                                                ? 'border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-700 dark:bg-rose-900/30 dark:text-rose-200'
                                                : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-[#1f1f1f] dark:text-slate-200'
                                        }`}
                                    >
                                        {label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                    {sections.map((section, sIdx) => (
                        <details
                            id={`section-${sIdx}`}
                            key={sIdx}
                            onDragOver={(event) => event.preventDefault()}
                            onDrop={() => handleSectionDrop(sIdx)}
                            open={expandedSections[sIdx] ?? sIdx === 0}
                            onToggle={(event) => {
                                const isOpen = event.currentTarget.open;
                                if (singleSectionFocus && isOpen) {
                                    const next = {};
                                    for (let idx = 0; idx < sections.length; idx += 1) next[idx] = idx === sIdx;
                                    setExpandedSections(next);
                                    return;
                                }
                                setExpandedSections((prev) => ({ ...prev, [sIdx]: isOpen }));
                            }}
                            className={`mb-5 overflow-hidden rounded-2xl border border-slate-200 bg-white/80 shadow-sm transition dark:border-slate-700 dark:bg-[#111111] ${dragSectionIndex === sIdx ? 'opacity-80 ring-2 ring-amber-300 dark:ring-amber-600' : ''}`}
                        >
                            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 bg-gradient-to-r from-slate-50 to-white px-4 py-3 dark:from-[#191919] dark:to-[#131313]">
                                <div>
                                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                                        {section.title || `Section ${sIdx + 1}`}
                                    </p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        {section.lessons.length} сабак · {getSectionReadyCount(section)}/{section.lessons.length} даяр
                                    {getSectionIssueCount(section) > 0 ? (
                                        <span className="ml-2 rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-medium text-rose-700 dark:bg-rose-900/40 dark:text-rose-200">
                                            {getSectionIssueCount(section)} маселе
                                        </span>
                                    ) : (
                                        <span className="ml-2 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200">
                                            Даяр
                                        </span>
                                    )}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        draggable
                                        onDragStart={() => setDragSectionIndex(sIdx)}
                                        onDragEnd={() => setDragSectionIndex(null)}
                                        onMouseDown={(event) => event.stopPropagation()}
                                        onClick={(event) => {
                                            event.preventDefault();
                                            event.stopPropagation();
                                        }}
                                        className="group relative cursor-grab rounded-lg border border-slate-300 bg-white p-2 text-slate-600 hover:bg-slate-50 active:scale-95 dark:border-slate-700 dark:bg-[#1f1f1f] dark:text-slate-300"
                                        title="Бөлүмдү жылдыруу"
                                        aria-label="Бөлүмдү жылдыруу"
                                    >
                                        <svg
                                            aria-hidden="true"
                                            viewBox="0 0 16 16"
                                            className="h-4 w-4"
                                            fill="currentColor"
                                        >
                                            <circle cx="5" cy="4" r="1.1" />
                                            <circle cx="11" cy="4" r="1.1" />
                                            <circle cx="5" cy="8" r="1.1" />
                                            <circle cx="11" cy="8" r="1.1" />
                                            <circle cx="5" cy="12" r="1.1" />
                                            <circle cx="11" cy="12" r="1.1" />
                                        </svg>
                                        <span className="pointer-events-none absolute left-1/2 top-full z-10 mt-2 -translate-x-1/2 whitespace-nowrap rounded bg-slate-900 px-2 py-1 text-[10px] font-medium text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 dark:bg-slate-100 dark:text-slate-900">
                                            Бөлүмдү жылдыруу
                                        </span>
                                    </button>
                                    <span className="text-xs text-slate-500 dark:text-slate-400">Ачуу/жабуу</span>
                                </div>
                            </summary>
                            <div className="p-4">
                            <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
                                <div className="flex-1 flex flex-col gap-2">
                                    <input
                                        className="w-full p-2 border rounded bg-white dark:bg-[#222222] dark:text-white"
                                        value={section.title}
                                        onChange={(e) => updateSectionTitle(sIdx, e.target.value)}
                                        placeholder="Бөлүм аталышы"
                                    />
                                    <div className="flex flex-col sm:flex-row gap-2 items-start">
                                        <select
                                            className="w-full p-2 border rounded bg-white dark:bg-[#222222] dark:text-white text-sm"
                                            value={section.skillId || ''}
                                            onChange={(e) => updateSectionSkill(sIdx, e.target.value)}
                                        >
                                            {skillOptions.map((opt) => (
                                                <option key={opt.value} value={opt.value}>
                                                    {opt.label}
                                                </option>
                                            ))}
                                        </select>
                                        <button
                                            type="button"
                                            onClick={loadSkillsList}
                                            className="px-3 py-2 text-sm rounded border bg-white dark:bg-[#222222]"
                                            disabled={skillsLoading}
                                        >
                                            {skillsLoading ? '...' : 'Жаңыртуу'}
                                        </button>
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Skill тандасаңыз, ушул бөлүмдүн прогресси skill лидербордго кошулат.
                                    </p>
                                </div>
                                <button
                                    onClick={() =>
                                        setConfirmDelete({
                                            type: 'section',
                                            sectionIndex: sIdx,
                                            title: section.title,
                                        })
                                    }
                                    className="px-3 py-1 bg-red-100 text-red-700 border border-red-300 rounded hover:bg-red-200 text-sm h-10 md:mt-7"
                                >
                                    Өчүрүү
                                </button>
                            </div>
                            {section.lessons.map((lesson, lIdx) => {
                                const lessonIssue = getLessonIssue(lesson);
                                return (
                                <div
                                    id={`lesson-${sIdx}-${lIdx}`}
                                    key={lIdx}
                                    onDragOver={(event) => event.preventDefault()}
                                    onDrop={() => handleLessonDrop(sIdx, lIdx)}
                                    className={`mb-4 rounded-xl border p-3 transition ${
                                        lessonIssue
                                            ? 'border-rose-200 bg-rose-50/70 dark:border-rose-900/70 dark:bg-rose-950/20'
                                            : 'border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-[#222222]'
                                    } ${
                                        dragLesson?.sectionIdx === sIdx && dragLesson?.lessonIdx === lIdx
                                            ? 'ring-2 ring-sky-300 dark:ring-sky-700 opacity-80'
                                            : ''
                                    }`}
                                >
                                    <LessonCardHeader
                                        lessonIndex={lIdx}
                                        lessonKind={lesson.kind}
                                        lessonIssue={lessonIssue}
                                        onDragStart={() => setDragLesson({ sectionIdx: sIdx, lessonIdx: lIdx })}
                                        onDragEnd={() => setDragLesson(null)}
                                        onDelete={() => {
                                            if (sIdx === 0 && sections[sIdx].lessons.length === 1) {
                                                toast.error('Кеминде бир сабак болушу керек.');
                                                return;
                                            }
                                            setConfirmDelete({
                                                type: 'lesson',
                                                sectionIndex: sIdx,
                                                lessonIndex: lIdx,
                                                lessonTitle: lesson?.title,
                                            });
                                        }}
                                    />
                                    <LessonMetaFields
                                        title={lesson.title}
                                        kind={lesson.kind || 'video'}
                                        kindOptions={LESSON_KIND_OPTIONS}
                                        onTitleChange={(value) =>
                                            handleLessonFieldChange(sIdx, lIdx, 'title', value)
                                        }
                                        onKindChange={(value) =>
                                            handleLessonFieldChange(sIdx, lIdx, 'kind', value)
                                        }
                                    />

                                    {lesson.kind === 'article' && (

                                        <>
                                            <label className="block mb-1 font-medium">
                                                Макала тексти
                                            </label>
                                            <ArticleEditor
                                                value={lesson.content || ''}
                                                onChange={(val) =>
                                                    handleLessonFieldChange(
                                                        sIdx,
                                                        lIdx,
                                                        'content',
                                                        val
                                                    )
                                                }
                                                placeholder="Сабактын негизги тексти"
                                            />
                                            <label className="block mb-1 font-medium">
                                                Окуу убактысы (мүнөт)
                                            </label>
                                            <input
                                                type="number"
                                                min="0.5"
                                                step="0.5"
                                                className="w-full p-2 mb-2 border rounded"
                                                value={secondsToMinutesInput(lesson.duration)}
                                                onChange={(e) => {
                                                    handleLessonFieldChange(
                                                        sIdx,
                                                        lIdx,
                                                        'duration',
                                                        minutesInputToSeconds(e.target.value)
                                                    );
                                                }}
                                                placeholder="мисалы: 5"
                                            />
                                        </>
                                    )}

                                    {lesson.kind === 'quiz' && (
                                        <LessonQuizEditor
                                            quiz={lesson.quiz}
                                            onChange={(newQuiz) =>
                                                handleLessonQuizChange(sIdx, lIdx, newQuiz)
                                            }
                                        />
                                    )}

                                    {lesson.kind === 'code' && (
                                        <LessonChallengeEditor
                                            challenge={lesson.challenge}
                                            onChange={(newChallenge) =>
                                                handleLessonChallengeChange(
                                                    sIdx,
                                                    lIdx,
                                                    newChallenge
                                                )
                                            }
                                        />
                                    )}
                                    <LessonAssetsPanel
                                        kind={lesson.kind}
                                        onVideoFile={(file) => handleFileUpload(sIdx, lIdx, 'video', file)}
                                        videoExists={Boolean(lesson.videoUrl || lesson.videoKey)}
                                        videoProgress={lesson.uploadProgress.video}
                                        previewVideo={lesson.previewVideo}
                                        onPreviewVideoChange={(checked) =>
                                            handleLessonFieldChange(sIdx, lIdx, 'previewVideo', checked)
                                        }
                                        previewLabel="Превью видео катары белгилөө"
                                        onResourceFile={(file) =>
                                            handleFileUpload(sIdx, lIdx, 'resource', file)
                                        }
                                        resourceExists={Boolean(lesson.resourceUrl || lesson.resourceKey)}
                                        resourceProgress={lesson.uploadProgress.resource}
                                        resourceName={lesson.resourceName}
                                        onResourceNameChange={(value) =>
                                            handleLessonFieldChange(sIdx, lIdx, 'resourceName', value)
                                        }
                                        resourceNameDisabled={!lesson.resourceKey}
                                    />

                                </div>
                            );
                            })}
                            <div className="sticky bottom-2 mt-3 flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white/95 px-3 py-2 backdrop-blur dark:border-slate-700 dark:bg-[#151515]/95">
                                <span className="text-xs text-slate-500 dark:text-slate-400">
                                    Бул бөлүм даяр болгондо жалпы мазмунду сактаңыз.
                                </span>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => addLesson(sIdx)}
                                        className="rounded-lg bg-amber-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-amber-600"
                                    >
                                        + Сабак кошуу
                                    </button>
                                    <button
                                        onClick={handleSaveAll}
                                        disabled={isUploading || saving}
                                        className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60 dark:border-slate-700 dark:bg-[#1f1f1f] dark:text-slate-200"
                                    >
                                        {saving ? 'Сакталууда...' : 'Жалпы сактоо'}
                                    </button>
                                </div>
                            </div>
                            </div>
                        </details>
                    ))}

                </div>
            )}

            {/* STEP 3 — PREVIEW */}
            {step === 3 && renderPreview()}

            {/* Cancel confirm modal */}
            {showCancelConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-[#222222] p-6 rounded shadow max-w-sm w-full">
                        <h4 className="text-lg font-semibold mb-4">Ырастоо</h4>
                        <p className="mb-6">Өзгөртүүлөр сакталбайт. Чын эле артка кайтасызбы?</p>
                        <div className="flex justify-end gap-4">
                            <button
                                onClick={handleCancel}
                                className="px-4 py-2 bg-red-600 text-white rounded"
                            >
                                Ооба
                            </button>
                            <button
                                onClick={() => setShowCancelConfirm(false)}
                                className="px-4 py-2 bg-gray-300 text-gray-800 rounded"
                            >
                                Жок
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete lesson confirm */}
            {confirmDelete.type && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-[#222222] p-6 rounded shadow max-w-sm w-full">
                        <h4 className="text-lg font-semibold mb-4">Ырастоо</h4>
                        <p className="mb-6">
                            <strong>{confirmDelete.lessonTitle}</strong> сабагын өчүрүүнү
                            каалайсызбы?
                        </p>
                        <div className="flex justify-end gap-4">
                            <button
                                onClick={() =>
                                    setConfirmDelete({
                                        type: null,
                                        sectionIndex: null,
                                        lessonIndex: null,
                                        lessonTitle: '',
                                    })
                                }
                                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded"
                            >
                                Жок
                            </button>
                            <button
                                onClick={handleConfirmedDelete}
                                className="px-4 py-2 bg-red-600 text-white rounded"
                            >
                                Ооба, өчүрүү
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EditInstructorCourse;
