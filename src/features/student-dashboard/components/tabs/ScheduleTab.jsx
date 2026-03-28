import { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import {
    FiCalendar,
    FiClock,
    FiFilter,
    FiMapPin,
    FiPlayCircle,
    FiRadio,
    FiSearch,
    FiUsers,
    FiVideo,
} from 'react-icons/fi';
import {
    DashboardFilterBar,
    DashboardInsetPanel,
    DashboardMetricCard,
    DashboardWorkspaceHero,
    StatusBadge,
} from '../../../../components/ui/dashboard';
import StudentPanelEmpty from '../shared/StudentPanelEmpty.jsx';
import {
    resolveCourseType,
    isOnlineLiveOffering,
    isStudentJoinWindowOpen,
    courseTypeLabel,
    formatCountdown,
    formatSessionDate,
    resolveInstructorName,
    resolveRecordings,
} from '../../utils/studentDashboard.helpers.js';

const ScheduleTab = ({ offerings, recordings }) => {
    const [nowMs, setNowMs] = useState(Date.now());
    const [selectedLiveId, setSelectedLiveId] = useState('');
    const [query, setQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');

    useEffect(() => {
        const timer = setInterval(() => setNowMs(Date.now()), 1000);
        return () => clearInterval(timer);
    }, []);

    const scheduleItems = useMemo(
        () =>
            [...offerings]
                .sort((a, b) => new Date(a.startAt || 0).getTime() - new Date(b.startAt || 0).getTime())
                .map((item) => {
                    const type = resolveCourseType(item);
                    const joinUrl = item.joinLink || item.link || item.joinUrl || '';
                    const joinAllowed =
                        !isOnlineLiveOffering(item) || isStudentJoinWindowOpen(item, nowMs);
                    const itemRecordings = resolveRecordings(item);
                    const isPast =
                        item.startAt && new Date(item.startAt).getTime() < nowMs;

                    return {
                        item,
                        type,
                        joinUrl,
                        joinAllowed,
                        itemRecordings,
                        isPast,
                    };
                }),
        [offerings, nowMs]
    );

    useEffect(() => {
        if (selectedLiveId) return;
        const firstLive = scheduleItems.find((entry) => entry.type === 'online_live');
        if (firstLive?.item?.id) setSelectedLiveId(String(firstLive.item.id));
    }, [scheduleItems, selectedLiveId]);

    const filteredItems = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase();

        return scheduleItems.filter(({ item, type }) => {
            if (typeFilter !== 'all' && type !== typeFilter) return false;
            if (!normalizedQuery) return true;

            return [item.courseTitle, item.course?.title, resolveInstructorName(item), item.location, item.room]
                .filter(Boolean)
                .some((value) => String(value).toLowerCase().includes(normalizedQuery));
        });
    }, [query, scheduleItems, typeFilter]);

    const selectedLive = scheduleItems.find(
        ({ item }) => String(item.id) === String(selectedLiveId)
    )?.item;

    const selectedRecordings = [
        ...resolveRecordings(selectedLive || {}),
        ...recordings.filter((rec) => {
            const recSessionId = rec.sessionId || rec.courseSessionId || rec.offeringId;
            const liveSessionId =
                selectedLive?.sessionId || selectedLive?.id || selectedLive?.offeringId;
            return recSessionId && liveSessionId && String(recSessionId) === String(liveSessionId);
        }),
    ];

    const selectedJoinUrl = selectedLive?.joinLink || selectedLive?.link || selectedLive?.joinUrl || '';
    const selectedJoinAllowed = !selectedLive || isStudentJoinWindowOpen(selectedLive, nowMs);

    const stats = useMemo(() => {
        const total = scheduleItems.length;
        const live = scheduleItems.filter((entry) => entry.type === 'online_live').length;
        const offline = scheduleItems.filter((entry) => entry.type === 'offline').length;
        const upcoming = scheduleItems.filter((entry) => !entry.isPast).length;
        return { total, live, offline, upcoming };
    }, [scheduleItems]);

    if (!scheduleItems.length) {
        return (
            <DashboardWorkspaceHero
                className="dashboard-panel"
                    eyebrow="Schedule"
                    title="Жүгүртмө"
                    description="Жакынкы сабактар, live терезелер жана жазуулар ушул жерде көрсөтүлөт."
                >
                <div className="p-6">
                    <StudentPanelEmpty
                        icon={FiCalendar}
                        title="Жакынкы класстар табылган жок"
                        description="Сессиялар пайда болгондо, алар бул жерде топтолуп көрүнөт."
                    />
                </div>
            </DashboardWorkspaceHero>
        );
    }

    return (
        <div className="space-y-6">
            <DashboardWorkspaceHero
                className="dashboard-panel"
                    eyebrow="Schedule"
                    title="Жүгүртмө жана live сессиялар"
                    description="Кийинки сабактарды, кошулуу мүмкүнчүлүгүн жана жазууларды бир экрандан көрүңүз."
                    metrics={
                        <>
                            <DashboardMetricCard label="Жалпы" value={stats.total} icon={FiCalendar} />
                            <DashboardMetricCard label="Upcoming" value={stats.upcoming} icon={FiClock} tone="blue" />
                            <DashboardMetricCard label="Live" value={stats.live} icon={FiRadio} tone="green" />
                            <DashboardMetricCard label="Offline" value={stats.offline} icon={FiMapPin} tone="amber" />
                        </>
                    }
                >
                <DashboardFilterBar gridClassName="lg:grid-cols-[minmax(0,1.4fr),minmax(0,0.8fr)]">
                    <label className="relative block">
                        <FiSearch className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-edubot-muted" />
                        <input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Курс, мугалим же жайгашкан жер боюнча издөө"
                            className="dashboard-field dashboard-field-icon"
                        />
                    </label>

                    <label className="relative block">
                        <FiFilter className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-edubot-muted" />
                        <select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            className="dashboard-field dashboard-field-icon dashboard-select"
                        >
                            <option value="all">Бардык типтер</option>
                            <option value="video">Видео</option>
                            <option value="offline">Оффлайн</option>
                            <option value="online_live">Онлайн түз эфир</option>
                        </select>
                    </label>
                </DashboardFilterBar>

                <div className="grid gap-4 pt-5 xl:grid-cols-[minmax(0,1.35fr),minmax(0,0.65fr)]">
                    <div className="space-y-3">
                        {filteredItems.length ? (
                            filteredItems.map(({ item, type, joinUrl, joinAllowed, itemRecordings, isPast }) => (
                                <div
                                    key={item.id || `${item.courseId}-${item.startAt}`}
                                    className="dashboard-panel-muted p-4"
                                >
                                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <p className="text-base font-semibold text-edubot-ink dark:text-white">
                                                    {item.courseTitle || item.course?.title || 'Class'}
                                                </p>
                                                <StatusBadge tone="default">
                                                    {courseTypeLabel(type)}
                                                </StatusBadge>
                                                {isPast ? (
                                                    <StatusBadge tone="default">
                                                        Өтүп кетти
                                                    </StatusBadge>
                                                ) : null}
                                            </div>

                                            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm text-edubot-muted dark:text-slate-400">
                                                <span className="inline-flex items-center gap-2">
                                                    <FiCalendar className="h-4 w-4" />
                                                    {formatSessionDate(item.startAt)}
                                                </span>
                                                <span className="inline-flex items-center gap-2">
                                                    <FiUsers className="h-4 w-4" />
                                                    {resolveInstructorName(item)}
                                                </span>
                                                {type === 'offline' ? (
                                                    <span className="inline-flex items-center gap-2">
                                                        <FiMapPin className="h-4 w-4" />
                                                        {item.location || item.room || 'Класс али дайындала элек'}
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-2">
                                                        <FiVideo className="h-4 w-4" />
                                                        Жазуулар: {itemRecordings.length}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="w-full lg:w-[18rem]">
                                            {type === 'online_live' ? (
                                                <div className="space-y-3">
                                                    <div className="rounded-2xl border border-edubot-line bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-900">
                                                        <div className="text-xs font-medium uppercase tracking-[0.14em] text-edubot-muted dark:text-slate-400">
                                                            Башталышына
                                                        </div>
                                                        <div className="mt-2 text-xl font-semibold text-edubot-ink dark:text-white">
                                                            {item.startAt
                                                                ? formatCountdown(
                                                                      new Date(item.startAt).getTime(),
                                                                      nowMs
                                                                  )
                                                                : '--:--:--'}
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-col gap-2">
                                                        {joinUrl && joinAllowed ? (
                                                            <a
                                                                href={joinUrl}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="dashboard-button-primary w-full"
                                                            >
                                                                <FiPlayCircle className="h-4 w-4" />
                                                                Сабакка кошулуу
                                                            </a>
                                                        ) : (
                                                            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
                                                                Join 10 мүнөт мурун ачылат
                                                            </div>
                                                        )}

                                                        <button
                                                            type="button"
                                                            onClick={() => setSelectedLiveId(String(item.id))}
                                                            className="dashboard-button-secondary"
                                                        >
                                                            Түз эфир панели
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="rounded-2xl border border-edubot-line bg-white px-4 py-3 text-sm text-edubot-muted dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                                                    Offline сессия. Келүү убактысын жана жайгашкан жерди алдын ала текшериңиз.
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <StudentPanelEmpty
                                icon={FiSearch}
                                title="Сессия табылган жок"
                                description="Издөө же фильтрди өзгөртүп көрүңүз."
                            />
                        )}
                    </div>

                    <div className="space-y-4">
                        {selectedLive && resolveCourseType(selectedLive) === 'online_live' ? (
                            <DashboardInsetPanel
                                title="Түз эфир сабак барагы"
                                description={selectedLive.courseTitle || selectedLive.course?.title}
                            >
                                <div className="space-y-4">
                                    <div className="rounded-panel bg-edubot-hero p-5 text-white shadow-edubot-glow">
                                        <div className="flex items-center justify-between gap-3">
                                            <div>
                                                <p className="dashboard-pill">Live Session</p>
                                                <p className="mt-4 text-lg font-semibold">
                                                    {selectedLive.courseTitle ||
                                                        selectedLive.course?.title}
                                                </p>
                                            </div>
                                            <FiRadio className="h-6 w-6 text-edubot-soft" />
                                        </div>
                                        <div className="mt-4 text-sm text-white/80">
                                            Калган убакыт:{' '}
                                            <span className="font-semibold text-white">
                                                {selectedLive.startAt
                                                    ? formatCountdown(
                                                          new Date(selectedLive.startAt).getTime(),
                                                          nowMs
                                                      )
                                                    : '--:--:--'}
                                            </span>
                                        </div>
                                    </div>

                                    {selectedJoinUrl && selectedJoinAllowed ? (
                                        <a
                                            href={selectedJoinUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="dashboard-button-primary w-full"
                                        >
                                            <FiPlayCircle className="h-4 w-4" />
                                            Сабакка кошулуу
                                        </a>
                                    ) : (
                                        <button
                                            type="button"
                                            disabled
                                            className="dashboard-button-secondary w-full cursor-not-allowed opacity-60"
                                        >
                                            Сабакка кошулуу
                                        </button>
                                    )}

                                    <div className="space-y-2">
                                        <p className="font-medium text-edubot-ink dark:text-white">
                                            Жазуулар
                                        </p>
                                        {selectedRecordings.length ? (
                                            selectedRecordings.map((rec) => (
                                                <a
                                                    key={rec.id || rec.url}
                                                    href={rec.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="block rounded-2xl border border-edubot-line/70 bg-white/80 px-4 py-3 text-sm font-medium text-edubot-ink transition hover:border-edubot-orange hover:text-edubot-orange dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                                                >
                                                    {rec.title || 'Жазуу'}
                                                </a>
                                            ))
                                        ) : (
                                            <div className="rounded-2xl border border-edubot-line/70 bg-white/80 px-4 py-3 text-sm text-edubot-muted dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
                                                Азырынча жазуу жок.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </DashboardInsetPanel>
                        ) : (
                            <DashboardInsetPanel
                                title="Түз эфир фокусу"
                                description="Онлайн түз эфир сессияны тандасаңыз, бул жерден join жана recording башкарылат."
                            >
                                <div className="text-sm text-edubot-muted dark:text-slate-400">
                                    Азырынча тандалган live сессия жок.
                                </div>
                            </DashboardInsetPanel>
                        )}
                    </div>
                </div>
            </DashboardWorkspaceHero>
        </div>
    );
};

ScheduleTab.propTypes = {
    offerings: PropTypes.arrayOf(PropTypes.object).isRequired,
    recordings: PropTypes.arrayOf(PropTypes.object),
};

ScheduleTab.defaultProps = {
    recordings: [],
};

export default ScheduleTab;
