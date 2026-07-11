import { describe, expect, it } from 'vitest';
import { mapWithConcurrency } from './async';

describe('mapWithConcurrency', () => {
    it('keeps result order while limiting concurrent work', async () => {
        let active = 0;
        let maxActive = 0;

        const results = await mapWithConcurrency([1, 2, 3, 4, 5], 2, async (item) => {
            active += 1;
            maxActive = Math.max(maxActive, active);
            await Promise.resolve();
            active -= 1;
            return item * 10;
        });

        expect(results).toEqual([10, 20, 30, 40, 50]);
        expect(maxActive).toBeLessThanOrEqual(2);
    });
});
