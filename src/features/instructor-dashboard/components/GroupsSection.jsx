/* eslint-disable react/prop-types */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
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
import { fetchGroupRoster } from '@features/courseGroups/roster';

const DELIVERY_TYPES = new Set(['offline', 'online_live']);
const WEEKDAY_LABELS = {
    mon: 'Дүйшөмбү',
    tue: 'Шейшемби',
    wed: 'Шаршемби',
    thu: 'Бейшемби',
    fri: 'Жума',
    sat: 'Ишемби',
    sun: 'Жекшемби',
};
const GROUP_FORM_DEFAULT = {
    name: '',
    code: '',
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

const formatScheduleBlocks = (blocks = []) =>
    (Array.isArray(blocks) ? blocks : [])
        .filter((block) => block?.day && block?.startTime && block?.endTime)
        .map((block) => `${WEEKDAY_LABELS[String(block.day).toLowerCase()] || block.day} · ${block.startTime}–${block.endTime}`);

const GroupsSection = ({ courses = [] }) => {
    const [searchParams] = useSearchParams();
    const deliveryCourses = useMemo(
        () => courses.filter((course) => DELIVERY_TYPES.has(normalizeCourseType(course))),
        [courses]
    );
    const requestedCourseId = searchParams.get('courseId');
    const [selectedCourseId, setSelectedCourseId] = useState('');
    const [groups, setGroups] = useState([]);
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
            toast.error('Группаларды жүктөө мүмкүн болбоду');
        } finally {
            setLoadingGroups(false);
        }
    }, []);

    useEffect(() => {
        loadGroups(selectedCourseId);
    }, [selectedCourseId, loadGroups]);

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
            setCreateForm((prev) => {
                const next = {
                    ...prev,
                    [field]: value,
                };

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
            toast.error('Адегенде курсту тандаңыз');
            return;
        }

        if (!createForm.name.trim() || !createForm.code.trim()) {
            toast.error('Группа үчүн аталыш жана код милдеттүү');
            return;
        }

        setSavingGroup(true);
        try {
            const created = await createCourseGroup({
                courseId: Number(selectedCourse.id),
                name: createForm.name.trim(),
                code: createForm.code.trim(),
                status: createForm.status || undefined,
                startDate: createForm.startDate || undefined,
                endDate: createForm.endDate || undefined,
                seatLimit: createForm.seatLimit ? Number(createForm.seatLimit) : undefined,
                timezone: createForm.timezone || undefined,
                location: createForm.location || undefined,
                meetingProvider: createForm.meetingProvider || undefined,
                meetingUrl: createForm.meetingUrl || undefined,
                scheduleNote: createForm.scheduleNote || undefined,
                scheduleBlocks: createForm.scheduleBlocks,
                instructorId: createForm.instructorId ? Number(createForm.instructorId) : undefined,
            });

            toast.success('Группа түзүлдү');
            await loadGroups(selectedCourse.id);
            resetCreateForm();
            setShowCreateModal(false);
            if (created?.id) setEditingGroupId(String(created.id));
        } catch (error) {
            console.error('Failed to create group', error);
            const message =
                error.response?.data?.message || error.message || 'Группа түзүү мүмкүн болбоду';
            toast.error(Array.isArray(message) ? message.join(', ') : message);
        } finally {
            setSavingGroup(false);
        }
    }, [selectedCourse, createForm, loadGroups, resetCreateForm]);

    const handleUpdateGroup = useCallback(async () => {
        if (!editingGroupId) {
            toast.error('Өзгөртүү үчүн группа тандаңыз');
            return;
        }

        if (!editForm.name.trim() || !editForm.code.trim()) {
            toast.error('Группа үчүн аталыш жана код милдеттүү');
            return;
        }

        setSavingGroupUpdate(true);
        try {
            await updateCourseGroup(Number(editingGroupId), {
                name: editForm.name.trim(),
                code: editForm.code.trim(),
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
            });

            toast.success('Группа жаңыртылды');
            await loadGroups(selectedCourseId);
            setShowEditModal(false);
        } catch (error) {
            console.error('Failed to update group', error);
            const message =
                error.response?.data?.message || error.message || 'Группаны жаңыртуу мүмкүн болбоду';
            toast.error(Array.isArray(message) ? message.join(', ') : message);
        } finally {
            setSavingGroupUpdate(false);
        }
    }, [editingGroupId, editForm, loadGroups, selectedCourseId]);

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
                name: student.fullName || student.email || 'Студент',
                email: student.email || '—',
                enrolledAt: student.enrolledAt,
            }));

            setGroupStudents(list);
        } catch (error) {
            console.error('Failed to load group students', error);
            toast.error('Группанын студенттерин жүктөө мүмкүн болбоду');
            setGroupStudents([]);
        } finally {
            setLoadingGroupStudents(false);
        }
    }, [selectedCourseId]);

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
            const message =
                error.response?.data?.message || error.message || 'Preview жүктөө мүмкүн болбоду';
            toast.error(Array.isArray(message) ? message.join(', ') : message);
            setGenerationPreview(null);
        } finally {
            if (generationPreviewRequestRef.current !== requestId) return;
            setPreviewLoading(false);
        }
    }, []);

    const handleOpenGenerateModal = useCallback((group) => {
        if (!Array.isArray(group?.scheduleBlocks) || !group.scheduleBlocks.length) {
            toast.error('Адегенде группа үчүн дефолт график сактаңыз');
            return;
        }

        const nextRange = buildGenerationRange(group);
        generationPreviewRequestRef.current += 1;
        setGenerationGroup(group);
        setGenerationForm(nextRange);
        setGenerationPreview(null);
        setShowGenerateModal(true);
        loadGenerationPreview(group, nextRange);
    }, [loadGenerationPreview]);

    const handleGenerateSessions = useCallback(async () => {
        if (!generationGroup?.id) return;

        setGeneratingSessions(true);
        try {
            const result = await generateCourseGroupSessions(Number(generationGroup.id), generationForm);
            const createdCount = Number(result?.createdCount || 0);
            if (createdCount > 0) {
                toast.success(`${createdCount} сессия түзүлдү`);
            } else {
                toast('Жаңы сессия жок, мурунтан барларын өткөрүп жиберди', {
                    icon: 'ℹ️',
                });
            }
            setShowGenerateModal(false);
            setGenerationGroup(null);
            setGenerationPreview(null);
        } catch (error) {
            console.error('Failed to generate sessions', error);
            const message =
                error.response?.data?.message || error.message || 'Сессияларды түзүү мүмкүн болбоду';
            toast.error(Array.isArray(message) ? message.join(', ') : message);
        } finally {
            setGeneratingSessions(false);
        }
    }, [generationForm, generationGroup]);

    useEffect(() => {
        if (!showEnrollModal) return;

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
                    toast.error('Студенттерди издөөдө ката кетти');
                    setStudentOptions([]);
                }
            })
            .finally(() => {
                if (!cancelled) setLoadingUserOptions(false);
            });

        return () => {
            cancelled = true;
        };
    }, [showEnrollModal, enrollUserSearch]);

    const handleEnrollStudent = useCallback(async () => {
        if (!selectedCourse || !enrollGroup) return;
        const currentGroup = enrollGroup;

        const userIdValue = Number(enrollForm.userId);
        if (!userIdValue || Number.isNaN(userIdValue)) {
            toast.error('Колдонуучу ID туура эмес');
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

            toast.success('Студент группага кошулду');
            setShowEnrollModal(false);
            setEnrollGroup(null);
            setEnrollForm({ userId: '', discountPercentage: '' });
            setEnrollUserSearch('');
            setStudentOptions([]);
            await loadGroupStudents(currentGroup);
            await loadGroups(selectedCourse.id);
        } catch (error) {
            console.error('Failed to enroll student to group', error);
            const message =
                error.response?.data?.message ||
                error.message ||
                'Студентти группага кошууда ката кетти';
            toast.error(Array.isArray(message) ? message.join(', ') : message);
        } finally {
            setEnrolling(false);
        }
    }, [selectedCourse, enrollGroup, enrollForm, loadGroupStudents, loadGroups]);

    if (!deliveryCourses.length) {
        return (
            <div className="space-y-6">
                <DashboardSectionHeader
                    eyebrow="Groups workspace"
                    title="Группалар"
                    description="Оффлайн жана онлайн түз эфир курстары үчүн группа, ростер жана кийинки сессия контексти ушул жерде башкарылат."
                />
                <DashboardInsetPanel
                    title="Delivery курстары табылган жок"
                    description="Группа түзүү жана студентти группага каттоо үчүн алгач оффлайн же онлайн live курс керек."
                >
                    <EmptyState
                        title="Группага ылайыктуу курс жок"
                        subtitle="Алгач delivery форматындагы курс түзүңүз. Video курстар группа талап кылбайт."
                        action={{
                            label: 'Курс түзүү',
                            onClick: () => {
                                window.location.href = '/instructor/course/create';
                            },
                        }}
                    />
                </DashboardInsetPanel>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <DashboardSectionHeader
                eyebrow="Groups workspace"
                title="Группалар"
                description="Оффлайн жана онлайн түз эфир курстары үчүн группа академиялык контейнер болуп саналат: enrollment группага байланышат, сессиялар ошол группадан окуйт."
                action={(
                    <div className="flex flex-wrap items-center gap-2">
                        <Link to="/instructor?tab=sessions" className="dashboard-button-secondary">
                            <FiCalendar className="h-4 w-4" />
                            Сессия workspace
                        </Link>
                        <button
                            type="button"
                            onClick={handleOpenCreateModal}
                            className="dashboard-button-primary"
                        >
                            <FiPlus className="h-4 w-4" />
                            Группа түзүү
                        </button>
                    </div>
                )}
            />

            <div className="grid gap-4 md:grid-cols-4">
                <DashboardMetricCard label="Группалар" value={metrics.total} icon={FiLayers} />
                <DashboardMetricCard
                    label="Активдүү"
                    value={metrics.active}
                    icon={FiUsers}
                    tone="green"
                />
                <DashboardMetricCard
                    label="Пландалган"
                    value={metrics.planned}
                    icon={FiClock}
                    tone="amber"
                />
                <DashboardMetricCard
                    label="Орундар"
                    value={metrics.seats}
                    icon={FiBookOpen}
                    tone="blue"
                />
            </div>

            <DashboardInsetPanel
                title="Курс боюнча группалар"
                description="Delivery курсту тандап, ошол курс астындагы группаларды көрүңүз. Кийинки кадамда enrollment ушул группага байланууга тийиш."
            >
                <DashboardFilterBar gridClassName="lg:grid-cols-[minmax(0,1fr),auto]">
                    <label className="text-sm text-edubot-ink dark:text-white">
                        <span className="mb-1.5 inline-flex items-center gap-2 font-medium">
                            <FiBookOpen className="h-4 w-4 text-edubot-orange" />
                            Delivery курс
                        </span>
                        <select
                            value={selectedCourseId}
                            onChange={(e) => setSelectedCourseId(e.target.value)}
                            className="dashboard-field dashboard-select"
                        >
                            <option value="">Курс тандаңыз</option>
                            {deliveryCourses.map((course) => (
                                <option key={course.id} value={course.id}>
                                    {course.title}
                                </option>
                            ))}
                        </select>
                    </label>

                    <div className="flex items-end">
                        <div className="dashboard-panel-muted rounded-2xl px-4 py-3 text-sm text-edubot-muted dark:text-slate-300">
                            Enrollment anchor:
                            <span className="ml-2 font-semibold text-edubot-ink dark:text-white">
                                group
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
                                const formattedScheduleBlocks = formatScheduleBlocks(group.scheduleBlocks);
                                const scheduleSummary = group.scheduleNote || '';
                                const hasDefaultSchedule = Boolean(scheduleSummary || formattedScheduleBlocks.length);

                                return (
                                <div
                                    key={group.id}
                                    className="rounded-3xl border border-edubot-line/80 bg-white/90 p-5 shadow-edubot-card dark:border-slate-700 dark:bg-slate-950"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <h3 className="text-lg font-semibold text-edubot-ink dark:text-white">
                                                {group.name || `Group #${group.id}`}
                                            </h3>
                                            <p className="mt-1 text-sm text-edubot-muted dark:text-slate-400">
                                                Code: {group.code || '—'}
                                            </p>
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
                                    </div>

                                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                        <div className="rounded-2xl border border-edubot-line/70 bg-edubot-surfaceAlt/60 px-4 py-3 dark:border-slate-700 dark:bg-slate-900/70">
                                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-edubot-muted dark:text-slate-400">
                                                Период
                                            </p>
                                            <p className="mt-2 text-sm font-semibold text-edubot-ink dark:text-white">
                                                {formatDate(group.startDate)} - {formatDate(group.endDate)}
                                            </p>
                                        </div>
                                        <div className="rounded-2xl border border-edubot-line/70 bg-edubot-surfaceAlt/60 px-4 py-3 dark:border-slate-700 dark:bg-slate-900/70">
                                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-edubot-muted dark:text-slate-400">
                                                Орун
                                            </p>
                                            <p className="mt-2 text-sm font-semibold text-edubot-ink dark:text-white">
                                                {group.seatLimit ? `${group.seatLimit}` : 'Чектелбеген'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-edubot-muted dark:text-slate-400">
                                        <span className="inline-flex items-center gap-1.5">
                                            <FiMapPin className="h-4 w-4" />
                                            {group.location || 'Локация жок'}
                                        </span>
                                        <span className="inline-flex items-center gap-1.5">
                                            <FiCalendar className="h-4 w-4" />
                                            {group.timezone || 'Timezone жок'}
                                        </span>
                                    </div>

                                    <div className="mt-4 rounded-2xl border border-edubot-line/70 bg-edubot-surfaceAlt/60 px-4 py-3 dark:border-slate-700 dark:bg-slate-900/70">
                                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-edubot-muted dark:text-slate-400">
                                            Дефолт график
                                        </p>
                                        <p className="mt-2 text-sm font-semibold text-edubot-ink dark:text-white">
                                            {scheduleSummary || (!formattedScheduleBlocks.length ? 'Азырынча коюлган эмес' : '')}
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
                                        <Link to="/instructor?tab=sessions" className="dashboard-button-secondary">
                                            Сессияларды башкаруу
                                        </Link>
                                        <button
                                            type="button"
                                            onClick={() => handleOpenGenerateModal(group)}
                                            className={hasDefaultSchedule ? 'dashboard-button-primary' : 'dashboard-button-secondary'}
                                        >
                                            <FiCalendar className="h-4 w-4" />
                                            Сессия түзүү
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleOpenEnrollModal(group)}
                                            className="dashboard-button-secondary"
                                        >
                                            Студент кошуу
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleOpenEditModal(group)}
                                            className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-edubot-muted transition hover:bg-edubot-surfaceAlt hover:text-edubot-ink dark:text-slate-400 dark:hover:bg-slate-900/70 dark:hover:text-white"
                                        >
                                            <FiEdit3 className="h-4 w-4" />
                                            Өзгөртүү
                                        </button>
                                    </div>
                                </div>
                                );
                            })}
                        </div>
                    ) : (
                        <EmptyState
                            title={selectedCourse ? 'Бул курс боюнча группа жок' : 'Курс тандаңыз'}
                            subtitle={
                                selectedCourse
                                    ? 'Группа түзүлгөндөн кийин студент enrollment, сессия жана attendance ушул контейнерден башталат.'
                                    : 'Delivery курсту тандасаңыз, анын группалары ушул жерде көрүнөт.'
                            }
                            action={
                                selectedCourse
                                    ? {
                                          label: 'Группа түзүү',
                                          onClick: handleOpenCreateModal,
                                      }
                                    : undefined
                            }
                        />
                    )}
                </div>
            </DashboardInsetPanel>

            <DashboardInsetPanel
                title="Session workflow"
                description="Group metadata modal аркылуу башкарылат. Session create/edit жана operational иштер Session workspace'те калат."
            >
                <div className="dashboard-panel-muted flex flex-wrap items-center justify-between gap-3 rounded-2xl px-4 py-4">
                    <p className="text-sm text-edubot-muted dark:text-slate-300">
                        Бул бөлүмдө группа enrollment жана metadata башкарылат. Attendance, homework, meeting жана
                        session metadata өзүнчө session workflow болуп калат.
                    </p>
                    <Link to="/instructor?tab=sessions" className="dashboard-button-secondary">
                        <FiCalendar className="h-4 w-4" />
                        Session workspace
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
                    }}
                    onSubmit={handleCreateGroup}
                    saving={savingGroup}
                    onRegenerateCode={() =>
                        handleCreateFormChange(
                            'code',
                            buildSuggestedGroupCode(selectedCourse, groups, createForm.startDate)
                        )
                    }
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
