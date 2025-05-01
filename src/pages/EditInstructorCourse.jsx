// Full working EditInstructorCourse.jsx
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
    const [step, setStep] = useState(1);
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
                            order: sec.order, // assuming backend returns order
                            lessons: lessons
                                .sort((a, b) => a.order - b.order)
                                .map((l) => ({
                                    ...l,
                                    uploadProgress: { video: 0, resource: 0 },
                                    uploading: { video: false, resource: false },
                                })),
                        };
                    })
                );

                allSections.sort((a, b) => a.order - b.order); // explicitly sort sections

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


    const handleCourseChange = (e) => {
        const { name, value, files } = e.target;
        if (files) {
            setCourse((prev) => ({ ...prev, cover: files[0], coverImageUrl: URL.createObjectURL(files[0]) }));
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

    const deleteLesson = (sectionIndex, lessonIndex) => {
        setSections(prev => {
            const updated = [...prev];
            updated[sectionIndex].lessons = updated[sectionIndex].lessons.filter((_, idx) => idx !== lessonIndex);
            return updated;
        });
    };

    const handleLessonFieldChange = (sectionIndex, lessonIndex, field, value) => {
        setSections(prev => {
            const updated = [...prev];
            updated[sectionIndex].lessons[lessonIndex][field] = value;
            return updated;
        });
    };

    const handleFileUpload = async (sectionIndex, lessonIndex, type, file) => {

        setSections(prev => {
            const updated = [...prev];
            updated[sectionIndex].lessons[lessonIndex].uploading[type] = true;
            return updated;
        });

        try {
            const key = await uploadLessonFile(id, sectionIndex, type, file, lessonIndex, (percent) => {
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

    const handleCourseSubmit = async () => {
        if (!course.title || !course.description || !course.categoryId || !course.price) {
            toast.error('Сураныч, бардык талааларды толтуруңуз.');
            return;
        }
        try {
            await updateCourse(id, course);
            if (course.cover instanceof File) {
                await uploadCourseImage(id, course.cover);
            }
            toast.success('Курс ийгиликтүү сакталды!');
            setStep(2);
        } catch (err) {
            toast.error('Курс сактоодо ката кетти.');
        }
    };

    const handleSaveAll = async () => {
        setSaving(true);
        try {
            for (const [sectionIdx, section] of sections.entries()) {
                const sectionPayload = {
                    title: section.title,
                    order: sectionIdx, // explicitly set section order
                };

                if (!section.id) {
                    const createdSection = await createSection(id, sectionPayload);
                    section.id = createdSection.id;
                } else {
                    await updateSection(id, section.id, sectionPayload);
                }

                for (const [lessonIdx, lesson] of section.lessons.entries()) {

                    const lessonPayload = {
                        title: lesson.title,
                        videoKey: lesson.videoKey,
                        resourceKey: lesson.resourceKey,
                        previewVideo: lesson.previewVideo,
                        order: lessonIdx,
                    };

                    if (!lesson.id && lesson.title) {
                        await createLesson(id, section.id, lessonPayload);
                    } else if (lesson.id) {
                        await updateLesson(id, section.id, lesson.id, lessonPayload);
                    }
                }
            }

            toast.success("Мазмун сакталды!");
            setStep(3);
        } catch (err) {
            toast.error("Мазмунду сактоодо ката кетти.");
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

    const isChanged = () => JSON.stringify(course) !== JSON.stringify(originalCourse) || JSON.stringify(sections) !== JSON.stringify(originalSections);
    const confirmCancel = () => isChanged() ? setShowCancelConfirm(true) : navigate("/instructor/courses");
    const handleCancel = () => navigate("/instructor/courses");

    if (loading) return <div className="p-6">Жүктөлүүдө...</div>;
    if (!course) return <div className="p-6 text-red-500">Курс табылган жок</div>;

    const isUploading = sections.some(section =>
        section.lessons.some(lesson => lesson.uploading?.video || lesson.uploading?.resource)
    );

    return (
        <div className="pt-24 p-6 max-w-4xl mx-auto">
            <div className="flex gap-4 mb-6">
                <button onClick={() => setStep(1)} className={step === 1 ? 'text-edubot-orange font-bold underline' : ''}>1. Маалымат</button>
                <button onClick={() => setStep(2)} disabled={!course} className={step === 2 ? 'text-edubot-orange font-bold underline' : ''}>2. Мазмун</button>
                <button onClick={() => setStep(3)} disabled={!course} className={step === 3 ? 'text-edubot-orange font-bold underline' : ''}>3. Превью</button>
            </div>

            {step === 1 && (
                <div className="space-y-4">
                    <input name="title" value={course.title || ""} onChange={handleCourseChange} placeholder="Курс аталышы" className="w-full border p-2" />
                    <textarea name="description" value={course.description || ""} onChange={handleCourseChange} placeholder="Курс сүрөттөмөсү" className="w-full border p-2" />
                    <select name="categoryId" value={course.categoryId || ""} onChange={handleCourseChange} className="w-full border p-2">
                        <option value="">Категорияны тандаңыз</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                    <input name="price" type="number" value={course.price || ""} onChange={handleCourseChange} placeholder="Курс баасы" className="w-full border p-2" />
                    {course.coverImageUrl && (<img src={course.coverImageUrl} alt="Курс сүрөтү" className="max-h-48 object-cover rounded" />)}
                    <input type="file" name="cover" accept="image/*" onChange={handleCourseChange} className="w-full border p-2" />
                    <button onClick={handleCourseSubmit} className="bg-edubot-dark text-white px-6 py-2 rounded">Сактоо жана улантуу</button>
                </div>
            )}

            {step === 2 && (
                <div>
                    {sections.map((section, sIdx) => (
                        <div key={sIdx} className="mb-6 border border-edubot-teal rounded p-4">
                            <input className="w-full p-2 border rounded" value={section.title} onChange={(e) => updateSectionTitle(sIdx, e.target.value)} placeholder="Бөлүм аталышы" />
                            {section.lessons.map((lesson, lIdx) => (
                                <div key={lIdx} className="mb-4 p-2 bg-gray-50 rounded">
                                    <input className="w-full p-2 mb-2 border rounded" value={lesson.title} onChange={(e) => handleLessonFieldChange(sIdx, lIdx, 'title', e.target.value)} placeholder="Сабак аталышы" />

                                    <label className="block mb-1 font-medium">Видео жүктөө</label>
                                    <div className="flex items-center justify-between gap-2">
                                        <input type="file" accept="video/*" onChange={(e) => handleFileUpload(sIdx, lIdx, 'video', e.target.files[0])} className="w-full mb-2" />
                                        {lesson.videoUrl && (
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-blue-500 whitespace-nowrap">Видео файл бар</span>
                                            </div>
                                        )}
                                    </div>
                                    {lesson.uploadProgress.video > 0 && (
                                        <div className="mb-2">
                                            <div className="w-full bg-gray-200 rounded h-2">
                                                <div className="bg-blue-600 h-full rounded" style={{ width: `${lesson.uploadProgress.video}%` }}></div>
                                            </div>
                                            <p className="text-xs text-gray-500">{lesson.uploadProgress.video}% жүктөлдү</p>
                                        </div>
                                    )}

                                    <label className="block mt-3 mb-1 font-medium">Материал жүктөө (PDF, ZIP)</label>
                                    <div className="flex items-center justify-between gap-2">
                                        <input type="file" accept=".pdf,.zip" onChange={(e) => handleFileUpload(sIdx, lIdx, 'resource', e.target.files[0])} className="w-full mb-2" />
                                        {lesson.resourceUrl && (
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-purple-500 whitespace-nowrap">Материал файл бар</span>
                                            </div>
                                        )}
                                    </div>
                                    {lesson.uploadProgress.resource > 0 && (
                                        <div className="mb-2">
                                            <div className="w-full bg-gray-100 rounded h-2">
                                                <div className="bg-purple-500 h-full rounded" style={{ width: `${lesson.uploadProgress.resource}%` }}></div>
                                            </div>
                                            <p className="text-xs text-gray-500">{lesson.uploadProgress.resource}% жүктөлдү</p>
                                        </div>
                                    )}

                                    <label className="flex items-center gap-2">
                                        <input type="checkbox" checked={lesson.previewVideo} onChange={(e) => handleLessonFieldChange(sIdx, lIdx, 'previewVideo', e.target.checked)} />
                                        Превью видео катары белгилөө
                                    </label>

                                    <button onClick={() => deleteLesson(sIdx, lIdx)} className="mt-2 px-3 py-1 bg-red-100 text-red-700 border border-red-300 rounded hover:bg-red-200 text-sm">Сабакты өчүрүү</button>
                                </div>
                            ))}
                            <button onClick={() => addLesson(sIdx)} className="bg-edubot-orange text-white px-4 py-1 rounded mt-2">+ Сабак кошуу</button>
                        </div>
                    ))}
                    <div className="flex gap-4">
                        <button onClick={addSection} className="bg-edubot-green text-white px-4 py-2 rounded">+ Бөлүм кошуу</button>
                        <button onClick={handleSaveAll} disabled={isUploading || saving} className="bg-edubot-dark text-white px-6 py-2 rounded">Сактоо жана улантуу</button>
                    </div>
                </div>
            )}

            {step === 3 && (
                <div className="space-y-6">
                    <h3 className="text-xl font-semibold">Курс Превью</h3>
                    <div>
                        <p className="text-lg font-bold">{course.title}</p>
                        <p>{course.description}</p>
                        <p className="italic text-gray-500">Баасы: {course.price} сом</p>
                        {course.coverImageUrl && (<img src={course.coverImageUrl} alt="Курс сүрөтү" className="max-h-48 mt-2 rounded" />)}
                    </div>
                    <div>
                        {sections.map((section, sIdx) => (
                            <div key={sIdx} className="mb-4">
                                <p className="font-semibold">{section.title}</p>
                                <ul className="list-disc list-inside text-sm text-gray-700">
                                    {section.lessons.map((lesson, lIdx) => (
                                        <li key={lIdx}>{lesson.title} {lesson.previewVideo && <span className="text-xs text-green-600">(Превью)</span>}</li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                    <div className="flex gap-4">
                        <button onClick={() => setStep(2)} className="px-4 py-2 bg-gray-200 rounded">Артка</button>
                        <button onClick={handleSubmitForApproval} className="px-6 py-2 bg-edubot-teal text-white rounded">Тастыктоого жөнөтүү</button>
                    </div>
                </div>
            )}

            {showCancelConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded shadow max-w-sm w-full">
                        <h4 className="text-lg font-semibold mb-4">Ырастоо</h4>
                        <p className="mb-6">Өзгөртүүлөр сакталбайт. Чын эле артка кайтасызбы?</p>
                        <div className="flex justify-end gap-4">
                            <button onClick={handleCancel} className="px-4 py-2 bg-red-600 text-white rounded">Ооба</button>
                            <button onClick={() => setShowCancelConfirm(false)} className="px-4 py-2 bg-gray-300 text-gray-800 rounded">Жок</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EditInstructorCourse;
