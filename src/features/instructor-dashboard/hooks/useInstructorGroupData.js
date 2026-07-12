import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import { parseApiError } from '@shared/api/error';
import { toArray } from '@shared/api/response';
import {
    fetchCourseDeliveryContext,
    fetchCourseGroups,
} from '@features/courseGroups/api';
import { fetchGroupRoster } from '@features/courseGroups/roster';
import { isIndividualGroup } from '@features/instructor-dashboard/utils/groupCourses';

export const useInstructorGroupData = ({ t } = {}) => {
    const [groups, setGroups] = useState([]);
    const [deliveryContext, setDeliveryContext] = useState(null);
    const [individualStudentsByGroupId, setIndividualStudentsByGroupId] = useState({});
    const [loadingGroups, setLoadingGroups] = useState(false);
    const loadGroupsRequestRef = useRef(0);

    const loadGroups = useCallback(async (courseId) => {
        const requestId = loadGroupsRequestRef.current + 1;
        loadGroupsRequestRef.current = requestId;
        const isCurrentRequest = () => loadGroupsRequestRef.current === requestId;

        if (!courseId) {
            setGroups([]);
            setDeliveryContext(null);
            setIndividualStudentsByGroupId({});
            return;
        }

        setLoadingGroups(true);
        try {
            const [response, context] = await Promise.all([
                fetchCourseGroups({ courseId: Number(courseId) }),
                fetchCourseDeliveryContext(Number(courseId)).catch(() => null),
            ]);
            if (!isCurrentRequest()) return;

            setGroups(toArray(response));
            setDeliveryContext(context);
        } catch (error) {
            if (!isCurrentRequest()) return;

            console.error('Failed to load course groups', error);
            setGroups([]);
            setDeliveryContext(null);
            setIndividualStudentsByGroupId({});
            toast.error(
                parseApiError(
                    error,
                    t?.('instructorDashboard.groupForm.toasts.loadFailed') ??
                        'Failed to load course groups'
                ).message
            );
        } finally {
            if (isCurrentRequest()) {
                setLoadingGroups(false);
            }
        }
    }, [t]);

    useEffect(() => {
        const individualGroups = groups.filter((group) => isIndividualGroup(group));
        if (!individualGroups.length) {
            setIndividualStudentsByGroupId({});
            return undefined;
        }

        let cancelled = false;

        Promise.all(
            individualGroups.map((group) =>
                fetchGroupRoster({ groupId: Number(group.id), page: 1, limit: 1 })
                    .then((rows) => [group.id, rows[0] || null])
                    .catch((error) => {
                        console.error('Failed to load individual group student', error);
                        return [group.id, null];
                    })
            )
        ).then((entries) => {
            if (cancelled) return;
            setIndividualStudentsByGroupId(Object.fromEntries(entries));
        });

        return () => {
            cancelled = true;
        };
    }, [groups]);

    return {
        deliveryContext,
        groups,
        individualStudentsByGroupId,
        loadingGroups,
        loadGroups,
    };
};
