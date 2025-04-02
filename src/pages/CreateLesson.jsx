import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import VideoUpload from '../components/VideoUpload';

const CreateLesson = () => {
    const { courseId, sectionId } = useParams();
    const navigate = useNavigate();
    const [lessonData, setLessonData] = useState({
        title: '',
        content: '',
        previewVideo: false
    });

    const handleUploadSuccess = (lesson) => {
        // Redirect to the course details page or show success message
        navigate(`/courses/${courseId}`);
    };

    return (
        <div className="min-h-screen p-6 pt-24">
            <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md">
                <h1 className="text-3xl font-bold mb-6">Create New Lesson</h1>

                <div className="mb-6">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                        Lesson Title
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
                        Content
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
                            Make this a preview lesson
                        </span>
                    </label>
                </div>

                <VideoUpload
                    courseId={courseId}
                    sectionId={sectionId}
                    onUploadSuccess={handleUploadSuccess}
                />
            </div>
        </div>
    );
};

export default CreateLesson;
