import React from 'react';
import AdminCoursesTab from './AdminCoursesTab';
import AdminContactsTab from './AdminContactsTab';
import AdminPendingCoursesTab from './AdminPendingCoursesTab';
import AdminBackfillLessonDurations from './AdminBackfillLessonDurations';
import AdminUsersTab from './AdminUsersTab';
import AdminCompaniesTab from './AdminCompaniesTab';

const AdminTabRenderer = ({
    activeTab,
    users,
    courses,
    categories,
    contacts,
    pendingCourses,
    usersProps,
    coursesProps,
    contactsProps,
    pendingProps,
    companies,
    companiesProps,
}) => {
    if (activeTab === 'users') return <AdminUsersTab {...usersProps} users={users} />;
    if (activeTab === 'courses') return <AdminCoursesTab {...coursesProps} users={users} courses={courses} categories={categories} />;
    if (activeTab === 'contacts') return <AdminContactsTab contacts={contacts} {...contactsProps} />;
    if (activeTab === 'pending') return <AdminPendingCoursesTab pendingCourses={pendingCourses} {...pendingProps} />;
    if (activeTab === 'backfill') return <AdminBackfillLessonDurations />;
    if (activeTab === 'companies') return <AdminCompaniesTab {...companiesProps} companies={companies} />;
    return null;
};

export default AdminTabRenderer;
