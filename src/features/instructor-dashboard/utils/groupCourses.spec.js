import { describe, expect, it } from 'vitest';
import {
    ENROLL_GROUP_FORM_DEFAULT,
    GROUP_FORM_DEFAULT,
    buildGenerationRange,
    buildGroupCreateFormDefaults,
    buildCreateGroupPayload,
    buildSuggestedGroupCode,
    buildUpdateGroupPatch,
    buildEnrollStudentRequest,
    canEnrollInGroupForCourse,
    formatScheduleBlocks,
    findGroupCourseById,
    getGroupMetrics,
    getGenerateSessionsToastMeta,
    getOpenGenerateSessionsValidationKey,
    getNextCreateGroupForm,
    getNextGenerationFormState,
    getNextSelectedGroupCourseId,
    getStudentDisplayName,
    getCreateGroupValidationKey,
    getEnrollStudentValidationKey,
    getUpdateGroupValidationKey,
    hasCompleteScheduleBlock,
    hasGroupLiveMeeting,
    isGroupEligibleCourse,
    mapGroupRosterToStudentRows,
    mapUsersToStudentOptions,
    normalizeCourseType,
    normalizeGroupForm,
    resolveDefaultInstructorId,
    resolveDefaultTimezone,
    selectGroupEligibleCourses,
    selectPendingDeliveryCourses,
    slugifyGroupCodeSegment,
} from './groupCourses';

describe('groupCourses utilities', () => {
    it('selects only approved and published delivery courses for groups', () => {
        const courses = [
            { id: 1, courseType: 'offline', status: 'approved', isPublished: true },
            { id: 2, courseType: 'online_live', status: 'approved', isPublished: true },
            { id: 3, courseType: 'video', status: 'approved', isPublished: true },
            { id: 4, type: 'offline', status: 'draft', isPublished: false },
            { id: 5, courseType: 'online_live', status: 'pending', isPublished: false },
        ];

        expect(selectGroupEligibleCourses(courses).map((course) => course.id)).toEqual([1, 2]);
        expect(selectPendingDeliveryCourses(courses).map((course) => course.id)).toEqual([4, 5]);
        expect(isGroupEligibleCourse(courses[0])).toBe(true);
        expect(normalizeCourseType({ type: ' Online_Live ' })).toBe('online_live');
    });

    it('builds deterministic generation date ranges from group dates', () => {
        const now = new Date('2026-07-12T09:00:00.000Z');

        expect(buildGenerationRange({ startDate: '2026-08-01', endDate: '2026-08-20' }, now)).toEqual({
            fromDate: '2026-08-01',
            toDate: '2026-08-20',
        });
        expect(buildGenerationRange({ startDate: '2026-01-01' }, now)).toEqual({
            fromDate: '2026-07-12',
            toDate: '2026-08-08',
        });
    });

    it('builds stable group codes from course identity, date, and sequence', () => {
        const now = new Date('2026-07-12T09:00:00.000Z');

        expect(slugifyGroupCodeSegment(' English Basics! ')).toBe('ENGLISH-BA');
        expect(buildSuggestedGroupCode(
            { shortCode: 'ENG', title: 'English Basics' },
            [{ id: 1 }, { id: 2 }],
            '2026-09-03',
            now
        )).toBe('ENG-2026-09-G03');
        expect(buildSuggestedGroupCode({}, [], '', now)).toBe('GROUP-2026-07-G01');
    });

    it('normalizes group forms and course defaults for modal state', () => {
        expect(resolveDefaultInstructorId({ instructor: { id: 8 } })).toBe('8');
        expect(resolveDefaultTimezone({ timezone: '' })).toBe('Asia/Bishkek');
        const normalized = normalizeGroupForm({
            name: 'Morning group',
            seatLimit: 12,
            instructorId: 9,
            scheduleBlocks: [{ day: 'monday', startTime: '09:00' }],
        });

        expect(normalized).toEqual({
            name: 'Morning group',
            code: '',
            deliveryMode: 'group',
            status: GROUP_FORM_DEFAULT.status,
            startDate: '',
            endDate: '',
            seatLimit: '12',
            timezone: '',
            location: '',
            meetingProvider: '',
            meetingUrl: '',
            scheduleNote: '',
            instructorId: '9',
            scheduleBlocks: [{ day: 'monday', startTime: '09:00', endTime: '' }],
        });
        const defaults = buildGroupCreateFormDefaults(
            { id: 1, title: 'English', timezone: 'Europe/London', instructorId: 12 },
            [{ id: 1 }],
            { meetingProvider: 'zoom' }
        );

        expect(defaults).toMatchObject({
            instructorId: '12',
            meetingProvider: 'zoom',
            timezone: 'Europe/London',
        });
        expect(defaults.code.startsWith('ENGLISH-')).toBe(true);
    });

    it('resolves selected group courses from route and available courses', () => {
        const deliveryCourses = [{ id: 1 }, { id: 2 }];

        expect(findGroupCourseById(deliveryCourses, '2')).toEqual({ id: 2 });
        expect(getNextSelectedGroupCourseId({
            deliveryCourses,
            requestedCourseId: '2',
            selectedCourseId: '1',
        })).toBe('2');
        expect(getNextSelectedGroupCourseId({
            deliveryCourses,
            requestedCourseId: '99',
            selectedCourseId: '99',
        })).toBe('1');
        expect(getNextSelectedGroupCourseId({
            deliveryCourses,
            selectedCourseId: '',
        })).toBe('1');
        expect(getNextSelectedGroupCourseId({
            deliveryCourses: [],
            selectedCourseId: '1',
        })).toBe('');
    });

    it('updates create group form fields with workflow-specific side effects', () => {
        const course = { shortCode: 'ENG' };
        const previousForm = {
            ...GROUP_FORM_DEFAULT,
            code: '',
            startDate: '2026-08-01',
        };

        expect(getNextCreateGroupForm({
            field: 'deliveryMode',
            value: 'individual',
            previousForm,
            selectedCourse: course,
            groups: [],
        })).toMatchObject({
            code: '',
            createFirstSession: false,
            deliveryMode: 'individual',
            seatLimit: '1',
            studentId: '',
        });
        expect(getNextCreateGroupForm({
            field: 'deliveryMode',
            value: 'group',
            previousForm,
            selectedCourse: course,
            groups: [],
        }).code).toBe('ENG-2026-08-G01');
        expect(getNextCreateGroupForm({
            field: 'startDate',
            value: '2026-09-01',
            previousForm: {
                ...GROUP_FORM_DEFAULT,
                code: 'ENG-2026-08-G01',
                startDate: '2026-08-01',
            },
            selectedCourse: course,
            groups: [],
        }).code).toBe('ENG-2026-09-G01');
    });

    it('formats schedule blocks and detects complete schedules', () => {
        const t = (key, options) => options?.defaultValue || key;
        const blocks = [
            { day: 'monday', startTime: '09:00', endTime: '10:00' },
            { day: 'tuesday', startTime: '09:00', endTime: '' },
        ];

        expect(formatScheduleBlocks(blocks, t)).toEqual(['monday · 09:00–10:00']);
        expect(hasCompleteScheduleBlock(blocks)).toBe(true);
        expect(hasCompleteScheduleBlock([{ day: 'monday', startTime: '09:00' }])).toBe(false);
    });

    it('evaluates enrollment readiness for offline and online-live groups', () => {
        expect(canEnrollInGroupForCourse({
            course: { courseType: 'offline' },
            group: { status: 'open' },
            needsLiveMeeting: true,
            needsSession: true,
        })).toBe(true);
        expect(canEnrollInGroupForCourse({
            course: { courseType: 'online_live' },
            group: { status: 'active' },
            needsSession: true,
        })).toBe(false);
        expect(canEnrollInGroupForCourse({
            course: { courseType: 'online_live' },
            group: { status: 'active', meetingUrl: 'https://meet.example.com' },
            needsLiveMeeting: true,
        })).toBe(true);
        expect(hasGroupLiveMeeting({ meetingProvider: 'zoom' })).toBe(true);
    });

    it('validates create group forms before API submission', () => {
        const course = { id: 7, courseType: 'offline' };

        expect(getCreateGroupValidationKey(null, GROUP_FORM_DEFAULT)).toBe(
            'instructorDashboard.groupsSection.toasts.selectCourse'
        );
        expect(getCreateGroupValidationKey(course, { ...GROUP_FORM_DEFAULT, deliveryMode: 'group', name: '' })).toBe(
            'instructorDashboard.groupsSection.toasts.groupNameAndCodeRequired'
        );
        expect(getCreateGroupValidationKey(course, { ...GROUP_FORM_DEFAULT, deliveryMode: 'individual', name: '' })).toBe(
            'instructorDashboard.groupsSection.toasts.individualNameRequired'
        );
        expect(getCreateGroupValidationKey(course, { ...GROUP_FORM_DEFAULT, deliveryMode: 'individual', name: 'One' })).toBe(
            'instructorDashboard.groupsSection.toasts.studentRequired'
        );
        expect(getCreateGroupValidationKey(
            { id: 7, courseType: 'online_live' },
            { ...GROUP_FORM_DEFAULT, deliveryMode: 'individual', name: 'One', studentId: '4' }
        )).toBe('instructorDashboard.groupsSection.toasts.firstSessionScheduleRequired');
        expect(getCreateGroupValidationKey(
            { id: 7, courseType: 'online_live' },
            {
                ...GROUP_FORM_DEFAULT,
                deliveryMode: 'individual',
                name: 'One',
                studentId: '4',
                startDate: '2026-08-01',
                scheduleBlocks: [{ day: 'mon', startTime: '09:00', endTime: '10:00' }],
            }
        )).toBe('instructorDashboard.groupsSection.toasts.liveMeetingRequired');
    });

    it('builds group create payloads without UI-only fields', () => {
        expect(buildCreateGroupPayload(
            { id: 9, courseType: 'offline' },
            {
                ...GROUP_FORM_DEFAULT,
                name: ' Cohort A ',
                code: ' COH-A ',
                status: 'active',
                seatLimit: '12',
                timezone: 'Asia/Bishkek',
                instructorId: '3',
                scheduleNote: 'Weekdays',
            }
        )).toEqual({
            isIndividual: false,
            isOnlineLiveIndividual: false,
            payload: {
                courseId: 9,
                name: 'Cohort A',
                startDate: undefined,
                endDate: undefined,
                timezone: 'Asia/Bishkek',
                location: undefined,
                meetingProvider: undefined,
                meetingUrl: undefined,
                scheduleBlocks: GROUP_FORM_DEFAULT.scheduleBlocks,
                instructorId: 3,
                code: 'COH-A',
                deliveryMode: 'group',
                status: 'active',
                seatLimit: 12,
                scheduleNote: 'Weekdays',
            },
        });

        expect(buildCreateGroupPayload(
            { id: 10, courseType: 'online_live' },
            {
                ...GROUP_FORM_DEFAULT,
                deliveryMode: 'individual',
                name: 'Aida',
                studentId: '44',
                createFirstSession: false,
            }
        )).toMatchObject({
            isIndividual: true,
            isOnlineLiveIndividual: true,
            payload: {
                courseId: 10,
                name: 'Aida',
                studentId: 44,
                createFirstSession: true,
            },
        });
    });

    it('validates and builds group update patches', () => {
        expect(getUpdateGroupValidationKey({ ...GROUP_FORM_DEFAULT, name: '', code: '' })).toBe(
            'instructorDashboard.groupsSection.toasts.groupNameAndCodeRequired'
        );
        expect(getUpdateGroupValidationKey({ ...GROUP_FORM_DEFAULT, deliveryMode: 'individual', name: 'One' })).toBeNull();
        expect(buildUpdateGroupPatch({
            ...GROUP_FORM_DEFAULT,
            name: ' Updated ',
            code: ' CODE ',
            seatLimit: '6',
            instructorId: '2',
        })).toEqual({
            name: 'Updated',
            status: 'planned',
            startDate: undefined,
            endDate: undefined,
            seatLimit: 6,
            timezone: undefined,
            location: undefined,
            meetingProvider: undefined,
            meetingUrl: undefined,
            scheduleNote: undefined,
            scheduleBlocks: GROUP_FORM_DEFAULT.scheduleBlocks,
            instructorId: 2,
            code: 'CODE',
        });
        expect(buildUpdateGroupPatch({
            ...GROUP_FORM_DEFAULT,
            deliveryMode: 'individual',
            name: 'One',
            code: 'IGNORED',
        })).not.toHaveProperty('code');
    });

    it('validates and builds enroll student requests', () => {
        expect(getEnrollStudentValidationKey(ENROLL_GROUP_FORM_DEFAULT)).toBe(
            'instructorDashboard.groupsSection.toasts.invalidUserId'
        );
        expect(getEnrollStudentValidationKey({ userId: '12' })).toBeNull();
        expect(buildEnrollStudentRequest({
            course: { id: 9, courseType: 'online_live' },
            form: { userId: '12', discountPercentage: '15' },
            group: { id: 4 },
            normalizeCourseTypeForEnrollment: (value) => `normalized:${value}`,
        })).toEqual({
            courseId: 9,
            options: {
                courseType: 'normalized:online_live',
                discountPercentage: 15,
                groupId: 4,
            },
            userId: 12,
        });
    });

    it('validates generation opens and summarizes generate results', () => {
        expect(getOpenGenerateSessionsValidationKey({ scheduleBlocks: [] })).toBe(
            'instructorDashboard.groupsSection.toasts.defaultScheduleRequired'
        );
        expect(getOpenGenerateSessionsValidationKey({
            scheduleBlocks: [{ day: 'mon' }],
        })).toBeNull();
        expect(getNextGenerationFormState({ fromDate: '2026-01-01' }, 'fromDate', '2026-01-02')).toEqual({
            changed: true,
            form: { fromDate: '2026-01-02' },
        });
        expect(getNextGenerationFormState({ fromDate: '2026-01-01' }, 'fromDate', '2026-01-01')).toEqual({
            changed: false,
            form: { fromDate: '2026-01-01' },
        });
        expect(getGenerateSessionsToastMeta({ createdCount: 3 })).toEqual({
            count: 3,
            key: 'instructorDashboard.groupsSection.toasts.sessionsCreated',
            type: 'success',
        });
        expect(getGenerateSessionsToastMeta({ createdCount: 0 })).toEqual({
            count: 0,
            key: 'instructorDashboard.groupsSection.toasts.noNewSessions',
            type: 'info',
        });
    });

    it('summarizes group metrics and student display names', () => {
        expect(getGroupMetrics([
            { status: 'planned', seatLimit: 8 },
            { status: 'active', seatLimit: 12 },
            { status: 'completed' },
        ])).toEqual({
            total: 3,
            planned: 1,
            active: 1,
            seats: 20,
        });
        expect(getGroupMetrics([]).seats).toBe('—');
        expect(getStudentDisplayName({ id: 5 })).toBe('Student #5');
        expect(getStudentDisplayName({ email: 'learner@example.com' })).toBe('learner@example.com');
    });

    it('maps roster and user search responses for modal options', () => {
        expect(mapGroupRosterToStudentRows([
            { id: 1, fullName: 'Aida', email: 'aida@example.com', enrolledAt: '2026-01-01' },
            { id: 2 },
        ], 'Fallback')).toEqual([
            { id: 1, name: 'Aida', email: 'aida@example.com', enrolledAt: '2026-01-01' },
            { id: 2, name: 'Fallback', email: '—', enrolledAt: undefined },
        ]);
        expect(mapUsersToStudentOptions({
            items: [
                { id: 3, fullName: 'Timur', email: 'timur@example.com' },
                { id: 4 },
            ],
        })).toEqual([
            { id: 3, name: 'Timur', email: 'timur@example.com' },
            { id: 4, name: 'ID: 4', email: '' },
        ]);
    });
});
