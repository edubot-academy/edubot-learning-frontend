import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { parseApiError } from '@shared/api/error';
import { fetchUsers } from '@features/users/api';
import { mapUsersToStudentOptions } from '@features/instructor-dashboard/utils/groupCourses';

export const useInstructorGroupStudentOptions = ({
    enabled = false,
    t,
} = {}) => {
    const [userSearch, setUserSearch] = useState('');
    const [studentOptions, setStudentOptions] = useState([]);
    const [loadingUserOptions, setLoadingUserOptions] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);

    const resetStudentOptions = useCallback(() => {
        setUserSearch('');
        setStudentOptions([]);
        setLoadingUserOptions(false);
        setShowDropdown(false);
    }, []);

    useEffect(() => {
        if (!enabled) return undefined;

        if (!userSearch || userSearch.trim().length < 2) {
            setStudentOptions([]);
            setLoadingUserOptions(false);
            return undefined;
        }

        let cancelled = false;
        setLoadingUserOptions(true);

        fetchUsers({
            page: 1,
            limit: 10,
            search: userSearch.trim(),
            role: 'student',
        })
            .then((res) => {
                if (cancelled) return;

                setStudentOptions(mapUsersToStudentOptions(res));
            })
            .catch((error) => {
                console.error('Failed to fetch users', error);
                if (!cancelled) {
                    toast.error(
                        parseApiError(
                            error,
                            t?.('instructorDashboard.enrollGroupStudentModal.toasts.studentSearchFailed') ??
                                'Failed to search students'
                        ).message
                    );
                    setStudentOptions([]);
                }
            })
            .finally(() => {
                if (!cancelled) setLoadingUserOptions(false);
            });

        return () => {
            cancelled = true;
        };
    }, [enabled, t, userSearch]);

    return {
        loadingUserOptions,
        resetStudentOptions,
        setShowDropdown,
        setUserSearch,
        showDropdown,
        studentOptions,
        userSearch,
    };
};
