import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    fetchCourseDetails,
    updateCourse,
    publishCourse,
    fetchLessons,
    createLesson,
    updateLesson,
    createSection,
    updateSection,
    fetchCategories,
    fetchSections,
    uploadCourseImage
} from "../services/api";

const EditInstructorCourse = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [originalCourse, setOriginalCourse] = useState(null);
    const [sections, setSections] = useState([]);
    const [originalSections, setOriginalSections] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [courseData, categoryData, sectionData] = await Promise.all([
                    fetchCourseDetails(id),
                    fetchCategories(),
                    fetchSections(id),
                ]);

                const allSections = await Promise.all(
                    sectionData.map(async (sec) => {
                        const lessons = await fetchLessons(id, sec.id);
                        return {
                            id: sec.id,
                            title: sec.title,
                            lessons: lessons.map((l) => ({ ...l, videoFile: null, resourceFile: null })),
                        };
                    })
                );

                setCourse(courseData);
                setOriginalCourse(courseData);
                setCategories(categoryData);
                setSections(allSections);
                setOriginalSections(JSON.parse(JSON.stringify(allSections)));
            } catch (err) {
                console.error("Failed to load course data", err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [id]);

    const isChanged = () => {
        return (
            JSON.stringify(course) !== JSON.stringify(originalCourse) ||
            JSON.stringify(sections) !== JSON.stringify(originalSections)
        );
    };

    const confirmCancel = () => {
        if (isChanged()) {
            setShowCancelConfirm(true);
        } else {
            navigate("/instructor/courses");
        }
    };

    const handleCancel = () => navigate("/instructor/courses");

    const handleCourseChange = (e) => {
        const { name, value, files } = e.target;
        if (files) {
            setCourse((prev) => ({ ...prev, cover: files[0] }));
        } else {
            setCourse((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleLessonFieldChange = (sectionIndex, lessonIndex, field, value) => {
        const updated = [...sections];
        updated[sectionIndex].lessons[lessonIndex][field] = value;
        setSections(updated);
    };

    const updateSectionTitle = (index, title) => {
        const updated = [...sections];
        updated[index].title = title;
        setSections(updated);
    };

    const addSection = () => {
        setSections((prev) => [...prev, { title: `Section ${prev.length + 1}`, lessons: [] }]);
    };

    const addLesson = (sectionIndex) => {
        const updated = [...sections];
        updated[sectionIndex].lessons.push({ title: '', videoFile: null, resourceFile: null });
        setSections(updated);
    };

    const handleSaveAll = async () => {
        try {
            setSaving(true);

            await updateCourse(id, {
                title: course.title,
                description: course.description,
                price: course.price,
                categoryId: course.categoryId
            });

            if (course.cover instanceof File) {
                await uploadCourseImage(id, course.cover);
            }

            for (const section of sections) {
                if (!section.id) {
                    const created = await createSection(id, { title: section.title });
                    section.id = created.id;
                } else {
                    await updateSection(id, section.id, { title: section.title });
                }

                for (const lesson of section.lessons) {
                    if (!lesson.id && lesson.title) {
                        await createLesson(id, section.id, {
                            title: lesson.title,
                            video: lesson.videoFile,
                            resource: lesson.resourceFile,
                        });
                    } else if (lesson.id) {
                        await updateLesson(id, section.id, lesson.id, lesson);
                    }
                }
            }

            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
        } catch (err) {
            console.error("Failed to update course", err);
            alert("Save failed");
        } finally {
            setSaving(false);
        }
    };

    const handlePublish = async () => {
        try {
            await publishCourse(id);
            alert("Course published successfully");
            navigate("/instructor/courses");
        } catch (err) {
            console.error("Failed to publish", err);
            alert("Failed to publish course");
        }
    };

    if (loading) return <div className="p-6">Loading course...</div>;
    if (!course) return <div className="p-6 text-red-500">Course not found</div>;

    return (
        <div className="pt-24 p-6 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Edit Course</h1>

            {showSuccess && <div className="mb-4 p-3 bg-green-100 text-green-800 rounded">Course saved successfully!</div>}

            {course.coverImageUrl && !course.cover && (
                <img src={course.coverImageUrl} alt="Course Cover" className="mb-4 rounded max-h-48 object-cover" />
            )}
            <input
                type="file"
                accept="image/*"
                name="cover"
                onChange={handleCourseChange}
                className="w-full border p-2 mb-4"
            />

            <input
                name="title"
                value={course.title || ""}
                onChange={handleCourseChange}
                placeholder="Course Title"
                className="w-full border p-2 mb-4"
            />
            <textarea
                name="description"
                value={course.description || ""}
                onChange={handleCourseChange}
                placeholder="Course Description"
                className="w-full border p-2 mb-4"
            />
            <select
                name="categoryId"
                value={course.categoryId || ""}
                onChange={handleCourseChange}
                className="w-full border p-2 mb-4"
            >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
            </select>
            <input
                name="price"
                type="number"
                value={course.price || ""}
                onChange={handleCourseChange}
                placeholder="Course Price"
                className="w-full border p-2 mb-8"
            />

            {sections.map((section, sectionIndex) => (
                <div key={sectionIndex} className="border p-4 mb-4">
                    <input
                        value={section.title}
                        onChange={(e) => updateSectionTitle(sectionIndex, e.target.value)}
                        placeholder="Section Title"
                        className="w-full border p-2 mb-2"
                    />
                    {section.lessons.map((lesson, lessonIndex) => (
                        <div key={lessonIndex} className="space-y-2 mb-2">
                            <input
                                value={lesson.title}
                                onChange={(e) => handleLessonFieldChange(sectionIndex, lessonIndex, 'title', e.target.value)}
                                placeholder="Lesson Title"
                                className="w-full border p-2"
                            />
                            <input
                                type="file"
                                accept="video/*"
                                onChange={(e) => handleLessonFieldChange(sectionIndex, lessonIndex, 'videoFile', e.target.files[0])}
                                className="w-full"
                            />
                            {lesson.videoFile && <div className="text-sm text-gray-600">Video ready: {lesson.videoFile.name}</div>}
                            <input
                                type="file"
                                accept=".pdf,.zip,.doc,.docx"
                                onChange={(e) => handleLessonFieldChange(sectionIndex, lessonIndex, 'resourceFile', e.target.files[0])}
                                className="w-full"
                            />
                            {lesson.resourceFile && <div className="text-sm text-gray-600">Resource ready: {lesson.resourceFile.name}</div>}
                        </div>
                    ))}
                    <button
                        onClick={() => addLesson(sectionIndex)}
                        className="mt-2 px-3 py-1 bg-blue-500 text-white rounded"
                    >
                        + Add Lesson
                    </button>
                </div>
            ))}

            <div className="flex flex-wrap gap-4">
                <button
                    onClick={addSection}
                    className="px-4 py-2 bg-green-600 text-white rounded"
                >
                    + Add Section
                </button>
                <button
                    onClick={handleSaveAll}
                    disabled={saving}
                    className="px-6 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
                >
                    {saving ? "Saving..." : "Save All"}
                </button>
                {!course.isPublished && (
                    <button
                        onClick={handlePublish}
                        className="px-6 py-2 bg-green-700 text-white rounded"
                    >
                        Publish
                    </button>
                )}
                <button
                    onClick={confirmCancel}
                    className="px-6 py-2 bg-gray-500 text-white rounded"
                >
                    Cancel
                </button>
            </div>

            {showCancelConfirm && (
                <div className="mt-6 p-4 border border-red-300 rounded bg-red-50">
                    <p className="mb-4 text-red-800">Are you sure you want to cancel? Unsaved changes will be lost.</p>
                    <div className="flex gap-4">
                        <button onClick={handleCancel} className="px-4 py-2 bg-red-600 text-white rounded">Yes, Cancel</button>
                        <button onClick={() => setShowCancelConfirm(false)} className="px-4 py-2 bg-gray-300 text-gray-800 rounded">Go Back</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EditInstructorCourse;
