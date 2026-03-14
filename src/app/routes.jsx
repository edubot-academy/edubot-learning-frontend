import { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import PrivateRoute from '@shared/PrivateRoute';
import MainLayout from './layouts/MainLayout';
import Loader from '@shared/ui/Loader';

const HomePage = lazy(() => import('../pages/Home'));
const LoginPage = lazy(() => import('../pages/Login'));
const SignupPage = lazy(() => import('../pages/Signup'));
const CoursesPage = lazy(() => import('../pages/Courses'));
const CourseDetailsPage = lazy(() => import('../pages/CourseDetails'));
const ProfilePage = lazy(() => import('../pages/Profile'));
const InstructorDashboard = lazy(() => import('../pages/InstructorDashboard'));
const StudentDashboard = lazy(() => import('../pages/StudentDashboard'));
const StudentAnalyticsPage = lazy(() => import('../pages/StudentAnalytics'));
const CreateCourse = lazy(() => import('../pages/CreateCourse'));
const InstructorCourses = lazy(() => import('../pages/InstructorCourses'));
const EditInstructorCourse = lazy(() => import('../pages/EditInstructorCourse'));
const AdminPanel = lazy(() => import('../pages/Admin'));
const AdminAnalyticsPage = lazy(() => import('../pages/AdminAnalytics'));
const SalesManager = lazy(() => import('../pages/SalesManager'));
const AboutPage = lazy(() => import('../pages/About'));
const ContactPage = lazy(() => import('../pages/Contact'));
const AssistantDashboard = lazy(() => import('../pages/Assistant'));
const Unauthorized = lazy(() => import('../pages/Unauthorized'));
const Catalog = lazy(() => import('../pages/catalog/Catalog'));
const CompanyCourses = lazy(() => import('../pages/company/CompanyCourses'));
const CompanyDetail = lazy(() => import('../pages/company/CompanyDetail'));
const CompanyList = lazy(() => import('../pages/company/CompanyList'));
const Favourite = lazy(() => import('../pages/Favourite'));
const CartPage = lazy(() => import('../pages/Cart'));
const Chat = lazy(() => import('../pages/Chat'));
const LeaderboardPage = lazy(() => import('../pages/Leaderboard'));
const InternalLeaderboardPage = lazy(() => import('../pages/InternalLeaderboard'));
const AttendancePage = lazy(() => import('../pages/Attendance'));
const SessionWorkspace = lazy(() => import('../pages/SessionWorkspace'));
const InstructorAnalyticsPage = lazy(() => import('../pages/InstructorAnalytics'));

const AppRoutes = () => {
    return (
        <MainLayout>
            <Suspense fallback={<Loader fullScreen />}>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<SignupPage />} />
                    <Route path="/courses" element={<CoursesPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/unauthorized" element={<Unauthorized />} />
                    <Route path="/favourites" element={<Favourite />} />
                    <Route path="/cart" element={<CartPage />} />
                    <Route element={<PrivateRoute allowedRoles={['instructor']} />}>
                        <Route path="/instructor" element={<InstructorDashboard />} />
                        <Route path="/instructor/sessions" element={<SessionWorkspace />} />
                        <Route path="/instructor/analytics" element={<InstructorAnalyticsPage />} />
                        <Route path="/instructor/course/create" element={<CreateCourse />} />
                        <Route path="/instructor/courses" element={<InstructorCourses />} />
                        <Route
                            path="/instructor/courses/edit/:id"
                            element={<EditInstructorCourse />}
                        />
                    </Route>

                    <Route element={<PrivateRoute allowedRoles={['student']} />}>
                        <Route path="/student" element={<StudentDashboard />} />
                        <Route path="/student/analytics" element={<StudentAnalyticsPage />} />
                        <Route path="/dashboard" element={<StudentDashboard />} />
                    </Route>

                    <Route path="/courses/:id" element={<CourseDetailsPage />} />

                    <Route element={<PrivateRoute allowedRoles={['admin']} />}>
                        <Route path="/admin" element={<AdminPanel />} />
                        <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
                    </Route>

                    <Route element={<PrivateRoute allowedRoles={['sales']} />}>
                        <Route path="/sales-manager" element={<SalesManager />} />
                    </Route>

                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/contact" element={<ContactPage />} />

                    <Route element={<PrivateRoute allowedRoles={['assistant']} />}>
                        <Route path="/assistant" element={<AssistantDashboard />} />
                    </Route>

                    <Route
                        element={
                            <PrivateRoute allowedRoles={['admin', 'assistant', 'instructor']} />
                        }
                    >
                        <Route path="/attendance" element={<AttendancePage />} />
                    </Route>
                    <Route path="/companies/:id/courses" element={<CompanyCourses />} />
                    <Route path="/catalog" element={<Catalog />} />
                    <Route path="/companies" element={<CompanyList />} />
                    <Route path="/companies/:id" element={<CompanyDetail />} />
                    <Route path="/chat" element={<Chat />} />
                    <Route path="/leaderboard" element={<LeaderboardPage />} />

                    <Route element={<PrivateRoute allowedRoles={['admin', 'instructor', 'assistant', 'student']} />}>
                        <Route path="/leaderboard/internal" element={<InternalLeaderboardPage />} />
                    </Route>
                </Routes>
            </Suspense>
        </MainLayout>
    );
};

export default AppRoutes;
