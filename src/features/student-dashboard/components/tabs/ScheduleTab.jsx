import { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
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

    useEffect(() => {
        const timer = setInterval(() => setNowMs(Date.now()), 1000);
        return () => clearInterval(timer);
    }, []);

    const sorted = useMemo(
        () =>
            [...offerings].sort(
                (a, b) => new Date(a.startAt || 0).getTime() - new Date(b.startAt || 0).getTime()
            ),
        [offerings]
    );

    useEffect(() => {
        if (selectedLiveId) return;
        const firstLive = sorted.find((item) => resolveCourseType(item) === 'online_live');
        if (firstLive?.id) setSelectedLiveId(String(firstLive.id));
    }, [sorted, selectedLiveId]);

    if (!sorted.length) {
        return (
            <div className="bg-white dark:bg-[#222222] rounded-3xl border border-gray-100 dark:border-gray-800 p-6 text-center text-gray-500 dark:text-gray-400">
                Жакынкы класстар табылган жок.
            </div>
        );
    }

    const selectedLive = sorted.find((item) => String(item.id) === String(selectedLiveId));
    const selectedRecordings = [
        ...resolveRecordings(selectedLive || {}),
        ...recordings.filter((rec) => {
            const recSessionId = rec.sessionId || rec.courseSessionId || rec.offeringId;
            const liveSessionId = selectedLive?.sessionId || selectedLive?.id || selectedLive?.offeringId;
            return recSessionId && liveSessionId && String(recSessionId) === String(liveSessionId);
        }),
    ];
    const selectedJoinUrl =
        selectedLive?.joinLink || selectedLive?.link || selectedLive?.joinUrl || '';
    const selectedJoinAllowed = !selectedLive || isStudentJoinWindowOpen(selectedLive, nowMs);

    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Жүгүртмө</h2>
            <div className="space-y-3">
                {sorted.map((item) => {
                    const type = resolveCourseType(item);
                    const joinUrl = item.joinLink || item.link || item.joinUrl || '';
                    const joinAllowed =
                        !isOnlineLiveOffering(item) || isStudentJoinWindowOpen(item, nowMs);
                    const recordings = resolveRecordings(item);
                    return (
                        <div
                            key={item.id || `${item.courseId}-${item.startAt}`}
                            className="bg-white dark:bg-gray-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div>
                                    <p className="font-semibold text-gray-900 dark:text-[#E8ECF3]">
                                        {item.courseTitle || item.course?.title || 'Class'}

                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {formatSessionDate(item.startAt)}
                                    </p>
                                </div>
                                <span className="text-[11px] px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                                    {courseTypeLabel(type)}
                                </span>
                            </div>
                            {type === 'offline' && (
                                <div className="mt-2 text-sm text-gray-500">
                                    <p>Жайгашкан жери: {item.location || item.room || 'Класс али дайындала элек'}</p>
                                    <p>Мугалим: {resolveInstructorName(item)}</p>
                                    <p>Жүгүртмө: {formatSessionDate(item.startAt)}</p>
                                </div>
                            )}
                            {type === 'online_live' && (
                                <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                                    <span className="text-blue-700 dark:text-blue-300">
                                        Калган убакыт:{' '}
                                        {item.startAt
                                            ? formatCountdown(
                                                new Date(item.startAt).getTime(),
                                                nowMs
                                            )
                                            : '--:--:--'}
                                    </span>
                                    {joinUrl && joinAllowed ? (
                                        <a
                                            href={joinUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-3 py-1 rounded-full bg-blue-600 text-white text-xs"
                                        >
                                            Сабакка кошулуу
                                        </a>
                                    ) : (
                                        <span className="text-xs text-amber-600">
                                            Join 10 мүнөт мурун ачылат
                                        </span>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => setSelectedLiveId(String(item.id))}
                                        className="px-3 py-1 rounded-full border text-xs text-gray-600 dark:text-gray-300 dark:border-gray-700 hover:border-edubot-orange hover:text-edubot-orange hover:bg-edubot-orange/10 transition-all duration-300 transform hover:scale-105 hover:shadow-md group"
                                    >
                                        <span className="transition-transform duration-300 group-hover:scale-110">
                                            🔴 Түз эфир барагы
                                        </span>
                                    </button>
                                    <span className="text-xs text-gray-500">
                                        Жазуулар: {recordings.length}
                                    </span>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {selectedLive && resolveCourseType(selectedLive) === 'online_live' && (
                <section className="bg-white dark:bg-[#222222] rounded-3xl border border-gray-100 dark:border-gray-800 p-5 space-y-3">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-[#E8ECF3]">
                        Түз эфир сабак барагы
                    </h3>
                    <p className="text-sm text-gray-500">
                        {selectedLive.courseTitle || selectedLive.course?.title}
                    </p>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                        Калган убакыт:{' '}
                        {selectedLive.startAt
                            ? formatCountdown(new Date(selectedLive.startAt).getTime(), nowMs)
                            : '--:--:--'}
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                        {selectedJoinUrl && selectedJoinAllowed ? (
                            <a
                                href={selectedJoinUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-4 py-2 rounded-full bg-blue-600 text-white text-sm"
                            >
                                Сабакка кошулуу
                            </a>
                        ) : (
                            <button
                                type="button"
                                disabled
                                className="px-4 py-2 rounded-full border text-sm text-gray-400 cursor-not-allowed"
                            >
                                Сабакка кошулуу
                            </button>
                        )}
                    </div>
                    <div className="space-y-2">
                        <p className="font-medium text-gray-900 dark:text-[#E8ECF3]">Жазуулар</p>
                        {selectedRecordings.length ? (
                            selectedRecordings.map((rec) => (
                                <a
                                    key={rec.id || rec.url}
                                    href={rec.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block text-sm text-blue-600 dark:text-blue-400 underline"
                                >
                                    {rec.title || 'Жазуу'}
                                </a>
                            ))
                        ) : (
                            <p className="text-sm text-gray-500">Азырынча жазуу жок.</p>
                        )}
                    </div>
                </section>
            )}
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
