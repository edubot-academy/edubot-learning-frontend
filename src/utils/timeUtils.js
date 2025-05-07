export function formatDuration(seconds) {
    if (!seconds || isNaN(seconds)) return null;

    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins} мүн ${secs} сек`;
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
