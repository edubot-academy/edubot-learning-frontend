import { useEffect, useState, useCallback } from 'react';
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

const EditInstructorCourse = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [course, setCourse] = useState(null);
    const [originalCourse, setOriginalCourse] = useState(null);
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
                };

                setSkillOptions(skillOptionsWithBlank);

                setCourse(hydratedCourse);
                setOriginalCourse(hydratedCourse);
                setCategories(categoryData);
                setSections(allSections);
                setOriginalSections(JSON.parse(JSON.stringify(allSections)));
            } catch (err) {
                console.error(err);
                toast.error('Маалыматты жүктөө катасы');
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [id]);

    const handleCourseChange = (e) => {
        const { name, value, files, type, checked } = e.target;

        if (files && files[0] && name === 'cover') {
            setCourse((prev) => ({
                ...prev,
                cover: files[0],
                coverImageUrl: URL.createObjectURL(files[0]),
            }));
            return;
        }

        if (type === 'checkbox') {
            setCourse((prev) => ({ ...prev, [name]: checked }));
            return;
        }

        if (name === 'title' && value.length > 200) {
            toast.error('Аталыш өтө узун. Максимум 200 символ.');
            return;
        }

        setCourse((prev) => ({ ...prev, [name]: value }));
    };

    const updateSectionTitle = (index, title) => {
        setSections((prev) => {
            const updated = [...prev];
            updated[index].title = title;
            return updated;
        });
    };

    const updateSectionSkill = (index, skillId) => {
        setSections((prev) => {
            const updated = [...prev];
            updated[index].skillId = toSkillValue(skillId);
            return updated;
        });
    };

    const normalizeSkillValue = (value) => {
        if (!value) return undefined;
        const num = Number(value);
        return Number.isFinite(num) ? num : value;
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
            }
            updated[sectionIndex].lessons.splice(lessonIndex, 1);
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
            return updated;
        });
    };

    const handleLessonQuizChange = (sectionIndex, lessonIndex, newQuiz) => {
        setSections((prev) => {
            const updated = [...prev];
            const lesson = updated[sectionIndex].lessons[lessonIndex];
            lesson.quiz = ensureQuizShape(newQuiz);
            return updated;
        });
    };

    const handleLessonChallengeChange = (sectionIndex, lessonIndex, newChallenge) => {
        setSections((prev) => {
            const updated = [...prev];
            const lesson = updated[sectionIndex].lessons[lessonIndex];
            lesson.challenge = ensureChallengeShape(newChallenge);
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

    const handleCourseSubmit = async () => {
        if (
            !course.title ||
            !course.description ||
            !course.category.id ||
            course.price === '' ||
            course.price === null
        ) {
            toast.error('Сураныч, бардык талааларды толтуруңуз.');
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
                categoryId: course.category.id,
                price: Number(course.price),
                subtitle: course.subtitle || undefined,
                languageCode: course.languageCode || 'ky',
                learningOutcomes: learningOutcomes.length > 0 ? learningOutcomes : undefined,
                aiAssistantEnabled: Boolean(course.aiAssistantEnabled),
                isPaid: course.isPaid && Number(course.price) > 0,
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

    const handleSaveAll = async () => {
        setSaving(true);
        try {
            for (const { sectionId, lessonId } of deletedLessons) {
                await deleteLessonApi(id, sectionId, lessonId);
            }
            setDeletedLessons([]);

            for (const [sectionIdx, section] of sections.entries()) {
                const sectionPayload = {
                    title: section.title,
                    order: sectionIdx,
                    skillId: normalizeSkillValue(section.skillId),
                };

                if (!section.id) {
                    const createdSection = await createSection(id, sectionPayload);
                    section.id = createdSection.id;
                } else {
                    await updateSection(id, section.id, sectionPayload);
                }

                for (const [lessonIdx, lesson] of section.lessons.entries()) {
                    const isArticle = lesson.kind === 'article';
                    const isVideo = lesson.kind === 'video';
                    const isQuiz = lesson.kind === 'quiz';
                    const isCode = lesson.kind === 'code';

                    if (!lesson.title?.trim()) {
                        toast.error('Ар бир сабакта аталыш болушу керек.');
                        continue;
                    }

                    if (isVideo && !lesson.videoKey) {
                        toast.error('Видео сабактар үчүн файл жүктөө керек.');
                        continue;
                    }

                    if (isArticle) {
                        if (!lesson.content?.trim() || !lesson.duration || lesson.duration <= 0) {
                            toast.error(
                                'Макала сабактары үчүн текст жана окуу убактысы талап кылынат.'
                            );
                            continue;
                        }
                    }

                    const quizData = isQuiz ? ensureQuizShape(lesson.quiz) : null;
                    const quizError = isQuiz ? validateQuiz(quizData) : null;
                    if (quizError) {
                        toast.error(quizError);
                        continue;
                    }

                    const challengeData = isCode ? ensureChallengeShape(lesson.challenge) : null;
                    let challengePayload = null;
                    if (isCode) {
                        try {
                            challengePayload = normalizeChallengeForApi(challengeData);
                        } catch (error) {
                            toast.error(error.message);
                            continue;
                        }
                    }

                    const lessonPayload = {
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

                    let savedLessonId = lesson.id;
                    if (!lesson.id && lesson.title) {
                        const createdLesson = await createLesson(id, section.id, lessonPayload);
                        savedLessonId = createdLesson.id;
                        lesson.id = createdLesson.id;
                    } else if (lesson.id) {
                        await updateLesson(id, section.id, lesson.id, lessonPayload);
                    }

                    if (isQuiz && savedLessonId && quizData) {
                        const quizPayload = normalizeQuizForApi(quizData);
                        if (quizPayload) {
                            await upsertLessonQuiz(id, section.id, savedLessonId, quizPayload);
                        }
                    }

                    if (isCode && savedLessonId && challengePayload) {
                        await upsertLessonChallenge(
                            id,
                            section.id,
                            savedLessonId,
                            challengePayload
                        );
                    }
                }
            }

            toast.success('Мазмун сакталды!');
            setStep(3);
        } catch (err) {
            console.error(err);
            toast.error('Мазмунду сактоодо ката кетти.');
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
            toast.error('Курс жөнөтүлбөй калды');
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

    return (
        <div className="pt-24 p-6 max-w-4xl mx-auto">
            <div className="flex gap-4 mb-6">
                <button
                    onClick={() => setStep(1)}
                    className={step === 1 ? 'text-edubot-orange font-bold underline' : ''}
                >
                    1. Маалымат
                </button>
                <button
                    onClick={() => setStep(2)}
                    disabled={!course}
                    className={step === 2 ? 'text-edubot-orange font-bold underline' : ''}
                >
                    2. Мазмун
                </button>
                <button
                    onClick={() => setStep(3)}
                    disabled={!course}
                    className={step === 3 ? 'text-edubot-orange font-bold underline' : ''}
                >
                    3. Превью
                </button>
            </div>

            {/* STEP 1 — INFO */}
            {step === 1 && (
                <div className="space-y-4">
                    <input
                        name="title"
                        value={course.title || ''}
                        onChange={handleCourseChange}
                        placeholder="Курс аталышы"
                        className="w-full border p-2 rounded bg-white dark:bg-[#222222] dark:text-white"
                    />
                    <input
                        name="subtitle"
                        value={course.subtitle || ''}
                        onChange={handleCourseChange}
                        placeholder="Кыскача сүрөттөмө (подзаголовок)"
                        className="w-full border p-2 rounded bg-white dark:bg-[#222222] dark:text-white"
                    />
                    <textarea
                        name="description"
                        value={course.description || ''}
                        onChange={handleCourseChange}
                        placeholder="Курс сүрөттөмөсү"
                        className="w-full border p-2 rounded bg-white dark:bg-[#222222] dark:text-white"
                    />

                    <select
                        name="categoryId"
                        value={course.category.id || ''}
                        onChange={handleCourseChange}
                        className="w-full border p-2 rounded bg-white dark:bg-[#222222] dark:text-white"
                    >
                        <option value="">Категорияны тандаңыз</option>
                        {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                                {cat.name}
                            </option>
                        ))}
                    </select>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <label className="block text-sm mb-1">Курс баасы (сом)</label>
                            <input
                                name="price"
                                type="number"
                                value={course.price || ''}
                                onChange={handleCourseChange}
                                placeholder="Курс баасы"
                                className="w-full border p-2 rounded bg-white dark:bg-[#222222] dark:text-white"
                            />
                        </div>
                        <div className="flex items-center gap-2 mt-2 sm:mt-7">
                            <input
                                id="isPaid"
                                name="isPaid"
                                type="checkbox"
                                checked={course.isPaid ?? true}
                                onChange={handleCourseChange}
                                className="bg-white dark:bg-[#222222] dark:text-white"
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
                            checked={course.aiAssistantEnabled ?? false}
                            onChange={handleCourseChange}
                            className="bg-white dark:bg-[#222222] dark:text-white"
                        />
                        <label htmlFor="aiAssistantEnabled" className="text-sm">
                            EDU AI ассистентин бул курста колдонууга уруксат берүү
                        </label>
                    </div>

                    <div>
                        <label className="block text-sm mb-1">Сабак тили (Language)</label>
                        <select
                            name="languageCode"
                            value={course.languageCode || 'ky'}
                            onChange={handleCourseChange}
                            className="w-full border p-2 rounded bg-white dark:bg-[#222222] dark:text-white"
                        >
                            <option value="ky">Кыргызча</option>
                            <option value="ru">Русский</option>
                            <option value="en">English</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm mb-1">
                            Бул курстан эмнени үйрөнөсүз? (ар бир сапка бир пункт)
                        </label>
                        <textarea
                            name="learningOutcomesText"
                            value={course.learningOutcomesText || ''}
                            onChange={handleCourseChange}
                            placeholder={
                                'Мисалы:\n- UX негиздери\n- Figma менен иштөө\n- UI китепкана түзүү'
                            }
                            className="w-full border p-2 rounded text-sm min-h-[100px] bg-white dark:bg-[#222222] dark:text-white"
                        />
                    </div>

                    {course.coverImageUrl && (
                        <img
                            src={course.coverImageUrl}
                            alt="Курс сүрөтү"
                            className="max-h-48 object-cover rounded"
                        />
                    )}
                    <input
                        type="file"
                        name="cover"
                        accept="image/*"
                        onChange={handleCourseChange}
                        className="w-full border p-2 rounded bg-white dark:bg-[#222222] dark:text-white"
                    />

                    <div className="flex gap-3 mt-4">
                        <button
                            onClick={handleCourseSubmit}
                            className="bg-edubot-dark dark:bg-blue-950 text-white px-6 py-2 rounded"
                        >
                            Сактоо жана улантуу
                        </button>
                        <button onClick={confirmCancel} className="px-6 py-2 border rounded">
                            Артка
                        </button>
                    </div>
                </div>
            )}

            {/* STEP 2 — CURRICULUM */}
            {step === 2 && (
                <div>
                    {sections.map((section, sIdx) => (
                        <div key={sIdx} className="mb-6 border border-edubot-teal rounded p-4">
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
                            {section.lessons.map((lesson, lIdx) => (
                                <div key={lIdx} className="mb-4 p-2 bg-white dark:bg-[#222222] rounded">
                                    <input
                                        className="w-full p-2 mb-2 border rounded bg-white dark:bg-[#222222] dark:text-white"
                                        value={lesson.title}
                                        onChange={(e) =>
                                            handleLessonFieldChange(
                                                sIdx,
                                                lIdx,
                                                'title',
                                                e.target.value
                                            )
                                        }
                                        placeholder="Сабак аталышы"
                                    />

                                    <label className="block text-sm font-medium mb-1">
                                        Сабактын тиби
                                    </label>
                                    <select
                                        className="w-full p-2 mb-2 border rounded bg-white dark:bg-[#222222] dark:text-white"
                                        value={lesson.kind || 'video'}
                                        onChange={(e) =>
                                            handleLessonFieldChange(
                                                sIdx,
                                                lIdx,
                                                'kind',
                                                e.target.value
                                            )
                                        }
                                    >
                                        {LESSON_KIND_OPTIONS.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>

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
                                                min="1"
                                                className="w-full p-2 mb-2 border rounded"
                                                value={
                                                    lesson.duration && lesson.duration > 0
                                                        ? Math.round(lesson.duration / 60)
                                                        : ''
                                                }
                                                onChange={(e) => {
                                                    const minutes = Number(e.target.value);
                                                    handleLessonFieldChange(
                                                        sIdx,
                                                        lIdx,
                                                        'duration',
                                                        Number.isFinite(minutes) && minutes > 0
                                                            ? minutes * 60
                                                            : 0
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

                                    {lesson.kind === 'video' && (
                                        <>
                                            <label className="block mb-1 font-medium">
                                                Видео жүктөө
                                            </label>
                                            <div className="flex items-center justify-between gap-2">
                                                <input
                                                    type="file"
                                                    accept="video/*"
                                                    onChange={(e) =>
                                                        handleFileUpload(
                                                            sIdx,
                                                            lIdx,
                                                            'video',
                                                            e.target.files[0]
                                                        )
                                                    }
                                                    className="w-full mb-2"
                                                />
                                                {lesson.videoUrl && (
                                                    <span className="text-xs text-blue-500 whitespace-nowrap">
                                                        Видео файл бар
                                                    </span>
                                                )}
                                            </div>
                                            {lesson.uploadProgress.video > 0 && (
                                                <div className="mb-2">
                                                    <div className="w-full bg-gray-200 rounded h-2">
                                                        <div
                                                            className="bg-blue-600 h-full rounded"
                                                            style={{
                                                                width: `${lesson.uploadProgress.video}%`,
                                                            }}
                                                        ></div>
                                                    </div>
                                                    <p className="text-xs text-gray-500">
                                                        {lesson.uploadProgress.video}% жүктөлдү
                                                    </p>
                                                </div>
                                            )}
                                        </>
                                    )}

                                    <label className="block mt-3 mb-1 font-medium">
                                        Материал жүктөө (PDF, ZIP)
                                    </label>
                                    <div className="flex items-center justify-between gap-2">
                                        <input
                                            type="file"
                                            accept=".pdf,.zip"
                                            onChange={(e) =>
                                                handleFileUpload(
                                                    sIdx,
                                                    lIdx,
                                                    'resource',
                                                    e.target.files[0]
                                                )
                                            }
                                            className="w-full mb-2"
                                        />
                                        {lesson.resourceUrl && (
                                            <span className="text-xs text-purple-500 whitespace-nowrap">
                                                Материал файл бар
                                            </span>
                                        )}
                                    </div>
                                    {lesson.uploadProgress.resource > 0 && (
                                        <div className="mb-2">
                                            <div className="w-full bg-gray-100 rounded h-2">
                                                <div
                                                    className="bg-purple-500 h-full rounded"
                                                    style={{
                                                        width: `${lesson.uploadProgress.resource}%`,
                                                    }}
                                                ></div>
                                            </div>
                                            <p className="text-xs text-gray-500">
                                                {lesson.uploadProgress.resource}% жүктөлдү
                                            </p>
                                        </div>
                                    )}

                                    <label className="block text-sm font-medium">
                                        Материалдын аталышы
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full p-2 mb-2 border rounded  bg-white dark:bg-[#222222] dark:text-white"
                                        value={lesson.resourceName || ''}
                                        onChange={(e) =>
                                            handleLessonFieldChange(
                                                sIdx,
                                                lIdx,
                                                'resourceName',
                                                e.target.value
                                            )
                                        }
                                        placeholder="мисалы: Практикалык тапшырмалар.pdf"
                                        disabled={!lesson.resourceKey}
                                    />
                                    <p className="text-xs text-gray-500 mb-2">
                                        Бул аталыш студенттерге көрсөтүлөт.
                                    </p>

                                    {lesson.kind === 'video' && (
                                        <label className="flex items-center gap-2 mt-2">
                                            <input
                                                type="checkbox"
                                                checked={lesson.previewVideo}
                                                onChange={(e) =>
                                                    handleLessonFieldChange(
                                                        sIdx,
                                                        lIdx,
                                                        'previewVideo',
                                                        e.target.checked
                                                    )
                                                }
                                            />
                                            Превью видео катары белгилөө
                                        </label>
                                    )}

                                    <button
                                        onClick={() => {
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
                                        className="mt-2 px-3 py-1 bg-red-100 text-red-700 border border-red-300 rounded hover:bg-red-200 text-sm"
                                    >
                                        Сабакты өчүрүү
                                    </button>
                                </div>
                            ))}
                            <button
                                onClick={() => addLesson(sIdx)}
                                className="bg-edubot-orange text-white px-4 py-1 rounded mt-2"
                            >
                                + Сабак кошуу
                            </button>
                        </div>
                    ))}
                    <div className="flex gap-4">
                        <button
                            onClick={addSection}
                            className="bg-edubot-green text-white px-4 py-2 rounded"
                        >
                            + Бөлүм кошуу
                        </button>
                        <button
                            onClick={handleSaveAll}
                            disabled={isUploading || saving}
                            className="bg-edubot-dark dark:bg-blue-950 text-white px-6 py-2 rounded disabled:opacity-60"
                        >
                            Сактоо жана улантуу
                        </button>
                    </div>
                </div>
            )}

            {/* STEP 3 — PREVIEW */}
            {step === 3 && (
                <div className="space-y-6">
                    <h3 className="text-xl font-semibold">Курс Превью</h3>
                    <div>
                        <p className="text-lg font-bold">{course.title}</p>
                        {course.subtitle && (
                            <p className="text-sm text-gray-600 dark:text-[#a6adba] mb-1">{course.subtitle}</p>
                        )}
                        <p>{course.description}</p>
                        <p className="italic text-gray-500 dark:text-[#a6adba]">
                            Баасы: {course.isPaid ? `${course.price} сом` : 'Акысыз курс'}
                        </p>
                        {course.coverImageUrl && (
                            <img
                                src={course.coverImageUrl}
                                alt="Курс сүрөтү"
                                className="max-h-48 mt-2 rounded object-cover"
                            />
                        )}
                    </div>

                    {course.learningOutcomesText && (
                        <div>
                            <h4 className="font-semibold mb-2">Бул курста эмнени үйрөнөсүз:</h4>
                            <ul className="list-disc list-inside text-sm text-gray-700 dark:text-[#a6adba]">
                                {(course.learningOutcomesText || '')
                                    .split('\n')
                                    .map((line) => line.trim())
                                    .filter(Boolean)
                                    .map((line, idx) => (
                                        <li key={idx}>{line}</li>
                                    ))}
                            </ul>
                        </div>
                    )}

                    <div>
                        {sections.map((section, sIdx) => (
                            <div key={sIdx} className="mb-4">
                                <p className="font-semibold">{section.title}</p>
                                <ul className="list-disc list-inside text-sm text-gray-700 dark:text-[#a6adba]">
                                    {section.lessons.map((lesson, lIdx) => (
                                        <li key={lIdx}>
                                            {lesson.title}{' '}
                                            {lesson.previewVideo && (
                                                <span className="text-xs text-gray-600 dark:text-[#a6adba]">
                                                    (Превью)
                                                </span>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={() => setStep(2)}
                            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded"
                        >
                            Артка
                        </button>
                        <button
                            onClick={handleSubmitForApproval}
                            className="px-6 py-2 bg-edubot-teal text-white rounded"
                        >
                            Тастыктоого жөнөтүү
                        </button>
                    </div>
                </div>
            )}

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
