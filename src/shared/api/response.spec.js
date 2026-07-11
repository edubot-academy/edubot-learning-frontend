import { describe, expect, it } from 'vitest';
import { toArray } from './response';

describe('toArray', () => {
    it('normalizes common list response shapes', () => {
        expect(toArray([1, 2])).toEqual([1, 2]);
        expect(toArray({ items: ['a'] })).toEqual(['a']);
        expect(toArray({ data: ['b'] })).toEqual(['b']);
    });

    it('returns an empty array for non-list payloads', () => {
        expect(toArray(null)).toEqual([]);
        expect(toArray({ data: { id: 1 } })).toEqual([]);
        expect(toArray({ items: 'not-list' })).toEqual([]);
    });
});
