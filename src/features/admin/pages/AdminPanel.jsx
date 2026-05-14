import { useEffect, useState, useCallback, useContext } from 'react';
import FloatingActionButton from '../../../components/ui/FloatingActionButton';
import { AuthContext } from '../../../context/AuthContext';
import { markNotificationRead as markNotificationReadApi } from '@services/api';
import toast from 'react-hot-toast';
import NotificationsWidget from '@features/notifications/components/NotificationsWidget';
import NotificationsTab from '@features/notifications/components/NotificationsTab';
import ConfirmationModal from '@shared/ui/ConfirmationModal';
import IntegrationTab from '@features/integration/components/IntegrationTab';
import AttendancePage from '../../../pages/Attendance';
import AdminAnalyticsPage from '../../../pages/AdminAnalytics';

// Import standardized dashboard components
import { DashboardLayout, DashboardHeader, DashboardTabs } from '../../../components/ui/dashboard';
import { useDashboardKeyboardNavigation } from '../../../components/ui/dashboard/useDashboardKeyboardNavigation';

// Import extracted components
import AdminStatsTab from '../components/AdminStatsTab';
import AdminUsersTab from '../components/AdminUsersTab';
import AdminCoursesTab from '../components/AdminCoursesTab';
import AdminCompaniesTab from '../components/AdminCompaniesTab';
import AdminSkillsTab from '../components/AdminSkillsTab';
import AdminAiPromptsTab from '../components/AdminAiPromptsTab';
import AdminContactsTab from '../components/AdminContactsTab';
import AdminPendingCoursesTab from '../components/AdminPendingCoursesTab';
import { CertificatesSection } from '@features/instructor-dashboard';

// Import constants and helpers
import { NAV_ITEMS } from '../utils/adminPanel.constants';
import { calculateVisiblePages } from '../utils/adminPanel.helpers';
import { useAdminTabState } from '../hooks/useAdminTabState';
import { useAdminUsersFilters } from '../hooks/useAdminUsersFilters';
import { useAdminUsersDomain } from '../hooks/useAdminUsersDomain';
import { useAdminCompaniesDomain } from '../hooks/useAdminCompaniesDomain';
import { useAdminSkillsDomain } from '../hooks/useAdminSkillsDomain';
import { useAdminAiPromptsDomain } from '../hooks/useAdminAiPromptsDomain';
import { useAdminContactsDomain } from '../hooks/useAdminContactsDomain';
import { useAdminPendingCoursesDomain } from '../hooks/useAdminPendingCoursesDomain';
import { useAdminStatsDomain } from '../hooks/useAdminStatsDomain';
import { useAdminTranscodeDomain } from '../hooks/useAdminTranscodeDomain';
import { useAdminCoursesDomain } from '../hooks/useAdminCoursesDomain';
import { useAdminCertificatesDomain } from '../hooks/useAdminCertificatesDomain';

const AdminPanel = () => {
    const { user } = useContext(AuthContext);

    const [sidebarOpen, setSidebarOpen] = useState(true);

    const [confirmation, setConfirmation] = useState(null);

    // Users pagination state
    const {
        dateFrom,
        dateTo,
        handleUsersPageChange,
        roleFilter,
        search,
        setDateFrom,
        setDateTo,
        setRoleFilter,
        setSearch,
        usersPage,
    } = useAdminUsersFilters();
    // Tab state
    const { activeTab, handleTabSelect } = useAdminTabState();

    useDashboardKeyboardNavigation();

    // Event handlers
    const requestConfirmation = useCallback((config) => {
        setConfirmation(config);
    }, []);

    const {
        categories,
        courseGroupsByCourseId,
        courses,
        editingCategoryId,
        editingCategoryName,
        handleAddCategory,
        handleDeleteCategory,
        handleDeleteCourse,
        handleUpdateCategory,
        loadCoursesAndCategories,
        newCategory,
        selectedEnrollmentGroupIds,
        setEditingCategoryId,
        setEditingCategoryName,
        setNewCategory,
        setSelectedEnrollmentGroupIds,
    } = useAdminCoursesDomain({ requestConfirmation });

    const {
        handleDeleteUser,
        handleEnrollUser,
        handleRoleChange,
        loadUsers,
        loadUsersForEnrollment,
        users,
        usersTotal,
        usersTotalPages,
    } = useAdminUsersDomain({
        courses,
        dateFrom,
        dateTo,
        requestConfirmation,
        roleFilter,
        search,
        selectedEnrollmentGroupIds,
        usersPage,
    });

    const {
        certificateActionStudentId,
        certificateCourseMeta,
        certificateError,
        certificateProgressMax,
        certificateProgressMin,
        certificateSearch,
        certificateSettings,
        certificateStudents,
        certificateStudentsPage,
        courseCertificates,
        handleCertificateAction,
        handleRegenerateCertificates,
        handleSaveCertificateAsset,
        handleSaveCertificateSettings,
        handleSelectCertificateCourse,
        handleToggleCertificateApproval,
        loadingCertificateStudents,
        loadingCertificateWorkspace,
        regeneratingCertificates,
        savingCertificateAssetKind,
        savingCertificateSettings,
        selectedCertificateCourseId,
        setCertificateProgressMax,
        setCertificateProgressMin,
        setCertificateSearch,
        setCertificateStudentsPage,
    } = useAdminCertificatesDomain({ activeTab });

    // Render pagination buttons
    const renderUserPageButtons = () => {
        if (usersTotalPages <= 1) return null;

        const visiblePages = calculateVisiblePages(usersPage, usersTotalPages);

        return visiblePages.map((p) => (
            <button
                key={p}
                type="button"
                onClick={() => handleUsersPageChange(p)}
                className={`w-9 h-9 rounded border text-sm font-medium transition-all duration-300 transform hover:scale-110 ${
                    p === usersPage
                        ? 'bg-edubot-orange text-white border-edubot-orange scale-110 ring-2 ring-edubot-orange/50'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 hover:border-edubot-orange hover:text-edubot-orange hover:shadow-md'
                }`}
            >
                {p}
            </button>
        ));
    };

    const {
        companies,
        companySearch,
        handleAssignCourseToCompany,
        handleClearCourseCompany,
        handleCreateCompany,
        handleDeleteCompany,
        handleUnassignCourseFromCompany,
        handleUpdateCompany,
        handleUploadCompanyLogo,
        loadCompanies,
        newCompanyForm,
        setCompanySearch,
        setNewCompanyForm,
    } = useAdminCompaniesDomain({
        loadCoursesAndCategories,
        requestConfirmation,
    });

    const {
        handleBulkTranscode,
        handleTranscode,
        setTranscodeCourseId,
        setTranscodeLessonId,
        setTranscodeLessonIds,
        setTranscodeSectionId,
        transcodeCourseId,
        transcodeLessonId,
        transcodeLessonIds,
        transcodeLoading,
        transcodeSectionId,
    } = useAdminTranscodeDomain({ loadCoursesAndCategories });

    const {
        handleCreateSkill,
        handleDeleteSkill,
        handleUpdateSkill,
        loadSkillsList,
        newSkillName,
        setNewSkillName,
        skills,
    } = useAdminSkillsDomain({ requestConfirmation });

    const {
        aiPromptCourseId,
        aiPrompts,
        aiPromptsLoading,
        handleCreatePrompt,
        handleDeletePrompt,
        handleUpdatePrompt,
        loadPromptsForCourse,
        newPromptIsActive,
        newPromptLanguage,
        newPromptOrder,
        newPromptText,
        setAiPromptCourseId,
        setNewPromptIsActive,
        setNewPromptLanguage,
        setNewPromptOrder,
        setNewPromptText,
    } = useAdminAiPromptsDomain({ requestConfirmation });

    const { contacts, loadContacts, removeContact } = useAdminContactsDomain();

    const {
        handleApprovePendingCourse,
        handleRejectPendingCourse,
        loadPendingCourses,
        pendingCourses,
    } = useAdminPendingCoursesDomain();

    const {
        adminStats,
        adminStatsLoaded,
        adminStatsLoading,
        loadAdminStats,
    } = useAdminStatsDomain();

    const closeConfirmation = useCallback(() => {
        setConfirmation(null);
    }, []);

    const confirmAndRun = useCallback(async () => {
        if (!confirmation?.onConfirm) return;
        try {
            await confirmation.onConfirm();
        } catch {
            // handled in action handlers
        } finally {
            setConfirmation(null);
        }
    }, [confirmation]);

    // Notification management handlers
    const markNotificationRead = async (notificationId) => {
        try {
            await markNotificationReadApi(notificationId);
            toast.success('Билдирүү окулган деп белгиленди');
        } catch {
            toast.error('Билдирүүнү окулган деп белгилөөдө ката кетти');
        }
    };

    const deleteNotification = async (notificationId) => {
        requestConfirmation({
            title: 'Билдирүүнү өчүрүү',
            message: 'Бул билдирүүнү өчүрүүгө ишенимдүүсүзбү?',
            confirmLabel: 'Өчүрүү',
            confirmVariant: 'danger',
            onConfirm: async () => {
                try {
                    removeContact(notificationId);
                    toast.success('Билдирүү ийгиликтүү өчүрүлдү');
                } catch {
                    toast.error('Билдирүүнү өчүрүүдө ката кетти');
                }
            },
        });
    };

    // Effects for loading data based on active tab
    useEffect(() => {
        if (activeTab === 'courses' || activeTab === 'ai-prompts' || activeTab === 'certificates') {
            loadCoursesAndCategories();
        }
        if (activeTab === 'contacts') {
            loadContacts();
        }
        if (activeTab === 'pending') {
            loadPendingCourses();
        }
        if (activeTab === 'courses') {
            loadUsersForEnrollment();
        }
    }, [
        activeTab,
        loadCoursesAndCategories,
        loadContacts,
        loadPendingCourses,
        loadUsersForEnrollment,
    ]);

    useEffect(() => {
        if (activeTab === 'stats' && !adminStatsLoaded) {
            loadAdminStats();
        }
        if (activeTab === 'skills') {
            loadSkillsList();
        }
    }, [activeTab, adminStatsLoaded, loadAdminStats, loadSkillsList]);

    useEffect(() => {
        if (activeTab === 'users') {
            loadUsers();
        }
    }, [activeTab, loadUsers]);

    useEffect(() => {
        if (activeTab === 'ai-prompts' && courses.length && !aiPromptCourseId) {
            setAiPromptCourseId(courses[0].id);
        }
    }, [activeTab, courses, aiPromptCourseId, setAiPromptCourseId]);

    useEffect(() => {
        if (activeTab === 'ai-prompts' && aiPromptCourseId) {
            loadPromptsForCourse(aiPromptCourseId);
        }
    }, [activeTab, aiPromptCourseId, loadPromptsForCourse]);

    useEffect(() => {
        if (activeTab === 'companies') {
            loadCompanies();
        }
    }, [companySearch, activeTab, loadCompanies]);

    // Anti-flickering wrapper for tab content
    const renderTab = () => {
        const isLoading = adminStatsLoading || aiPromptsLoading || transcodeLoading;
        const isDataLoaded = true; // Admin data is generally loaded on mount

        // For tab switching, show content with overlay if loading
        if (isLoading && isDataLoaded) {
            return (
                <div className="relative">
                    {renderTabContent()}
                    <div className="absolute inset-0 bg-white/50 dark:bg-gray-900/50 flex items-center justify-center rounded-2xl backdrop-blur-sm">
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-lg border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-3">
                                <div className="animate-spin rounded-full border-2 border-gray-300 border-t-edubot-orange w-5 h-5"></div>
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                    Жүктөлүүдө...
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        return renderTabContent();
    };

    // Render content based on active tab
    const renderTabContent = () => {
        switch (activeTab) {
            case 'stats':
                return (
                    <AdminStatsTab
                        stats={adminStats}
                        loading={adminStatsLoading}
                        onRefresh={loadAdminStats}
                    />
                );

            case 'users':
                return (
                    <AdminUsersTab
                        users={users}
                        usersPage={usersPage}
                        usersTotalPages={usersTotalPages}
                        usersTotal={usersTotal}
                        search={search}
                        roleFilter={roleFilter}
                        dateFrom={dateFrom}
                        dateTo={dateTo}
                        setSearch={setSearch}
                        setRoleFilter={setRoleFilter}
                        setDateFrom={setDateFrom}
                        setDateTo={setDateTo}
                        handleRoleChange={handleRoleChange}
                        handleDeleteUser={handleDeleteUser}
                        handleUsersPageChange={handleUsersPageChange}
                        renderUserPageButtons={renderUserPageButtons}
                        currentUser={user}
                    />
                );

            case 'courses':
                return (
                    <AdminCoursesTab
                        courses={courses}
                        categories={categories}
                        users={users}
                        newCategory={newCategory}
                        editingCategoryId={editingCategoryId}
                        editingCategoryName={editingCategoryName}
                        courseGroupsByCourseId={courseGroupsByCourseId}
                        selectedEnrollmentGroupIds={selectedEnrollmentGroupIds}
                        transcodeCourseId={transcodeCourseId}
                        transcodeSectionId={transcodeSectionId}
                        transcodeLessonId={transcodeLessonId}
                        transcodeLessonIds={transcodeLessonIds}
                        transcodeLoading={transcodeLoading}
                        setNewCategory={setNewCategory}
                        setEditingCategoryId={setEditingCategoryId}
                        setEditingCategoryName={setEditingCategoryName}
                        setSelectedEnrollmentGroupIds={setSelectedEnrollmentGroupIds}
                        setTranscodeCourseId={setTranscodeCourseId}
                        setTranscodeSectionId={setTranscodeSectionId}
                        setTranscodeLessonId={setTranscodeLessonId}
                        setTranscodeLessonIds={setTranscodeLessonIds}
                        handleDeleteCourse={handleDeleteCourse}
                        handleEnrollUser={handleEnrollUser}
                        handleAddCategory={handleAddCategory}
                        handleUpdateCategory={handleUpdateCategory}
                        handleDeleteCategory={handleDeleteCategory}
                        handleTranscode={handleTranscode}
                        handleBulkTranscode={handleBulkTranscode}
                    />
                );

            case 'companies':
                return (
                    <AdminCompaniesTab
                        companies={companies}
                        companySearch={companySearch}
                        setCompanySearch={setCompanySearch}
                        newCompanyForm={newCompanyForm}
                        setNewCompanyForm={setNewCompanyForm}
                        courses={courses}
                        onCreateCompany={handleCreateCompany}
                        onUpdateCompany={handleUpdateCompany}
                        onDeleteCompany={handleDeleteCompany}
                        onUploadCompanyLogo={handleUploadCompanyLogo}
                        onAssignCourseToCompany={handleAssignCourseToCompany}
                        onClearCourseCompany={handleClearCourseCompany}
                        onUnassignCourseFromCompany={handleUnassignCourseFromCompany}
                    />
                );

            case 'certificates':
                return (
                    <CertificatesSection
                        mode="admin"
                        total={courses.reduce(
                            (sum, course) => sum + Number(course.studentCount || 0),
                            0
                        )}
                        courses={courses}
                        loadingCourses={false}
                        selectedCourseId={selectedCertificateCourseId}
                        onSelectCourse={handleSelectCertificateCourse}
                        courseStudents={certificateStudents}
                        courseMeta={certificateCourseMeta}
                        loadingStudents={loadingCertificateStudents}
                        error={certificateError}
                        refreshCourses={loadCoursesAndCategories}
                        studentsPage={certificateStudentsPage}
                        onChangePage={setCertificateStudentsPage}
                        search={certificateSearch}
                        onSearchChange={setCertificateSearch}
                        progressMin={certificateProgressMin}
                        onProgressMinChange={setCertificateProgressMin}
                        progressMax={certificateProgressMax}
                        onProgressMaxChange={setCertificateProgressMax}
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
                        currentUser={user}
                    />
                );

            case 'skills':
                return (
                    <AdminSkillsTab
                        skills={skills}
                        newSkillName={newSkillName}
                        setNewSkillName={setNewSkillName}
                        onCreateSkill={handleCreateSkill}
                        onUpdateSkill={handleUpdateSkill}
                        onDeleteSkill={handleDeleteSkill}
                    />
                );

            case 'ai-prompts':
                return (
                    <AdminAiPromptsTab
                        courses={courses}
                        aiPromptCourseId={aiPromptCourseId}
                        setAiPromptCourseId={setAiPromptCourseId}
                        newPromptText={newPromptText}
                        setNewPromptText={setNewPromptText}
                        newPromptLanguage={newPromptLanguage}
                        setNewPromptLanguage={setNewPromptLanguage}
                        newPromptOrder={newPromptOrder}
                        setNewPromptOrder={setNewPromptOrder}
                        newPromptIsActive={newPromptIsActive}
                        setNewPromptIsActive={setNewPromptIsActive}
                        aiPrompts={aiPrompts}
                        aiPromptsLoading={aiPromptsLoading}
                        onCreatePrompt={handleCreatePrompt}
                        onUpdatePrompt={handleUpdatePrompt}
                        onDeletePrompt={handleDeletePrompt}
                    />
                );

            case 'notifications':
                return (
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        <div className="rounded-3xl border border-edubot-line/80 bg-white/90 p-5 shadow-edubot-card dark:border-slate-700 dark:bg-slate-950">
                            <NotificationsWidget />
                        </div>
                        <div className="rounded-3xl border border-edubot-line/80 bg-white/90 p-5 shadow-edubot-card dark:border-slate-700 dark:bg-slate-950">
                            <NotificationsTab />
                        </div>
                    </div>
                );

            case 'contacts':
                return (
                    <AdminContactsTab
                        contacts={contacts}
                        onMarkRead={markNotificationRead}
                        onDelete={deleteNotification}
                    />
                );

            case 'pending':
                return (
                    <AdminPendingCoursesTab
                        pendingCourses={pendingCourses}
                        onApprove={handleApprovePendingCourse}
                        onReject={handleRejectPendingCourse}
                    />
                );

            case 'integration':
                return <IntegrationTab />;

            case 'attendance':
                return <AttendancePage embedded />;

            case 'analytics':
                return <AdminAnalyticsPage />;

            default:
                // For other tabs, render the original inline components
                // This maintains existing behavior while allowing gradual migration
                return null;
        }
    };

    // Prepare navigation items for the standardized layout
    const dashboardNavItems = NAV_ITEMS.map((item) => ({
        ...item,
        isActive: item.id === activeTab,
        onSelect: handleTabSelect,
    }));

    // Prepare header actions
    const headerActions = [
        {
            label: sidebarOpen ? 'Менюну жашыруу' : 'Менюну көрсөтүү',
            onClick: () => setSidebarOpen((prev) => !prev),
            variant: 'secondary',
        },
    ];

    // Prepare header content
    const adminUser = {
        fullName: user?.fullName || 'Админ',
        email: user?.email || 'admin@edubot.kg',
    };

    const headerContent = (
        <DashboardHeader
            user={adminUser}
            role="admin"
            subtitle="Платформаны башкаруу жана көзөмөлдөө"
            actions={headerActions}
        />
    );

    // Mobile tabs
    const mobileTabs = (
        <DashboardTabs items={dashboardNavItems} activeId={activeTab} onSelect={handleTabSelect} />
    );

    return (
        <DashboardLayout
            role="admin"
            user={adminUser}
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            navItems={dashboardNavItems}
            mobileTabs={mobileTabs}
            headerContent={headerContent}
        >
            {renderTab()}

            {/* Floating Action Button */}
            <FloatingActionButton role="admin" />
            <ConfirmationModal
                isOpen={!!confirmation}
                onClose={closeConfirmation}
                onConfirm={confirmAndRun}
                title={confirmation?.title || 'Аракетти ырастоо'}
                message={confirmation?.message || ''}
                confirmLabel={confirmation?.confirmLabel || 'Ырастоо'}
                confirmVariant={confirmation?.confirmVariant || 'danger'}
            />
        </DashboardLayout>
    );
};

export default AdminPanel;
