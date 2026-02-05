import { useCallback, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { generateCourseSessions } from '@services/api';

const WEEKDAY_ORDER = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

const parseDays = (days = []) =>
    days
        .map((d) => d?.toLowerCase())
        .filter(Boolean)
        .sort((a, b) => WEEKDAY_ORDER.indexOf(a) - WEEKDAY_ORDER.indexOf(b));

const addHoursToTime = (startTime = '10:00', hours = 1) => {
    const [h, m] = startTime.split(':').map((v) => Number(v) || 0);
    const end = new Date();
    end.setHours(h);
    end.setMinutes(m + hours * 60);
    const hh = `${end.getHours()}`.padStart(2, '0');
    const mm = `${end.getMinutes()}`.padStart(2, '0');
    return `${hh}:${mm}`;
};

const DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
const DAY_TO_NUM = { sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6 };

const buildSessionsFromRange = (info, fallbackStartTime = '10:00') => {
    const start = info.startDate ? new Date(info.startDate) : null;
    const end = info.endDate ? new Date(info.endDate) : null;
    if (!start || !end || !info.daysOfWeek?.length) return [];

    const allowed = parseDays(info.daysOfWeek);
    const cursor = new Date(start);
    const sessions = [];

    while (cursor <= end) {
        const dayKey = DAY_KEYS[cursor.getDay()];
        if (allowed.includes(dayKey)) {
            const dateStr = cursor.toISOString().split('T')[0];
            const startTime =
                info.dayTimes?.[dayKey] ||
                info.defaultStartTime ||
                fallbackStartTime;
            sessions.push({
                id: `${dateStr}-${sessions.length + 1}`,
                date: dateStr,
                startTime,
                endTime: addHoursToTime(startTime, info.hoursPerDay || 1),
                title: `${info.title || 'Session'} ${sessions.length + 1}`,
                status: 'scheduled',
            });
        }
        cursor.setDate(cursor.getDate() + 1);
    }

    return sessions;
};

export const useSessions = (courseInfo) => {
    const [sessions, setSessions] = useState([]);
    const [sessionLoading, setSessionLoading] = useState(false);

    const estimatedSessions = useMemo(
        () => buildSessionsFromRange(courseInfo).length,
        [courseInfo]
    );

    const generateSessions = useCallback(
        async (courseId = null, mode = 'replace') => {
            if (!courseInfo.startDate || !courseInfo.endDate || !courseInfo.daysOfWeek?.length) {
                toast.error('Даталарды жана жуманын күндөрүн тандаңыз');
                return;
            }
            setSessionLoading(true);
            try {
                if (courseId) {
                    const data = await generateCourseSessions(courseId, {
                        startDate: courseInfo.startDate,
                        endDate: courseInfo.endDate,
                        daysOfWeek: courseInfo.daysOfWeek
                            .map((d) => (typeof d === 'number' ? d : DAY_TO_NUM[d] ?? d))
                            .filter((n) => typeof n === 'number'),
                        hoursPerDay: Number(courseInfo.hoursPerDay) || 1,
                        dailyStartTime: courseInfo.defaultStartTime,
                        titlePrefix: courseInfo.titlePrefix,
                        mode,
                    });
                    if (Array.isArray(data)) {
                        setSessions(data);
                        return data;
                    }
                }
                const built = buildSessionsFromRange(courseInfo);
                setSessions(built);
                return built;
            } catch (error) {
                console.error('Failed to generate sessions', error);
                toast.error('Сабак тизмесин түзүү мүмкүн болбоду');
                const fallback = buildSessionsFromRange(courseInfo);
                setSessions(fallback);
                return fallback;
            } finally {
                setSessionLoading(false);
            }
        },
        [courseInfo]
    );

    const updateSession = useCallback((id, patch) => {
        setSessions((prev) => prev.map((session) => (session.id === id ? { ...session, ...patch } : session)));
    }, []);

    const addSession = useCallback((payload) => {
        setSessions((prev) => [
            ...prev,
            {
                id: `${Date.now()}-${prev.length + 1}`,
                title: payload?.title || `Session ${prev.length + 1}`,
                date: payload?.date || new Date().toISOString().split('T')[0],
                startTime: payload?.startTime || '10:00',
                endTime: payload?.endTime || addHoursToTime(payload?.startTime, courseInfo.hoursPerDay),
                status: payload?.status || 'scheduled',
            },
        ]);
    }, [courseInfo.hoursPerDay]);

    const cancelSession = useCallback((id) => {
        updateSession(id, { status: 'cancelled' });
    }, [updateSession]);

    return {
        sessions,
        setSessions,
        sessionLoading,
        generateSessions,
        estimatedSessions,
        updateSession,
        addSession,
        cancelSession,
    };
};

export default useSessions;
