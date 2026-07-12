import { useCallback, useState } from 'react';
import { toast } from 'react-hot-toast';
import { parseApiError } from '@shared/api/error';
import {
    createCourseGroup,
    createIndividualCourseGroup,
    updateCourseGroup,
} from '@features/courseGroups/api';
import { enrollUserInCourse } from '@features/enrollments/api';
import { normalizeEnrollmentCourseType } from '@features/enrollments/policy';
import {
    buildCreateGroupPayload,
    buildEnrollStudentRequest,
    buildUpdateGroupPatch,
    getCreateGroupValidationKey,
    getEnrollStudentValidationKey,
    getUpdateGroupValidationKey,
} from '@features/instructor-dashboard/utils/groupCourses';

export const useInstructorGroupMutations = ({
    createForm,
    editForm,
    editingGroupId,
    enrollForm,
    enrollGroup,
    loadGroups,
    loadGroupStudents,
    onCreateSuccess,
    onEnrollSuccess,
    onUpdateSuccess,
    selectedCourse,
    selectedCourseId,
    t,
} = {}) => {
    const [savingGroup, setSavingGroup] = useState(false);
    const [savingGroupUpdate, setSavingGroupUpdate] = useState(false);
    const [enrolling, setEnrolling] = useState(false);

    const handleCreateGroup = useCallback(async () => {
        const validationKey = getCreateGroupValidationKey(selectedCourse, createForm);
        if (validationKey) {
            toast.error(t(validationKey));
            return;
        }

        setSavingGroup(true);
        try {
            const {
                isIndividual,
                payload,
            } = buildCreateGroupPayload(selectedCourse, createForm);
            const created = isIndividual
                ? await createIndividualCourseGroup(payload)
                : await createCourseGroup(payload);
            const createdGroup = isIndividual ? created?.group : created;

            toast.success(
                isIndividual
                    ? t('instructorDashboard.groupsSection.toasts.individualCreated')
                    : t('instructorDashboard.groupsSection.toasts.groupCreated')
            );
            await loadGroups(selectedCourse.id);
            onCreateSuccess?.(createdGroup);
        } catch (error) {
            console.error('Failed to create group', error);
            toast.error(
                parseApiError(error, t('instructorDashboard.groupForm.toasts.createFailed')).message
            );
        } finally {
            setSavingGroup(false);
        }
    }, [createForm, loadGroups, onCreateSuccess, selectedCourse, t]);

    const handleUpdateGroup = useCallback(async () => {
        if (!editingGroupId) {
            toast.error(t('instructorDashboard.groupsSection.toasts.selectGroupForEdit'));
            return;
        }

        const validationKey = getUpdateGroupValidationKey(editForm);
        if (validationKey) {
            toast.error(t(validationKey));
            return;
        }

        setSavingGroupUpdate(true);
        try {
            const patch = buildUpdateGroupPatch(editForm);

            await updateCourseGroup(Number(editingGroupId), patch);

            toast.success(t('instructorDashboard.groupsSection.toasts.groupUpdated'));
            await loadGroups(selectedCourseId);
            onUpdateSuccess?.();
        } catch (error) {
            console.error('Failed to update group', error);
            toast.error(
                parseApiError(error, t('instructorDashboard.groupForm.toasts.updateFailed')).message
            );
        } finally {
            setSavingGroupUpdate(false);
        }
    }, [editingGroupId, editForm, loadGroups, onUpdateSuccess, selectedCourseId, t]);

    const handleEnrollStudent = useCallback(async () => {
        if (!selectedCourse || !enrollGroup) return;
        const currentGroup = enrollGroup;

        const validationKey = getEnrollStudentValidationKey(enrollForm);
        if (validationKey) {
            toast.error(t(validationKey));
            return;
        }

        setEnrolling(true);
        try {
            const enrollRequest = buildEnrollStudentRequest({
                course: selectedCourse,
                form: enrollForm,
                group: currentGroup,
                normalizeCourseTypeForEnrollment: normalizeEnrollmentCourseType,
            });
            await enrollUserInCourse(
                enrollRequest.userId,
                enrollRequest.courseId,
                enrollRequest.options
            );

            toast.success(t('instructorDashboard.groupsSection.toasts.studentAdded'));
            onEnrollSuccess?.(currentGroup);
            await loadGroupStudents(currentGroup);
            await loadGroups(selectedCourse.id);
        } catch (error) {
            console.error('Failed to enroll student to group', error);
            toast.error(
                parseApiError(error, t('instructorDashboard.enrollGroupStudentModal.toasts.enrollFailed')).message
            );
        } finally {
            setEnrolling(false);
        }
    }, [
        enrollForm,
        enrollGroup,
        loadGroupStudents,
        loadGroups,
        onEnrollSuccess,
        selectedCourse,
        t,
    ]);

    return {
        enrolling,
        handleCreateGroup,
        handleEnrollStudent,
        handleUpdateGroup,
        savingGroup,
        savingGroupUpdate,
    };
};
