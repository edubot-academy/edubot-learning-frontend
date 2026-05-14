import {
    COURSE_SESSION_STATUS,
    COURSE_TYPE,
} from '@shared/contracts';

export const JOIN_WINDOW_MS = 10 * 60 * 1000;

export const QUICK_SESSION_DEFAULT = {
    sessionIndex: '',
    title: '',
    startsAt: '',
    endsAt: '',
    status: COURSE_SESSION_STATUS.SCHEDULED,
    recordingUrl: '',
    materialTitle: '',
    materialUrl: '',
};

export const EDIT_SESSION_DEFAULT = {
    sessionIndex: '',
    title: '',
    startsAt: '',
    endsAt: '',
    status: COURSE_SESSION_STATUS.SCHEDULED,
    recordingUrl: '',
};

export const SESSION_WORKSPACE_TABS = [
    { id: 'attendance', label: 'Катышуу' },
    { id: 'materials', label: 'Ресурстар' },
    { id: 'homework', label: 'Үй тапшырма' },
    { id: 'activities', label: 'Иштер' },
    { id: 'notes', label: 'Жазуулар' },
    { id: 'engagement', label: 'Кийинки аракеттер' },
];

export const toLocalDateKey = (value) => {
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return '';

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export const toArray = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.items)) return payload.items;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.courses)) return payload.courses;
    return [];
};

export const getNextSessionIndex = (sessionList = []) => {
    const maxSessionIndex = sessionList.reduce((maxValue, session) => {
        const parsedIndex = Number(session?.sessionIndex);
        if (!Number.isFinite(parsedIndex)) return maxValue;
        return Math.max(maxValue, parsedIndex);
    }, 0);

    return String(maxSessionIndex + 1);
};

export const toSessionTime = (isoValue) => {
    if (!isoValue) return '-';
    const d = new Date(isoValue);
    if (Number.isNaN(d.getTime())) return '-';
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

export const toInputDateTime = (isoValue) => {
    if (!isoValue) return '';
    const date = new Date(isoValue);
    if (Number.isNaN(date.getTime())) return '';
    const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 16);
};

export const getNextSessionDateTime = (group) => {
    if (!group) return { startsAt: '', endsAt: '' };

    if (group.scheduleBlocks && group.scheduleBlocks.length > 0) {
        const now = new Date();
        const dayOfWeek = now.getDay();
        const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const currentDay = dayNames[dayOfWeek];

        const todaySchedule = group.scheduleBlocks.find(block => block.day.toLowerCase() === currentDay);

        if (todaySchedule) {
            const [startHour, startMinute] = todaySchedule.startTime.split(':').map(Number);
            const [endHour, endMinute] = todaySchedule.endTime.split(':').map(Number);

            const sessionStart = new Date();
            sessionStart.setHours(startHour, startMinute, 0, 0);
            const sessionEnd = new Date();
            sessionEnd.setHours(endHour, endMinute, 0, 0);

            if (sessionStart <= now) {
                sessionStart.setDate(sessionStart.getDate() + 7);
                sessionEnd.setDate(sessionEnd.getDate() + 7);
            }

            return {
                startsAt: toInputDateTime(sessionStart.toISOString()),
                endsAt: toInputDateTime(sessionEnd.toISOString()),
            };
        }
    }

    const fallbackStart = new Date();
    fallbackStart.setDate(fallbackStart.getDate() + 1);
    fallbackStart.setHours(14, 0, 0, 0);

    const fallbackEnd = new Date(fallbackStart);
    fallbackEnd.setHours(16, 0, 0, 0);

    return {
        startsAt: toInputDateTime(fallbackStart.toISOString()),
        endsAt: toInputDateTime(fallbackEnd.toISOString()),
    };
};

export const resolveSessionJoinUrl = (session) =>
    session?.liveJoinUrl ||
    session?.joinUrl ||
    '';

export const formatCountdown = (targetMs, nowMs) => {
    const remaining = Math.max(0, targetMs - nowMs);
    const totalSeconds = Math.floor(remaining / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(
        seconds
    ).padStart(2, '0')}`;
};

export const formatDisplayDate = (value, fallback = 'Мөөнөт коюлган эмес') => {
    if (!value) return fallback;
    const normalized =
        typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T12:00:00` : value;
    const date = new Date(normalized);
    if (Number.isNaN(date.getTime())) return fallback;
    return date.toLocaleDateString('ky-KG', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
};

export const resolveHomeworkDeadline = (item = {}) => item?.deadline || item?.dueAt || item?.dueDate || '';

export const getSubmissionPreview = (submission) =>
    submission?.content ||
    submission?.submissionText ||
    submission?.text ||
    submission?.answerText ||
    submission?.description ||
    submission?.answer ||
    submission?.note ||
    submission?.comment ||
    submission?.fileUrl ||
    submission?.attachmentUrl ||
    submission?.submissionUrl ||
    'Жооп текшерүү үчүн жүктөлгөн.';

export const getSubmissionAttachmentUrl = (submission) =>
    submission?.attachmentUrl || submission?.fileUrl || submission?.submissionUrl || '';

export const getAttachmentName = (value) => {
    if (!value) return 'Тиркеме';
    try {
        const withoutQuery = String(value).split('?')[0];
        const lastSegment = withoutQuery.split('/').pop() || withoutQuery;
        return decodeURIComponent(lastSegment) || 'Тиркеме';
    } catch {
        return 'Тиркеме';
    }
};

export const isJoinWindowOpen = (session, nowMs) => {
    const start = session?.startsAt ? new Date(session.startsAt).getTime() : null;
    const end = session?.endsAt ? new Date(session.endsAt).getTime() : null;
    if (!start || !end) return false;
    return nowMs >= start - JOIN_WINDOW_MS && nowMs <= end;
};

export const normalizeCourseType = (course, session, group) =>
    course?.courseType ||
    course?.type ||
    session?.course?.courseType ||
    group?.course?.courseType ||
    COURSE_TYPE.VIDEO;

export const getCourseTypeLabel = (type) => {
    if (type === COURSE_TYPE.OFFLINE) return 'Оффлайн';
    if (type === COURSE_TYPE.ONLINE_LIVE) return 'Онлайн түз эфир';
    return 'Видео курс';
};

export const getWorkspaceErrorMessage = (error, fallback) => {
    const status = error?.response?.status;
    if (status === 401) return 'Сессия мөөнөтү бүттү. Кайра кириңиз.';
    if (status === 403) return 'Бул курс, группа же сессия сизге бекитилген эмес.';
    const message = error?.response?.data?.message || error?.message || fallback;
    return Array.isArray(message) ? message.join(', ') : message;
};
