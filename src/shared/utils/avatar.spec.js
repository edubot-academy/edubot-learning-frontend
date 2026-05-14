import { describe, expect, it } from 'vitest';
import { getUserAvatarUrl, normalizeAssetUrl, normalizeUserAvatar } from './avatar';

describe('avatar utilities', () => {
    it('keeps absolute avatar URLs unchanged', () => {
        expect(normalizeAssetUrl('https://cdn.example.com/avatar.png')).toBe(
            'https://cdn.example.com/avatar.png'
        );
    });

    it('resolves root-relative avatar paths against the API origin', () => {
        expect(normalizeAssetUrl('/uploads/avatar.png', 'https://api.example.com')).toBe(
            'https://api.example.com/uploads/avatar.png'
        );
    });

    it('uses supported user avatar fields and normalizes them', () => {
        expect(
            getUserAvatarUrl({
                fullName: 'Test User',
                avatarUrl: 'uploads/avatar.png',
            })
        ).toBe('http://localhost:3000/uploads/avatar.png');
    });

    it('normalizes stored user avatar fields without mutating empty users', () => {
        expect(normalizeUserAvatar(null)).toBeNull();
        expect(
            normalizeUserAvatar({
                id: 1,
                avatar: '/uploads/avatar.png',
            })
        ).toMatchObject({
            id: 1,
            avatar: 'http://localhost:3000/uploads/avatar.png',
            avatarUrl: 'http://localhost:3000/uploads/avatar.png',
        });
    });
});
