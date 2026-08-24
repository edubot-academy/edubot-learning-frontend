import { describe, expect, it } from 'vitest';
import {
    COMPANY_STATUS_VALUES,
    getCompanyStatusLabel,
    getCompanyStatusToneClass,
    getTenantDomain,
} from './tenantPresentation';

const t = (key, options = {}) => options.defaultValue || key;

describe('tenantPresentation', () => {
    it('exposes tenant status values for select controls', () => {
        expect(COMPANY_STATUS_VALUES).toEqual([
            'trial',
            'active',
            'inactive',
            'suspended',
            'archived',
        ]);
    });

    it('formats company status labels through i18n', () => {
        expect(getCompanyStatusLabel('past_due', t)).toBe('past due');
        expect(getCompanyStatusLabel(null, t)).toBe('active');
    });

    it('returns status tone classes with an inactive fallback', () => {
        expect(getCompanyStatusToneClass('active')).toContain('emerald');
        expect(getCompanyStatusToneClass('unknown')).toContain('slate');
    });

    it('resolves tenant domains with a provided fallback', () => {
        expect(getTenantDomain({ customDomain: 'school.example.com' }, 'n/a')).toBe('school.example.com');
        expect(getTenantDomain({ subdomain: 'school' }, 'n/a')).toBe('school.lms.edubot.it.com');
        expect(getTenantDomain({}, 'n/a')).toBe('n/a');
    });
});
