import React, { useState } from 'react';
import axios from 'axios';

const VideoUpload = ({ courseId, sectionId, onUploadSuccess }) => {
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState(null);

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        const validTypes = [
            'video/mp4',
            'video/webm',
            'video/avi',
            'video/quicktime',
            'video/x-matroska',
            'video/x-ms-wmv'
        ];
        if (!validTypes.includes(file.type)) {
            setError('Invalid file type. Please upload MP4, WebM, AVI, MOV, MKV, or WMV.');
            return;
        }

        // Validate file size (1GB)
        if (file.size > 1024 * 1024 * 1024) {
            setError('File size must be less than 1GB');
            return;
        }

        setUploading(true);
        setError(null);
        
        const formData = new FormData();
        formData.append('video', file);
        formData.append('title', file.name); // You might want to add a separate title input
        
        try {
            const response = await axios.post(
                `/api/courses/${courseId}/sections/${sectionId}/lessons`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    },
                    onUploadProgress: (progressEvent) => {
                        const percentCompleted = Math.round(
                            (progressEvent.loaded * 100) / progressEvent.total
                        );
                        setProgress(percentCompleted);
                    }
                }
            );
            
            if (onUploadSuccess) {
                onUploadSuccess(response.data);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to upload video');
        } finally {
            setUploading(false);
            setProgress(0);
        }
    };

    return (
        <div className="w-full max-w-md mx-auto p-4">
            <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                    Upload Video
                </label>
                <input
                    type="file"
                    accept="video/*"
                    onChange={handleUpload}
                    disabled={uploading}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
            </div>

            {uploading && (
                <div className="mb-4">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                            className="bg-blue-600 h-2.5 rounded-full"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                        Uploading: {progress}%
                    </p>
                </div>
            )}

            {error && (
                <p className="text-red-500 text-sm mb-4">{error}</p>
            )}
        </div>
    );
};

export default VideoUpload;
