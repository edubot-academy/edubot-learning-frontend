
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import { parseApiError } from '@shared/api/error';
import { getDeliveryModeLabel } from '@shared/i18n/enumLabels';
import {
    DashboardCardSkeleton,
    DashboardFilterBar,
    DashboardInsetPanel,
    DashboardMetricCard,
    DashboardSectionHeader,
    EmptyState,
} from '@components/ui/dashboard';
import { COURSE_GROUP_STATUS } from '@shared/contracts';
import {
    createCourseGroup,
    createIndividualCourseGroup,
    enrollUserInCourse,
    fetchCourseGroups,
    fetchCourseGroupSessionGenerationPreview,
    fetchUsers,
    generateCourseGroupSessions,
    updateCourseGroup,
} from '@services/api';
import {
    FiBookOpen,
    FiCalendar,
    FiClock,
    FiEdit3,
    FiLayers,
    FiMapPin,
    FiPlus,
    FiUsers,
} from 'react-icons/fi';
import EnrollGroupStudentModal from './modals/EnrollGroupStudentModal.jsx';
import GenerateGroupSessionsModal from './modals/GenerateGroupSessionsModal.jsx';
import GroupFormModal from './modals/GroupFormModal.jsx';
import { normalizeEnrollmentCourseType } from '@features/enrollments/policy';
import { getDashboardPath } from '@shared/utils/navigation';
import { fetchGroupRoster } from '@features/courseGroups/roster';

const DELIVERY_TYPES = new Set(['offline', 'online_live']);
const GROUP_FORM_DEFAULT = {
    name: '',
    code: '',
    deliveryMode: 'group',
    studentId: '',
    createFirstSession: false,
    status: COURSE_GROUP_STATUS.PLANNED,
    startDate: '',
    endDate: '',
    seatLimit: '',
    timezone: '',
    location: '',
    meetingProvider: '',
    meetingUrl: '',
    scheduleNote: '',
    scheduleBlocks: [{ day: '', startTime: '', endTime: '' }],
    instructorId: '',
};

const toDateInputValue = (value) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toISOString().slice(0, 10);
};

const addDays = (value, days) => {
    const date = new Date(`${value}T00:00:00`);
    if (Number.isNaN(date.getTime())) return value;
    date.setDate(date.getDate() + days);
    return date.toISOString().slice(0, 10);
};

const buildGenerationRange = (group = {}) => {
    const today = toDateInputValue(new Date());
    const startDate = group.startDate && group.startDate > today ? group.startDate : today;
    const endDate = group.endDate && group.endDate >= startDate ? group.endDate : addDays(startDate, 28);

    return {
        fromDate: startDate,
        toDate: endDate,
    };
};

const normalizeCourseType = (course = {}) =>
    String(course.courseType || course.type || '').trim().toLowerCase();

const isGroupEligibleCourse = (course = {}) =>
    DELIVERY_TYPES.has(normalizeCourseType(course)) &&
    course.status === 'approved' &&
    course.isPublished === true;

const formatDate = (value) => {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return date.toLocaleDateString('ky-KG', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
};

const statusTone = {
    active: 'green',
    planned: 'amber',
    completed: 'blue',
    cancelled: 'red',
};

const isIndividualGroup = (group = {}) => group.deliveryMode === 'individual';

const deliveryModeTone = (value) =>
    value === 'individual'
        ? 'bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-200'
        : 'bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-200';

const slugifySegment = (value) =>
    String(value || '')
        .trim()
        .toUpperCase()
        .replace(/[^A-Z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 10);

const buildSuggestedGroupCode = (course, groups = [], startDate) => {
    const courseToken =
        slugifySegment(course?.shortCode) ||
        slugifySegment(course?.code) ||
        slugifySegment(course?.title) ||
        'GROUP';
    const date = startDate ? new Date(startDate) : null;
    const year =
        date && !Number.isNaN(date.getTime()) ? String(date.getFullYear()) : String(new Date().getFullYear());
    const month =
        date && !Number.isNaN(date.getTime())
            ? String(date.getMonth() + 1).padStart(2, '0')
            : String(new Date().getMonth() + 1).padStart(2, '0');
    const sequence = String((groups?.length || 0) + 1).padStart(2, '0');
    return `${courseToken}-${year}-${month}-G${sequence}`;
};

const resolveDefaultInstructorId = (course = null) => {
    const rawValue = course?.instructorId ?? course?.instructor?.id ?? '';
    return rawValue ? String(rawValue) : '';
};

const resolveDefaultTimezone = (course = null) =>
    String(course?.timezone || '').trim() || 'Asia/Bishkek';

const normalizeGroupForm = (group = {}) => ({
    name: group.name || '',
    code: group.code || '',
    deliveryMode: group.deliveryMode || 'group',
    status: group.status || COURSE_GROUP_STATUS.PLANNED,
    startDate: group.startDate || '',
    endDate: group.endDate || '',
    seatLimit: group.seatLimit ? String(group.seatLimit) : '',
    timezone: group.timezone || '',
    location: group.location || '',
    meetingProvider: group.meetingProvider || '',
    meetingUrl: group.meetingUrl || '',
    scheduleNote: group.scheduleNote || '',
    scheduleBlocks: Array.isArray(group.scheduleBlocks) && group.scheduleBlocks.length
        ? group.scheduleBlocks.map((block) => ({
            day: block.day || '',
            startTime: block.startTime || '',
            endTime: block.endTime || '',
        }))
        : [{ day: '', startTime: '', endTime: '' }],
    instructorId: group.instructorId ? String(group.instructorId) : '',
});

const formatScheduleBlocks = (blocks = [], t) =>
    (Array.isArray(blocks) ? blocks : [])
        .filter((block) => block?.day && block?.startTime && block?.endTime)
        .map((block) => {
            const day = String(block.day).toLowerCase();
            return `${t(`instructorDashboard.groupForm.weekdays.${day}`, { defaultValue: block.day })} · ${block.startTime}–${block.endTime}`;
        });

const hasCompleteScheduleBlock = (blocks = []) =>
    (Array.isArray(blocks) ? blocks : []).some(
        (block) => block?.day && block?.startTime && block?.endTime
    );

const getStudentDisplayName = (student) => {
    if (!student) return '';
    return student.fullName || student.name || student.email || (student.id ? `Student #${student.id}` : '');
};

const GroupsSection = ({ courses = [] }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const sessionsPath = getDashboardPath('instructor', 'sessions');
    const deliveryCourses = useMemo(
        () => courses.filter(isGroupEligibleCourse),
        [courses]
    );
    const pendingDeliveryCourses = useMemo(
        () =>
            courses.filter(
                (course) =>
                    DELIVERY_TYPES.has(normalizeCourseType(course)) &&
                    !isGroupEligibleCourse(course)
            ),
        [courses]
    );
    const requestedCourseId = searchParams.get('courseId');
    const [selectedCourseId, setSelectedCourseId] = useState('');
    const [groups, setGroups] = useState([]);
    const [individualStudentsByGroupId, setIndividualStudentsByGroupId] = useState({});
    const [loadingGroups, setLoadingGroups] = useState(false);
    const [showEnrollModal, setShowEnrollModal] = useState(false);
    const [enrollGroup, setEnrollGroup] = useState(null);
    const [enrollForm, setEnrollForm] = useState({ userId: '', discountPercentage: '' });
    const [enrolling, setEnrolling] = useState(false);
    const [groupStudents, setGroupStudents] = useState([]);
    const [loadingGroupStudents, setLoadingGroupStudents] = useState(false);
    const [enrollUserSearch, setEnrollUserSearch] = useState('');
    const [studentOptions, setStudentOptions] = useState([]);
    const [loadingUserOptions, setLoadingUserOptions] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [createForm, setCreateForm] = useState(GROUP_FORM_DEFAULT);
    const [editingGroupId, setEditingGroupId] = useState(null);
    const [editForm, setEditForm] = useState(GROUP_FORM_DEFAULT);
    const [savingGroup, setSavingGroup] = useState(false);
    const [savingGroupUpdate, setSavingGroupUpdate] = useState(false);
    const [showGenerateModal, setShowGenerateModal] = useState(false);
    const [generationGroup, setGenerationGroup] = useState(null);
    const [generationForm, setGenerationForm] = useState({ fromDate: '', toDate: '' });
    const [generationPreview, setGenerationPreview] = useState(null);
    const [previewLoading, setPreviewLoading] = useState(false);
    const [generatingSessions, setGeneratingSessions] = useState(false);
    const previousCourseIdRef = useRef('');
    const generationPreviewRequestRef = useRef(0);

    useEffect(() => {
        const hasRequestedCourse = requestedCourseId
            && deliveryCourses.some((course) => String(course.id) === String(requestedCourseId));

        if (hasRequestedCourse && String(selectedCourseId) !== String(requestedCourseId)) {
            setSelectedCourseId(String(requestedCourseId));
            return;
        }

        if (selectedCourseId && !deliveryCourses.some((course) => String(course.id) === String(selectedCourseId))) {
            setSelectedCourseId(deliveryCourses.length ? String(deliveryCourses[0].id) : '');
            return;
        }

        if (!selectedCourseId && deliveryCourses.length) {
            setSelectedCourseId(hasRequestedCourse ? String(requestedCourseId) : String(deliveryCourses[0].id));
        }
    }, [deliveryCourses, requestedCourseId, selectedCourseId]);

    const selectedCourse = useMemo(
        () =>
            deliveryCourses.find((course) => String(course.id) === String(selectedCourseId)) || null,
        [deliveryCourses, selectedCourseId]
    );

    const selectedEditingGroup = useMemo(
        () => groups.find((group) => String(group.id) === String(editingGroupId)) || null,
        [groups, editingGroupId]
    );

    const loadGroups = useCallback(async (courseId) => {
        if (!courseId) {
            setGroups([]);
            setIndividualStudentsByGroupId({});
            return;
        }

        setLoadingGroups(true);
        try {
            const response = await fetchCourseGroups({ courseId: Number(courseId) });
            const items = Array.isArray(response)
                ? response
                : Array.isArray(response?.items)
                    ? response.items
                    : Array.isArray(response?.data)
                        ? response.data
                        : [];
            setGroups(items);
        } catch (error) {
            console.error('Failed to load course groups', error);
            setGroups([]);
            setIndividualStudentsByGroupId({});
            toast.error(
                parseApiError(error, t('instructorDashboard.groupForm.toasts.loadFailed')).message
            );
        } finally {
            setLoadingGroups(false);
        }
    }, [t]);

    useEffect(() => {
        loadGroups(selectedCourseId);
    }, [selectedCourseId, loadGroups]);

    useEffect(() => {
        const individualGroups = groups.filter((group) => isIndividualGroup(group));
        if (!individualGroups.length) {
            setIndividualStudentsByGroupId({});
            return;
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

    useEffect(() => {
        if (previousCourseIdRef.current === selectedCourseId) return;
        previousCourseIdRef.current = selectedCourseId;
        setEditingGroupId(null);
        setEditForm(GROUP_FORM_DEFAULT);
        setCreateForm((prev) => ({
            ...GROUP_FORM_DEFAULT,
            timezone: resolveDefaultTimezone(selectedCourse),
            meetingProvider: prev.meetingProvider,
            code: buildSuggestedGroupCode(selectedCourse, groups, ''),
            instructorId: resolveDefaultInstructorId(selectedCourse),
        }));
    }, [groups, selectedCourse, selectedCourseId]);

    useEffect(() => {
        if (!selectedEditingGroup) {
            setEditForm(GROUP_FORM_DEFAULT);
            return;
        }

        setEditForm(normalizeGroupForm(selectedEditingGroup));
    }, [selectedEditingGroup]);

    const metrics = useMemo(() => {
        const planned = groups.filter((group) => group.status === 'planned').length;
        const active = groups.filter((group) => group.status === 'active').length;
        const totalSeats = groups.reduce((sum, group) => sum + Number(group.seatLimit || 0), 0);
        return {
            total: groups.length,
            planned,
            active,
            seats: totalSeats || '—',
        };
    }, [groups]);

    const handleCreateFormChange = useCallback(
        (field, value) => {
            if (field === 'deliveryMode') {
                setEnrollUserSearch('');
                setStudentOptions([]);
                setShowDropdown(false);
            }

            setCreateForm((prev) => {
                const next = {
                    ...prev,
                    [field]: value,
                };

                if (field === 'deliveryMode') {
                    next.seatLimit = value === 'individual' ? '1' : '';
                    next.studentId = '';
                    next.createFirstSession = false;
                    if (value === 'individual') {
                        next.code = '';
                    } else if (!prev.code) {
                        next.code = buildSuggestedGroupCode(selectedCourse, groups, prev.startDate);
                    }
                }

                if (field === 'startDate') {
                    if (!prev.code || prev.code === buildSuggestedGroupCode(selectedCourse, groups, prev.startDate)) {
                        next.code = buildSuggestedGroupCode(
                            selectedCourse,
                            groups,
                            value
                        );
                    }
                }

                return next;
            });
        },
        [selectedCourse, groups]
    );

    const handleEditFormChange = useCallback((field, value) => {
        setEditForm((prev) => ({
            ...prev,
            [field]: value,
        }));
    }, []);

    const resetCreateForm = useCallback(() => {
        setCreateForm((prev) => ({
            ...GROUP_FORM_DEFAULT,
            timezone: resolveDefaultTimezone(selectedCourse),
            meetingProvider: prev.meetingProvider,
            code: buildSuggestedGroupCode(selectedCourse, groups, ''),
            instructorId: resolveDefaultInstructorId(selectedCourse),
        }));
    }, [selectedCourse, groups]);

    const handleCreateGroup = useCallback(async () => {
        if (!selectedCourse?.id) {
            toast.error(t('instructorDashboard.groupsSection.toasts.selectCourse'));
            return;
        }

        const isIndividual = createForm.deliveryMode === 'individual';
        const studentIdValue = Number(createForm.studentId);

        if (!createForm.name.trim()) {
            toast.error(
                isIndividual
                    ? t('instructorDashboard.groupsSection.toasts.individualNameRequired')
                    : t('instructorDashboard.groupsSection.toasts.groupNameAndCodeRequired')
            );
            return;
        }

        if (!isIndividual && !createForm.code.trim()) {
            toast.error(t('instructorDashboard.groupsSection.toasts.groupNameAndCodeRequired'));
            return;
        }

        if (isIndividual && (!studentIdValue || Number.isNaN(studentIdValue))) {
            toast.error(t('instructorDashboard.groupsSection.toasts.studentRequired'));
            return;
        }

        if (
            isIndividual &&
            createForm.createFirstSession &&
            (!createForm.startDate || !hasCompleteScheduleBlock(createForm.scheduleBlocks))
        ) {
            toast.error(t('instructorDashboard.groupsSection.toasts.firstSessionScheduleRequired'));
            return;
        }

        setSavingGroup(true);
        try {
            const commonPayload = {
                courseId: Number(selectedCourse.id),
                name: createForm.name.trim(),
                startDate: createForm.startDate || undefined,
                endDate: createForm.endDate || undefined,
                timezone: createForm.timezone || undefined,
                location: createForm.location || undefined,
                meetingProvider: createForm.meetingProvider || undefined,
                meetingUrl: createForm.meetingUrl || undefined,
                scheduleBlocks: createForm.scheduleBlocks,
                instructorId: createForm.instructorId ? Number(createForm.instructorId) : undefined,
            };
            const created = isIndividual
                ? await createIndividualCourseGroup({
                      ...commonPayload,
                      studentId: studentIdValue,
                      createFirstSession: Boolean(createForm.createFirstSession),
                  })
                : await createCourseGroup({
                      ...commonPayload,
                      code: createForm.code.trim(),
                      deliveryMode: 'group',
                      status: createForm.status || undefined,
                      seatLimit: createForm.seatLimit ? Number(createForm.seatLimit) : undefined,
                      scheduleNote: createForm.scheduleNote || undefined,
                  });
            const createdGroup = isIndividual ? created?.group : created;

            toast.success(
                isIndividual
                    ? t('instructorDashboard.groupsSection.toasts.individualCreated')
                    : t('instructorDashboard.groupsSection.toasts.groupCreated')
            );
            await loadGroups(selectedCourse.id);
            resetCreateForm();
            setEnrollUserSearch('');
            setStudentOptions([]);
            setShowDropdown(false);
            setShowCreateModal(false);
            if (createdGroup?.id) setEditingGroupId(String(createdGroup.id));
        } catch (error) {
            console.error('Failed to create group', error);
            toast.error(
                parseApiError(error, t('instructorDashboard.groupForm.toasts.createFailed')).message
            );
        } finally {
            setSavingGroup(false);
        }
    }, [selectedCourse, createForm, loadGroups, resetCreateForm, t]);

    const handleUpdateGroup = useCallback(async () => {
        if (!editingGroupId) {
            toast.error(t('instructorDashboard.groupsSection.toasts.selectGroupForEdit'));
            return;
        }

        const isIndividual = editForm.deliveryMode === 'individual';

        if (!editForm.name.trim() || (!isIndividual && !editForm.code.trim())) {
            toast.error(t('instructorDashboard.groupsSection.toasts.groupNameAndCodeRequired'));
            return;
        }

        setSavingGroupUpdate(true);
        try {
            const patch = {
                name: editForm.name.trim(),
                status: editForm.status || undefined,
                startDate: editForm.startDate || undefined,
                endDate: editForm.endDate || undefined,
                seatLimit: editForm.seatLimit ? Number(editForm.seatLimit) : undefined,
                timezone: editForm.timezone || undefined,
                location: editForm.location || undefined,
                meetingProvider: editForm.meetingProvider || undefined,
                meetingUrl: editForm.meetingUrl || undefined,
                scheduleNote: editForm.scheduleNote || undefined,
                scheduleBlocks: editForm.scheduleBlocks,
                instructorId: editForm.instructorId ? Number(editForm.instructorId) : undefined,
            };

            if (!isIndividual) {
                patch.code = editForm.code.trim();
            }

            await updateCourseGroup(Number(editingGroupId), patch);

            toast.success(t('instructorDashboard.groupsSection.toasts.groupUpdated'));
            await loadGroups(selectedCourseId);
            setShowEditModal(false);
        } catch (error) {
            console.error('Failed to update group', error);
            toast.error(
                parseApiError(error, t('instructorDashboard.groupForm.toasts.updateFailed')).message
            );
        } finally {
            setSavingGroupUpdate(false);
        }
    }, [editingGroupId, editForm, loadGroups, selectedCourseId, t]);

    const loadGroupStudents = useCallback(async (group) => {
        if (!group?.courseId && !selectedCourseId) {
            setGroupStudents([]);
            return;
        }

        setLoadingGroupStudents(true);
        try {
            const rows = await fetchGroupRoster({
                groupId: Number(group.id),
                page: 1,
                limit: 100,
            });
            const list = rows.map((student) => ({
                id: student.id,
                name: student.fullName || student.email || t('instructorDashboard.groupsSection.fallbacks.student'),
                email: student.email || '—',
                enrolledAt: student.enrolledAt,
            }));

            setGroupStudents(list);
        } catch (error) {
            console.error('Failed to load group students', error);
            toast.error(
                parseApiError(error, t('instructorDashboard.enrollGroupStudentModal.toasts.studentsLoadFailed')).message
            );
            setGroupStudents([]);
        } finally {
            setLoadingGroupStudents(false);
        }
    }, [selectedCourseId, t]);

    const handleOpenEnrollModal = useCallback((group) => {
        setEnrollGroup(group);
        setEnrollForm({ userId: '', discountPercentage: '' });
        setEnrollUserSearch('');
        setStudentOptions([]);
        setShowDropdown(false);
        setShowEnrollModal(true);
        loadGroupStudents(group);
    }, [loadGroupStudents]);

    const handleOpenCreateModal = useCallback(() => {
        resetCreateForm();
        setEnrollUserSearch('');
        setStudentOptions([]);
        setShowDropdown(false);
        setShowCreateModal(true);
    }, [resetCreateForm]);

    const handleOpenEditModal = useCallback((group) => {
        setEditingGroupId(String(group.id));
        setShowEditModal(true);
    }, []);

    const loadGenerationPreview = useCallback(async (group, form) => {
        if (!group?.id) return;
        const requestId = generationPreviewRequestRef.current + 1;
        generationPreviewRequestRef.current = requestId;
        setPreviewLoading(true);
        try {
            const data = await fetchCourseGroupSessionGenerationPreview(Number(group.id), form);
            if (generationPreviewRequestRef.current !== requestId) return;
            setGenerationPreview(data);
        } catch (error) {
            if (generationPreviewRequestRef.current !== requestId) return;
            console.error('Failed to load generation preview', error);
            toast.error(
                parseApiError(error, t('instructorDashboard.generateSessions.toasts.previewFailed')).message
            );
            setGenerationPreview(null);
        } finally {
            if (generationPreviewRequestRef.current === requestId) {
                setPreviewLoading(false);
            }
        }
    }, [t]);

    const handleOpenGenerateModal = useCallback((group) => {
        if (!Array.isArray(group?.scheduleBlocks) || !group.scheduleBlocks.length) {
            toast.error(t('instructorDashboard.groupsSection.toasts.defaultScheduleRequired'));
            return;
        }

        const nextRange = buildGenerationRange(group);
        generationPreviewRequestRef.current += 1;
        setGenerationGroup(group);
        setGenerationForm(nextRange);
        setGenerationPreview(null);
        setShowGenerateModal(true);
        loadGenerationPreview(group, nextRange);
    }, [loadGenerationPreview, t]);

    const handleGenerateSessions = useCallback(async () => {
        if (!generationGroup?.id) return;

        setGeneratingSessions(true);
        try {
            const result = await generateCourseGroupSessions(Number(generationGroup.id), generationForm);
            const createdCount = Number(result?.createdCount || 0);
            if (createdCount > 0) {
                toast.success(t('instructorDashboard.groupsSection.toasts.sessionsCreated', { count: createdCount }));
            } else {
                toast(t('instructorDashboard.groupsSection.toasts.noNewSessions'), {
                    icon: 'ℹ️',
                });
            }
            setShowGenerateModal(false);
            setGenerationGroup(null);
            setGenerationPreview(null);
        } catch (error) {
            console.error('Failed to generate sessions', error);
            toast.error(
                parseApiError(error, t('instructorDashboard.generateSessions.toasts.generateFailed')).message
            );
        } finally {
            setGeneratingSessions(false);
        }
    }, [generationForm, generationGroup, t]);

    useEffect(() => {
        const shouldSearchStudents = showEnrollModal || (showCreateModal && createForm.deliveryMode === 'individual');
        if (!shouldSearchStudents) return;

        if (!enrollUserSearch || enrollUserSearch.trim().length < 2) {
            setStudentOptions([]);
            setLoadingUserOptions(false);
            return;
        }

        let cancelled = false;
        setLoadingUserOptions(true);

        fetchUsers({
            page: 1,
            limit: 10,
            search: enrollUserSearch.trim(),
            role: 'student',
        })
            .then((res) => {
                if (cancelled) return;

                const rows = res?.data || res?.items || [];
                setStudentOptions(
                    rows.map((user) => ({
                        id: user.id,
                        name: user.fullName || user.email || `ID: ${user.id}`,
                        email: user.email || '',
                    }))
                );
            })
            .catch((error) => {
                console.error('Failed to fetch users', error);
                if (!cancelled) {
                    toast.error(
                        parseApiError(error, t('instructorDashboard.enrollGroupStudentModal.toasts.studentSearchFailed')).message
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
    }, [createForm.deliveryMode, enrollUserSearch, showCreateModal, showEnrollModal, t]);

    const handleEnrollStudent = useCallback(async () => {
        if (!selectedCourse || !enrollGroup) return;
        const currentGroup = enrollGroup;

        const userIdValue = Number(enrollForm.userId);
        if (!userIdValue || Number.isNaN(userIdValue)) {
            toast.error(t('instructorDashboard.groupsSection.toasts.invalidUserId'));
            return;
        }

        setEnrolling(true);
        try {
            await enrollUserInCourse(userIdValue, selectedCourse.id, {
                courseType: normalizeEnrollmentCourseType(selectedCourse.courseType),
                groupId: currentGroup.id,
                discountPercentage: enrollForm.discountPercentage
                    ? Number(enrollForm.discountPercentage)
                    : undefined,
            });

            toast.success(t('instructorDashboard.groupsSection.toasts.studentAdded'));
            setShowEnrollModal(false);
            setEnrollGroup(null);
            setEnrollForm({ userId: '', discountPercentage: '' });
            setEnrollUserSearch('');
            setStudentOptions([]);
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
    }, [selectedCourse, enrollGroup, enrollForm, loadGroupStudents, loadGroups, t]);

    if (!deliveryCourses.length) {
        return (
            <div className="space-y-6">
                <DashboardSectionHeader
                    eyebrow={t('instructorDashboard.groupsSection.header.eyebrow')}
                    title={t('instructorDashboard.groupsSection.header.title')}
                    description={t('instructorDashboard.groupsSection.header.description')}
                />
                <DashboardInsetPanel
                    title={t('instructorDashboard.groupsSection.noDelivery.title')}
                    description={t('instructorDashboard.groupsSection.noDelivery.description')}
                >
                    <EmptyState
                        title={t('instructorDashboard.groupsSection.noDelivery.emptyTitle')}
                        subtitle={t('instructorDashboard.groupsSection.noDelivery.emptySubtitle')}
                        action={{
                            label: t('instructorDashboard.groupsSection.actions.createCourse'),
                            onClick: () => navigate('/instructor/course/create'),
                        }}
                    />
                    {pendingDeliveryCourses.length ? (
                        <p className="mt-4 text-sm text-edubot-muted dark:text-slate-400">
                            {t('instructorDashboard.groupsSection.noDelivery.pendingCount', {
                                count: pendingDeliveryCourses.length,
                            })}
                        </p>
                    ) : null}
                </DashboardInsetPanel>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <DashboardSectionHeader
                eyebrow={t('instructorDashboard.groupsSection.header.eyebrow')}
                title={t('instructorDashboard.groupsSection.header.title')}
                description={t('instructorDashboard.groupsSection.header.activeDescription')}
                action={(
                    <div className="flex flex-wrap items-center gap-2">
                        <Link to={sessionsPath} className="dashboard-button-secondary">
                            <FiCalendar className="h-4 w-4" />
                            {t('instructorDashboard.groupsSection.actions.openSessions')}
                        </Link>
                        <button
                            type="button"
                            onClick={handleOpenCreateModal}
                            className="dashboard-button-primary"
                        >
                            <FiPlus className="h-4 w-4" />
                            {t('instructorDashboard.groupsSection.actions.createGroup')}
                        </button>
                    </div>
                )}
            />

            <div className="grid gap-4 md:grid-cols-4">
                <DashboardMetricCard label={t('instructorDashboard.groupsSection.metrics.groups')} value={metrics.total} icon={FiLayers} />
                <DashboardMetricCard
                    label={t('instructorDashboard.groupsSection.metrics.active')}
                    value={metrics.active}
                    icon={FiUsers}
                    tone="green"
                />
                <DashboardMetricCard
                    label={t('instructorDashboard.groupsSection.metrics.planned')}
                    value={metrics.planned}
                    icon={FiClock}
                    tone="amber"
                />
                <DashboardMetricCard
                    label={t('instructorDashboard.groupsSection.metrics.seats')}
                    value={metrics.seats}
                    icon={FiBookOpen}
                    tone="blue"
                />
            </div>

            <DashboardInsetPanel
                title={t('instructorDashboard.groupsSection.courseGroups.title')}
                description={t('instructorDashboard.groupsSection.courseGroups.description')}
            >
                <DashboardFilterBar gridClassName="lg:grid-cols-[minmax(0,1fr),auto]">
                    <label className="text-sm text-edubot-ink dark:text-white">
                        <span className="mb-1.5 inline-flex items-center gap-2 font-medium">
                            <FiBookOpen className="h-4 w-4 text-edubot-orange" />
                            {t('instructorDashboard.groupsSection.courseGroups.courseLabel')}
                        </span>
                        <select
                            value={selectedCourseId}
                            onChange={(e) => setSelectedCourseId(e.target.value)}
                            className="dashboard-field dashboard-select"
                        >
                            <option value="">{t('instructorDashboard.groupsSection.courseGroups.selectCourse')}</option>
                            {deliveryCourses.map((course) => (
                                <option key={course.id} value={course.id}>
                                    {course.title}
                                </option>
                            ))}
                        </select>
                        {pendingDeliveryCourses.length ? (
                            <p className="mt-2 text-xs text-edubot-muted dark:text-slate-400">
                                {t('instructorDashboard.groupsSection.courseGroups.pendingHidden', {
                                    count: pendingDeliveryCourses.length,
                                })}
                            </p>
                        ) : null}
                    </label>

                    <div className="flex items-end">
                        <div className="dashboard-panel-muted rounded-2xl px-4 py-3 text-sm text-edubot-muted dark:text-slate-300">
                            {t('instructorDashboard.groupsSection.courseGroups.anchorLabel')}
                            <span className="ml-2 font-semibold text-edubot-ink dark:text-white">
                                {t('instructorDashboard.groupsSection.courseGroups.anchorValue')}
                            </span>
                        </div>
                    </div>
                </DashboardFilterBar>

                <div className="mt-4">
                    {loadingGroups ? (
                        <DashboardCardSkeleton cards={4} />
                    ) : groups.length ? (
                        <div className="grid gap-4 md:grid-cols-2">
                            {groups.map((group) => {
                                const formattedScheduleBlocks = formatScheduleBlocks(group.scheduleBlocks, t);
                                const scheduleSummary = group.scheduleNote || '';
                                const hasDefaultSchedule = Boolean(scheduleSummary || formattedScheduleBlocks.length);
                                const individual = isIndividualGroup(group);
                                const hasLoadedIndividualStudent = Object.prototype.hasOwnProperty.call(
                                    individualStudentsByGroupId,
                                    group.id
                                );
                                const individualStudent = individualStudentsByGroupId[group.id];
                                const individualStudentName = getStudentDisplayName(individualStudent);
                                const individualGroupOccupied = individual && Number(group.activeStudentCount || 0) >= 1;

                                return (
                                <div
                                    key={group.id}
                                    className="rounded-3xl border border-edubot-line/80 bg-white/90 p-5 shadow-edubot-card dark:border-slate-700 dark:bg-slate-950"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <h3 className="text-lg font-semibold text-edubot-ink dark:text-white">
                                                {group.name || t('instructorDashboard.groupsSection.fallbacks.groupWithId', { id: group.id })}
                                            </h3>
                                            <p className="mt-1 text-sm text-edubot-muted dark:text-slate-400">
                                                {t('instructorDashboard.groupsSection.card.code', {
                                                    code: group.code || '—',
                                                })}
                                            </p>
                                            {individual ? (
                                                <p className="mt-1 text-sm font-medium text-violet-700 dark:text-violet-200">
                                                    {individualStudentName
                                                        ? t('instructorDashboard.groupsSection.card.individualStudent', {
                                                            student: individualStudentName,
                                                        })
                                                        : hasLoadedIndividualStudent
                                                          ? t('instructorDashboard.groupsSection.card.individualStudentNotFound')
                                                          : t('instructorDashboard.groupsSection.card.individualStudentLoading')}
                                                </p>
                                            ) : null}
                                        </div>
                                        <span
                                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                                statusTone[group.status] === 'green'
                                                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300'
                                                    : statusTone[group.status] === 'amber'
                                                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300'
                                                        : statusTone[group.status] === 'blue'
                                                            ? 'bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300'
                                                            : statusTone[group.status] === 'red'
                                                                ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300'
                                                                : 'bg-slate-100 text-slate-700 dark:bg-slate-500/15 dark:text-slate-300'
                                            }`}
                                        >
                                            {group.status || 'planned'}
                                        </span>
                                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${deliveryModeTone(group.deliveryMode)}`}>
                                            {getDeliveryModeLabel(group.deliveryMode, t)}
                                        </span>
                                    </div>

                                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                        <div className="rounded-2xl border border-edubot-line/70 bg-edubot-surfaceAlt/60 px-4 py-3 dark:border-slate-700 dark:bg-slate-900/70">
                                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-edubot-muted dark:text-slate-400">
                                                {t('instructorDashboard.groupsSection.card.format')}
                                            </p>
                                            <p className="mt-2 text-sm font-semibold text-edubot-ink dark:text-white">
                                                {getDeliveryModeLabel(group.deliveryMode, t)}
                                            </p>
                                        </div>
                                        <div className="rounded-2xl border border-edubot-line/70 bg-edubot-surfaceAlt/60 px-4 py-3 dark:border-slate-700 dark:bg-slate-900/70">
                                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-edubot-muted dark:text-slate-400">
                                                {t('instructorDashboard.groupsSection.card.period')}
                                            </p>
                                            <p className="mt-2 text-sm font-semibold text-edubot-ink dark:text-white">
                                                {formatDate(group.startDate)} - {formatDate(group.endDate)}
                                            </p>
                                        </div>
                                        <div className="rounded-2xl border border-edubot-line/70 bg-edubot-surfaceAlt/60 px-4 py-3 dark:border-slate-700 dark:bg-slate-900/70">
                                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-edubot-muted dark:text-slate-400">
                                                {t('instructorDashboard.groupsSection.card.seats')}
                                            </p>
                                            <p className="mt-2 text-sm font-semibold text-edubot-ink dark:text-white">
                                                {individual
                                                    ? `${group.activeStudentCount || 0}/1`
                                                    : group.seatLimit
                                                      ? `${group.seatLimit}`
                                                      : t('instructorDashboard.groupsSection.card.unlimited')}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-edubot-muted dark:text-slate-400">
                                        <span className="inline-flex items-center gap-1.5">
                                            <FiMapPin className="h-4 w-4" />
                                            {group.location || t('instructorDashboard.groupsSection.card.noLocation')}
                                        </span>
                                        <span className="inline-flex items-center gap-1.5">
                                            <FiCalendar className="h-4 w-4" />
                                            {group.timezone || t('instructorDashboard.groupsSection.card.noTimezone')}
                                        </span>
                                    </div>

                                    <div className="mt-4 rounded-2xl border border-edubot-line/70 bg-edubot-surfaceAlt/60 px-4 py-3 dark:border-slate-700 dark:bg-slate-900/70">
                                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-edubot-muted dark:text-slate-400">
                                            {t('instructorDashboard.groupsSection.card.defaultSchedule')}
                                        </p>
                                        <p className="mt-2 text-sm font-semibold text-edubot-ink dark:text-white">
                                            {scheduleSummary || (!formattedScheduleBlocks.length ? t('instructorDashboard.groupsSection.card.noSchedule') : '')}
                                        </p>
                                        {formattedScheduleBlocks.length ? (
                                            <div className={scheduleSummary ? 'mt-3 flex flex-wrap gap-2' : 'mt-2 flex flex-wrap gap-2'}>
                                                {formattedScheduleBlocks.map((line) => (
                                                    <span
                                                        key={line}
                                                        className="rounded-full border border-edubot-line bg-white px-3 py-1 text-[11px] font-semibold text-edubot-ink dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                                                    >
                                                        {line}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : null}
                                    </div>

                                    <div className="mt-5 flex flex-wrap gap-2">
                                        <Link to={sessionsPath} className="dashboard-button-secondary">
                                            {t('instructorDashboard.groupsSection.actions.manageSessions')}
                                        </Link>
                                        <button
                                            type="button"
                                            onClick={() => handleOpenGenerateModal(group)}
                                            className={hasDefaultSchedule ? 'dashboard-button-primary' : 'dashboard-button-secondary'}
                                        >
                                            <FiCalendar className="h-4 w-4" />
                                            {t('instructorDashboard.groupsSection.actions.generateSessions')}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleOpenEnrollModal(group)}
                                            className="dashboard-button-secondary disabled:cursor-not-allowed disabled:opacity-60"
                                            disabled={individualGroupOccupied}
                                            title={individualGroupOccupied ? t('instructorDashboard.groupsSection.card.individualLimitTitle') : undefined}
                                        >
                                            {individual
                                                ? t('instructorDashboard.groupsSection.actions.addIndividualStudent')
                                                : t('instructorDashboard.groupsSection.actions.addStudent')}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleOpenEditModal(group)}
                                            className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-edubot-muted transition hover:bg-edubot-surfaceAlt hover:text-edubot-ink dark:text-slate-400 dark:hover:bg-slate-900/70 dark:hover:text-white"
                                        >
                                            <FiEdit3 className="h-4 w-4" />
                                            {t('instructorDashboard.groupsSection.actions.edit')}
                                        </button>
                                    </div>
                                </div>
                                );
                            })}
                        </div>
                    ) : (
                        <EmptyState
                            title={selectedCourse
                                ? t('instructorDashboard.groupsSection.empty.noGroupsTitle')
                                : t('instructorDashboard.groupsSection.empty.selectCourseTitle')}
                            subtitle={
                                selectedCourse
                                    ? t('instructorDashboard.groupsSection.empty.noGroupsSubtitle')
                                    : t('instructorDashboard.groupsSection.empty.selectCourseSubtitle')
                            }
                            action={
                                selectedCourse
                                    ? {
                                          label: t('instructorDashboard.groupsSection.actions.createGroup'),
                                          onClick: handleOpenCreateModal,
                                      }
                                    : undefined
                            }
                        />
                    )}
                </div>
            </DashboardInsetPanel>

            <DashboardInsetPanel
                title={t('instructorDashboard.groupsSection.sessionProcess.title')}
                description={t('instructorDashboard.groupsSection.sessionProcess.description')}
            >
                <div className="dashboard-panel-muted flex flex-wrap items-center justify-between gap-3 rounded-2xl px-4 py-4">
                    <p className="text-sm text-edubot-muted dark:text-slate-300">
                        {t('instructorDashboard.groupsSection.sessionProcess.body')}
                    </p>
                    <Link to={sessionsPath} className="dashboard-button-secondary">
                        <FiCalendar className="h-4 w-4" />
                        {t('instructorDashboard.groupsSection.actions.openSessions')}
                    </Link>
                </div>
            </DashboardInsetPanel>

            {showEnrollModal && enrollGroup ? (
                <EnrollGroupStudentModal
                    group={enrollGroup}
                    course={selectedCourse}
                    form={enrollForm}
                    onChange={(field, value) =>
                        setEnrollForm((prev) => ({
                            ...prev,
                            [field]: value,
                        }))
                    }
                    onClose={() => {
                        setShowEnrollModal(false);
                        setEnrollGroup(null);
                        setEnrollForm({ userId: '', discountPercentage: '' });
                        setEnrollUserSearch('');
                        setStudentOptions([]);
                        setShowDropdown(false);
                    }}
                    onSubmit={handleEnrollStudent}
                    enrolling={enrolling}
                    students={groupStudents}
                    loadingStudents={loadingGroupStudents}
                    studentOptions={studentOptions}
                    userSearch={enrollUserSearch}
                    onSearchChange={setEnrollUserSearch}
                    loadingUserOptions={loadingUserOptions}
                    showDropdown={showDropdown}
                    setShowDropdown={setShowDropdown}
                />
            ) : null}

            {showCreateModal ? (
                <GroupFormModal
                    mode="create"
                    course={selectedCourse}
                    form={createForm}
                    onChange={handleCreateFormChange}
                    onClose={() => {
                        setShowCreateModal(false);
                        resetCreateForm();
                        setEnrollUserSearch('');
                        setStudentOptions([]);
                        setShowDropdown(false);
                    }}
                    onSubmit={handleCreateGroup}
                    saving={savingGroup}
                    onRegenerateCode={() =>
                        handleCreateFormChange(
                            'code',
                            buildSuggestedGroupCode(selectedCourse, groups, createForm.startDate)
                        )
                    }
                    studentOptions={studentOptions}
                    userSearch={enrollUserSearch}
                    onSearchChange={setEnrollUserSearch}
                    loadingUserOptions={loadingUserOptions}
                    showDropdown={showDropdown}
                    setShowDropdown={setShowDropdown}
                />
            ) : null}

            {showEditModal && editingGroupId ? (
                <GroupFormModal
                    mode="edit"
                    course={selectedCourse}
                    form={editForm}
                    onChange={handleEditFormChange}
                    onClose={() => {
                        setShowEditModal(false);
                        setEditingGroupId(null);
                        setEditForm(GROUP_FORM_DEFAULT);
                    }}
                    onSubmit={handleUpdateGroup}
                    saving={savingGroupUpdate}
                    onRegenerateCode={() =>
                        handleEditFormChange(
                            'code',
                            buildSuggestedGroupCode(selectedCourse, groups, editForm.startDate)
                        )
                    }
                />
            ) : null}

            {showGenerateModal && generationGroup ? (
                <GenerateGroupSessionsModal
                    group={generationGroup}
                    form={generationForm}
                    onChange={(field, value) => {
                        setGenerationForm((prev) => {
                            const next = {
                                ...prev,
                                [field]: value,
                            };
                            if (prev[field] !== value) {
                                generationPreviewRequestRef.current += 1;
                                setGenerationPreview(null);
                                setPreviewLoading(false);
                            }
                            return next;
                        });
                    }}
                    onClose={() => {
                        generationPreviewRequestRef.current += 1;
                        setShowGenerateModal(false);
                        setGenerationGroup(null);
                        setGenerationPreview(null);
                        setPreviewLoading(false);
                    }}
                    onPreview={() => loadGenerationPreview(generationGroup, generationForm)}
                    onGenerate={handleGenerateSessions}
                    preview={generationPreview}
                    previewLoading={previewLoading}
                    generating={generatingSessions}
                />
            ) : null}
        </div>
    );
};

export default GroupsSection;
