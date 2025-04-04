// CourseBuilder.jsx
import React, { useState, useEffect } from 'react';
import {
    createCourse,
    createLesson,
    createSection,
    fetchCategories,
    publishCourse,
    uploadCourseImage
} from '../services/api';
import { useNavigate } from 'react-router-dom';

const LOCAL_STORAGE_KEY = 'draftCourse';

const CourseBuilder = () => {
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
            sectionTitle: 'Section 1',
            lessons: [{ title: 'Lesson 1', videoFile: null, resourceFile: null }],
        },
    ]);

    useEffect(() => {
        const getCategories = async () => {
            try {
                const data = await fetchCategories();
                setCategories(data);
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };
        getCategories();

        const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            setCourseInfo(parsed.courseInfo || {});
            setCourseId(parsed.courseId || null);
            setStep(parsed.step || 1);
        }
    }, []);

    useEffect(() => {
        localStorage.setItem(
            LOCAL_STORAGE_KEY,
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
            setCourseInfo((prev) => ({ ...prev, [name]: value }));
        }
    };

    const addSection = () => {
        setCurriculum((prev) => [
            ...prev,
            { sectionTitle: `Section ${prev.length + 1}`, lessons: [] },
        ]);
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
        if (courseId) {
            setStep(2);
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

            setStep(2);
        } catch (error) {
            console.error('Failed to create course:', error);
            alert('Failed to create course: ' + (error.response?.data?.message || error.message));
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
            setStep(3);
        } catch (error) {
            console.error('Failed to save curriculum', error);
        }
    };

    const handlePublish = async () => {
        try {
            await publishCourse(courseId);
            localStorage.removeItem(LOCAL_STORAGE_KEY);
            alert('Course published successfully! Redirecting...');
            navigate(`/courses/${courseId}`);
        } catch (error) {
            console.error('Failed to publish course:', error);
            alert('Failed to publish course');
        }
    };

    return (
        <div className="pt-24 p-6 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Create a New Course</h2>

            {/* Step Navigation */}
            <div className="flex gap-4 mb-6">
                <button onClick={() => setStep(1)} className={step === 1 ? 'font-bold' : ''}>1. Info</button>
                <button disabled={!courseId} onClick={() => setStep(2)} className={step === 2 ? 'font-bold' : ''}>2. Curriculum</button>
                <button disabled={!courseId} onClick={() => setStep(3)} className={step === 3 ? 'font-bold' : ''}>3. Publish</button>
            </div>

            {/* Step 1: Course Info */}
            {step === 1 && (
                <div className="space-y-4">
                    <input
                        name="title"
                        value={courseInfo.title}
                        onChange={handleCourseInfoChange}
                        placeholder="Course Title"
                        className="w-full border p-2"
                    />
                    <textarea
                        name="description"
                        value={courseInfo.description}
                        onChange={handleCourseInfoChange}
                        placeholder="Course Description"
                        className="w-full border p-2"
                    />
                    <select
                        name="categoryId"
                        value={courseInfo.categoryId}
                        onChange={handleCourseInfoChange}
                        className="w-full border p-2"
                    >
                        <option value="">Select Category</option>
                        {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                    <input
                        name="price"
                        type="number"
                        value={courseInfo.price}
                        onChange={handleCourseInfoChange}
                        placeholder="Course Price"
                        className="w-full border p-2"
                    />
                    {courseInfo.coverImageUrl && !(courseInfo.coverImageUrl instanceof File) && (
                        <img src={courseInfo.coverImageUrl} alt="Cover" className="max-h-48 rounded object-cover mb-2" />
                    )}
                    <label className="block text-sm font-medium text-gray-700">Course Cover Image</label>
                    <input
                        type="file"
                        name="cover"
                        accept="image/*"
                        onChange={handleCourseInfoChange}
                        className="w-full border p-2"
                    />
                    <button
                        onClick={handleCourseSubmit}
                        className="px-6 py-2 bg-blue-600 text-white rounded"
                    >
                        {courseId ? 'Continue to Curriculum' : 'Save & Continue'}
                    </button>
                </div>
            )}

            {/* Step 2: Curriculum */}
            {step === 2 && (
                <div>
                    <h3 className="text-xl font-semibold mb-4">Curriculum</h3>
                    {curriculum.map((section, sectionIndex) => (
                        <div key={sectionIndex} className="border p-4 mb-4">
                            <input
                                value={section.sectionTitle}
                                onChange={(e) => updateSectionTitle(sectionIndex, e.target.value)}
                                placeholder="Section Title"
                                className="w-full border p-2 mb-2"
                            />
                            {section.lessons.map((lesson, lessonIndex) => (
                                <div key={lessonIndex} className="space-y-2 mb-2">
                                    <input
                                        value={lesson.title}
                                        onChange={(e) => updateLesson(sectionIndex, lessonIndex, 'title', e.target.value)}
                                        placeholder="Lesson Title"
                                        className="w-full border p-2"
                                    />
                                    <input
                                        type="file"
                                        accept="video/*"
                                        onChange={(e) => updateLesson(sectionIndex, lessonIndex, 'videoFile', e.target.files[0])}
                                        className="w-full"
                                    />
                                    <input
                                        type="file"
                                        accept=".pdf,.zip,.doc,.docx"
                                        onChange={(e) => updateLesson(sectionIndex, lessonIndex, 'resourceFile', e.target.files[0])}
                                        className="w-full"
                                    />
                                    <small className="text-gray-600">Optional resources: PDFs, ZIPs, Docs</small>
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

                    <button
                        onClick={addSection}
                        className="px-4 py-2 bg-green-600 text-white rounded mb-6"
                    >
                        + Add Section
                    </button>

                    <button
                        onClick={handleCurriculumSubmit}
                        className="px-6 py-2 bg-purple-600 text-white rounded"
                    >
                        Save & Continue
                    </button>
                </div>
            )}

            {/* Step 3: Publish */}
            {step === 3 && (
                <div className="text-center">
                    <h3 className="text-xl font-semibold mb-4">Ready to publish?</h3>
                    <p className="mb-4">Your course has been saved. You can now publish it or come back later to edit.</p>
                    <button onClick={handlePublish} className="px-6 py-2 bg-green-700 text-white rounded">
                        Publish Course
                    </button>
                </div>
            )}
        </div>
    );
};

export default CourseBuilder;
