import { shared } from './en/shared.js';
import { publicResources } from './en/public.js';
import { dashboard } from './en/dashboard.js';
import { admin } from './en/admin.js';
import { instructor } from './en/instructor.js';
import { student } from './en/student.js';
import { courses } from './en/courses.js';
import { attendance } from './en/attendance.js';
import { certificates } from './en/certificates.js';
import { integrations } from './en/integrations.js';
import { career } from './en/career.js';

export const en = {
    ...shared,
    ...publicResources,
    ...dashboard,
    ...admin,
    ...instructor,
    ...student,
    ...courses,
    ...attendance,
    ...certificates,
    ...integrations,
    ...career,
};
