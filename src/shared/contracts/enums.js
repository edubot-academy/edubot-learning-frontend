export const PAYMENT_STATUS = Object.freeze({
    SUBMITTED: 'submitted',
    CONFIRMED: 'confirmed',
    FAILED: 'failed',
    REFUNDED: 'refunded',
    OVERDUE: 'overdue',
});

export const ENROLLMENT_STATUS = Object.freeze({
    PENDING_ACTIVATION: 'pending_activation',
    ACTIVE: 'active',
    PAUSED: 'paused',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
});

export const COURSE_TYPE = Object.freeze({
    VIDEO: 'video',
    OFFLINE: 'offline',
    ONLINE_LIVE: 'online_live',
});

export const COURSE_GROUP_STATUS = Object.freeze({
    PLANNED: 'planned',
    ACTIVE: 'active',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
});

export const COURSE_SESSION_STATUS = Object.freeze({
    SCHEDULED: 'scheduled',
    DONE: 'done',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
});

export const MEETING_PROVIDER = Object.freeze({
    ZOOM: 'zoom',
    GOOGLE_MEET: 'google_meet',
    CUSTOM: 'custom',
});

export const RISK_ISSUE_TYPE = Object.freeze({
    LOW_ATTENDANCE: 'low_attendance',
    INACTIVE_STUDENT: 'inactive_student',
    LOW_HOMEWORK_COMPLETION: 'low_homework_completion',
    LOW_QUIZ_PARTICIPATION: 'low_quiz_participation',
    PAYMENT_RISK: 'payment_risk',
});

export const RISK_SEVERITY = Object.freeze({
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    CRITICAL: 'critical',
});

export const SOURCE_SYSTEM = Object.freeze({
    CRM: 'crm',
    LMS: 'lms',
});

// Legacy course/date attendance endpoint statuses
export const ATTENDANCE_STATUS = Object.freeze({
    PRESENT: 'present',
    LATE: 'late',
    ABSENT: 'absent',
});

// Session-based attendance endpoint statuses
export const SESSION_ATTENDANCE_STATUS = Object.freeze({
    PRESENT: 'present',
    LATE: 'late',
    ABSENT: 'absent',
    EXCUSED: 'excused',
});
