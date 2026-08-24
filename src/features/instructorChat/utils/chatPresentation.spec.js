import { describe, expect, it } from 'vitest';
import {
    CHAT_STATUS,
    formatChatMessageTime,
    getChatStatusTone,
    getUnreadMessageCount,
    normalizeChatList,
} from './chatPresentation';

const t = (key, values = {}) => {
    if (values.count !== undefined) return `${key}:${values.count}`;
    return key;
};

describe('chatPresentation', () => {
    it('normalizes supported chat response shapes', () => {
        expect(normalizeChatList([{ id: 1 }])).toEqual([{ id: 1 }]);
        expect(normalizeChatList({ chats: [{ id: 2 }] })).toEqual([{ id: 2 }]);
        expect(normalizeChatList({ items: [{ id: 3 }] })).toEqual([{ id: 3 }]);
        expect(normalizeChatList({ data: [{ id: 4 }] })).toEqual([{ id: 4 }]);
        expect(normalizeChatList(null)).toEqual([]);
    });

    it('maps chat status to workspace tones', () => {
        expect(getChatStatusTone(CHAT_STATUS.ACTIVE)).toBe('active');
        expect(getChatStatusTone('closed')).toBe('default');
        expect(getChatStatusTone()).toBe('default');
    });

    it('counts unread messages from other roles only', () => {
        expect(
            getUnreadMessageCount(
                [
                    { role: 'student', isRead: false },
                    { role: 'student', isRead: true },
                    { role: 'instructor', isRead: false },
                ],
                'student'
            )
        ).toBe(1);
    });

    it('formats relative chat timestamps with the provided translation base', () => {
        const base = {
            language: 'en-US',
            t,
            translationBase: 'studentDashboard.chat',
            now: new Date('2026-07-13T12:00:00.000Z'),
        };

        expect(formatChatMessageTime('2026-07-13T12:00:00.000Z', base)).toBe('studentDashboard.chat.time.now');
        expect(formatChatMessageTime('2026-07-13T11:55:00.000Z', base)).toBe('studentDashboard.chat.time.minutesAgo:5');
        expect(formatChatMessageTime('2026-07-13T10:00:00.000Z', base)).toBe('studentDashboard.chat.time.hoursAgo:2');
        expect(formatChatMessageTime('2026-07-11T12:00:00.000Z', base)).toBe('studentDashboard.chat.time.daysAgo:2');
    });

    it('returns empty text for missing or invalid timestamps', () => {
        const base = {
            language: 'en-US',
            t,
            translationBase: 'studentDashboard.chat',
            now: new Date('2026-07-13T12:00:00.000Z'),
        };

        expect(formatChatMessageTime(null, base)).toBe('');
        expect(formatChatMessageTime('not-a-date', base)).toBe('');
    });
});
