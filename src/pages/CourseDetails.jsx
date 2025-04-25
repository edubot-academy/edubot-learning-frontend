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
    getLastVideoTime,
    updateLastVideoTime,
    fetchEnrollment,
} from "../services/api";
import { AuthContext } from "../context/AuthContext";

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
                updateLastVideoTime({ courseId: Number(id), time });
            }
        }, 3000),
        [id, user, enrolled]
    );

    const handleTimeUpdate = (time) => {
        if (user && enrolled) {
            debouncedTimeUpdate(time);
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
        setActiveLesson(lesson);
        setActiveSectionId(lesson.sectionId);
        localStorage.setItem(`active_section_${id}`, String(lesson.sectionId));
        scrollToLesson(lesson.id);
        if (user && enrolled && !lesson.locked) {
            await updateLastViewedLesson({ courseId: Number(id), lessonId: lesson.id });
            const videoTime = await getLastVideoTime(id);
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
        const fetchCourse = async () => {
            try {
                let enrollment = { enrolled: false };
                if (user) {
                    enrollment = await fetchEnrollment(id);
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
                            locked: !enrollment.enrolled && !lesson.previewVideo,
                        })),
                }));

                setSections(updatedSections);

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

                if (lastLesson) {
                    setActiveLesson(lastLesson);
                    setActiveSectionId(lastLesson.sectionId);
                    localStorage.setItem(`active_section_${id}`, String(lastLesson.sectionId));
                    scrollToLesson(lastLesson.id);
                    if (user && enrollment.enrolled && !lastLesson.locked) {
                        const videoTime = await getLastVideoTime(id);
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
            <div className="w-full bg-gray-800 text-white min-h-[380px] py-12 px-6 md:px-12">
                <div className="max-w-6xl mx-auto">
                    <h1 className="text-3xl md:text-4xl font-bold mb-2">{course.title}</h1>
                    <p className="text-md md:text-lg leading-relaxed whitespace-pre-line mb-4">{course.description}</p>
                    {course.instructor && (
                        <div className="mt-4 flex items-center gap-4">
                            {(course.instructor.avatar) ? (
                                <img
                                    src={course.instructor.avatar}
                                    alt={course.instructor.fullName}
                                    className="w-12 h-12 rounded-full"
                                />
                            ) : (
                                <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-xl font-bold text-white">
                                    {course.instructor.fullName ? course.instructor.fullName.charAt(0) : course.instructor.fullName?.charAt(0)}
                                </div>
                            )}
                            <div>
                                <p className="font-semibold">{course.instructor.fullName}</p>
                                <p className="text-sm text-gray-300">{course.instructor.bio}</p>
                            </div>
                        </div>
                    )}
                    {enrolled && (
                        <div className="max-w-6xl mx-auto my-6">
                            <div className="w-full bg-gray-300 h-4 rounded-full overflow-hidden">
                                <div className="bg-green-500 h-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                            </div>
                            <p className="text-sm text-gray-700 mt-1">{progress}% бүткөн</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="max-w-6xl mx-auto p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2">
                        {activeLesson?.videoUrl && (
                            <div className="mb-6 relative">
                                <VideoPlayer
                                    videoUrl={activeLesson.videoUrl}
                                    resumeTime={resumeVideoTime}
                                    onProgress={(percent) => handleVideoProgress(percent, activeLesson)}
                                    onTimeUpdate={handleTimeUpdate}
                                    disabled={activeLesson.locked}
                                    allowPlay={!activeLesson.locked}
                                />
                                <button
                                    onClick={() => handleLessonClick(prevLesson)}
                                    disabled={!prevLesson}
                                    className="absolute top-1/2 left-2 transform -translate-y-1/2 text-3xl bg-white bg-opacity-50 rounded-full px-3 py-1 hover:bg-opacity-80 disabled:opacity-30"
                                >
                                    ←
                                </button>
                                <button
                                    onClick={() => handleLessonClick(nextLesson)}
                                    disabled={!nextLesson}
                                    className="absolute top-1/2 right-2 transform -translate-y-1/2 text-3xl bg-white bg-opacity-50 rounded-full px-3 py-1 hover:bg-opacity-80 disabled:opacity-30"
                                >
                                    →
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-md sticky top-28 self-start">
                        <h2 className="text-xl font-semibold mb-4">Курстун мазмуну</h2>
                        {sections.map((section) => {
                            const isOpen = activeSectionId === section.id;
                            return (
                                <div key={section.id} className="mb-4 border-b pb-2">
                                    <div
                                        className="flex justify-between items-center cursor-pointer hover:text-blue-600"
                                        onClick={() => toggleSection(section.id)}
                                    >
                                        <h3 className="font-medium text-lg">{section.title}</h3>
                                        <span>{isOpen ? "▲" : "▼"}</span>
                                    </div>
                                    <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? "max-h-[1000px]" : "max-h-0"}`}>
                                        {isOpen && section.lessons?.map((lesson) => (
                                            <div
                                                key={lesson.id}
                                                ref={(el) => (lessonRefs.current[lesson.id] = el)}
                                                className={`pl-2 py-2 cursor-pointer flex items-center justify-between transition ${activeLesson?.id === lesson.id ? "bg-blue-50 text-blue-600" : "hover:bg-gray-50"}`}
                                                onClick={() => handleLessonClick(lesson)}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={completedLessons.includes(lesson.id)}
                                                        onChange={() => handleCheckboxToggle(lesson)}
                                                        disabled={!enrolled}
                                                    />
                                                    <div className="flex flex-col">
                                                        <span className="flex items-center gap-2">
                                                            {lesson.title}
                                                            {lesson.id === lastViewedLessonId && (
                                                                <span className="text-[10px] bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded font-medium">Улантуу</span>
                                                            )}
                                                        </span>
                                                        {lesson.duration && <span className="text-xs text-gray-500">Узактыгы: {lesson.duration}</span>}
                                                    </div>
                                                </div>
                                                {lesson.resourceUrl && (
                                                    <a
                                                        href={lesson.resourceUrl}
                                                        // target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-xs text-purple-600 hover:underline ml-2 flex items-center gap-1"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 3v4m0 0H6a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V9a2 2 0 00-2-2h-6z" />
                                                        </svg>
                                                        Resource
                                                    </a>
                                                )}
                                                <div className="flex items-center gap-2">
                                                    {lesson.previewVideo && (
                                                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Превью</span>
                                                    )}
                                                    {lesson.locked && (
                                                        <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">Жабык</span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CourseDetailsPage;
