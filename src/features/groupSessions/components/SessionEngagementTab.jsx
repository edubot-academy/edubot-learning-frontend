import PropTypes from 'prop-types';
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

const tabLabels = {
    attendance: 'Катышуу',
    homework: 'Үй тапшырма',
    activities: 'Иштер',
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
    if (loading) {
        return (
            <div className="space-y-4">
                <DashboardInsetPanel
                    title="Кийинки аракеттер"
                    description="Бул сессия үчүн ишенимдүү сигналдар жүктөлүп жатат."
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
                    title="Кийинки аракеттер"
                    description="Катышуу, үй тапшырма жана иштерден чыккан приоритеттүү сигналдар."
                >
                <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                    <SummaryCard
                        icon={FiUsers}
                        label="Катышуу белгиленди"
                        value={`${summary.attendanceMarked || 0}/${summary.rosterTotal || 0}`}
                        helper={`${attendance.unmarked || 0} студент али белгилене элек`}
                    />
                    <SummaryCard
                        icon={FiAlertCircle}
                        label="Көзөмөл керек"
                        tone="red"
                        value={summary.followUpStudents || 0}
                        helper={`Алдыңкы ${meta.attentionLimit || attentionStudents.length || 0} студент көрсөтүлөт`}
                    />
                    <SummaryCard
                        icon={FiClock}
                        label="Инструктор кезеги"
                        tone="amber"
                        value={summary.teacherQueue || 0}
                        helper="Текшерүү же белгилөө күтүп турат"
                    />
                    <SummaryCard
                        icon={FiCheckCircle}
                        label="Жакшы сигнал"
                        tone="green"
                        value={summary.positiveStudents || 0}
                        helper={`Алдыңкы ${meta.positiveLimit || positiveStudents.length || 0} позитив студент`}
                    />
                </div>
            </DashboardInsetPanel>

            <div className="grid gap-4 xl:grid-cols-[1.35fr_minmax(0,0.95fr)]">
                <DashboardInsetPanel
                    title="Кимге кайрылуу керек"
                    description="Приоритет, себеп саны жана олуттуулугу боюнча иреттелген тизме."
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
                                                        ? 'Дароо көңүл буруу'
                                                        : student.severity === 'medium'
                                                          ? 'Жакын follow-up'
                                                          : 'Эскертме'}
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
                                                        +{student.reasons.length - 3} дагы
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
                                                    Адегенде ачуу
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
                            <EmptyMessage>Бул сессия үчүн өзгөчө follow-up талап кылган студент көрүнгөн жок.</EmptyMessage>
                        )}
                    </div>
                </DashboardInsetPanel>

                <div className="space-y-4">
                    <DashboardInsetPanel
                        title="Инструктор кезеги"
                        description="Адегенде кайсы ишти ачуу керектигин ушул жерден тандаңыз."
                    >
                        <div className="mt-4 space-y-3">
                            <div className="flex items-center justify-between rounded-[1.25rem] border border-edubot-line/80 bg-white p-4 dark:border-slate-700 dark:bg-slate-950">
                                <div>
                                    <p className="font-semibold text-edubot-ink dark:text-white">Катышуу толук эмес</p>
                                    <p className="mt-1 text-xs text-edubot-muted dark:text-slate-400">
                                        Белгиленбей калган студенттер
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
                                    <p className="font-semibold text-edubot-ink dark:text-white">Үй тапшырма текшерүү</p>
                                    <p className="mt-1 text-xs text-edubot-muted dark:text-slate-400">
                                        Submitted абалындагы жооптор
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
                                    <p className="font-semibold text-edubot-ink dark:text-white">Иш текшерүү</p>
                                    <p className="mt-1 text-xs text-edubot-muted dark:text-slate-400">
                                        Activity submission карала элек
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
                        title="Сигналдардын кыскача көрүнүшү"
                        description={`Кайсы блоктон follow-up чыгып жатканын тез көрүңүз. "Жакында" = ${meta.dueSoonHours || 24} саат.`}
                    >
                        <div className="mt-4 grid gap-3 md:grid-cols-2">
                            <SummaryCard
                                icon={FiUsers}
                                label="Катышуу"
                                value={`${attendance.absent || 0} жок`}
                                helper={`${attendance.late || 0} кечикти, ${attendance.excused || 0} уруксат`}
                                tone={(attendance.absent || 0) > 0 ? 'red' : 'default'}
                            />
                            <SummaryCard
                                icon={FiFileText}
                                label="ҮТ студент сигналдары"
                                value={homework.studentsMissing || 0}
                                helper={`${homework.studentsNeedsRevision || 0} оңдотууда, ${homework.studentsDueSoon || 0} жакында бүтөт`}
                                tone={(homework.studentsMissing || 0) > 0 ? 'red' : 'amber'}
                            />
                            <SummaryCard
                                icon={FiLayers}
                                label="Иш студент сигналдары"
                                value={activities.studentsFailedQuiz || 0}
                                helper={`${activities.studentsNeedsRevision || 0} оңдотууда, ${activities.studentsMissingResponses || 0} жооп жок, ${activities.studentsNotStartedQuizzes || 0} баштай элек`}
                                tone={(activities.studentsFailedQuiz || 0) > 0 ? 'red' : 'amber'}
                            />
                            <SummaryCard
                                icon={FiCheckCircle}
                                label="Жакшы жүрүп жаткандар"
                                value={positiveStudents.length}
                                helper="Тобокелдиксиз позитив сигнал"
                                tone="green"
                            />
                        </div>
                    </DashboardInsetPanel>
                </div>
            </div>

            <DashboardInsetPanel
                title="Жакшы жүрүп жаткан студенттер"
                description="Follow-up жок жана туруктуу жакшы сигнал берген студенттер."
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
                                                {student.streak} ирет катар
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
                        <EmptyMessage>Азырынча өзүнчө positive momentum көрүнбөйт.</EmptyMessage>
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
