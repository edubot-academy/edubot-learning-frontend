import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import { parseApiError } from '@shared/api/error';
import { fetchGroupRoster } from '@features/courseGroups/roster';
import {
    ENROLL_GROUP_FORM_DEFAULT,
    GROUP_FORM_DEFAULT,
    buildGroupCreateFormDefaults,
    buildSuggestedGroupCode,
    getNextCreateGroupForm,
    mapGroupRosterToStudentRows,
    normalizeGroupForm,
} from '@features/instructor-dashboard/utils/groupCourses';
import { useInstructorGroupStudentOptions } from './useInstructorGroupStudentOptions';

export const useInstructorGroupModals = ({
    canEnrollInGroup,
    groups = [],
    selectedCourse,
    selectedCourseId,
    t,
} = {}) => {
    const [showEnrollModal, setShowEnrollModal] = useState(false);
    const [enrollGroup, setEnrollGroup] = useState(null);
    const [enrollForm, setEnrollForm] = useState(ENROLL_GROUP_FORM_DEFAULT);
    const [groupStudents, setGroupStudents] = useState([]);
    const [loadingGroupStudents, setLoadingGroupStudents] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [createForm, setCreateForm] = useState(GROUP_FORM_DEFAULT);
    const [editingGroupId, setEditingGroupId] = useState(null);
    const [editForm, setEditForm] = useState(GROUP_FORM_DEFAULT);
    const previousCourseIdRef = useRef('');
    const groupStudentsRequestRef = useRef(0);
    const {
        loadingUserOptions,
        resetStudentOptions,
        setShowDropdown,
        setUserSearch: setEnrollUserSearch,
        showDropdown,
        studentOptions,
        userSearch: enrollUserSearch,
    } = useInstructorGroupStudentOptions({
        enabled: showEnrollModal || (showCreateModal && createForm.deliveryMode === 'individual'),
        t,
    });

    const selectedEditingGroup = useMemo(
        () => groups.find((group) => String(group.id) === String(editingGroupId)) || null,
        [groups, editingGroupId]
    );

    const resetCreateForm = useCallback(() => {
        setCreateForm((prev) => buildGroupCreateFormDefaults(selectedCourse, groups, prev));
    }, [selectedCourse, groups]);

    useEffect(() => {
        if (previousCourseIdRef.current === selectedCourseId) return;
        previousCourseIdRef.current = selectedCourseId;
        setEditingGroupId(null);
        setEditForm(GROUP_FORM_DEFAULT);
        setCreateForm((prev) => buildGroupCreateFormDefaults(selectedCourse, groups, prev));
    }, [groups, selectedCourse, selectedCourseId]);

    useEffect(() => {
        if (!selectedEditingGroup) {
            setEditForm(GROUP_FORM_DEFAULT);
            return;
        }

        setEditForm(normalizeGroupForm(selectedEditingGroup));
    }, [selectedEditingGroup]);

    const handleCreateFormChange = useCallback(
        (field, value) => {
            if (field === 'deliveryMode') {
                resetStudentOptions();
            }

            setCreateForm((prev) => getNextCreateGroupForm({
                field,
                groups,
                previousForm: prev,
                selectedCourse,
                value,
            }));
        },
        [selectedCourse, groups, resetStudentOptions]
    );

    const handleEditFormChange = useCallback((field, value) => {
        setEditForm((prev) => ({
            ...prev,
            [field]: value,
        }));
    }, []);

    const handleEnrollFormChange = useCallback((field, value) => {
        setEnrollForm((prev) => ({
            ...prev,
            [field]: value,
        }));
    }, []);

    const loadGroupStudents = useCallback(async (group) => {
        const requestId = groupStudentsRequestRef.current + 1;
        groupStudentsRequestRef.current = requestId;
        const isCurrentRequest = () => groupStudentsRequestRef.current === requestId;

        if (!group?.courseId && !selectedCourseId) {
            setGroupStudents([]);
            setLoadingGroupStudents(false);
            return;
        }

        setLoadingGroupStudents(true);
        try {
            const rows = await fetchGroupRoster({
                groupId: Number(group.id),
                page: 1,
                limit: 100,
            });
            if (!isCurrentRequest()) return;

            setGroupStudents(
                mapGroupRosterToStudentRows(
                    rows,
                    t('instructorDashboard.groupsSection.fallbacks.student')
                )
            );
        } catch (error) {
            if (!isCurrentRequest()) return;

            console.error('Failed to load group students', error);
            toast.error(
                parseApiError(error, t('instructorDashboard.enrollGroupStudentModal.toasts.studentsLoadFailed')).message
            );
            setGroupStudents([]);
        } finally {
            if (isCurrentRequest()) {
                setLoadingGroupStudents(false);
            }
        }
    }, [selectedCourseId, t]);

    const handleOpenEnrollModal = useCallback((group) => {
        if (!canEnrollInGroup(group)) {
            toast.error(t('instructorDashboard.groupsSection.toasts.enrollmentNotReady'));
            return;
        }
        setEnrollGroup(group);
        setEnrollForm(ENROLL_GROUP_FORM_DEFAULT);
        setGroupStudents([]);
        resetStudentOptions();
        setShowEnrollModal(true);
        loadGroupStudents(group);
    }, [canEnrollInGroup, loadGroupStudents, resetStudentOptions, t]);

    const handleOpenCreateModal = useCallback(() => {
        resetCreateForm();
        resetStudentOptions();
        setShowCreateModal(true);
    }, [resetCreateForm, resetStudentOptions]);

    const handleOpenEditModal = useCallback((group) => {
        setEditingGroupId(String(group.id));
        setShowEditModal(true);
    }, []);

    const handleCloseEnrollModal = useCallback(() => {
        groupStudentsRequestRef.current += 1;
        setShowEnrollModal(false);
        setEnrollGroup(null);
        setEnrollForm(ENROLL_GROUP_FORM_DEFAULT);
        setGroupStudents([]);
        setLoadingGroupStudents(false);
        resetStudentOptions();
    }, [resetStudentOptions]);

    const handleCloseCreateModal = useCallback(() => {
        setShowCreateModal(false);
        resetCreateForm();
        resetStudentOptions();
    }, [resetCreateForm, resetStudentOptions]);

    const handleCloseEditModal = useCallback(() => {
        setShowEditModal(false);
        setEditingGroupId(null);
        setEditForm(GROUP_FORM_DEFAULT);
    }, []);

    const handleCreateSuccess = useCallback((createdGroup) => {
        resetCreateForm();
        resetStudentOptions();
        setShowCreateModal(false);
        if (createdGroup?.id) setEditingGroupId(String(createdGroup.id));
    }, [resetCreateForm, resetStudentOptions]);

    const handleUpdateSuccess = useCallback(() => {
        setShowEditModal(false);
    }, []);

    const handleEnrollSuccess = useCallback(() => {
        groupStudentsRequestRef.current += 1;
        setShowEnrollModal(false);
        setEnrollGroup(null);
        setEnrollForm(ENROLL_GROUP_FORM_DEFAULT);
        setGroupStudents([]);
        setLoadingGroupStudents(false);
        resetStudentOptions();
    }, [resetStudentOptions]);

    const handleRegenerateCreateCode = useCallback(() => {
        handleCreateFormChange(
            'code',
            buildSuggestedGroupCode(selectedCourse, groups, createForm.startDate)
        );
    }, [createForm.startDate, groups, handleCreateFormChange, selectedCourse]);

    const handleRegenerateEditCode = useCallback(() => {
        handleEditFormChange(
            'code',
            buildSuggestedGroupCode(selectedCourse, groups, editForm.startDate)
        );
    }, [editForm.startDate, groups, handleEditFormChange, selectedCourse]);

    return {
        createForm,
        editForm,
        editingGroupId,
        enrollForm,
        enrollGroup,
        enrollUserSearch,
        groupStudents,
        handleCloseCreateModal,
        handleCloseEditModal,
        handleCloseEnrollModal,
        handleCreateFormChange,
        handleCreateSuccess,
        handleEditFormChange,
        handleEnrollFormChange,
        handleEnrollSuccess,
        handleOpenCreateModal,
        handleOpenEditModal,
        handleOpenEnrollModal,
        handleRegenerateCreateCode,
        handleRegenerateEditCode,
        handleUpdateSuccess,
        loadGroupStudents,
        loadingGroupStudents,
        loadingUserOptions,
        setEnrollUserSearch,
        setShowDropdown,
        showCreateModal,
        showDropdown,
        showEditModal,
        showEnrollModal,
        studentOptions,
    };
};
