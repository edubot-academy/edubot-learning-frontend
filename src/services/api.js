import axios from "axios";
import { API_BASE_URL } from "../config";

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true, // Important for handling authentication cookies
});

// Attach Authorization Token to Every Request
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers["Authorization"] = `Bearer ${JSON.parse(token)}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export const sendOtp = async (data) => {
    return await api.post(`/auth/forgot-password`, data);
};

export const resetPassword = async (data) => {
    return await api.post(`/auth/reset-password`, data);
};

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
    try {
        const response = await api.get(`/courses/${courseId}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching course details:", error);
        throw error;
    }
};


export const registerUser = async (userData) => {
    return await api.post("/auth/register", userData);
};


export const loginUser = async (userData) => {
    return await api.post("/auth/login", userData);
};

export const fetchUserProfile = async () => {
    return await api.get("/auth/profile");
};