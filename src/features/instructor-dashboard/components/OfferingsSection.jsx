import { useState, useCallback, useEffect, useMemo } from 'react';
import { FiFilter } from 'react-icons/fi';
import toast from 'react-hot-toast';
import {
    createOffering,
    updateOffering,
    enrollUserInCourse,
    fetchUsers,
    fetchCourseStudents,
} from '@services/api';
import Loader from '@shared/ui/Loader';
import InstructorStatCard from './InstructorStatCard.jsx';
import InstructorEmptyState from './InstructorEmptyState.jsx';
import OfferingCard from './OfferingCard.jsx';
import CreateOfferingModal from './modals/CreateOfferingModal.jsx';
import EnrollStudentModal from './modals/EnrollStudentModal.jsx';
import { formatDateTimeForInput } from '../utils/instructorDashboard.constants.js';

const OfferingsSection = ({ courses, offerings, loading, refreshOfferings }) => {
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
    const [showUserDropdown, setShowUserDropdown] = useState(false);

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

    const filteredOfferings = useMemo(() => {
        return offerings.filter((offering) => {
            if (filterCourseId !== 'all' && offering.course.id !== Number(filterCourseId)) {
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
                const haystack =
                    `${offering.title || ''} ${offering.course.title || ''} ${offering.company?.name || ''
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
            console.error('Failed to create offering', error);
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
        setShowUserDropdown(false);
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
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <p className="text-sm uppercase tracking-wide text-gray-400">
                        Offering башкаруу
                    </p>
                    <h2 className="text-2xl font-bold">Курс сунуштары</h2>
                    <p className="text-sm text-gray-500 dark:text-[#a6adba]">
                        Курстарыңызга арналган корпоративдик же атайын сунуштарды көзөмөлдөңүз.
                    </p>
                </div>

                <button
                    type="button"
                    className="px-4 py-2 rounded-full bg-blue-600 text-white text-sm"
                    onClick={() => handleOpenModal('create')}
                >
                    Offering түзүү
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <InstructorStatCard label="Бардык offeringдер" value={summary.total} />
                <InstructorStatCard label="Жакынкы offeringдер" value={summary.upcoming} />
                <InstructorStatCard label="Компаниялар үчүн" value={summary.company} />
                <InstructorStatCard label="Публичный offeringдер" value={summary.public} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <InstructorStatCard label="Активдүү" value={summary.active} />
                <InstructorStatCard label="Долбоор (Draft)" value={summary.draft} />
                <InstructorStatCard label="Жабылган/аякталган" value={summary.completed} />
            </div>

            <div className="rounded-3xl p-4 shadow-sm flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-2 border rounded-full px-3 py-1 text-sm text-gray-600 dark:text-[#a6adba]">
                        <FiFilter />
                        Фильтр
                    </div>

                    <select
                        value={filterCourseId}
                        onChange={(e) => setFilterCourseId(e.target.value)}
                        className="border rounded-full px-3 py-1 text-sm bg-white dark:bg-[#222222]"
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
                        className="border rounded-full px-3 py-1 text-sm bg-white dark:bg-[#222222]"
                    >
                        <option value="upcoming">Жакынкы</option>
                        <option value="past">Өткөн</option>
                        <option value="all">Баары</option>
                    </select>
                </div>

                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="border rounded-2xl px-4 py-2 text-sm w-full md:w-64 text-gray-500 dark:text-[#a6adba] bg-white dark:bg-[#222222]"
                    placeholder="Offering боюнча издөө..."
                />
            </div>

            <div className="rounded-3xl p-6 shadow-sm">
                {loading ? (
                    <Loader fullScreen={false} />
                ) : filteredOfferings.length ? (
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
                ) : (
                    <InstructorEmptyState
                        title="Offeringдер табылган жок"
                        description="Курстарыңыз үчүн атайын сунуштарды түзүп баштаңыз."
                        actionLabel="Курс түзүү"
                        actionLink="/instructor/course/create"
                    />
                )}
            </div>

            {showCreateModal && (
                <CreateOfferingModal
                    courses={courses}
                    form={createForm}
                    onChange={(field, value) =>
                        setCreateForm((prev) => ({
                            ...prev,
                            [field]: value,
                        }))
                    }
                    onClose={() => {
                        setShowCreateModal(false);
                        setCreateForm(getInitialForm());
                        setEditingOffering(null);
                    }}
                    onSubmit={handleCreateOffering}
                    creating={creating}
                    mode={modalMode}
                />
            )}

            {showEnrollModal && enrollOffering && (
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
                        setShowUserDropdown(false);
                    }}
                    onSubmit={handleEnrollStudent}
                    enrolling={enrolling}
                    students={enrollStudents}
                    loadingStudents={loadingEnrollStudents}
                    studentOptions={enrollStudentOptions}
                    userSearch={enrollUserSearch}
                    onSearchChange={setEnrollUserSearch}
                    loadingUserOptions={loadingUserOptions}
                    showDropdown={showUserDropdown}
                    setShowDropdown={setShowUserDropdown}
                />
            )}
        </div>
    );
};

export default OfferingsSection;
