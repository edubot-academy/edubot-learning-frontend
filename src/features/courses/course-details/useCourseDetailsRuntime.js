import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import debounce from 'lodash.debounce';
import toast from 'react-hot-toast';
import {
    fetchCourseDetails,
    fetchSections,
    markLessonComplete,
    fetchUserProgress,
    getLastViewedLesson,
    getVideoTime,
    fetchEnrollment,
    fetchLessonQuiz,
    submitLessonQuiz,
    fetchLessonChallenge,
    submitLessonChallenge,
} from '@services/api';
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
} from './courseDetailsUtils';

export const useLessonQuiz = ({ courseId, activeLesson, onEnrollmentAccessError, onLessonComplete }) => {
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

export const useLessonChallenge = ({
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

export const useArticleAutoComplete = ({
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

export const useCourseVideoProgress = ({
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

export const useInitialCourseDetailsLoad = ({
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

export const useCourseDetailsLayoutMetrics = (activeLesson) => {
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
