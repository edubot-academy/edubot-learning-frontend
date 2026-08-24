import { toArray as toResponseArray } from '@shared/api/response';

export const CHAT_STATUS = {
    ACTIVE: 'active',
};

export const normalizeChatList = (value) => {
    if (Array.isArray(value?.chats)) return value.chats;
    return toResponseArray(value);
};

export const getChatStatusTone = (status) => (status === CHAT_STATUS.ACTIVE ? 'active' : 'default');

export const getUnreadMessageCount = (messages = [], currentUserRole) =>
    messages.filter((item) => item.role !== currentUserRole && !item.isRead).length;

export const formatChatMessageTime = (
    createdAt,
    {
        language,
        t,
        translationBase,
        now = new Date(),
    }
) => {
    if (!createdAt) return '';

    const date = new Date(createdAt);
    if (Number.isNaN(date.getTime())) return '';

    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return t(`${translationBase}.time.now`);
    if (diffMins < 60) return t(`${translationBase}.time.minutesAgo`, { count: diffMins });
    if (diffHours < 24) return t(`${translationBase}.time.hoursAgo`, { count: diffHours });
    if (diffDays < 7) return t(`${translationBase}.time.daysAgo`, { count: diffDays });

    return date.toLocaleDateString(language || undefined, {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
    });
};
