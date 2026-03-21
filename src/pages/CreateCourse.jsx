import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    createCourse,
    createLesson,
    createSection,
    fetchCategories,
    fetchSkills,
    uploadCourseImage,
    markCoursePending,
    uploadLessonFile,
    upsertLessonQuiz,
    upsertLessonChallenge,
} from '@services/api';
import toast from 'react-hot-toast';
import { getVideoDuration } from '../utils/videoUtils';
import { LESSON_KIND_OPTIONS } from '../constants/lessons';
import LessonQuizEditor from '@features/courses/components/LessonQuizEditor';
import LessonChallengeEditor from '@features/courses/components/LessonChallengeEditor';
import {
    createEmptyQuiz,
    ensureQuizShape,
    normalizeQuizForApi,
    validateQuiz,
} from '../utils/quizUtils';
import {
    createEmptyChallenge,
    ensureChallengeShape,
    normalizeChallengeForApi,
} from '../utils/challengeUtils';
import ArticleEditor from '@features/courses/components/ArticleEditor';
import CourseBuilderStepNav from '@features/courses/components/CourseBuilderStepNav';
import CoursePreviewPanel from '@features/courses/components/CoursePreviewPanel';
import LessonCardHeader from '@features/courses/components/LessonCardHeader';
import LessonMetaFields from '@features/courses/components/LessonMetaFields';
import LessonAssetsPanel from '@features/courses/components/LessonAssetsPanel';
import { minutesInputToSeconds, secondsToMinutesInput } from '@utils/timeUtils';
import { isForbiddenError, parseApiError } from '@shared/api/error';

const DEFAULT_COURSE_INFO = {
    title: '',
    subtitle: '',
    description: '',
    categoryId: '',
    price: '',
    cover: null,
    coverImageUrl: '',
    languageCode: 'ky', // 'ky' | 'ru' | 'en'
    learningOutcomesText: '', // textarea, split by \n
    isPaid: true,
    aiAssistantEnabled: false,
};

const CourseBuilder = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [courseId, setCourseId] = useState(null);
    const [categories, setCategories] = useState([]);
    const [skillsLoading, setSkillsLoading] = useState(false);
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

    const [courseInfo, setCourseInfo] = useState(DEFAULT_COURSE_INFO);
    const [infoTouched, setInfoTouched] = useState({});

    const [skillOptions, setSkillOptions] = useState([
        { value: '', label: 'Skill тандаңыз (опция)' },
    ]);

    const [curriculum, setCurriculum] = useState([
        {
            sectionTitle: 'Бөлүм 1',
            skillId: '',
            lessons: [
                {
                    title: 'Сабак 1',
                    content: '',
                    kind: 'video',
                    videoKey: '',
                    resourceKey: '',
                    resourceName: '',
                    quiz: createEmptyQuiz(),
                    challenge: createEmptyChallenge(),
                    previewVideo: false,
                    uploadProgress: { video: 0, resource: 0 },
                    uploading: { video: false, resource: false },
                    duration: undefined,
                },
            ],
        },
    ]);

    const loadSkillsList = useCallback(async () => {
        setSkillsLoading(true);
        try {
            const skillsData = await fetchSkills().catch(() => []);
            if (Array.isArray(skillsData) && skillsData.length) {
                const mapped = skillsData
                    .filter((s) => s.slug || s.id)
                    .map((s) => ({
                        value: s.id ?? s.slug ?? '',
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

    useEffect(() => {
        const fetchData = async () => {
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
        };
        fetchData();
    }, [loadSkillsList]);

    useEffect(() => {
        localStorage.setItem('draftCourse', JSON.stringify({ courseInfo, courseId, step }));
    }, [courseInfo, courseId, step]);

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
            { sectionTitle: `Бөлүм ${prev.length + 1}`, skillId: '', lessons: [] },
        ]);
    };

    const addLesson = (sectionIndex) => {
        const updated = [...curriculum];
        updated[sectionIndex].lessons.push({
            title: '',
            content: '',
            kind: 'video',
            videoKey: '',
            resourceKey: '',
            resourceName: '',
            quiz: createEmptyQuiz(),
            challenge: createEmptyChallenge(),
            previewVideo: false,
            uploadProgress: { video: 0, resource: 0 },
            uploading: { video: false, resource: false },
            duration: undefined,
        });
        setCurriculum(updated);
    };

    const updateSectionTitle = (index, title) => {
        const updated = [...curriculum];
        updated[index].sectionTitle = title;
        setCurriculum(updated);
    };

    const updateSectionSkill = (index, skillId) => {
        setCurriculum((prev) => {
            const updated = [...prev];
            updated[index].skillId = skillId;
            return updated;
        });
    };

    const normalizeSkillValue = (value) => {
        if (!value) return undefined;
        const num = Number(value);
        return Number.isFinite(num) ? num : value;
    };

    const updateLesson = (sectionIndex, lessonIndex, field, value) => {
        setCurriculum((prev) => {
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
                if (value === 'code') {
                    lesson.previewVideo = false;
                    lesson.videoKey = '';
                    lesson.challenge = ensureChallengeShape(lesson.challenge);
                }
            }

            return updated;
        });
    };

    const handleChallengeChange = (sectionIndex, lessonIndex, newChallenge) => {
        setCurriculum((prev) => {
            const updated = [...prev];
            const lesson = updated[sectionIndex].lessons[lessonIndex];
            lesson.challenge = ensureChallengeShape(newChallenge);
            return updated;
        });
    };

    const handleQuizChange = (sectionIndex, lessonIndex, newQuiz) => {
        setCurriculum((prev) => {
            const updated = [...prev];
            const lesson = updated[sectionIndex].lessons[lessonIndex];
            lesson.quiz = ensureQuizShape(newQuiz);
            return updated;
        });
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
            const updated = [...curriculum];
            updated[confirmDelete.sectionIndex].lessons = updated[
                confirmDelete.sectionIndex
            ].lessons.filter((_, i) => i !== confirmDelete.lessonIndex);
            setCurriculum(updated);
        }
        setConfirmDelete({
            type: null,
            sectionIndex: null,
            lessonIndex: null,
            title: '',
        });
    };

    const handleFileUpload = async (courseId, sectionIndex, lessonIndex, type, file) => {
        if (!file || !courseId) return;

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
                courseId,
                sectionIndex,
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

    const isUploading = curriculum.some((section) =>
        section.lessons.some((lesson) => lesson.uploading?.video || lesson.uploading?.resource)
    );
    const totalLessons = curriculum.reduce((acc, section) => acc + section.lessons.length, 0);
    const readyLessons = curriculum.reduce((acc, section) => acc + getSectionReadyCount(section), 0);
    const completionPercent = totalLessons > 0 ? Math.round((readyLessons / totalLessons) * 100) : 0;

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
        if (lesson.kind === 'code') {
            try {
                normalizeChallengeForApi(ensureChallengeShape(lesson.challenge));
            } catch {
                return 'Код тапшырма толук эмес';
            }
        }
        return null;
    };

    const getSectionIssueCount = (section) =>
        section.lessons.reduce((count, lesson) => (getLessonIssue(lesson) ? count + 1 : count), 0);

    const getSectionReadyCount = (section) =>
        section.lessons.reduce((count, lesson) => (getLessonIssue(lesson) ? count : count + 1), 0);

    const getFirstInvalidLessonTarget = () => {
        for (let sIdx = 0; sIdx < curriculum.length; sIdx += 1) {
            const section = curriculum[sIdx];
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
            for (let idx = 0; idx < curriculum.length; idx += 1) next[idx] = idx === sectionIdx;
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
        setCurriculum((prev) => {
            const next = [...prev];
            const [moved] = next.splice(dragSectionIndex, 1);
            next.splice(targetIdx, 0, moved);
            setExpandedSections((prevExpanded) =>
                reorderExpandedMap(prevExpanded, prev.length, dragSectionIndex, targetIdx)
            );
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
            return next;
        });
        setDragLesson(null);
    };

    const getCourseInfoErrors = (info) => {
        const errors = {};
        if (!info.title?.trim()) errors.title = 'Курс аталышы милдеттүү';
        if (info.title?.length > 200) errors.title = 'Максимум 200 символ';
        if (info.subtitle?.length > 255) errors.subtitle = 'Максимум 255 символ';
        if (!info.description?.trim()) errors.description = 'Сүрөттөмө милдеттүү';
        if (!info.categoryId) errors.categoryId = 'Категория тандаңыз';
        if (!info.languageCode) errors.languageCode = 'Тилди тандаңыз';
        if (info.isPaid && (!Number.isFinite(Number(info.price)) || Number(info.price) <= 0)) {
            errors.price = 'Акы төлөнүүчү курс үчүн баа 0дөн чоң болушу керек';
        }
        return errors;
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

        const learningOutcomes = courseInfo.learningOutcomesText
            .split('\n')
            .map((s) => s.trim())
            .filter(Boolean);

        try {
            const course = await createCourse({
                title: courseInfo.title,
                description: courseInfo.description,
                categoryId: parseInt(courseInfo.categoryId, 10),
                price: Number(courseInfo.isPaid ? courseInfo.price : 0),
                subtitle: courseInfo.subtitle || undefined,
                languageCode: courseInfo.languageCode || 'ky',
                learningOutcomes: learningOutcomes.length ? learningOutcomes : undefined,
                aiAssistantEnabled: Boolean(courseInfo.aiAssistantEnabled),
                isPaid: Boolean(courseInfo.isPaid),
            });

            setCourseId(course.id);

            if (courseInfo.cover instanceof File) {
                await uploadCourseImage(course.id, courseInfo.cover);
            }

            toast.success('Курс ийгиликтүү түзүлдү!');
            setStep(2);
        } catch (err) {
            console.error(err);
            toast.error('Курс түзүүдө ката кетти.');
        }
    };

    const handleCurriculumSubmit = async () => {
        try {
            const invalidSectionIndexes = curriculum
                .map((section, idx) => (getSectionIssueCount(section) > 0 ? idx : null))
                .filter((idx) => idx !== null);

            if (invalidSectionIndexes.length) {
                expandInvalidSections(invalidSectionIndexes);
                const target = getFirstInvalidLessonTarget();
                if (target) {
                    setExpandedSections((prev) => ({ ...prev, [target.sIdx]: true }));
                    requestAnimationFrame(() => {
                        document
                            .getElementById(`lesson-${target.sIdx}-${target.lIdx}`)
                            ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    });
                    toast.error(`Текшерүү керек: ${target.issue}`);
                } else {
                    toast.error('Айрым сабактар толук эмес.');
                }
                return;
            }

            for (const [sIdx, section] of curriculum.entries()) {
                const sec = await createSection(courseId, {
                    title: section.sectionTitle,
                    order: sIdx,
                    skillId: normalizeSkillValue(section.skillId),
                });

                for (const [lIdx, lesson] of section.lessons.entries()) {
                    const isArticle = lesson.kind === 'article';
                    const isQuiz = lesson.kind === 'quiz';
                    const isCode = lesson.kind === 'code';
                    const quizData = isQuiz ? ensureQuizShape(lesson.quiz) : null;

                    const lessonPayload = {
                        title: lesson.title.trim(),
                        kind: lesson.kind || 'video',
                        content: isArticle ? lesson.content?.trim() || undefined : undefined,
                        videoKey: lesson.kind === 'video' ? lesson.videoKey : undefined,
                        resourceKey: lesson.resourceKey,
                        resourceName: lesson.resourceName?.trim() || undefined,
                        previewVideo: lesson.kind === 'video' ? lesson.previewVideo : false,
                        order: lIdx,
                        duration:
                            lesson.kind === 'video'
                                ? lesson.duration
                                : isArticle
                                  ? lesson.duration
                                  : undefined,
                    };

                    const createdLesson = await createLesson(courseId, sec.id, lessonPayload);

                    if (isQuiz && quizData) {
                        const quizPayload = normalizeQuizForApi(quizData);
                        await upsertLessonQuiz(courseId, sec.id, createdLesson.id, quizPayload);
                    }

                    if (isCode && lesson.challenge) {
                        const challengePayload = normalizeChallengeForApi(
                            ensureChallengeShape(lesson.challenge)
                        );
                        await upsertLessonChallenge(
                            courseId,
                            sec.id,
                            createdLesson.id,
                            challengePayload
                        );
                    }
                }
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

    const stepItems = [
        { id: 1, label: 'Маалымат', enabled: true },
        { id: 2, label: 'Мазмун', enabled: Boolean(courseId) },
        { id: 3, label: 'Превью', enabled: Boolean(courseId) },
    ];

    const handleSaveDraft = () => {
        toast.success('Курс каралууга сакталды');
        localStorage.removeItem('draftCourse');
        navigate('/instructor/courses');
    };

    const handleSubmitForApproval = async () => {
        try {
            await markCoursePending(courseId);
            toast.success('Курс тастыктоого жөнөтүлдү');
            localStorage.removeItem('draftCourse');
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

    const renderPreview = () => (
        <CoursePreviewPanel
            course={courseInfo}
            sections={curriculum}
            getSectionTitle={(section) => section.sectionTitle}
            onBack={() => setStep(2)}
            coverAlt="cover"
            actions={[
                {
                    label: 'Сактап чыгуу',
                    onClick: handleSaveDraft,
                    className: 'rounded-lg bg-gray-800 px-6 py-2 text-sm font-medium text-white',
                },
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
                <h2 className="text-2xl font-bold text-edubot-dark dark:text-white">Жаңы курс түзүү</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Курсту үч кадам менен түзүңүз: маалымат, мазмун жана финалдык текшерүү.
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
                                    value={courseInfo.title}
                                    onChange={handleCourseInfoChange}
                                    placeholder="Курс аталышы"
                                    className="w-full rounded-lg border p-2.5 bg-white dark:bg-[#222222] dark:text-white"
                                />
                                <div className="mt-1 flex items-center justify-between text-xs">
                                    <span className="text-rose-500">{infoTouched.title ? getCourseInfoErrors(courseInfo).title : ''}</span>
                                    <span className="text-slate-500">{courseInfo.title.length}/200</span>
                                </div>
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium">Подзаголовок</label>
                                <input
                                    name="subtitle"
                                    value={courseInfo.subtitle}
                                    onChange={handleCourseInfoChange}
                                    placeholder="Кыскача сүрөттөмө"
                                    className="w-full rounded-lg border p-2.5 bg-white dark:bg-[#222222] dark:text-white"
                                />
                                <div className="mt-1 flex items-center justify-between text-xs">
                                    <span className="text-rose-500">{infoTouched.subtitle ? getCourseInfoErrors(courseInfo).subtitle : ''}</span>
                                    <span className="text-slate-500">{courseInfo.subtitle.length}/255</span>
                                </div>
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium">Курс сүрөттөмөсү</label>
                                <textarea
                                    name="description"
                                    value={courseInfo.description}
                                    onChange={handleCourseInfoChange}
                                    placeholder="Курс сүрөттөмөсү"
                                    className="min-h-[120px] w-full rounded-lg border p-2.5 bg-white dark:bg-[#222222] dark:text-white"
                                />
                                <p className="mt-1 text-xs text-rose-500">{infoTouched.description ? getCourseInfoErrors(courseInfo).description : ''}</p>
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium">Категория</label>
                                <select
                                    name="categoryId"
                                    value={courseInfo.categoryId}
                                    onChange={handleCourseInfoChange}
                                    className="w-full rounded-lg border p-2.5 bg-white dark:bg-[#222222] dark:text-white"
                                >
                                    <option value="">Категорияны тандаңыз</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>
                                <p className="mt-1 text-xs text-rose-500">{infoTouched.categoryId ? getCourseInfoErrors(courseInfo).categoryId : ''}</p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-[#111111]">
                        <h3 className="mb-4 text-lg font-semibold">Настройкалар</h3>
                        <div className="space-y-4">
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="flex-1">
                                    <label className="block text-sm mb-1 font-medium">Курс баасы (сом)</label>
                                    <input
                                        name="price"
                                        type="number"
                                        value={courseInfo.isPaid ? courseInfo.price : 0}
                                        onChange={handleCourseInfoChange}
                                        placeholder="Курс баасы"
                                        disabled={!courseInfo.isPaid}
                                        className="w-full rounded-lg border p-2.5 bg-white disabled:bg-slate-100 dark:bg-[#222222] dark:text-white dark:disabled:bg-slate-800"
                                    />
                                    <p className="mt-1 text-xs text-rose-500">{infoTouched.price ? getCourseInfoErrors(courseInfo).price : ''}</p>
                                </div>
                                <div className="flex items-center gap-2 mt-2 sm:mt-7">
                                    <input
                                        id="isPaid"
                                        name="isPaid"
                                        type="checkbox"
                                        checked={courseInfo.isPaid}
                                        onChange={handleCourseInfoChange}
                                    />
                                    <label htmlFor="isPaid" className="text-sm">
                                        Бул курс акы төлөнүүчү
                                    </label>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    id="aiAssistantEnabled"
                                    name="aiAssistantEnabled"
                                    type="checkbox"
                                    checked={courseInfo.aiAssistantEnabled}
                                    onChange={handleCourseInfoChange}
                                />
                                <label htmlFor="aiAssistantEnabled" className="text-sm">
                                    EDU AI ассистенттин бул курста иштешине уруксат берүү
                                </label>
                            </div>

                            <div>
                                <label className="block text-sm mb-1 font-medium">Сабак тили</label>
                                <select
                                    name="languageCode"
                                    value={courseInfo.languageCode}
                                    onChange={handleCourseInfoChange}
                                    className="w-full rounded-lg border p-2.5 bg-white dark:bg-[#222222] dark:text-white"
                                >
                                    <option value="ky">Кыргызча</option>
                                    <option value="ru">Русский</option>
                                    <option value="en">English</option>
                                </select>
                                <p className="mt-1 text-xs text-rose-500">{infoTouched.languageCode ? getCourseInfoErrors(courseInfo).languageCode : ''}</p>
                            </div>

                            <div>
                                <label className="block text-sm mb-1 font-medium">
                                    Бул курстан эмнени үйрөнөсүз? (ар бир сапка бир пункт)
                                </label>
                                <textarea
                                    name="learningOutcomesText"
                                    value={courseInfo.learningOutcomesText}
                                    onChange={handleCourseInfoChange}
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
                        {courseInfo.coverImageUrl && (
                            <img
                                src={courseInfo.coverImageUrl}
                                alt="Курс сүрөтү"
                                className="mb-3 max-h-52 w-full max-w-lg rounded-lg object-cover"
                            />
                        )}
                        <input
                            type="file"
                            name="cover"
                            accept="image/*"
                            onChange={handleCourseInfoChange}
                            className="w-full rounded-lg border p-2.5 bg-white dark:bg-[#222222] dark:text-white"
                        />
                        <p className="mt-1 text-xs text-slate-500">PNG/JPG, максимум 5MB</p>
                    </div>

                    <div className="sticky bottom-4 z-10 flex justify-end">
                        <button
                            onClick={handleCourseSubmit}
                            disabled={Object.keys(getCourseInfoErrors(courseInfo)).length > 0}
                            className="rounded-xl bg-slate-900 px-6 py-2.5 text-white disabled:opacity-50 dark:bg-blue-950"
                        >
                            Сактоо жана улантуу
                        </button>
                    </div>
                </div>
            )}

            {step === 2 && (
                <div className="space-y-4">
                    <div className="sticky top-20 z-20 rounded-2xl border border-slate-200/70 bg-white/90 backdrop-blur px-4 py-3 shadow-sm dark:border-slate-700 dark:bg-[#151515]/90">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="space-y-1">
                                <p className="text-xs uppercase tracking-wide text-slate-500">Курулуш режими</p>
                                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                                    Бөлүмдөр: {curriculum.length} • Сабактар: {totalLessons}
                                </p>
                                <p className="text-xs text-slate-600 dark:text-slate-300">
                                    Даярдык: {readyLessons}/{totalLessons} ({completionPercent}%)
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => expandAllSections(curriculum.length)}
                                    className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-[#1f1f1f] dark:text-slate-200"
                                >
                                    Баарын ачуу
                                </button>
                                <button
                                    onClick={() => collapseAllSections(curriculum.length)}
                                    className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-[#1f1f1f] dark:text-slate-200"
                                >
                                    Баарын жабуу
                                </button>
                                <button
                                    onClick={() => {
                                        setSingleSectionFocus((prev) => {
                                            const nextMode = !prev;
                                            if (nextMode) {
                                                const firstOpen = curriculum.findIndex((_, idx) => expandedSections[idx] ?? idx === 0);
                                                const openIdx = firstOpen >= 0 ? firstOpen : 0;
                                                const nextExpanded = {};
                                                for (let idx = 0; idx < curriculum.length; idx += 1) {
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
                                    onClick={handleCurriculumSubmit}
                                    disabled={isUploading}
                                    className="rounded-xl bg-slate-900 px-5 py-2 text-sm font-medium text-white disabled:opacity-60 dark:bg-blue-950"
                                >
                                    Сактоо жана улантуу
                                </button>
                            </div>
                        </div>
                        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                            {curriculum.map((section, sIdx) => {
                                const hasIssues = getSectionIssueCount(section) > 0;
                                const label = section.sectionTitle?.trim() || `Бөлүм ${sIdx + 1}`;
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
                    <h3 className="text-xl font-semibold mb-4">Окуу мазмуну</h3>
                    {curriculum.map((section, sIdx) => (
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
                                    for (let idx = 0; idx < curriculum.length; idx += 1) next[idx] = idx === sIdx;
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
                                        {section.sectionTitle || `Section ${sIdx + 1}`}
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
                        <div className="flex flex-col md:flex-row md:items-center md:gap-3 mb-2">
                            <div className="flex-1 flex flex-col gap-2">
                                <input
                                    className="w-full p-2 border rounded bg-white dark:bg-[#222222] dark:text-white"
                                    value={section.sectionTitle}
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
                                    Skill тандаңыз — ушул бөлүмгө байланышкан лидерборддордо прогресс эсептелет.
                                </p>
                            </div>
                            <button
                                onClick={() =>
                                    setConfirmDelete({
                                        type: 'section',
                                        sectionIndex: sIdx,
                                        title: section.sectionTitle,
                                    })
                                }
                                className="px-3 py-1 bg-red-100 text-red-700 border border-red-300 rounded hover:bg-red-200 text-sm h-10 mt-2 md:mt-0"
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
                                        onDelete={() =>
                                            setConfirmDelete({
                                                type: 'lesson',
                                                sectionIndex: sIdx,
                                                lessonIndex: lIdx,
                                                title: lesson.title,
                                            })
                                        }
                                    />
                                    <LessonMetaFields
                                        title={lesson.title}
                                        kind={lesson.kind || 'video'}
                                        kindOptions={LESSON_KIND_OPTIONS}
                                        onTitleChange={(value) => updateLesson(sIdx, lIdx, 'title', value)}
                                        onKindChange={(value) => updateLesson(sIdx, lIdx, 'kind', value)}
                                    />

                                    {lesson.kind === 'article' && (

                                        <>
                                            <label className="block mb-1 font-medium">
                                                Макала тексти
                                            </label>
                                            <ArticleEditor
                                                value={lesson.content || ''}
                                                onChange={(val) =>
                                                    updateLesson(sIdx, lIdx, 'content', val)
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
                                                    updateLesson(
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
                                                handleQuizChange(sIdx, lIdx, newQuiz)
                                            }
                                        />
                                    )}

                                    {lesson.kind === 'code' && (
                                        <LessonChallengeEditor
                                            challenge={lesson.challenge}
                                            onChange={(newChallenge) =>
                                                handleChallengeChange(sIdx, lIdx, newChallenge)
                                            }
                                        />
                                    )}
                                    <LessonAssetsPanel
                                        kind={lesson.kind}
                                        onVideoFile={(file) =>
                                            handleFileUpload(courseId, sIdx, lIdx, 'video', file)
                                        }
                                        videoExists={Boolean(lesson.videoUrl || lesson.videoKey)}
                                        videoProgress={lesson.uploadProgress.video}
                                        previewVideo={lesson.previewVideo}
                                        onPreviewVideoChange={(checked) =>
                                            updateLesson(sIdx, lIdx, 'previewVideo', checked)
                                        }
                                        previewLabel="Превью видеосун белгилөө"
                                        onResourceFile={(file) =>
                                            handleFileUpload(courseId, sIdx, lIdx, 'resource', file)
                                        }
                                        resourceExists={Boolean(lesson.resourceUrl || lesson.resourceKey)}
                                        resourceProgress={lesson.uploadProgress.resource}
                                        resourceName={lesson.resourceName}
                                        onResourceNameChange={(value) =>
                                            updateLesson(sIdx, lIdx, 'resourceName', value)
                                        }
                                        resourceNameDisabled={!lesson.resourceKey}
                                    />

                                </div>
                            );
                            })}
                            <div className="sticky bottom-2 mt-3 flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white/95 px-3 py-2 backdrop-blur dark:border-slate-700 dark:bg-[#151515]/95">
                                <span className="text-xs text-slate-500 dark:text-slate-400">
                                    Бул бөлүмдө сабактарды толтуруп, анан жалпы сактоону басыңыз.
                                </span>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => addLesson(sIdx)}
                                        className="rounded-lg bg-amber-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-amber-600"
                                    >
                                        + Сабак кошуу
                                    </button>
                                    <button
                                        onClick={handleCurriculumSubmit}
                                        className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-[#1f1f1f] dark:text-slate-200"
                                    >
                                        Жалпы сактоо
                                    </button>
                                </div>
                            </div>
                            </div>
                        </details>
                    ))}

                </div>
            )}

            {step === 3 && renderPreview()}

            {confirmDelete.type && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-[#222222] p-6 rounded shadow max-w-sm w-full">
                        <h4 className="text-lg font-semibold mb-4">Ырастоо</h4>
                        <p className="mb-6">
                            {confirmDelete.type === 'section' ? (
                                <span>
                                    <strong>{confirmDelete.title}</strong> бөлүмүн өчүрүүнү
                                    каалайсызбы?
                                </span>
                            ) : (
                                <span>
                                    <strong>{confirmDelete.title}</strong> сабагын өчүрүүнү
                                    каалайсызбы?
                                </span>
                            )}
                        </p>
                        <div className="flex justify-end gap-4">
                            <button
                                onClick={() =>
                                    setConfirmDelete({
                                        type: null,
                                        sectionIndex: null,
                                        lessonIndex: null,
                                        title: '',
                                    })
                                }
                                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded"
                            >
                                Жок
                            </button>
                            <button
                                onClick={handleDelete}
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

export default CourseBuilder;
