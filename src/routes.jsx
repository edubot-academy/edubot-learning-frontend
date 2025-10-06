import React, { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import PrivateRoute from "./components/PrivateRoute";

// Lazy imports
const HomePage = lazy(() => import("./pages/Home"));
const LoginPage = lazy(() => import("./pages/Login"));
const SignupPage = lazy(() => import("./pages/Signup"));
const CoursesPage = lazy(() => import("./pages/Courses"));
const CourseDetailsPage = lazy(() => import("./pages/CourseDetails"));
const DashboardPage = lazy(() => import("./pages/Dashboard"));
const ProfilePage = lazy(() => import("./pages/Profile"));
const InstructorDashboard = lazy(() => import("./pages/InstructorDashboard"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const CreateCourse = lazy(() => import("./pages/CreateCourse"));
const InstructorCourses = lazy(() => import("./pages/InstructorCourses"));
const EditInstructorCourse = lazy(() => import("./pages/EditInstructorCourse"));
const AdminPanel = lazy(() => import("./pages/Admin"));
const SalesManager = lazy(() => import("./pages/SalesManager"));
const AboutPage = lazy(() => import("./pages/About"));
const ContactPage = lazy(() => import("./pages/Contact"));
const AssistantDashboard = lazy(() => import("./pages/Assistant"));
const Unauthorized = lazy(() => import("./pages/Unauthorized"));

const AppRoutes = () => {
    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <div className="flex-grow">
                <Suspense fallback={<div className="p-6 text-center">Жүктөлүүдө...</div>}>
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<SignupPage />} />
                        <Route path="/courses" element={<CoursesPage />} />
                        <Route path="/dashboard" element={<DashboardPage />} />
                        <Route path="/profile" element={<ProfilePage />} />
                        <Route path="/unauthorized" element={<Unauthorized />} />

                        <Route element={<PrivateRoute allowedRoles={['instructor']} />}>
                            <Route path="/instructor" element={<InstructorDashboard />} />
                            <Route path="/instructor/course/create" element={<CreateCourse />} />
                            <Route path="/instructor/courses" element={<InstructorCourses />} />
                            <Route path="/instructor/courses/edit/:id" element={<EditInstructorCourse />} />
                        </Route>

                        <Route path="/courses/:id" element={<CourseDetailsPage />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />

                        <Route element={<PrivateRoute allowedRoles={['admin']} />}>
                            <Route path="/admin" element={<AdminPanel />} />
                        </Route>

                        <Route element={<PrivateRoute allowedRoles={['sales']} />}>
                            <Route path="/sales-manager" element={<SalesManager />} />
                        </Route>

                        <Route path="/about" element={<AboutPage />} />
                        <Route path="/contact" element={<ContactPage />} />

                        <Route element={<PrivateRoute allowedRoles={['assistant']} />}>
                            <Route path="/assistant" element={<AssistantDashboard />} />
                        </Route>
                    </Routes>
                </Suspense>
            </div>
            <Footer />
        </div>
    );
};

export default AppRoutes;
