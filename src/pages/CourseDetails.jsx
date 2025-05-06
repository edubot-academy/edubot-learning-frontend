import React, { useState, useEffect, useRef, useCallback, useContext } from "react";
import { useParams } from "react-router-dom";
import debounce from "lodash.debounce";
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

    useEffect(() => {
        hasPlayedRef.current = false;
    }, [activeLesson]);

    useEffect(() => {
        activeLessonRef.current = activeLesson;
    }, [activeLesson]);

    const scrollToLesson = (lessonId) => {
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

    const debouncedTimeUpdate = useCallback(
        debounce((time) => {
            if (user && enrolled && activeLessonRef.current?.id) {
                updateVideoTime({ courseId: Number(id), lessonId: activeLessonRef.current.id, time });
            }
        }, 3000),
        [id, user, enrolled]
    );

    const handleTimeUpdate = (time) => {
        if (user && enrolled) {
            debouncedTimeUpdate(time);
        }
    };

    const handlePause = () => {
        if (user && enrolled && videoRef.current) {
            const currentTime = videoRef.current.currentTime;
            if (activeLessonRef.current?.id) {
                updateVideoTime({ courseId: Number(id), lessonId: activeLessonRef.current.id, time: currentTime });
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
        console.log('handleLessonClick');
        setActiveLesson(lesson);
        localStorage.setItem(`active_section_${id}`, String(lesson.sectionId));
        setActiveSectionId(lesson.sectionId);
        scrollToLesson(lesson.id);

        setTimeout(() => {
            if (videoRef.current) {
                videoRef.current.load();
                if (!hasPlayedRef.current) {
                    videoRef.current.play().catch(err => console.warn('Autoplay failed:', err));
                }
            }
        }, 0);

        if (user && enrolled && !lesson.locked) {
            await updateLastViewedLesson({ courseId: Number(id), lessonId: lesson.id });
            const videoTime = await getVideoTime(id, lesson.id);

            if (videoTime?.time && videoTime.time < (lesson.duration || 9999) * 0.95 && !completedLessons.includes(lesson.id)) {
                setResumeVideoTime(videoTime.time);
            } else {
                setResumeVideoTime(0);
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

    const handleEnded = async () => {
        if (!hasPlayedRef.current) return;
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
            // 1) ignore any progress events until we see >0
            if (!hasPlayedRef.current) {
                if (progress > 0) {
                    hasPlayedRef.current = true;
                } else {
                    return;
                }
            }

            // 2) only mark if you’re truly in the “active” lesson
            if (
                enrolled &&
                lessonParam.id === activeLessonRef.current?.id &&
                hasPlayedRef.current &&
                progress >= 95 &&
                !completedLessons.includes(lessonParam.id)
            ) {
                console.log('Marking lesson as complete handleVideoProgress');
                const resp = await markLessonComplete(
                    Number(id),
                    lessonParam.sectionId,
                    lessonParam.id
                );
                if (resp.completed) {
                    setCompletedLessons(prev => [...new Set([...prev, lessonParam.id])]);
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
            await updateVideoTime({
                courseId: Number(id),
                lessonId: lesson.id,
                time: 0
            });
            if (activeLesson?.id === lesson.id) {
                setResumeVideoTime(0);
            }
            setCompletedLessons((prev) => prev.filter((lId) => lId !== lesson.id));
        }
    };

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
                        if (videoTime?.time && videoTime.time < 0.95 * (lastLesson.duration || 9999)) {
                            setResumeVideoTime(videoTime.time);
                        } else {
                            setResumeVideoTime(0);
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
