import { describe, expect, it } from 'vitest';
import { SUPPORTED_LOCALES } from './locale';
import { resources } from './resources';

const leafKeys = (value, prefix = '') =>
    Object.entries(value).flatMap(([key, child]) => {
        const nextPrefix = prefix ? `${prefix}.${key}` : key;
        if (child && typeof child === 'object' && !Array.isArray(child)) {
            return leafKeys(child, nextPrefix);
        }
        return nextPrefix;
    });

describe('i18n resources', () => {
    it('defines resources for every supported locale', () => {
        expect(Object.keys(resources).sort()).toEqual([...SUPPORTED_LOCALES].sort());
    });

    it('keeps translation keys in parity across locales', () => {
        const [baseLocale, ...otherLocales] = SUPPORTED_LOCALES;
        const baseKeys = leafKeys(resources[baseLocale].translation).sort();

        otherLocales.forEach((locale) => {
            expect(leafKeys(resources[locale].translation).sort()).toEqual(baseKeys);
        });
    });
});
