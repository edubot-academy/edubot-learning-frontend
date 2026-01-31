export function formatDuration(seconds) {
    if (!seconds || isNaN(seconds)) return null;

    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins} мүн ${secs} сек`;
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

    if (h > 0 && m > 0) return `${h} саат ${m} мин`;
    if (h > 0) return `${h} саат`;
    return `${m} мин`;
}

export function formatHoursToTime(hours) {
    if (!hours || hours <= 0) return null;
    const totalMinutes = Math.round(hours * 60);
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;

    if (h > 0 && m > 0) return `${h} саат ${m} мин`;
    if (h > 0) return `${h} саат`;
    return `${m} мин`;
}

export const formatMinutes = (value) => {
    if (!value || value <= 0) return '0 мүнөт';
    if (value < 1) {
        return `${Math.round(value * 100)} мүнөт`;
    }
    const hours = Math.floor(value);
    const minutes = Math.round((value - hours) * 60);
    if (minutes === 0) return `${hours} саат`;
    return `${hours} саат ${minutes} мүнөт`;
};
