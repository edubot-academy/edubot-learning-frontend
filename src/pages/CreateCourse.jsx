import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    createCourse,
    createLesson,
    createSection,
    fetchCategories,
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
    const [confirmDelete, setConfirmDelete] = useState({
        type: null,
        sectionIndex: null,
        lessonIndex: null,
        title: '',
    });

    const [courseInfo, setCourseInfo] = useState(DEFAULT_COURSE_INFO);

    const [curriculum, setCurriculum] = useState([
        {
            sectionTitle: 'Бөлүм 1',
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

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await fetchCategories();
                setCategories(data);

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
                toast.error('Маалымат жүктөлбөдү');
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        localStorage.setItem('draftCourse', JSON.stringify({ courseInfo, courseId, step }));
    }, [courseInfo, courseId, step]);

    const handleCourseInfoChange = (e) => {
        const { name, value, files, type, checked } = e.target;

        if (name === 'cover' && files && files[0]) {
            setCourseInfo((prev) => ({
                ...prev,
                cover: files[0],
                coverImageUrl: URL.createObjectURL(files[0]),
            }));
            return;
        }

        if (type === 'checkbox') {
            setCourseInfo((prev) => ({ ...prev, [name]: checked }));
            return;
        }

        if (name === 'title' && value.length > 200) {
            toast.error('Аталыш өтө узун. Максимум 200 символ.');
            return;
        }

        setCourseInfo((prev) => ({ ...prev, [name]: value }));
    };

    const addSection = () => {
        setCurriculum((prev) => [
            ...prev,
            { sectionTitle: `Бөлүм ${prev.length + 1}`, lessons: [] },
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

    const handleCourseSubmit = async () => {
        if (
            !courseInfo.title ||
            !courseInfo.description ||
            !courseInfo.categoryId ||
            courseInfo.price === ''
        ) {
            toast.error('Сураныч, бардык талааларды толтуруңуз.');
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
                price: Number(courseInfo.price),
                subtitle: courseInfo.subtitle || undefined,
                languageCode: courseInfo.languageCode || 'ky',
                learningOutcomes: learningOutcomes.length ? learningOutcomes : undefined,
                aiAssistantEnabled: Boolean(courseInfo.aiAssistantEnabled),
                isPaid: courseInfo.isPaid && Number(courseInfo.price) > 0,
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
            for (const [sIdx, section] of curriculum.entries()) {
                const sec = await createSection(courseId, {
                    title: section.sectionTitle,
                    order: sIdx,
                });

                for (const [lIdx, lesson] of section.lessons.entries()) {
                    const isArticle = lesson.kind === 'article';
                    const isQuiz = lesson.kind === 'quiz';
                    const isCode = lesson.kind === 'code';
                    const missingTitle = !lesson.title?.trim();
                    const missingVideo = lesson.kind === 'video' && !lesson.videoKey;
                    const missingContent = isArticle && !lesson.content?.trim();
                    const missingReadTime = isArticle && (!lesson.duration || lesson.duration <= 0);
                    const quizData = isQuiz ? ensureQuizShape(lesson.quiz) : null;
                    const quizError = isQuiz ? validateQuiz(quizData) : null;
                    const challengeData = isCode ? ensureChallengeShape(lesson.challenge) : null;
                    let challengePayload = null;
                    if (isCode && challengeData) {
                        try {
                            challengePayload = normalizeChallengeForApi(challengeData);
                        } catch (error) {
                            toast.error(error.message);
                            continue;
                        }
                    }

                    if (
                        missingTitle ||
                        missingVideo ||
                        missingContent ||
                        missingReadTime ||
                        quizError
                    ) {
                        toast.error(
                            quizError
                                ? quizError
                                : isArticle
                                  ? 'Макала үчүн аталыш, текст жана окуу убактысы талап кылынат.'
                                  : 'Ар бир видео сабакта аталыш жана видео болушу керек.'
                        );
                        continue;
                    }

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
                        if (!quizPayload) {
                            toast.error('Квиз маалыматтарын сактоо мүмкүн эмес.');
                            continue;
                        }
                        await upsertLessonQuiz(courseId, sec.id, createdLesson.id, quizPayload);
                    }

                    if (isCode && challengePayload) {
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
            toast.error('Мазмунду сактоодо ката кетти.');
        }
    };

    const renderPreview = () => (
        <div className="space-y-6">
            <h3 className="text-xl font-semibold">Курс Превью</h3>
            <div>
                <p className="text-lg font-bold">{courseInfo.title}</p>
                {courseInfo.subtitle && (
                    <p className="text-sm text-gray-600 mb-1">{courseInfo.subtitle}</p>
                )}
                <p>{courseInfo.description}</p>
                <p className="italic text-gray-500">
                    Баасы: {courseInfo.isPaid ? `${courseInfo.price} сом` : 'Акысыз курс'}
                </p>
                {courseInfo.coverImageUrl && (
                    <img
                        src={courseInfo.coverImageUrl}
                        alt="cover"
                        className="max-h-48 mt-2 rounded object-cover"
                        decoding="async"
                        loading="lazy"
                    />
                )}
            </div>

            {courseInfo.learningOutcomesText && (
                <div>
                    <h4 className="font-semibold mb-2">Бул курста эмнени үйрөнөсүз:</h4>
                    <ul className="list-disc list-inside text-sm text-gray-700">
                        {courseInfo.learningOutcomesText
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
                {curriculum.map((section, sIdx) => (
                    <div key={sIdx} className="mb-4">
                        <p className="font-semibold">{section.sectionTitle}</p>
                        <ul className="list-disc list-inside text-sm text-gray-700">
                            {section.lessons.map((lesson, lIdx) => (
                                <li key={lIdx}>
                                    {lesson.title}
                                    {lesson.previewVideo && (
                                        <span className="text-xs text-green-600"> (Превью)</span>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>

            <div className="flex flex-wrap gap-4">
                <button onClick={() => setStep(2)} className="px-4 py-2 bg-gray-200 rounded">
                    Артка
                </button>

                <button
                    onClick={() => {
                        toast.success('Курс каралууга сакталды');
                        localStorage.removeItem('draftCourse');
                        navigate('/instructor/courses');
                    }}
                    className="px-6 py-2 bg-gray-800 text-white rounded"
                >
                    Сактап чыгуу
                </button>

                <button
                    onClick={async () => {
                        try {
                            await markCoursePending(courseId);
                            toast.success('Курс тастыктоого жөнөтүлдү');
                            localStorage.removeItem('draftCourse');
                            navigate('/instructor/courses');
                        } catch (error) {
                            console.error('Failed to submit for approval', error);
                            toast.error('Жөнөтүүдө ката кетти');
                        }
                    }}
                    className="px-6 py-2 bg-edubot-teal text-white rounded"
                >
                    Тастыктоого жөнөтүү
                </button>
            </div>
        </div>
    );

    return (
        <div className="pt-24 p-6 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-edubot-dark mb-6">Жаңы курс түзүү</h2>

            <div className="flex gap-4 mb-6">
                <button
                    onClick={() => setStep(1)}
                    className={step === 1 ? 'text-edubot-orange font-bold underline' : ''}
                >
                    1. Маалымат
                </button>
                <button
                    onClick={() => setStep(2)}
                    disabled={!courseId}
                    className={step === 2 ? 'text-edubot-orange font-bold underline' : ''}
                >
                    2. Мазмун
                </button>
                <button
                    onClick={() => setStep(3)}
                    disabled={!courseId}
                    className={step === 3 ? 'text-edubot-orange font-bold underline' : ''}
                >
                    3. Превью
                </button>
            </div>

            {step === 1 && (
                <div className="space-y-4">
                    <input
                        name="title"
                        value={courseInfo.title}
                        onChange={handleCourseInfoChange}
                        placeholder="Курс аталышы"
                        className="w-full border p-2 rounded"
                    />
                    <input
                        name="subtitle"
                        value={courseInfo.subtitle}
                        onChange={handleCourseInfoChange}
                        placeholder="Кыскача сүрөттөмө (подзаголовок)"
                        className="w-full border p-2 rounded"
                    />
                    <textarea
                        name="description"
                        value={courseInfo.description}
                        onChange={handleCourseInfoChange}
                        placeholder="Курс сүрөттөмөсү"
                        className="w-full border p-2 rounded"
                    />
                    <select
                        name="categoryId"
                        value={courseInfo.categoryId}
                        onChange={handleCourseInfoChange}
                        className="w-full border p-2 rounded"
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
                                value={courseInfo.price}
                                onChange={handleCourseInfoChange}
                                placeholder="Курс баасы"
                                className="w-full border p-2 rounded"
                            />
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
                        <label className="block text-sm mb-1">Сабак тили (Language)</label>
                        <select
                            name="languageCode"
                            value={courseInfo.languageCode}
                            onChange={handleCourseInfoChange}
                            className="w-full border p-2 rounded"
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
                            value={courseInfo.learningOutcomesText}
                            onChange={handleCourseInfoChange}
                            placeholder={
                                'Мисалы:\n- UX негиздери\n- Figma менен иштөө\n- UI китепкана түзүү'
                            }
                            className="w-full border p-2 rounded text-sm min-h-[100px]"
                        />
                    </div>

                    {courseInfo.coverImageUrl && (
                        <img
                            src={courseInfo.coverImageUrl}
                            alt="Курс сүрөтү"
                            className="max-h-48 object-cover rounded"
                        />
                    )}
                    <input
                        type="file"
                        name="cover"
                        accept="image/*"
                        onChange={handleCourseInfoChange}
                        className="w-full border p-2 rounded"
                    />

                    <button
                        onClick={handleCourseSubmit}
                        className="bg-edubot-dark text-white px-6 py-2 rounded"
                    >
                        Сактоо жана улантуу
                    </button>
                </div>
            )}

            {step === 2 && (
                <div>
                    <h3 className="text-xl font-semibold mb-4">Окуу мазмуну</h3>
                    {curriculum.map((section, sIdx) => (
                        <div key={sIdx} className="mb-6 border border-edubot-teal rounded p-4">
                            <div className="flex justify-between items-center mb-2 gap-2">
                                <input
                                    className="w-full p-2 border rounded"
                                    value={section.sectionTitle}
                                    onChange={(e) => updateSectionTitle(sIdx, e.target.value)}
                                    placeholder="Бөлүм аталышы"
                                />
                                <button
                                    onClick={() =>
                                        setConfirmDelete({
                                            type: 'section',
                                            sectionIndex: sIdx,
                                            title: section.sectionTitle,
                                        })
                                    }
                                    className="px-3 py-1 bg-red-100 text-red-700 border border-red-300 rounded hover:bg-red-200 text-sm"
                                >
                                    Өчүрүү
                                </button>
                            </div>
                            {section.lessons.map((lesson, lIdx) => (
                                <div key={lIdx} className="mb-4 p-2 bg-gray-50 rounded border">
                                    <input
                                        className="w-full p-2 mb-2 border rounded"
                                        value={lesson.title}
                                        onChange={(e) =>
                                            updateLesson(sIdx, lIdx, 'title', e.target.value)
                                        }
                                        placeholder="Сабак аталышы"
                                    />

                                    <label className="block text-sm font-medium mb-1">
                                        Сабактын тиби
                                    </label>
                                    <select
                                        className="w-full p-2 mb-2 border rounded bg-white"
                                        value={lesson.kind || 'video'}
                                        onChange={(e) =>
                                            updateLesson(sIdx, lIdx, 'kind', e.target.value)
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
                                                    updateLesson(sIdx, lIdx, 'content', val)
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
                                                    updateLesson(
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

                                    {lesson.kind === 'video' && (
                                        <>
                                            <label className="block mb-1 font-medium">
                                                Видео жүктөө
                                            </label>
                                            <input
                                                type="file"
                                                accept="video/*"
                                                className="w-full mb-2"
                                                onChange={(e) =>
                                                    handleFileUpload(
                                                        courseId,
                                                        sIdx,
                                                        lIdx,
                                                        'video',
                                                        e.target.files[0]
                                                    )
                                                }
                                            />
                                            {lesson.uploadProgress.video > 0 && (
                                                <div className="w-full bg-gray-200 rounded h-2 mb-1">
                                                    <div
                                                        className="bg-blue-600 h-full rounded transition-all duration-200"
                                                        style={{
                                                            width: `${lesson.uploadProgress.video}%`,
                                                        }}
                                                    />
                                                </div>
                                            )}
                                            {lesson.uploadProgress.video > 0 && (
                                                <p className="text-xs text-gray-500 mb-2">
                                                    {lesson.uploadProgress.video}% жүктөлдү
                                                </p>
                                            )}
                                        </>
                                    )}

                                    <label className="block mt-2 mb-1 font-medium">
                                        Материал жүктөө (PDF, ZIP)
                                    </label>
                                    <input
                                        type="file"
                                        accept=".pdf,.zip"
                                        onChange={(e) =>
                                            handleFileUpload(
                                                courseId,
                                                sIdx,
                                                lIdx,
                                                'resource',
                                                e.target.files[0]
                                            )
                                        }
                                        className="w-full mb-2"
                                    />
                                    {lesson.uploadProgress.resource > 0 && (
                                        <>
                                            <div className="w-full bg-gray-100 rounded h-2 mb-1">
                                                <div
                                                    className="bg-purple-500 h-full rounded transition-all duration-200"
                                                    style={{
                                                        width: `${lesson.uploadProgress.resource}%`,
                                                    }}
                                                />
                                            </div>
                                            <p className="text-xs text-gray-500 mb-2">
                                                {lesson.uploadProgress.resource}% жүктөлдү
                                            </p>
                                        </>
                                    )}

                                    <label className="block text-sm font-medium">
                                        Материалдын аталышы
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full p-2 mb-2 border rounded"
                                        value={lesson.resourceName || ''}
                                        onChange={(e) =>
                                            updateLesson(sIdx, lIdx, 'resourceName', e.target.value)
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
                                                    updateLesson(
                                                        sIdx,
                                                        lIdx,
                                                        'previewVideo',
                                                        e.target.checked
                                                    )
                                                }
                                            />
                                            Превью видеосун белгилөө
                                        </label>
                                    )}

                                    <button
                                        onClick={() =>
                                            setConfirmDelete({
                                                type: 'lesson',
                                                sectionIndex: sIdx,
                                                lessonIndex: lIdx,
                                                title: lesson.title,
                                            })
                                        }
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
                    <button
                        onClick={addSection}
                        className="bg-edubot-green text-white px-4 py-2 rounded"
                    >
                        + Бөлүм кошуу
                    </button>
                    <button
                        onClick={handleCurriculumSubmit}
                        disabled={isUploading}
                        className="bg-edubot-dark text-white px-6 py-2 rounded ml-4 disabled:opacity-60"
                    >
                        Сактоо жана улантуу
                    </button>
                </div>
            )}

            {step === 3 && renderPreview()}

            {confirmDelete.type && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded shadow max-w-sm w-full">
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
                                className="px-4 py-2 bg-gray-200 rounded"
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
