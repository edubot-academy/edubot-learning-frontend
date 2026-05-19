import { useCallback, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import {
    deleteUser,
    enrollUserInCourse,
    fetchUsers,
    updateUserRole,
} from '@services/api';
import { normalizeEnrollmentCourseType } from '@features/enrollments/policy';
import { isForbiddenError, parseApiError } from '@shared/api/error';

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
    const { t } = useTranslation();
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
                toast.error(parseApiError(error, t('adminUsers.toasts.loadError')).message);
            }
        }
    }, [dateFrom, dateTo, roleFilter, search, t, usersPage]);

    const loadUsersForEnrollment = useCallback(async () => {
        try {
            const res = await fetchUsers({ role: 'student', limit: 100 });
            setUsers(res?.data || []);
        } catch (error) {
            if (!isForbiddenError(error)) {
                toast.error(
                    parseApiError(error, t('adminUsers.toasts.loadStudentsError')).message
                );
            }
        }
    }, [t]);

    const handleDeleteUser = useCallback(
        async (targetUser) => {
            const id = typeof targetUser === 'object' ? targetUser.id : targetUser;
            const userLabel =
                typeof targetUser === 'object'
                    ? `${targetUser.fullName || t('adminUsers.fallbacks.noName')} (${targetUser.email || t('adminUsers.fallbacks.noEmail')})`
                    : `ID ${id}`;

            requestConfirmation({
                title: t('adminUsers.confirm.deleteTitle'),
                message: t('adminUsers.confirm.deleteMessage', { user: userLabel }),
                confirmLabel: t('adminUsers.actions.delete'),
                confirmVariant: 'danger',
                onConfirm: async () => {
                    try {
                        await deleteUser(id);
                        setUsers((prev) => prev.filter((user) => user.id !== id));
                        toast.success(t('adminUsers.toasts.deleted'));
                    } catch (error) {
                        toast.error(parseApiError(error, t('adminUsers.toasts.deleteError')).message);
                    }
                },
            });
        },
        [requestConfirmation, t]
    );

    const handleRoleChange = useCallback(
        async (targetUser, newRole) => {
            const userId = typeof targetUser === 'object' ? targetUser.id : targetUser;
            const currentRole = typeof targetUser === 'object' ? targetUser.role : null;

            if (currentRole === newRole) return;

            const userLabel =
                typeof targetUser === 'object'
                    ? `${targetUser.fullName || t('adminUsers.fallbacks.noName')} (${targetUser.email || t('adminUsers.fallbacks.noEmail')})`
                    : `ID ${userId}`;
            const currentRoleLabel = currentRole
                ? t(`adminUsers.roles.${currentRole}`, { defaultValue: currentRole })
                : t('adminUsers.roles.unknown');
            const newRoleLabel = t(`adminUsers.roles.${newRole}`, { defaultValue: newRole });

            requestConfirmation({
                title: t('adminUsers.confirm.roleTitle'),
                message: t('adminUsers.confirm.roleMessage', {
                    user: userLabel,
                    currentRole: currentRoleLabel,
                    newRole: newRoleLabel,
                }),
                confirmLabel: t('adminUsers.actions.changeRole'),
                confirmVariant: ['admin', 'superadmin'].includes(newRole) ? 'danger' : 'primary',
                onConfirm: async () => {
                    try {
                        await updateUserRole(userId, newRole);
                        setUsers((prev) =>
                            prev.map((user) => (user.id === userId ? { ...user, role: newRole } : user))
                        );
                        toast.success(t('adminUsers.toasts.roleChanged'));
                    } catch (error) {
                        toast.error(parseApiError(error, t('adminUsers.toasts.roleError')).message);
                    }
                },
            });
        },
        [requestConfirmation, t]
    );

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
                    toast.error(t('adminUsers.toasts.selectGroup'));
                    return;
                }

                await enrollUserInCourse(userId, courseId, {
                    courseType: normalizedCourseType,
                    groupId:
                        ['offline', 'online_live'].includes(normalizedCourseType) && selectedGroupId
                            ? Number(selectedGroupId)
                            : undefined,
                });
                toast.success(t('adminUsers.toasts.enrolled'));
            } catch (error) {
                toast.error(parseApiError(error, t('adminUsers.toasts.enrollError')).message);
            }
        },
        [courses, selectedEnrollmentGroupIds, t]
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
