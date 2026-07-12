import { COURSE_GROUP_STATUS } from '@shared/contracts';
import {
    hasGroupLiveMeeting,
    normalizeCourseType,
} from './groupCourseSelection';

export const GROUP_FORM_DEFAULT = Object.freeze({
    name: '',
    code: '',
    deliveryMode: 'group',
    studentId: '',
    createFirstSession: false,
    status: COURSE_GROUP_STATUS.PLANNED,
    startDate: '',
    endDate: '',
    seatLimit: '',
    timezone: '',
    location: '',
    meetingProvider: '',
    meetingUrl: '',
    scheduleNote: '',
    scheduleBlocks: [{ day: '', startTime: '', endTime: '' }],
    instructorId: '',
});

export const ENROLL_GROUP_FORM_DEFAULT = Object.freeze({
    userId: '',
    discountPercentage: '',
});

export const toDateInputValue = (value) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toISOString().slice(0, 10);
};

export const addDays = (value, days) => {
    const date = new Date(`${value}T00:00:00`);
    if (Number.isNaN(date.getTime())) return value;
    date.setDate(date.getDate() + days);
    return date.toISOString().slice(0, 10);
};

export const buildGenerationRange = (group = {}, now = new Date()) => {
    const today = toDateInputValue(now);
    const startDate = group.startDate && group.startDate > today ? group.startDate : today;
    const endDate = group.endDate && group.endDate >= startDate ? group.endDate : addDays(startDate, 28);

    return {
        fromDate: startDate,
        toDate: endDate,
    };
};

export const slugifyGroupCodeSegment = (value) =>
    String(value || '')
        .trim()
        .toUpperCase()
        .replace(/[^A-Z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 10);

export const buildSuggestedGroupCode = (course, groups = [], startDate, now = new Date()) => {
    const courseToken =
        slugifyGroupCodeSegment(course?.shortCode) ||
        slugifyGroupCodeSegment(course?.code) ||
        slugifyGroupCodeSegment(course?.title) ||
        'GROUP';
    const date = startDate ? new Date(startDate) : null;
    const fallbackDate = now instanceof Date ? now : new Date(now);
    const year =
        date && !Number.isNaN(date.getTime()) ? String(date.getFullYear()) : String(fallbackDate.getFullYear());
    const month =
        date && !Number.isNaN(date.getTime())
            ? String(date.getMonth() + 1).padStart(2, '0')
            : String(fallbackDate.getMonth() + 1).padStart(2, '0');
    const sequence = String((groups?.length || 0) + 1).padStart(2, '0');
    return `${courseToken}-${year}-${month}-G${sequence}`;
};

export const resolveDefaultInstructorId = (course = null) => {
    const rawValue = course?.instructorId ?? course?.instructor?.id ?? '';
    return rawValue ? String(rawValue) : '';
};

export const resolveDefaultTimezone = (course = null) =>
    String(course?.timezone || '').trim() || 'Asia/Bishkek';

export const normalizeGroupForm = (group = {}) => ({
    name: group.name || '',
    code: group.code || '',
    deliveryMode: group.deliveryMode || 'group',
    status: group.status || COURSE_GROUP_STATUS.PLANNED,
    startDate: group.startDate || '',
    endDate: group.endDate || '',
    seatLimit: group.seatLimit ? String(group.seatLimit) : '',
    timezone: group.timezone || '',
    location: group.location || '',
    meetingProvider: group.meetingProvider || '',
    meetingUrl: group.meetingUrl || '',
    scheduleNote: group.scheduleNote || '',
    scheduleBlocks: Array.isArray(group.scheduleBlocks) && group.scheduleBlocks.length
        ? group.scheduleBlocks.map((block) => ({
            day: block.day || '',
            startTime: block.startTime || '',
            endTime: block.endTime || '',
        }))
        : [{ day: '', startTime: '', endTime: '' }],
    instructorId: group.instructorId ? String(group.instructorId) : '',
});

export const buildGroupCreateFormDefaults = (course, groups = [], previousForm = {}) => ({
    ...GROUP_FORM_DEFAULT,
    timezone: resolveDefaultTimezone(course),
    meetingProvider: previousForm.meetingProvider,
    code: buildSuggestedGroupCode(course, groups, ''),
    instructorId: resolveDefaultInstructorId(course),
});

export const getNextCreateGroupForm = ({
    field,
    groups = [],
    previousForm,
    selectedCourse,
    value,
}) => {
    const next = {
        ...previousForm,
        [field]: value,
    };

    if (field === 'deliveryMode') {
        next.seatLimit = value === 'individual' ? '1' : '';
        next.studentId = '';
        next.createFirstSession = false;
        if (value === 'individual') {
            next.code = '';
        } else if (!previousForm.code) {
            next.code = buildSuggestedGroupCode(selectedCourse, groups, previousForm.startDate);
        }
    }

    if (field === 'startDate') {
        if (
            !previousForm.code ||
            previousForm.code === buildSuggestedGroupCode(selectedCourse, groups, previousForm.startDate)
        ) {
            next.code = buildSuggestedGroupCode(selectedCourse, groups, value);
        }
    }

    return next;
};

export const hasCompleteScheduleBlock = (blocks = []) =>
    (Array.isArray(blocks) ? blocks : []).some(
        (block) => block?.day && block?.startTime && block?.endTime
    );

const groupToastKeys = Object.freeze({
    defaultScheduleRequired: 'instructorDashboard.groupsSection.toasts.defaultScheduleRequired',
    firstSessionScheduleRequired: 'instructorDashboard.groupsSection.toasts.firstSessionScheduleRequired',
    groupNameAndCodeRequired: 'instructorDashboard.groupsSection.toasts.groupNameAndCodeRequired',
    individualNameRequired: 'instructorDashboard.groupsSection.toasts.individualNameRequired',
    invalidUserId: 'instructorDashboard.groupsSection.toasts.invalidUserId',
    liveMeetingRequired: 'instructorDashboard.groupsSection.toasts.liveMeetingRequired',
    noNewSessions: 'instructorDashboard.groupsSection.toasts.noNewSessions',
    selectCourse: 'instructorDashboard.groupsSection.toasts.selectCourse',
    sessionsCreated: 'instructorDashboard.groupsSection.toasts.sessionsCreated',
    studentRequired: 'instructorDashboard.groupsSection.toasts.studentRequired',
});

const buildCommonGroupPayload = (course, form) => ({
    courseId: Number(course.id),
    name: form.name.trim(),
    startDate: form.startDate || undefined,
    endDate: form.endDate || undefined,
    timezone: form.timezone || undefined,
    location: form.location || undefined,
    meetingProvider: form.meetingProvider || undefined,
    meetingUrl: form.meetingUrl || undefined,
    scheduleBlocks: form.scheduleBlocks,
    instructorId: form.instructorId ? Number(form.instructorId) : undefined,
});

export const getCreateGroupValidationKey = (course, form) => {
    if (!course?.id) return groupToastKeys.selectCourse;

    const isIndividual = form.deliveryMode === 'individual';
    const studentIdValue = Number(form.studentId);

    if (!form.name.trim()) {
        return isIndividual
            ? groupToastKeys.individualNameRequired
            : groupToastKeys.groupNameAndCodeRequired;
    }

    if (!isIndividual && !form.code.trim()) {
        return groupToastKeys.groupNameAndCodeRequired;
    }

    if (isIndividual && (!studentIdValue || Number.isNaN(studentIdValue))) {
        return groupToastKeys.studentRequired;
    }

    const isOnlineLiveIndividual = isIndividual && normalizeCourseType(course) === 'online_live';
    if (
        isOnlineLiveIndividual &&
        (!form.startDate || !hasCompleteScheduleBlock(form.scheduleBlocks))
    ) {
        return groupToastKeys.firstSessionScheduleRequired;
    }

    if (isOnlineLiveIndividual && !hasGroupLiveMeeting(form)) {
        return groupToastKeys.liveMeetingRequired;
    }

    if (
        isIndividual &&
        form.createFirstSession &&
        (!form.startDate || !hasCompleteScheduleBlock(form.scheduleBlocks))
    ) {
        return groupToastKeys.firstSessionScheduleRequired;
    }

    return null;
};

export const buildCreateGroupPayload = (course, form) => {
    const isIndividual = form.deliveryMode === 'individual';
    const isOnlineLiveIndividual = isIndividual && normalizeCourseType(course) === 'online_live';
    const commonPayload = buildCommonGroupPayload(course, form);

    if (isIndividual) {
        return {
            isIndividual,
            isOnlineLiveIndividual,
            payload: {
                ...commonPayload,
                studentId: Number(form.studentId),
                createFirstSession: isOnlineLiveIndividual || Boolean(form.createFirstSession),
            },
        };
    }

    return {
        isIndividual,
        isOnlineLiveIndividual,
        payload: {
            ...commonPayload,
            code: form.code.trim(),
            deliveryMode: 'group',
            status: form.status || undefined,
            seatLimit: form.seatLimit ? Number(form.seatLimit) : undefined,
            scheduleNote: form.scheduleNote || undefined,
        },
    };
};

export const getUpdateGroupValidationKey = (form) => {
    const isIndividual = form.deliveryMode === 'individual';

    if (!form.name.trim() || (!isIndividual && !form.code.trim())) {
        return groupToastKeys.groupNameAndCodeRequired;
    }

    return null;
};

export const buildUpdateGroupPatch = (form) => {
    const isIndividual = form.deliveryMode === 'individual';
    const patch = {
        name: form.name.trim(),
        status: form.status || undefined,
        startDate: form.startDate || undefined,
        endDate: form.endDate || undefined,
        seatLimit: form.seatLimit ? Number(form.seatLimit) : undefined,
        timezone: form.timezone || undefined,
        location: form.location || undefined,
        meetingProvider: form.meetingProvider || undefined,
        meetingUrl: form.meetingUrl || undefined,
        scheduleNote: form.scheduleNote || undefined,
        scheduleBlocks: form.scheduleBlocks,
        instructorId: form.instructorId ? Number(form.instructorId) : undefined,
    };

    if (!isIndividual) {
        patch.code = form.code.trim();
    }

    return patch;
};

export const getEnrollStudentValidationKey = (form) => {
    const userIdValue = Number(form.userId);
    return !userIdValue || Number.isNaN(userIdValue) ? groupToastKeys.invalidUserId : null;
};

export const buildEnrollStudentRequest = ({
    course,
    form,
    group,
    normalizeCourseTypeForEnrollment = (value) => value,
}) => {
    const discountPercentage = form.discountPercentage
        ? Number(form.discountPercentage)
        : undefined;

    return {
        courseId: course.id,
        options: {
            courseType: normalizeCourseTypeForEnrollment(course.courseType),
            groupId: group.id,
            discountPercentage,
        },
        userId: Number(form.userId),
    };
};

export const getOpenGenerateSessionsValidationKey = (group) =>
    !Array.isArray(group?.scheduleBlocks) || !group.scheduleBlocks.length
        ? groupToastKeys.defaultScheduleRequired
        : null;

export const getNextGenerationFormState = (previousForm, field, value) => ({
    changed: previousForm[field] !== value,
    form: {
        ...previousForm,
        [field]: value,
    },
});

export const getGenerateSessionsToastMeta = (result) => {
    const createdCount = Number(result?.createdCount || 0);
    return createdCount > 0
        ? {
              count: createdCount,
              key: groupToastKeys.sessionsCreated,
              type: 'success',
          }
        : {
              count: 0,
              key: groupToastKeys.noNewSessions,
              type: 'info',
          };
};
