/* eslint-disable react/prop-types */
import { useState, useCallback, useEffect, useMemo } from 'react';
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
    DashboardInsetPanel,
    DashboardMetricCard,
    DashboardSectionHeader,
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

const OfferingsSection = ({ courses = [], offerings = [], loading, refreshOfferings }) => {
    const getInitialForm = useCallback(
        (base = null) => ({
            courseId: base?.courseId
                ? String(base.courseId)
                : courses[0]?.id
                    ? String(courses[0].id)
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
        [courses]
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

    const updateCreateForm = useCallback((field, value) => {
        setCreateForm((prev) => ({
            ...prev,
            [field]: value,
        }));
    }, []);

    useEffect(() => {
        setCreateForm((prev) => ({
            ...prev,
            courseId: prev.courseId || (courses[0]?.id ? String(courses[0].id) : ''),
        }));
    }, [courses]);

    const summary = useMemo(() => {
        const now = Date.now();

        const upcoming = offerings.filter(
            (offering) => offering.startAt && new Date(offering.startAt).getTime() >= now
        );
        const past = offerings.length - upcoming.length;
        const company = offerings.filter((offering) => offering.companyId);
        const publicOnes = offerings.filter((offering) => offering.visibility === 'PUBLIC');
        const statusCounts = offerings.reduce((acc, offering) => {
            const key = offering.status || 'DRAFT';
            acc[key] = (acc[key] || 0) + 1;
            return acc;
        }, {});

        return {
            total: offerings.length,
            upcoming: upcoming.length,
            past,
            company: company.length,
            public: publicOnes.length,
            active: statusCounts.ACTIVE || 0,
            draft: statusCounts.DRAFT || 0,
            completed: (statusCounts.COMPLETED || 0) + (statusCounts.ARCHIVED || 0),
        };
    }, [offerings]);

    const overviewMetrics = [
        {
            label: 'Бардык offeringдер',
            value: summary.total,
            icon: FiCalendar,
            tone: 'default',
        },
        {
            label: 'Жакынкы offeringдер',
            value: summary.upcoming,
            icon: FiActivity,
            tone: summary.upcoming > 0 ? 'blue' : 'default',
        },
        {
            label: 'Компаниялар үчүн',
            value: summary.company,
            icon: FiBriefcase,
            tone: summary.company > 0 ? 'green' : 'default',
        },
        {
            label: 'Публичный offeringдер',
            value: summary.public,
            icon: FiGlobe,
            tone: summary.public > 0 ? 'amber' : 'default',
        },
        {
            label: 'Активдүү',
            value: summary.active,
            icon: FiActivity,
            tone: summary.active > 0 ? 'green' : 'default',
        },
        {
            label: 'Долбоор',
            value: summary.draft,
            icon: FiFilter,
            tone: summary.draft > 0 ? 'amber' : 'default',
        },
        {
            label: 'Жабылган',
            value: summary.completed,
            icon: FiArchive,
            tone: summary.completed > 0 ? 'blue' : 'default',
        },
    ];

    const filteredOfferings = useMemo(() => {
        return offerings.filter((offering) => {
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
    }, [offerings, filterCourseId, statusFilter, search]);

    const handleOpenModal = (mode, offering = null) => {
        setModalMode(mode);
        setEditingOffering(offering);
        setCreateForm(getInitialForm(offering));
        setShowCreateModal(true);
    };

    const handleCreateOffering = async () => {
        if (!createForm.courseId) {
            toast.error('Курс тандаңыз');
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
                toast.success('Offering жаңыртылды');
            } else {
                await createOffering(payload);
                toast.success('Offering ийгиликтүү түзүлдү');
            }

            setShowCreateModal(false);
            setCreateForm(getInitialForm());
            setEditingOffering(null);
            refreshOfferings();
        } catch (error) {
            console.error('Failed to save offering', error);
            const message =
                error.response?.data?.message || error.message || 'Offering түзүүдө ката кетти';
            toast.error(Array.isArray(message) ? message.join(', ') : message);
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
                        name: student.fullName || student.email || 'Студент',
                        email: student.email || '—',
                        enrolledAt: student.enrolledAt,
                    })) || [];

            setEnrollStudents(list);
        } catch (error) {
            console.error('Failed to load offering students', error);
            toast.error('Студенттердин тизмесин жүктөө мүмкүн болбоду');
            setEnrollStudents([]);
        } finally {
            setLoadingEnrollStudents(false);
        }
    }, []);

    const handleOpenEnrollModal = (offering) => {
        setEnrollOffering(offering);
        setEnrollForm({ userId: '', discountPercentage: '' });
        setEnrollUserSearch('');
        setEnrollStudentOptions([]);
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
                    toast.error('Студенттерди издөөдө ката кетти');
                    setEnrollStudentOptions([]);
                }
            })
            .finally(() => {
                if (!cancelled) setLoadingUserOptions(false);
            });

        return () => {
            cancelled = true;
        };
    }, [showEnrollModal, enrollUserSearch]);

    const handleEnrollStudent = async () => {
        if (!enrollOffering) return;

        const userIdValue = Number(enrollForm.userId);
        if (!userIdValue || Number.isNaN(userIdValue)) {
            toast.error('Колдонуучу ID туура эмес');
            return;
        }

        setEnrolling(true);

        try {
            await enrollUserInCourse(userIdValue, enrollOffering.course.id, {
                offeringId: enrollOffering.id,
                discountPercentage: enrollForm.discountPercentage
                    ? Number(enrollForm.discountPercentage)
                    : undefined,
            });

            toast.success('Студент offeringге кошулду');
            setShowEnrollModal(false);
            setEnrollOffering(null);
            setEnrollForm({ userId: '', discountPercentage: '' });
            setEnrollUserSearch('');
            setEnrollStudentOptions([]);
            refreshOfferings();
        } catch (error) {
            console.error('Failed to enroll student', error);
            const message =
                error.response?.data?.message ||
                error.message ||
                'Студентти offeringге кошууда ката кетти';

            toast.error(Array.isArray(message) ? message.join(', ') : message);
        } finally {
            setEnrolling(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="dashboard-panel overflow-hidden">
                <DashboardSectionHeader
                    eyebrow="Offering башкаруу"
                    title="Курс сунуштары"
                    description="Курстарыңызга арналган корпоративдик, публичный жана атайын offering агымдарын бир жерден көзөмөлдөңүз."
                />

                <div className="space-y-6 px-6 py-6">
                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                        {overviewMetrics.map((metric) => (
                            <DashboardMetricCard
                                key={metric.label}
                                label={metric.label}
                                value={metric.value}
                                icon={metric.icon}
                                tone={metric.tone}
                            />
                        ))}
                    </div>

                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="max-w-2xl">
                            <p className="text-sm leading-6 text-edubot-muted dark:text-slate-400">
                                Offering түзүү, schedule жана enrollment агымдары ушул бөлүмдөн башкарылат.
                            </p>
                        </div>

                        <button
                            type="button"
                            className="dashboard-button-primary inline-flex items-center gap-2 self-start"
                            onClick={() => handleOpenModal('create')}
                        >
                            <FiPlusCircle className="h-4 w-4" />
                            Offering түзүү
                        </button>
                    </div>

                    <DashboardInsetPanel
                        title="Фильтр жана издөө"
                        description="Курс, убакыт жана offering аталышы боюнча натыйжаларды тарытыңыз."
                    >
                        <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_280px]">
                            <div className="grid gap-3 md:grid-cols-2">
                                <select
                                    value={filterCourseId}
                                    onChange={(e) => setFilterCourseId(e.target.value)}
                                    className="dashboard-field dashboard-select"
                                >
                                    <option value="all">Бардык курстар</option>
                                    {courses.map((course) => (
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
                                    <option value="upcoming">Жакынкы</option>
                                    <option value="past">Өткөн</option>
                                    <option value="all">Баары</option>
                                </select>
                            </div>

                            <label className="dashboard-field dashboard-field-icon">
                                <FiSearch className="h-4 w-4 text-edubot-muted dark:text-slate-400" />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full bg-transparent text-sm text-edubot-ink outline-none placeholder:text-edubot-muted dark:text-white dark:placeholder:text-slate-500"
                                    placeholder="Offering боюнча издөө..."
                                />
                            </label>
                        </div>
                    </DashboardInsetPanel>

                    {loading ? (
                        <DashboardCardSkeleton cards={4} />
                    ) : filteredOfferings.length ? (
                        <DashboardInsetPanel
                            title="Offering тизмеси"
                            description={`${filteredOfferings.length} offering табылды`}
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
                            title="Offeringдер азырынча жок"
                            subtitle="Биринчи offeringди түзүп, enrollment агымын баштаңыз."
                            action={{
                                label: 'Offering түзүү',
                                onClick: () => setShowCreateModal(true),
                            }}
                        />
                    )}
                </div>
            </div>

            {showCreateModal ? (
                <CreateOfferingModal
                    courses={courses}
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
                    }}
                    onSubmit={handleEnrollStudent}
                    enrolling={enrolling}
                    students={enrollStudents}
                    loadingStudents={loadingEnrollStudents}
                    studentOptions={enrollStudentOptions}
                    userSearch={enrollUserSearch}
                    onSearchChange={setEnrollUserSearch}
                    loadingUserOptions={loadingUserOptions}
                />
            ) : null}
        </div>
    );
};

export default OfferingsSection;
