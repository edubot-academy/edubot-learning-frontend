import PropTypes from 'prop-types';
import { FiExternalLink, FiPaperclip } from 'react-icons/fi';
import { COURSE_TYPE, MEETING_PROVIDER } from '@shared/contracts';
import { DashboardInsetPanel, EmptyState } from '../../../components/ui/dashboard';

const SessionResourcesTab = ({
    deletingMeeting,
    importZoomAttendanceToSession,
    importingAttendance,
    joinLiveSession,
    loadingMeetingState,
    meetingId,
    meetingJoinUrl,
    meetingProvider,
    onEditSession,
    removeMeeting,
    restoreMeetingState,
    saveMeetingLink,
    savingMeeting,
    selectedDeliveryType,
    selectedGroupLocation,
    selectedSessionId,
    selectedSessionJoinAllowed,
    selectedSessionJoinUrl,
    selectedSessionMaterials,
    selectedSessionMode,
    selectedSessionRecordingUrl,
    setMeetingJoinUrl,
    setMeetingProvider,
    syncZoomRecordingsToSession,
    syncingRecordings,
}) => {
    const isOnlineLive = selectedDeliveryType === COURSE_TYPE.ONLINE_LIVE;

    if (!selectedSessionId) {
        return (
            <EmptyState
                title="Ресурстар үчүн сессия тандаңыз"
                subtitle="Материалдар, жолугушуу шилтемеси жана жазуу ушул активдүү сессияга байланат."
                icon={<FiPaperclip className="h-8 w-8 text-edubot-orange" />}
                className="dashboard-panel"
            />
        );
    }

    return (
        <div className="space-y-5">
            <div className="grid gap-4 xl:grid-cols-[minmax(0,0.95fr),minmax(0,1.05fr)]">
                <DashboardInsetPanel
                    title="Сабак материалдары"
                    description="Бул жерде сессияга сакталган шилтемелер гана көрсөтүлөт. Материалдарды өзгөртүү үчүн сессияны түзөтүү формасын ачыңыз."
                    action={
                        <button
                            type="button"
                            onClick={onEditSession}
                            className="rounded-full border border-edubot-line bg-white px-3 py-1 text-xs font-semibold text-edubot-ink transition hover:border-edubot-orange/40 hover:text-edubot-orange dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                        >
                            Сессияны түзөтүү
                        </button>
                    }
                >
                    <div className="mt-4 space-y-3">
                        {selectedSessionMaterials.length ? (
                            selectedSessionMaterials.map((item, index) => (
                                <a
                                    key={`${item.url}-${index}`}
                                    href={item.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center justify-between rounded-2xl border border-edubot-line/70 bg-white px-4 py-3 text-sm transition hover:border-edubot-orange/40 dark:border-slate-700 dark:bg-slate-900"
                                >
                                    <div>
                                        <div className="font-medium text-edubot-ink dark:text-white">
                                            {item.title}
                                        </div>
                                        <div className="mt-1 text-xs text-edubot-muted dark:text-slate-400">
                                            {item.url}
                                        </div>
                                    </div>
                                    <FiExternalLink className="h-4 w-4 text-edubot-orange" />
                                </a>
                            ))
                        ) : (
                            <div className="rounded-2xl border border-dashed border-edubot-line/80 px-4 py-6 text-sm text-edubot-muted dark:border-slate-700 dark:text-slate-400">
                                Бул сессияга материал сакталган эмес.
                            </div>
                        )}
                    </div>
                </DashboardInsetPanel>

                {isOnlineLive ? (
                    <DashboardInsetPanel
                        title="Түз эфир сабак"
                        description="Сессияга байланган meeting шилтемесин сактап, сабак учурунда ошол эле жерден кириңиз."
                    >
                        <div className="mt-4 space-y-4">
                            <div className="grid gap-3 md:grid-cols-3">
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold uppercase tracking-[0.12em] text-edubot-muted dark:text-slate-400">
                                        Платформа
                                    </label>
                                    <select
                                        value={meetingProvider}
                                        onChange={(e) => setMeetingProvider(e.target.value)}
                                        className="dashboard-field dashboard-select"
                                    >
                                        {Object.values(MEETING_PROVIDER).map((provider) => (
                                            <option key={provider} value={provider}>
                                                {provider}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-xs font-semibold uppercase tracking-[0.12em] text-edubot-muted dark:text-slate-400">
                                        Join URL
                                    </label>
                                    <input
                                        value={meetingJoinUrl}
                                        onChange={(e) => setMeetingJoinUrl(e.target.value)}
                                        placeholder="https://..."
                                        className="dashboard-field"
                                    />
                                </div>
                            </div>

                            <div className="dashboard-panel-muted rounded-2xl px-4 py-3 text-sm">
                                <div className="font-medium text-edubot-ink dark:text-white">
                                    Активдүү шилтеме
                                </div>
                                <div className="mt-1 break-all text-edubot-muted dark:text-slate-400">
                                    {selectedSessionJoinUrl || 'Сакталган join URL жок'}
                                </div>
                                {meetingId && (
                                    <div className="mt-2 text-xs text-edubot-muted dark:text-slate-500">
                                        Meeting ID: {meetingId}
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-wrap gap-2">
                                <button
                                    onClick={saveMeetingLink}
                                    disabled={!selectedSessionId || savingMeeting}
                                    className="dashboard-button-primary disabled:opacity-60"
                                >
                                    {savingMeeting
                                        ? 'Сакталууда...'
                                        : meetingId
                                          ? 'Meeting жаңыртуу'
                                          : 'Meeting түзүү'}
                                </button>
                                <button
                                    onClick={() => joinLiveSession(meetingJoinUrl || selectedSessionJoinUrl)}
                                    disabled={
                                        !(meetingJoinUrl || selectedSessionJoinUrl) ||
                                        !selectedSessionJoinAllowed
                                    }
                                    className="dashboard-button-secondary disabled:opacity-60"
                                >
                                    Сабакка кирүү
                                </button>
                                <button
                                    onClick={removeMeeting}
                                    disabled={!selectedSessionId || deletingMeeting}
                                    className="rounded-full border border-red-300 px-4 py-2 text-sm font-semibold text-red-600 transition hover:border-red-400 disabled:opacity-60 dark:border-red-500/40 dark:text-red-300"
                                >
                                    {deletingMeeting ? 'Өчүрүлүүдө...' : 'Meeting өчүрүү'}
                                </button>
                            </div>

                            {!selectedSessionJoinAllowed && selectedSessionMode !== 'completed' && (
                                <div className="text-xs text-edubot-muted dark:text-slate-400">
                                    Join 10 мүнөт калганда гана жеткиликтүү.
                                </div>
                            )}
                        </div>
                    </DashboardInsetPanel>
                ) : (
                    <DashboardInsetPanel
                        title="Сессия форматы"
                        description="Бул сессия онлайн live эмес, ошондуктан meeting башкаруу бул жерде көрсөтүлбөйт."
                    >
                        <div className="mt-4 space-y-3">
                            <div className="dashboard-panel-muted rounded-2xl px-4 py-3 text-sm">
                                <div className="font-medium text-edubot-ink dark:text-white">
                                    Формат
                                </div>
                                <div className="mt-1 text-edubot-muted dark:text-slate-400">
                                    {selectedDeliveryType === COURSE_TYPE.OFFLINE
                                        ? 'Оффлайн сессия'
                                        : 'Live meeting талап кылынбайт'}
                                </div>
                            </div>
                            {selectedDeliveryType === COURSE_TYPE.OFFLINE && (
                                <div className="dashboard-panel-muted rounded-2xl px-4 py-3 text-sm">
                                    <div className="font-medium text-edubot-ink dark:text-white">
                                        Локация
                                    </div>
                                    <div className="mt-1 text-edubot-muted dark:text-slate-400">
                                        {selectedGroupLocation || 'Локация көрсөтүлгөн эмес'}
                                    </div>
                                </div>
                            )}
                        </div>
                    </DashboardInsetPanel>
                )}
            </div>

            {isOnlineLive && (
                <div className="grid gap-4 xl:grid-cols-[minmax(0,0.95fr),minmax(0,1.05fr)]">
                    <DashboardInsetPanel
                        title="Жазуу"
                        description="Сессияга сакталган recording шилтемеси ушул жерде көрүнөт. Zoom синхрондолсо session field дагы жаңыланат."
                    >
                        <div className="mt-4 space-y-4">
                            <div className="dashboard-panel-muted rounded-2xl px-4 py-3 text-sm">
                                <div className="font-medium text-edubot-ink dark:text-white">
                                    Жазуу шилтемеси
                                </div>
                                <div className="mt-1 break-all text-edubot-muted dark:text-slate-400">
                                    {selectedSessionRecordingUrl || 'Бул сессия үчүн recording шилтемеси жок'}
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                <button
                                    onClick={syncZoomRecordingsToSession}
                                    disabled={!selectedSessionId || syncingRecordings}
                                    className="dashboard-button-secondary disabled:opacity-60"
                                >
                                    {syncingRecordings ? 'Синхрондолууда...' : 'Zoom жазууларын синхрондоо'}
                                </button>
                                {selectedSessionRecordingUrl && (
                                    <a
                                        href={selectedSessionRecordingUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="dashboard-button-primary"
                                    >
                                        Recording ачуу
                                    </a>
                                )}
                            </div>
                        </div>
                    </DashboardInsetPanel>

                    <DashboardInsetPanel
                        title="Интеграция куралдары"
                        description="Бул util аракеттер сабак агымынан тышкары колдонулат. Көбүнчө Zoom импорт же калыбына келтирүү керек болгондо гана."
                    >
                        <div className="mt-4 flex flex-wrap gap-2">
                            <button
                                onClick={restoreMeetingState}
                                disabled={!selectedSessionId || loadingMeetingState}
                                className="dashboard-button-secondary disabled:opacity-60"
                            >
                                {loadingMeetingState ? 'Жүктөлүүдө...' : 'Meeting абалын жүктөө'}
                            </button>
                            <button
                                onClick={importZoomAttendanceToSession}
                                disabled={!selectedSessionId || importingAttendance}
                                className="dashboard-button-secondary disabled:opacity-60"
                            >
                                {importingAttendance ? 'Импорттолууда...' : 'Zoom катышууну импорттоо'}
                            </button>
                        </div>
                    </DashboardInsetPanel>
                </div>
            )}
        </div>
    );
};

SessionResourcesTab.propTypes = {
    deletingMeeting: PropTypes.bool.isRequired,
    importZoomAttendanceToSession: PropTypes.func.isRequired,
    importingAttendance: PropTypes.bool.isRequired,
    joinLiveSession: PropTypes.func.isRequired,
    loadingMeetingState: PropTypes.bool.isRequired,
    meetingId: PropTypes.string.isRequired,
    meetingJoinUrl: PropTypes.string.isRequired,
    meetingProvider: PropTypes.string.isRequired,
    onEditSession: PropTypes.func.isRequired,
    removeMeeting: PropTypes.func.isRequired,
    restoreMeetingState: PropTypes.func.isRequired,
    saveMeetingLink: PropTypes.func.isRequired,
    savingMeeting: PropTypes.bool.isRequired,
    selectedDeliveryType: PropTypes.string.isRequired,
    selectedGroupLocation: PropTypes.string,
    selectedSessionId: PropTypes.string,
    selectedSessionJoinAllowed: PropTypes.bool.isRequired,
    selectedSessionJoinUrl: PropTypes.string,
    selectedSessionMaterials: PropTypes.arrayOf(
        PropTypes.shape({
            title: PropTypes.string,
            url: PropTypes.string,
        })
    ).isRequired,
    selectedSessionMode: PropTypes.string.isRequired,
    selectedSessionRecordingUrl: PropTypes.string,
    setMeetingJoinUrl: PropTypes.func.isRequired,
    setMeetingProvider: PropTypes.func.isRequired,
    syncZoomRecordingsToSession: PropTypes.func.isRequired,
    syncingRecordings: PropTypes.bool.isRequired,
};

SessionResourcesTab.defaultProps = {
    selectedGroupLocation: '',
    selectedSessionId: '',
    selectedSessionJoinUrl: '',
    selectedSessionRecordingUrl: '',
};

export default SessionResourcesTab;
