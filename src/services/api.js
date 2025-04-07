import axios from "axios";
import { API_BASE_URL } from "../config";
import toast from "react-hot-toast";

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

//Users

export const fetchUsers = async ({ page, limit, search, role, dateFrom, dateTo }) => {
    try {
        const response = await api.get("/users", { params: { page, limit, search, role, dateFrom, dateTo } });
        return response.data;
    } catch (error) {
        console.error("Error fetching users:", error);
        throw error;
    }
};

export const updateUserRole = async (userId, newRole) => {
    try {
        const response = await api.patch(`/users/${userId}/role`, { role: newRole });
        toast.success("User role updated successfully");
        return response.data;
    } catch (error) {
        console.error("Error updating user role:", error);
        toast.error("Failed to update user role");
        throw error;
    }
};

export const deleteUser = async (userId) => {
    try {
        const response = await api.delete(`/users/${userId}`);
        toast.success("User deleted successfully");
        return response.data;
    } catch (error) {
        console.error("Error deleting user:", error);
        toast.error("Failed to delete user");
        throw error;
    }
};

export const enrollUserInCourse = async (userId, courseId, discountPercentage) => {
    try {
        const response = await api.post(`/courses/${courseId}/enroll`, { userId, discountPercentage });
        return response.data;
    } catch (error) {
        console.error("Error enrolling user:", error);
        toast.error("Failed to enroll user in course");
        throw error;
    }
};

export const fetchMyStudents = async () => {
    try {
        const response = await api.get("/users/my-students");
        return response.data;
    } catch (error) {
        console.error("Error fetching my students:", error);
        throw error;
    }
};

export const registerStudent = async (data) => {
    try {
        const response = await api.post("/users/register-by-sales", data);
        return response.data;
    } catch (error) {
        console.error("Error registering student:", error);
        throw error;
    }
};

// Payments

export const addPayment = async (data) => {
    try {
        const response = await api.post("/payments", data);
        return response.data;
    } catch (error) {
        console.error("Error adding payment:", error);
        throw error;
    }
};

// Courses
export const fetchCourses = async () => {
    try {
        const response = await api.get("/courses");
        return response.data;
    } catch (error) {
        console.error("Error fetching courses:", error);
        throw error;
    }
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
    try {
        const response = await api.delete(`/courses/${courseId}`);
        toast.success("Course deleted successfully");
        return response.data;
    } catch (error) {
        console.error("Error deleting course:", error);
        toast.error("Failed to delete course");
        throw error;
    }
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

export const createCategory = async (categoryData) => {
    const response = await api.post('/categories', categoryData);
    return response.data;
};

export const fetchCategories = async () => {
    try {
        const response = await api.get("/categories");
        return response.data;
    } catch (error) {
        console.error("Error fetching categories:", error);
        throw error;
    }
};



export const deleteCategory = async (categoryId) => {
    try {
        const response = await api.delete(`/categories/${categoryId}`);
        toast.success("Category deleted successfully");
        return response.data;
    } catch (error) {
        console.error("Error deleting category:", error);
        toast.error("Failed to delete category");
        throw error;
    }
};

export const updateCategory = async (categoryId, data) => {
    try {
        const response = await api.patch(`/categories/${categoryId}`, data);
        return response.data;
    } catch (error) {
        console.error("Error updating category:", error);
        toast.error("Failed to update category");
        throw error;
    }
};

//User Progress

export const fetchUserProgress = async (courseId) => {
    const response = await api.get(`/courses/${courseId}/progress`);
    return response.data;
};

//Needs to be implemented
export const updateUserProgress = async (courseId, lessonId) => {
    const response = await api.post(`/courses/${courseId}/progress`, { lessonId });
    return response.data;
};

//Mark lesson as complete
export const markLessonComplete = async (courseId, sectionId, lessonId) => {
    console.log(courseId, sectionId, lessonId);
    const response = await api.post(`/courses/${courseId}/sections/${sectionId}/lessons/${lessonId}/complete`);
    return response.data;
};

//Student Progress
export const fetchStudentProgress = async () => {
    const response = await api.get(`/student-progress`);
    return response.data;
};

export const updateLastViewedLesson = async ({ courseId, lessonId }) => {
    const res = await api.put(`/student-progress/last-viewed`, { courseId, lessonId });
    return res.data;
};

export const getLastViewedLesson = async (courseId) => {
    const res = await api.get(`/student-progress/last-viewed?courseId=${courseId}`);
    return res.data;
};

export const getLastVideoTime = async (courseId) => {
    const res = await api.get(`/student-progress/last-video-time?courseId=${courseId}`);
    return res.data;
};

export const updateLastVideoTime = async ({ courseId, time }) => {
    const res = await api.put(`/student-progress/last-video-time`, { courseId, time });
    return res.data;
};


