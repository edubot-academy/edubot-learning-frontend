import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import VideoPlayer from "../components/VideoPlayer";
import { fetchCourseDetails, fetchSections } from "../services/api";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const CourseDetailsPage = () => {
    const { courseId } = useParams();
    const [course, setCourse] = useState(null);
    const [sections, setSections] = useState([]);
    const [activeSectionId, setActiveSectionId] = useState(null);
    const [activeLesson, setActiveLesson] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const data = await fetchCourseDetails(28);
                setCourse(data);

                const sectionData = await fetchSections(28);
                setSections(sectionData);

                if (sectionData.length > 0) {
                    setActiveSectionId(sectionData[0].id);
                    const firstLesson = sectionData[0].lessons?.[0];
                    if (firstLesson) {
                        setActiveLesson(firstLesson);
                    }
                }
            } catch (err) {
                setError(err.message || "Failed to load course.");
            } finally {
                setLoading(false);
            }
        };

        fetchCourse();
    }, [courseId]);

    const toggleSection = (sectionId) => {
        setActiveSectionId((prevId) => (prevId === sectionId ? null : sectionId));
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!course) return <div>Course not found</div>;

    return (
        <div className="min-h-screen p-6 pt-24">
            <div className="max-w-6xl mx-auto">
                {course.coverImageUrl && (
                    <img
                        src={
                            course.coverImageUrl.startsWith("http")
                                ? course.coverImageUrl
                                : `${API_BASE_URL}${course.coverImageUrl}`
                        }
                        alt="Course Cover"
                        className="w-full max-h-72 object-cover rounded mb-6"
                    />
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="md:col-span-2">
                        <h1 className="text-3xl font-bold mb-4">{course.title}</h1>

                        {activeLesson?.videoUrl && (
                            <div className="mb-6">
                                <VideoPlayer videoUrl={activeLesson.videoUrl} />
                            </div>
                        )}

                        {activeLesson && (
                            <div className="bg-white p-6 rounded-lg shadow-md">
                                <h2 className="text-2xl font-semibold mb-4">{activeLesson.title}</h2>
                                <div className="prose max-w-none">{activeLesson.content}</div>
                                {activeLesson.pdfUrl && (
                                    <a
                                        href={activeLesson.pdfUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-block mt-4 text-blue-600 hover:text-blue-800"
                                    >
                                        Download PDF Materials
                                    </a>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Sidebar: Sections and Lessons */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-semibold mb-4">Course Content</h2>

                        {sections.map((section) => (
                            <div key={section.id} className="mb-4 border-b pb-2">
                                <div
                                    className="flex justify-between items-center cursor-pointer hover:text-blue-600"
                                    onClick={() => toggleSection(section.id)}
                                >
                                    <h3 className="font-medium text-lg">{section.title}</h3>
                                    {activeSectionId === section.id ? <FaChevronUp /> : <FaChevronDown />}
                                </div>

                                <div
                                    className={`overflow-hidden transition-all duration-300 ease-in-out ${activeSectionId === section.id ? "max-h-[1000px]" : "max-h-0"
                                        }`}
                                >
                                    {activeSectionId === section.id &&
                                        section.lessons?.map((lesson) => (
                                            <div
                                                key={lesson.id}
                                                className={`pl-4 py-2 cursor-pointer flex items-center justify-between transition ${activeLesson?.id === lesson.id
                                                    ? "bg-blue-50 text-blue-600"
                                                    : "hover:bg-gray-50"
                                                    }`}
                                                onClick={() => {
                                                    if (!lesson.locked) setActiveLesson(lesson);
                                                }}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <span>{lesson.title}</span>
                                                    {lesson.previewVideo && (
                                                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                                            Preview
                                                        </span>
                                                    )}
                                                    {lesson.completed && (
                                                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                                            Completed
                                                        </span>
                                                    )}
                                                </div>
                                                {lesson.locked && (
                                                    <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                                                        Locked
                                                    </span>
                                                )}
                                            </div>
                                        ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CourseDetailsPage;
