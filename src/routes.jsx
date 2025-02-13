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
                        <Route path="/courses/:id" element={<CourseDetailsPage />} />
                    </Routes>
                </div>
                <Footer />
            </div>
        </Router>
    );
};

export default AppRoutes;
