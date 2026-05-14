import { useState, useEffect, useRef, useCallback, useContext, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Link, useParams, useSearchParams } from 'react-router-dom';
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
import { isPlatformAdmin } from '@shared/utils/roles';
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
import InstructorChat from '@features/instructorChat/InstructorChat';
import { HiChatAlt2 } from 'react-icons/hi';
import Loader from '@shared/ui/Loader';
import { isForbiddenError, parseApiError } from '@shared/api/error';
import { isCourseFeatureEnabled, TENANT_FEATURES } from '@shared/utils/tenantFeatures';
import {
    addSkippedQuestionsToQuizResult,
    buildQuizAnswersPayload,
    findAdjacentLessons,
    findLessonById,
    getStoredActiveSectionId,
    isRuntimeActivityLesson,
    loadChallengeStateFromStorage,
    normalizeCourseSections,
    parseResumeParams,
    saveActiveSectionId,
    saveChallengeStateToStorage,
    selectInitialLesson,
    shouldUseSavedVideoTime,
} from '@features/courses/course-details/courseDetailsUtils';

const useLessonQuiz = ({ courseId, activeLesson, onEnrollmentAccessError, onLessonComplete }) => {
    const [lessonQuizData, setLessonQuizData] = useState({});
    const [lessonQuizAnswers, setLessonQuizAnswers] = useState({});
    const [lessonQuizResults, setLessonQuizResults] = useState({});
    const [quizLoading, setQuizLoading] = useState(false);
    const [quizSubmitting, setQuizSubmitting] = useState(false);

    const loadQuizForLesson = useCallback(
        async (lesson) => {
            if (lessonQuizData[lesson.id]) return;
            setQuizLoading(true);
            try {
                const quiz = await fetchLessonQuiz(courseId, lesson.sectionId, lesson.id);
                setLessonQuizData((prev) => ({ ...prev, [lesson.id]: quiz }));
                setLessonQuizAnswers((prev) => ({ ...prev, [lesson.id]: {} }));
            } catch (err) {
                if (
                    onEnrollmentAccessError(
                        err,
                        'Квизге жетүү үчүн курска активдүү жеткиликтүүлүк керек.'
                    )
                ) {
                    return;
                }
                console.error(err);
                const message = err.response?.data?.message || 'Квиз жүктөлбөй калды';
                toast.error(message);
            } finally {
                setQuizLoading(false);
            }
        },
        [courseId, lessonQuizData, onEnrollmentAccessError]
    );

    const handleQuizAnswerChange = useCallback(
        (questionId, optionId) => {
            if (!activeLesson) return;
            setLessonQuizAnswers((prev) => ({
                ...prev,
                [activeLesson.id]: {
                    ...(prev[activeLesson.id] || {}),
                    [questionId]: optionId,
                },
            }));
        },
        [activeLesson]
    );

    const handleQuizRetake = useCallback(() => {
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
    }, [activeLesson]);

    const handleQuizSubmit = useCallback(
        async (preparedAnswers = null) => {
            if (!activeLesson) return;
            const quiz = lessonQuizData[activeLesson.id];
            if (!quiz) return;

            const {
                payload: answersPayload,
                hasAnsweredQuestions,
                hasUnansweredQuestions,
            } = buildQuizAnswersPayload({
                quiz,
                currentAnswers: lessonQuizAnswers[activeLesson.id] || {},
                preparedAnswers,
            });

            if (preparedAnswers && !hasAnsweredQuestions) {
                toast.error('Сураныч, жок дегенде бир суроого жооп бериңиз.');
                return;
            }

            if (!preparedAnswers && hasUnansweredQuestions) {
                toast.error('Бардык суроолорго жооп бериңиз.');
                return;
            }

            setQuizSubmitting(true);
            try {
                const result = await submitLessonQuiz(
                    courseId,
                    activeLesson.sectionId,
                    activeLesson.id,
                    answersPayload
                );

                if (preparedAnswers) {
                    const updatedResult = addSkippedQuestionsToQuizResult({
                        quiz,
                        result,
                        preparedAnswers,
                    });

                    if (updatedResult !== result) {
                        setLessonQuizResults((prev) => ({
                            ...prev,
                            [activeLesson.id]: updatedResult,
                        }));

                        toast.success(
                            updatedResult.passed
                                ? 'Куттуктайбыз! Квиз ийгиликтүү тапшырылды.'
                                : `Кайра аракет кылып көрүңүз. Сиз ${updatedResult.score}% түздүңүз.`
                        );

                        if (updatedResult.passed) {
                            onLessonComplete(activeLesson.id);
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
                onLessonComplete(activeLesson.id);
            } catch (err) {
                if (
                    onEnrollmentAccessError(
                        err,
                        'Квизди тапшыруу үчүн курска активдүү жеткиликтүүлүк керек.'
                    )
                ) {
                    return;
                }
                console.error(err);
                toast.error(err.response?.data?.message || 'Квизди тапшыруу мүмкүн болбоду');
            } finally {
                setQuizSubmitting(false);
            }
        },
        [
            activeLesson,
            courseId,
            lessonQuizAnswers,
            lessonQuizData,
            onEnrollmentAccessError,
            onLessonComplete,
        ]
    );

    return {
        activeQuiz: activeLesson?.kind === 'quiz' ? lessonQuizData[activeLesson.id] : null,
        lessonQuizAnswers,
        lessonQuizResults,
        quizLoading,
        quizSubmitting,
        loadQuizForLesson,
        handleQuizAnswerChange,
        handleQuizRetake,
        handleQuizSubmit,
    };
};

const useLessonChallenge = ({
    courseId,
    activeLesson,
    onEnrollmentAccessError,
    onLessonComplete,
}) => {
    const [lessonChallengeData, setLessonChallengeData] = useState({});
    const [lessonChallengeCode, setLessonChallengeCode] = useState({});
    const [lessonChallengeResults, setLessonChallengeResults] = useState({});
    const [challengeLoading, setChallengeLoading] = useState(false);
    const [challengeSubmitting, setChallengeSubmitting] = useState(false);

    const loadChallengeForLesson = useCallback(
        async (lesson) => {
            if (lessonChallengeData[lesson.id]) return lessonChallengeData[lesson.id];
            setChallengeLoading(true);
            try {
                const challenge = await fetchLessonChallenge(courseId, lesson.sectionId, lesson.id);
                setLessonChallengeData((prev) => ({ ...prev, [lesson.id]: challenge }));

                const savedState = loadChallengeStateFromStorage(courseId, lesson.id);
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
                if (
                    onEnrollmentAccessError(
                        err,
                        'Код тапшырмага жетүү үчүн курска активдүү жеткиликтүүлүк керек.'
                    )
                ) {
                    return null;
                }
                console.error(err);
                const message = err.response?.data?.message || 'Код тапшырма жүктөлбөй калды';
                toast.error(message);
                return null;
            } finally {
                setChallengeLoading(false);
            }
        },
        [courseId, lessonChallengeData, onEnrollmentAccessError]
    );

    const handleChallengeCodeChange = useCallback(
        (lessonId, value) => {
            setLessonChallengeCode((prev) => ({
                ...prev,
                [lessonId]: value,
            }));
            const existingResult = lessonChallengeResults[lessonId];
            saveChallengeStateToStorage(courseId, lessonId, {
                code: value,
                result: existingResult || null,
            });
        },
        [courseId, lessonChallengeResults]
    );

    const handleChallengeSubmit = useCallback(async () => {
        if (!activeLesson) return;
        const challenge = lessonChallengeData[activeLesson.id];
        if (!challenge) return;
        const codeValue = lessonChallengeCode[activeLesson.id] ?? challenge.starterCode ?? '';

        setChallengeSubmitting(true);
        try {
            const result = await submitLessonChallenge(
                courseId,
                activeLesson.sectionId,
                activeLesson.id,
                { code: codeValue }
            );
            setLessonChallengeResults((prev) => ({ ...prev, [activeLesson.id]: result }));
            saveChallengeStateToStorage(courseId, activeLesson.id, {
                code: codeValue,
                result,
            });
            toast.success(result.passed ? 'Бардык тесттер өттү!' : 'Кээ бир тесттер өтпөй калды');
            onLessonComplete(activeLesson.id);
        } catch (err) {
            if (
                onEnrollmentAccessError(
                    err,
                    'Код тапшырманы тапшыруу үчүн курска активдүү жеткиликтүүлүк керек.'
                )
            ) {
                return;
            }
            console.error(err);
            toast.error(err.response?.data?.message || 'Код тапшырма текшерилген жок');
        } finally {
            setChallengeSubmitting(false);
        }
    }, [
        activeLesson,
        courseId,
        lessonChallengeCode,
        lessonChallengeData,
        onEnrollmentAccessError,
        onLessonComplete,
    ]);

    return {
        activeChallenge:
            activeLesson?.kind === 'code' ? lessonChallengeData[activeLesson.id] : null,
        lessonChallengeCode,
        lessonChallengeResults,
        challengeLoading,
        challengeSubmitting,
        loadChallengeForLesson,
        handleChallengeCodeChange,
        handleChallengeSubmit,
    };
};

const useArticleAutoComplete = ({
    courseId,
    activeLesson,
    completedLessons,
    enrolled,
    onEnrollmentAccessError,
    onLessonComplete,
}) => {
    useEffect(() => {
        if (!enrolled || !activeLesson || activeLesson.kind !== 'article' || activeLesson.locked) {
            return undefined;
        }
        if (completedLessons.includes(activeLesson.id)) return undefined;

        const timer = setTimeout(async () => {
            try {
                const resp = await markLessonComplete(
                    Number(courseId),
                    activeLesson.sectionId,
                    activeLesson.id
                );
                if (resp.completed) {
                    onLessonComplete(activeLesson.id);
                }
            } catch (err) {
                if (
                    onEnrollmentAccessError(
                        err,
                        'Бул сабакты белгилөө үчүн курска активдүү жеткиликтүүлүк керек.'
                    )
                ) {
                    return;
                }
                console.error('Failed to auto-complete article', err);
            }
        }, 30000);

        return () => clearTimeout(timer);
    }, [
        activeLesson,
        completedLessons,
        courseId,
        enrolled,
        onEnrollmentAccessError,
        onLessonComplete,
    ]);
};

const useCourseVideoProgress = ({
    courseId,
    user,
    enrolled,
    activeLesson,
    activeLessonRef,
    completedLessons,
    hasPlayedRef,
    markingCompleteRef,
    sections,
    videoRef,
    onEnrollmentAccessError,
    onLessonClick,
    onLessonComplete,
    onPersistVideoTime,
}) => {
    const debouncedTimeUpdate = useMemo(
        () => debounce((time) => {
            if (
                user &&
                enrolled &&
                activeLessonRef.current?.id &&
                activeLessonRef.current?.kind === 'video'
            ) {
                onPersistVideoTime(
                    activeLessonRef.current.id,
                    time,
                    'Видеонун жүрүшүн сактоо үчүн курска активдүү жеткиликтүүлүк керек.'
                );
            }
        }, 3000),
        [activeLessonRef, enrolled, onPersistVideoTime, user]
    );

    useEffect(() => () => debouncedTimeUpdate.cancel(), [debouncedTimeUpdate]);

    const handleTimeUpdate = useCallback(
        async (time) => {
            if (user && enrolled && activeLessonRef.current?.kind === 'video') {
                debouncedTimeUpdate(time);
            }

            if (time > 0) {
                hasPlayedRef.current = true;
            }

            const duration =
                videoRef.current?.duration ||
                activeLessonRef.current?.duration ||
                activeLesson?.duration;
            if (
                enrolled &&
                activeLessonRef.current &&
                duration &&
                duration > 0 &&
                time / duration >= 0.95 &&
                !completedLessons.includes(activeLessonRef.current.id) &&
                !markingCompleteRef.current
            ) {
                try {
                    markingCompleteRef.current = true;
                    const resp = await markLessonComplete(
                        Number(courseId),
                        activeLessonRef.current.sectionId,
                        activeLessonRef.current.id
                    );
                    if (resp.completed) {
                        onLessonComplete(activeLessonRef.current.id);
                    }
                } catch (err) {
                    if (
                        onEnrollmentAccessError(
                            err,
                            'Сабакты аяктоо үчүн курска активдүү жеткиликтүүлүк керек.'
                        )
                    ) {
                        return;
                    }
                    console.error('Failed to mark lesson complete from video progress', err);
                } finally {
                    markingCompleteRef.current = false;
                }
            }
        },
        [
            activeLesson,
            activeLessonRef,
            completedLessons,
            courseId,
            debouncedTimeUpdate,
            enrolled,
            hasPlayedRef,
            markingCompleteRef,
            onEnrollmentAccessError,
            onLessonComplete,
            user,
            videoRef,
        ]
    );

    const handlePause = useCallback(
        (currentTime, duration) => {
            if (currentTime < duration * 0.9) return;

            if (user && enrolled && activeLessonRef.current?.kind === 'video') {
                onPersistVideoTime(
                    activeLessonRef.current.id,
                    currentTime,
                    'Видеонун жүрүшүн сактоо үчүн курска активдүү жеткиликтүүлүк керек.'
                );
            }
        },
        [activeLessonRef, enrolled, onPersistVideoTime, user]
    );

    const handleEnded = useCallback(async () => {
        if (!hasPlayedRef.current || isRuntimeActivityLesson(activeLesson)) return;
        if (user && enrolled && activeLesson && !markingCompleteRef.current) {
            try {
                markingCompleteRef.current = true;
                const resp = await markLessonComplete(
                    Number(courseId),
                    activeLesson.sectionId,
                    activeLesson.id
                );
                if (resp.completed) {
                    onLessonComplete(activeLesson.id);
                }
            } catch (err) {
                if (
                    onEnrollmentAccessError(
                        err,
                        'Сабакты аяктоо үчүн курска активдүү жеткиликтүүлүк керек.'
                    )
                ) {
                    return;
                }
                throw err;
            } finally {
                markingCompleteRef.current = false;
            }
        }
        const { next } = findAdjacentLessons(sections, activeLesson?.id);
        if (next) {
            onLessonClick(next);
        }
    }, [
        activeLesson,
        courseId,
        enrolled,
        hasPlayedRef,
        markingCompleteRef,
        onEnrollmentAccessError,
        onLessonClick,
        onLessonComplete,
        sections,
        user,
    ]);

    const handleVideoProgress = useCallback(
        (progress) => {
            if (progress > 0) {
                hasPlayedRef.current = true;
            }
        },
        [hasPlayedRef]
    );

    return {
        handleTimeUpdate,
        handlePause,
        handleEnded,
        handleVideoProgress,
    };
};

const useInitialCourseDetailsLoad = ({
    courseId,
    searchParams,
    user,
    applyEnrollmentState,
    handleEnrollmentAccessError,
    loadQuizForLesson,
    loadChallengeForLesson,
    scrollToLesson,
    setCourse,
    setSections,
    setCompletedLessons,
    setActiveLesson,
    setActiveSectionId,
    setResumeVideoTime,
    setLoading,
    setError,
}) => {
    /* eslint-disable react-hooks/exhaustive-deps */
    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const { resumeLessonId, resumeTimeSeconds } = parseResumeParams(searchParams);
                let enrollment = { enrolled: false };
                if (user) {
                    if (user.role === 'student') {
                        enrollment = await fetchEnrollment(courseId, user.id);
                    } else {
                        enrollment = { enrolled: true };
                    }
                }
                applyEnrollmentState(enrollment.enrolled);

                const data = await fetchCourseDetails(courseId);

                setCourse(data);
                const sectionData = await fetchSections(courseId);

                const updatedSections = normalizeCourseSections(sectionData, enrollment.enrolled);

                setSections(updatedSections);

                let completedLessonIds = [];
                if (enrollment.enrolled && user) {
                    try {
                        const progress = await fetchUserProgress(courseId);
                        completedLessonIds = progress.completedLessonIds || [];
                        setCompletedLessons(completedLessonIds);
                    } catch (err) {
                        if (
                            !handleEnrollmentAccessError(
                                err,
                                'Курстун прогрессин көрүү үчүн активдүү жеткиликтүүлүк керек.'
                            )
                        ) {
                            throw err;
                        }
                        enrollment = { enrolled: false };
                    }
                }

                let lastViewedLessonId = null;
                if (
                    user &&
                    enrollment.enrolled &&
                    !findLessonById(updatedSections, resumeLessonId)
                ) {
                    try {
                        const lastViewed = await getLastViewedLesson(courseId);
                        if (lastViewed?.lessonId) {
                            lastViewedLessonId = lastViewed.lessonId;
                        }
                    } catch (err) {
                        if (
                            !handleEnrollmentAccessError(
                                err,
                                'Соңку көрүлгөн сабакты алуу үчүн активдүү жеткиликтүүлүк керек.'
                            )
                        ) {
                            throw err;
                        }
                        enrollment = { enrolled: false };
                    }
                }

                const { lesson: lastLesson, fromResumeParam: hasResumeParam } = selectInitialLesson(
                    {
                        sections: updatedSections,
                        resumeLessonId,
                        lastViewedLessonId,
                        completedLessonIds,
                    }
                );

                if (lastLesson?.id) {
                    setActiveLesson(lastLesson);
                    setActiveSectionId(lastLesson.sectionId);
                    saveActiveSectionId(courseId, lastLesson.sectionId);
                    scrollToLesson(lastLesson.id);
                    if (lastLesson.kind === 'quiz') {
                        await loadQuizForLesson(lastLesson);
                    }
                    if (lastLesson.kind === 'code') {
                        await loadChallengeForLesson(lastLesson);
                    }
                    if (hasResumeParam) {
                        setResumeVideoTime(
                            resumeTimeSeconds && resumeTimeSeconds > 0 ? resumeTimeSeconds : 0
                        );
                    } else if (user && enrollment.enrolled && !lastLesson.locked) {
                        if (isRuntimeActivityLesson(lastLesson)) {
                            setResumeVideoTime(0);
                        } else {
                            try {
                                const videoTime = await getVideoTime(courseId, lastLesson.id);
                                if (shouldUseSavedVideoTime(videoTime, lastLesson)) {
                                    setResumeVideoTime(videoTime.time);
                                } else {
                                    setResumeVideoTime(0);
                                }
                            } catch (err) {
                                if (
                                    !handleEnrollmentAccessError(
                                        err,
                                        'Видеону улантуу үчүн активдүү жеткиликтүүлүк керек.'
                                    )
                                ) {
                                    throw err;
                                }
                            }
                        }
                    } else {
                        setResumeVideoTime(0);
                    }
                }

                if (!lastLesson) {
                    const sectionIdToOpen =
                        getStoredActiveSectionId(courseId) || updatedSections[0]?.id;
                    setActiveSectionId(sectionIdToOpen);
                }
            } catch (err) {
                setError(err.message || 'Курс жүктөлбөй калды.');
            } finally {
                setLoading(false);
            }
        };
        fetchCourse();
    }, [courseId, user, applyEnrollmentState, handleEnrollmentAccessError]);
    /* eslint-enable react-hooks/exhaustive-deps */
};

const useCourseDetailsLayoutMetrics = (activeLesson) => {
    const [videoHeight, setVideoHeight] = useState(0);
    const [isDesktop, setIsDesktop] = useState(
        typeof window !== 'undefined' ? window.innerWidth >= 1024 : false
    );
    const videoContainerRef = useRef(null);

    useEffect(() => {
        if (typeof window === 'undefined') return undefined;

        const updateVideoHeight = () => {
            if (videoContainerRef.current) {
                const height = videoContainerRef.current.offsetHeight;
                setVideoHeight(height);
            }
        };

        const updateBreakpoint = () => {
            setIsDesktop(window.innerWidth >= 1024);
        };

        updateVideoHeight();
        updateBreakpoint();

        const handleResize = debounce(() => {
            updateVideoHeight();
            updateBreakpoint();
        }, 100);

        window.addEventListener('resize', handleResize);

        const resizeObserver =
            typeof ResizeObserver !== 'undefined'
                ? new ResizeObserver(() => {
                      updateVideoHeight();
                  })
                : null;

        if (videoContainerRef.current) {
            resizeObserver?.observe(videoContainerRef.current);
        }

        return () => {
            window.removeEventListener('resize', handleResize);
            handleResize.cancel();
            resizeObserver?.disconnect();
        };
    }, [activeLesson]);

    return { videoHeight, isDesktop, videoContainerRef };
};

const InstructorChatDock = ({ enrolled, userRole, course }) => {
    const [instructorChat, setInstructorChat] = useState(false);
    const chatRef = useRef(null);
    const buttonRef = useRef(null);
    const chatButtonRef = useRef(null);
    const chatPanelRef = useRef(null);
    const focusBeforeChatRef = useRef(null);

    const closeInstructorChat = useCallback((restoreFocus = true) => {
        setInstructorChat(false);

        if (restoreFocus && typeof window !== 'undefined') {
            window.requestAnimationFrame(() => {
                const focusTarget = chatButtonRef.current || focusBeforeChatRef.current;
                focusTarget?.focus?.();
            });
        }
    }, []);

    const toggleInstructorChat = useCallback(() => {
        if (instructorChat) {
            closeInstructorChat();
            return;
        }

        focusBeforeChatRef.current = document.activeElement;
        setInstructorChat(true);
    }, [closeInstructorChat, instructorChat]);

    useEffect(() => {
        if (!instructorChat) return undefined;

        const handleClickOutside = (event) => {
            if (
                chatRef.current &&
                !chatRef.current.contains(event.target) &&
                buttonRef.current &&
                !buttonRef.current.contains(event.target)
            ) {
                closeInstructorChat(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [closeInstructorChat, instructorChat]);

    useEffect(() => {
        if (!instructorChat || typeof window === 'undefined') return undefined;

        const focusTimer = window.requestAnimationFrame(() => {
            chatPanelRef.current?.focus();
        });

        return () => window.cancelAnimationFrame(focusTimer);
    }, [instructorChat]);

    useEffect(() => {
        if (!instructorChat) return undefined;

        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                closeInstructorChat();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [closeInstructorChat, instructorChat]);

    if (!enrolled) return null;

    return (
        <>
            {userRole === 'student' && (
                <div className="fixed top-20 right-4 z-50" ref={buttonRef}>
                    <button
                        ref={chatButtonRef}
                        type="button"
                        className={`instructor-chat-button mt-10 mr-4 flex items-center justify-center w-16 h-16 rounded-full border-2 transition-all shadow-lg hover:shadow-xl ${
                            instructorChat
                                ? 'border-[#FB923C] bg-[#FFF7ED]'
                                : 'border-gray-300 bg-white hover:bg-gray-50 dark:bg-[#1A1A1A]'
                        }`}
                        onClick={toggleInstructorChat}
                        aria-label={
                            instructorChat
                                ? 'Окутуучу менен чатты жабуу'
                                : 'Окутуучу менен чатты ачуу'
                        }
                        aria-expanded={instructorChat}
                        aria-controls="instructor-chat-panel"
                    >
                        <HiChatAlt2 className="w-8 h-8 text-[#EA580C]" aria-hidden="true" />
                    </button>
                </div>
            )}

            {instructorChat && course && (
                <div ref={chatRef} className="fixed top-36 right-4 z-40">
                    <div className="w-[400px] h-[600px]">
                        <div
                            id="instructor-chat-panel"
                            ref={chatPanelRef}
                            role="dialog"
                            aria-modal="false"
                            aria-label="Окутуучу менен чат"
                            tabIndex={-1}
                            className="h-full outline-none"
                        >
                            <InstructorChat course={course} onClose={closeInstructorChat} />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

InstructorChatDock.propTypes = {
    enrolled: PropTypes.bool.isRequired,
    userRole: PropTypes.string,
    course: PropTypes.shape({}),
};

const ActiveLessonRuntime = ({
    activeLesson,
    activeQuiz,
    activeChallenge,
    lessonQuizAnswers,
    lessonQuizResults,
    lessonChallengeCode,
    lessonChallengeResults,
    resumeVideoTime,
    enrolled,
    quizLoading,
    quizSubmitting,
    challengeLoading,
    challengeSubmitting,
    videoRef,
    nextLesson,
    prevLesson,
    onQuizAnswerChange,
    onQuizSubmit,
    onQuizRetake,
    onChallengeCodeChange,
    onChallengeSubmit,
    onVideoProgress,
    onTimeUpdate,
    onPause,
    onEnded,
    onLessonClick,
}) => {
    if (!activeLesson) return null;

    if (activeLesson.kind === 'article') {
        return <ArticleLessonViewer key={activeLesson.id} lesson={activeLesson} />;
    }

    if (activeLesson.kind === 'quiz') {
        return activeQuiz ? (
            <LessonQuizPlayer
                key={activeLesson.id}
                quiz={activeQuiz}
                answers={lessonQuizAnswers[activeLesson.id] || {}}
                onAnswerChange={onQuizAnswerChange}
                onSubmit={onQuizSubmit}
                onRetake={onQuizRetake}
                submitting={quizSubmitting}
                disabled={!enrolled || activeLesson.locked}
                loading={quizLoading && !activeQuiz}
                result={lessonQuizResults[activeLesson.id]}
            />
        ) : (
            <div className="flex justify-center py-10">
                <Loader />
            </div>
        );
    }

    if (activeLesson.kind === 'code') {
        return activeChallenge ? (
            <LessonChallengePlayer
                key={activeLesson.id}
                challenge={activeChallenge}
                code={lessonChallengeCode[activeLesson.id] ?? activeChallenge?.starterCode ?? ''}
                onCodeChange={(newCode) => onChallengeCodeChange(activeLesson.id, newCode)}
                onSubmit={onChallengeSubmit}
                submitting={challengeSubmitting}
                disabled={!enrolled || activeLesson.locked}
                loading={challengeLoading && !activeChallenge}
                result={lessonChallengeResults[activeLesson.id]}
            />
        ) : (
            <div className="flex justify-center py-10">
                <Loader />
            </div>
        );
    }

    return (
        <CourseVideoPlayer
            key={activeLesson.id}
            activeLesson={activeLesson}
            resumeVideoTime={resumeVideoTime}
            handleVideoProgress={(progress) => onVideoProgress(progress, activeLesson)}
            handleTimeUpdate={onTimeUpdate}
            handlePause={onPause}
            videoRef={videoRef}
            nextLesson={nextLesson}
            prevLesson={prevLesson}
            onEnded={onEnded}
            handleLessonClick={onLessonClick}
        />
    );
};

ActiveLessonRuntime.propTypes = {
    activeLesson: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
        kind: PropTypes.string,
        locked: PropTypes.bool,
    }),
    activeQuiz: PropTypes.shape({}),
    activeChallenge: PropTypes.shape({
        starterCode: PropTypes.string,
    }),
    lessonQuizAnswers: PropTypes.objectOf(PropTypes.shape({})).isRequired,
    lessonQuizResults: PropTypes.objectOf(PropTypes.shape({})).isRequired,
    lessonChallengeCode: PropTypes.objectOf(PropTypes.string).isRequired,
    lessonChallengeResults: PropTypes.objectOf(PropTypes.shape({})).isRequired,
    resumeVideoTime: PropTypes.number.isRequired,
    enrolled: PropTypes.bool.isRequired,
    quizLoading: PropTypes.bool.isRequired,
    quizSubmitting: PropTypes.bool.isRequired,
    challengeLoading: PropTypes.bool.isRequired,
    challengeSubmitting: PropTypes.bool.isRequired,
    videoRef: PropTypes.shape({
        current: PropTypes.object,
    }).isRequired,
    nextLesson: PropTypes.shape({}),
    prevLesson: PropTypes.shape({}),
    onQuizAnswerChange: PropTypes.func.isRequired,
    onQuizSubmit: PropTypes.func.isRequired,
    onQuizRetake: PropTypes.func.isRequired,
    onChallengeCodeChange: PropTypes.func.isRequired,
    onChallengeSubmit: PropTypes.func.isRequired,
    onVideoProgress: PropTypes.func.isRequired,
    onTimeUpdate: PropTypes.func.isRequired,
    onPause: PropTypes.func.isRequired,
    onEnded: PropTypes.func.isRequired,
    onLessonClick: PropTypes.func.isRequired,
};

const CourseDetailsSidebar = ({
    enrolled,
    tabs,
    activeTab,
    onTabChange,
    sections,
    activeLesson,
    completedLessons,
    lessonRefs,
    maxHeight,
    onLessonClick,
    onCheckboxToggle,
    isAiAvailable,
    assistantAvailableMessage,
    courseId,
    languageCode,
    course,
    lessonCount,
    reviewNode,
}) => {
    const renderTabButtons = () => (
        <div className="flex flex-wrap gap-2 dark:bg-white/10 bg-gray-100 rounded-2xl p-1">
            {tabs?.map((tab) => (
                <button
                    key={tab.id}
                    type="button"
                    onClick={() => onTabChange(tab)}
                    className={`flex-1 min-w-[140px] px-4 py-2 rounded-xl text-sm font-medium transition ${
                        activeTab === tab.id
                            ? 'dark:bg-[#222222] bg-white text-gray-900 dark:text-[#E8ECF3] shadow'
                            : 'text-gray-600 dark:text-[#a6adba]'
                    }`}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    );

    return (
        <div className="hidden lg:block lg:col-span-1">
            <div className="space-y-6 sticky top-6">
                {enrolled ? (
                    <div className="bg-white dark:bg-[#1A1A1A] p-5 rounded-xl shadow-sm dark:shadow-gray-900/50 border border-[#E6E8EC] dark:border-[#2A2E35]">
                        <div className="mb-5">{renderTabButtons()}</div>
                        {activeTab === 'program' ? (
                            <CourseContent
                                sections={sections}
                                enrolled={enrolled}
                                onLessonClick={onLessonClick}
                                activeLesson={activeLesson}
                                completedLessons={completedLessons}
                                lessonRefs={lessonRefs}
                                showHeader={false}
                                handleCheckboxToggle={onCheckboxToggle}
                                maxHeight={maxHeight}
                            />
                        ) : (
                            <div className="bg-white">
                                {isAiAvailable ? (
                                    <AiAssistantPanel
                                        courseId={Number(courseId)}
                                        languageCode={languageCode}
                                    />
                                ) : (
                                    <div className="text-center text-gray-500 dark:text-gray-400 text-sm p-4">
                                        {assistantAvailableMessage}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ) : (
                    <>
                        <CardVideo
                            key={courseId}
                            course={course}
                            lessonCount={lessonCount}
                            coverImageUrl={course.coverImageUrl}
                        />
                        {reviewNode}
                    </>
                )}
            </div>
        </div>
    );
};

CourseDetailsSidebar.propTypes = {
    enrolled: PropTypes.bool.isRequired,
    tabs: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string.isRequired,
            label: PropTypes.string.isRequired,
        })
    ).isRequired,
    activeTab: PropTypes.string.isRequired,
    onTabChange: PropTypes.func.isRequired,
    sections: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    activeLesson: PropTypes.shape({}),
    completedLessons: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.number, PropTypes.string]))
        .isRequired,
    lessonRefs: PropTypes.shape({
        current: PropTypes.object,
    }).isRequired,
    maxHeight: PropTypes.string,
    onLessonClick: PropTypes.func.isRequired,
    onCheckboxToggle: PropTypes.func.isRequired,
    isAiAvailable: PropTypes.bool.isRequired,
    assistantAvailableMessage: PropTypes.string.isRequired,
    courseId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    languageCode: PropTypes.string,
    course: PropTypes.shape({
        coverImageUrl: PropTypes.string,
    }).isRequired,
    lessonCount: PropTypes.number.isRequired,
    reviewNode: PropTypes.node.isRequired,
};

const CourseDetailsMobileArea = ({
    isDesktop,
    enrolled,
    activeLessonRuntime,
    courseId,
    sections,
    activeLesson,
    completedLessons,
    lessonRefs,
    onLessonClick,
    onCheckboxToggle,
    course,
    lessonCount,
    resumeVideoTime,
    onVideoProgress,
    onTimeUpdate,
    onPause,
    videoRef,
    onEnded,
    publicInfoNode,
    instructorNode,
    reviewNode,
}) => {
    if (isDesktop) return null;

    if (enrolled) {
        return (
            <div className="space-y-6">
                {activeLessonRuntime}
                <CourseContent
                    courseId={courseId}
                    sections={sections}
                    enrolled={enrolled}
                    onLessonClick={onLessonClick}
                    activeLesson={activeLesson}
                    completedLessons={completedLessons}
                    lessonRefs={lessonRefs}
                    handleCheckboxToggle={onCheckboxToggle}
                />
                {instructorNode}
                {reviewNode}
                <Comment courseId={courseId} />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <CardVideo
                key={courseId}
                course={course}
                lessonCount={lessonCount}
                coverImageUrl={course.coverImageUrl}
                resumeVideoTime={resumeVideoTime}
                handleVideoProgress={(progress) => onVideoProgress(progress, activeLesson)}
                handleTimeUpdate={onTimeUpdate}
                handlePause={onPause}
                videoRef={videoRef}
                onEnded={onEnded}
            />
            {publicInfoNode}
        </div>
    );
};

CourseDetailsMobileArea.propTypes = {
    isDesktop: PropTypes.bool.isRequired,
    enrolled: PropTypes.bool.isRequired,
    activeLessonRuntime: PropTypes.node,
    courseId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    sections: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    activeLesson: PropTypes.shape({}),
    completedLessons: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.number, PropTypes.string]))
        .isRequired,
    lessonRefs: PropTypes.shape({
        current: PropTypes.object,
    }).isRequired,
    onLessonClick: PropTypes.func.isRequired,
    onCheckboxToggle: PropTypes.func.isRequired,
    course: PropTypes.shape({
        coverImageUrl: PropTypes.string,
    }).isRequired,
    lessonCount: PropTypes.number.isRequired,
    resumeVideoTime: PropTypes.number.isRequired,
    onVideoProgress: PropTypes.func.isRequired,
    onTimeUpdate: PropTypes.func.isRequired,
    onPause: PropTypes.func.isRequired,
    videoRef: PropTypes.shape({
        current: PropTypes.object,
    }).isRequired,
    onEnded: PropTypes.func.isRequired,
    publicInfoNode: PropTypes.node.isRequired,
    instructorNode: PropTypes.node.isRequired,
    reviewNode: PropTypes.node.isRequired,
};

const CourseDetailsMainArea = ({
    isDesktop,
    enrolled,
    videoContainerRef,
    activeLessonRuntime,
    publicInfoNode,
}) => {
    if (!isDesktop) return null;

    return (
        <div className="lg:col-span-2">
            {enrolled ? (
                <div className="space-y-8" ref={videoContainerRef}>
                    {activeLessonRuntime}
                </div>
            ) : (
                <div className="space-y-8">{publicInfoNode}</div>
            )}
        </div>
    );
};

CourseDetailsMainArea.propTypes = {
    isDesktop: PropTypes.bool.isRequired,
    enrolled: PropTypes.bool.isRequired,
    videoContainerRef: PropTypes.shape({
        current: PropTypes.object,
    }).isRequired,
    activeLessonRuntime: PropTypes.node,
    publicInfoNode: PropTypes.node.isRequired,
};

const EnrolledCourseSupport = ({ enrolled, instructorNode, reviewNode, courseId }) => {
    if (!enrolled) return null;

    return (
        <>
            <div className="space-y-8 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-6">
                <div className="lg:col-span-2">{instructorNode}</div>
                <div className="lg:col-span-1">{reviewNode}</div>
            </div>

            <div className="pt-6">
                <Comment courseId={courseId} />
            </div>
        </>
    );
};

EnrolledCourseSupport.propTypes = {
    enrolled: PropTypes.bool.isRequired,
    instructorNode: PropTypes.node.isRequired,
    reviewNode: PropTypes.node.isRequired,
    courseId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
};

const CourseDetailsErrorState = ({ message }) => (
    <main className="min-h-screen bg-white px-4 py-16 dark:bg-[#222222]">
        <div className="mx-auto max-w-xl rounded-2xl border border-red-200 bg-red-50 p-6 text-red-800 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-100">
            <h1 className="text-2xl font-bold">Курс жүктөлгөн жок</h1>
            <p className="mt-3 text-sm leading-6">{message}</p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button
                    type="button"
                    onClick={() => window.location.reload()}
                    className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
                >
                    Кайра аракет кылуу
                </button>
                <Link
                    to="/courses"
                    className="rounded-lg border border-red-300 px-4 py-2 text-center text-sm font-semibold text-red-700 transition hover:bg-red-100 dark:text-red-100"
                >
                    Курстарга кайтуу
                </Link>
            </div>
        </div>
    </main>
);

CourseDetailsErrorState.propTypes = {
    message: PropTypes.string.isRequired,
};

const CourseDetailsNotFoundState = () => (
    <main className="min-h-screen bg-white px-4 py-16 dark:bg-[#222222]">
        <div className="mx-auto max-w-xl rounded-2xl border border-gray-200 bg-gray-50 p-6 text-gray-800 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-100">
            <h1 className="text-2xl font-bold">Курс табылган жок</h1>
            <p className="mt-3 text-sm leading-6">
                Бул курс өчүрүлгөн, жашырылган же шилтемеси туура эмес болушу мүмкүн.
            </p>
            <Link
                to="/courses"
                className="mt-6 inline-flex rounded-lg bg-edubot-orange px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600"
            >
                Курстарды көрүү
            </Link>
        </div>
    </main>
);

const CourseDetailsPage = () => {
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const { user } = useContext(AuthContext);
    const [course, setCourse] = useState(null);
    const [sections, setSections] = useState([]);
    const [, setActiveSectionId] = useState(null);
    const [activeLesson, setActiveLesson] = useState(null);
    const activeLessonRef = useRef(null);
    const [completedLessons, setCompletedLessons] = useState([]);
    const [resumeVideoTime, setResumeVideoTime] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [enrolled, setEnrolled] = useState(false);
    const lessonRefs = useRef({});
    const videoRef = useRef(null);
    const hasPlayedRef = useRef(false);
    const markingCompleteRef = useRef(false);
    const [shouldScrollToLesson] = useState(true);
    const [activeTab, setActiveTab] = useState('program'); // 'program' | 'assistant'
    const { videoHeight, isDesktop, videoContainerRef } =
        useCourseDetailsLayoutMetrics(activeLesson);

    useEffect(() => {
        hasPlayedRef.current = false;
    }, [activeLesson]);

    useEffect(() => {
        activeLessonRef.current = activeLesson;
    }, [activeLesson]);

    const applyEnrollmentState = useCallback((isEnrolled) => {
        setEnrolled(isEnrolled);
        setSections((prevSections) =>
            prevSections.map((section) => ({
                ...section,
                lessons: (section.lessons || []).map((lesson) => ({
                    ...lesson,
                    locked: !isEnrolled && !lesson.previewVideo,
                })),
            }))
        );
        setActiveLesson((prevLesson) =>
            prevLesson
                ? {
                      ...prevLesson,
                      locked: !isEnrolled && !prevLesson.previewVideo,
                  }
                : prevLesson
        );
        if (!isEnrolled) {
            setResumeVideoTime(0);
            setActiveTab('program');
        }
    }, []);

    const handleEnrollmentAccessError = useCallback(
        (err, fallbackMessage) => {
            if (!isForbiddenError(err)) return false;
            const { message } = parseApiError(err, fallbackMessage);
            applyEnrollmentState(false);
            toast.error(message || fallbackMessage);
            return true;
        },
        [applyEnrollmentState]
    );

    const addCompletedLesson = useCallback((lessonId) => {
        setCompletedLessons((prev) => [...new Set([...prev, lessonId])]);
    }, []);

    const removeCompletedLesson = useCallback((lessonId) => {
        setCompletedLessons((prev) =>
            prev.filter((completedLessonId) => completedLessonId !== lessonId)
        );
    }, []);

    const {
        activeQuiz,
        lessonQuizAnswers,
        lessonQuizResults,
        quizLoading,
        quizSubmitting,
        loadQuizForLesson,
        handleQuizAnswerChange,
        handleQuizRetake,
        handleQuizSubmit,
    } = useLessonQuiz({
        courseId: id,
        activeLesson,
        onEnrollmentAccessError: handleEnrollmentAccessError,
        onLessonComplete: addCompletedLesson,
    });

    const {
        activeChallenge,
        lessonChallengeCode,
        lessonChallengeResults,
        challengeLoading,
        challengeSubmitting,
        loadChallengeForLesson,
        handleChallengeCodeChange,
        handleChallengeSubmit,
    } = useLessonChallenge({
        courseId: id,
        activeLesson,
        onEnrollmentAccessError: handleEnrollmentAccessError,
        onLessonComplete: addCompletedLesson,
    });

    const persistVideoTime = useCallback(
        async (lessonId, time, fallbackMessage, { rethrow = false } = {}) => {
            try {
                await updateVideoTime({
                    courseId: Number(id),
                    lessonId,
                    time,
                });
                return true;
            } catch (err) {
                if (handleEnrollmentAccessError(err, fallbackMessage)) {
                    return false;
                }
                console.error('Failed to persist video time', err);
                if (rethrow) throw err;
                return false;
            }
        },
        [handleEnrollmentAccessError, id]
    );

    useArticleAutoComplete({
        courseId: id,
        activeLesson,
        completedLessons,
        enrolled,
        onEnrollmentAccessError: handleEnrollmentAccessError,
        onLessonComplete: addCompletedLesson,
    });

    const scrollToLesson = useCallback(
        (lessonId) => {
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
        },
        [shouldScrollToLesson]
    );

    useInitialCourseDetailsLoad({
        courseId: id,
        searchParams,
        user,
        applyEnrollmentState,
        handleEnrollmentAccessError,
        loadQuizForLesson,
        loadChallengeForLesson,
        scrollToLesson,
        setCourse,
        setSections,
        setCompletedLessons,
        setActiveLesson,
        setActiveSectionId,
        setResumeVideoTime,
        setLoading,
        setError,
    });

    const handleLessonClick = useCallback(
        async (lesson) => {
            const isQuiz = lesson.kind === 'quiz';
            const isCode = lesson.kind === 'code';
            const isRuntimeActivity = isRuntimeActivityLesson(lesson);
            setActiveLesson(lesson);
            saveActiveSectionId(id, lesson.sectionId);
            setActiveSectionId(lesson.sectionId);
            scrollToLesson(lesson.id);

            if (isRuntimeActivity) {
                setResumeVideoTime(0);
            }

            if (isQuiz) {
                await loadQuizForLesson(lesson);
            }

            if (isCode) {
                await loadChallengeForLesson(lesson);
            }

            if (user && enrolled && !lesson.locked) {
                try {
                    await updateLastViewedLesson({ courseId: Number(id), lessonId: lesson.id });
                    if (!isRuntimeActivity) {
                        const videoTime = await getVideoTime(id, lesson.id);

                        if (shouldUseSavedVideoTime(videoTime, lesson, completedLessons)) {
                            setResumeVideoTime(videoTime.time);
                        } else {
                            setResumeVideoTime(0);
                        }
                    } else {
                        setResumeVideoTime(0);
                    }
                } catch (err) {
                    if (
                        handleEnrollmentAccessError(
                            err,
                            'Бул сабакты улантуу үчүн курска активдүү жеткиликтүүлүк керек.'
                        )
                    ) {
                        return;
                    }
                    throw err;
                }
            } else {
                setResumeVideoTime(0);
            }
        },
        [
            completedLessons,
            enrolled,
            handleEnrollmentAccessError,
            id,
            loadChallengeForLesson,
            loadQuizForLesson,
            scrollToLesson,
            user,
        ]
    );

    const { handleTimeUpdate, handlePause, handleEnded, handleVideoProgress } =
        useCourseVideoProgress({
            courseId: id,
            user,
            enrolled,
            activeLesson,
            activeLessonRef,
            completedLessons,
            hasPlayedRef,
            markingCompleteRef,
            sections,
            videoRef,
            onEnrollmentAccessError: handleEnrollmentAccessError,
            onLessonClick: handleLessonClick,
            onLessonComplete: addCompletedLesson,
            onPersistVideoTime: persistVideoTime,
        });

    const handleCheckboxToggle = useCallback(
        async (lesson) => {
            if (!enrolled) return;
            try {
                const response = await markLessonComplete(id, lesson.sectionId, lesson.id);
                if (response.completed) {
                    addCompletedLesson(lesson.id);
                } else {
                    if (lesson.kind === 'video') {
                        const didResetVideoTime = await persistVideoTime(
                            lesson.id,
                            0,
                            'Видеонун жүрүшүн сактоо үчүн курска активдүү жеткиликтүүлүк керек.',
                            { rethrow: true }
                        );
                        if (!didResetVideoTime) return;
                    }
                    if (activeLesson?.id === lesson.id) {
                        setResumeVideoTime(0);
                    }
                    removeCompletedLesson(lesson.id);
                }
            } catch (err) {
                if (
                    handleEnrollmentAccessError(
                        err,
                        'Сабактын прогрессин өзгөртүү үчүн курска активдүү жеткиликтүүлүк керек.'
                    )
                ) {
                    return;
                }
                throw err;
            }
        },
        [
            activeLesson,
            addCompletedLesson,
            enrolled,
            handleEnrollmentAccessError,
            id,
            persistVideoTime,
            removeCompletedLesson,
        ]
    );

    if (loading) return <Loader fullScreen />;
    if (error) return <CourseDetailsErrorState message={error} />;
    if (!course) return <CourseDetailsNotFoundState />;

    const { prev: prevLesson, next: nextLesson } = findAdjacentLessons(sections, activeLesson?.id);
    const isCourseInstructor = Boolean(user && course?.instructor?.id === user.id);
    const isAdmin = isPlatformAdmin(user);
    const isAiFeatureEnabled = isCourseFeatureEnabled(course, TENANT_FEATURES.AI_ASSISTANT);
    const isAiAvailable = Boolean(
        isAiFeatureEnabled &&
        course.aiAssistantEnabled &&
        (enrolled || isCourseInstructor || isAdmin)
    );
    const assistantAvailableMessage = !isAiFeatureEnabled
        ? 'EDU AI ассистенти бул tenant үчүн өчүрүлгөн.'
        : course.aiAssistantEnabled
          ? 'Ассистентти колдонуу үчүн курска жазылуу керек.'
          : 'EDU AI ассистенти бул курста өчүрүлгөн.';

    const tabs = [
        { id: 'program', label: 'Курстун программасы', disabled: false },
        ...(isAiAvailable ? [{ id: 'assistant', label: 'Edu AI Assistent', disabled: false }] : []),
    ];

    const handleTabChange = (tab) => {
        setActiveTab(tab.id);
    };

    const lessonCount =
        course?.lessonCount ??
        sections.reduce((count, sec) => count + (sec.lessons?.length || 0), 0);
    const renderInstructorInfo = () => (
        <InstructorsInfo
            instructorData={course.instructor}
            ratingAverage={course.ratingAverage}
            ratingCount={course.ratingCount}
        />
    );
    const renderCourseReview = () => (
        <CourseReview
            ratingAverage={course.ratingAverage}
            ratingCount={course.ratingCount}
            ratingBreakdown={course?.ratingBreakdown}
        />
    );
    const renderPublicCourseInfo = ({ includeReview = true } = {}) => (
        <>
            <CourseDescription course={course} />
            {renderInstructorInfo()}
            <CourseContent courseId={id} sections={sections} />
            {includeReview ? renderCourseReview() : null}
        </>
    );
    const activeLessonRuntime = (
        <ActiveLessonRuntime
            activeLesson={activeLesson}
            activeQuiz={activeQuiz}
            activeChallenge={activeChallenge}
            lessonQuizAnswers={lessonQuizAnswers}
            lessonQuizResults={lessonQuizResults}
            lessonChallengeCode={lessonChallengeCode}
            lessonChallengeResults={lessonChallengeResults}
            resumeVideoTime={resumeVideoTime}
            enrolled={enrolled}
            quizLoading={quizLoading}
            quizSubmitting={quizSubmitting}
            challengeLoading={challengeLoading}
            challengeSubmitting={challengeSubmitting}
            videoRef={videoRef}
            nextLesson={nextLesson}
            prevLesson={prevLesson}
            onQuizAnswerChange={handleQuizAnswerChange}
            onQuizSubmit={handleQuizSubmit}
            onQuizRetake={handleQuizRetake}
            onChallengeCodeChange={handleChallengeCodeChange}
            onChallengeSubmit={handleChallengeSubmit}
            onVideoProgress={handleVideoProgress}
            onTimeUpdate={handleTimeUpdate}
            onPause={handlePause}
            onEnded={handleEnded}
            onLessonClick={handleLessonClick}
        />
    );
    const instructorNode = renderInstructorInfo();
    const reviewNode = renderCourseReview();
    const publicInfoNode = renderPublicCourseInfo();
    const desktopPublicInfoNode = renderPublicCourseInfo({ includeReview: false });
    const mobileCourseArea = (
        <CourseDetailsMobileArea
            isDesktop={isDesktop}
            enrolled={enrolled}
            activeLessonRuntime={activeLessonRuntime}
            courseId={id}
            sections={sections}
            activeLesson={activeLesson}
            completedLessons={completedLessons}
            lessonRefs={lessonRefs}
            onLessonClick={handleLessonClick}
            onCheckboxToggle={handleCheckboxToggle}
            course={course}
            lessonCount={lessonCount}
            resumeVideoTime={resumeVideoTime}
            onVideoProgress={handleVideoProgress}
            onTimeUpdate={handleTimeUpdate}
            onPause={handlePause}
            videoRef={videoRef}
            onEnded={handleEnded}
            publicInfoNode={publicInfoNode}
            instructorNode={instructorNode}
            reviewNode={reviewNode}
        />
    );
    const desktopMainArea = (
        <CourseDetailsMainArea
            isDesktop={isDesktop}
            enrolled={enrolled}
            videoContainerRef={videoContainerRef}
            activeLessonRuntime={activeLessonRuntime}
            publicInfoNode={desktopPublicInfoNode}
        />
    );
    const desktopSidebar = (
        <CourseDetailsSidebar
            enrolled={enrolled}
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={handleTabChange}
            sections={sections}
            activeLesson={activeLesson}
            completedLessons={completedLessons}
            lessonRefs={lessonRefs}
            maxHeight={videoHeight ? `${videoHeight}px` : undefined}
            onLessonClick={handleLessonClick}
            onCheckboxToggle={handleCheckboxToggle}
            isAiAvailable={isAiAvailable}
            assistantAvailableMessage={assistantAvailableMessage}
            courseId={id}
            languageCode={course.languageCode}
            course={course}
            lessonCount={lessonCount}
            reviewNode={reviewNode}
        />
    );
    const enrolledSupport = (
        <EnrolledCourseSupport
            enrolled={enrolled}
            instructorNode={instructorNode}
            reviewNode={reviewNode}
            courseId={id}
        />
    );

    return (
        <div className="min-h-screen pt-10 bg-[#f8f9fb] dark:bg-[#1A1A1A]">
            <InstructorChatDock enrolled={enrolled} userRole={user?.role} course={course} />
            <div className="mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
                <div className="space-y-6 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-6">
                    {mobileCourseArea}
                    {desktopMainArea}
                    {desktopSidebar}
                </div>

                {enrolledSupport}
            </div>
        </div>
    );
};
export default CourseDetailsPage;
