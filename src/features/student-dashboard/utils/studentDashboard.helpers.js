import { JOIN_WINDOW_MS } from './studentDashboard.constants.js';

const formatNotificationLabel = (key) =>
    key
        ?.replace(/([A-Z])/g, ' $1')
        ?.replace(/_/g, ' ')
        ?.replace(/\b\w/g, (l) => l.toUpperCase())
        ?.trim() || key;

const isOnlineLiveOffering = (offering) => {
    const type = String(offering?.courseType || offering?.type || '').toLowerCase();
    const modality = String(offering?.modality || offering?.modalityLabel || '').toLowerCase();
    return type === 'online_live' || modality.includes('online') || modality.includes('live');
};

const isStudentJoinWindowOpen = (offering, nowMs) => {
    const startMs = offering?.startAt ? new Date(offering.startAt).getTime() : null;
    const endMs = offering?.endAt ? new Date(offering.endAt).getTime() : null;
    if (!startMs || Number.isNaN(startMs)) return true;
    if (!endMs || Number.isNaN(endMs)) return nowMs >= startMs - JOIN_WINDOW_MS;
    return nowMs >= startMs - JOIN_WINDOW_MS && nowMs <= endMs;
};

const resolveCourseType = (item = {}) =>
    item.courseType || item.type || item.course?.courseType || item.course?.type || 'video';

const isOfflineOrLiveCourse = (item = {}) => {
    const type = String(resolveCourseType(item)).toLowerCase();
    return type === 'offline' || type === 'online_live';
};

const courseTypeLabel = (type) => {
    if (type === 'offline') return 'Оффлайн';
    if (type === 'online_live') return 'Онлайн түз эфир';
    return 'Видео';
};

const formatCountdown = (targetMs, nowMs) => {
    const totalSeconds = Math.max(0, Math.floor((targetMs - nowMs) / 1000));
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(
        seconds
    ).padStart(2, '0')}`;
};

const formatSessionDate = (isoValue) => {
    if (!isoValue) return 'Белгисиз убакыт';
    const date = new Date(isoValue);
    if (Number.isNaN(date.getTime())) return 'Белгисиз убакыт';
    return date.toLocaleString('ru-RU', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
    });
};

const resolveInstructorName = (item = {}) =>
    item.instructorName ||
    item.teacherName ||
    item.instructor?.fullName ||
    item.teacher ||
    'Инструктор';

const resolveRecordings = (item = {}) => {
    if (Array.isArray(item.recordings)) return item.recordings;
    if (item.recordingUrl) {
        return [
            {
                id: `rec-${item.id || '1'}`,
                title: item.recordingTitle || 'Сабактын жазуусу',
                url: item.recordingUrl,
            },
        ];
    }
    return [];
};

const readNumber = (obj, paths = []) => {
    for (const path of paths) {
        const value = path.split('.').reduce((acc, key) => acc?.[key], obj);
        const numeric = Number(value);
        if (Number.isFinite(numeric)) return numeric;
    }
    return null;
};

const readArray = (obj, paths = []) => {
    for (const path of paths) {
        const value = path.split('.').reduce((acc, key) => acc?.[key], obj);
        if (Array.isArray(value)) return value;
    }
    return [];
};

const toItems = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.items)) return payload.items;
    if (Array.isArray(payload?.data)) return payload.data;
    return [];
};

const getTaskKey = (task = {}) =>
    String(
        task.id ||
        task.taskId ||
        `${task.sessionId || task.courseSessionId || 'task'}:${task.homeworkId || ''}`
    );

const resolveSessionHomeworkIds = (task = {}) => {
    const sessionRaw = task.sessionId || task.courseSessionId || task.session?.id;
    const homeworkRaw = task.homeworkId || task.id || task.taskId;

    const sessionId = Number(sessionRaw);
    const homeworkId = Number(homeworkRaw);

    return {
        sessionId: Number.isInteger(sessionId) && sessionId > 0 ? sessionId : null,
        homeworkId: Number.isInteger(homeworkId) && homeworkId > 0 ? homeworkId : null,
    };
};

export {
    formatNotificationLabel,
    isOnlineLiveOffering,
    isStudentJoinWindowOpen,
    resolveCourseType,
    isOfflineOrLiveCourse,
    courseTypeLabel,
    formatCountdown,
    formatSessionDate,
    resolveInstructorName,
    resolveRecordings,
    readNumber,
    readArray,
    toItems,
    getTaskKey,
    resolveSessionHomeworkIds,
};
