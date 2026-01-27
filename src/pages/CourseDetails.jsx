import { useState, useEffect, useRef, useCallback, useContext } from 'react';
import { useParams } from 'react-router-dom';
import debounce from 'lodash.debounce';
import toast from 'react-hot-toast';
import {
    fetchCourseDetails,
    fetchSections,
    markLessonComplete,
    fetchUserProgress,
    updateLastViewedLesson,
    getLastViewedLesson,
    getVideoTime,
    updateVideoTime,
    fetchEnrollment,
    fetchLessonQuiz,
    submitLessonQuiz,
    fetchLessonChallenge,
    submitLessonChallenge,
} from '@services/api';
import { AuthContext } from '../context/AuthContext';
import CourseVideoPlayer from '@features/courses/components/CourseVideoPlayer';
import CardVideo from '@features/courses/components/CardVideo';
import ArticleLessonViewer from '@features/courses/components/ArticleLessonViewer';
import LessonQuizPlayer from '@features/courses/components/LessonQuizPlayer';
import LessonChallengePlayer from '@features/courses/components/LessonChallengePlayer';
import CourseDescription from '@features/courses/components/CourseDescription';
import Comment from '@features/ratings/components/Comment';
import AiAssistantPanel from '@features/assistant/components/AiAssistantPanel';
import InstructorsInfo from '@features/courses/components/InstructorsInfo';
import CourseReview from '@features/courses/components/CourseReview';
import CourseContent from '@features/courses/components/CourseContent';
import { FaSignalMessenger } from 'react-icons/fa6';
import InstructorChat from '@features/instructorChat/InstructorChat';
import CourseHeader from '@features/courses/components/CourseHeader';

const CHALLENGE_STORAGE_PREFIX = 'lessonChallengeState';

const getChallengeStorageKey = (courseId, lessonId) =>
    `${CHALLENGE_STORAGE_PREFIX}:${courseId}:${lessonId}`;

const loadChallengeStateFromStorage = (courseId, lessonId) => {
    if (typeof window === 'undefined') return null;
    try {
        const raw = localStorage.getItem(getChallengeStorageKey(courseId, lessonId));
        return raw ? JSON.parse(raw) : null;
    } catch (error) {
        console.warn('Failed to read challenge state', error);
        return null;
    }
};

const saveChallengeStateToStorage = (courseId, lessonId, updates) => {
    if (typeof window === 'undefined') return;
    try {
        const existing = loadChallengeStateFromStorage(courseId, lessonId) || {};
        const next = { ...existing, ...updates };
        localStorage.setItem(getChallengeStorageKey(courseId, lessonId), JSON.stringify(next));
    } catch (error) {
        console.warn('Failed to persist challenge state', error);
    }
};

const CourseDetailsPage = () => {
    const { id } = useParams();
    const { user } = useContext(AuthContext);
    const [course, setCourse] = useState(null);
    const [sections, setSections] = useState([]);
    const [activeSectionId, setActiveSectionId] = useState(null);
    const [activeLesson, setActiveLesson] = useState(null);
    const activeLessonRef = useRef(null);
    const [lastViewedLessonId, setLastViewedLessonId] = useState(null);
    const [completedLessons, setCompletedLessons] = useState([]);
    const [resumeVideoTime, setResumeVideoTime] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [enrolled, setEnrolled] = useState(false);
    const lessonRefs = useRef({});
    const videoRef = useRef(null);
    const hasPlayedRef = useRef(false);
    const [shouldScrollToLesson, setShouldScrollToLesson] = useState(true);
    const [activeTab, setActiveTab] = useState('program'); // 'program' | 'assistant'
    const [lessonQuizData, setLessonQuizData] = useState({});
    const [lessonQuizAnswers, setLessonQuizAnswers] = useState({});
    const [lessonQuizResults, setLessonQuizResults] = useState({});
    const [quizLoading, setQuizLoading] = useState(false);
    const [quizSubmitting, setQuizSubmitting] = useState(false);
    const [lessonChallengeData, setLessonChallengeData] = useState({});
    const [lessonChallengeCode, setLessonChallengeCode] = useState({});
    const [lessonChallengeResults, setLessonChallengeResults] = useState({});
    const [challengeLoading, setChallengeLoading] = useState(false);
    const [challengeSubmitting, setChallengeSubmitting] = useState(false);
    const [instructorChat, setInstructorChat] = useState(false);

    useEffect(() => {
        hasPlayedRef.current = false;
    }, [activeLesson]);

    useEffect(() => {
        activeLessonRef.current = activeLesson;
    }, [activeLesson]);

    const scrollToLesson = (lessonId) => {
        if (!shouldScrollToLesson) return;

        setTimeout(() => {
            const el = lessonRefs.current[lessonId];
            if (el) {
                const rect = el.getBoundingClientRect();
                const isVisible = rect.top >= 0 && rect.bottom <= window.innerHeight;

                if (!isVisible) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
        }, 100);
    };

    // Auto-complete article lessons after 30 seconds of viewing
    useEffect(() => {
        if (!enrolled || !activeLesson || activeLesson.kind !== 'article' || activeLesson.locked) {
            return undefined;
        }
        if (completedLessons.includes(activeLesson.id)) return undefined;

        const timer = setTimeout(async () => {
            try {
                const resp = await markLessonComplete(
                    Number(id),
                    activeLesson.sectionId,
                    activeLesson.id
                );
                if (resp.completed) {
                    setCompletedLessons((prev) => [...new Set([...prev, activeLesson.id])]);
                }
            } catch (err) {
                console.error('Failed to auto-complete article', err);
            }
        }, 30000);

        return () => clearTimeout(timer);
    }, [activeLesson, enrolled, id, completedLessons]);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const debouncedTimeUpdate = useCallback(
        debounce((time) => {
            if (
                user &&
                enrolled &&
                activeLessonRef.current?.id &&
                activeLessonRef.current?.kind === 'video'
            ) {
                updateVideoTime({
                    courseId: Number(id),
                    lessonId: activeLessonRef.current.id,
                    time,
                });
            }
        }, 3000),
        [id, user, enrolled]
    );

    const handleTimeUpdate = (time) => {
        if (user && enrolled && activeLessonRef.current?.kind === 'video') {
            debouncedTimeUpdate(time);
        }
    };

    // const handlePause = () => {
    //     if (!videoRef.current) return;
    //     const currentTime = videoRef.current.currentTime;
    //     if (currentTime < (activeLessonRef.current?.duration ?? 9999) * 0.9) return;
    //     if (user && enrolled && activeLessonRef.current?.kind === 'video') {
    //         console.log('updateVideoTime');
    //         updateVideoTime(user.id, activeLessonRef.current.id, currentTime);
    //     }
    // };
    const handlePause = (currentTime, duration) => {
        if (currentTime < duration * 0.9) return;

        if (user && enrolled && activeLessonRef.current?.kind === 'video') {
            updateVideoTime(user.id, activeLessonRef.current.id, currentTime);
        }
    };

    const toggleSection = (sectionId) => {
        setShouldScrollToLesson(false);

        const newId = activeSectionId === sectionId ? null : sectionId;
        setActiveSectionId(newId);

        if (newId) {
            localStorage.setItem(`active_section_${id}`, String(newId));
        } else {
            localStorage.removeItem(`active_section_${id}`);
        }

        setTimeout(() => {
            setShouldScrollToLesson(true);
        }, 300);
    };

    const loadQuizForLesson = async (lesson) => {
        if (lessonQuizData[lesson.id]) return;
        setQuizLoading(true);
        try {
            const quiz = await fetchLessonQuiz(id, lesson.sectionId, lesson.id);
            setLessonQuizData((prev) => ({ ...prev, [lesson.id]: quiz }));
            setLessonQuizAnswers((prev) => ({ ...prev, [lesson.id]: {} }));
        } catch (err) {
            console.error(err);
            const message = err.response?.data?.message || 'Квиз жүктөлбөй калды';
            toast.error(message);
        } finally {
            setQuizLoading(false);
        }
    };

    const loadChallengeForLesson = async (lesson) => {
        if (lessonChallengeData[lesson.id]) return lessonChallengeData[lesson.id];
        setChallengeLoading(true);
        try {
            const challenge = await fetchLessonChallenge(id, lesson.sectionId, lesson.id);
            setLessonChallengeData((prev) => ({ ...prev, [lesson.id]: challenge }));

            const savedState = loadChallengeStateFromStorage(id, lesson.id);
            setLessonChallengeCode((prev) => ({
                ...prev,
                [lesson.id]:
                    typeof prev[lesson.id] !== 'undefined'
                        ? prev[lesson.id]
                        : (savedState?.code ?? challenge.starterCode ?? ''),
            }));

            if (savedState?.result) {
                setLessonChallengeResults((prev) => ({
                    ...prev,
                    [lesson.id]: savedState.result,
                }));
            }

            return challenge;
        } catch (err) {
            console.error(err);
            const message = err.response?.data?.message || 'Код тапшырма жүктөлбөй калды';
            toast.error(message);
            return null;
        } finally {
            setChallengeLoading(false);
        }
    };

    const handleLessonClick = async (lesson) => {
        console.log('handleLessonClick');
        const isArticle = lesson.kind === 'article';
        const isQuiz = lesson.kind === 'quiz';
        const isCode = lesson.kind === 'code';
        setActiveLesson(lesson);
        localStorage.setItem(`active_section_${id}`, String(lesson.sectionId));
        setActiveSectionId(lesson.sectionId);
        scrollToLesson(lesson.id);

        if (!isArticle && !isQuiz && !isCode) {
            setTimeout(() => {
                if (videoRef.current) {
                    videoRef.current.load();
                    if (!hasPlayedRef.current) {
                        videoRef.current
                            .play()
                            .catch((err) => console.warn('Autoplay failed:', err));
                    }
                }
            }, 0);
        } else {
            setResumeVideoTime(0);
        }

        if (isQuiz) {
            await loadQuizForLesson(lesson);
        }

        if (isCode) {
            await loadChallengeForLesson(lesson);
        }

        if (user && enrolled && !lesson.locked) {
            await updateLastViewedLesson({ courseId: Number(id), lessonId: lesson.id });
            if (!isArticle && !isQuiz && !isCode) {
                const videoTime = await getVideoTime(id, lesson.id);

                if (
                    videoTime?.time &&
                    videoTime.time < (lesson.duration || 9999) * 0.95 &&
                    !completedLessons.includes(lesson.id)
                ) {
                    setResumeVideoTime(videoTime.time);
                } else {
                    setResumeVideoTime(0);
                }
            } else {
                setResumeVideoTime(0);
            }
        } else {
            setResumeVideoTime(0);
        }
    };

    const handleQuizAnswerChange = (questionId, optionId) => {
        if (!activeLesson) return;
        setLessonQuizAnswers((prev) => ({
            ...prev,
            [activeLesson.id]: {
                ...(prev[activeLesson.id] || {}),
                [questionId]: optionId,
            },
        }));
    };

    const handleQuizRetake = () => {
        if (!activeLesson) return;
        setLessonQuizResults((prev) => {
            const next = { ...prev };
            delete next[activeLesson.id];
            return next;
        });
        setLessonQuizAnswers((prev) => ({
            ...prev,
            [activeLesson.id]: {},
        }));
    };

    const handleQuizSubmit = async (preparedAnswers = null) => {
        if (!activeLesson) return;
        const quiz = lessonQuizData[activeLesson.id];
        if (!quiz) return;

        let answersPayload;

        if (preparedAnswers) {
            const answeredQuestions = preparedAnswers.filter(
                (answer) => answer.optionId && !answer.isSkipped
            );

            if (answeredQuestions.length === 0) {
                toast.error('Сураныч, жок дегенде бир суроого жооп бериңиз.');
                return;
            }

            answersPayload = {
                answers: answeredQuestions.map((answer) => ({
                    questionId: answer.questionId,
                    optionId: answer.optionId,
                })),
            };
        } else {
            const currentAnswers = lessonQuizAnswers[activeLesson.id] || {};
            const unanswered = quiz.questions.some((question) => !currentAnswers[question.id]);

            if (unanswered) {
                toast.error('Бардык суроолорго жооп бериңиз.');
                return;
            }

            answersPayload = {
                answers: quiz.questions.map((question) => ({
                    questionId: question.id,
                    optionId: currentAnswers[question.id],
                })),
            };
        }

        setQuizSubmitting(true);
        try {
            const result = await submitLessonQuiz(
                id,
                activeLesson.sectionId,
                activeLesson.id,
                answersPayload
            );

            if (preparedAnswers) {
                const skippedQuestions = preparedAnswers.filter((answer) => answer.isSkipped);

                if (skippedQuestions.length > 0) {
                    const totalQuestions = quiz.questions.length;
                    const correctFromServer = result.correctAnswers || 0;
                    const totalFromServer = result.totalQuestions || totalQuestions;

                    const totalCorrect = correctFromServer;
                    const actualTotal = totalQuestions;
                    const newScore = Math.round((totalCorrect / actualTotal) * 100);

                    const updatedAnswers = [...(result.answers || [])];
                    skippedQuestions.forEach((skipped) => {
                        updatedAnswers.push({
                            questionId: skipped.questionId,
                            selectedOptionId: null,
                            isCorrect: false,
                            correctOptionId:
                                quiz.questions
                                    .find((q) => q.id === skipped.questionId)
                                    ?.options?.find((opt) => opt.isCorrect)?.id || null,
                        });
                    });

                    const updatedResult = {
                        ...result,
                        score: newScore,
                        correctAnswers: totalCorrect,
                        totalQuestions: actualTotal,
                        passed: newScore >= (result.passingScore || 70),
                        answers: updatedAnswers,
                    };

                    setLessonQuizResults((prev) => ({
                        ...prev,
                        [activeLesson.id]: updatedResult,
                    }));

                    toast.success(
                        updatedResult.passed
                            ? 'Куттуктайбыз! Квиз ийгиликтүү тапшырылды.'
                            : `Кайра аракет кылып көрүңүз. Сиз ${newScore}% түздүңүз.`
                    );

                    if (updatedResult.passed) {
                        setCompletedLessons((prev) => [...new Set([...prev, activeLesson.id])]);
                    }

                    return;
                }
            }

            setLessonQuizResults((prev) => ({ ...prev, [activeLesson.id]: result }));
            toast.success(
                result.passed
                    ? 'Куттуктайбыз! Квиз ийгиликтүү тапшырылды.'
                    : 'Кайра аракет кылып көрүңүз.'
            );
            setCompletedLessons((prev) => [...new Set([...prev, activeLesson.id])]);
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || 'Квизди тапшыруу мүмкүн болбоду');
        } finally {
            setQuizSubmitting(false);
        }
    };

    const handleChallengeCodeChange = (lessonId, value) => {
        setLessonChallengeCode((prev) => ({
            ...prev,
            [lessonId]: value,
        }));
        const existingResult = lessonChallengeResults[lessonId];
        saveChallengeStateToStorage(id, lessonId, {
            code: value,
            result: existingResult || null,
        });
    };

    const handleChallengeSubmit = async () => {
        if (!activeLesson) return;
        const challenge = lessonChallengeData[activeLesson.id];
        if (!challenge) return;
        const codeValue = lessonChallengeCode[activeLesson.id] ?? challenge.starterCode ?? '';

        setChallengeSubmitting(true);
        try {
            const result = await submitLessonChallenge(
                id,
                activeLesson.sectionId,
                activeLesson.id,
                { code: codeValue }
            );
            setLessonChallengeResults((prev) => ({ ...prev, [activeLesson.id]: result }));
            saveChallengeStateToStorage(id, activeLesson.id, {
                code: codeValue,
                result,
            });
            toast.success(result.passed ? 'Бардык тесттер өттү!' : 'Кээ бир тесттер өтпөй калды');
            setCompletedLessons((prev) => [...new Set([...prev, activeLesson.id])]);
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || 'Код тапшырма текшерилген жок');
        } finally {
            setChallengeSubmitting(false);
        }
    };

    const findPrevNextLessons = () => {
        const flatLessons = sections.flatMap((sec) => sec.lessons || []);
        const index = flatLessons.findIndex((l) => l.id === activeLesson?.id);
        const prev = flatLessons[index - 1];
        const next = flatLessons[index + 1];
        return { prev, next };
    };

    const handleEnded = async () => {
        if (
            !hasPlayedRef.current ||
            activeLesson?.kind === 'article' ||
            activeLesson?.kind === 'quiz' ||
            activeLesson?.kind === 'code'
        )
            return;
        if (user && enrolled && activeLesson) {
            console.log('Marking lesson as complete handleEnded');
            const resp = await markLessonComplete(
                Number(id),
                activeLesson.sectionId,
                activeLesson.id
            );
            if (resp.completed) {
                setCompletedLessons((prev) => [...new Set([...prev, activeLesson.id])]);
            }
        }
        const { next } = findPrevNextLessons();
        if (next) {
            handleLessonClick(next);
        }
    };

    const handleVideoProgress = useCallback(
        async (progress, lessonParam) => {
            if (
                lessonParam.kind === 'article' ||
                lessonParam.kind === 'quiz' ||
                lessonParam.kind === 'code'
            )
                return;

            if (!hasPlayedRef.current) {
                if (progress > 0) {
                    hasPlayedRef.current = true;
                } else {
                    return;
                }
            }

            if (
                enrolled &&
                lessonParam.id === activeLessonRef.current?.id &&
                hasPlayedRef.current &&
                progress >= 95 &&
                lessonParam.duration &&
                lessonParam.duration > 0 &&
                !completedLessons.includes(lessonParam.id)
            ) {
                console.log(`✅ Marking complete: ${lessonParam.title}, progress: ${progress}%`);
                const resp = await markLessonComplete(
                    Number(id),
                    lessonParam.sectionId,
                    lessonParam.id
                );
                if (resp.completed) {
                    setCompletedLessons((prev) => [...new Set([...prev, lessonParam.id])]);
                }
            }
        },
        [id, enrolled, completedLessons]
    );

    const handleCheckboxToggle = async (lesson) => {
        if (!enrolled) return;
        console.log('Marking lesson as complete handleCheckboxToggle');
        const response = await markLessonComplete(id, lesson.sectionId, lesson.id);
        if (response.completed) {
            setCompletedLessons((prev) => [...new Set([...prev, lesson.id])]);
        } else {
            if (lesson.kind === 'video') {
                await updateVideoTime({
                    courseId: Number(id),
                    lessonId: lesson.id,
                    time: 0,
                });
            }
            if (activeLesson?.id === lesson.id) {
                setResumeVideoTime(0);
            }
            setCompletedLessons((prev) => prev.filter((lId) => lId !== lesson.id));
        }
    };

    /* eslint-disable react-hooks/exhaustive-deps */
    useEffect(() => {
        const fetchCourse = async () => {
            try {
                let enrollment = { enrolled: false };
                if (user) {
                    if (user.role === 'student') {
                        enrollment = await fetchEnrollment(id, user.id);
                    } else {
                        enrollment = { enrolled: true };
                    }
                }
                setEnrolled(enrollment.enrolled);

                const data = await fetchCourseDetails(id);

                setCourse(data);
                const sectionData = await fetchSections(id);

                const updatedSections = sectionData.map((sec) => ({
                    ...sec,
                    lessons: sec.lessons
                        .slice()
                        .sort((a, b) => a.order - b.order)
                        .map((lesson) => ({
                            ...lesson,
                            kind: lesson.kind || 'video',
                            content: lesson.content || '',
                            resourceName: lesson.resourceName || '',
                            sectionId: sec.id,
                            locked: !enrollment.enrolled && !lesson.previewVideo,
                        })),
                }));

                setSections(updatedSections.sort((a, b) => a.order - b.order));

                if (enrollment.enrolled && user) {
                    const progress = await fetchUserProgress(id);
                    const completed = progress.completedLessonIds || [];
                    console.log('Setting completedLessons from progress:', completed);
                    setCompletedLessons(completed);
                }

                let lastLesson = null;
                if (user && enrollment.enrolled) {
                    const lastViewed = await getLastViewedLesson(id);
                    if (lastViewed?.lessonId) {
                        setLastViewedLessonId(lastViewed.lessonId);
                        for (let sec of updatedSections) {
                            for (let lesson of sec.lessons || []) {
                                if (lesson.id === lastViewed.lessonId) {
                                    lastLesson = lesson;
                                    break;
                                }
                            }
                            if (lastLesson) break;
                        }
                    }
                }

                if (!lastLesson) {
                    for (let sec of updatedSections) {
                        for (let lesson of sec.lessons || []) {
                            if (completedLessons.includes(lesson.id)) {
                                lastLesson = lesson;
                            }
                        }
                    }
                }

                if (!lastLesson && updatedSections.length > 0) {
                    lastLesson = updatedSections[0].lessons?.[0];
                }

                if (lastLesson?.id) {
                    setActiveLesson(lastLesson);
                    setActiveSectionId(lastLesson.sectionId);
                    localStorage.setItem(`active_section_${id}`, String(lastLesson.sectionId));
                    scrollToLesson(lastLesson.id);
                    if (lastLesson.kind === 'quiz') {
                        await loadQuizForLesson(lastLesson);
                    }
                    if (lastLesson.kind === 'code') {
                        await loadChallengeForLesson(lastLesson);
                    }
                    if (user && enrollment.enrolled && !lastLesson.locked) {
                        if (
                            lastLesson.kind === 'article' ||
                            lastLesson.kind === 'quiz' ||
                            lastLesson.kind === 'code'
                        ) {
                            setResumeVideoTime(0);
                        } else {
                            const videoTime = await getVideoTime(id, lastLesson.id);
                            if (
                                videoTime?.time &&
                                videoTime.time < 0.95 * (lastLesson.duration || 9999)
                            ) {
                                setResumeVideoTime(videoTime.time);
                            } else {
                                setResumeVideoTime(0);
                            }
                        }
                    } else {
                        // Для неавторизованных всегда начинаем с начала
                        setResumeVideoTime(0);
                    }
                }

                if (!lastLesson) {
                    const storedSection = localStorage.getItem(`active_section_${id}`);
                    const sectionIdToOpen = storedSection
                        ? Number(storedSection)
                        : updatedSections[0]?.id;
                    setActiveSectionId(sectionIdToOpen);
                }
            } catch (err) {
                setError(err.message || 'Курс жүктөлбөй калды.');
            } finally {
                setLoading(false);
            }
        };
        fetchCourse();
    }, [id, user]);
    /* eslint-enable react-hooks/exhaustive-deps */

    if (loading) return <div>Жүктөлүүдө...</div>;
    if (error) return <div>Ката: {error}</div>;
    if (!course) return <div>Курс табылган жок</div>;

    const { prev: prevLesson, next: nextLesson } = findPrevNextLessons();
    const totalLessons =
        course?.lessonCount ||
        sections.reduce((count, sec) => count + (sec.lessons?.length || 0), 0);
    const progress =
        totalLessons > 0 ? Math.round((completedLessons.length / totalLessons) * 100) : 0;

    const isCourseInstructor = Boolean(user && course?.instructor?.id === user.id);
    const isAdmin = user?.role === 'admin';
    const isAiAvailable = Boolean(
        course.aiAssistantEnabled && (enrolled || isCourseInstructor || isAdmin)
    );
    const assistantAvailableMessage = course.aiAssistantEnabled
        ? 'Ассистентти колдонуу үчүн курска жазылуу керек.'
        : 'EDU AI ассистенти бул курста өчүрүлгөн.';

    const tabs = [
        { id: 'program', label: 'Курстун программасы', disabled: false },
        { id: 'assistant', label: 'Edu AI Assistent', disabled: !isAiAvailable },
    ];

    const handleTabChange = (tab) => {
        if (tab.disabled) {
            toast.error('EDU AI азырынча бул курста жеткиликтүү эмес');
            return;
        }
        setActiveTab(tab.id);
    };

    const renderTabButtons = () => (
        <div className="flex flex-wrap gap-2 dark:bg-white/10 bg-gray-100 rounded-2xl p-1">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    type="button"
                    onClick={() => handleTabChange(tab)}
                    className={`flex-1 min-w-[140px] px-4 py-2 rounded-xl text-sm font-medium transition ${
                        activeTab === tab.id
                            ? 'dark:bg-[#222222] bg-white text-gray-900 dark:text-[#E8ECF3] shadow'
                            : 'text-gray-600 dark:text-[#a6adba]'
                    } ${tab.disabled ? 'opacity-60 cursor-not-allowed' : 'hover:text-gray-900'}`}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    );

    const lessonCount =
        course?.lessonCount ??
        sections.reduce((count, sec) => count + (sec.lessons?.length || 0), 0);

    return (
        <div className="min-h-screen pt-10 bg-[#f8f9fb] dark:bg-[#1A1A1A]">
            {/* Chat button - positioned absolutely in header */}
            {enrolled && (
                <div className="relative max-w-6xl mx-auto flex justify-end mb-10">
                    <button
                        className="flex w-[265px] h-[61px] opacity-100 rounded-[8px] border-[1px] p-[18px] gap-[10px]text-[#141619]"
                        onClick={() => setInstructorChat(true)}
                    >
                        <FaSignalMessenger className="text-[#EA580C]" /> Инструктор менен чат
                    </button>

                    {instructorChat && (
                        <div className="relative max-w-6xl mx-auto flex justify-end mb-10">
                            <button
                                className="flex w-[265px] h-[61px] opacity-100 rounded-[8px] border-[1px] p-[18px] gap-[10px] border-[#FB923C] bg-[#FFF7ED]"
                                onClick={() => setInstructorChat(true)}
                            >
                                <FaSignalMessenger className="text-[#EA580C]" /> Инструктор менен
                                чат
                            </button>

                            {/* Модалка чата */}
                            <div className="relative xl:w-10xl m-auto ">
                                <div className="z-10 xl:ml-[550px] xl:w-[600px] sm:h-[600px] h-[400px] md:w-[381px] w-[300px]  bg-white rounded-lg shadow-lg">
                                    <InstructorChat course={course} />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Main content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
                <div className="space-y-6 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-6">
                    {/* Mobile layouts */}
                    {enrolled ? (
                        <div className="space-y-6 lg:hidden">
                            {activeLesson &&
                                (activeLesson.kind === 'article' ? (
                                    <ArticleLessonViewer
                                        key={activeLesson.id}
                                        lesson={activeLesson}
                                    />
                                ) : activeLesson.kind === 'quiz' ? (
                                    <LessonQuizPlayer
                                        key={activeLesson.id}
                                        quiz={lessonQuizData[activeLesson.id]}
                                        answers={lessonQuizAnswers[activeLesson.id] || {}}
                                        onAnswerChange={handleQuizAnswerChange}
                                        onSubmit={handleQuizSubmit}
                                        onRetake={handleQuizRetake}
                                        submitting={quizSubmitting}
                                        disabled={!enrolled || activeLesson.locked}
                                        loading={quizLoading && !lessonQuizData[activeLesson.id]}
                                        result={lessonQuizResults[activeLesson.id]}
                                    />
                                ) : activeLesson.kind === 'code' ? (
                                    <LessonChallengePlayer
                                        key={activeLesson.id}
                                        challenge={lessonChallengeData[activeLesson.id]}
                                        code={
                                            lessonChallengeCode[activeLesson.id] ??
                                            lessonChallengeData[activeLesson.id]?.starterCode ??
                                            ''
                                        }
                                        onCodeChange={(newCode) =>
                                            handleChallengeCodeChange(activeLesson.id, newCode)
                                        }
                                        onSubmit={handleChallengeSubmit}
                                        submitting={challengeSubmitting}
                                        disabled={!enrolled || activeLesson.locked}
                                        loading={
                                            challengeLoading &&
                                            !lessonChallengeData[activeLesson.id]
                                        }
                                        result={lessonChallengeResults[activeLesson.id]}
                                    />
                                ) : (
                                    <CourseVideoPlayer
                                        key={activeLesson.id}
                                        activeLesson={activeLesson}
                                        resumeVideoTime={resumeVideoTime}
                                        handleVideoProgress={(progress) =>
                                            handleVideoProgress(progress, activeLesson)
                                        }
                                        handleTimeUpdate={handleTimeUpdate}
                                        handlePause={handlePause}
                                        videoRef={videoRef}
                                        nextLesson={nextLesson}
                                        prevLesson={prevLesson}
                                        onEnded={handleEnded}
                                        handleLessonClick={handleLessonClick}
                                    />
                                ))}
                            <CourseContent
                                sections={sections}
                                enrolled={enrolled}
                                onLessonClick={handleLessonClick}
                                activeLesson={activeLesson}
                                completedLessons={completedLessons}
                                lessonRefs={lessonRefs}
                                handleCheckboxToggle={handleCheckboxToggle}
                            />
                            <InstructorsInfo instructorData={course.instructor} />
                            <CourseReview
                                ratingAverage={course.ratingAverage}
                                ratingCount={course.ratingCount}
                                ratingBreakdown={course?.ratingBreakdown}
                            />
                            <Comment courseId={id} />
                        </div>
                    ) : (
                        <div className="space-y-6 lg:hidden">
                            <CardVideo
                                key={id}
                                course={course}
                                lessonCount={lessonCount}
                                coverImageUrl={course.coverImageUrl}
                            />
                            <CourseDescription course={course} />
                            <InstructorsInfo instructorData={course.instructor} />
                            <CourseContent sections={sections} />
                            <CourseReview
                                ratingAverage={course.ratingAverage}
                                ratingCount={course.ratingCount}
                                ratingBreakdown={course?.ratingBreakdown}
                            />
                        </div>
                    )}

                    {/* Desktop layout */}
                    <div className="hidden lg:block lg:col-span-2">
                        {enrolled ? (
                            <div className="space-y-8">
                                {activeLesson &&
                                    (activeLesson.kind === 'article' ? (
                                        <ArticleLessonViewer
                                            key={activeLesson.id}
                                            lesson={activeLesson}
                                        />
                                    ) : activeLesson.kind === 'quiz' ? (
                                        <LessonQuizPlayer
                                            key={activeLesson.id}
                                            quiz={lessonQuizData[activeLesson.id]}
                                            answers={lessonQuizAnswers[activeLesson.id] || {}}
                                            onAnswerChange={handleQuizAnswerChange}
                                            onSubmit={handleQuizSubmit}
                                            onRetake={handleQuizRetake}
                                            submitting={quizSubmitting}
                                            disabled={!enrolled || activeLesson.locked}
                                            loading={
                                                quizLoading && !lessonQuizData[activeLesson.id]
                                            }
                                            result={lessonQuizResults[activeLesson.id]}
                                        />
                                    ) : activeLesson.kind === 'code' ? (
                                        <LessonChallengePlayer
                                            key={activeLesson.id}
                                            challenge={lessonChallengeData[activeLesson.id]}
                                            code={
                                                lessonChallengeCode[activeLesson.id] ??
                                                lessonChallengeData[activeLesson.id]?.starterCode ??
                                                ''
                                            }
                                            onCodeChange={(newCode) =>
                                                handleChallengeCodeChange(activeLesson.id, newCode)
                                            }
                                            onSubmit={handleChallengeSubmit}
                                            submitting={challengeSubmitting}
                                            disabled={!enrolled || activeLesson.locked}
                                            loading={
                                                challengeLoading &&
                                                !lessonChallengeData[activeLesson.id]
                                            }
                                            result={lessonChallengeResults[activeLesson.id]}
                                        />
                                    ) : (
                                        <CourseVideoPlayer
                                            key={activeLesson.id}
                                            activeLesson={activeLesson}
                                            resumeVideoTime={resumeVideoTime}
                                            handleVideoProgress={(progress) =>
                                                handleVideoProgress(progress, activeLesson)
                                            }
                                            handleTimeUpdate={handleTimeUpdate}
                                            handlePause={handlePause}
                                            videoRef={videoRef}
                                            nextLesson={nextLesson}
                                            prevLesson={prevLesson}
                                            onEnded={handleEnded}
                                            handleLessonClick={handleLessonClick}
                                        />
                                    ))}
                            </div>
                        ) : (
                            <div className="space-y-8">
                                <CourseDescription course={course} />
                                <InstructorsInfo instructorData={course.instructor} />
                                <CourseContent sections={sections} />
                            </div>
                        )}
                    </div>

                    {/* Right sidebar - desktop */}
                    <div className="hidden lg:block lg:col-span-1">
                        <div className="space-y-6 sticky top-6">
                            {enrolled ? (
                                <div className="bg-white p-5 rounded-xl shadow-sm">
                                    <div className="mb-5">{renderTabButtons()}</div>
                                    {activeTab === 'program' ? (
                                        <CourseContent
                                            sections={sections}
                                            enrolled={enrolled}
                                            onLessonClick={handleLessonClick}
                                            activeLesson={activeLesson}
                                            completedLessons={completedLessons}
                                            lessonRefs={lessonRefs}
                                            showHeader={false}
                                            handleCheckboxToggle={handleCheckboxToggle}
                                        />
                                    ) : (
                                        <div className="bg-white">
                                            {isAiAvailable ? (
                                                <AiAssistantPanel
                                                    courseId={Number(id)}
                                                    languageCode={course.languageCode}
                                                />
                                            ) : (
                                                <div className="text-center text-gray-500 text-sm p-4">
                                                    {assistantAvailableMessage}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <>
                                    <CardVideo
                                        key={id}
                                        course={course}
                                        lessonCount={lessonCount}
                                        coverImageUrl={course.coverImageUrl}
                                    />
                                    <CourseReview
                                        ratingAverage={course.ratingAverage}
                                        ratingCount={course.ratingCount}
                                        ratingBreakdown={course?.ratingBreakdown}
                                    />
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Additional sections for enrolled users */}
                {enrolled && (
                    <div className="space-y-8 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-6">
                        <div className="lg:col-span-2">
                            <InstructorsInfo instructorData={course.instructor} />
                        </div>
                        <div className="lg:col-span-1">
                            <CourseReview
                                ratingAverage={course.ratingAverage}
                                ratingCount={course.ratingCount}
                                ratingBreakdown={course?.ratingBreakdown}
                            />
                        </div>
                    </div>
                )}

                {/* Comments section */}
                {enrolled && (
                    <div className="pt-6">
                        <Comment courseId={id} />
                    </div>
                )}
            </div>
        </div>
    );
};
export default CourseDetailsPage;
