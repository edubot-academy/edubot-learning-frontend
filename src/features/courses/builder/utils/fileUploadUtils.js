// File upload utility functions
// Extracted from file upload logic in CreateCourse.jsx and EditInstructorCourse.jsx

import { getVideoDuration } from '../../../../utils/videoUtils';
import { updateLessonUploadProgress, setLessonUploading } from './sectionUtils';

/**
 * Validates file before upload
 * @param {File} file - File to validate
 * @param {string} type - Upload type ('video' or 'resource')
 * @returns {Object} - Validation result
 */
export const validateFileForUpload = (file, type) => {
    if (!file) {
        return { valid: false, error: 'Файл тандалган жок' };
    }

    // Check file type
    if (type === 'video') {
        const videoTypes = ['video/mp4', 'video/webm', 'video/avi', 'video/mov', 'video/mkv'];
        if (!videoTypes.includes(file.type)) {
            return { valid: false, error: 'Видео файлын тандаңыз (MP4, WebM, AVI, MOV, MKV)' };
        }
    }

    // Check file size (5MB limit for images, larger for videos)
    const maxSize = type === 'image' ? 5 * 1024 * 1024 : 2 * 1024 * 1024 * 1024; // 2GB for videos
    if (file.size > maxSize) {
        const maxSizeMB = Math.round(maxSize / (1024 * 1024));
        return { valid: false, error: `Файл өлчөмү ${maxSizeMB}MB ашпашы керек` };
    }

    return { valid: true };
};

/**
 * Validates course cover image
 * @param {File} file - Image file to validate
 * @returns {Object} - Validation result
 */
export const validateCoverImage = (file) => {
    if (!file) {
        return { valid: false, error: 'Сүрөт файлын тандаңыз' };
    }

    if (!file.type.startsWith('image/')) {
        return { valid: false, error: 'Сураныч, сүрөт файлын тандаңыз.' };
    }

    if (file.size > 5 * 1024 * 1024) {
        return { valid: false, error: 'Сүрөт көлөмү 5MB ашпашы керек.' };
    }

    return { valid: true };
};

/**
 * Handles file upload with progress tracking
 * @param {Object} uploadFunction - Upload function that returns a key
 * @param {Array} curriculum - Current curriculum
 * @param {number} sectionIndex - Section index
 * @param {number} lessonIndex - Lesson index
 * @param {string} type - Upload type ('video' or 'resource')
 * @param {File} file - File to upload
 * @param {Function} setCurriculum - Function to update curriculum
 * @returns {Promise<string>} - Upload result key
 */
export const handleFileUpload = async (
    uploadFunction,
    curriculum,
    sectionIndex,
    lessonIndex,
    type,
    file,
    setCurriculum
) => {
    // Validate file
    const validation = validateFileForUpload(file, type);
    if (!validation.valid) {
        throw new Error(validation.error);
    }

    // Set uploading state
    setCurriculum(setLessonUploading(curriculum, sectionIndex, lessonIndex, type, true));

    try {
        // Upload with progress tracking
        const key = await uploadFunction(
            file,
            (percent) => {
                setCurriculum(updateLessonUploadProgress(curriculum, sectionIndex, lessonIndex, type, percent));
            }
        );

        // Handle video duration extraction
        if (type === 'video') {
            try {
                const duration = await getVideoDuration(file);
                // Update lesson duration
                setCurriculum(prev => {
                    const updated = [...prev];
                    updated[sectionIndex].lessons[lessonIndex].duration = duration;
                    return updated;
                });
            } catch (err) {
                console.warn('Failed to extract video duration:', err);
            }
        }

        return key;
    } finally {
        // Clear uploading state
        setCurriculum(setLessonUploading(curriculum, sectionIndex, lessonIndex, type, false));
    }
};

/**
 * Handles lesson file upload specifically
 * @param {Function} uploadLessonFile - API upload function
 * @param {string} courseId - Course ID
 * @param {number} sectionIndex - Section index
 * @param {number} lessonIndex - Lesson index
 * @param {string} type - Upload type
 * @param {File} file - File to upload
 * @param {Array} curriculum - Current curriculum
 * @param {Function} setCurriculum - Curriculum setter
 * @param {Function} getSectionId - Function to get section ID
 * @param {Function} createSectionIfNeeded - Function to create section if needed
 * @returns {Promise<void>}
 */
export const handleLessonFileUpload = async (
    uploadLessonFile,
    courseId,
    sectionIndex,
    lessonIndex,
    type,
    file,
    curriculum,
    setCurriculum,
    getSectionId,
    createSectionIfNeeded
) => {
    if (!file || !courseId) return;

    // Get or create section ID
    let sectionId = getSectionId(sectionIndex);
    if (!sectionId) {
        sectionId = await createSectionIfNeeded(sectionIndex);
    }

    // Check if file already exists
    const lesson = curriculum[sectionIndex]?.lessons[lessonIndex];
    const keyProp = type === 'video' ? 'videoKey' : 'resourceKey';
    if (lesson[keyProp]) return;

    // Upload the file
    const key = await handleFileUpload(
        (file, onProgress) => uploadLessonFile(courseId, sectionId, type, file, lessonIndex, onProgress),
        curriculum,
        sectionIndex,
        lessonIndex,
        type,
        file,
        setCurriculum
    );

    // Update lesson with the key
    setCurriculum(prev => {
        const updated = [...prev];
        updated[sectionIndex].lessons[lessonIndex][keyProp] = key;

        if (type === 'resource') {
            updated[sectionIndex].lessons[lessonIndex].resourceName = file.name;
        }

        return updated;
    });
};

/**
 * Creates a preview URL for a file
 * @param {File} file - File to create preview for
 * @returns {string} - Preview URL
 */
export const createFilePreviewUrl = (file) => {
    if (!file) return '';
    return URL.createObjectURL(file);
};

/**
 * Revokes a file preview URL
 * @param {string} url - URL to revoke
 */
export const revokeFilePreviewUrl = (url) => {
    if (url && url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
    }
};

/**
 * Gets file extension from file name
 * @param {File} file - File object
 * @returns {string} - File extension
 */
export const getFileExtension = (file) => {
    if (!file || !file.name) return '';
    const parts = file.name.split('.');
    return parts.length > 1 ? parts.pop().toLowerCase() : '';
};

/**
 * Formats file size for display
 * @param {number} bytes - File size in bytes
 * @returns {string} - Formatted size string
 */
export const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Checks if file is a video
 * @param {File} file - File to check
 * @returns {boolean} - True if video file
 */
export const isVideoFile = (file) => {
    if (!file) return false;
    const videoTypes = ['video/mp4', 'video/webm', 'video/avi', 'video/mov', 'video/mkv'];
    return videoTypes.includes(file.type);
};

/**
 * Checks if file is an image
 * @param {File} file - File to check
 * @returns {boolean} - True if image file
 */
export const isImageFile = (file) => {
    if (!file) return false;
    return file.type.startsWith('image/');
};
