import PropTypes from 'prop-types';
import { FiAlertCircle, FiCheckCircle, FiClock, FiFileText, FiUsers } from 'react-icons/fi';
import { DashboardInsetPanel } from '../../../components/ui/dashboard';

const SummaryItem = ({ icon: Icon, label, value, tone }) => (
    <div className="rounded-[1.25rem] border border-edubot-line/80 bg-white p-4 dark:border-slate-700 dark:bg-slate-950">
        <div className="flex items-center gap-3">
            <div
                className={`flex h-10 w-10 items-center justify-center rounded-2xl ${
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
            <div>
                <p className="text-xs uppercase tracking-wide text-edubot-muted dark:text-slate-400">
                    {label}
                </p>
                <p className="text-lg font-semibold text-edubot-ink dark:text-white">{value}</p>
            </div>
        </div>
    </div>
);

SummaryItem.propTypes = {
    icon: PropTypes.elementType.isRequired,
    label: PropTypes.string.isRequired,
    tone: PropTypes.oneOf(['default', 'green', 'amber', 'red']),
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

SummaryItem.defaultProps = {
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

const SessionEngagementTab = ({
    attentionStudents,
    attendanceStats,
    consistentStudents,
    homeworkStats,
}) => (
    <div className="space-y-4">
        <DashboardInsetPanel
            title="Кийинки аракеттер"
            description="Бул сессиядан кийин кимге көңүл буруу керектигин жана кайсы студенттер туруктуу бара жатканын көрсөтөт."
        >
            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <SummaryItem
                    icon={FiUsers}
                    label="Белгиленген катышуу"
                    value={`${attendanceStats.marked}/${attendanceStats.total}`}
                />
                <SummaryItem
                    icon={FiAlertCircle}
                    label="Көңүл буруу керек"
                    tone="red"
                    value={attentionStudents.length}
                />
                <SummaryItem
                    icon={FiCheckCircle}
                    label="Туруктуу катышуу"
                    tone="green"
                    value={consistentStudents.length}
                />
                <SummaryItem
                    icon={FiFileText}
                    label="Ачык тапшырма"
                    tone="amber"
                    value={homeworkStats.open}
                />
            </div>
        </DashboardInsetPanel>

        <div className="grid gap-4 xl:grid-cols-2">
            <DashboardInsetPanel
                title="Көңүл буруу керек"
                description="Бул сессияда кечиккен, келбеген же уруксат менен белгиленген студенттер."
            >
                <div className="mt-4 space-y-3">
                    {attentionStudents.length ? (
                        attentionStudents.map((student) => (
                            <div
                                key={student.id}
                                className="rounded-[1.25rem] border border-edubot-line/80 bg-white p-4 dark:border-slate-700 dark:bg-slate-950"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="font-semibold text-edubot-ink dark:text-white">
                                            {student.fullName}
                                        </p>
                                        <div className="mt-2 flex flex-wrap gap-2">
                                            {student.reasons.map((reason) => (
                                                <span
                                                    key={reason}
                                                    className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700 dark:bg-red-500/10 dark:text-red-300"
                                                >
                                                    {reason}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <EmptyMessage>Бул сессияда өзгөчө көзөмөл керек болгон студент жок.</EmptyMessage>
                    )}
                </div>
            </DashboardInsetPanel>

            <DashboardInsetPanel
                title="Туруктуу катышуу"
                description="Тандалган группа боюнча акыркы сакталган катышууга карата жакшы сериясы бар студенттер."
            >
                <div className="mt-4 space-y-3">
                    {consistentStudents.length ? (
                        consistentStudents.map((student) => (
                            <div
                                key={student.id}
                                className="flex items-center justify-between rounded-[1.25rem] border border-edubot-line/80 bg-white p-4 dark:border-slate-700 dark:bg-slate-950"
                            >
                                <div>
                                    <p className="font-semibold text-edubot-ink dark:text-white">
                                        {student.fullName}
                                    </p>
                                    <p className="mt-1 text-xs text-edubot-muted dark:text-slate-400">
                                        Акыркы сакталган катышуу тарыхы боюнча серия
                                    </p>
                                </div>
                                <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                                    {student.streak} күн
                                </span>
                            </div>
                        ))
                    ) : (
                        <EmptyMessage>Азырынча туруктуу катышуу сериясы көрүнбөйт.</EmptyMessage>
                    )}
                </div>
            </DashboardInsetPanel>
        </div>

        <DashboardInsetPanel
            title="Үй тапшырма көрүнүшү"
            description="Бул сессия үчүн жарыяланган тапшырмалардын учурдагы абалы."
        >
            <div className="mt-4 grid gap-3 md:grid-cols-3">
                <SummaryItem icon={FiFileText} label="Жалпы тапшырма" value={homeworkStats.total} />
                <SummaryItem icon={FiClock} label="Ачык" tone="amber" value={homeworkStats.open} />
                <SummaryItem icon={FiAlertCircle} label="Өтүп кеткен" tone="red" value={homeworkStats.overdue} />
            </div>
        </DashboardInsetPanel>
    </div>
);

SessionEngagementTab.propTypes = {
    attentionStudents: PropTypes.arrayOf(
        PropTypes.shape({
            fullName: PropTypes.string.isRequired,
            id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
            reasons: PropTypes.arrayOf(PropTypes.string).isRequired,
        })
    ).isRequired,
    attendanceStats: PropTypes.shape({
        marked: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        total: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    }).isRequired,
    consistentStudents: PropTypes.arrayOf(
        PropTypes.shape({
            fullName: PropTypes.string.isRequired,
            id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
            streak: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        })
    ).isRequired,
    homeworkStats: PropTypes.shape({
        open: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        overdue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        total: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    }).isRequired,
};

export default SessionEngagementTab;
