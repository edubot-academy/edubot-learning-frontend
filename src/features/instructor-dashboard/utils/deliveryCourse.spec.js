import { describe, expect, it } from 'vitest';
import {
    buildDeliveryCoursePayload,
    DEFAULT_DELIVERY_COURSE,
    isMissingRequiredDeliveryCourseFields,
    normalizeDeliveryCourseEditState,
    normalizeDeliveryCourseFormValues,
} from './deliveryCourse';

describe('deliveryCourse utils', () => {
    it('normalizes empty form values to defaults', () => {
        expect(normalizeDeliveryCourseFormValues()).toBe(DEFAULT_DELIVERY_COURSE);
    });

    it('normalizes edit values for form controls', () => {
        expect(
            normalizeDeliveryCourseFormValues({
                courseType: '',
                title: 'Offline Math',
                description: 'Group class',
                categoryId: 2,
                price: 0,
                languageCode: '',
            })
        ).toEqual({
            courseType: 'offline',
            title: 'Offline Math',
            description: 'Group class',
            categoryId: '2',
            price: '0',
            languageCode: 'ky',
        });
    });

    it('normalizes course data for edit modal state', () => {
        expect(
            normalizeDeliveryCourseEditState({
                id: 12,
                title: 'Offline Math',
                description: 'Group class',
                category: { id: 2 },
                price: 300,
                isPublished: true,
                status: 'approved',
            })
        ).toEqual({
            id: 12,
            courseType: 'offline',
            title: 'Offline Math',
            description: 'Group class',
            categoryId: 2,
            price: 300,
            languageCode: 'ky',
            status: 'approved',
            isPublished: true,
        });
    });

    it('builds the API payload without changing existing coercion rules', () => {
        expect(
            buildDeliveryCoursePayload({
                title: 'Live English',
                description: 'Speaking course',
                categoryId: '1',
                price: '200',
                languageCode: 'en',
                courseType: 'online_live',
            })
        ).toEqual({
            title: 'Live English',
            description: 'Speaking course',
            categoryId: 1,
            price: 200,
            languageCode: 'en',
            courseType: 'online_live',
            isPaid: true,
        });
    });

    it('detects missing required fields', () => {
        expect(
            isMissingRequiredDeliveryCourseFields({
                title: '',
                description: 'Missing title',
                categoryId: '1',
            })
        ).toBe(true);

        expect(
            isMissingRequiredDeliveryCourseFields({
                title: 'Course',
                description: 'Ready',
                categoryId: '1',
            })
        ).toBe(false);
    });
});
