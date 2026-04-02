import PropTypes from 'prop-types';
import {
    FiActivity,
    FiAlertCircle,
    FiBookOpen,
    FiCheck,
    FiClock,
    FiEdit3,
    FiExternalLink,
    FiFileText,
    FiPaperclip,
    FiSearch,
    FiXCircle,
} from 'react-icons/fi';
import {
    DashboardFilterBar,
    DashboardInsetPanel,
    DashboardMetricCard,
    EmptyState,
    StatusBadge,
} from '../../../components/ui/dashboard';

const SessionHomeworkTab = ({
    beginHomeworkEdit,
    cancelHomeworkEdit,
    editHomeworkDeadline,
    editHomeworkDescription,
    editHomeworkTitle,
    filteredHomework,
    formatDisplayDate,
    getAttachmentName,
    getSubmissionAttachmentUrl,
    getSubmissionPreview,
    getSubmissionStatusMeta,
    homeworkDeadline,
    homeworkDescription,
    homeworkFilter,
    homeworkQuery,
    homeworkStats,
    homeworkSubmissions,
    loadingHomework,
    loadingHomeworkSubmissions,
    publishHomework,
    publishedHomework,
    resolveHomeworkDeadline,
    reviewHomeworkSubmission,
    reviewingSubmissionId,
    saveHomeworkEdit,
    savingHomework,
    selectedGroup,
    selectedHomework,
    selectedHomeworkId,
    selectedHomeworkMeta,
    selectedSession,
    selectedSessionId,
    setEditHomeworkDeadline,
    setEditHomeworkDescription,
    setEditHomeworkTitle,
    setHomeworkDeadline,
    setHomeworkDescription,
    setHomeworkFilter,
    setHomeworkQuery,
    setHomeworkTitle,
    setSelectedHomeworkId,
    students,
    submissionStats,
    toggleHomeworkPublish,
    updatingHomework,
    homeworkTitle,
    editingHomeworkId,
}) => {
    if (!selectedSessionId) {
        return (
            <EmptyState
                title="Үй тапшырма үчүн сессия тандаңыз"
                subtitle="Тапшырма жарыялоо, өзгөртүү жана студент жоопторун текшерүү үчүн алгач активдүү группадан бир сессияны тандаңыз."
                icon={<FiBookOpen className="h-8 w-8 text-edubot-orange" />}
                className="dashboard-panel"
            />
        );
    }

    return (
        <div className="space-y-5">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <DashboardMetricCard
                    label="Жалпы тапшырма"
                    value={homeworkStats.total}
                    icon={FiBookOpen}
                />
                <DashboardMetricCard
                    label="Активдүү"
                    value={homeworkStats.open}
                    icon={FiActivity}
                    tone="green"
                />
                <DashboardMetricCard
                    label="Жакында бүтөт"
                    value={homeworkStats.dueSoon}
                    icon={FiClock}
                    tone="amber"
                />
                <DashboardMetricCard
                    label="Өтүп кеткен"
                    value={homeworkStats.overdue}
                    icon={FiAlertCircle}
                    tone="red"
                />
            </div>

            <div className="grid gap-4 xl:grid-cols-[minmax(0,0.95fr),minmax(0,1.05fr)]">
                <DashboardInsetPanel
                    title="Тапшырма жарыялоо"
                    description="Сессияга байланышкан тапшырманы түзүп, ушул группанын бардык студенттерине бир эле агымда дайындаңыз."
                    action={
                        <span className="rounded-full border border-edubot-line bg-white px-3 py-1 text-xs font-semibold text-edubot-ink dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
                            {students.length} студент
                        </span>
                    }
                >
                    <div className="mt-4 space-y-4">
                        <div className="grid gap-3 md:grid-cols-2">
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-xs font-semibold uppercase tracking-[0.12em] text-edubot-muted dark:text-slate-400">
                                    Аталышы
                                </label>
                                <input
                                    value={homeworkTitle}
                                    onChange={(e) => setHomeworkTitle(e.target.value)}
                                    placeholder="Мисалы: Lesson 5 reflection"
                                    className="dashboard-field"
                                />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-xs font-semibold uppercase tracking-[0.12em] text-edubot-muted dark:text-slate-400">
                                    Түшүндүрмө
                                </label>
                                <textarea
                                    value={homeworkDescription}
                                    onChange={(e) => setHomeworkDescription(e.target.value)}
                                    rows={5}
                                    placeholder="Эмне тапшырыш керек, кайсы форматта жана кандай бааланат..."
                                    className="dashboard-field"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-semibold uppercase tracking-[0.12em] text-edubot-muted dark:text-slate-400">
                                    Deadline
                                </label>
                                <input
                                    type="date"
                                    value={homeworkDeadline}
                                    onChange={(e) => setHomeworkDeadline(e.target.value)}
                                    className="dashboard-field"
                                />
                            </div>
                            <div className="dashboard-panel-muted flex items-center justify-between rounded-2xl px-4 py-3">
                                <div>
                                    <div className="text-xs font-semibold uppercase tracking-[0.12em] text-edubot-muted dark:text-slate-400">
                                        Дайындалат
                                    </div>
                                    <div className="mt-1 text-sm font-semibold text-edubot-ink dark:text-white">
                                        {selectedGroup?.name || selectedGroup?.code || 'Группа тандалган жок'}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs text-edubot-muted dark:text-slate-400">
                                        Сессия
                                    </div>
                                    <div className="mt-1 text-sm font-semibold text-edubot-ink dark:text-white">
                                        {selectedSession?.title || `#${selectedSessionId}`}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <p className="text-sm text-edubot-muted dark:text-slate-400">
                                Жарыялангандан кийин тапшырма ушул сессиянын бардык студенттерине дароо байланат.
                            </p>
                            <button
                                onClick={publishHomework}
                                disabled={!selectedSessionId || savingHomework}
                                className="dashboard-button-primary"
                            >
                                {savingHomework ? 'Жарыяланып жатат...' : 'Үй тапшырмасын жарыялоо'}
                            </button>
                        </div>
                    </div>
                </DashboardInsetPanel>

                <DashboardInsetPanel
                    title="Тапшырмалар тизмеси"
                    description="Издеп табыңыз, deadline абалы боюнча чыпкалап, керектүүсүн тандап текшерүүгө өтүңүз."
                    action={<StatusBadge tone="default">{publishedHomework.length}</StatusBadge>}
                >
                    <DashboardFilterBar className="mt-4" gridClassName="lg:grid-cols-[minmax(0,1fr),180px]">
                        <div className="relative flex-1">
                            <FiSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-edubot-muted dark:text-slate-500" />
                            <input
                                value={homeworkQuery}
                                onChange={(e) => setHomeworkQuery(e.target.value)}
                                placeholder="Тапшырма издөө"
                                className="dashboard-field-icon pl-10"
                            />
                        </div>
                        <select
                            value={homeworkFilter}
                            onChange={(e) => setHomeworkFilter(e.target.value)}
                            className="dashboard-select w-full"
                        >
                            <option value="all">Баары</option>
                            <option value="active">Активдүү</option>
                            <option value="dueSoon">Жакында бүтөт</option>
                            <option value="overdue">Өтүп кеткен</option>
                            <option value="noDeadline">Мөөнөт жок</option>
                        </select>
                    </DashboardFilterBar>

                    {loadingHomework && (
                        <div className="mt-4 text-sm text-edubot-muted dark:text-slate-400">
                            Үй тапшырмалар жүктөлүүдө...
                        </div>
                    )}

                    <div className="mt-4 space-y-3 max-h-[28rem] overflow-auto pr-1">
                        {filteredHomework.map((item) => (
                            <div
                                key={item.id}
                                onClick={() => setSelectedHomeworkId(String(item.id))}
                                className={`w-full cursor-pointer rounded-3xl border p-4 text-left transition ${String(item.id) === String(selectedHomeworkId)
                                    ? 'border-edubot-orange bg-white shadow-edubot-card dark:bg-slate-900'
                                    : 'border-edubot-line/80 bg-white/80 hover:-translate-y-0.5 hover:border-edubot-orange/40 hover:shadow-edubot-card dark:border-slate-700 dark:bg-slate-950'
                                    }`}
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <div className="font-medium text-edubot-ink dark:text-white">
                                            {item.title || item.name || 'Homework'}
                                        </div>
                                        <div className="mt-1 line-clamp-2 text-sm text-edubot-muted dark:text-slate-400">
                                            {item.description || 'Түшүндүрмө кошула элек.'}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <StatusBadge
                                            tone={item.deadlineMeta.tone || 'default'}
                                            className="shrink-0 text-[11px]"
                                        >
                                            {item.deadlineMeta.label}
                                        </StatusBadge>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleHomeworkPublish(item.id, item.isPublished);
                                            }}
                                            className={`shrink-0 transition ${item.isPublished
                                                ? 'text-emerald-700 dark:text-emerald-300'
                                                : 'text-amber-700 dark:text-amber-300'
                                                }`}
                                        >
                                            <StatusBadge
                                                tone={item.isPublished ? 'green' : 'amber'}
                                                className="text-[11px]"
                                            >
                                                {item.isPublished ? 'Жарыяланган' : 'Жарыяланбаган'}
                                            </StatusBadge>
                                        </button>
                                    </div>
                                </div>
                                <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-edubot-muted dark:text-slate-400">
                                    <span>
                                        Deadline: {formatDisplayDate(resolveHomeworkDeadline(item))}
                                    </span>
                                    <span>Session: {selectedSession?.title || `#${selectedSessionId}`}</span>
                                </div>
                            </div>
                        ))}
                        {!loadingHomework && filteredHomework.length === 0 && (
                            <div className="dashboard-panel-muted rounded-3xl p-6 text-sm text-edubot-muted dark:text-slate-400">
                                {publishedHomework.length === 0
                                    ? 'Бул сессия боюнча үй тапшырма азырынча жок.'
                                    : 'Издөө же фильтр боюнча тапшырма табылган жок.'}
                            </div>
                        )}
                    </div>
                </DashboardInsetPanel>
            </div>

            {selectedHomework ? (
                <div className="grid gap-4 xl:grid-cols-[minmax(0,0.95fr),minmax(0,1.05fr)]">
                    <DashboardInsetPanel
                        title="Тандалган тапшырма"
                        description="Тапшырманын мазмуну, deadline жана түзөтүү агымы ушул жерде."
                        action={
                            <button
                                type="button"
                                onClick={() => beginHomeworkEdit(selectedHomework)}
                                className="dashboard-button-secondary"
                            >
                                <FiEdit3 className="h-4 w-4" />
                                Өзгөртүү
                            </button>
                        }
                    >
                        <div className="mt-4 space-y-4">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <div className="text-lg font-semibold text-edubot-ink dark:text-white">
                                        {selectedHomework.title || selectedHomework.name || 'Homework'}
                                    </div>
                                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-edubot-muted dark:text-slate-400">
                                        {selectedHomework.description || 'Түшүндүрмө кошула элек.'}
                                    </p>
                                </div>
                                {selectedHomeworkMeta ? (
                                    <StatusBadge tone={selectedHomeworkMeta.tone || 'default'}>
                                        {selectedHomeworkMeta.label}
                                    </StatusBadge>
                                ) : null}
                            </div>

                            <div className="grid gap-3 md:grid-cols-3">
                                <div className="dashboard-panel-muted rounded-2xl p-4">
                                    <div className="text-xs font-semibold uppercase tracking-[0.12em] text-edubot-muted dark:text-slate-400">
                                        Deadline
                                    </div>
                                    <div className="mt-2 text-sm font-semibold text-edubot-ink dark:text-white">
                                        {formatDisplayDate(resolveHomeworkDeadline(selectedHomework))}
                                    </div>
                                </div>
                                <div className="dashboard-panel-muted rounded-2xl p-4">
                                    <div className="text-xs font-semibold uppercase tracking-[0.12em] text-edubot-muted dark:text-slate-400">
                                        Студенттер
                                    </div>
                                    <div className="mt-2 text-sm font-semibold text-edubot-ink dark:text-white">
                                        {students.length} адамга дайындады
                                    </div>
                                </div>
                                <div className="dashboard-panel-muted rounded-2xl p-4">
                                    <div className="text-xs font-semibold uppercase tracking-[0.12em] text-edubot-muted dark:text-slate-400">
                                        Текшерүү
                                    </div>
                                    <div className="mt-2 text-sm font-semibold text-edubot-ink dark:text-white">
                                        {submissionStats.pending} жооп күтүп турат
                                    </div>
                                </div>
                            </div>

                            {editingHomeworkId === String(selectedHomework.id) && (
                                <DashboardInsetPanel
                                    title="Тапшырманы өзгөртүү"
                                    description="Аталышын, мазмунун же мөөнөтүн жаңыртып сактаңыз."
                                >
                                    <div className="mt-4 space-y-3">
                                        <input
                                            value={editHomeworkTitle}
                                            onChange={(e) => setEditHomeworkTitle(e.target.value)}
                                            className="dashboard-field"
                                        />
                                        <textarea
                                            value={editHomeworkDescription}
                                            onChange={(e) => setEditHomeworkDescription(e.target.value)}
                                            rows={4}
                                            className="dashboard-field"
                                        />
                                        <input
                                            type="date"
                                            value={editHomeworkDeadline}
                                            onChange={(e) => setEditHomeworkDeadline(e.target.value)}
                                            className="dashboard-field"
                                        />
                                        <div className="flex flex-wrap gap-2">
                                            <button
                                                type="button"
                                                onClick={saveHomeworkEdit}
                                                disabled={updatingHomework}
                                                className="dashboard-button-primary"
                                            >
                                                {updatingHomework ? 'Сакталып жатат...' : 'Сактоо'}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={cancelHomeworkEdit}
                                                className="dashboard-button-secondary"
                                            >
                                                Жокко чыгаруу
                                            </button>
                                        </div>
                                    </div>
                                </DashboardInsetPanel>
                            )}
                        </div>
                    </DashboardInsetPanel>

                    <DashboardInsetPanel
                        title="Жоопторду текшерүү"
                        description="Студент жоопторун карап чыгып, дароо кабыл алыңыз же кайра жөнөтүңүз."
                        action={<StatusBadge tone="default">{submissionStats.total} жооп</StatusBadge>}
                    >
                        <div className="mt-4 grid gap-3 sm:grid-cols-3">
                            <div className="dashboard-panel-muted rounded-2xl p-4">
                                <div className="text-xs font-semibold uppercase tracking-[0.12em] text-edubot-muted dark:text-slate-400">
                                    Күтүүдө
                                </div>
                                <div className="mt-2 text-2xl font-semibold text-edubot-ink dark:text-white">
                                    {submissionStats.pending}
                                </div>
                            </div>
                            <div className="dashboard-panel-muted rounded-2xl p-4">
                                <div className="text-xs font-semibold uppercase tracking-[0.12em] text-edubot-muted dark:text-slate-400">
                                    Бекитилди
                                </div>
                                <div className="mt-2 text-2xl font-semibold text-emerald-700 dark:text-emerald-300">
                                    {submissionStats.approved}
                                </div>
                            </div>
                            <div className="dashboard-panel-muted rounded-2xl p-4">
                                <div className="text-xs font-semibold uppercase tracking-[0.12em] text-edubot-muted dark:text-slate-400">
                                    Кайтарылды
                                </div>
                                <div className="mt-2 text-2xl font-semibold text-red-700 dark:text-red-300">
                                    {submissionStats.rejected}
                                </div>
                            </div>
                        </div>

                        {loadingHomeworkSubmissions && (
                            <div className="mt-4 text-sm text-edubot-muted dark:text-slate-400">
                                Submissionдер жүктөлүүдө...
                            </div>
                        )}
                        {!loadingHomeworkSubmissions && homeworkSubmissions.length === 0 && (
                            <div className="mt-4 dashboard-panel-muted p-6 text-sm text-edubot-muted dark:text-slate-400">
                                Жооп азырынча жок.
                            </div>
                        )}
                        <div className="mt-4 grid gap-3">
                            {homeworkSubmissions.map((submission) => {
                                const submissionMeta = getSubmissionStatusMeta(submission.status);
                                const previewText = getSubmissionPreview(submission);
                                const attachmentUrl = getSubmissionAttachmentUrl(submission);
                                const hasAttachment =
                                    Boolean(attachmentUrl) && previewText !== attachmentUrl;
                                return (
                                    <div
                                        key={submission.id}
                                        className="dashboard-panel-muted rounded-3xl p-4"
                                    >
                                        <div className="flex flex-wrap items-start justify-between gap-3">
                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <div className="font-medium text-sm text-edubot-ink dark:text-white">
                                                        {submission.student?.fullName ||
                                                            submission.fullName ||
                                                            `#${submission.studentId || submission.userId}`}
                                                    </div>
                                                    <StatusBadge tone={submissionMeta.tone || 'default'} className="text-[11px]">
                                                        {submissionMeta.label}
                                                    </StatusBadge>
                                                </div>
                                                <div className="mt-1 text-xs text-edubot-muted dark:text-slate-400">
                                                    Жөнөтүлгөн:{' '}
                                                    {formatDisplayDate(
                                                        submission.submittedAt ||
                                                        submission.createdAt,
                                                        '-'
                                                    )}
                                                </div>
                                                <div className="mt-3 rounded-2xl border border-edubot-line/80 bg-white/80 px-3 py-3 text-sm text-edubot-muted dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300">
                                                    <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-edubot-muted dark:text-slate-500">
                                                        <FiFileText className="h-4 w-4" />
                                                        Жооп мазмуну
                                                    </div>
                                                    <p className="whitespace-pre-wrap break-words leading-6">
                                                        {previewText}
                                                    </p>
                                                </div>
                                                {hasAttachment && (
                                                    <div className="mt-3 rounded-2xl border border-edubot-line/80 bg-white/80 px-3 py-3 text-sm text-edubot-muted dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300">
                                                        <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-edubot-muted dark:text-slate-500">
                                                            <FiPaperclip className="h-4 w-4" />
                                                            Тиркелген файл
                                                        </div>
                                                        <div className="flex flex-wrap items-center justify-between gap-3">
                                                            <div className="min-w-0 flex-1">
                                                                <p className="truncate font-medium text-edubot-ink dark:text-white">
                                                                    {getAttachmentName(
                                                                        attachmentUrl
                                                                    )}
                                                                </p>
                                                                <p className="mt-1 text-xs text-edubot-muted dark:text-slate-400">
                                                                    LMSке жүктөлгөн файл же тышкы шилтеме
                                                                </p>
                                                            </div>
                                                            <a
                                                                href={attachmentUrl}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="inline-flex items-center gap-2 rounded-xl border border-edubot-line px-3 py-2 text-xs font-semibold text-edubot-ink transition hover:border-edubot-orange hover:text-edubot-orange dark:border-slate-700 dark:text-slate-200"
                                                            >
                                                                <FiExternalLink className="h-4 w-4" />
                                                                Ачуу
                                                            </a>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        reviewHomeworkSubmission(
                                                            submission.id,
                                                            'approved'
                                                        )
                                                    }
                                                    disabled={
                                                        reviewingSubmissionId ===
                                                        String(submission.id)
                                                    }
                                                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-60"
                                                >
                                                    <FiCheck className="h-4 w-4" />
                                                    Бекитүү
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        reviewHomeworkSubmission(
                                                            submission.id,
                                                            'rejected'
                                                        )
                                                    }
                                                    disabled={
                                                        reviewingSubmissionId ===
                                                        String(submission.id)
                                                    }
                                                    className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-60"
                                                >
                                                    <FiXCircle className="h-4 w-4" />
                                                    Кайтаруу
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </DashboardInsetPanel>
                </div>
            ) : (
                <DashboardInsetPanel
                    title="Тапшырма тандаңыз"
                    description="Тизменин ичинен бир тапшырманы тандасаңыз, мазмуну жана студент жооптору ушул жерде ачылат."
                >
                    <EmptyState
                        title="Тандалган тапшырма жок"
                        subtitle="Сол жактагы тизме аркылуу бир тапшырманы тандап, дароо текшерүү агымына өтүңүз."
                        icon={<FiBookOpen className="h-8 w-8 text-edubot-orange" />}
                        className="py-6"
                    />
                </DashboardInsetPanel>
            )}
        </div>
    );
};

SessionHomeworkTab.propTypes = {
    beginHomeworkEdit: PropTypes.func.isRequired,
    cancelHomeworkEdit: PropTypes.func.isRequired,
    editHomeworkDeadline: PropTypes.string.isRequired,
    editHomeworkDescription: PropTypes.string.isRequired,
    editHomeworkTitle: PropTypes.string.isRequired,
    editingHomeworkId: PropTypes.string.isRequired,
    filteredHomework: PropTypes.arrayOf(PropTypes.object).isRequired,
    formatDisplayDate: PropTypes.func.isRequired,
    getAttachmentName: PropTypes.func.isRequired,
    getSubmissionAttachmentUrl: PropTypes.func.isRequired,
    getSubmissionPreview: PropTypes.func.isRequired,
    getSubmissionStatusMeta: PropTypes.func.isRequired,
    homeworkDeadline: PropTypes.string.isRequired,
    homeworkDescription: PropTypes.string.isRequired,
    homeworkFilter: PropTypes.string.isRequired,
    homeworkQuery: PropTypes.string.isRequired,
    homeworkStats: PropTypes.shape({
        total: PropTypes.number,
        open: PropTypes.number,
        dueSoon: PropTypes.number,
        overdue: PropTypes.number,
    }).isRequired,
    homeworkSubmissions: PropTypes.arrayOf(PropTypes.object).isRequired,
    homeworkTitle: PropTypes.string.isRequired,
    loadingHomework: PropTypes.bool.isRequired,
    loadingHomeworkSubmissions: PropTypes.bool.isRequired,
    publishHomework: PropTypes.func.isRequired,
    publishedHomework: PropTypes.arrayOf(PropTypes.object).isRequired,
    resolveHomeworkDeadline: PropTypes.func.isRequired,
    reviewHomeworkSubmission: PropTypes.func.isRequired,
    reviewingSubmissionId: PropTypes.string.isRequired,
    saveHomeworkEdit: PropTypes.func.isRequired,
    savingHomework: PropTypes.bool.isRequired,
    selectedGroup: PropTypes.shape({
        name: PropTypes.string,
        code: PropTypes.string,
    }),
    selectedHomework: PropTypes.object,
    selectedHomeworkId: PropTypes.string.isRequired,
    selectedHomeworkMeta: PropTypes.shape({
        tone: PropTypes.string,
        label: PropTypes.string,
    }),
    selectedSession: PropTypes.shape({
        title: PropTypes.string,
    }),
    selectedSessionId: PropTypes.string,
    setEditHomeworkDeadline: PropTypes.func.isRequired,
    setEditHomeworkDescription: PropTypes.func.isRequired,
    setEditHomeworkTitle: PropTypes.func.isRequired,
    setHomeworkDeadline: PropTypes.func.isRequired,
    setHomeworkDescription: PropTypes.func.isRequired,
    setHomeworkFilter: PropTypes.func.isRequired,
    setHomeworkQuery: PropTypes.func.isRequired,
    setHomeworkTitle: PropTypes.func.isRequired,
    setSelectedHomeworkId: PropTypes.func.isRequired,
    students: PropTypes.arrayOf(PropTypes.object).isRequired,
    submissionStats: PropTypes.shape({
        total: PropTypes.number,
        pending: PropTypes.number,
        approved: PropTypes.number,
        rejected: PropTypes.number,
    }).isRequired,
    toggleHomeworkPublish: PropTypes.func.isRequired,
    updatingHomework: PropTypes.bool.isRequired,
};

SessionHomeworkTab.defaultProps = {
    selectedGroup: null,
    selectedHomework: null,
    selectedHomeworkMeta: null,
    selectedSession: null,
    selectedSessionId: '',
};

export default SessionHomeworkTab;
