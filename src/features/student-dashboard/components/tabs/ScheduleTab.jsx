import { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
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
    formatCountdown,
    formatSessionDate,
    getStudentLiveRefreshInterval,
    resolveInstructorName,
    resolveRecordings,
} from '../../utils/studentDashboard.helpers.js';
import { getCourseTypeLabel } from '@shared/i18n/enumLabels';

const ScheduleTab = ({ offerings, recordings }) => {
    const { i18n, t } = useTranslation();
    const [nowMs, setNowMs] = useState(Date.now());
    const [selectedLiveId, setSelectedLiveId] = useState('');
    const [query, setQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');

    const liveRefreshInterval = useMemo(
        () => getStudentLiveRefreshInterval(offerings, nowMs),
        [offerings, nowMs]
    );

    useEffect(() => {
        const timer = setInterval(() => setNowMs(Date.now()), liveRefreshInterval);
        return () => clearInterval(timer);
    }, [liveRefreshInterval]);

    const scheduleItems = useMemo(
        () =>
            [...offerings]
                .sort((a, b) => new Date(a.startAt || 0).getTime() - new Date(b.startAt || 0).getTime())
                .map((item) => {
                    const type = resolveCourseType(item);
                    const joinUrl =
                        item.liveJoinUrl || item.joinLink || item.link || item.joinUrl || '';
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

    const getSessionTitle = useCallback(
        (item) =>
            item.sessionTitle ||
            item.title ||
            (Number.isFinite(Number(item.sessionIndex))
                ? t('studentDashboard.schedule.fallbacks.sessionNumber', {
                      number: Number(item.sessionIndex) + 1,
                  })
                : t('studentDashboard.schedule.fallbacks.session')),
        [t]
    );

    const getCourseTitle = useCallback(
        (item) =>
            item.courseTitle || item.course?.title || t('studentDashboard.schedule.fallbacks.course'),
        [t]
    );

    const getGroupTitle = useCallback((item) => item.groupName || item.group?.name || '', []);

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

            return [
                getSessionTitle(item),
                getCourseTitle(item),
                getGroupTitle(item),
                resolveInstructorName(item),
                item.location,
                item.room,
            ]
                .filter(Boolean)
                .some((value) => String(value).toLowerCase().includes(normalizedQuery));
        });
    }, [getCourseTitle, getGroupTitle, getSessionTitle, query, scheduleItems, typeFilter]);

    useEffect(() => {
        if (!filteredItems.length) {
            setSelectedLiveId('');
            return;
        }

        const hasSelected = filteredItems.some(
            ({ item, type }) => type === 'online_live' && String(item.id) === String(selectedLiveId)
        );
        if (hasSelected) return;

        const firstVisibleLive = filteredItems.find(({ type }) => type === 'online_live');
        setSelectedLiveId(firstVisibleLive?.item?.id ? String(firstVisibleLive.item.id) : '');
    }, [filteredItems, selectedLiveId]);

    const selectedLive = filteredItems.find(
        ({ item }) => String(item.id) === String(selectedLiveId)
    )?.item;

    const selectedRecordings = useMemo(() => {
        const merged = [
            ...resolveRecordings(selectedLive || {}),
            ...recordings.filter((rec) => {
                const recSessionId = rec.sessionId || rec.courseSessionId || rec.offeringId;
                const liveSessionId =
                    selectedLive?.sessionId || selectedLive?.id || selectedLive?.offeringId;
                return recSessionId && liveSessionId && String(recSessionId) === String(liveSessionId);
            }),
        ];

        const seen = new Set();
        return merged.filter((rec) => {
            const key = String(rec.id || rec.url || rec.title || '');
            if (!key || seen.has(key)) return false;
            seen.add(key);
            return true;
        });
    }, [recordings, selectedLive]);

    const selectedJoinUrl =
        selectedLive?.liveJoinUrl ||
        selectedLive?.joinLink ||
        selectedLive?.link ||
        selectedLive?.joinUrl ||
        '';
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
                    eyebrow={t('studentDashboard.schedule.eyebrow')}
                    title={t('studentDashboard.schedule.title')}
                    description={t('studentDashboard.schedule.emptyHeroDescription')}
                >
                <div className="p-6">
                    <StudentPanelEmpty
                        icon={FiCalendar}
                        title={t('studentDashboard.schedule.empty.title')}
                        description={t('studentDashboard.schedule.empty.description')}
                    />
                </div>
            </DashboardWorkspaceHero>
        );
    }

    return (
        <div className="space-y-6">
            <DashboardWorkspaceHero
                className="dashboard-panel"
                    eyebrow={t('studentDashboard.schedule.eyebrow')}
                    title={t('studentDashboard.schedule.heroTitle')}
                    description={t('studentDashboard.schedule.description')}
                    metrics={
                        <>
                            <DashboardMetricCard label={t('studentDashboard.schedule.metrics.total')} value={stats.total} icon={FiCalendar} />
                            <DashboardMetricCard label={t('studentDashboard.schedule.metrics.upcoming')} value={stats.upcoming} icon={FiClock} tone="blue" />
                            <DashboardMetricCard label={t('studentDashboard.schedule.metrics.live')} value={stats.live} icon={FiRadio} tone="green" />
                            <DashboardMetricCard label={t('studentDashboard.schedule.metrics.offline')} value={stats.offline} icon={FiMapPin} tone="amber" />
                        </>
                    }
                >
                <DashboardFilterBar gridClassName="lg:grid-cols-[minmax(0,1.4fr),minmax(0,0.8fr)]">
                    <label className="relative block">
                        <FiSearch className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-edubot-muted" />
                        <input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder={t('studentDashboard.schedule.searchPlaceholder')}
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
                            <option value="all">{t('studentDashboard.schedule.filters.allTypes')}</option>
                            <option value="offline">{t('studentDashboard.schedule.courseTypes.offline')}</option>
                            <option value="online_live">{t('studentDashboard.schedule.courseTypes.onlineLive')}</option>
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
                                                    {getSessionTitle(item)}
                                                </p>
                                                <StatusBadge tone="default">
                                                    {getCourseTypeLabel(type, t)}
                                                </StatusBadge>
                                                {isPast ? (
                                                    <StatusBadge tone="default">
                                                        {t('studentDashboard.schedule.statuses.past')}
                                                    </StatusBadge>
                                                ) : null}
                                            </div>

                                            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm text-edubot-muted dark:text-slate-400">
                                                <span className="inline-flex items-center gap-2">
                                                    <FiCalendar className="h-4 w-4" />
                                                    {formatSessionDate(item.startAt, {
                                                        language: i18n.language,
                                                        fallback: t('studentDashboard.schedule.fallbacks.unknownTime'),
                                                    })}
                                                </span>
                                                <span>{getCourseTitle(item)}</span>
                                                {getGroupTitle(item) ? <span>{getGroupTitle(item)}</span> : null}
                                                <span className="inline-flex items-center gap-2">
                                                    <FiUsers className="h-4 w-4" />
                                                    {resolveInstructorName(item)}
                                                </span>
                                                {type === 'offline' ? (
                                                    <span className="inline-flex items-center gap-2">
                                                        <FiMapPin className="h-4 w-4" />
                                                        {item.location ||
                                                            item.room ||
                                                            t('studentDashboard.schedule.fallbacks.classroom')}
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-2">
                                                        <FiVideo className="h-4 w-4" />
                                                        {t('studentDashboard.schedule.recordings.count', {
                                                            count: itemRecordings.length,
                                                        })}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="w-full lg:w-[18rem]">
                                            {type === 'online_live' ? (
                                                <div className="space-y-3">
                                                    <div className="rounded-2xl border border-edubot-line bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-900">
                                                        <div className="text-xs font-medium uppercase tracking-[0.14em] text-edubot-muted dark:text-slate-400">
                                                            {t('studentDashboard.schedule.live.startsIn')}
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
                                                                {t('studentDashboard.schedule.actions.joinLesson')}
                                                            </a>
                                                        ) : (
                                                            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
                                                                {t('studentDashboard.schedule.live.joinOpensSoon')}
                                                            </div>
                                                        )}

                                                        <button
                                                            type="button"
                                                            onClick={() => setSelectedLiveId(String(item.id))}
                                                            className="dashboard-button-secondary"
                                                        >
                                                            {t('studentDashboard.schedule.actions.livePanel')}
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="rounded-2xl border border-edubot-line bg-white px-4 py-3 text-sm text-edubot-muted dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                                                    {t('studentDashboard.schedule.offlineNotice')}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <StudentPanelEmpty
                                icon={FiSearch}
                                title={t('studentDashboard.schedule.empty.noResultTitle')}
                                description={t('studentDashboard.schedule.empty.noResultDescription')}
                            />
                        )}
                    </div>

                    <div className="space-y-4">
                        {selectedLive && resolveCourseType(selectedLive) === 'online_live' ? (
                            <DashboardInsetPanel
                                title={t('studentDashboard.schedule.live.panelTitle')}
                                description={getCourseTitle(selectedLive)}
                            >
                                <div className="space-y-4">
                                    <div className="rounded-panel bg-edubot-hero p-5 text-white shadow-edubot-glow">
                                        <div className="flex items-center justify-between gap-3">
                                            <div>
                                                <p className="dashboard-pill">{t('studentDashboard.schedule.live.sessionPill')}</p>
                                                <p className="mt-4 text-lg font-semibold">
                                                    {getSessionTitle(selectedLive)}
                                                </p>
                                                {getGroupTitle(selectedLive) ? (
                                                    <p className="mt-2 text-sm text-white/80">
                                                        {getGroupTitle(selectedLive)}
                                                    </p>
                                                ) : null}
                                            </div>
                                            <FiRadio className="h-6 w-6 text-edubot-soft" />
                                        </div>
                                        <div className="mt-4 text-sm text-white/80">
                                            {t('studentDashboard.schedule.live.remainingTime')}{' '}
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
                                            {t('studentDashboard.schedule.actions.joinLesson')}
                                        </a>
                                    ) : (
                                        <button
                                            type="button"
                                            disabled
                                            className="dashboard-button-secondary w-full cursor-not-allowed opacity-60"
                                        >
                                            {t('studentDashboard.schedule.actions.joinLesson')}
                                        </button>
                                    )}

                                    <div className="space-y-2">
                                        <p className="font-medium text-edubot-ink dark:text-white">
                                            {t('studentDashboard.schedule.recordings.title')}
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
                                                    {rec.title || t('studentDashboard.schedule.recordings.fallback')}
                                                </a>
                                            ))
                                        ) : (
                                            <div className="rounded-2xl border border-edubot-line/70 bg-white/80 px-4 py-3 text-sm text-edubot-muted dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
                                                {t('studentDashboard.schedule.recordings.empty')}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </DashboardInsetPanel>
                        ) : (
                            <DashboardInsetPanel
                                title={t('studentDashboard.schedule.live.focusTitle')}
                                description={t('studentDashboard.schedule.live.focusDescription')}
                            >
                                <div className="text-sm text-edubot-muted dark:text-slate-400">
                                    {t('studentDashboard.schedule.live.noSelection')}
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
