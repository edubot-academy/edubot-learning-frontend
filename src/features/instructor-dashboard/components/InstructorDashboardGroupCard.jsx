import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FiCalendar, FiEdit3, FiMapPin } from 'react-icons/fi';
import { getDeliveryModeLabel } from '@shared/i18n/enumLabels';
import {
    formatGroupDate,
    formatScheduleBlocks,
    getDeliveryModeBadgeClass,
    getGroupStatusBadgeClass,
    getStudentDisplayName,
    isIndividualGroup,
} from '@features/instructor-dashboard/utils/groupCourses';

const InstructorDashboardGroupCard = ({
    canEnroll,
    group,
    hasLoadedIndividualStudent,
    individualStudent,
    onOpenEditModal,
    onOpenEnrollModal,
    onOpenGenerateModal,
    sessionsPath,
}) => {
    const { t } = useTranslation();
    const formattedScheduleBlocks = formatScheduleBlocks(group.scheduleBlocks, t);
    const scheduleSummary = group.scheduleNote || '';
    const hasDefaultSchedule = Boolean(scheduleSummary || formattedScheduleBlocks.length);
    const individual = isIndividualGroup(group);
    const individualStudentName = getStudentDisplayName(individualStudent);
    const individualGroupOccupied = individual && Number(group.activeStudentCount || 0) >= 1;

    return (
        <div className="rounded-3xl border border-edubot-line/80 bg-white/90 p-5 shadow-edubot-card dark:border-slate-700 dark:bg-slate-950">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <h3 className="text-lg font-semibold text-edubot-ink dark:text-white">
                        {group.name || t('instructorDashboard.groupsSection.fallbacks.groupWithId', { id: group.id })}
                    </h3>
                    <p className="mt-1 text-sm text-edubot-muted dark:text-slate-400">
                        {t('instructorDashboard.groupsSection.card.code', {
                            code: group.code || '—',
                        })}
                    </p>
                    {individual ? (
                        <p className="mt-1 text-sm font-medium text-violet-700 dark:text-violet-200">
                            {individualStudentName
                                ? t('instructorDashboard.groupsSection.card.individualStudent', {
                                    student: individualStudentName,
                                })
                                : hasLoadedIndividualStudent
                                  ? t('instructorDashboard.groupsSection.card.individualStudentNotFound')
                                  : t('instructorDashboard.groupsSection.card.individualStudentLoading')}
                        </p>
                    ) : null}
                </div>
                <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${getGroupStatusBadgeClass(group.status)}`}
                >
                    {group.status || 'planned'}
                </span>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getDeliveryModeBadgeClass(group.deliveryMode)}`}>
                    {getDeliveryModeLabel(group.deliveryMode, t)}
                </span>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-edubot-line/70 bg-edubot-surfaceAlt/60 px-4 py-3 dark:border-slate-700 dark:bg-slate-900/70">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-edubot-muted dark:text-slate-400">
                        {t('instructorDashboard.groupsSection.card.format')}
                    </p>
                    <p className="mt-2 text-sm font-semibold text-edubot-ink dark:text-white">
                        {getDeliveryModeLabel(group.deliveryMode, t)}
                    </p>
                </div>
                <div className="rounded-2xl border border-edubot-line/70 bg-edubot-surfaceAlt/60 px-4 py-3 dark:border-slate-700 dark:bg-slate-900/70">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-edubot-muted dark:text-slate-400">
                        {t('instructorDashboard.groupsSection.card.period')}
                    </p>
                    <p className="mt-2 text-sm font-semibold text-edubot-ink dark:text-white">
                        {formatGroupDate(group.startDate)} - {formatGroupDate(group.endDate)}
                    </p>
                </div>
                <div className="rounded-2xl border border-edubot-line/70 bg-edubot-surfaceAlt/60 px-4 py-3 dark:border-slate-700 dark:bg-slate-900/70">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-edubot-muted dark:text-slate-400">
                        {t('instructorDashboard.groupsSection.card.seats')}
                    </p>
                    <p className="mt-2 text-sm font-semibold text-edubot-ink dark:text-white">
                        {individual
                            ? `${group.activeStudentCount || 0}/1`
                            : group.seatLimit
                              ? `${group.seatLimit}`
                              : t('instructorDashboard.groupsSection.card.unlimited')}
                    </p>
                </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-edubot-muted dark:text-slate-400">
                <span className="inline-flex items-center gap-1.5">
                    <FiMapPin className="h-4 w-4" />
                    {group.location || t('instructorDashboard.groupsSection.card.noLocation')}
                </span>
                <span className="inline-flex items-center gap-1.5">
                    <FiCalendar className="h-4 w-4" />
                    {group.timezone || t('instructorDashboard.groupsSection.card.noTimezone')}
                </span>
            </div>

            <div className="mt-4 rounded-2xl border border-edubot-line/70 bg-edubot-surfaceAlt/60 px-4 py-3 dark:border-slate-700 dark:bg-slate-900/70">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-edubot-muted dark:text-slate-400">
                    {t('instructorDashboard.groupsSection.card.defaultSchedule')}
                </p>
                <p className="mt-2 text-sm font-semibold text-edubot-ink dark:text-white">
                    {scheduleSummary || (!formattedScheduleBlocks.length ? t('instructorDashboard.groupsSection.card.noSchedule') : '')}
                </p>
                {formattedScheduleBlocks.length ? (
                    <div className={scheduleSummary ? 'mt-3 flex flex-wrap gap-2' : 'mt-2 flex flex-wrap gap-2'}>
                        {formattedScheduleBlocks.map((line) => (
                            <span
                                key={line}
                                className="rounded-full border border-edubot-line bg-white px-3 py-1 text-[11px] font-semibold text-edubot-ink dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                            >
                                {line}
                            </span>
                        ))}
                    </div>
                ) : null}
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
                <Link to={sessionsPath} className="dashboard-button-secondary">
                    {t('instructorDashboard.groupsSection.actions.manageSessions')}
                </Link>
                <button
                    type="button"
                    onClick={() => onOpenGenerateModal(group)}
                    className={hasDefaultSchedule ? 'dashboard-button-primary' : 'dashboard-button-secondary'}
                >
                    <FiCalendar className="h-4 w-4" />
                    {t('instructorDashboard.groupsSection.actions.generateSessions')}
                </button>
                <button
                    type="button"
                    onClick={() => onOpenEnrollModal(group)}
                    className="dashboard-button-secondary disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={individualGroupOccupied || !canEnroll}
                    title={individualGroupOccupied
                        ? t('instructorDashboard.groupsSection.card.individualLimitTitle')
                        : !canEnroll
                          ? t('instructorDashboard.groupsSection.toasts.enrollmentNotReady')
                          : undefined}
                >
                    {individual
                        ? t('instructorDashboard.groupsSection.actions.addIndividualStudent')
                        : t('instructorDashboard.groupsSection.actions.addStudent')}
                </button>
                <button
                    type="button"
                    onClick={() => onOpenEditModal(group)}
                    className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-edubot-muted transition hover:bg-edubot-surfaceAlt hover:text-edubot-ink dark:text-slate-400 dark:hover:bg-slate-900/70 dark:hover:text-white"
                >
                    <FiEdit3 className="h-4 w-4" />
                    {t('instructorDashboard.groupsSection.actions.edit')}
                </button>
            </div>
        </div>
    );
};

InstructorDashboardGroupCard.propTypes = {
    canEnroll: PropTypes.bool,
    group: PropTypes.shape({
        activeStudentCount: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        code: PropTypes.string,
        deliveryMode: PropTypes.string,
        endDate: PropTypes.string,
        id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
        location: PropTypes.string,
        name: PropTypes.string,
        scheduleBlocks: PropTypes.arrayOf(PropTypes.shape({
            day: PropTypes.string,
            startTime: PropTypes.string,
            endTime: PropTypes.string,
        })),
        scheduleNote: PropTypes.string,
        seatLimit: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        startDate: PropTypes.string,
        status: PropTypes.string,
        timezone: PropTypes.string,
    }).isRequired,
    hasLoadedIndividualStudent: PropTypes.bool,
    individualStudent: PropTypes.shape({
        email: PropTypes.string,
        fullName: PropTypes.string,
        id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        name: PropTypes.string,
    }),
    onOpenEditModal: PropTypes.func.isRequired,
    onOpenEnrollModal: PropTypes.func.isRequired,
    onOpenGenerateModal: PropTypes.func.isRequired,
    sessionsPath: PropTypes.string.isRequired,
};

InstructorDashboardGroupCard.defaultProps = {
    canEnroll: false,
    hasLoadedIndividualStudent: false,
    individualStudent: null,
};

export default InstructorDashboardGroupCard;
