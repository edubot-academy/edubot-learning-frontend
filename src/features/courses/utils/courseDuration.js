export const getLessonDurationSeconds = (lesson) => {
    const duration = Number(lesson?.duration);
    return Number.isFinite(duration) && duration > 0 ? duration : 0;
};

export const getSectionDurationSeconds = (section) =>
    (section?.lessons || []).reduce(
        (total, lesson) => total + getLessonDurationSeconds(lesson),
        0
    );

export const getSectionDurationMinutes = (section) => {
    const totalSeconds = getSectionDurationSeconds(section);
    if (totalSeconds > 0) return Math.round(totalSeconds / 60);

    const fallbackMinutes = Number(section?.durationMinutes);
    return Number.isFinite(fallbackMinutes) && fallbackMinutes > 0 ? fallbackMinutes : 0;
};

export const getSectionsDurationMinutes = (sections = []) => {
    const normalizedSections = Array.isArray(sections) ? sections : [];
    const totalSeconds = normalizedSections.reduce(
        (total, section) => total + getSectionDurationSeconds(section),
        0
    );

    if (totalSeconds > 0) return Math.round(totalSeconds / 60);

    return normalizedSections.reduce(
        (total, section) => total + getSectionDurationMinutes(section),
        0
    );
};
