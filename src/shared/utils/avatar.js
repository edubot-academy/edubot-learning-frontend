import { API_BASE_URL } from '../../config';

const ABSOLUTE_URL_PATTERN = /^(?:[a-z][a-z\d+.-]*:|\/\/)/i;

export const normalizeAssetUrl = (value, baseUrl = API_BASE_URL) => {
    if (typeof value !== 'string') return '';

    const trimmed = value.trim();
    if (!trimmed) return '';

    if (ABSOLUTE_URL_PATTERN.test(trimmed)) {
        return trimmed.startsWith('//') ? `https:${trimmed}` : trimmed;
    }

    try {
        const path = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
        return new URL(path, baseUrl).href;
    } catch {
        return trimmed;
    }
};

export const getUserAvatarUrl = (user) =>
    normalizeAssetUrl(user?.avatar || user?.avatarUrl || user?.profilePicture || user?.photoUrl);

export const normalizeUserAvatar = (user) => {
    if (!user || typeof user !== 'object') return user;

    const avatar = getUserAvatarUrl(user);
    if (!avatar) return user;

    return {
        ...user,
        avatar,
        avatarUrl: normalizeAssetUrl(user.avatarUrl) || avatar,
    };
};
