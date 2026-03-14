import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { fetchCourseGroups, fetchCourses, fetchStudentOverviewAnalytics } from '@services/api';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

const toList = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.items)) return payload.items;
    if (Array.isArray(payload?.data)) return payload.data;
    return [];
};

const metricNumber = (value, fallback = 0) => {
    const num = Number(value);
    return Number.isFinite(num) ? num : fallback;
};

const StudentAnalyticsPage = () => {
    const { user } = useContext(AuthContext);
    const [filters, setFilters] = useState({ from: '', to: '', courseId: '', groupId: '' });
    const [loading, setLoading] = useState(false);

    const [courses, setCourses] = useState([]);
    const [groups, setGroups] = useState([]);
    const [overview, setOverview] = useState(null);

    useEffect(() => {
        let cancelled = false;
        const loadCourses = async () => {
            try {
                const res = await fetchCourses({ limit: 300 });
                if (cancelled) return;
                setCourses(toList(res));
            } catch (error) {
                if (cancelled) return;
                console.error(error);
                toast.error('Курстарды жүктөө мүмкүн болгон жок.');
            }
        };

        loadCourses();
        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        if (!filters.courseId) {
            setGroups([]);
            setFilters((prev) => ({ ...prev, groupId: '' }));
            return;
        }

        let cancelled = false;
        const loadGroups = async () => {
            try {
                const res = await fetchCourseGroups({ courseId: Number(filters.courseId) });
                if (cancelled) return;
                setGroups(toList(res));
            } catch (error) {
                if (cancelled) return;
                console.error(error);
                toast.error('Группаларды жүктөө мүмкүн болгон жок.');
            }
        };

        loadGroups();
        return () => {
            cancelled = true;
        };
    }, [filters.courseId]);

    const requestFilters = useMemo(
        () => ({
            from: filters.from || undefined,
            to: filters.to || undefined,
            courseId: filters.courseId ? Number(filters.courseId) : undefined,
            groupId: filters.groupId ? Number(filters.groupId) : undefined,
            studentId: user?.role === 'student' ? undefined : user?.id,
        }),
        [filters, user]
    );

    const loadOverview = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetchStudentOverviewAnalytics(requestFilters);
            setOverview(res || null);
        } catch (error) {
            console.error(error);
            const message = error?.response?.data?.message || 'Student analytics жүктөө катасы';
            toast.error(Array.isArray(message) ? message.join(', ') : message);
        } finally {
            setLoading(false);
        }
    }, [requestFilters]);

    useEffect(() => {
        loadOverview();
    }, [loadOverview]);

    const milestones = useMemo(
        () => toList(overview?.milestones || overview?.courseMilestones),
        [overview]
    );

    return (
        <div className="pt-24 min-h-screen bg-gray-50 dark:bg-[#1A1A1A] px-4 pb-12">
            <div className="max-w-5xl mx-auto space-y-4">
                <div className="flex items-end gap-3 flex-wrap">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900 dark:text-[#E8ECF3]">
                            Student Analytics
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Progress, attendance, completed tasks, and milestones
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={loadOverview}
                        disabled={loading}
                        className="ml-auto px-4 py-2 rounded-lg bg-blue-600 text-white disabled:opacity-60"
                    >
                        {loading ? 'Жүктөлүүдө...' : 'Refresh'}
                    </button>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3 bg-white dark:bg-[#111111] border border-gray-100 dark:border-gray-800 rounded-2xl p-3">
                    <input
                        type="date"
                        value={filters.from}
                        onChange={(e) => setFilters((prev) => ({ ...prev, from: e.target.value }))}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-[#0E0E0E]"
                    />
                    <input
                        type="date"
                        value={filters.to}
                        onChange={(e) => setFilters((prev) => ({ ...prev, to: e.target.value }))}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-[#0E0E0E]"
                    />
                    <select
                        value={filters.courseId}
                        onChange={(e) =>
                            setFilters((prev) => ({
                                ...prev,
                                courseId: e.target.value,
                                groupId: '',
                            }))
                        }
                        className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-[#0E0E0E]"
                    >
                        <option value="">All courses</option>
                        {courses.map((course) => (
                            <option key={course.id} value={course.id}>
                                {course.title || course.name || `Course #${course.id}`}
                            </option>
                        ))}
                    </select>
                    <select
                        value={filters.groupId}
                        onChange={(e) =>
                            setFilters((prev) => ({ ...prev, groupId: e.target.value }))
                        }
                        className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-[#0E0E0E]"
                    >
                        <option value="">All groups</option>
                        {groups.map((group) => (
                            <option key={group.id} value={group.id}>
                                {group.name || group.code || `Group #${group.id}`}
                            </option>
                        ))}
                    </select>
                    <button
                        type="button"
                        onClick={() => setFilters({ from: '', to: '', courseId: '', groupId: '' })}
                        className="border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-gray-600 dark:text-gray-300"
                    >
                        Clear
                    </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <KpiCard
                        label="Progress"
                        value={`${metricNumber(overview?.progress?.rate || overview?.progressRate)}%`}
                    />
                    <KpiCard
                        label="Attendance"
                        value={`${metricNumber(overview?.attendance?.rate || overview?.attendanceRate)}%`}
                    />
                    <KpiCard
                        label="Completed Tasks"
                        value={metricNumber(overview?.completedTasks || overview?.tasks?.completed)}
                    />
                    <KpiCard label="Milestones" value={milestones.length} />
                </div>

                <section className="rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#111111] p-4">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-[#E8ECF3] mb-3">
                        Course Milestones
                    </h3>
                    <div className="space-y-2">
                        {milestones.map((item, idx) => (
                            <div
                                key={item.id || item.milestoneId || idx}
                                className="rounded-lg border border-gray-100 dark:border-gray-800 px-3 py-2"
                            >
                                <div className="text-sm font-medium text-gray-900 dark:text-[#E8ECF3]">
                                    {item.title ||
                                        item.name ||
                                        item.label ||
                                        `Milestone #${idx + 1}`}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                    {item.description || item.value || item.progressText || '-'}
                                </div>
                            </div>
                        ))}
                        {milestones.length === 0 && (
                            <div className="text-sm text-gray-500">Маалымат жок.</div>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
};

const KpiCard = ({ label, value }) => (
    <div className="rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#111111] p-4">
        <div className="text-xs text-gray-500 dark:text-gray-400">{label}</div>
        <div className="mt-2 text-2xl font-semibold text-gray-900 dark:text-[#E8ECF3]">{value}</div>
    </div>
);

KpiCard.propTypes = {
    label: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

export default StudentAnalyticsPage;
