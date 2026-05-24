import { Suspense, lazy, useContext } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import { AuthContext } from '@app/providers';
import PrivateRoute from '@shared/PrivateRoute';
import MainLayout from './layouts/MainLayout';
import Loader from '@shared/ui/Loader';
import { isPublicVideoSignupEnabled } from '@shared/auth-config';
import { getDashboardPath, getUserNavigationPaths } from '@shared/utils/navigation';
import {
    ADMIN_DASHBOARD_TABS,
    INSTRUCTOR_DASHBOARD_TABS,
    STUDENT_DASHBOARD_TABS,
} from '@shared/constants/dashboardTabs';

const HomePage = lazy(() => import('../pages/Home'));
const LoginPage = lazy(() => import('../pages/Login'));
const SignupPage = lazy(() => import('../pages/Signup'));
const SetupAccountPage = lazy(() => import('../pages/SetupAccount'));
const CoursesPage = lazy(() => import('../pages/Courses'));
const CourseDetailsPage = lazy(() => import('../pages/CourseDetails'));
const InstructorDashboard = lazy(() => import('../pages/InstructorDashboard'));
const StudentDashboard = lazy(() => import('../pages/StudentDashboard'));
const CreateCourse = lazy(() => import('../pages/CreateCourse'));
const InstructorCourses = lazy(() => import('../pages/InstructorCourses'));
const EditInstructorCourse = lazy(() => import('../pages/EditInstructorCourse'));
const AdminPanel = lazy(() => import('../pages/Admin'));
const PlatformTenantDetail = lazy(() => import('../features/admin/pages/PlatformTenantDetail'));
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
const Chat = lazy(() => import('../pages/ChatRedirect'));
const LeaderboardPage = lazy(() => import('../pages/Leaderboard'));
const InternalLeaderboardPage = lazy(() => import('../pages/InternalLeaderboard'));
const CertificateDownloadPage = lazy(() => import('../pages/CertificateDownload'));
const CertificateVerificationPage = lazy(() => import('../pages/CertificateVerification'));

export const DashboardTabRedirect = ({ dashboardPath, tab }) => {
    const { search } = useLocation();
    const params = new URLSearchParams(search);
    params.set('tab', tab);

    return <Navigate to={`${dashboardPath}?${params.toString()}`} replace />;
};

DashboardTabRedirect.propTypes = {
    dashboardPath: PropTypes.string.isRequired,
    tab: PropTypes.string.isRequired,
};

const LegacyProfileRedirect = () => {
    const { user } = useContext(AuthContext);

    if (user?.role === 'instructor') {
        return <Navigate to={getDashboardPath(user, INSTRUCTOR_DASHBOARD_TABS.PROFILE)} replace />;
    }

    if (user?.role === 'student') {
        return <Navigate to={getDashboardPath(user, STUDENT_DASHBOARD_TABS.PROFILE)} replace />;
    }

    return <Navigate to={getUserNavigationPaths(user).dashboardOverview} replace />;
};

const AppRoutes = () => {
    return (
        <MainLayout>
            <Suspense fallback={<Loader fullScreen />}>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/setup-account" element={<SetupAccountPage />} />
                    {isPublicVideoSignupEnabled ? (
                        <Route path="/register" element={<SignupPage />} />
                    ) : (
                        <Route path="/register" element={<Navigate to="/login" replace />} />
                    )}
                    <Route path="/courses" element={<CoursesPage />} />
                    <Route path="/unauthorized" element={<Unauthorized />} />
                    <Route path="/favourites" element={<Favourite />} />
                    <Route path="/cart" element={<CartPage />} />
                    <Route element={<PrivateRoute />}>
                        <Route path="/profile" element={<LegacyProfileRedirect />} />
                    </Route>
                    <Route element={<PrivateRoute allowedRoles={['instructor']} />}>
                        <Route path="/instructor" element={<InstructorDashboard />} />
                        <Route
                            path="/instructor/sessions"
                            element={<DashboardTabRedirect dashboardPath="/instructor" tab={INSTRUCTOR_DASHBOARD_TABS.SESSIONS} />}
                        />
                        <Route
                            path="/instructor/analytics"
                            element={<DashboardTabRedirect dashboardPath="/instructor" tab={INSTRUCTOR_DASHBOARD_TABS.ANALYTICS} />}
                        />
                        <Route
                            path="/instructor/homework"
                            element={<DashboardTabRedirect dashboardPath="/instructor" tab={INSTRUCTOR_DASHBOARD_TABS.HOMEWORK} />}
                        />
                        <Route path="/instructor/course/create" element={<CreateCourse />} />
                        <Route path="/instructor/courses" element={<InstructorCourses />} />
                        <Route
                            path="/instructor/courses/edit/:id"
                            element={<EditInstructorCourse />}
                        />
                    </Route>

                    <Route element={<PrivateRoute allowedRoles={['student']} requireStudentAccess />}>
                        <Route path="/student" element={<StudentDashboard />} />
                        <Route
                            path="/student/analytics"
                            element={<DashboardTabRedirect dashboardPath="/student" tab={STUDENT_DASHBOARD_TABS.PROGRESS} />}
                        />
                        <Route path="/dashboard" element={<StudentDashboard />} />
                    </Route>

                    <Route path="/courses/:id" element={<CourseDetailsPage />} />

                    <Route element={<PrivateRoute allowedRoles={['admin']} />}>
                        <Route path="/admin" element={<AdminPanel />} />
                        <Route path="/admin/tenants/:id" element={<PlatformTenantDetail />} />
                        <Route
                            path="/admin/analytics"
                            element={<DashboardTabRedirect dashboardPath="/admin" tab={ADMIN_DASHBOARD_TABS.ANALYTICS} />}
                        />
                    </Route>

                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/contact" element={<ContactPage />} />

                    <Route element={<PrivateRoute allowedRoles={['assistant']} />}>
                        <Route path="/assistant" element={<AssistantDashboard />} />
                    </Route>
                    <Route element={<PrivateRoute allowedRoles={['admin']} />}>
                        <Route path="/companies/:id/courses" element={<CompanyCourses />} />
                        <Route path="/companies" element={<CompanyList />} />
                        <Route path="/companies/:id" element={<CompanyDetail />} />
                    </Route>
                    <Route path="/catalog" element={<Catalog />} />
                    <Route path="/chat" element={<Chat />} />
                    <Route path="/leaderboard" element={<LeaderboardPage />} />
                    <Route path="/share/achievement/:token" element={<Navigate to="/leaderboard" replace />} />
                    <Route path="/certificates/:publicId/verify" element={<CertificateVerificationPage />} />

                    <Route element={<PrivateRoute allowedRoles={['student', 'admin', 'instructor']} />}>
                        <Route path="/certificates/:publicId/download" element={<CertificateDownloadPage />} />
                    </Route>

                    <Route element={<PrivateRoute allowedRoles={['admin', 'instructor', 'assistant']} />}>
                        <Route path="/leaderboard/internal" element={<InternalLeaderboardPage />} />
                    </Route>
                </Routes>
            </Suspense>
        </MainLayout>
    );
};

export default AppRoutes;
