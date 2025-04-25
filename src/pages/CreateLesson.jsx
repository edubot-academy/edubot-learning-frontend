import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import VideoUpload from '../components/VideoUpload';

const CreateLesson = () => {
    const { courseId, sectionId } = useParams();
    const navigate = useNavigate();
    const [lessonData, setLessonData] = useState({
        title: '',
        content: '',
        previewVideo: false
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleUploadSuccess = (lesson) => {
        toast.success("Сабак ийгиликтүү жүктөлдү!");
        navigate(`/courses/${courseId}`);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!lessonData.title.trim()) {
            toast.error("Сабактын аталышын жазыңыз");
            return;
        }
        if (!lessonData.content.trim()) {
            toast.error("Мазмун талаасы бош болбошу керек");
            return;
        }

        setIsSubmitting(true);

        // Simulate processing
        setTimeout(() => {
            toast.success("Маалыматтар текшерилди. Эми видео жүктөө керек.");
            setIsSubmitting(false);
        }, 1500);
    };

    return (
        <div className="min-h-screen p-6 pt-24">
            <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md">
                <h1 className="text-3xl font-bold mb-6">Жаңы сабак түзүү</h1>

                <form onSubmit={handleSubmit}>
                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            Сабактын аталышы
                        </label>
                        <input
                            type="text"
                            value={lessonData.title}
                            onChange={(e) => setLessonData(prev => ({ ...prev, title: e.target.value }))}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        />
                    </div>

                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            Мазмуну
                        </label>
                        <textarea
                            value={lessonData.content}
                            onChange={(e) => setLessonData(prev => ({ ...prev, content: e.target.value }))}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-32"
                        />
                    </div>

                    <div className="mb-6">
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                checked={lessonData.previewVideo}
                                onChange={(e) => setLessonData(prev => ({ ...prev, previewVideo: e.target.checked }))}
                                className="mr-2"
                            />
                            <span className="text-gray-700 text-sm font-bold">
                                Бул сабакты превью кылып белгилөө
                            </span>
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`px-6 py-2 text-white rounded shadow transition duration-300 ease-in-out ${isSubmitting
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400'
                            }`}
                    >
                        {isSubmitting ? 'Жүктөлүүдө...' : 'Тастыктоо'}
                    </button>
                </form>

                <div className="mt-8">
                    <VideoUpload
                        courseId={courseId}
                        sectionId={sectionId}
                        onUploadSuccess={handleUploadSuccess}
                    />
                </div>
            </div>
        </div>
    );
};

export default CreateLesson;
