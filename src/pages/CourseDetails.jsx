import { useState, useEffect, useRef, useCallback, useContext } from "react";
import { useParams } from "react-router-dom";
import debounce from "lodash.debounce";
import toast from "react-hot-toast";
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
} from "../services/api";
import { AuthContext } from "../context/AuthContext";
import CourseSidebar from "../components/CourseSidebar";
import CourseHeader from "../components/CourseHeader";
import CourseVideoPlayer from "../components/CourseVideoPlayer";
import ArticleLessonViewer from "../components/ArticleLessonViewer";
import LessonQuizPlayer from "../components/LessonQuizPlayer";
import LessonChallengePlayer from "../components/LessonChallengePlayer";
import CourseDescription from "../components/CourseDescription";
import Comment from "../components/Comment";
import CourseReview from "../components/CourseReview";

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
    const [paid, setPaid] = useState(false);
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
                    el.scrollIntoView({ behavior: "smooth", block: "center" });
                }
            }
        }, 100);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const debouncedTimeUpdate = useCallback(
        debounce((time) => {
            if (
                user &&
                enrolled &&
                activeLessonRef.current?.id &&
                activeLessonRef.current?.kind === 'video'
            ) {
                updateVideoTime({ courseId: Number(id), lessonId: activeLessonRef.current.id, time });
            }
        }, 3000),
        [id, user, enrolled]
    );

    const handleTimeUpdate = (time) => {
        if (user && enrolled && activeLessonRef.current?.kind === 'video') {
            debouncedTimeUpdate(time);
        }
    };

    const handlePause = () => {
        if (!videoRef.current) return;
        const currentTime = videoRef.current.currentTime;
        if (currentTime < (activeLessonRef.current?.duration ?? 9999) * 0.9) return;
        if (user && enrolled && activeLessonRef.current?.kind === 'video') {
            console.log('updateVideoTime');
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
            const message = err.response?.data?.message || "Квиз жүктөлбөй калды";
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
                        : savedState?.code ?? challenge.starterCode ?? '',
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
            const message = err.response?.data?.message || "Код тапшырма жүктөлбөй калды";
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
                        videoRef.current.play().catch(err => console.warn('Autoplay failed:', err));
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

                if (videoTime?.time && videoTime.time < (lesson.duration || 9999) * 0.95 && !completedLessons.includes(lesson.id)) {
                    setResumeVideoTime(videoTime.time);
                } else {
                    setResumeVideoTime(0);
                }
            } else {
                setResumeVideoTime(0);
            }
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

    const handleQuizSubmit = async () => {
        if (!activeLesson) return;
        const quiz = lessonQuizData[activeLesson.id];
        if (!quiz) return;
        const answersMap = lessonQuizAnswers[activeLesson.id] || {};
        const unanswered = quiz.questions.some((question) => !answersMap[question.id]);
        if (unanswered) {
            toast.error('Бардык суроолорго жооп бериңиз.');
            return;
        }
        setQuizSubmitting(true);
        try {
            const payload = {
                answers: quiz.questions.map((question) => ({
                    questionId: question.id,
                    optionId: answersMap[question.id],
                })),
            };
            const result = await submitLessonQuiz(
                id,
                activeLesson.sectionId,
                activeLesson.id,
                payload,
            );
            setLessonQuizResults((prev) => ({ ...prev, [activeLesson.id]: result }));
            toast.success(result.passed ? 'Куттуктайбыз! Квиз ийгиликтүү тапшырылды.' : 'Кайра аракет кылып көрүңүз.');
            if (result.passed) {
                setCompletedLessons((prev) => [...new Set([...prev, activeLesson.id])]);
            }
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
            if (result.passed) {
                setCompletedLessons((prev) => [...new Set([...prev, activeLesson.id])]);
            }
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
                setCompletedLessons(prev => [...new Set([...prev, activeLesson.id])]);
            }
        }
        const { next } = findPrevNextLessons();
        if (next) {
            handleLessonClick(next);
        }
    };

    const handleVideoProgress = useCallback(
        async (progress, lessonParam) => {
            if (lessonParam.kind === 'article' || lessonParam.kind === 'quiz' || lessonParam.kind === 'code') return;

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
                    time: 0
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
                        if (lastLesson.kind === 'article' || lastLesson.kind === 'quiz' || lastLesson.kind === 'code') {
                            setResumeVideoTime(0);
                        } else {
                            const videoTime = await getVideoTime(id, lastLesson.id);
                            if (videoTime?.time && videoTime.time < 0.95 * (lastLesson.duration || 9999)) {
                                setResumeVideoTime(videoTime.time);
                            } else {
                                setResumeVideoTime(0);
                            }
                        }
                    }
                }

                if (!lastLesson) {
                    const storedSection = localStorage.getItem(`active_section_${id}`);
                    const sectionIdToOpen = storedSection ? Number(storedSection) : updatedSections[0]?.id;
                    setActiveSectionId(sectionIdToOpen);
                }
            } catch (err) {
                setError(err.message || "Курс жүктөлбөй калды.");
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
    const totalLessons = sections.reduce((count, sec) => count + (sec.lessons?.length || 0), 0);
    const progress = Math.round((completedLessons.length / totalLessons) * 100);

    function changPaid() {
        setPaid(!paid)
    }

    return (
        <div className="min-h-screen pt-24">
            <button onClick={changPaid}>tap</button>

            {paid ? <CourseHeader course={course} progress={progress} enrolled={enrolled} />
                :
                <div className="max-w-6xl mx-auto p-6">
                    {/* ✅ ПРОСТО ВЫЗЫВАЕМ КОМПОНЕНТ ОПИСАНИЯ */}
                    <CourseDescription course={course} />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2">
                            {activeLesson && (
                                activeLesson.kind === 'article' ? (
                                    <ArticleLessonViewer key={activeLesson.id} lesson={activeLesson} />
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
                                        loading={challengeLoading && !lessonChallengeData[activeLesson.id]}
                                        result={lessonChallengeResults[activeLesson.id]}
                                    />
                                ) : (
                                    <CourseVideoPlayer
                                        key={activeLesson.id}
                                        activeLesson={activeLesson}
                                        resumeVideoTime={resumeVideoTime}
                                        handleVideoProgress={(progress) => handleVideoProgress(progress, activeLesson)}
                                        handleTimeUpdate={handleTimeUpdate}
                                        handlePause={handlePause}
                                        videoRef={videoRef}
                                        nextLesson={nextLesson}
                                        prevLesson={prevLesson}
                                        onEnded={handleEnded}
                                        handleLessonClick={handleLessonClick}
                                    />
                                )
                            )}
                        </div>
                        <CourseSidebar
                            key={activeSectionId}
                            sections={sections}
                            activeSectionId={activeSectionId}
                            toggleSection={toggleSection}
                            activeLesson={activeLesson}
                            handleLessonClick={handleLessonClick}
                            handleCheckboxToggle={handleCheckboxToggle}
                            completedLessons={completedLessons}
                            lastViewedLessonId={lastViewedLessonId}
                            enrolled={enrolled}
                            lessonRefs={lessonRefs}
                        />

                    </div>

                    <CourseReview/>
                    <Comment courseId={id} />
                </div>
            }
        </div>
    );
};

export default CourseDetailsPage;