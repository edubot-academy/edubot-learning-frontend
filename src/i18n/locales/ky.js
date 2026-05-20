import { shared } from './ky/shared.js';
import { publicResources } from './ky/public.js';
import { dashboard } from './ky/dashboard.js';
import { admin } from './ky/admin.js';
import { instructor } from './ky/instructor.js';
import { student } from './ky/student.js';
import { courses } from './ky/courses.js';
import { attendance } from './ky/attendance.js';
import { certificates } from './ky/certificates.js';
import { integrations } from './ky/integrations.js';

export const ky = {
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
};
