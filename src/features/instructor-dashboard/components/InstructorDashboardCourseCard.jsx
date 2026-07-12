import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FiEdit3, FiEye, FiSend } from 'react-icons/fi';
import { getCourseTypeLabel } from '@shared/i18n/enumLabels';
import {
    getInstructorCourseEditTarget,
    getInstructorCourseViewTarget,
    isDeliveryCourse,
    isDraftCourse,
} from '@features/instructor-dashboard/utils/instructorCourses';
import {
    COURSE_LIFECYCLE_STATES,
    getCourseLifecycleMeta,
} from '@features/instructor-dashboard/utils/courseLifecycle';

const COURSE_SECTION_BADGE_CLASSES = {
    [COURSE_LIFECYCLE_STATES.PUBLISHED]: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
    [COURSE_LIFECYCLE_STATES.PENDING]: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
    [COURSE_LIFECYCLE_STATES.REJECTED]: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300',
    [COURSE_LIFECYCLE_STATES.DRAFT]: 'bg-slate-100 text-slate-700 dark:bg-slate-500/15 dark:text-slate-300',
};

const InstructorDashboardCourseCard = ({
    course,
    onOpenDeliveryEditModal,
    onSubmitCourseForApproval,
    submitting,
}) => {
    const { t, i18n } = useTranslation();
    const statusMeta = getCourseLifecycleMeta(
        course,
        {
            published: t('instructorDashboard.coursesSection.status.approved'),
            pending: t('instructorDashboard.coursesSection.status.pending'),
            rejected: t('instructorDashboard.coursesSection.status.rejected'),
            draft: t('instructorDashboard.coursesSection.status.draft'),
        },
        COURSE_SECTION_BADGE_CLASSES
    );
    const draftCourse = isDraftCourse(course);
    const deliveryCourse = isDeliveryCourse(course);
    const viewTarget = getInstructorCourseViewTarget(course);
    const editTarget = getInstructorCourseEditTarget(course);

    return (
        <div className="group rounded-3xl border border-edubot-line/80 bg-white/90 p-5 shadow-edubot-card transition-all duration-300 hover:-translate-y-1 hover:border-edubot-orange/40 hover:shadow-edubot-hover dark:border-slate-700 dark:bg-slate-950">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <h3 className="text-lg font-semibold text-edubot-ink transition-colors duration-300 group-hover:text-edubot-orange dark:text-white">
                        {course.title}
                    </h3>
                    {course.category?.name ? (
                        <p className="mt-1 text-sm text-edubot-muted dark:text-slate-400">
                            {course.category.name}
                        </p>
                    ) : null}
                </div>

                <span
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${statusMeta.badgeClass}`}
                >
                    {statusMeta.label}
                </span>
            </div>

            <p className="mt-4 line-clamp-2 text-sm text-edubot-muted dark:text-slate-400">
                {course.description ||
                    t('instructorDashboard.coursesSection.card.noDescription')}
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-edubot-orange/10 px-2.5 py-1 text-xs font-medium text-edubot-orange dark:bg-edubot-orange/20">
                    {course.category?.name ||
                        course.category ||
                        t('instructorDashboard.coursesSection.card.uncategorized')}
                </span>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                    {getCourseTypeLabel(course.courseType, t)}
                </span>
                <span className="text-xs text-edubot-muted dark:text-slate-400">
                    {course.price
                        ? t('instructorDashboard.coursesSection.card.price', {
                            price: course.price,
                        })
                        : t('instructorDashboard.coursesSection.card.free')}
                </span>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-edubot-line/70 bg-edubot-surfaceAlt/60 px-4 py-3 dark:border-slate-700 dark:bg-slate-900/70">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-edubot-muted dark:text-slate-400">
                        {t('instructorDashboard.coursesSection.card.students')}
                    </p>
                    <p className="mt-2 text-lg font-semibold text-edubot-ink dark:text-white">
                        {course.studentsCount ? `${course.studentsCount}` : '—'}
                    </p>
                </div>
                <div className="rounded-2xl border border-edubot-line/70 bg-edubot-surfaceAlt/60 px-4 py-3 dark:border-slate-700 dark:bg-slate-900/70">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-edubot-muted dark:text-slate-400">
                        {t('instructorDashboard.coursesSection.card.updated')}
                    </p>
                    <p className="mt-2 text-sm font-semibold text-edubot-ink dark:text-white">
                        {course.updatedAt
                            ? new Date(course.updatedAt).toLocaleDateString(i18n.language)
                            : t('instructorDashboard.coursesSection.card.noData')}
                    </p>
                </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
                <Link
                    to={viewTarget}
                    className="dashboard-button-secondary"
                >
                    <FiEye className="h-4 w-4" />
                    {deliveryCourse
                        ? t('instructorDashboard.coursesSection.actions.manage')
                        : t('instructorDashboard.coursesSection.actions.view')}
                </Link>
                {deliveryCourse ? (
                    <button
                        type="button"
                        onClick={() => onOpenDeliveryEditModal?.(course)}
                        className="dashboard-button-primary"
                    >
                        <FiEdit3 className="h-4 w-4" />
                        {t('instructorDashboard.coursesSection.actions.edit')}
                    </button>
                ) : (
                    <Link
                        to={editTarget}
                        className="dashboard-button-primary"
                    >
                        <FiEdit3 className="h-4 w-4" />
                        {t('instructorDashboard.coursesSection.actions.edit')}
                    </Link>
                )}
                {draftCourse ? (
                    <button
                        type="button"
                        onClick={() => onSubmitCourseForApproval?.(course.id)}
                        disabled={submitting}
                        className="dashboard-button-secondary"
                    >
                        <FiSend className="h-4 w-4" />
                        {submitting
                            ? t('instructorDashboard.coursesSection.actions.submitting')
                            : t('instructorDashboard.coursesSection.actions.submitForApproval')}
                    </button>
                ) : null}
            </div>
        </div>
    );
};

InstructorDashboardCourseCard.propTypes = {
    course: PropTypes.shape({
        category: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.shape({
                name: PropTypes.string,
            }),
        ]),
        courseType: PropTypes.string,
        description: PropTypes.string,
        id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
        price: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        studentsCount: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        title: PropTypes.string,
        updatedAt: PropTypes.string,
    }).isRequired,
    onOpenDeliveryEditModal: PropTypes.func,
    onSubmitCourseForApproval: PropTypes.func,
    submitting: PropTypes.bool,
};

InstructorDashboardCourseCard.defaultProps = {
    onOpenDeliveryEditModal: null,
    onSubmitCourseForApproval: null,
    submitting: false,
};

export default InstructorDashboardCourseCard;
