export function formatReadTime(seconds) {
    if (!seconds || isNaN(seconds)) return null;

    const minutes = Math.max(1, Math.round(Number(seconds) / 60));
    return `${minutes} мин окуу`;
}

export function getResourceMeta(resourceKey = '', resourceName = '') {
    if (!resourceKey && !resourceName) return null;

    const fallbackName = resourceKey ? resourceKey.split('/').pop() || resourceKey : '';
    const displayName = resourceName?.trim() || fallbackName;

    if (!displayName) return null;

    const nameForExtension =
        (resourceName && resourceName.includes('.')) ? resourceName : fallbackName;

    const lastDot = nameForExtension.lastIndexOf('.');
    const extension = lastDot !== -1 ? nameForExtension.slice(lastDot + 1) : '';
    const normalizedExt = extension ? extension.toUpperCase() : 'FILE';

    return {
        fileName: displayName,
        extension: normalizedExt,
        typeLabel: normalizedExt === 'PDF' ? 'PDF' : normalizedExt === 'ZIP' ? 'ZIP' : normalizedExt,
    };
}
