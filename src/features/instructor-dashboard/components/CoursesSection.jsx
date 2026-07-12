import PropTypes from 'prop-types';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    DashboardCardSkeleton,
    DashboardInsetPanel,
    DashboardMetricCard,
    DashboardSectionHeader,
    EmptyState,
} from '@components/ui/dashboard';
import { FiBookOpen, FiClock, FiLayers, FiPlus, FiUsers } from 'react-icons/fi';
import DeliveryCourseModalController from './DeliveryCourseModalController.jsx';
import InstructorDashboardCourseCard from './InstructorDashboardCourseCard.jsx';
import {
    getCourseStudentsCount,
    getPendingReviewCourseCount,
    getPublishedCourseCount,
} from '@features/instructor-dashboard/utils/instructorCourses';

const CoursesSection = ({
    courses,
    loading,
    submittingCourseId,
    onOpenDeliveryModal,
    onOpenDeliveryEditModal,
    onSubmitCourseForApproval,
}) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const publishedCount = getPublishedCourseCount(courses);
    const pendingCount = getPendingReviewCourseCount(courses);
    const totalStudents = getCourseStudentsCount(courses);

    return (
        <div className="space-y-6">
            <DashboardSectionHeader
                eyebrow={t('instructorDashboard.coursesSection.hero.eyebrow')}
                title={t('instructorDashboard.coursesSection.hero.title')}
                description={t('instructorDashboard.coursesSection.hero.description')}
                action={(
                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            type="button"
                            onClick={onOpenDeliveryModal}
                            className="dashboard-button-secondary"
                        >
                            <FiLayers className="h-4 w-4" />
                            {t('instructorDashboard.coursesSection.actions.createDeliveryCourse')}
                        </button>

                        <Link
                            to="/instructor/course/create"
                            className="dashboard-button-primary"
                        >
                            <FiPlus className="h-4 w-4" />
                            {t('instructorDashboard.coursesSection.actions.newCourse')}
                        </Link>
                    </div>
                )}
            />

            <div className="grid gap-4 md:grid-cols-4">
                <DashboardMetricCard
                    label={t('instructorDashboard.coursesSection.metrics.totalCourses')}
                    value={courses.length}
                    icon={FiBookOpen}
                />
                <DashboardMetricCard
                    label={t('instructorDashboard.coursesSection.metrics.published')}
                    value={publishedCount}
                    icon={FiUsers}
                    tone="green"
                />
                <DashboardMetricCard
                    label={t('instructorDashboard.coursesSection.metrics.pending')}
                    value={pendingCount}
                    icon={FiClock}
                    tone="amber"
                />
                <DashboardMetricCard
                    label={t('instructorDashboard.coursesSection.metrics.students')}
                    value={totalStudents}
                    icon={FiUsers}
                    tone="blue"
                />
            </div>

            <DashboardInsetPanel
                title={t('instructorDashboard.coursesSection.list.title')}
                description={t('instructorDashboard.coursesSection.list.description')}
            >
                <div className="mt-4">
                    {loading && !courses.length ? (
                        <DashboardCardSkeleton cards={4} />
                    ) : courses.length ? (
                        <div className="grid gap-6 md:grid-cols-2">
                            {courses.map((course) => (
                                <InstructorDashboardCourseCard
                                    key={course.id || course.title}
                                    course={course}
                                    onOpenDeliveryEditModal={onOpenDeliveryEditModal}
                                    onSubmitCourseForApproval={onSubmitCourseForApproval}
                                    submitting={submittingCourseId === course.id}
                                />
                            ))}
                        </div>
                    ) : (
                        <EmptyState
                            title={t('instructorDashboard.coursesSection.empty.title')}
                            subtitle={t('instructorDashboard.coursesSection.empty.subtitle')}
                            icon={<FiBookOpen className="h-8 w-8 text-edubot-orange" />}
                            action={{
                                label: t('instructorDashboard.coursesSection.actions.createCourse'),
                                onClick: () => navigate('/instructor/course/create'),
                            }}
                        />
                    )}
                </div>
            </DashboardInsetPanel>
        </div>
    );
};

CoursesSection.propTypes = {
    courses: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        title: PropTypes.string,
    })).isRequired,
    loading: PropTypes.bool,
    submittingCourseId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    onOpenDeliveryModal: PropTypes.func,
    onOpenDeliveryEditModal: PropTypes.func,
    onSubmitCourseForApproval: PropTypes.func,
};

CoursesSection.defaultProps = {
    loading: false,
    submittingCourseId: null,
    onOpenDeliveryModal: null,
    onOpenDeliveryEditModal: null,
    onSubmitCourseForApproval: null,
};

const CoursesSectionWithModal = ({
    deliveryCourseModals,
    ...sectionProps
}) => (
    <>
        <CoursesSection {...sectionProps} />
        {deliveryCourseModals ? (
            <DeliveryCourseModalController {...deliveryCourseModals} />
        ) : null}
    </>
);

CoursesSectionWithModal.propTypes = {
    ...CoursesSection.propTypes,
    deliveryCourseModals: PropTypes.shape({
        showDeliveryModal: PropTypes.bool,
        onCloseDeliveryModal: PropTypes.func,
        onCreateDeliveryCourse: PropTypes.func,
        creatingDeliveryCourse: PropTypes.bool,
        showEditDeliveryModal: PropTypes.bool,
        onCloseEditDeliveryModal: PropTypes.func,
        onUpdateDeliveryCourse: PropTypes.func,
        updatingDeliveryCourse: PropTypes.bool,
        editingDeliveryCourse: PropTypes.shape({
            id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        }),
        deliveryCategories: PropTypes.arrayOf(PropTypes.shape({
            id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
            name: PropTypes.string,
        })),
    }),
};

CoursesSectionWithModal.defaultProps = {
    ...CoursesSection.defaultProps,
    deliveryCourseModals: null,
};

export default CoursesSectionWithModal;
