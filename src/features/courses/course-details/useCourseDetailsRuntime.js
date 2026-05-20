import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import debounce from 'lodash.debounce';
import toast from 'react-hot-toast';
import i18n from '../../../i18n';
import {
    fetchCourseDetails,
    fetchSections,
    markLessonComplete,
    updateLastViewedLesson,
    fetchUserProgress,
    getLastViewedLesson,
    getVideoTime,
    updateVideoTime,
    fetchEnrollment,
    fetchLessonQuiz,
    submitLessonQuiz,
    fetchLessonChallenge,
    submitLessonChallenge,
} from '@services/api';
import { isForbiddenError, parseApiError } from '@shared/api/error';
import { isPlatformAdmin } from '@shared/utils/roles';
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
                        i18n.t('public.courseDetails.runtime.access.quizLoad')
                    )
                ) {
                    return;
                }
                console.error(err);
                const message = parseApiError(
                    err,
                    i18n.t('public.courseDetails.runtime.errors.quizLoad')
                ).message;
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
                toast.error(i18n.t('public.courseDetails.runtime.errors.answerAtLeastOne'));
                return;
            }

            if (!preparedAnswers && hasUnansweredQuestions) {
                toast.error(i18n.t('public.courseDetails.runtime.errors.answerAll'));
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
                                ? i18n.t('public.courseDetails.runtime.quiz.passed')
                                : i18n.t('public.courseDetails.runtime.quiz.failedWithScore', {
                                      score: updatedResult.score,
                                  })
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
                        ? i18n.t('public.courseDetails.runtime.quiz.passed')
                        : i18n.t('public.courseDetails.runtime.quiz.failed')
                );
                onLessonComplete(activeLesson.id);
            } catch (err) {
                if (
                    onEnrollmentAccessError(
                        err,
                        i18n.t('public.courseDetails.runtime.access.quizSubmit')
                    )
                ) {
                    return;
                }
                console.error(err);
                toast.error(
                    parseApiError(err, i18n.t('public.courseDetails.runtime.errors.quizSubmit')).message
                );
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
                        i18n.t('public.courseDetails.runtime.access.challengeLoad')
                    )
                ) {
                    return null;
                }
                console.error(err);
                const message = parseApiError(
                    err,
                    i18n.t('public.courseDetails.runtime.errors.challengeLoad')
                ).message;
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
            toast.success(
                result.passed
                    ? i18n.t('public.courseDetails.runtime.challenge.passed')
                    : i18n.t('public.courseDetails.runtime.challenge.failed')
            );
            onLessonComplete(activeLesson.id);
        } catch (err) {
            if (
                onEnrollmentAccessError(
                    err,
                    i18n.t('public.courseDetails.runtime.access.challengeSubmit')
                )
            ) {
                return;
            }
            console.error(err);
            toast.error(
                parseApiError(err, i18n.t('public.courseDetails.runtime.errors.challengeSubmit')).message
            );
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
                        i18n.t('public.courseDetails.runtime.access.markArticleComplete')
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
                    i18n.t('public.courseDetails.runtime.access.videoProgressSave')
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
                            i18n.t('public.courseDetails.runtime.access.completeLesson')
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
                    i18n.t('public.courseDetails.runtime.access.videoProgressSave')
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
                    i18n.t('public.courseDetails.runtime.access.completeLesson')
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
                        try {
                            enrollment = await fetchEnrollment(courseId, user.id);
                        } catch (err) {
                            if (!isForbiddenError(err)) {
                                throw err;
                            }
                            enrollment = { enrolled: false };
                        }
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
                                i18n.t('public.courseDetails.runtime.access.courseProgress')
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
                                i18n.t('public.courseDetails.runtime.access.lastViewedLesson')
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
                                        i18n.t('public.courseDetails.runtime.access.resumeVideo')
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
                setError(parseApiError(err, i18n.t('public.courseDetails.runtime.errors.courseLoad')).message);
            } finally {
                setLoading(false);
            }
        };
        fetchCourse();
    }, [courseId, user, applyEnrollmentState, handleEnrollmentAccessError]);
    /* eslint-enable react-hooks/exhaustive-deps */
};

export const useCourseDetailsLayoutMetrics = () => {
    const [isDesktop, setIsDesktop] = useState(
        typeof window !== 'undefined' ? window.innerWidth >= 1024 : false
    );

    useEffect(() => {
        if (typeof window === 'undefined') return undefined;

        const updateBreakpoint = () => {
            setIsDesktop(window.innerWidth >= 1024);
        };

        updateBreakpoint();

        const handleResize = debounce(() => {
            updateBreakpoint();
        }, 100);

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            handleResize.cancel();
        };
    }, []);

    return { isDesktop };
};

export const useCourseDetailsController = ({ courseId, searchParams, user }) => {
    const [course, setCourse] = useState(null);
    const [sections, setSections] = useState([]);
    const [, setActiveSectionId] = useState(null);
    const [activeLesson, setActiveLesson] = useState(null);
    const [autoPlayActiveLesson, setAutoPlayActiveLesson] = useState(false);
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
    const shouldScrollToLesson = true;
    const [activeTab, setActiveTab] = useState('program');
    const { isDesktop } = useCourseDetailsLayoutMetrics();

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
        courseId,
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
        courseId,
        activeLesson,
        onEnrollmentAccessError: handleEnrollmentAccessError,
        onLessonComplete: addCompletedLesson,
    });

    const persistVideoTime = useCallback(
        async (lessonId, time, fallbackMessage, { rethrow = false } = {}) => {
            try {
                await updateVideoTime({
                    courseId: Number(courseId),
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
        [courseId, handleEnrollmentAccessError]
    );

    useArticleAutoComplete({
        courseId,
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
                if (!el) return;

                const rect = el.getBoundingClientRect();
                const isVisible = rect.top >= 0 && rect.bottom <= window.innerHeight;

                if (!isVisible) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 100);
        },
        [shouldScrollToLesson]
    );

    useInitialCourseDetailsLoad({
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
    });

    const handleLessonClick = useCallback(
        async (lesson) => {
            const isQuiz = lesson.kind === 'quiz';
            const isCode = lesson.kind === 'code';
            const isRuntimeActivity = isRuntimeActivityLesson(lesson);
            const previousLessonId = activeLessonRef.current?.id;
            setAutoPlayActiveLesson(lesson.kind === 'video' && lesson.id !== previousLessonId);
            setActiveLesson(lesson);
            saveActiveSectionId(courseId, lesson.sectionId);
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
                    await updateLastViewedLesson({ courseId: Number(courseId), lessonId: lesson.id });
                    if (!isRuntimeActivity) {
                        const videoTime = await getVideoTime(courseId, lesson.id);

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
                            i18n.t('public.courseDetails.runtime.access.resumeLesson')
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
            activeLessonRef,
            completedLessons,
            courseId,
            enrolled,
            handleEnrollmentAccessError,
            loadChallengeForLesson,
            loadQuizForLesson,
            scrollToLesson,
            user,
        ]
    );

    const { handleTimeUpdate, handlePause, handleEnded, handleVideoProgress } =
        useCourseVideoProgress({
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
            onEnrollmentAccessError: handleEnrollmentAccessError,
            onLessonClick: handleLessonClick,
            onLessonComplete: addCompletedLesson,
            onPersistVideoTime: persistVideoTime,
        });

    const handleCheckboxToggle = useCallback(
        async (lesson) => {
            if (!enrolled) return;
            try {
                const response = await markLessonComplete(courseId, lesson.sectionId, lesson.id);
                if (response.completed) {
                    addCompletedLesson(lesson.id);
                } else {
                    if (lesson.kind === 'video') {
                        const didResetVideoTime = await persistVideoTime(
                            lesson.id,
                            0,
                            i18n.t('public.courseDetails.runtime.access.videoProgressSave'),
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
                        i18n.t('public.courseDetails.runtime.access.lessonProgressChange')
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
            courseId,
            enrolled,
            handleEnrollmentAccessError,
            persistVideoTime,
            removeCompletedLesson,
        ]
    );

    const { prev: prevLesson, next: nextLesson } = findAdjacentLessons(sections, activeLesson?.id);
    const isCourseInstructor = Boolean(user && course?.instructor?.id === user.id);
    const isAdmin = isPlatformAdmin(user);
    const isAiFeatureEnabled = isCourseFeatureEnabled(course, TENANT_FEATURES.AI_ASSISTANT);
    const isAiAvailable = Boolean(
        isAiFeatureEnabled &&
        course?.aiAssistantEnabled &&
        (enrolled || isCourseInstructor || isAdmin)
    );
    const assistantAvailableMessage = !isAiFeatureEnabled
        ? i18n.t('public.courseDetails.assistant.unavailableTenant')
        : course?.aiAssistantEnabled
          ? i18n.t('public.courseDetails.assistant.enrollmentRequired')
          : i18n.t('public.courseDetails.assistant.unavailableCourse');

    const tabs = [
        { id: 'program', label: i18n.t('public.courseDetails.tabs.program'), disabled: false },
        ...(isAiAvailable
            ? [{ id: 'assistant', label: i18n.t('public.courseDetails.tabs.assistant'), disabled: false }]
            : []),
    ];

    const handleTabChange = useCallback((tab) => {
        setActiveTab(tab.id);
    }, []);

    const lessonCount =
        course?.lessonCount ??
        sections.reduce((count, sec) => count + (sec.lessons?.length || 0), 0);

    return {
        activeChallenge,
        activeLesson,
        activeQuiz,
        activeTab,
        autoPlayActiveLesson,
        assistantAvailableMessage,
        challengeLoading,
        challengeSubmitting,
        completedLessons,
        course,
        enrolled,
        error,
        handleChallengeCodeChange,
        handleChallengeSubmit,
        handleCheckboxToggle,
        handleEnded,
        handleLessonClick,
        handlePause,
        handleQuizAnswerChange,
        handleQuizRetake,
        handleQuizSubmit,
        handleTabChange,
        handleTimeUpdate,
        handleVideoProgress,
        isAiAvailable,
        isDesktop,
        lessonChallengeCode,
        lessonChallengeResults,
        lessonCount,
        lessonQuizAnswers,
        lessonQuizResults,
        lessonRefs,
        loading,
        nextLesson,
        prevLesson,
        quizLoading,
        quizSubmitting,
        resumeVideoTime,
        sections,
        tabs,
        videoRef,
    };
};
