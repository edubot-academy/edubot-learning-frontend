import { describe, expect, it } from 'vitest';

import { createDefaultCurriculum, getDefaultSectionTitle } from '../constants';
import { addSection } from './sectionUtils';
import { getStepItems } from './courseBuilderUtils';

describe('course builder localized defaults', () => {
    it('generates persisted section titles from course content language', () => {
        expect(getDefaultSectionTitle('ky', 1)).toBe('Бөлүм 1');
        expect(getDefaultSectionTitle('ru', 2)).toBe('Раздел 2');
        expect(getDefaultSectionTitle('en', 3)).toBe('Section 3');
        expect(getDefaultSectionTitle('unsupported', 4)).toBe('Бөлүм 4');
    });

    it('creates default curriculum and new sections with course language titles', () => {
        const defaultCurriculum = createDefaultCurriculum('en');
        expect(defaultCurriculum[0].sectionTitle).toBe('Section 1');

        const expanded = addSection(defaultCurriculum, 'ru');
        expect(expanded[1].sectionTitle).toBe('Раздел 2');
    });

    it('localizes step labels through the provided translation function', () => {
        const t = (key) => ({
            'instructorDashboard.courseBuilder.stepLabels.info': 'Info',
            'instructorDashboard.courseBuilder.stepLabels.curriculum': 'Content',
            'instructorDashboard.courseBuilder.stepLabels.media': 'Media',
        }[key]);

        const steps = getStepItems(
            1,
            { title: '', description: '', categoryId: '', languageCode: 'en' },
            [],
            t
        );

        expect(steps.map((step) => step.label)).toEqual(['Info', 'Content', 'Media']);
    });
});
