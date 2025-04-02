import axios from "axios";
import { API_BASE_URL } from "../config";

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true,
});

// Function to check if token is expired
const isTokenExpired = (token) => {
    if (!token) return true;

    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const expiryTime = payload.exp * 1000;
        const currentTime = Date.now();
        return currentTime >= expiryTime;
    } catch (error) {
        console.error('Error checking token expiration:', error);
        return true;
    }
};

// Attach Authorization Token to Every Request
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");

        if (token) {
            if (!config.headers) config.headers = {};
            config.headers["Authorization"] = `Bearer ${token}`;

            // Check if token is expired
            if (isTokenExpired(token)) {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                window.location.href = "/login";
                return Promise.reject("Token expired");
            }
        }

        // Don't set Content-Type for FormData
        if (config.data instanceof FormData) {
            delete config.headers["Content-Type"];
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Auth
export const sendOtp = async (data) => await api.post(`/auth/forgot-password`, data);
export const resetPassword = async (data) => await api.post(`/auth/reset-password`, data);
export const registerUser = async (userData) => await api.post("/auth/register", userData);
export const loginUser = async (userData) => await api.post("/auth/login", userData);
export const fetchUserProfile = async () => await api.get("/auth/profile");

// Courses
export const fetchCourses = async (page = 1) => {
    const response = await api.get(`/courses?page=${page}`);
    return response.data;
};

export const fetchCourseDetails = async (courseId) => {
    const response = await api.get(`/courses/${courseId}`);
    return response.data;
};

export const createCourse = async (courseData) => {
    const response = await api.post('/courses', courseData);
    return response.data;
};

export const updateCourse = async (courseId, courseData) => {
    const response = await api.patch(`/courses/${courseId}`, courseData);
    return response.data;
};

export const deleteCourse = async (courseId) => {
    await api.delete(`/courses/${courseId}`);
};

export const publishCourse = async (courseId) => {
    const response = await api.patch(`/courses/${courseId}/publish`);
    return response.data;
};

export const uploadCourseImage = async (courseId, coverFile) => {
    const formData = new FormData();
    formData.append('cover', coverFile);
    const response = await api.post(`/courses/${courseId}/upload-cover`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    return response.data;
};

// Sections
export const createSection = async (courseId, sectionData) => {
    const response = await api.post(`/courses/${courseId}/sections`, sectionData);
    return response.data;
};

export const fetchSections = async (courseId) => {
    const response = await api.get(`/courses/${courseId}/sections`);
    return response.data;
};

export const updateSection = async (courseId, sectionId, sectionData) => {
    const response = await api.patch(`/courses/${courseId}/sections/${sectionId}`, sectionData);
    return response.data;
};

export const deleteSection = async (courseId, sectionId) => {
    await api.delete(`/courses/${courseId}/sections/${sectionId}`);
};

// Lessons
export const createLesson = async (courseId, sectionId, lessonData) => {
    const formData = new FormData();
    formData.append('title', lessonData.title);
    if (lessonData.content) formData.append('content', lessonData.content);
    if (lessonData.previewVideo !== undefined) formData.append('previewVideo', lessonData.previewVideo);
    if (lessonData.video) formData.append('video', lessonData.video);
    if (lessonData.resource) formData.append('resource', lessonData.resource);

    const response = await api.post(
        `/courses/${courseId}/sections/${sectionId}/lessons`,
        formData
    );
    return response.data;
};

export const updateLesson = async (courseId, sectionId, lessonId, lessonData) => {
    const formData = new FormData();
    formData.append("title", lessonData.title || "");
    if (lessonData.content) formData.append("content", lessonData.content);
    if (lessonData.previewVideo !== undefined) formData.append("previewVideo", lessonData.previewVideo);
    if (lessonData.videoFile) formData.append("video", lessonData.videoFile);
    if (lessonData.resourceFile) formData.append("resource", lessonData.resourceFile);

    const response = await api.patch(
        `/courses/${courseId}/sections/${sectionId}/lessons/${lessonId}`,
        formData
    );
    return response.data;
};

export const deleteLesson = async (courseId, sectionId, lessonId) => {
    await api.delete(`/courses/${courseId}/sections/${sectionId}/lessons/${lessonId}`);
};

export const fetchLessons = async (courseId, sectionId) => {
    const response = await api.get(`/courses/${courseId}/sections/${sectionId}/lessons`);
    return response.data;
};

// Categories
export const fetchCategories = async () => {
    const response = await api.get('/categories');
    return response.data;
};

export const createCategory = async (categoryData) => {
    const response = await api.post('/categories', categoryData);
    return response.data;
};

export const updateCategory = async (categoryId, categoryData) => {
    const response = await api.patch(`/categories/${categoryId}`, categoryData);
    return response.data;
};

export const deleteCategory = async (categoryId) => {
    await api.delete(`/categories/${categoryId}`);
};
