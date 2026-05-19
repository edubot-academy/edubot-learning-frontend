
import { useState, useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
    FiActivity,
    FiArchive,
    FiBriefcase,
    FiCalendar,
    FiFilter,
    FiGlobe,
    FiPlusCircle,
    FiSearch,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import {
    DashboardCardSkeleton,
    DashboardFilterBar,
    DashboardInsetPanel,
    DashboardMetricCard,
    DashboardWorkspaceHero,
    EmptyState,
} from '@components/ui/dashboard';
import {
    createOffering,
    updateOffering,
    enrollUserInCourse,
    fetchUsers,
    fetchCourseStudents,
} from '@services/api';
import OfferingCard from './OfferingCard.jsx';
import CreateOfferingModal from './modals/CreateOfferingModal.jsx';
import EnrollStudentModal from './modals/EnrollStudentModal.jsx';
import { formatDateTimeForInput } from '../utils/instructorDashboard.constants.js';
import { normalizeEnrollmentCourseType } from '@features/enrollments/policy';
import { parseApiError } from '@shared/api/error';

const toArray = (value) => {
    if (Array.isArray(value)) return value;
    if (Array.isArray(value?.items)) return value.items;
    if (Array.isArray(value?.data)) return value.data;
    return [];
};

const OfferingsSection = ({ courses = [], offerings = [], loading, refreshOfferings }) => {
    const { t } = useTranslation();
    const normalizedCourses = useMemo(() => toArray(courses), [courses]);
    const normalizedOfferings = useMemo(() => toArray(offerings), [offerings]);

    const getInitialForm = useCallback(
        (base = null) => ({
            courseId: base?.courseId
                ? String(base.courseId)
                : normalizedCourses[0]?.id
                    ? String(normalizedCourses[0].id)
                    : '',
            title: base?.title || '',
            modality: base?.modality || 'ONLINE',
            visibility: base?.visibility || 'PRIVATE',
            startAt: base?.startAt ? formatDateTimeForInput(base.startAt) : '',
            endAt: base?.endAt ? formatDateTimeForInput(base.endAt) : '',
            scheduleNote: base?.scheduleNote || '',
            scheduleBlocks: base?.scheduleBlocks
                ? base.scheduleBlocks.map((block) => ({
                    day: block.day || '',
                    startTime: block.startTime || '',
                    endTime: block.endTime || '',
                }))
                : [],
            capacity: base?.capacity ? String(base.capacity) : '',
            priceOverride: base?.priceOverride || '',
            companyId: base?.companyId ? String(base.companyId) : '',
            status: base?.status || 'DRAFT',
            isFeatured: Boolean(base?.isFeatured),
        }),
        [normalizedCourses]
    );

    const [filterCourseId, setFilterCourseId] = useState('all');
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('upcoming');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [creating, setCreating] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [editingOffering, setEditingOffering] = useState(null);
    const [createForm, setCreateForm] = useState(() => getInitialForm());

    const [showEnrollModal, setShowEnrollModal] = useState(false);
    const [enrollOffering, setEnrollOffering] = useState(null);
    const [enrollForm, setEnrollForm] = useState({ userId: '', discountPercentage: '' });
    const [enrolling, setEnrolling] = useState(false);
    const [enrollStudents, setEnrollStudents] = useState([]);
    const [loadingEnrollStudents, setLoadingEnrollStudents] = useState(false);
    const [enrollUserSearch, setEnrollUserSearch] = useState('');
    const [enrollStudentOptions, setEnrollStudentOptions] = useState([]);
    const [loadingUserOptions, setLoadingUserOptions] = useState(false);
    const [showEnrollDropdown, setShowEnrollDropdown] = useState(false);

    const updateCreateForm = useCallback((field, value) => {
        setCreateForm((prev) => ({
            ...prev,
            [field]: value,
        }));
    }, []);

    useEffect(() => {
        setCreateForm((prev) => ({
            ...prev,
            courseId: prev.courseId || (normalizedCourses[0]?.id ? String(normalizedCourses[0].id) : ''),
        }));
    }, [normalizedCourses]);

    const summary = useMemo(() => {
        const now = Date.now();

        const upcoming = normalizedOfferings.filter(
            (offering) => offering.startAt && new Date(offering.startAt).getTime() >= now
        );
        const past = normalizedOfferings.length - upcoming.length;
        const company = normalizedOfferings.filter((offering) => offering.companyId);
        const publicOnes = normalizedOfferings.filter((offering) => offering.visibility === 'PUBLIC');
        const statusCounts = normalizedOfferings.reduce((acc, offering) => {
            const key = offering.status || 'DRAFT';
            acc[key] = (acc[key] || 0) + 1;
            return acc;
        }, {});

        return {
            total: normalizedOfferings.length,
            upcoming: upcoming.length,
            past,
            company: company.length,
            public: publicOnes.length,
            active: statusCounts.ACTIVE || 0,
            draft: statusCounts.DRAFT || 0,
            completed: (statusCounts.COMPLETED || 0) + (statusCounts.ARCHIVED || 0),
        };
    }, [normalizedOfferings]);

    const overviewMetrics = [
        {
            label: t('instructorDashboard.offerings.metrics.total'),
            value: summary.total,
            icon: FiCalendar,
            tone: 'default',
        },
        {
            label: t('instructorDashboard.offerings.metrics.upcoming'),
            value: summary.upcoming,
            icon: FiActivity,
            tone: summary.upcoming > 0 ? 'blue' : 'default',
        },
        {
            label: t('instructorDashboard.offerings.metrics.company'),
            value: summary.company,
            icon: FiBriefcase,
            tone: summary.company > 0 ? 'green' : 'default',
        },
        {
            label: t('instructorDashboard.offerings.metrics.public'),
            value: summary.public,
            icon: FiGlobe,
            tone: summary.public > 0 ? 'amber' : 'default',
        },
        {
            label: t('instructorDashboard.offerings.metrics.active'),
            value: summary.active,
            icon: FiActivity,
            tone: summary.active > 0 ? 'green' : 'default',
        },
        {
            label: t('instructorDashboard.offerings.metrics.draft'),
            value: summary.draft,
            icon: FiFilter,
            tone: summary.draft > 0 ? 'amber' : 'default',
        },
        {
            label: t('instructorDashboard.offerings.metrics.closed'),
            value: summary.completed,
            icon: FiArchive,
            tone: summary.completed > 0 ? 'blue' : 'default',
        },
    ];

    const filteredOfferings = useMemo(() => {
        return normalizedOfferings.filter((offering) => {
            if (filterCourseId !== 'all' && offering.course?.id !== Number(filterCourseId)) {
                return false;
            }

            if (statusFilter !== 'all') {
                const now = Date.now();
                const start = offering.startAt ? new Date(offering.startAt).getTime() : null;

                if (statusFilter === 'upcoming' && start && start < now) return false;
                if (statusFilter === 'past' && start && start >= now) return false;
            }

            if (search.trim()) {
                const term = search.toLowerCase();
                const haystack = `${offering.title || ''} ${offering.course?.title || ''} ${offering.company?.name || ''
                    }`.toLowerCase();

                return haystack.includes(term);
            }

            return true;
        });
    }, [normalizedOfferings, filterCourseId, statusFilter, search]);

    const handleOpenModal = (mode, offering = null) => {
        setModalMode(mode);
        setEditingOffering(offering);
        setCreateForm(getInitialForm(offering));
        setShowCreateModal(true);
    };

    const handleCreateOffering = async () => {
        if (!createForm.courseId) {
            toast.error(t('instructorDashboard.offerings.toasts.courseRequired'));
            return;
        }

        setCreating(true);

        try {
            const payload = {
                courseId: Number(createForm.courseId),
                title: createForm.title.trim() || null,
                modality: createForm.modality,
                visibility: createForm.visibility,
                startAt: createForm.startAt ? new Date(createForm.startAt).toISOString() : undefined,
                endAt: createForm.endAt ? new Date(createForm.endAt).toISOString() : undefined,
                scheduleNote: createForm.scheduleNote.trim() || null,
                scheduleBlocks:
                    createForm.scheduleBlocks && createForm.scheduleBlocks.length
                        ? createForm.scheduleBlocks.filter(
                            (block) => block.day && block.startTime && block.endTime
                        )
                        : null,
                capacity: createForm.capacity ? Number(createForm.capacity) : null,
                priceOverride: createForm.priceOverride.trim() || null,
                companyId: createForm.companyId ? Number(createForm.companyId) : undefined,
                status: createForm.status,
                isFeatured: Boolean(createForm.isFeatured),
            };

            if (modalMode === 'edit' && editingOffering) {
                const patch = { ...payload };
                delete patch.courseId;
                await updateOffering(editingOffering.id, patch);
                toast.success(t('instructorDashboard.offerings.toasts.updated'));
            } else {
                await createOffering(payload);
                toast.success(t('instructorDashboard.offerings.toasts.created'));
            }

            setShowCreateModal(false);
            setCreateForm(getInitialForm());
            setEditingOffering(null);
            refreshOfferings();
        } catch (error) {
            console.error('Failed to save offering', error);
            toast.error(parseApiError(error, t('instructorDashboard.offerings.toasts.saveError')).message);
        } finally {
            setCreating(false);
        }
    };

    const loadOfferingStudents = useCallback(async (offering) => {
        setLoadingEnrollStudents(true);

        try {
            const studentResponse = await fetchCourseStudents(offering.course.id, {
                page: 1,
                limit: 100,
            });

            const list =
                studentResponse?.students
                    ?.filter((student) => Number(student.offeringId) === Number(offering.id))
                    .map((student) => ({
                        id: student.id,
                        name: student.fullName || student.email || t('instructorDashboard.offerings.fallbacks.student'),
                        email: student.email || '—',
                        enrolledAt: student.enrolledAt,
                    })) || [];

            setEnrollStudents(list);
        } catch (error) {
            console.error('Failed to load offering students', error);
            toast.error(parseApiError(error, t('instructorDashboard.offerings.toasts.studentsLoadError')).message);
            setEnrollStudents([]);
        } finally {
            setLoadingEnrollStudents(false);
        }
    }, [t]);

    const handleOpenEnrollModal = (offering) => {
        setEnrollOffering(offering);
        setEnrollForm({ userId: '', discountPercentage: '' });
        setEnrollUserSearch('');
        setEnrollStudentOptions([]);
        setShowEnrollDropdown(false);
        setShowEnrollModal(true);
        loadOfferingStudents(offering);
    };

    useEffect(() => {
        if (!showEnrollModal) return;

        if (!enrollUserSearch || enrollUserSearch.trim().length < 2) {
            setEnrollStudentOptions([]);
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
                const options = rows.map((user) => ({
                    id: user.id,
                    name: user.fullName || user.email || `ID: ${user.id}`,
                    email: user.email || '',
                }));

                setEnrollStudentOptions(options);
            })
            .catch((error) => {
                console.error('Failed to fetch users', error);
                if (!cancelled) {
                    toast.error(parseApiError(error, t('instructorDashboard.offerings.toasts.studentSearchError')).message);
                    setEnrollStudentOptions([]);
                }
            })
            .finally(() => {
                if (!cancelled) setLoadingUserOptions(false);
            });

        return () => {
            cancelled = true;
        };
    }, [showEnrollModal, enrollUserSearch, t]);

    const handleEnrollStudent = async () => {
        if (!enrollOffering) return;

        const userIdValue = Number(enrollForm.userId);
        if (!userIdValue || Number.isNaN(userIdValue)) {
            toast.error(t('instructorDashboard.offerings.toasts.invalidUser'));
            return;
        }

        setEnrolling(true);

        try {
            await enrollUserInCourse(userIdValue, enrollOffering.course.id, {
                courseType: normalizeEnrollmentCourseType(
                    enrollOffering.course?.courseType || enrollOffering.courseType
                ),
                offeringId: enrollOffering.id,
                discountPercentage: enrollForm.discountPercentage
                    ? Number(enrollForm.discountPercentage)
                    : undefined,
            });

            toast.success(t('instructorDashboard.offerings.toasts.studentAdded'));
            setShowEnrollModal(false);
            setEnrollOffering(null);
            setEnrollForm({ userId: '', discountPercentage: '' });
            setEnrollUserSearch('');
            setEnrollStudentOptions([]);
            setShowEnrollDropdown(false);
            refreshOfferings();
        } catch (error) {
            console.error('Failed to enroll student', error);
            toast.error(parseApiError(error, t('instructorDashboard.offerings.toasts.studentAddError')).message);
        } finally {
            setEnrolling(false);
        }
    };

    return (
        <div className="space-y-6">
            <DashboardWorkspaceHero
                className="dashboard-panel"
                    eyebrow={t('instructorDashboard.offerings.hero.eyebrow')}
                    title={t('instructorDashboard.offerings.hero.title')}
                    description={t('instructorDashboard.offerings.hero.description')}
                    action={(
                        <button
                            type="button"
                            className="dashboard-button-primary inline-flex items-center gap-2 self-start"
                            onClick={() => handleOpenModal('create')}
                        >
                            <FiPlusCircle className="h-4 w-4" />
                            {t('instructorDashboard.offerings.actions.create')}
                        </button>
                    )}
                    metrics={(
                        <>
                            {overviewMetrics.map((metric) => (
                                <DashboardMetricCard
                                    key={metric.label}
                                    label={metric.label}
                                    value={metric.value}
                                    icon={metric.icon}
                                    tone={metric.tone}
                                />
                            ))}
                        </>
                    )}
                    metricsClassName="grid grid-cols-2 gap-3 sm:grid-cols-3 2xl:grid-cols-4"
                >
                <div className="space-y-6">

                    <DashboardInsetPanel
                        title={t('instructorDashboard.offerings.filters.title')}
                        description={t('instructorDashboard.offerings.filters.description')}
                    >
                        <DashboardFilterBar gridClassName="xl:grid-cols-[minmax(0,1fr)_280px]">
                            <div className="grid gap-3 md:grid-cols-2">
                                <select
                                    value={filterCourseId}
                                    onChange={(e) => setFilterCourseId(e.target.value)}
                                    className="dashboard-field dashboard-select"
                                >
                                    <option value="all">{t('instructorDashboard.offerings.filters.allCourses')}</option>
                                    {normalizedCourses.map((course) => (
                                        <option key={course.id} value={course.id}>
                                            {course.title}
                                        </option>
                                    ))}
                                </select>

                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="dashboard-field dashboard-select"
                                >
                                    <option value="upcoming">{t('instructorDashboard.offerings.filters.upcoming')}</option>
                                    <option value="past">{t('instructorDashboard.offerings.filters.past')}</option>
                                    <option value="all">{t('instructorDashboard.offerings.filters.all')}</option>
                                </select>
                            </div>

                            <label className="dashboard-field dashboard-field-icon">
                                <FiSearch className="h-4 w-4 text-edubot-muted dark:text-slate-400" />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full bg-transparent text-sm text-edubot-ink outline-none placeholder:text-edubot-muted dark:text-white dark:placeholder:text-slate-500"
                                    placeholder={t('instructorDashboard.offerings.filters.searchPlaceholder')}
                                />
                            </label>
                        </DashboardFilterBar>
                    </DashboardInsetPanel>

                    {loading ? (
                        <DashboardCardSkeleton cards={4} />
                    ) : filteredOfferings.length ? (
                        <DashboardInsetPanel
                            title={t('instructorDashboard.offerings.list.title')}
                            description={t('instructorDashboard.offerings.list.description', {
                                count: filteredOfferings.length,
                            })}
                        >
                            <div className="space-y-4">
                                {filteredOfferings.map((offering) => (
                                    <OfferingCard
                                        key={offering.id}
                                        offering={offering}
                                        onEdit={(item) => handleOpenModal('edit', item)}
                                        onEnroll={handleOpenEnrollModal}
                                    />
                                ))}
                            </div>
                        </DashboardInsetPanel>
                    ) : (
                        <EmptyState
                            title={t('instructorDashboard.offerings.empty.title')}
                            subtitle={t('instructorDashboard.offerings.empty.subtitle')}
                            action={{
                                label: t('instructorDashboard.offerings.actions.create'),
                                onClick: () => setShowCreateModal(true),
                            }}
                        />
                    )}
                </div>
            </DashboardWorkspaceHero>

            {showCreateModal ? (
                <CreateOfferingModal
                    courses={normalizedCourses}
                    form={createForm}
                    onChange={updateCreateForm}
                    onClose={() => {
                        setShowCreateModal(false);
                        setEditingOffering(null);
                        setCreateForm(getInitialForm());
                    }}
                    onSubmit={handleCreateOffering}
                    creating={creating}
                    mode={modalMode}
                />
            ) : null}

            {showEnrollModal && enrollOffering ? (
                <EnrollStudentModal
                    offering={enrollOffering}
                    form={enrollForm}
                    onChange={(field, value) =>
                        setEnrollForm((prev) => ({
                            ...prev,
                            [field]: value,
                        }))
                    }
                    onClose={() => {
                        setShowEnrollModal(false);
                        setEnrollOffering(null);
                        setEnrollUserSearch('');
                        setEnrollStudentOptions([]);
                        setShowEnrollDropdown(false);
                    }}
                    onSubmit={handleEnrollStudent}
                    enrolling={enrolling}
                    students={enrollStudents}
                    loadingStudents={loadingEnrollStudents}
                    studentOptions={enrollStudentOptions}
                    userSearch={enrollUserSearch}
                    onSearchChange={setEnrollUserSearch}
                    loadingUserOptions={loadingUserOptions}
                    showDropdown={showEnrollDropdown}
                    setShowDropdown={setShowEnrollDropdown}
                />
            ) : null}
        </div>
    );
};

export default OfferingsSection;
