import React, { useState, useEffect, useRef, useCallback, useContext } from "react";
import { useParams } from "react-router-dom";
import debounce from "lodash.debounce";
import VideoPlayer from "../components/VideoPlayer";
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
} from "../services/api";
import { AuthContext } from "../context/AuthContext";
import CourseSidebar from "../components/CourseSidebar";
import CourseHeader from "../components/CourseHeader";
import CourseVideoPlayer from "../components/CourseVideoPlayer";

const CourseDetailsPage = () => {
    const { id } = useParams();
    const { user } = useContext(AuthContext);
    const [course, setCourse] = useState(null);
    const [sections, setSections] = useState([]);
    const [activeSectionId, setActiveSectionId] = useState(null);
    const [activeLesson, setActiveLesson] = useState(null);
    const [lastViewedLessonId, setLastViewedLessonId] = useState(null);
    const [completedLessons, setCompletedLessons] = useState([]);
    const [resumeVideoTime, setResumeVideoTime] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [enrolled, setEnrolled] = useState(false);
    const lessonRefs = useRef({});
    const [countdown, setCountdown] = useState(0);
    const countdownRef = useRef(null);
    const [progressPercent, setProgressPercent] = useState(0);
    const [countdownStarted, setCountdownStarted] = useState(false);
    const videoRef = useRef(null);
    const [shouldAutoPlayNext, setShouldAutoPlayNext] = useState(false);

    const scrollToLesson = (lessonId) => {
        setTimeout(() => {
            if (lessonRefs.current[lessonId]) {
                lessonRefs.current[lessonId].scrollIntoView({ behavior: "smooth", block: "center" });
            }
        }, 100);
    };

    const debouncedTimeUpdate = useCallback(
        debounce((time) => {
            if (user && enrolled) {
                updateVideoTime({ courseId: Number(id), lessonId: activeLesson?.id, time });
            }
        }, 3000),
        [id, user, enrolled, activeLesson?.id]
    );

    const handleTimeUpdate = (time) => {
        if (user && enrolled) {
            debouncedTimeUpdate(time);
        }

        const video = videoRef.current;
        if (!video || countdownStarted) return;
        if (video.duration - time <= 5) {
            const { next } = findPrevNextLessons();
            if (next) {
                setCountdownStarted(true);
                setCountdown(5);
                setProgressPercent(0);
                const totalSeconds = 5;
                const intervalTime = 100;
                const totalIntervals = (totalSeconds * 1000) / intervalTime;
                let currentInterval = 0;

                countdownRef.current = setInterval(() => {
                    currentInterval++;
                    setProgressPercent((currentInterval / totalIntervals) * 100);

                    if (currentInterval % 10 === 0) {
                        setCountdown((prev) => {
                            if (prev === 1) {
                                clearInterval(countdownRef.current);
                                setShouldAutoPlayNext(true);
                                handleLessonClick(next);
                                setCountdownStarted(false);
                                return 0;
                            }
                            return prev - 1;
                        });
                    }
                }, intervalTime);
            }
        }

    };


    const toggleSection = (sectionId) => {
        const newId = activeSectionId === sectionId ? null : sectionId;
        setActiveSectionId(newId);
        if (newId) {
            localStorage.setItem(`active_section_${id}`, String(newId));
        } else {
            localStorage.removeItem(`active_section_${id}`);
        }
    };

    const handleLessonClick = async (lesson) => {
        if (countdownRef.current) {
            clearInterval(countdownRef.current);
            setCountdown(0);
            setProgressPercent(0);
            setCountdownStarted(false);
        }
        setActiveLesson(lesson);
        localStorage.setItem(`active_section_${id}`, String(lesson.sectionId));
        setActiveSectionId(lesson.sectionId);
        scrollToLesson(lesson.id);

        if (shouldAutoPlayNext) {
            setTimeout(() => {
                if (videoRef.current) {
                    videoRef.current.muted = true; // ensure autoplay
                    videoRef.current.play().catch((err) => {
                        console.warn('Auto-play failed:', err);
                    });
                }
            }, 500);
        }
        setShouldAutoPlayNext(false);

        if (user && enrolled && !lesson.locked) {
            await updateLastViewedLesson({ courseId: Number(id), lessonId: lesson.id });
            const videoTime = await getVideoTime(id, lesson.id);
            if (videoTime?.time) {
                setResumeVideoTime(videoTime.time);
            }
        }
    };


    const findPrevNextLessons = () => {
        const flatLessons = sections.flatMap((sec) => sec.lessons || []);
        const index = flatLessons.findIndex((l) => l.id === activeLesson?.id);
        const prev = flatLessons[index - 1];
        const next = flatLessons[index + 1];
        return { prev, next };
    };

    const handleVideoProgress = async (progress, lesson) => {
        if (enrolled && progress >= 95 && !completedLessons.includes(lesson.id)) {
            const response = await markLessonComplete(id, lesson.sectionId, lesson.id);
            if (response.completed) {
                setCompletedLessons((prev) => [...new Set([...prev, lesson.id])]);
            }
        }
    };

    const handleCheckboxToggle = async (lesson) => {
        if (!enrolled) return;
        const response = await markLessonComplete(id, lesson.sectionId, lesson.id);
        if (response.completed) {
            setCompletedLessons((prev) => [...new Set([...prev, lesson.id])]);
        } else {
            setCompletedLessons((prev) => prev.filter((lId) => lId !== lesson.id));
        }
    };

    useEffect(() => {
        return () => {
            if (countdownRef.current) {
                clearInterval(countdownRef.current);
            }
        };
    }, []);

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                let enrollment = { enrolled: false };
                if (user) {
                    enrollment = await fetchEnrollment(id, user.id);
                }
                setEnrolled(enrollment.enrolled);

                const data = await fetchCourseDetails(id);
                setCourse(data);
                const sectionData = await fetchSections(id);

                const updatedSections = sectionData.map((sec) => ({
                    ...sec,
                    lessons: sec.lessons
                        .slice()
                        .sort((a, b) => a.order - b.order) // sorting lessons by the `order` field
                        .map((lesson) => ({
                            ...lesson,
                            sectionId: sec.id,
                            locked: !enrollment.enrolled && !lesson.previewVideo,
                        })),
                }));

                setSections(updatedSections.sort((a, b) => a.order - b.order));

                if (enrollment.enrolled && user) {
                    const progress = await fetchUserProgress(id);
                    const completed = progress.completedLessonIds || [];
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
                    if (user && enrollment.enrolled && !lastLesson.locked) {
                        const videoTime = await getVideoTime(id, lastLesson.id);
                        if (videoTime?.time) {
                            setResumeVideoTime(videoTime.time);
                        }
                    }
                } else {
                    const storedSection = localStorage.getItem(`active_section_${id}`);
                    if (storedSection) {
                        setActiveSectionId(Number(storedSection));
                    } else if (updatedSections.length > 0) {
                        setActiveSectionId(updatedSections[0].id);
                        if (!lastLesson) {
                            const storedSection = localStorage.getItem(`active_section_${id}`);
                            const sectionIdToOpen = storedSection ? Number(storedSection) : updatedSections[0]?.id;
                            setActiveSectionId(sectionIdToOpen);
                        }

                    }
                }
            } catch (err) {
                setError(err.message || "Курс жүктөлбөй калды.");
            } finally {
                setLoading(false);
            }
        };
        fetchCourse();
    }, [id, user]);

    if (loading) return <div>Жүктөлүүдө...</div>;
    if (error) return <div>Ката: {error}</div>;
    if (!course) return <div>Курс табылган жок</div>;

    const { prev: prevLesson, next: nextLesson } = findPrevNextLessons();
    const totalLessons = sections.reduce((count, sec) => count + (sec.lessons?.length || 0), 0);
    const progress = Math.round((completedLessons.length / totalLessons) * 100);

    return (
        <div className="min-h-screen pt-24">
            <CourseHeader course={course} progress={progress} enrolled={enrolled} />
            <div className="max-w-6xl mx-auto p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2">
                        {activeLesson?.videoUrl && (
                            <CourseVideoPlayer
                                activeLesson={activeLesson}
                                resumeVideoTime={resumeVideoTime}
                                handleVideoProgress={handleVideoProgress}
                                handleTimeUpdate={handleTimeUpdate}
                                videoRef={videoRef}
                                countdown={countdown}
                                progressPercent={progressPercent}
                                nextLesson={nextLesson}
                                prevLesson={prevLesson}
                                handleLessonClick={handleLessonClick}
                                countdownRef={countdownRef}
                                setCountdown={setCountdown}
                                setProgressPercent={setProgressPercent}
                                setCountdownStarted={setCountdownStarted}
                            />
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
            </div>
        </div>
    );
};

export default CourseDetailsPage;
