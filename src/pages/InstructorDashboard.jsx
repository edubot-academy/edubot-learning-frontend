import { lazy, Suspense, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import useDashboardSwipeGestures from '../hooks/useDashboardSwipeGestures';
import {
    createCourse,
    fetchCategories,
    updateCourse,
} from '@services/api';
import { markCoursePending } from '@features/courses/api';
import toast from 'react-hot-toast';
import Loader from '../shared/ui/Loader';
import FloatingActionButton from '../components/ui/FloatingActionButton';
import {
    InstructorOverviewSection,
    CoursesSection,
    GroupsSection,
    StudentsSection,
    CertificatesSection,
    ProfileSection,
    AiSection,
    OfferingsSection,
    INSTRUCTOR_WORKSPACE_GROUP_BY_ID,
    NAV_ITEMS,
} from '@features/instructor-dashboard';
import { useInstructorDashboardRouteState } from '@features/instructor-dashboard/hooks/useInstructorDashboardRouteState.js';
import { useInstructorCourses } from '@features/instructor-dashboard/hooks/useInstructorCourses.js';
import { useInstructorProfile } from '@features/instructor-dashboard/hooks/useInstructorProfile.js';
import { useInstructorStudentWorkspace } from '@features/instructor-dashboard/hooks/useInstructorStudentWorkspace.js';
import { useOfferingsManagement } from '@features/instructor-dashboard/hooks/useOfferingsManagement.js';
import {
    DashboardLayout,
    DashboardHeader,
    DashboardTabs,
} from '../components/ui/dashboard';
import { useDashboardKeyboardNavigation } from '../components/ui/dashboard/useDashboardKeyboardNavigation';
import { getDashboardPath } from '@shared/utils/navigation';

const AttendancePage = lazy(() => import('./Attendance'));
const SessionWorkspacePage = lazy(() => import('./SessionWorkspace'));
const InstructorAnalyticsPage = lazy(() => import('./InstructorAnalytics'));
const InternalLeaderboard = lazy(() => import('./InternalLeaderboard'));
const InstructorHomework = lazy(() => import('./InstructorHomework'));
const NotificationsTab = lazy(() => import('@features/notifications/components/NotificationsTab'));
const ChatTab = lazy(() => import('@features/instructor-dashboard/components/ChatTab.jsx'));

const TabSuspense = ({ children }) => (
    <Suspense fallback={<Loader fullScreen={false} />}>{children}</Suspense>
);

const InstructorDashboard = () => {
    const { user } = useContext(AuthContext);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const { activeTab, handleTabSelect } = useInstructorDashboardRouteState({
        navItems: NAV_ITEMS,
    });
    useDashboardKeyboardNavigation();

    const [showDeliveryModal, setShowDeliveryModal] = useState(false);
    const [creatingDeliveryCourse, setCreatingDeliveryCourse] = useState(false);
    const [showEditDeliveryModal, setShowEditDeliveryModal] = useState(false);
    const [editingDeliveryCourse, setEditingDeliveryCourse] = useState(null);
    const [updatingDeliveryCourse, setUpdatingDeliveryCourse] = useState(false);
    const [submittingCourseId, setSubmittingCourseId] = useState(null);
    const [deliveryCategories, setDeliveryCategories] = useState([]);

    const analyticsLink = useMemo(() => {
        const to = new Date();
        const from = new Date(to.getTime() - 30 * 24 * 60 * 60 * 1000);
        return getDashboardPath('instructor', 'analytics', {
            from: from.toISOString().slice(0, 10),
            to: to.toISOString().slice(0, 10),
        });
    }, []);

    const {
        expertiseTags,
        loadProfile,
        loadingProfile,
        profile,
        saveProfile: handleSaveInstructorProfile,
        savingProfile,
        socialLinks,
    } = useInstructorProfile(user);

    const {
        courses,
        loadingCourses,
        aiCourses,
        approvedCourses,
        publishedCount,
        pendingCount,
        loadCourses,
        upsertCourse,
        markCoursePendingLocally,
    } = useInstructorCourses(user, profile);
    const {
        certificateActionKind,
        certificateActionStudentId,
        certificateCourses,
        certificateSettings,
        courseCertificates,
        courseStudents,
        courseStudentsMeta,
        handleCertificateAction,
        handleRegenerateCertificates,
        handleSaveCertificateAsset,
        handleSaveCertificateSettings,
        handleSelectStudentCourse,
        handleToggleCertificateApproval,
        loadStudentCourses,
        loadingCertificateWorkspace,
        loadingCourseStudents,
        loadingStudentCourses,
        progressMax,
        progressMin,
        regeneratingCertificates,
        savingCertificateAssetKind,
        savingCertificateSettings,
        selectedStudentCourseId,
        setProgressMax,
        setProgressMin,
        setStudentSearch,
        setStudentsPage,
        studentCourses,
        studentCoursesTotal,
        studentSearch,
        studentsError,
        studentsPage,
    } = useInstructorStudentWorkspace({ activeTab, user });

    const aiEnabledCount = aiCourses.length;
    const totalCourseStudents = useMemo(
        () => courses.reduce((sum, course) => sum + Number(course.studentsCount || course.studentCount || 0), 0),
        [courses]
    );

    const {
        offerings: approvedOfferings,
        loadingOfferings,
        handleRefreshOfferings,
    } = useOfferingsManagement(approvedCourses);
    const certificateCurrentUser = useMemo(
        () =>
            user
                ? {
                      ...user,
                      title: profile?.title ?? user.title,
                  }
                : user,
        [profile?.title, user]
    );
    const handleSwipeLeft = useCallback(() => {
        if (window.innerWidth < 768) setSidebarOpen(false);
    }, []);

    const handleSwipeRight = useCallback(() => {
        if (window.innerWidth < 768) setSidebarOpen(true);
    }, []);

    useDashboardSwipeGestures({
        onSwipeLeft: handleSwipeLeft,
        onSwipeRight: handleSwipeRight,
        enabled: typeof window !== 'undefined' && window.innerWidth < 768,
    });

    useEffect(() => {
        loadProfile();
    }, [loadProfile]);

    const closeDeliveryModal = () => {
        setShowDeliveryModal(false);
    };

    const closeEditDeliveryModal = () => {
        setShowEditDeliveryModal(false);
        setEditingDeliveryCourse(null);
    };

    const openDeliveryModal = async () => {
        if (!deliveryCategories.length) {
            try {
                const categories = await fetchCategories();
                setDeliveryCategories(Array.isArray(categories) ? categories : []);
            } catch (error) {
                console.error('Failed to load categories', error);
                toast.error('Категориялар жүктөлгөн жок');
            }
        }

        setShowDeliveryModal(true);
    };

    const openDeliveryEditModal = async (course) => {
        if (!course) return;

        if (!deliveryCategories.length) {
            try {
                const categories = await fetchCategories();
                setDeliveryCategories(Array.isArray(categories) ? categories : []);
            } catch (error) {
                console.error('Failed to load categories', error);
                toast.error('Категориялар жүктөлгөн жок');
                return;
            }
        }

        setEditingDeliveryCourse({
            id: course.id,
            courseType: course.courseType || 'offline',
            title: course.title || '',
            description: course.description || '',
            categoryId: course.category?.id || course.categoryId || '',
            price: course.price || 0,
            languageCode: course.languageCode || 'ky',
            status: course.status || '',
            isPublished: Boolean(course.isPublished),
        });
        setShowEditDeliveryModal(true);
    };

    const handleCreateDeliveryCourse = async (payload) => {
        if (!payload?.title || !payload?.description || !payload?.categoryId) {
            toast.error('Сураныч, аталыш, сүрөттөмө жана категорияны толтуруңуз.');
            return false;
        }

        setCreatingDeliveryCourse(true);
        try {
            const createdCourse = await createCourse({
                title: payload.title,
                description: payload.description,
                categoryId: parseInt(payload.categoryId, 10),
                price: Number(payload.price || 0),
                languageCode: payload.languageCode || 'ky',
                courseType: payload.courseType,
                isPaid: Number(payload.price || 0) > 0,
            });

            toast.success('Курс түзүлдү. Эми группа жана сессия түзө аласыз.');
            closeDeliveryModal();
            handleTabSelect('courses');

            if (!upsertCourse(createdCourse)) {
                await loadCourses();
            }
            return true;
        } catch (error) {
            console.error('Failed to create delivery course', error);
            toast.error('Курсту түзүүдө ката кетти.');
            return false;
        } finally {
            setCreatingDeliveryCourse(false);
        }
    };

    const handleUpdateDeliveryCourse = async (payload) => {
        if (!editingDeliveryCourse?.id) return false;

        if (!payload?.title || !payload?.description || !payload?.categoryId) {
            toast.error('Сураныч, аталыш, сүрөттөмө жана категорияны толтуруңуз.');
            return false;
        }

        setUpdatingDeliveryCourse(true);
        try {
            const updatedCourse = await updateCourse(editingDeliveryCourse.id, {
                title: payload.title,
                description: payload.description,
                categoryId: parseInt(payload.categoryId, 10),
                price: Number(payload.price || 0),
                languageCode: payload.languageCode || 'ky',
                courseType: payload.courseType,
                isPaid: Number(payload.price || 0) > 0,
            });

            const requiresReview =
                editingDeliveryCourse.status === 'approved' || editingDeliveryCourse.isPublished;

            let reviewCourse = null;
            if (requiresReview) {
                reviewCourse = await markCoursePending(editingDeliveryCourse.id);
            }

            const appliedCourseUpdate = upsertCourse(reviewCourse || updatedCourse);
            if (requiresReview) {
                if (!appliedCourseUpdate) upsertCourse(updatedCourse);
                markCoursePendingLocally(editingDeliveryCourse.id);
            } else if (!appliedCourseUpdate) {
                await loadCourses();
            }
            toast.success(
                requiresReview
                    ? 'Delivery курс жаңыртылды жана кайра карап чыгууга жөнөтүлдү'
                    : 'Delivery курс жаңыртылды'
            );
            closeEditDeliveryModal();
            return true;
        } catch (error) {
            console.error('Failed to update delivery course', error);
            toast.error('Delivery курсту жаңыртууда ката кетти.');
            return false;
        } finally {
            setUpdatingDeliveryCourse(false);
        }
    };

    const handleSubmitCourseForApproval = useCallback(async (courseId) => {
        if (!courseId) return false;

        setSubmittingCourseId(courseId);
        try {
            const pendingCourse = await markCoursePending(courseId);
            if (!upsertCourse(pendingCourse)) {
                markCoursePendingLocally(courseId);
            }
            toast.success('Курс тастыктоого жөнөтүлдү');
            return true;
        } catch (error) {
            console.error('Failed to submit course for approval', error);
            const message =
                error?.response?.data?.message ||
                error?.message ||
                'Курсту тастыктоого жөнөтүү мүмкүн болбоду';
            toast.error(Array.isArray(message) ? message.join(', ') : message);
            return false;
        } finally {
            setSubmittingCourseId(null);
        }
    }, [markCoursePendingLocally, upsertCourse]);

    const isTabLoading =
        loadingStudentCourses || loadingCourseStudents || loadingOfferings;

    const renderTabContent = () => {
        switch (activeTab) {
            case 'sessions':
                return (
                    <TabSuspense>
                        <SessionWorkspacePage />
                    </TabSuspense>
                );
            case 'attendance':
                return (
                    <TabSuspense>
                        <AttendancePage embedded />
                    </TabSuspense>
                );
            case 'analytics':
                return (
                    <TabSuspense>
                        <InstructorAnalyticsPage embedded />
                    </TabSuspense>
                );
            case 'leaderboard':
                return (
                    <TabSuspense>
                        <InternalLeaderboard />
                    </TabSuspense>
                );
            case 'homework':
                return (
                    <TabSuspense>
                        <InstructorHomework />
                    </TabSuspense>
                );
            case 'chat':
                return (
                    <TabSuspense>
                        <ChatTab />
                    </TabSuspense>
                );
            case 'notifications':
                return (
                    <TabSuspense>
                        <NotificationsTab />
                    </TabSuspense>
                );
            case 'courses':
                return (
                    <CoursesSection
                        courses={courses}
                        loading={loadingCourses}
                        submittingCourseId={submittingCourseId}
                        onOpenDeliveryModal={openDeliveryModal}
                        onOpenDeliveryEditModal={openDeliveryEditModal}
                        showDeliveryModal={showDeliveryModal}
                        onCloseDeliveryModal={closeDeliveryModal}
                        onCreateDeliveryCourse={handleCreateDeliveryCourse}
                        showEditDeliveryModal={showEditDeliveryModal}
                        onCloseEditDeliveryModal={closeEditDeliveryModal}
                        editingDeliveryCourse={editingDeliveryCourse}
                        onUpdateDeliveryCourse={handleUpdateDeliveryCourse}
                        updatingDeliveryCourse={updatingDeliveryCourse}
                        onSubmitCourseForApproval={handleSubmitCourseForApproval}
                        creatingDeliveryCourse={creatingDeliveryCourse}
                        deliveryCategories={deliveryCategories}
                    />
                );
            case 'students':
                return (
                    <StudentsSection
                        total={studentCoursesTotal}
                        courses={studentCourses}
                        loadingCourses={loadingStudentCourses}
                        selectedCourseId={selectedStudentCourseId}
                        onSelectCourse={handleSelectStudentCourse}
                        courseStudents={courseStudents}
                        courseMeta={courseStudentsMeta}
                        loadingStudents={loadingCourseStudents}
                        error={studentsError}
                        refreshCourses={loadStudentCourses}
                        studentsPage={studentsPage}
                        onChangePage={setStudentsPage}
                        search={studentSearch}
                        onSearchChange={setStudentSearch}
                        progressMin={progressMin}
                        onProgressMinChange={setProgressMin}
                        progressMax={progressMax}
                        onProgressMaxChange={setProgressMax}
                    />
                );
            case 'certificates':
                return (
                    <CertificatesSection
                        mode="instructor"
                        total={certificateCourses.reduce((sum, course) => sum + (course.studentCount || 0), 0)}
                        courses={certificateCourses}
                        loadingCourses={loadingStudentCourses}
                        selectedCourseId={selectedStudentCourseId}
                        onSelectCourse={handleSelectStudentCourse}
                        disabledCourseCount={studentCourses.length - certificateCourses.length}
                        disabledReason="Certificates are disabled for some tenant courses."
                        courseStudents={courseStudents}
                        courseMeta={courseStudentsMeta}
                        loadingStudents={loadingCourseStudents}
                        error={studentsError}
                        refreshCourses={loadStudentCourses}
                        studentsPage={studentsPage}
                        onChangePage={setStudentsPage}
                        search={studentSearch}
                        onSearchChange={setStudentSearch}
                        progressMin={progressMin}
                        onProgressMinChange={setProgressMin}
                        progressMax={progressMax}
                        onProgressMaxChange={setProgressMax}
                        certificateSettings={certificateSettings}
                        courseCertificates={courseCertificates}
                        loadingCertificateWorkspace={loadingCertificateWorkspace}
                        savingCertificateSettings={savingCertificateSettings}
                        onToggleCertificateApproval={handleToggleCertificateApproval}
                        onSaveCertificateSettings={handleSaveCertificateSettings}
                        onRegenerateCertificates={handleRegenerateCertificates}
                        regeneratingCertificates={regeneratingCertificates}
                        savingCertificateAssetKind={savingCertificateAssetKind}
                        onSaveCertificateAsset={handleSaveCertificateAsset}
                        onCertificateAction={handleCertificateAction}
                        certificateActionStudentId={certificateActionStudentId}
                        certificateActionKind={certificateActionKind}
                        currentUser={certificateCurrentUser}
                    />
                );
            case 'groups':
                return <GroupsSection courses={courses} />;
            case 'profile':
                return (
                    <ProfileSection
                        profile={profile}
                        studentCount={totalCourseStudents}
                        expertiseTags={expertiseTags}
                        socialLinks={socialLinks}
                        onSaveProfile={handleSaveInstructorProfile}
                        savingProfile={savingProfile}
                    />
                );
            case 'ai':
                return <AiSection aiCourses={aiCourses} totalCourses={courses.length} />;
            case 'offerings':
                return (
                    <OfferingsSection
                        courses={approvedCourses}
                        offerings={approvedOfferings}
                        loading={loadingOfferings}
                        refreshOfferings={handleRefreshOfferings}
                    />
                );
            case 'overview':
            default:
                return (
                    <InstructorOverviewSection
                        user={user}
                        profile={profile}
                        courses={courses}
                        studentCount={totalCourseStudents}
                        publishedCount={publishedCount}
                        pendingCount={pendingCount}
                        aiEnabledCount={aiEnabledCount}
                        analyticsLink={analyticsLink}
                    />
                );
        }
    };

    const renderContent = () => {
        const isInitialLoading =
            (loadingProfile && !profile) || (loadingCourses && !courses.length);
        const hasDataLoaded = !!profile || courses.length > 0;

        if (isInitialLoading && !hasDataLoaded) {
            return <Loader fullScreen={false} />;
        }

        return (
            <div className="relative">
                {renderTabContent()}
                {isTabLoading && hasDataLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-white/50 dark:bg-gray-900/50">
                        <div className="rounded-lg bg-white p-3 shadow-lg dark:bg-gray-800">
                            <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
                        </div>
                    </div>
                )}
            </div>
        );
    };

    // Prepare navigation items for the standardized layout
    const dashboardNavItems = NAV_ITEMS.map((item) => ({
        ...item,
        isActive: item.id === activeTab,
        onSelect: handleTabSelect,
    }));
    const activeNavItem = dashboardNavItems.find((item) => item.id === activeTab);
    const activeWorkspaceGroup = INSTRUCTOR_WORKSPACE_GROUP_BY_ID[activeNavItem?.workspaceGroup];
    const relatedWorkspaceTabs = activeWorkspaceGroup
        ? dashboardNavItems.filter((item) => activeWorkspaceGroup.tabs.includes(item.id))
        : [];
    const activeTabStatus = [
        loadingProfile && 'Профиль жүктөлүүдө',
        loadingCourses && 'Курстар жүктөлүүдө',
        isTabLoading && 'Workspace жаңыланууда',
    ].filter(Boolean);

    // Prepare header actions
    const headerActions = [
        {
            label: '📊 Аналитика',
            to: analyticsLink,
            variant: 'primary',
        },
        {
            label: sidebarOpen ? 'Менюну жашыруу' : 'Менюну көрсөтүү',
            onClick: () => setSidebarOpen((prev) => !prev),
            variant: 'secondary',
            className: 'hidden md:inline-flex',
        },
    ];

    // Prepare header content
    const headerContent = (
        <DashboardHeader
            user={user}
            role="instructor"
            subtitle="Курстарыңызды жана студенттерди толук көзөмөлдөңүз"
            actions={headerActions}
        />
    );

    // Mobile tabs
    const mobileTabs = (
        <DashboardTabs
            items={dashboardNavItems}
            activeId={activeTab}
            onSelect={handleTabSelect}
        />
    );

    if (!user) return <Navigate to="/login" replace />;
    if (user.role !== 'instructor') return <Navigate to="/" replace />;

    return (
        <DashboardLayout
            role="instructor"
            user={user}
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            navItems={dashboardNavItems}
            mobileTabs={mobileTabs}
            headerContent={headerContent}
        >
            {activeWorkspaceGroup ? (
                <section className="rounded-2xl border border-edubot-line/80 bg-white/90 px-4 py-3 shadow-edubot-card dark:border-slate-700 dark:bg-slate-950">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-edubot-muted dark:text-slate-400">
                                Инструктор бөлүмү
                            </p>
                            <h2 className="mt-1 text-base font-semibold text-edubot-ink dark:text-white">
                                {activeWorkspaceGroup.label}
                            </h2>
                            <p className="mt-1 text-sm text-edubot-muted dark:text-slate-400">
                                {activeTabStatus.length ? activeTabStatus.join(' · ') : `${activeNavItem?.label || 'Бөлүм'} ачылды`}
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {relatedWorkspaceTabs.map((item) => (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => handleTabSelect(item.id)}
                                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                                        item.id === activeTab
                                            ? 'border-edubot-orange bg-edubot-orange text-white'
                                            : 'border-edubot-line bg-white text-edubot-muted hover:border-edubot-orange hover:text-edubot-orange dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'
                                    }`}
                                >
                                    {item.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </section>
            ) : null}
            {renderContent()}

            {/* Floating Action Button */}
            <FloatingActionButton role="instructor" />
        </DashboardLayout>
    );
};

export default InstructorDashboard;
