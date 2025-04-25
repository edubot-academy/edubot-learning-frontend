import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    createCourse,
    createLesson,
    createSection,
    fetchCategories,
    uploadCourseImage,
    markCoursePending,
    uploadLessonFile
} from '../services/api';
import toast from 'react-hot-toast';

const CourseBuilder = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [courseId, setCourseId] = useState(null);
    const [categories, setCategories] = useState([]);
    const [confirmDelete, setConfirmDelete] = useState({ type: null, sectionIndex: null, lessonIndex: null });

    const [courseInfo, setCourseInfo] = useState({
        title: '',
        description: '',
        categoryId: '',
        price: '',
        cover: null,
        coverImageUrl: '',
    });

    const [curriculum, setCurriculum] = useState([
        {
            sectionTitle: 'Бөлүм 1',
            lessons: [
                {
                    title: 'Сабак 1',
                    videoKey: '',
                    resourceKey: '',
                    previewVideo: false,
                    uploadProgress: { video: 0, resource: 0 },
                    uploading: { video: false, resource: false },
                },
            ],
        },
    ]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await fetchCategories();
                setCategories(data);
                const saved = localStorage.getItem('draftCourse');
                if (saved) {
                    const parsed = JSON.parse(saved);
                    setCourseInfo(parsed.courseInfo || {});
                    setCourseId(parsed.courseId || null);
                    setStep(parsed.step || 1);
                }
            } catch (err) {
                toast.error('Маалымат жүктөлбөдү');
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        localStorage.setItem('draftCourse', JSON.stringify({ courseInfo, courseId, step }));
    }, [courseInfo, courseId, step]);

    const handleCourseInfoChange = (e) => {
        const { name, value, files } = e.target;
        if (name === 'cover' && files && files[0]) {
            setCourseInfo(prev => ({ ...prev, cover: files[0], coverImageUrl: URL.createObjectURL(files[0]) }));
        } else {
            if (name === 'title' && value.length > 200) {
                toast.error(`${name} өтө узун. Максимум 200 символ.`);
                return;
            }
            setCourseInfo(prev => ({ ...prev, [name]: value }));
        }
    };

    const addSection = () => {
        setCurriculum(prev => [...prev, { sectionTitle: `Бөлүм ${prev.length + 1}`, lessons: [] }]);
    };

    const addLesson = (sectionIndex) => {
        const updated = [...curriculum];
        updated[sectionIndex].lessons.push({
            title: '',
            videoKey: '',
            resourceKey: '',
            previewVideo: false,
            uploadProgress: { video: 0, resource: 0 },
            uploading: { video: false, resource: false },
        });
        setCurriculum(updated);
    };

    const updateSectionTitle = (index, title) => {
        const updated = [...curriculum];
        updated[index].sectionTitle = title;
        setCurriculum(updated);
    };

    const updateLesson = (sectionIndex, lessonIndex, field, value) => {
        setCurriculum(prev => {
            const updated = [...prev];
            updated[sectionIndex].lessons[lessonIndex][field] = value;
            return updated;
        });
    };

    const handleDelete = () => {
        if (confirmDelete.type === 'section' && curriculum.length === 1) {
            toast.error('Кеминде бир бөлүм болушу керек.');
            return;
        }
        if (confirmDelete.type === 'lesson') {
            const lessons = curriculum[confirmDelete.sectionIndex].lessons;
            if (lessons.length === 1) {
                toast.error('Кеминде бир сабак болушу керек.');
                return;
            }
        }
        if (confirmDelete.type === 'section') {
            const updated = curriculum.filter((_, i) => i !== confirmDelete.sectionIndex);
            setCurriculum(updated);
        } else if (confirmDelete.type === 'lesson') {
            const updated = [...curriculum];
            updated[confirmDelete.sectionIndex].lessons = updated[confirmDelete.sectionIndex].lessons.filter((_, i) => i !== confirmDelete.lessonIndex);
            setCurriculum(updated);
        }
        setConfirmDelete({ type: null, sectionIndex: null, lessonIndex: null });
    };


    const handleFileUpload = async (courseId, sectionIndex, lessonIndex, type, file) => {
        if (!file) return;
        const existingKey = curriculum[sectionIndex].lessons[lessonIndex][type === 'video' ? 'videoKey' : 'resourceKey'];
        if (existingKey) return;
        setCurriculum(prev => {
            const updated = [...prev];
            updated[sectionIndex].lessons[lessonIndex].uploading[type] = true;
            return updated;
        });

        try {
            const key = await uploadLessonFile(courseId, sectionIndex, type, file, (percent) => {
                setCurriculum(prev => {
                    const updated = [...prev];
                    updated[sectionIndex].lessons[lessonIndex].uploadProgress[type] = percent;
                    return updated;
                });
            });

            updateLesson(sectionIndex, lessonIndex, type === 'video' ? 'videoKey' : 'resourceKey', key);
        } catch (err) {
            toast.error(err.message);
        } finally {
            setCurriculum(prev => {
                const updated = [...prev];
                updated[sectionIndex].lessons[lessonIndex].uploading[type] = false;
                return updated;
            });
        }
    };

    const isUploading = curriculum.some(section =>
        section.lessons.some(lesson => lesson.uploading?.video || lesson.uploading?.resource)
    );


    const handleCourseSubmit = async () => {
        if (!courseInfo.title || !courseInfo.description || !courseInfo.categoryId || !courseInfo.price) {
            toast.error('Сураныч, бардык талааларды толтуруңуз.');
            return;
        }
        try {
            const course = await createCourse({
                title: courseInfo.title,
                description: courseInfo.description,
                categoryId: parseInt(courseInfo.categoryId),
                price: Number(courseInfo.price),
            });
            setCourseId(course.id);
            if (courseInfo.cover instanceof File) {
                await uploadCourseImage(course.id, courseInfo.cover);
            }
            toast.success('Курс ийгиликтүү түзүлдү!');
            setStep(2);
        } catch (err) {
            toast.error('Курс түзүүдө ката кетти.');
        }
    };

    const handleCurriculumSubmit = async () => {
        try {
            for (const [sIdx, section] of curriculum.entries()) {
                const sec = await createSection(courseId, { title: section.sectionTitle });
                for (const [lIdx, lesson] of section.lessons.entries()) {
                    if (!lesson.title || !lesson.videoKey) {
                        toast.error('Ар бир сабакта аталыш жана видео болушу керек.');
                        continue;
                    }
                    await createLesson(courseId, sec.id, {
                        title: lesson.title,
                        videoKey: lesson.videoKey,
                        resourceKey: lesson.resourceKey,
                        previewVideo: lesson.previewVideo,
                        order: lIdx,
                    });
                }
            }
            toast.success('Мазмун сакталды!');
            setStep(3);
        } catch (err) {
            console.error(err);
            toast.error('Мазмунду сактоодо ката кетти.');
        }
    };

    const renderPreview = () => (
        <div className="space-y-6">
            <h3 className="text-xl font-semibold">Курс Превью</h3>
            <div>
                <p className="text-lg font-bold">{courseInfo.title}</p>
                <p>{courseInfo.description}</p>
                <p className="italic text-gray-500">Баасы: {courseInfo.price} сом</p>
                {courseInfo.coverImageUrl && (
                    <img
                        src={courseInfo.coverImageUrl}
                        alt="cover"
                        className="max-h-48 mt-2 rounded"
                    />
                )}
            </div>
            <div>
                {curriculum.map((section, sIdx) => (
                    <div key={sIdx} className="mb-4">
                        <p className="font-semibold">{section.sectionTitle}</p>
                        <ul className="list-disc list-inside text-sm text-gray-700">
                            {section.lessons.map((lesson, lIdx) => (
                                <li key={lIdx}>
                                    {lesson.title}
                                    {lesson.previewVideo && (
                                        <span className="text-xs text-green-600"> (Превью)</span>
                                    )}
                                    {lesson.videoFile && (
                                        <span className="text-xs text-blue-500">
                                            {" "}- Видео кошулган ({lesson.videoFile.name})
                                        </span>
                                    )}
                                    {lesson.resourceFile && (
                                        <span className="text-xs text-purple-500">
                                            {" "}- Материал кошулган ({lesson.resourceFile.name})
                                        </span>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
            <div className="flex gap-4">
                <button
                    onClick={() => setStep(2)}
                    className="px-4 py-2 bg-gray-200 rounded"
                >
                    Артка
                </button>

                <button
                    onClick={() => {
                        toast.success("Курс каралууга сакталды");
                        localStorage.removeItem("draftCourse");
                        navigate("/instructor/courses");
                    }}
                    className="px-6 py-2 bg-gray-800 text-white rounded"
                >
                    Сактап чыгуу
                </button>

                <button
                    onClick={async () => {
                        try {
                            await markCoursePending(courseId); // <- You need this API in backend
                            toast.success("Курс тастыктоого жөнөтүлдү");
                            localStorage.removeItem("draftCourse");
                            navigate("/instructor/courses");
                        } catch (err) {
                            toast.error("Жөнөтүүдө ката кетти");
                        }
                    }}
                    className="px-6 py-2 bg-edubot-teal text-white rounded"
                >
                    Тастыктоого жөнөтүү
                </button>
            </div>

        </div>
    );


    return (
        <div className="pt-24 p-6 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-edubot-dark mb-6">Жаңы курс түзүү</h2>

            <div className="flex gap-4 mb-6">
                <button onClick={() => setStep(1)} className={step === 1 ? 'text-edubot-orange font-bold underline' : ''}>1. Маалымат</button>
                <button onClick={() => setStep(2)} disabled={!courseId} className={step === 2 ? 'text-edubot-orange font-bold underline' : ''}>2. Мазмун</button>
                <button onClick={() => setStep(3)} disabled={!courseId} className={step === 3 ? 'text-edubot-orange font-bold underline' : ''}>3. Превью</button>
            </div>

            {step === 1 && (
                <div className="space-y-4">
                    <input name="title" value={courseInfo.title} onChange={handleCourseInfoChange} placeholder="Курс аталышы" className="w-full border p-2" />
                    <textarea name="description" value={courseInfo.description} onChange={handleCourseInfoChange} placeholder="Курс сүрөттөмөсү" className="w-full border p-2" />
                    <select name="categoryId" value={courseInfo.categoryId} onChange={handleCourseInfoChange} className="w-full border p-2">
                        <option value="">Категорияны тандаңыз</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                    <input name="price" type="number" value={courseInfo.price} onChange={handleCourseInfoChange} placeholder="Курс баасы" className="w-full border p-2" />
                    {courseInfo.coverImageUrl && (<img src={courseInfo.coverImageUrl} alt="Курс сүрөтү" className="max-h-48 object-cover rounded" />)}
                    <input type="file" name="cover" accept="image/*" onChange={handleCourseInfoChange} className="w-full border p-2" />
                    <button onClick={handleCourseSubmit} className="bg-edubot-dark text-white px-6 py-2 rounded">Сактоо жана улантуу</button>
                </div>
            )}

            {step === 2 && (
                <div>
                    <h3 className="text-xl font-semibold mb-4">Окуу мазмуну</h3>
                    {curriculum.map((section, sIdx) => (
                        <div key={sIdx} className="mb-6 border border-edubot-teal rounded p-4">
                            <div className="flex justify-between items-center mb-2">
                                <input className="w-full p-2 border rounded" value={section.sectionTitle} onChange={(e) => updateSectionTitle(sIdx, e.target.value)} placeholder="Бөлүм аталышы" />
                                <button onClick={() => setConfirmDelete({ type: 'section', sectionIndex: sIdx })} className="px-3 py-1 bg-red-100 text-red-700 border border-red-300 rounded hover:bg-red-200 text-sm">Өчүрүү</button>
                            </div>
                            {section.lessons.map((lesson, lIdx) => (
                                <div key={lIdx} className="mb-4 p-2 bg-gray-50 rounded">
                                    <input className="w-full p-2 mb-2 border rounded" value={lesson.title} onChange={(e) => updateLesson(sIdx, lIdx, 'title', e.target.value)} placeholder="Сабак аталышы" />
                                    <label className="block mb-1 font-medium">Видео жүктөө</label>
                                    <input type="file" accept="video/*" className="w-full mb-2" onChange={(e) => handleFileUpload(courseId, sIdx, lIdx, 'video', e.target.files[0])} />
                                    {lesson.uploadProgress.video > 0 && (
                                        <div className="w-full bg-gray-200 rounded h-2 mb-4">
                                            <div className="bg-blue-600 h-full rounded transition-all duration-200" style={{ width: `${lesson.uploadProgress.video}%` }} />
                                            <p className="text-xs text-gray-500 mt-1">{lesson.uploadProgress.video}% жүктөлдү</p>
                                        </div>
                                    )}
                                    <label className="block mt-4 mb-1 font-medium">Материал жүктөө (PDF, ZIP)</label>
                                    <input type="file" accept=".pdf,.zip" onChange={(e) => handleFileUpload(courseId, sIdx, lIdx, 'resource', e.target.files[0])} className="w-full mb-2" />
                                    {lesson.uploadProgress.resource > 0 && (
                                        <div className="w-full bg-gray-100 rounded h-2 mb-4">
                                            <div className="bg-purple-500 h-full rounded transition-all duration-200" style={{ width: `${lesson.uploadProgress.resource}%` }} />
                                            <p className="text-xs text-gray-500 mt-1">{lesson.uploadProgress.resource}% жүктөлдү</p>
                                        </div>
                                    )}
                                    <label className="flex items-center gap-2">
                                        <input type="checkbox" checked={lesson.previewVideo} onChange={(e) => updateLesson(sIdx, lIdx, 'previewVideo', e.target.checked)} />
                                        Превью видеосун белгилөө
                                    </label>
                                    <button onClick={() => setConfirmDelete({ type: 'lesson', sectionIndex: sIdx, lessonIndex: lIdx })} className="mt-2 px-3 py-1 bg-red-100 text-red-700 border border-red-300 rounded hover:bg-red-200 text-sm">Сабакты өчүрүү</button>
                                </div>
                            ))}
                            <button onClick={() => addLesson(sIdx)} className="bg-edubot-orange text-white px-4 py-1 rounded mt-2">+ Сабак кошуу</button>
                        </div>
                    ))}
                    <button onClick={addSection} className="bg-edubot-green text-white px-4 py-2 rounded">+ Бөлүм кошуу</button>
                    <button onClick={handleCurriculumSubmit} disabled={isUploading} className="bg-edubot-dark text-white px-6 py-2 rounded ml-4">Сактоо жана улантуу</button>
                </div>
            )}

            {step === 3 && renderPreview()}

            {confirmDelete.type && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded shadow max-w-sm w-full">
                        <h4 className="text-lg font-semibold mb-4">Ырастоо</h4>
                        <p className="mb-6">
                            {confirmDelete.type === 'section'
                                ? 'Бул бөлүмдү өчүрүүнү каалайсызбы?'
                                : 'Бул сабакты өчүрүүнү каалайсызбы?'}
                        </p>
                        <div className="flex justify-end gap-4">
                            <button onClick={() => setConfirmDelete({ type: null, sectionIndex: null, lessonIndex: null })} className="px-4 py-2 bg-gray-200 rounded">Жок</button>
                            <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded">Ооба, өчүрүү</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CourseBuilder;
