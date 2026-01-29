const formatDuration = (value) => {
    if (!value || value <= 0) return '0 мүнөт';
    if (value < 1) {
        return `${Math.round(value * 100)} мүнөт`;
    }
    const hours = Math.floor(value);
    const minutes = Math.round((value - hours) * 60);
    if (minutes === 0) return `${hours} саат`;
    return `${hours} саат ${minutes} мүнөт`;
};

export default formatDuration;
