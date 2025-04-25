// EditInstructorCourse.jsx with CreateCourse-like Upload & Progress Integration
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
    fetchCourseDetails,
    updateCourse,
    fetchLessons,
    createLesson,
    updateLesson,
    createSection,
    updateSection,
    fetchCategories,
    fetchSections,
    uploadCourseImage,
    markCoursePending,
    uploadLessonFile
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
                                previewVideo: l.previewVideo || false,
                                uploadProgress: { video: 0, resource: 0 },
                                uploading: { video: false, resource: false }
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
                toast.error("Маалыматты жүктөө катасы");
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [id]);

    const handleLessonFieldChange = (sectionIndex, lessonIndex, field, value) => {
        setSections(prev => {
            const updated = [...prev];
            updated[sectionIndex].lessons[lessonIndex][field] = value;
            return updated;
        });
    };

    const handleFileUpload = async (sectionIndex, lessonIndex, type, file) => {
        const sectionId = sections[sectionIndex]?.id || sectionIndex;

        setSections(prev => {
            const updated = [...prev];
            updated[sectionIndex].lessons[lessonIndex].uploading[type] = true;
            return updated;
        });

        try {
            const key = await uploadLessonFile(id, sectionId, type, file, (percent) => {
                setSections(prev => {
                    const updated = [...prev];
                    updated[sectionIndex].lessons[lessonIndex].uploadProgress[type] = percent;
                    return updated;
                });
            });

            handleLessonFieldChange(sectionIndex, lessonIndex, type === 'video' ? 'videoKey' : 'resourceKey', key);
        } catch (err) {
            toast.error(err.message);
        } finally {
            setSections(prev => {
                const updated = [...prev];
                updated[sectionIndex].lessons[lessonIndex].uploading[type] = false;
                return updated;
            });
        }
    };

    const isChanged = () => JSON.stringify(course) !== JSON.stringify(originalCourse) || JSON.stringify(sections) !== JSON.stringify(originalSections);
    const confirmCancel = () => isChanged() ? setShowCancelConfirm(true) : navigate("/instructor/courses");
    const handleCancel = () => navigate("/instructor/courses");

    const handleCourseChange = (e) => {
        const { name, value, files } = e.target;
        if (files) {
            setCourse((prev) => ({ ...prev, cover: files[0] }));
        } else {
            setCourse((prev) => ({ ...prev, [name]: value }));
        }
    };

    const updateSectionTitle = (index, title) => {
        setSections(prev => {
            const updated = [...prev];
            updated[index].title = title;
            return updated;
        });
    };

    const addSection = () => {
        setSections(prev => [...prev, {
            title: `Бөлүм ${prev.length + 1}`,
            lessons: []
        }]);
    };

    const addLesson = (sectionIndex) => {
        setSections(prev => {
            const updated = [...prev];
            const newLesson = {
                title: '',
                videoKey: '',
                resourceKey: '',
                previewVideo: false,
                uploadProgress: { video: 0, resource: 0 },
                uploading: { video: false, resource: false },
            };
            updated[sectionIndex] = {
                ...updated[sectionIndex],
                lessons: [...updated[sectionIndex].lessons, newLesson],
            };
            return updated;
        });
    };

    const handleSaveAll = async () => {
        setSaving(true);
        try {
            await updateCourse(id, course);
            if (course.cover instanceof File) await uploadCourseImage(id, course.cover);

            for (const section of sections) {
                if (!section.id) section.id = (await createSection(id, { title: section.title })).id;
                else await updateSection(id, section.id, { title: section.title });

                for (const [i, lesson] of section.lessons.entries()) {
                    const payload = {
                        title: lesson.title,
                        videoKey: lesson.videoKey,
                        resourceKey: lesson.resourceKey,
                        previewVideo: lesson.previewVideo,
                        order: i
                    };

                    if (!lesson.id && lesson.title) await createLesson(id, section.id, payload);
                    else if (lesson.id) await updateLesson(id, section.id, lesson.id, payload);
                }
            }
            toast.success("Курс ийгиликтүү сакталды");
        } catch (err) {
            toast.error("Сактоо ишке ашкан жок");
        } finally {
            setSaving(false);
        }
    };

    const handleSubmitForApproval = async () => {
        try {
            await markCoursePending(id);
            toast.success("Курс модераторго жөнөтүлдү");
            navigate("/instructor/courses");
        } catch (err) {
            toast.error("Курс жөнөтүлбөй калды");
        }
    };

    if (loading) return <div className="p-6">Жүктөлүүдө...</div>;
    if (!course) return <div className="p-6 text-red-500">Курс табылган жок</div>;

    const isUploading = sections.some(section =>
        section.lessons.some(lesson => lesson.uploading?.video || lesson.uploading?.resource)
    );

    const deleteLesson = (sectionIndex, lessonIndex) => {
        setSections(prev => {
            const updated = [...prev];
            updated[sectionIndex].lessons = updated[sectionIndex].lessons.filter((_, idx) => idx !== lessonIndex);
            return updated;
        });
    };

    return (
        <div className="pt-24 p-6 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Курсту өзгөртүү</h1>

            <input type="file" accept="image/*" name="cover" onChange={handleCourseChange} className="w-full border p-2 mb-4" />
            <input name="title" value={course.title || ""} onChange={handleCourseChange} placeholder="Курс аталышы" className="w-full border p-2 mb-4" />
            <textarea name="description" value={course.description || ""} onChange={handleCourseChange} placeholder="Курс сүрөттөмөсү" className="w-full border p-2 mb-4" />
            <select name="categoryId" value={course.categoryId || ""} onChange={handleCourseChange} className="w-full border p-2 mb-4">
                <option value="">Категорияны тандаңыз</option>
                {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
            </select>
            <input name="price" type="number" value={course.price || ""} onChange={handleCourseChange} placeholder="Курс баасы" className="w-full border p-2 mb-8" />

            {sections.map((section, sIdx) => (
                <div key={sIdx} className="border p-4 mb-4">
                    <input value={section.title} onChange={(e) => updateSectionTitle(sIdx, e.target.value)} placeholder="Бөлүм аталышы" className="w-full border p-2 mb-2" />
                    {section.lessons.map((lesson, lIdx) => (
                        <div key={lIdx} className="space-y-2 mb-2 border border-gray-200 rounded p-3">
                            <input value={lesson.title} onChange={(e) => handleLessonFieldChange(sIdx, lIdx, 'title', e.target.value)} placeholder="Сабак аталышы" className="w-full border p-2" />

                            <label className="block mb-1 font-medium">Видео жүктөө</label>
                            <div className="flex items-center justify-between gap-2">
                                <input type="file" accept="video/*" onChange={(e) => handleFileUpload(sIdx, lIdx, 'video', e.target.files[0])} className="w-full mb-1" />
                                {lesson.videoUrl && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-blue-500 whitespace-nowrap">Видео файл бар</span>
                                    </div>
                                )}
                            </div>
                            {lesson.uploadProgress?.video > 0 && (
                                <div className="mb-3">
                                    <div className="w-full bg-gray-200 rounded h-2">
                                        <div className="bg-blue-600 h-full rounded transition-all duration-200" style={{ width: `${lesson.uploadProgress.video}%` }}></div>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">{lesson.uploadProgress.video}% жүктөлдү</p>
                                </div>
                            )}

                            <label className="block mt-3 mb-1 font-medium">Материал жүктөө (PDF, ZIP)</label>
                            <div className="flex items-center justify-between gap-2">
                                <input type="file" accept=".pdf,.zip" onChange={(e) => handleFileUpload(sIdx, lIdx, 'resource', e.target.files[0])} className="w-full mb-1" />
                                {lesson.resourceUrl && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-purple-500 whitespace-nowrap">Материал файл бар</span>
                                    </div>
                                )}
                            </div>
                            {lesson.uploadProgress?.resource > 0 && (
                                <div className="mb-3">
                                    <div className="w-full bg-gray-100 rounded h-2">
                                        <div className="bg-purple-500 h-full rounded transition-all duration-200" style={{ width: `${lesson.uploadProgress.resource}%` }}></div>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">{lesson.uploadProgress.resource}% жүктөлдү</p>
                                </div>
                            )}

                            <label className="flex items-center gap-2">
                                <input type="checkbox" checked={lesson.previewVideo} onChange={(e) => handleLessonFieldChange(sIdx, lIdx, 'previewVideo', e.target.checked)} />
                                Превью видео катары белгилөө
                            </label>

                            <button onClick={() => deleteLesson(sIdx, lIdx)} className="mt-2 px-3 py-1 bg-red-100 text-red-700 border border-red-300 rounded hover:bg-red-200 text-sm">Сабакты өчүрүү</button>
                        </div>
                    ))}
                    <button onClick={() => addLesson(sIdx)} className="mt-2 px-3 py-1 bg-blue-500 text-white rounded">+ Сабак кошуу</button>
                </div>
            ))}

            <div className="flex flex-wrap gap-4">
                <button onClick={addSection} className="px-4 py-2 bg-green-600 text-white rounded">+ Бөлүм кошуу</button>
                <button onClick={handleSaveAll} disabled={saving || isUploading} className="px-6 py-2 bg-blue-600 text-white rounded disabled:opacity-50">
                    {saving ? "Сакталууда..." : "Бардыгын сактоо"}
                </button>
                {!course.isPublished && <button onClick={handleSubmitForApproval} className="px-6 py-2 bg-yellow-600 text-white rounded">Модераторго жөнөтүү</button>}
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
