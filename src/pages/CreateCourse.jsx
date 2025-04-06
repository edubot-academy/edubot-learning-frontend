// Updated CourseBuilder with cleaner flow: Save and continue only
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
    createCourse,
    createLesson,
    createSection,
    fetchCategories,
    publishCourse,
    uploadCourseImage
} from '../services/api';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const CourseBuilder = () => {
    const { courseId: editCourseId } = useParams();
    const [confirmDelete, setConfirmDelete] = useState({ type: null, sectionIndex: null, lessonIndex: null });
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [courseId, setCourseId] = useState(null);
    const [categories, setCategories] = useState([]);

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
            lessons: [{ title: 'Сабак 1', videoFile: null, resourceFile: null }],
        },
    ]);

    useEffect(() => {
        const getInitialData = async () => {
            try {
                const categoryList = await fetchCategories();
                setCategories(categoryList);

                if (editCourseId) {
                    localStorage.removeItem('draftCourse');
                    const course = await fetchCourseById(editCourseId); // <- You must implement this

                    setCourseId(course.id);
                    setCourseInfo({
                        title: course.title,
                        description: course.description,
                        categoryId: course.categoryId.toString(),
                        price: course.price,
                        cover: null,
                        coverImageUrl: course.coverImageUrl
                    });
                    setCurriculum(course.sections || []);
                } else {
                    const saved = localStorage.getItem('draftCourse');
                    if (saved) {
                        const parsed = JSON.parse(saved);
                        setCourseInfo(parsed.courseInfo || {});
                        setCourseId(parsed.courseId || null);
                        setStep(parsed.step || 1);
                    }
                }
            } catch (error) {
                console.error('Маалыматты жүктөө катасы:', error);
            }
        };

        getInitialData();
    }, []);

    useEffect(() => {
        localStorage.setItem(
            'draftCourse',
            JSON.stringify({ courseInfo, courseId, step })
        );
    }, [courseInfo, courseId, step]);

    const handleCourseInfoChange = (e) => {
        const { name, value, files } = e.target;
        if (name === 'cover' && files && files[0]) {
            setCourseInfo((prev) => ({
                ...prev,
                cover: files[0],
                coverImageUrl: URL.createObjectURL(files[0])
            }));
        } else {
            if ((name === 'title' || name === 'description') && value.length > 200) {
                toast.error(`${name} өтө узун. Максимум 200 символ.`);
                return;
            }
            setCourseInfo((prev) => ({ ...prev, [name]: value }));
        }
    };

    const addSection = () => {
        setCurriculum((prev) => [
            ...prev,
            { sectionTitle: `Бөлүм ${prev.length + 1}`, lessons: [] },
        ]);
    };

    const deleteSection = (sectionIndex) => {
        setConfirmDelete({ type: 'section', sectionIndex });
    };

    const deleteLesson = (sectionIndex, lessonIndex) => {
        setConfirmDelete({ type: 'lesson', sectionIndex, lessonIndex });
    };

    const updateSectionTitle = (index, title) => {
        const updated = [...curriculum];
        updated[index].sectionTitle = title;
        setCurriculum(updated);
    };

    const addLesson = (sectionIndex) => {
        const updated = [...curriculum];
        updated[sectionIndex].lessons.push({ title: '', videoFile: null, resourceFile: null });
        setCurriculum(updated);
    };

    const updateLesson = (sectionIndex, lessonIndex, field, value) => {
        const updated = [...curriculum];
        updated[sectionIndex].lessons[lessonIndex][field] = value;
        setCurriculum(updated);
    };

    const handleCourseSubmit = async () => {
        if (!courseInfo.title || !courseInfo.description) {
            toast.error('Сураныч, бардык талааларды толтуруңуз.');
            return;
        }

        const courseData = {
            title: courseInfo.title,
            description: courseInfo.description,
            categoryId: parseInt(courseInfo.categoryId),
            price: Number(courseInfo.price || 0)
        };

        try {
            const response = await createCourse(courseData);
            setCourseId(response.id);

            if (courseInfo.cover instanceof File) {
                await uploadCourseImage(response.id, courseInfo.cover);
            }

            toast.success('Курс сакталды!');
            setStep(2);
        } catch (error) {
            console.error('Курсту түзүүдө ката:', error);
            toast.error('Курс түзүлбөдү: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleCurriculumSubmit = async () => {
        try {
            for (const section of curriculum) {
                const sectionRes = await createSection(courseId, { title: section.sectionTitle });
                const sectionId = sectionRes.id;

                for (const lesson of section.lessons) {
                    await createLesson(courseId, sectionId, {
                        title: lesson.title,
                        video: lesson.videoFile,
                        resource: lesson.resourceFile,
                    });
                }
            }
            toast.success('Окуу мазмуну сакталды!');
            setStep(3);
        } catch (error) {
            console.error('Окуу мазмунун сактоодо ката:', error);
            toast.error('Сактоо ишке ашкан жок');
        }
    };

    const [showConfirmModal, setShowConfirmModal] = useState(false);

    const handlePublish = async () => {
        const hasEmptySections = curriculum.some(section => !section.sectionTitle.trim());
        const hasEmptyLessons = curriculum.some(section => section.lessons.some(lesson => !lesson.title.trim()));

        if (!courseInfo.title || !courseInfo.description || !courseInfo.categoryId || !courseInfo.price) {
            toast.error('Курс маалыматы толук эмес. Сураныч, текшериңиз.');
            return;
        }

        if (!curriculum.length || hasEmptySections || hasEmptyLessons) {
            toast.error('Окуу мазмуну толук эмес. Ар бир бөлүм жана сабак аталышын текшериңиз.');
            return;
        }

        try {
            await publishCourse(courseId);
            toast.success('Курс ийгиликтүү жарыяланды! Баракча которулууда...');
            navigate(`/courses/${courseId}`);
        } catch (error) {
            console.error('Курсту жарыялоо катасы:', error);
            toast.error('Курс жарыяланган жок');
        }
    };

    return (
        <div className="pt-24 p-6 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Жаңы курс түзүү</h2>

            <div className="flex gap-4 mb-6">
                <button onClick={() => setStep(1)} className={step === 1 ? 'font-bold underline' : ''}>1. Маалымат</button>
                <button disabled={!courseId} onClick={() => setStep(2)} className={step === 2 ? 'font-bold underline' : ''}>2. Мазмун</button>
                <button disabled={!courseId} onClick={() => setStep(3)} className={step === 3 ? 'font-bold underline' : ''}>3. Жарыялоо</button>
            </div>

            {step === 1 && (
                <div className="space-y-4">
                    <input name="title" value={courseInfo.title} onChange={handleCourseInfoChange} placeholder="Курс аталышы" className="w-full border p-2" />
                    <textarea name="description" value={courseInfo.description} onChange={handleCourseInfoChange} placeholder="Курс сүрөттөмөсү" className="w-full border p-2" />
                    <select name="categoryId" value={courseInfo.categoryId} onChange={handleCourseInfoChange} className="w-full border p-2">
                        <option value="">Категорияны тандаңыз</option>
                        {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                    <input name="price" type="number" value={courseInfo.price} onChange={handleCourseInfoChange} placeholder="Курс баасы" className="w-full border p-2" />
                    {courseInfo.coverImageUrl && (<img src={courseInfo.coverImageUrl} alt="Курс сүрөтү" className="max-h-48 rounded object-cover mb-2" />)}
                    <label className="block text-sm font-medium text-gray-700">Курс мукабасынын сүрөтү</label>
                    <input type="file" name="cover" accept="image/*" onChange={handleCourseInfoChange} className="w-full border p-2" />
                    <button onClick={handleCourseSubmit} className="px-6 py-2 bg-blue-600 text-white rounded">Сактоо жана улантуу</button>
                </div>
            )}

            {step === 2 && (
                <div>
                    <h3 className="text-xl font-semibold mb-4">Окуу мазмуну</h3>
                    {curriculum.map((section, sectionIndex) => (
                        <div key={sectionIndex} className="border p-4 mb-4">
                            <div className="flex justify-between items-center mb-2">
                                <input value={section.sectionTitle} onChange={(e) => updateSectionTitle(sectionIndex, e.target.value)} placeholder="Бөлүмдүн аталышы" className="w-full border p-2 mr-2" />
                                <button onClick={() => deleteSection(sectionIndex)} className="text-white bg-red-600 hover:bg-red-700 px-3 py-1 rounded transition">Өчүрүү</button>
                            </div>
                            {section.lessons.map((lesson, lessonIndex) => (
                                <div key={lessonIndex} className="space-y-2 mb-2 border p-2 rounded">
                                    <input value={lesson.title} onChange={(e) => updateLesson(sectionIndex, lessonIndex, 'title', e.target.value)} placeholder="Сабактын аталышы" className="w-full border p-2" />
                                    <label className="block text-sm text-gray-700">Сабак видеосу</label>
                                    <input type="file" accept="video/*" onChange={(e) => updateLesson(sectionIndex, lessonIndex, 'videoFile', e.target.files[0])} className="w-full" />
                                    <label className="block text-sm text-gray-700">Кошумча материал (PDF, ZIP, DOC)</label>
                                    <input type="file" accept=".pdf,.zip,.doc,.docx" onChange={(e) => updateLesson(sectionIndex, lessonIndex, 'resourceFile', e.target.files[0])} className="w-full" />
                                    <button onClick={() => deleteLesson(sectionIndex, lessonIndex)} className="text-white bg-red-600 hover:bg-red-700 px-3 py-1 rounded transition">Сабакты өчүрүү</button>
                                </div>
                            ))}
                            <button onClick={() => addLesson(sectionIndex)} className="mt-2 px-3 py-1 bg-blue-500 text-white rounded">+ Сабак кошуу</button>
                        </div>
                    ))}
                    <button onClick={addSection} className="px-4 py-2 bg-green-600 text-white rounded mb-6">+ Бөлүм кошуу</button>
                    <button onClick={handleCurriculumSubmit} className="px-6 py-2 bg-purple-600 text-white rounded">Сактоо жана улантуу</button>
                </div>
            )}

            {step === 3 && (
                <div className="text-center">
                    <h3 className="text-xl font-semibold mb-4">Курсту жарыялоого даярсызбы?</h3>
                    <p className="mb-4">Курс сакталды. Жарыялоого же кийинчерээк өзгөртүүгө болот.</p>
                    <button onClick={() => setShowConfirmModal(true)} className="px-6 py-2 bg-green-700 text-white rounded">Курсту жарыялоо</button>
                </div>
            )}

            {showConfirmModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white p-6 rounded shadow-lg max-w-md w-full">
                        <h4 className="text-lg font-bold mb-4">Ырастоо</h4>
                        <p className="mb-6">Курсту жарыялоону чындап каалайсызбы? Жарыялагандан кийин студенттер көрө алышат.</p>
                        <div className="flex justify-end gap-4">
                            <button onClick={() => setShowConfirmModal(false)} className="px-4 py-2 bg-gray-300 rounded">Жок</button>
                            <button onClick={() => { setShowConfirmModal(false); handlePublish(); }} className="px-4 py-2 bg-green-600 text-white rounded">Ооба, жарыялоо</button>
                        </div>
                    </div>
                </div>
            )}

            {confirmDelete.type && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white p-6 rounded shadow-lg max-w-sm w-full">
                        <h4 className="text-lg font-semibold mb-4">Ырастоо</h4>
                        <p className="mb-6">
                            {confirmDelete.type === 'section'
                                ? 'Бул бөлүмдү өчүрүүнү каалайсызбы?'
                                : 'Бул сабакты өчүрүүнү каалайсызбы?'}
                        </p>
                        <div className="flex justify-end gap-4">
                            <button onClick={() => setConfirmDelete({ type: null, sectionIndex: null, lessonIndex: null })} className="px-4 py-2 bg-gray-300 rounded">Жок</button>
                            <button onClick={() => {
                                if (confirmDelete.type === 'section') {
                                    const updated = curriculum.filter((_, i) => i !== confirmDelete.sectionIndex);
                                    setCurriculum(updated);
                                } else if (confirmDelete.type === 'lesson') {
                                    const updated = [...curriculum];
                                    updated[confirmDelete.sectionIndex].lessons = updated[confirmDelete.sectionIndex].lessons.filter((_, i) => i !== confirmDelete.lessonIndex);
                                    setCurriculum(updated);
                                }
                                setConfirmDelete({ type: null, sectionIndex: null, lessonIndex: null });
                            }} className="px-4 py-2 bg-red-600 text-white rounded">Ооба, өчүрүү</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CourseBuilder;
