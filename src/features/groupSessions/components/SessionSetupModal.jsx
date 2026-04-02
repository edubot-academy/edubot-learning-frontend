import PropTypes from 'prop-types';
import { createPortal } from 'react-dom';
import { FiCalendar, FiEdit3, FiMapPin, FiPaperclip, FiVideo } from 'react-icons/fi';
import { COURSE_SESSION_STATUS, COURSE_TYPE } from '@shared/contracts';

const SessionSetupModal = ({
    editSession,
    isCreateWorkspace,
    isOpen,
    modalRef,
    nextSessionIndex,
    onClose,
    onSubmit,
    quickSession,
    selectedCourse,
    selectedGroup,
    selectedSession,
    setEditSession,
    setQuickSession,
    workspaceActionLabel,
    workspaceDescription,
    workspaceDisabled,
    workspaceDisabledReason,
    workspaceSaving,
    workspaceTitle,
}) => {
    if (!isOpen || typeof document === 'undefined') return null;

    const deliveryType = String(selectedCourse?.courseType || selectedCourse?.type || '').trim().toLowerCase();
    const isOffline = deliveryType === COURSE_TYPE.OFFLINE;
    const isOnlineLive = deliveryType === COURSE_TYPE.ONLINE_LIVE;
    const sessionForm = isCreateWorkspace ? quickSession : editSession;

    return createPortal(
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/55 px-4 py-4 backdrop-blur-sm"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                    onClose();
                }
            }}
        >
            <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.22)] dark:bg-[#151922]">
                <div className="border-b border-edubot-line/70 bg-[radial-gradient(circle_at_top_left,_rgba(251,146,60,0.14),_transparent_36%),linear-gradient(180deg,_rgba(248,250,252,0.98),_rgba(255,255,255,0.98))] px-6 py-5 dark:border-slate-700 dark:bg-[radial-gradient(circle_at_top_left,_rgba(249,115,22,0.12),_transparent_35%),linear-gradient(180deg,_rgba(24,28,39,0.98),_rgba(21,25,34,1))] sm:px-7">
                    <div className="flex items-start justify-between gap-4">
                        <div className="space-y-3">
                            <div className="inline-flex items-center gap-2 rounded-full border border-edubot-orange/20 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-edubot-orange dark:border-edubot-orange/25 dark:bg-slate-900/60">
                                {workspaceTitle}
                            </div>
                            <div>
                                <h2
                                    id="session-setup-modal-title"
                                    className="text-2xl font-semibold tracking-tight text-edubot-ink dark:text-white sm:text-[2rem]"
                                >
                                    {workspaceTitle}
                                </h2>
                                <p className="mt-1 text-sm text-edubot-muted dark:text-slate-400">
                                    {workspaceDescription}
                                </p>
                                <p className="mt-2 text-xs font-medium uppercase tracking-[0.14em] text-edubot-muted dark:text-slate-500">
                                    {isCreateWorkspace
                                        ? 'Курс жана группа жогору жактагы picker аркылуу тандалат'
                                        : 'Түзөтүү активдүү сессиянын контекстинде жүрөт'}
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={onClose}
                            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-edubot-line/80 bg-white/80 text-edubot-muted transition hover:border-edubot-orange/40 hover:text-edubot-orange dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-400"
                            aria-label="Жабуу"
                        >
                            <span className="text-xl leading-none">×</span>
                        </button>
                    </div>
                </div>

                <form
                    ref={modalRef}
                    className="flex min-h-0 flex-1 flex-col"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="session-setup-modal-title"
                    onSubmit={(e) => {
                        e.preventDefault();
                        onSubmit();
                    }}
                >
                    <div className="grid min-h-0 flex-1 gap-5 overflow-y-auto px-6 py-5 sm:px-7 lg:grid-cols-[minmax(0,1.1fr),minmax(260px,0.9fr)]">
                        <div className="space-y-5">
                            <section className="rounded-[1.75rem] border border-edubot-line/70 bg-edubot-surfaceAlt/35 p-5 dark:border-slate-700 dark:bg-slate-900/35">
                                <div className="flex items-center gap-2 text-sm font-semibold text-edubot-ink dark:text-white">
                                    <FiEdit3 className="h-4 w-4 text-edubot-orange" />
                                    Негизги маалымат
                                </div>
                                <div className="mt-4 grid gap-3 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <input
                                            type="number"
                                            min="1"
                                            value={isCreateWorkspace ? quickSession.sessionIndex : editSession.sessionIndex}
                                            onChange={(e) =>
                                                isCreateWorkspace
                                                    ? setQuickSession((prev) => ({ ...prev, sessionIndex: e.target.value }))
                                                    : setEditSession((prev) => ({ ...prev, sessionIndex: e.target.value }))
                                            }
                                            placeholder="Session index *"
                                            className="dashboard-field"
                                        />
                                        <p className="text-xs text-edubot-muted dark:text-slate-400">
                                            {isCreateWorkspace
                                                ? `Кийинки жеткиликтүү номер: ${nextSessionIndex}. Зарыл болсо гана өзгөртүңүз.`
                                                : 'Номер ушул группанын ичинде уникалдуу болушу керек.'}
                                        </p>
                                    </div>
                                    <select
                                        value={isCreateWorkspace ? quickSession.status : editSession.status}
                                        onChange={(e) =>
                                            isCreateWorkspace
                                                ? setQuickSession((prev) => ({ ...prev, status: e.target.value }))
                                                : setEditSession((prev) => ({ ...prev, status: e.target.value }))
                                        }
                                        className="dashboard-field dashboard-select"
                                    >
                                        {[COURSE_SESSION_STATUS.SCHEDULED, COURSE_SESSION_STATUS.COMPLETED, COURSE_SESSION_STATUS.CANCELLED].map((status) => (
                                            <option key={status} value={status}>
                                                {status}
                                            </option>
                                        ))}
                                    </select>
                                    <input
                                        value={isCreateWorkspace ? quickSession.title : editSession.title}
                                        onChange={(e) =>
                                            isCreateWorkspace
                                                ? setQuickSession((prev) => ({ ...prev, title: e.target.value }))
                                                : setEditSession((prev) => ({ ...prev, title: e.target.value }))
                                        }
                                        placeholder="Session title *"
                                        className="dashboard-field md:col-span-2"
                                    />
                                </div>
                            </section>

                            <section className="rounded-[1.75rem] border border-edubot-line/70 bg-edubot-surfaceAlt/35 p-5 dark:border-slate-700 dark:bg-slate-900/35">
                                <div className="flex items-center gap-2 text-sm font-semibold text-edubot-ink dark:text-white">
                                    <FiCalendar className="h-4 w-4 text-edubot-orange" />
                                    Schedule
                                </div>
                                <div className="mt-4 grid gap-3 md:grid-cols-2">
                                    <input
                                        type="datetime-local"
                                        value={isCreateWorkspace ? quickSession.startsAt : editSession.startsAt}
                                        onChange={(e) =>
                                            isCreateWorkspace
                                                ? setQuickSession((prev) => ({ ...prev, startsAt: e.target.value }))
                                                : setEditSession((prev) => ({ ...prev, startsAt: e.target.value }))
                                        }
                                        className="dashboard-field"
                                    />
                                    <input
                                        type="datetime-local"
                                        value={isCreateWorkspace ? quickSession.endsAt : editSession.endsAt}
                                        onChange={(e) =>
                                            isCreateWorkspace
                                                ? setQuickSession((prev) => ({ ...prev, endsAt: e.target.value }))
                                                : setEditSession((prev) => ({ ...prev, endsAt: e.target.value }))
                                        }
                                        className="dashboard-field"
                                    />
                                </div>
                            </section>
                        </div>

                        <div className="space-y-5">
                            <section className="rounded-[1.75rem] border border-edubot-line/70 bg-edubot-surfaceAlt/35 p-5 dark:border-slate-700 dark:bg-slate-900/35">
                                <div className="flex items-center gap-2 text-sm font-semibold text-edubot-ink dark:text-white">
                                    {isOffline ? (
                                        <FiMapPin className="h-4 w-4 text-edubot-orange" />
                                    ) : isOnlineLive ? (
                                        <FiVideo className="h-4 w-4 text-edubot-orange" />
                                    ) : (
                                        <FiPaperclip className="h-4 w-4 text-edubot-orange" />
                                    )}
                                    {isOffline ? 'Location & materials' : isOnlineLive ? 'Materials & recording' : 'Materials'}
                                </div>
                                <div className="mt-4 grid gap-3">
                                    {isOffline ? (
                                        <div className="rounded-2xl border border-edubot-line/70 bg-white/70 px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-950/60">
                                            <div className="font-medium text-edubot-ink dark:text-white">
                                                Группанын локациясы
                                            </div>
                                            <div className="mt-1 text-edubot-muted dark:text-slate-400">
                                                {selectedGroup?.location || 'Локация көрсөтүлгөн эмес'}
                                            </div>
                                        </div>
                                    ) : null}
                                    {isOnlineLive ? (
                                        <input
                                            value={sessionForm.recordingUrl}
                                            onChange={(e) =>
                                                isCreateWorkspace
                                                    ? setQuickSession((prev) => ({ ...prev, recordingUrl: e.target.value }))
                                                    : setEditSession((prev) => ({ ...prev, recordingUrl: e.target.value }))
                                            }
                                            placeholder="Жазуу шилтемеси"
                                            className="dashboard-field"
                                        />
                                    ) : null}
                                    {isCreateWorkspace ? (
                                        <>
                                            <input
                                                value={quickSession.materialTitle}
                                                onChange={(e) =>
                                                    setQuickSession((prev) => ({ ...prev, materialTitle: e.target.value }))
                                                }
                                                placeholder="Material title"
                                                className="dashboard-field"
                                            />
                                            <input
                                                value={quickSession.materialUrl}
                                                onChange={(e) =>
                                                    setQuickSession((prev) => ({ ...prev, materialUrl: e.target.value }))
                                                }
                                                placeholder="Material URL"
                                                className="dashboard-field"
                                            />
                                        </>
                                    ) : (
                                        <div className="rounded-2xl border border-dashed border-edubot-line/70 px-4 py-4 text-sm text-edubot-muted dark:border-slate-700 dark:text-slate-400">
                                            Материалдарды өзгөртүү үчүн сессияны түзөтүү режимин колдонуп, ресурстар табындагы сакталган шилтемелерди жаңыртыңыз.
                                        </div>
                                    )}
                                </div>
                            </section>

                            <section className="rounded-[1.75rem] border border-edubot-line/70 bg-slate-900 px-5 py-5 text-white dark:border-slate-700 dark:bg-slate-800">
                                <div className="text-sm font-semibold text-white">Контекст</div>
                                <div className="mt-3 space-y-2 text-sm text-slate-300">
                                    <div>
                                        <span className="font-semibold text-white">Курс:</span>{' '}
                                        {selectedCourse?.title || selectedCourse?.name || 'Тандала элек'}
                                    </div>
                                    <div>
                                        <span className="font-semibold text-white">Группа:</span>{' '}
                                        {selectedGroup?.name || selectedGroup?.code || 'Тандала элек'}
                                    </div>
                                    <div>
                                        <span className="font-semibold text-white">Формат:</span>{' '}
                                        {isOffline
                                            ? 'Оффлайн'
                                            : isOnlineLive
                                              ? 'Онлайн түз эфир'
                                              : 'Видео курс'}
                                    </div>
                                    {isCreateWorkspace ? (
                                        <div>
                                            <span className="font-semibold text-white">Жаңы сессия:</span>{' '}
                                            Тандалган группага кошулат
                                        </div>
                                    ) : (
                                        <div>
                                            <span className="font-semibold text-white">Сессия:</span>{' '}
                                            {selectedSession?.title ||
                                                (selectedSession
                                                    ? `Session #${selectedSession.sessionIndex || selectedSession.id}`
                                                    : 'Тандала элек')}
                                        </div>
                                    )}
                                </div>
                            </section>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-edubot-line/70 bg-white/95 px-6 py-4 sm:px-7 dark:border-slate-700 dark:bg-[#151922]/95">
                        <p className="text-sm text-edubot-muted dark:text-slate-400">
                            {workspaceDisabled ? workspaceDisabledReason : 'Бардык өзгөртүүлөрдү ушул жерде сактаңыз.'}
                        </p>
                        <div className="flex flex-wrap gap-3">
                            <button
                                type="button"
                                className="dashboard-button-secondary"
                                onClick={onClose}
                                disabled={workspaceSaving}
                            >
                                Жабуу
                            </button>
                            <button
                                type="submit"
                                disabled={workspaceDisabled || workspaceSaving}
                                className="dashboard-button-primary disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {workspaceActionLabel}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
};

SessionSetupModal.propTypes = {
    editSession: PropTypes.shape({
        sessionIndex: PropTypes.string,
        title: PropTypes.string,
        startsAt: PropTypes.string,
        endsAt: PropTypes.string,
        status: PropTypes.string,
        recordingUrl: PropTypes.string,
    }).isRequired,
    isCreateWorkspace: PropTypes.bool.isRequired,
    isOpen: PropTypes.bool.isRequired,
    modalRef: PropTypes.shape({ current: PropTypes.instanceOf(Element) }),
    nextSessionIndex: PropTypes.string.isRequired,
    onClose: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    quickSession: PropTypes.shape({
        sessionIndex: PropTypes.string,
        title: PropTypes.string,
        startsAt: PropTypes.string,
        endsAt: PropTypes.string,
        status: PropTypes.string,
        recordingUrl: PropTypes.string,
        materialTitle: PropTypes.string,
        materialUrl: PropTypes.string,
    }).isRequired,
    selectedCourse: PropTypes.shape({
        title: PropTypes.string,
        name: PropTypes.string,
    }),
    selectedGroup: PropTypes.shape({
        name: PropTypes.string,
        code: PropTypes.string,
    }),
    selectedSession: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        sessionIndex: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        title: PropTypes.string,
    }),
    setEditSession: PropTypes.func.isRequired,
    setQuickSession: PropTypes.func.isRequired,
    workspaceActionLabel: PropTypes.string.isRequired,
    workspaceDescription: PropTypes.string.isRequired,
    workspaceDisabled: PropTypes.bool.isRequired,
    workspaceDisabledReason: PropTypes.string.isRequired,
    workspaceSaving: PropTypes.bool.isRequired,
    workspaceTitle: PropTypes.string.isRequired,
};

SessionSetupModal.defaultProps = {
    modalRef: null,
    selectedCourse: null,
    selectedGroup: null,
    selectedSession: null,
};

export default SessionSetupModal;
