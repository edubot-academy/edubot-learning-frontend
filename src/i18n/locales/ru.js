import { shared } from './ru/shared.js';
import { publicResources } from './ru/public.js';
import { dashboard } from './ru/dashboard.js';
import { admin } from './ru/admin.js';
import { instructor } from './ru/instructor.js';
import { student } from './ru/student.js';
import { courses } from './ru/courses.js';
import { attendance } from './ru/attendance.js';
import { certificates } from './ru/certificates.js';
import { integrations } from './ru/integrations.js';
import { career } from './ru/career.js';

export const ru = {
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
