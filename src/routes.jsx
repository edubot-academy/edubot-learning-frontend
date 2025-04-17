import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/Login";
import SignupPage from "./pages/Signup";
import Header from "./components/Header";
import Footer from "./components/Footer";
import HomePage from "./pages/Home";
import CoursesPage from './pages/Courses'
import CourseDetailsPage from './pages/CourseDetails'
import DashboardPage from "./pages/Dashboard";
import ProfilePage from "./pages/Profile";
import InstructorDashboard from "./pages/InstructorDashboard";
import ForgotPassword from "./pages/ForgotPassword";
import CreateCourse from "./pages/CreateCourse";
import InstructorCourses from "./pages/InstructorCourses";
import EditInstructorCourse from "./pages/EditInstructorCourse";
import AdminPanel from "./pages/Admin";
import SalesManager from "./pages/SalesManager";
import AboutPage from "./pages/About";
import ContactPage from "./pages/Contact";
import AssistantDashboard from "./pages/Assistant";

const AppRoutes = () => {
    return (
        <Router>
            <div className="flex flex-col min-h-screen">
                <Header />
                <div className="flex-grow">
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<SignupPage />} />
                        <Route path="/courses" element={<CoursesPage />} />
                        <Route path="/dashboard" element={<DashboardPage />} />
                        <Route path="/profile" element={<ProfilePage />} />
                        <Route path="/instructor" element={<InstructorDashboard />} />
                        <Route path="/instructor/course/create" element={<CreateCourse />} />
                        <Route path="/instructor/courses" element={<InstructorCourses />} />
                        <Route path="/courses/:id" element={<CourseDetailsPage />} />
                        <Route path="/instructor/courses/edit/:id" element={<EditInstructorCourse />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                        <Route path="/admin" element={<AdminPanel />} />
                        <Route path="/sales-manager" element={<SalesManager />} />
                        <Route path="/about" element={<AboutPage />} />
                        <Route path="/contact" element={<ContactPage />} />
                        <Route path="/assistant" element={<AssistantDashboard />} />
                    </Routes>
                </div>
                <Footer />
            </div>
        </Router>
    );
};

export default AppRoutes;
