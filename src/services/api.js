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
export const updateUserProfile = async (userId, data) => await api.patch(`/auth/update/${userId}`, data);
export const fetchInstructorProfile = async (userId) => {
    const response = await api.get(`/users/${userId}/instructor-profile`);
    return response.data;
};

export const updateInstructorProfile = async (userId, data) => {
    const response = await api.patch(`/users/${userId}/instructor-profile`, data);
    return response.data;
};

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

export const enrollUserInCourse = async (userId, courseId, options = {}) => {
    const { discountPercentage, offeringId } = options || {};
    try {
        const response = await api.post(`/enrollments/enroll`, {
            userId,
            courseId,
            discountPercentage,
            offeringId,
        });
        return response.data;
    } catch (error) {
        console.error("Error enrolling user:", error);
        const message =
            error.response?.data?.message || error.message || "Failed to enroll user in course";
        toast.error(Array.isArray(message) ? message.join(", ") : message);
        throw error;
    }
};


export const unenrollUserFromCourse = async (userId, courseId) => {
    try {
        const response = await api.delete(`/enrollments/${courseId}/unenroll/${userId}`);
        return response.data;
    } catch (error) {
        console.error("Error enrolling user:", error);
        toast.error("Failed to enroll user in course");
        throw error;
    }
};

export const fetchEnrollment = async (courseId, userId) => {
    try {
        const params = { courseId };
        if (userId) params.userId = userId;

        const response = await api.get(`/enrollments/check`, { params });
        return response.data;
    } catch (error) {
        console.error("Error fetching enrollment:", error);
        throw error;
    }
};

export const checkEnrollments = async (courseIds, userIds = []) => {
    try {
        const response = await api.post('/enrollments/bulk-check', {
            courseIds,
            userIds,
        });
        return response.data;
    } catch (error) {
        console.error("Error in bulk enrollment check:", error);
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
export const fetchCourses = async ({ q = '', limit = 20, excludeIds = '' } = {}) => {
    try {
        const response = await api.get("/courses", { params: clean({ q, limit, excludeIds }) });
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

export const fetchCompanyCourses = async (companyId, params = {}) => {
    const { page, limit, q } = params;
    const { data } = await api.get(`/courses/company/${companyId}`, {
        params: clean({ page, limit, q }),
    });
    return data;
};

// Student Dashboard APIs
export const fetchStudentDashboardSummary = async (studentId) => {
    const { data } = await api.get(`/students/${studentId}/dashboard-summary`);
    return data;
};

export const fetchStudentCourses = async (studentId, params = {}) => {
    const { status } = params;
    const { data } = await api.get(`/students/${studentId}/courses`, { params: clean({ status }) });
    return data;
};

export const fetchStudentOfferings = async (studentId) => {
    const { data } = await api.get(`/students/${studentId}/offerings`);
    return data;
};

export const fetchStudentTasks = async (studentId, params = {}) => {
    const { status } = params;
    const { data } = await api.get(`/students/${studentId}/tasks`, { params: clean({ status }) });
    return data;
};

export const fetchStudentProgress = async (studentId) => {
    const { data } = await api.get(`/students/${studentId}/progress`);
    return data;
};

export const fetchStudentCertificates = async (studentId) => {
    const { data } = await api.get(`/students/${studentId}/certificates`);
    return data;
};

export const fetchStudentNotificationSettings = async (studentId) => {
    const { data } = await api.get(`/students/${studentId}/notification-settings`);
    return data;
};

export const updateStudentNotificationSettings = async (studentId, payload) => {
    const { data } = await api.patch(
        `/students/${studentId}/notification-settings`,
        payload
    );
    return data;
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

export const markCoursePending = async (courseId) => {
    const response = await api.patch(`/courses/${courseId}/status`, { status: 'pending' });
    return response.data;
};

export const getPendingCourses = async () => {
    const response = await api.get('/courses/pending');
    return response.data;
};

export const markCourseApproved = async (courseId) => {
    const response = await api.patch(`/courses/${courseId}/status`, { status: 'approved' });
    return response.data;
};

export const markCourseRejected = async (courseId) => {
    const response = await api.patch(`/courses/${courseId}/status`, { status: 'rejected' });
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
export async function createLesson(courseId, sectionId, lessonData) {

    const response = await api.post(
        `/courses/${courseId}/sections/${sectionId}/lessons`,
        lessonData
    );
    return response.data;
}

export async function updateLesson(courseId, sectionId, lessonId, lessonData) {

    const response = await api.patch(
        `/courses/${courseId}/sections/${sectionId}/lessons/${lessonId}`,
        lessonData
    );
    return response.data;
}

export async function deleteLesson(courseId, sectionId, lessonId) {
    await api.delete(`/courses/${courseId}/sections/${sectionId}/lessons/${lessonId}`);
}

export async function fetchLessons(courseId, sectionId) {
    const response = await api.get(`/courses/${courseId}/sections/${sectionId}/lessons`);
    return response.data;
}

export async function fetchLessonQuiz(courseId, sectionId, lessonId, manage = false) {
    const suffix = manage ? '/manage' : '';
    const response = await api.get(
        `/courses/${courseId}/sections/${sectionId}/lessons/${lessonId}/quiz${suffix}`
    );
    return response.data;
}

export async function upsertLessonQuiz(courseId, sectionId, lessonId, quizData) {
    const response = await api.post(
        `/courses/${courseId}/sections/${sectionId}/lessons/${lessonId}/quiz`,
        quizData
    );
    return response.data;
}

export async function submitLessonQuiz(courseId, sectionId, lessonId, answers) {
    const response = await api.post(
        `/courses/${courseId}/sections/${sectionId}/lessons/${lessonId}/quiz/submit`,
        answers
    );
    return response.data;
}

export async function fetchLessonChallenge(courseId, sectionId, lessonId, manage = false) {
    const suffix = manage ? '/manage' : '';
    const response = await api.get(
        `/courses/${courseId}/sections/${sectionId}/lessons/${lessonId}/challenge${suffix}`
    );
    return response.data;
}

export async function upsertLessonChallenge(courseId, sectionId, lessonId, challengeData) {
    const response = await api.post(
        `/courses/${courseId}/sections/${sectionId}/lessons/${lessonId}/challenge`,
        challengeData
    );
    return response.data;
}

export async function submitLessonChallenge(courseId, sectionId, lessonId, payload) {
    const response = await api.post(
        `/courses/${courseId}/sections/${sectionId}/lessons/${lessonId}/challenge/submit`,
        payload
    );
    return response.data;
}

export async function uploadLessonFile(courseId, sectionId, type, file, lessonOrder, onProgress) {
    if (!file || typeof file.name !== 'string') {
        throw new Error('No file provided');
    }

    const parts = file.name.split('.');
    if (parts.length < 2) {
        throw new Error('File name does not contain an extension');
    }

    const extension = parts.pop().toLowerCase();
    const allowed = ['mp4', 'webm', 'avi', 'mov', 'mkv', 'pdf', 'zip'];
    if (!allowed.includes(extension)) {
        throw new Error(`Unsupported file type: .${extension}`);
    }

    let presign;
    try {
        presign = await api.get(
            `/courses/${courseId}/sections/${sectionId}/lessons/upload-url`,
            { params: { type, extension, lessonOrder } }
        );
    } catch (err) {
        const msg = err.response?.data?.message || err.message;
        throw new Error(Array.isArray(msg) ? msg.join(', ') : msg);
    }

    const { key, url, maxFileSize } = presign.data;

    if (file.size > maxFileSize) {
        throw new Error(`File too large: ${file.size} > ${maxFileSize}`);
    }

    try {
        await axios.put(url, file, {
            headers: { 'Content-Type': file.type },
            maxBodyLength: Infinity,
            onUploadProgress: (progressEvent) => {
                if (onProgress) {
                    const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    onProgress(percent);
                }
            }
        });
    } catch (err) {
        const msg = err.response?.statusText || err.message;
        throw new Error(msg);
    }

    return key;
}

export const updateLessonDuration = async (courseId, sectionId, lessonId, duration) => {
    try {
        const response = await api.patch(`/courses/${courseId}/sections/${sectionId}/lessons/${lessonId}/set-duration`, {
            duration,
        });
        return response.data;
    } catch (error) {
        console.error('Failed to update lesson duration:', error);
        throw error;
    }
};

// AI Assistant
export const fetchCourseAiPrompts = async (courseId) => {
    const { data } = await api.get(`/courses/${courseId}/ai/prompts`);
    return data;
};

export const addCourseAiPrompt = async (courseId, payload) => {
    const { data } = await api.post(`/courses/${courseId}/ai/prompts`, payload);
    return data;
};

export const updateCourseAiPrompt = async (courseId, promptId, payload) => {
    const { data } = await api.patch(`/courses/${courseId}/ai/prompts/${promptId}`, payload);
    return data;
};

export const deleteCourseAiPrompt = async (courseId, promptId) => {
    const { data } = await api.delete(`/courses/${courseId}/ai/prompts/${promptId}`);
    return data;
};

export const fetchCourseAiSettings = async (courseId) => {
    const { data } = await api.get(`/courses/${courseId}/ai/settings`);
    return data;
};

export const updateCourseAiSettings = async (courseId, payload) => {
    const { data } = await api.patch(`/courses/${courseId}/ai/settings`, payload);
    return data;
};

export const fetchCourseAiChats = async (courseId) => {
    const { data } = await api.get(`/courses/${courseId}/ai/chats`);
    return data;
};

export const createCourseAiChat = async (courseId, payload = {}) => {
    const { data } = await api.post(`/courses/${courseId}/ai/chats`, payload);
    return data;
};

export const deleteAiChat = async (chatId) => {
    const { data } = await api.delete(`/ai/chats/${chatId}`);
    return data;
};

export const fetchAiChatMessages = async (chatId) => {
    const { data } = await api.get(`/ai/chats/${chatId}/messages`);
    return data;
};

export const sendAiChatMessage = async (chatId, payload) => {
    const { data } = await api.post(`/ai/chats/${chatId}/messages`, payload);
    return data;
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
    const response = await api.post(`/courses/${courseId}/sections/${sectionId}/lessons/${lessonId}/complete`);
    return response.data;
};

//Student Progress
export const updateLastViewedLesson = async ({ courseId, lessonId }) => {
    const res = await api.put(`/student-progress/last-viewed`, { courseId, lessonId });
    return res.data;
};

export const getLastViewedLesson = async (courseId) => {
    const res = await api.get(`/student-progress/last-viewed?courseId=${courseId}`);
    return res.data;
};

export const getVideoTime = async (courseId, lessonId) => {
    const res = await api.get(`courses/${courseId}/progress/lessons/${lessonId}/video-time`);
    return res.data;
};

export const updateVideoTime = async ({ courseId, lessonId, time }) => {
    const res = await api.put(`courses/${courseId}/progress/lessons/${lessonId}/video-time`, { time });
    return res.data;
};

//Contact

export const submitContactMessage = async (formData) => {
    const response = await api.post('/contact', formData);
    return response.data;
};

export const fetchContactMessages = async () => {
    const response = await api.get('/contact');
    return response.data;
};


// --- Courses additions ---

export async function publicCatalog(params = {}) {
    const { page = 1, limit = 20, q = '', language } = params;
    const { data } = await api.get('/courses/catalog', { params: { page, limit, q, language } });
    return data; // {items,total,page,limit,totalPages}
}
// --- Offerings ---
export async function createOffering(payload) {
    // { courseId, companyId?, title?, modality?, visibility?, startAt?, endAt?, scheduleNote?, capacity?, priceOverride? }
    const { data } = await api.post('/offerings', payload);
    return data;
}

export async function updateOffering(id, patch) {
    const { data } = await api.patch(`/offerings/${id}`, patch);
    return data;
}

// Auth (members/admin) — offerings for a course
export async function listOfferingsForCourse(courseId, { q } = {}) {
    const { data } = await api.get(`/offerings/course/${courseId}`, { params: { q } });
    return data; // Offering[]
}

// Public (catalog) — only PUBLIC offerings for a course
export async function publicOfferingsForCourse(courseId) {
    const { data } = await api.get(`/public/course/${courseId}/offerings`);
    return data; // Offering[]
}



// --- Companies (adjust to your real routes) ---

// api.js — Companies client (EduBot Learning)
// All responses localized on UI layer (KY/RU). This file is transport only.

/** Utility: only send defined params */
const clean = (obj) => Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined && v !== null));

/** @typedef {{ id:number; name:string; logoUrl?:string; createdAt:string; updatedAt:string }} Company */
/** @typedef {{ items:any[]; total:number; page:number; limit:number; totalPages:number }} Paged<T> */

/* ------------------------------------------------------------------ */
/* Companies                                                           */
/* ------------------------------------------------------------------ */

// List all companies you can see (admin) or that you belong to (member)
export async function listCompanies({ page = 1, limit = 20, q = '' } = {}) {
    const { data } = await api.get('/companies', { params: clean({ page, limit, q }) });
    return data; // {items,total,page,limit,totalPages}
}

// Current user’s companies (quick menu / switcher) — now also paged
export async function myCompanies({ page = 1, limit = 20, q = '' } = {}) {
    const { data } = await api.get('/companies/my', { params: clean({ page, limit, q }) });
    return data; // {items,total,page,limit,totalPages}
}

export async function getCompany(id) {
    const { data } = await api.get(`/companies/${id}`);
    return data; // Company
}

// Backend accepts only { name, logoUrl? }
export async function createCompany(payload /* { name: string, logoUrl?: string } */) {
    const { data } = await api.post('/companies', payload);
    return data; // Company
}

export async function updateCompany(id, patch /* { name?, logoUrl? } */) {
    const { data } = await api.patch(`/companies/${id}`, patch);
    return data; // Company
}

// NOTE: No DELETE /companies/:id in backend. Keep a guarded stub if UI calls it by mistake.
export async function deleteCompany(id) {
    const { data } = await api.delete(`/companies/${id}`);
    return data;
}

export const assignCourseToCompany = async (courseId, companyId) => {
    const { data } = await api.post(`/courses/${courseId}/companies/${companyId}`);
    return data;
}

export const unassignCourseFromCompany = async (courseId, companyId) => {
    const { data } = await api.delete(`/courses/${courseId}/companies/${companyId}`);
    return data;
}

// (Optional) keep clearCourseCompany only if you still need “remove all links”:
export const clearCourseCompany = async (courseId) => {
    const { data } = await api.delete(`/courses/${courseId}/companies`);
    return data;
}

export async function uploadCompanyLogo(companyId, file) {
    if (!file) throw new Error('No file provided');

    const form = new FormData();
    form.append('logo', file); // must match FileInterceptor('logo')

    const { data } = await api.post(`/companies/${companyId}/upload-logo`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });

    // backend returns full updated company, hydrated with logoUrl
    // we can safely return that URL for immediate preview
    return data.logoUrl || data.url || null;
}

/* ------------------------------------------------------------------ */
/* Company Members & Roles (admin/company_admin only)                  */
/* ------------------------------------------------------------------ */

// Includes user basic info for rendering without extra requests
export async function listCompanyMembers(companyId) {
    const { data } = await api.get(`/companies/${companyId}/members`);
    // [{ id, userId, companyId, role, createdAt, fullName, email }]
    return data;
}

export async function addCompanyMember(companyId, payload /* { userId:number, role:'company_admin'|'instructor'|'assistant' } */) {
    const { data } = await api.post(`/companies/${companyId}/members`, payload);
    return data; // role row
}

// Remove member. Optionally pass role to remove a single role; otherwise removes all roles for that user in the company.
export async function removeCompanyMember(companyId, userId, role /* optional */) {
    console.log(companyId, userId, role);
    const { data } = await api.delete(`/companies/${companyId}/members/${userId}`, {
        params: clean({ role }),
    });
    return data; // { ok: true }
}

// Change member role. mode: 'replace' (default) keeps only this role; 'add' adds alongside others.
export async function setCompanyMemberRole(companyId, userId, role /* 'company_admin'|'instructor'|'assistant' */, mode = 'replace') {
    const { data } = await api.patch(`/companies/${companyId}/members/${userId}`, { role, mode });
    return data; // { ok: true }
}

/* ------------------------------------------------------------------ */
/* Company Courses                                                     */
/* ------------------------------------------------------------------ */

// Paged courses under a company, searchable by title/description
export async function listCompanyCourses(companyId, { page = 1, limit = 20, q = '' } = {}) {
    const { data } = await api.get(`/companies/${companyId}/courses`, { params: clean({ page, limit, q }) });
    return data; // {items,total,page,limit,totalPages}
}


/* ------------------------------------------------------------------ */
/* Rate Courses                                         */
/* ------------------------------------------------------------------ */

export async function getCourseRating(courseId) {
    const { data } = await api.get(`/courses/${courseId}/rating`);
    return data;
}

export async function getTopRatings({ limit = 10 } = {}) {
    const { data } = await api.get(`/courses/top-ratings`, {
        params: { limit },
    });
    return data;
}

export async function rateCourse(courseId, { value, comment }) {
    const { data } = await api.post(`/courses/${courseId}/rate`, {
        value,
        comment,
    });
    return data;
}

export async function fetchCourseReviews(courseId, page = 1, limit = 10) {
    const { data } = await api.get(`/courses/${courseId}/reviews`, {
        params: { page, limit },
    });
    return data; // { items, total, page, totalPages, ratingAverage, ratingCount }
}

/* ------------------------------------------------------------------ */
/* Top Courses and Instructors                                         */
/* ------------------------------------------------------------------ */

export async function fetchTopCourses(limit = 3) {
    const { data } = await api.get(`/courses/top`, {
        params: { limit },
    });
    return data; // { items, total, hasMore }
}

export async function fetchTopInstructors(limit = 3) {
    const { data } = await api.get(`/users/top-instructors`, {
        params: { limit },
    });
    return data; // { items, total, hasMore }
}


// Course search
export const searchCourses = async (q) => {
    if (!q || q.length < 2) return [];
    const res = await api.get("/courses/search", { params: { q } });
    return res.data;
};
