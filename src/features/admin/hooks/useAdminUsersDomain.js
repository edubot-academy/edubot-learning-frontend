import { useCallback, useState } from 'react';
import toast from 'react-hot-toast';
import {
    deleteUser,
    enrollUserInCourse,
    fetchUsers,
    updateUserRole,
} from '@services/api';
import { normalizeEnrollmentCourseType } from '@features/enrollments/policy';
import { isForbiddenError } from '@shared/api/error';

export const useAdminUsersDomain = ({
    courses,
    dateFrom,
    dateTo,
    requestConfirmation,
    roleFilter,
    search,
    selectedEnrollmentGroupIds,
    usersPage,
}) => {
    const [users, setUsers] = useState([]);
    const [usersTotalPages, setUsersTotalPages] = useState(1);
    const [usersTotal, setUsersTotal] = useState(0);

    const loadUsers = useCallback(async () => {
        try {
            const res = await fetchUsers({
                page: usersPage,
                limit: 10,
                search,
                role: roleFilter,
                dateFrom,
                dateTo,
            });
            setUsers(res?.data || []);
            setUsersTotal(res?.total || 0);
            setUsersTotalPages(res?.totalPages || 1);
        } catch (error) {
            if (!isForbiddenError(error)) {
                toast.error('Колдонуучуларды жүктөөдө ката кетти');
            }
        }
    }, [dateFrom, dateTo, roleFilter, search, usersPage]);

    const loadUsersForEnrollment = useCallback(async () => {
        try {
            const res = await fetchUsers({ role: 'student', limit: 100 });
            setUsers(res?.data || []);
        } catch (error) {
            if (!isForbiddenError(error)) {
                toast.error('Студенттерди жүктөөдө ката кетти');
            }
        }
    }, []);

    const handleDeleteUser = useCallback(
        async (id) => {
            requestConfirmation({
                title: 'Колдонуучуну өчүрүү',
                message: 'Бул колдонуучуну өчүрүүгө ишенимдүүсүзбү?',
                confirmLabel: 'Өчүрүү',
                confirmVariant: 'danger',
                onConfirm: async () => {
                    try {
                        await deleteUser(id);
                        setUsers((prev) => prev.filter((user) => user.id !== id));
                        toast.success('Колдонуучу ийгиликтүү өчүрүлдү');
                    } catch {
                        toast.error('Колдонуучуну өчүрүүдө ката кетти');
                    }
                },
            });
        },
        [requestConfirmation]
    );

    const handleRoleChange = useCallback(async (userId, newRole) => {
        try {
            await updateUserRole(userId, newRole);
            setUsers((prev) =>
                prev.map((user) => (user.id === userId ? { ...user, role: newRole } : user))
            );
            toast.success('Роль ийгиликтүү өзгөртүлдү');
        } catch {
            toast.error('Ролду өзгөртүүдө ката кетти');
        }
    }, []);

    const handleEnrollUser = useCallback(
        async (userId, courseId) => {
            if (!userId) return;

            try {
                const selectedCourse = courses.find((course) => Number(course.id) === Number(courseId));
                const normalizedCourseType = normalizeEnrollmentCourseType(selectedCourse?.courseType);
                const selectedGroupId = selectedEnrollmentGroupIds[String(courseId)];

                if (
                    ['offline', 'online_live'].includes(normalizedCourseType) &&
                    (!selectedGroupId || Number.isNaN(Number(selectedGroupId)))
                ) {
                    toast.error('Delivery курс үчүн адегенде группаны тандаңыз');
                    return;
                }

                await enrollUserInCourse(userId, courseId, {
                    courseType: normalizedCourseType,
                    groupId:
                        ['offline', 'online_live'].includes(normalizedCourseType) && selectedGroupId
                            ? Number(selectedGroupId)
                            : undefined,
                });
                toast.success('Студент курска ийгиликтүү катталды');
            } catch {
                toast.error('Каттоодо ката кетти');
            }
        },
        [courses, selectedEnrollmentGroupIds]
    );

    return {
        handleDeleteUser,
        handleEnrollUser,
        handleRoleChange,
        loadUsers,
        loadUsersForEnrollment,
        users,
        usersTotal,
        usersTotalPages,
    };
};
