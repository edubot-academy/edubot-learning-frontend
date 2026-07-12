
import { useCallback, useEffect, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    DashboardCardSkeleton,
    DashboardFilterBar,
    DashboardInsetPanel,
    DashboardMetricCard,
    DashboardSectionHeader,
    EmptyState,
} from '@components/ui/dashboard';
import EnrollGroupStudentModal from './modals/EnrollGroupStudentModal.jsx';
import GenerateGroupSessionsModal from './modals/GenerateGroupSessionsModal.jsx';
import GroupFormModal from './modals/GroupFormModal.jsx';
import InstructorDashboardGroupCard from './InstructorDashboardGroupCard.jsx';
import { useInstructorGroupCourseSelection } from '@features/instructor-dashboard/hooks/useInstructorGroupCourseSelection';
import { useInstructorGroupData } from '@features/instructor-dashboard/hooks/useInstructorGroupData';
import { useInstructorGroupModals } from '@features/instructor-dashboard/hooks/useInstructorGroupModals';
import { useInstructorGroupMutations } from '@features/instructor-dashboard/hooks/useInstructorGroupMutations';
import { useInstructorGroupSessionGeneration } from '@features/instructor-dashboard/hooks/useInstructorGroupSessionGeneration';
import { getDashboardPath } from '@shared/utils/navigation';
import { FiBookOpen, FiCalendar, FiClock, FiLayers, FiPlus, FiUsers } from 'react-icons/fi';
import {
    canEnrollInGroupForCourse,
    getGroupMetrics,
} from '@features/instructor-dashboard/utils/groupCourses';

const GroupsSection = ({ courses = [] }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const sessionsPath = getDashboardPath('instructor', 'sessions');
    const requestedCourseId = searchParams.get('courseId');
    const {
        deliveryCourses,
        pendingDeliveryCourses,
        selectedCourse,
        selectedCourseId,
        setSelectedCourseId,
    } = useInstructorGroupCourseSelection({ courses, requestedCourseId });
    const {
        deliveryContext,
        groups,
        individualStudentsByGroupId,
        loadingGroups,
        loadGroups,
    } = useInstructorGroupData({ t });
    const {
        generatingSessions,
        generationForm,
        generationGroup,
        generationPreview,
        handleCloseGenerateModal,
        handleGenerateSessions,
        handleGenerationFormChange,
        handleOpenGenerateModal,
        handlePreviewGeneration,
        previewLoading,
        showGenerateModal,
    } = useInstructorGroupSessionGeneration({ t });

    const selectedCourseNeedsSession = Boolean(deliveryContext?.readiness?.issues?.includes?.('session_schedule_required'));
    const selectedCourseNeedsLiveMeeting = Boolean(deliveryContext?.readiness?.issues?.includes?.('live_meeting_required'));
    const canEnrollInGroup = useCallback((group) => {
        return canEnrollInGroupForCourse({
            course: selectedCourse,
            group,
            needsLiveMeeting: selectedCourseNeedsLiveMeeting,
            needsSession: selectedCourseNeedsSession,
        });
    }, [selectedCourse, selectedCourseNeedsLiveMeeting, selectedCourseNeedsSession]);
    const {
        createForm,
        editForm,
        editingGroupId,
        enrollForm,
        enrollGroup,
        enrollUserSearch,
        groupStudents,
        handleCloseCreateModal,
        handleCloseEditModal,
        handleCloseEnrollModal,
        handleCreateFormChange,
        handleCreateSuccess,
        handleEditFormChange,
        handleEnrollFormChange,
        handleEnrollSuccess,
        handleOpenCreateModal,
        handleOpenEditModal,
        handleOpenEnrollModal,
        handleRegenerateCreateCode,
        handleRegenerateEditCode,
        handleUpdateSuccess,
        loadGroupStudents,
        loadingGroupStudents,
        loadingUserOptions,
        setEnrollUserSearch,
        setShowDropdown,
        showCreateModal,
        showDropdown,
        showEditModal,
        showEnrollModal,
        studentOptions,
    } = useInstructorGroupModals({
        canEnrollInGroup,
        groups,
        selectedCourse,
        selectedCourseId,
        t,
    });

    useEffect(() => {
        loadGroups(selectedCourseId);
    }, [selectedCourseId, loadGroups]);

    const metrics = useMemo(() => getGroupMetrics(groups), [groups]);

    const {
        enrolling,
        handleCreateGroup,
        handleEnrollStudent,
        handleUpdateGroup,
        savingGroup,
        savingGroupUpdate,
    } = useInstructorGroupMutations({
        createForm,
        editForm,
        editingGroupId,
        enrollForm,
        enrollGroup,
        loadGroups,
        loadGroupStudents,
        onCreateSuccess: handleCreateSuccess,
        onEnrollSuccess: handleEnrollSuccess,
        onUpdateSuccess: handleUpdateSuccess,
        selectedCourse,
        selectedCourseId,
        t,
    });

    const handleCreateCourse = useCallback(() => {
        navigate('/instructor/course/create');
    }, [navigate]);

    if (!deliveryCourses.length) {
        return (
            <div className="space-y-6">
                <DashboardSectionHeader
                    eyebrow={t('instructorDashboard.groupsSection.header.eyebrow')}
                    title={t('instructorDashboard.groupsSection.header.title')}
                    description={t('instructorDashboard.groupsSection.header.description')}
                />
                <DashboardInsetPanel
                    title={t('instructorDashboard.groupsSection.noDelivery.title')}
                    description={t('instructorDashboard.groupsSection.noDelivery.description')}
                >
                    <EmptyState
                        title={t('instructorDashboard.groupsSection.noDelivery.emptyTitle')}
                        subtitle={t('instructorDashboard.groupsSection.noDelivery.emptySubtitle')}
                        action={{
                            label: t('instructorDashboard.groupsSection.actions.createCourse'),
                            onClick: handleCreateCourse,
                        }}
                    />
                    {pendingDeliveryCourses.length ? (
                        <p className="mt-4 text-sm text-edubot-muted dark:text-slate-400">
                            {t('instructorDashboard.groupsSection.noDelivery.pendingCount', {
                                count: pendingDeliveryCourses.length,
                            })}
                        </p>
                    ) : null}
                </DashboardInsetPanel>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <DashboardSectionHeader
                eyebrow={t('instructorDashboard.groupsSection.header.eyebrow')}
                title={t('instructorDashboard.groupsSection.header.title')}
                description={t('instructorDashboard.groupsSection.header.activeDescription')}
                action={(
                    <div className="flex flex-wrap items-center gap-2">
                        <Link to={sessionsPath} className="dashboard-button-secondary">
                            <FiCalendar className="h-4 w-4" />
                            {t('instructorDashboard.groupsSection.actions.openSessions')}
                        </Link>
                        <button
                            type="button"
                            onClick={handleOpenCreateModal}
                            className="dashboard-button-primary"
                        >
                            <FiPlus className="h-4 w-4" />
                            {t('instructorDashboard.groupsSection.actions.createGroup')}
                        </button>
                    </div>
                )}
            />

            <div className="grid gap-4 md:grid-cols-4">
                <DashboardMetricCard
                    label={t('instructorDashboard.groupsSection.metrics.groups')}
                    value={metrics.total}
                    icon={FiLayers}
                />
                <DashboardMetricCard
                    label={t('instructorDashboard.groupsSection.metrics.active')}
                    value={metrics.active}
                    icon={FiUsers}
                    tone="green"
                />
                <DashboardMetricCard
                    label={t('instructorDashboard.groupsSection.metrics.planned')}
                    value={metrics.planned}
                    icon={FiClock}
                    tone="amber"
                />
                <DashboardMetricCard
                    label={t('instructorDashboard.groupsSection.metrics.seats')}
                    value={metrics.seats}
                    icon={FiBookOpen}
                    tone="blue"
                />
            </div>

            <DashboardInsetPanel
                title={t('instructorDashboard.groupsSection.courseGroups.title')}
                description={t('instructorDashboard.groupsSection.courseGroups.description')}
            >
                <DashboardFilterBar gridClassName="lg:grid-cols-[minmax(0,1fr),auto]">
                    <label className="text-sm text-edubot-ink dark:text-white">
                        <span className="mb-1.5 inline-flex items-center gap-2 font-medium">
                            <FiBookOpen className="h-4 w-4 text-edubot-orange" />
                            {t('instructorDashboard.groupsSection.courseGroups.courseLabel')}
                        </span>
                        <select
                            value={selectedCourseId}
                            onChange={(event) => setSelectedCourseId(event.target.value)}
                            className="dashboard-field dashboard-select"
                        >
                            <option value="">{t('instructorDashboard.groupsSection.courseGroups.selectCourse')}</option>
                            {deliveryCourses.map((course) => (
                                <option key={course.id} value={course.id}>
                                    {course.title}
                                </option>
                            ))}
                        </select>
                        {pendingDeliveryCourses.length ? (
                            <p className="mt-2 text-xs text-edubot-muted dark:text-slate-400">
                                {t('instructorDashboard.groupsSection.courseGroups.pendingHidden', {
                                    count: pendingDeliveryCourses.length,
                                })}
                            </p>
                        ) : null}
                    </label>

                    <div className="flex items-end">
                        <div className="dashboard-panel-muted rounded-2xl px-4 py-3 text-sm text-edubot-muted dark:text-slate-300">
                            {t('instructorDashboard.groupsSection.courseGroups.anchorLabel')}
                            <span className="ml-2 font-semibold text-edubot-ink dark:text-white">
                                {t('instructorDashboard.groupsSection.courseGroups.anchorValue')}
                            </span>
                        </div>
                    </div>
                </DashboardFilterBar>

                <div className="mt-4">
                    {loadingGroups ? (
                        <DashboardCardSkeleton cards={4} />
                    ) : groups.length ? (
                        <div className="grid gap-4 md:grid-cols-2">
                            {groups.map((group) => {
                                const hasLoadedIndividualStudent = Object.prototype.hasOwnProperty.call(
                                    individualStudentsByGroupId,
                                    group.id
                                );

                                return (
                                    <InstructorDashboardGroupCard
                                        key={group.id}
                                        canEnroll={canEnrollInGroup(group)}
                                        group={group}
                                        hasLoadedIndividualStudent={hasLoadedIndividualStudent}
                                        individualStudent={individualStudentsByGroupId[group.id]}
                                        onOpenEditModal={handleOpenEditModal}
                                        onOpenEnrollModal={handleOpenEnrollModal}
                                        onOpenGenerateModal={handleOpenGenerateModal}
                                        sessionsPath={sessionsPath}
                                    />
                                );
                            })}
                        </div>
                    ) : (
                        <EmptyState
                            title={selectedCourse
                                ? t('instructorDashboard.groupsSection.empty.noGroupsTitle')
                                : t('instructorDashboard.groupsSection.empty.selectCourseTitle')}
                            subtitle={
                                selectedCourse
                                    ? t('instructorDashboard.groupsSection.empty.noGroupsSubtitle')
                                    : t('instructorDashboard.groupsSection.empty.selectCourseSubtitle')
                            }
                            action={
                                selectedCourse
                                    ? {
                                          label: t('instructorDashboard.groupsSection.actions.createGroup'),
                                          onClick: handleOpenCreateModal,
                                      }
                                    : undefined
                            }
                        />
                    )}
                </div>
            </DashboardInsetPanel>

            <DashboardInsetPanel
                title={t('instructorDashboard.groupsSection.sessionProcess.title')}
                description={t('instructorDashboard.groupsSection.sessionProcess.description')}
            >
                <div className="dashboard-panel-muted flex flex-wrap items-center justify-between gap-3 rounded-2xl px-4 py-4">
                    <p className="text-sm text-edubot-muted dark:text-slate-300">
                        {t('instructorDashboard.groupsSection.sessionProcess.body')}
                    </p>
                    <Link to={sessionsPath} className="dashboard-button-secondary">
                        <FiCalendar className="h-4 w-4" />
                        {t('instructorDashboard.groupsSection.actions.openSessions')}
                    </Link>
                </div>
            </DashboardInsetPanel>

            {showEnrollModal && enrollGroup ? (
                <EnrollGroupStudentModal
                    group={enrollGroup}
                    course={selectedCourse}
                    form={enrollForm}
                    onChange={handleEnrollFormChange}
                    onClose={handleCloseEnrollModal}
                    onSubmit={handleEnrollStudent}
                    enrolling={enrolling}
                    students={groupStudents}
                    loadingStudents={loadingGroupStudents}
                    studentOptions={studentOptions}
                    userSearch={enrollUserSearch}
                    onSearchChange={setEnrollUserSearch}
                    loadingUserOptions={loadingUserOptions}
                    showDropdown={showDropdown}
                    setShowDropdown={setShowDropdown}
                />
            ) : null}

            {showCreateModal ? (
                <GroupFormModal
                    mode="create"
                    course={selectedCourse}
                    form={createForm}
                    onChange={handleCreateFormChange}
                    onClose={handleCloseCreateModal}
                    onSubmit={handleCreateGroup}
                    saving={savingGroup}
                    onRegenerateCode={handleRegenerateCreateCode}
                    studentOptions={studentOptions}
                    userSearch={enrollUserSearch}
                    onSearchChange={setEnrollUserSearch}
                    loadingUserOptions={loadingUserOptions}
                    showDropdown={showDropdown}
                    setShowDropdown={setShowDropdown}
                />
            ) : null}

            {showEditModal && editingGroupId ? (
                <GroupFormModal
                    mode="edit"
                    course={selectedCourse}
                    form={editForm}
                    onChange={handleEditFormChange}
                    onClose={handleCloseEditModal}
                    onSubmit={handleUpdateGroup}
                    saving={savingGroupUpdate}
                    onRegenerateCode={handleRegenerateEditCode}
                />
            ) : null}

            {showGenerateModal && generationGroup ? (
                <GenerateGroupSessionsModal
                    group={generationGroup}
                    form={generationForm}
                    onChange={handleGenerationFormChange}
                    onClose={handleCloseGenerateModal}
                    onPreview={handlePreviewGeneration}
                    onGenerate={handleGenerateSessions}
                    preview={generationPreview}
                    previewLoading={previewLoading}
                    generating={generatingSessions}
                />
            ) : null}
        </div>
    );
};

export default GroupsSection;
