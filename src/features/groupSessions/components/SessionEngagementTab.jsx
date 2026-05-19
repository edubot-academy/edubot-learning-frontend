import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import {
    FiAlertCircle,
    FiArrowRight,
    FiCheckCircle,
    FiClock,
    FiFileText,
    FiLayers,
    FiUsers,
} from 'react-icons/fi';
import { DashboardInsetPanel } from '../../../components/ui/dashboard';

const SummaryCard = ({ icon: Icon, label, value, tone, helper }) => (
    <div className="rounded-[1.25rem] border border-edubot-line/80 bg-white p-4 dark:border-slate-700 dark:bg-slate-950">
        <div className="flex items-start gap-3">
            <div
                className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${
                    tone === 'red'
                        ? 'bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-300'
                        : tone === 'amber'
                          ? 'bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300'
                          : tone === 'green'
                            ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300'
                            : 'bg-edubot-surfaceAlt text-edubot-dark dark:bg-slate-800 dark:text-edubot-soft'
                }`}
            >
                <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
                <p className="text-xs uppercase tracking-wide text-edubot-muted dark:text-slate-400">{label}</p>
                <p className="mt-1 text-2xl font-semibold text-edubot-ink dark:text-white">{value}</p>
                {helper ? (
                    <p className="mt-1 text-xs text-edubot-muted dark:text-slate-400">{helper}</p>
                ) : null}
            </div>
        </div>
    </div>
);

SummaryCard.propTypes = {
    helper: PropTypes.string,
    icon: PropTypes.elementType.isRequired,
    label: PropTypes.string.isRequired,
    tone: PropTypes.oneOf(['default', 'green', 'amber', 'red']),
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

SummaryCard.defaultProps = {
    helper: '',
    tone: 'default',
};

const EmptyMessage = ({ children }) => (
    <div className="rounded-[1.25rem] border border-dashed border-edubot-line/80 bg-edubot-surface/60 p-4 text-sm text-edubot-muted dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-400">
        {children}
    </div>
);

EmptyMessage.propTypes = {
    children: PropTypes.node.isRequired,
};

const toneClasses = {
    red: 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-300',
    amber: 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300',
    blue: 'bg-sky-100 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300',
};

const routeToReasonTarget = (reason, onOpenTab) => {
    if (!reason?.tab) return;

    if (reason.tab === 'homework') {
        onOpenTab({
            tab: 'homework',
            homeworkReviewFilter: reason?.target?.homeworkReviewFilter || 'all',
        });
        return;
    }

    if (reason.tab === 'activities') {
        onOpenTab({
            tab: 'activities',
            activityResponseFilter: reason?.target?.activityResponseFilter || 'all',
        });
        return;
    }

    onOpenTab(reason.tab);
};

const SessionEngagementTab = ({ insights, loading, onOpenTab }) => {
    const { t } = useTranslation();
    const tabLabels = {
        attendance: t('groupSessions.engagement.tabs.attendance'),
        homework: t('groupSessions.engagement.tabs.homework'),
        activities: t('groupSessions.engagement.tabs.activities'),
    };

    if (loading) {
        return (
            <div className="space-y-4">
                <DashboardInsetPanel
                    title={t('groupSessions.engagement.title')}
                    description={t('groupSessions.engagement.loadingDescription')}
                >
                    <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                        {Array.from({ length: 4 }, (_, index) => (
                            <div
                                key={index}
                                className="h-28 animate-pulse rounded-[1.25rem] border border-edubot-line/80 bg-edubot-surface/70 dark:border-slate-700 dark:bg-slate-900/70"
                            />
                        ))}
                    </div>
                </DashboardInsetPanel>
            </div>
        );
    }

    const summary = insights?.summary || {};
    const attendance = insights?.attendance || {};
    const homework = insights?.homework || {};
    const activities = insights?.activities || {};
    const teacherQueue = insights?.teacherQueue || {};
    const meta = insights?.meta || {};
    const attentionStudents = Array.isArray(insights?.attentionStudents) ? insights.attentionStudents : [];
    const positiveStudents = Array.isArray(insights?.positiveStudents) ? insights.positiveStudents : [];

    return (
        <div className="space-y-4">
                <DashboardInsetPanel
                    title={t('groupSessions.engagement.title')}
                    description={t('groupSessions.engagement.description')}
                >
                <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                    <SummaryCard
                        icon={FiUsers}
                        label={t('groupSessions.engagement.metrics.attendanceMarked')}
                        value={`${summary.attendanceMarked || 0}/${summary.rosterTotal || 0}`}
                        helper={t('groupSessions.engagement.metrics.unmarkedHelper', {
                            count: attendance.unmarked || 0,
                        })}
                    />
                    <SummaryCard
                        icon={FiAlertCircle}
                        label={t('groupSessions.engagement.metrics.needsAttention')}
                        tone="red"
                        value={summary.followUpStudents || 0}
                        helper={t('groupSessions.engagement.metrics.attentionLimitHelper', {
                            count: meta.attentionLimit || attentionStudents.length || 0,
                        })}
                    />
                    <SummaryCard
                        icon={FiClock}
                        label={t('groupSessions.engagement.metrics.teacherQueue')}
                        tone="amber"
                        value={summary.teacherQueue || 0}
                        helper={t('groupSessions.engagement.metrics.teacherQueueHelper')}
                    />
                    <SummaryCard
                        icon={FiCheckCircle}
                        label={t('groupSessions.engagement.metrics.positiveSignal')}
                        tone="green"
                        value={summary.positiveStudents || 0}
                        helper={t('groupSessions.engagement.metrics.positiveLimitHelper', {
                            count: meta.positiveLimit || positiveStudents.length || 0,
                        })}
                    />
                </div>
            </DashboardInsetPanel>

            <div className="grid gap-4 xl:grid-cols-[1.35fr_minmax(0,0.95fr)]">
                <DashboardInsetPanel
                    title={t('groupSessions.engagement.attention.title')}
                    description={t('groupSessions.engagement.attention.description')}
                >
                    <div className="mt-4 space-y-3">
                        {attentionStudents.length ? (
                            attentionStudents.map((student) => (
                                <div
                                    key={student.studentId}
                                    className="rounded-[1.25rem] border border-edubot-line/80 bg-white p-4 dark:border-slate-700 dark:bg-slate-950"
                                >
                                    <div className="flex flex-wrap items-start justify-between gap-3">
                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <p className="font-semibold text-edubot-ink dark:text-white">
                                                    {student.fullName}
                                                </p>
                                                <span
                                                    className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                                                        student.severity === 'high'
                                                            ? toneClasses.red
                                                            : student.severity === 'medium'
                                                              ? toneClasses.amber
                                                              : toneClasses.blue
                                                    }`}
                                                >
                                                    {student.severity === 'high'
                                                        ? t('groupSessions.engagement.severity.high')
                                                        : student.severity === 'medium'
                                                          ? t('groupSessions.engagement.severity.medium')
                                                          : t('groupSessions.engagement.severity.low')}
                                                </span>
                                            </div>
                                            <div className="mt-3 flex flex-wrap gap-2">
                                                {student.reasons.slice(0, 3).map((reason, index) => (
                                                    <button
                                                        key={`${student.studentId}-${reason.label}-${index}`}
                                                        type="button"
                                                        onClick={() => routeToReasonTarget(reason, onOpenTab)}
                                                        className={`rounded-full px-3 py-1 text-xs font-semibold transition hover:brightness-95 ${toneClasses[reason.tone] || toneClasses.blue}`}
                                                    >
                                                        {reason.label}
                                                    </button>
                                                ))}
                                                {student.reasons.length > 3 ? (
                                                    <span className="rounded-full bg-edubot-surfaceAlt px-3 py-1 text-xs font-semibold text-edubot-muted dark:bg-slate-800 dark:text-slate-300">
                                                        {t('groupSessions.engagement.attention.moreReasons', {
                                                            count: student.reasons.length - 3,
                                                        })}
                                                    </span>
                                                ) : null}
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {student.recommendedAction ? (
                                                <button
                                                    type="button"
                                                    onClick={() => routeToReasonTarget(student.recommendedAction, onOpenTab)}
                                                    className="inline-flex items-center gap-1 rounded-full bg-edubot-orange px-3 py-1.5 text-xs font-semibold text-white transition hover:brightness-105"
                                                >
                                                    {t('groupSessions.engagement.actions.openFirst')}
                                                    <FiArrowRight className="h-3.5 w-3.5" />
                                                </button>
                                            ) : null}
                                            {(Array.isArray(student.tabs) ? student.tabs : []).map((tab) => (
                                                <button
                                                    key={`${student.studentId}-${tab}`}
                                                    type="button"
                                                    onClick={() => onOpenTab(tab)}
                                                    className="inline-flex items-center gap-1 rounded-full border border-edubot-line/80 px-3 py-1.5 text-xs font-semibold text-edubot-ink transition hover:border-edubot-primary/40 hover:text-edubot-primary dark:border-slate-700 dark:text-slate-200 dark:hover:border-edubot-primary/40 dark:hover:text-edubot-soft"
                                                >
                                                    {tabLabels[tab] || tab}
                                                    <FiArrowRight className="h-3.5 w-3.5" />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <EmptyMessage>{t('groupSessions.engagement.empty.noAttentionStudents')}</EmptyMessage>
                        )}
                    </div>
                </DashboardInsetPanel>

                <div className="space-y-4">
                    <DashboardInsetPanel
                        title={t('groupSessions.engagement.queue.title')}
                        description={t('groupSessions.engagement.queue.description')}
                    >
                        <div className="mt-4 space-y-3">
                            <div className="flex items-center justify-between rounded-[1.25rem] border border-edubot-line/80 bg-white p-4 dark:border-slate-700 dark:bg-slate-950">
                                <div>
                                    <p className="font-semibold text-edubot-ink dark:text-white">{t('groupSessions.engagement.queue.attendanceTitle')}</p>
                                    <p className="mt-1 text-xs text-edubot-muted dark:text-slate-400">
                                        {t('groupSessions.engagement.queue.attendanceDescription')}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => onOpenTab('attendance')}
                                    className="rounded-full bg-edubot-surfaceAlt px-3 py-1.5 text-sm font-semibold text-edubot-ink transition hover:bg-edubot-primary/10 hover:text-edubot-primary dark:bg-slate-800 dark:text-white dark:hover:bg-edubot-primary/10 dark:hover:text-edubot-soft"
                                >
                                    {teacherQueue.attendanceUnmarked || 0}
                                </button>
                            </div>
                            <div className="flex items-center justify-between rounded-[1.25rem] border border-edubot-line/80 bg-white p-4 dark:border-slate-700 dark:bg-slate-950">
                                <div>
                                    <p className="font-semibold text-edubot-ink dark:text-white">{t('groupSessions.engagement.queue.homeworkTitle')}</p>
                                    <p className="mt-1 text-xs text-edubot-muted dark:text-slate-400">
                                        {t('groupSessions.engagement.queue.homeworkDescription')}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => onOpenTab({ tab: 'homework', homeworkReviewFilter: 'needs_review' })}
                                    className="rounded-full bg-amber-100 px-3 py-1.5 text-sm font-semibold text-amber-700 transition hover:bg-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:hover:bg-amber-500/20"
                                >
                                    {teacherQueue.homeworkNeedsReview || 0}
                                </button>
                            </div>
                            <div className="flex items-center justify-between rounded-[1.25rem] border border-edubot-line/80 bg-white p-4 dark:border-slate-700 dark:bg-slate-950">
                                <div>
                                    <p className="font-semibold text-edubot-ink dark:text-white">{t('groupSessions.engagement.queue.activitiesTitle')}</p>
                                    <p className="mt-1 text-xs text-edubot-muted dark:text-slate-400">
                                        {t('groupSessions.engagement.queue.activitiesDescription')}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => onOpenTab({ tab: 'activities', activityResponseFilter: 'pending' })}
                                    className="rounded-full bg-amber-100 px-3 py-1.5 text-sm font-semibold text-amber-700 transition hover:bg-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:hover:bg-amber-500/20"
                                >
                                    {teacherQueue.activityNeedsReview || 0}
                                </button>
                            </div>
                        </div>
                    </DashboardInsetPanel>

                    <DashboardInsetPanel
                        title={t('groupSessions.engagement.signals.title')}
                        description={t('groupSessions.engagement.signals.description', {
                            hours: meta.dueSoonHours || 24,
                        })}
                    >
                        <div className="mt-4 grid gap-3 md:grid-cols-2">
                            <SummaryCard
                                icon={FiUsers}
                                label={t('groupSessions.engagement.signals.attendance')}
                                value={t('groupSessions.engagement.signals.absentValue', {
                                    count: attendance.absent || 0,
                                })}
                                helper={t('groupSessions.engagement.signals.attendanceHelper', {
                                    late: attendance.late || 0,
                                    excused: attendance.excused || 0,
                                })}
                                tone={(attendance.absent || 0) > 0 ? 'red' : 'default'}
                            />
                            <SummaryCard
                                icon={FiFileText}
                                label={t('groupSessions.engagement.signals.homework')}
                                value={homework.studentsMissing || 0}
                                helper={t('groupSessions.engagement.signals.homeworkHelper', {
                                    revision: homework.studentsNeedsRevision || 0,
                                    dueSoon: homework.studentsDueSoon || 0,
                                })}
                                tone={(homework.studentsMissing || 0) > 0 ? 'red' : 'amber'}
                            />
                            <SummaryCard
                                icon={FiLayers}
                                label={t('groupSessions.engagement.signals.activities')}
                                value={activities.studentsFailedQuiz || 0}
                                helper={t('groupSessions.engagement.signals.activitiesHelper', {
                                    revision: activities.studentsNeedsRevision || 0,
                                    missing: activities.studentsMissingResponses || 0,
                                    notStarted: activities.studentsNotStartedQuizzes || 0,
                                })}
                                tone={(activities.studentsFailedQuiz || 0) > 0 ? 'red' : 'amber'}
                            />
                            <SummaryCard
                                icon={FiCheckCircle}
                                label={t('groupSessions.engagement.signals.positive')}
                                value={positiveStudents.length}
                                helper={t('groupSessions.engagement.signals.positiveHelper')}
                                tone="green"
                            />
                        </div>
                    </DashboardInsetPanel>
                </div>
            </div>

            <DashboardInsetPanel
                title={t('groupSessions.engagement.positive.title')}
                description={t('groupSessions.engagement.positive.description')}
            >
                <div className="mt-4 space-y-3">
                    {positiveStudents.length ? (
                        positiveStudents.map((student) => (
                            <div
                                key={student.studentId}
                                className="flex flex-wrap items-start justify-between gap-3 rounded-[1.25rem] border border-edubot-line/80 bg-white p-4 dark:border-slate-700 dark:bg-slate-950"
                            >
                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <p className="font-semibold text-edubot-ink dark:text-white">{student.fullName}</p>
                                        {student.streak > 0 ? (
                                            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                                                {t('groupSessions.engagement.positive.streak', {
                                                    count: student.streak,
                                                })}
                                            </span>
                                        ) : null}
                                    </div>
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {student.signals.map((signal) => (
                                            <span
                                                key={`${student.studentId}-${signal}`}
                                                className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
                                            >
                                                {signal}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <EmptyMessage>{t('groupSessions.engagement.empty.noPositiveStudents')}</EmptyMessage>
                    )}
                </div>
            </DashboardInsetPanel>
        </div>
    );
};

SessionEngagementTab.propTypes = {
    insights: PropTypes.shape({
        activities: PropTypes.object,
        attentionStudents: PropTypes.array,
        attendance: PropTypes.object,
        homework: PropTypes.object,
        positiveStudents: PropTypes.array,
        summary: PropTypes.object,
        teacherQueue: PropTypes.object,
    }),
    loading: PropTypes.bool,
    onOpenTab: PropTypes.func,
};

SessionEngagementTab.defaultProps = {
    insights: null,
    loading: false,
    onOpenTab: () => {},
};

export default SessionEngagementTab;
