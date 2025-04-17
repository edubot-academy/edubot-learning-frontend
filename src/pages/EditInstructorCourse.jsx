import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
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
    uploadCourseImage,
    markCoursePending
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
                            lessons: lessons.map((l) => ({
                                ...l,
                                videoFile: null,
                                resourceFile: null,
                                previewVideo: l.previewVideo || false
                            })),
                        };
                    })
                );

                setCourse(courseData);
                setOriginalCourse(courseData);
                setCategories(categoryData);
                setSections(allSections);
                setOriginalSections(JSON.parse(JSON.stringify(allSections)));
            } catch (err) {
                console.error("Маалыматты жүктөө катасы", err);
                toast.error("Маалыматты жүктөө катасы");
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
        setSections((prev) => [...prev, { title: `Бөлүм ${prev.length + 1}`, lessons: [] }]);
    };

    const addLesson = (sectionIndex) => {
        const updated = [...sections];
        updated[sectionIndex].lessons.push({ title: '', videoFile: null, resourceFile: null, previewVideo: false });
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

                for (const [lessonIndex, lesson] of section.lessons.entries()) {
                    const payload = {
                        title: lesson.title,
                        video: lesson.videoFile,
                        resource: lesson.resourceFile,
                        previewVideo: lesson.previewVideo,
                        order: lessonIndex
                    };

                    if (!lesson.id && lesson.title) {
                        await createLesson(id, section.id, payload);
                    } else if (lesson.id) {
                        await updateLesson(id, section.id, lesson.id, payload);
                    }
                }
            }

            toast.success("Курс ийгиликтүү сакталды");
        } catch (err) {
            console.error("Курсту сактоо катасы", err);
            toast.error("Сактоо ишке ашкан жок");
        } finally {
            setSaving(false);
        }
    };

    const handlePublish = async () => {
        try {
            await publishCourse(id);
            toast.success("Курс ийгиликтүү жарыяланды");
            navigate("/instructor/courses");
        } catch (err) {
            console.error("Курсту жарыялоо катасы", err);
            toast.error("Курсту жарыялоо ишке ашкан жок");
        }
    };

    const handleSubmitForApproval = async () => {
        try {
            await markCoursePending(id);
            toast.success("Курс модераторго жөнөтүлдү");
            navigate("/instructor/courses");
        } catch (err) {
            console.error("Жөнөтүү катасы", err);
            toast.error("Курс жөнөтүлбөй калды");
        }
    };

    if (loading) return <div className="p-6">Жүктөлүүдө...</div>;
    if (!course) return <div className="p-6 text-red-500">Курс табылган жок</div>;

    return (
        <div className="pt-24 p-6 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Курсту өзгөртүү</h1>

            {course.coverImageUrl && !course.cover && (
                <img src={course.coverImageUrl} alt="Course Cover" className="mb-4 rounded max-h-48 object-cover" />
            )}
            <input type="file" accept="image/*" name="cover" onChange={handleCourseChange} className="w-full border p-2 mb-4" />

            <input name="title" value={course.title || ""} onChange={handleCourseChange} placeholder="Курс аталышы" className="w-full border p-2 mb-4" />
            <textarea name="description" value={course.description || ""} onChange={handleCourseChange} placeholder="Курс сүрөттөмөсү" className="w-full border p-2 mb-4" />
            <select name="categoryId" value={course.categoryId || ""} onChange={handleCourseChange} className="w-full border p-2 mb-4">
                <option value="">Категорияны тандаңыз</option>
                {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
            </select>
            <input name="price" type="number" value={course.price || ""} onChange={handleCourseChange} placeholder="Курс баасы" className="w-full border p-2 mb-8" />

            {sections.map((section, sectionIndex) => (
                <div key={sectionIndex} className="border p-4 mb-4">
                    <input value={section.title} onChange={(e) => updateSectionTitle(sectionIndex, e.target.value)} placeholder="Бөлүм аталышы" className="w-full border p-2 mb-2" />
                    {section.lessons.map((lesson, lessonIndex) => (
                        <div key={lessonIndex} className="space-y-2 mb-2">
                            <input value={lesson.title} onChange={(e) => handleLessonFieldChange(sectionIndex, lessonIndex, 'title', e.target.value)} placeholder="Сабак аталышы" className="w-full border p-2" />
                            <input type="file" accept="video/*" onChange={(e) => handleLessonFieldChange(sectionIndex, lessonIndex, 'videoFile', e.target.files[0])} className="w-full" />
                            {lesson.videoFile && <div className="text-sm text-gray-600">Видео дайын: {lesson.videoFile.name}</div>}
                            <input type="file" accept=".pdf,.zip,.doc,.docx" onChange={(e) => handleLessonFieldChange(sectionIndex, lessonIndex, 'resourceFile', e.target.files[0])} className="w-full" />
                            {lesson.resourceFile && <div className="text-sm text-gray-600">Материал дайын: {lesson.resourceFile.name}</div>}
                            <label className="flex items-center gap-2">
                                <input type="checkbox" checked={lesson.previewVideo} onChange={(e) => handleLessonFieldChange(sectionIndex, lessonIndex, 'previewVideo', e.target.checked)} />
                                Превью видео катары белгилөө
                            </label>
                        </div>
                    ))}
                    <button onClick={() => addLesson(sectionIndex)} className="mt-2 px-3 py-1 bg-blue-500 text-white rounded">+ Сабак кошуу</button>
                </div>
            ))}

            <div className="flex flex-wrap gap-4">
                <button onClick={addSection} className="px-4 py-2 bg-green-600 text-white rounded">+ Бөлүм кошуу</button>
                <button onClick={handleSaveAll} disabled={saving} className="px-6 py-2 bg-blue-600 text-white rounded disabled:opacity-50">
                    {saving ? "Сакталууда..." : "Бардыгын сактоо"}
                </button>
                {!course.isPublished && (
                    <>
                        {/* <button onClick={handlePublish} className="px-6 py-2 bg-edubot-teal text-white rounded">Жарыялоо</button> */}
                        <button onClick={handleSubmitForApproval} className="px-6 py-2 bg-yellow-600 text-white rounded">Модераторго жөнөтүү</button>
                    </>
                )}
                <button onClick={confirmCancel} className="px-6 py-2 bg-gray-500 text-white rounded">Артка кайтуу</button>
            </div>

            {showCancelConfirm && (
                <div className="mt-6 p-4 border border-red-300 rounded bg-red-50">
                    <p className="mb-4 text-red-800">Өзгөртүүлөр сакталбайт. Чын эле артка кайтасызбы?</p>
                    <div className="flex gap-4">
                        <button onClick={handleCancel} className="px-4 py-2 bg-red-600 text-white rounded">Ооба</button>
                        <button onClick={() => setShowCancelConfirm(false)} className="px-4 py-2 bg-gray-300 text-gray-800 rounded">Жок</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EditInstructorCourse;
