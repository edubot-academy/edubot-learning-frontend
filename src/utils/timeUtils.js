import i18n from '../i18n';

export function formatDuration(seconds) {
    if (!seconds || isNaN(seconds)) return null;

    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return i18n.t('timeUtils.minutesSecondsShort', { minutes: mins, seconds: secs });
}

export function formatSecondsToTime(seconds) {
    if (!seconds || isNaN(seconds)) return null;
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const paddedSecs = secs < 10 ? `0${secs}` : `${secs}`;
    return `${mins}:${paddedSecs}`;
}

export function formatMinutesToTime(minutes) {
    if (!minutes || minutes <= 0) return null;
    const h = Math.floor(minutes / 60);
    const m = Math.round(minutes % 60);

    if (h > 0 && m > 0) return i18n.t('timeUtils.hoursMinutesShort', { hours: h, minutes: m });
    if (h > 0) return i18n.t('timeUtils.hoursShort', { count: h });
    return i18n.t('timeUtils.minutesShort', { count: m });
}

export function formatHoursToTime(hours) {
    if (!hours || hours <= 0) return null;
    const totalMinutes = Math.round(hours * 60);
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;

    if (h > 0 && m > 0) return i18n.t('timeUtils.hoursMinutesShort', { hours: h, minutes: m });
    if (h > 0) return i18n.t('timeUtils.hoursShort', { count: h });
    return i18n.t('timeUtils.minutesShort', { count: m });
}
export function secondsToMinutesInput(seconds) {
    if (!seconds || Number.isNaN(Number(seconds))) return '';
    const minutes = Number(seconds) / 60;
    return Number(minutes.toFixed(2)).toString();
}

export function minutesInputToSeconds(minutes) {
    const parsed = Number(minutes);
    if (!Number.isFinite(parsed) || parsed <= 0) return 0;
    return Math.round(parsed * 60);
}
