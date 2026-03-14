import { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import {
    fetchAdminAttendanceRateAnalytics,
    fetchAdminCoursePopularityAnalytics,
    fetchAdminDropoutRiskAnalytics,
    fetchAdminGroupFillRateAnalytics,
    fetchAdminInstructorPerformanceAnalytics,
    fetchAdminOverviewAnalytics,
    fetchCourseGroups,
    fetchCourses,
} from '@services/api';
import { toast } from 'react-hot-toast';

const toList = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.items)) return payload.items;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.rows)) return payload.rows;
    return [];
};

const firstDefined = (...values) => values.find((v) => v !== undefined && v !== null);

const metricNumber = (value, fallback = 0) => {
    const num = Number(value);
    return Number.isFinite(num) ? num : fallback;
};

const AdminAnalyticsPage = () => {
    const [filters, setFilters] = useState({ from: '', to: '', courseId: '', groupId: '' });
    const [loading, setLoading] = useState(false);

    const [courses, setCourses] = useState([]);
    const [groups, setGroups] = useState([]);

    const [overview, setOverview] = useState(null);
    const [coursePopularity, setCoursePopularity] = useState([]);
    const [groupFillRate, setGroupFillRate] = useState([]);
    const [attendanceRate, setAttendanceRate] = useState(null);
    const [dropoutRisk, setDropoutRisk] = useState(null);
    const [instructorPerformance, setInstructorPerformance] = useState([]);

    const loadFilterData = useCallback(async () => {
        try {
            const coursesRes = await fetchCourses({ limit: 300 });
            const coursesList = toList(coursesRes);
            setCourses(coursesList);
        } catch (error) {
            console.error(error);
            toast.error('Курстар фильтрин жүктөө мүмкүн болгон жок.');
        }
    }, []);

    useEffect(() => {
        loadFilterData();
    }, [loadFilterData]);

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
                const list = toList(res);
                setGroups(list);
            } catch (error) {
                if (cancelled) return;
                console.error(error);
                setGroups([]);
                toast.error('Группа фильтрин жүктөө мүмкүн болгон жок.');
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
        }),
        [filters]
    );

    const loadAnalytics = useCallback(async () => {
        setLoading(true);
        try {
            const [
                overviewRes,
                popularityRes,
                fillRateRes,
                attendanceRes,
                dropoutRes,
                instructorPerfRes,
            ] = await Promise.all([
                fetchAdminOverviewAnalytics(requestFilters),
                fetchAdminCoursePopularityAnalytics(requestFilters),
                fetchAdminGroupFillRateAnalytics(requestFilters),
                fetchAdminAttendanceRateAnalytics(requestFilters),
                fetchAdminDropoutRiskAnalytics(requestFilters),
                fetchAdminInstructorPerformanceAnalytics(requestFilters),
            ]);

            setOverview(overviewRes || null);
            setCoursePopularity(toList(popularityRes));
            setGroupFillRate(toList(fillRateRes));
            setAttendanceRate(attendanceRes || null);
            setDropoutRisk(dropoutRes || null);
            setInstructorPerformance(toList(instructorPerfRes));
        } catch (error) {
            console.error(error);
            const message = error?.response?.data?.message || 'Analytics жүктөө катасы';
            toast.error(Array.isArray(message) ? message.join(', ') : message);
        } finally {
            setLoading(false);
        }
    }, [requestFilters]);

    useEffect(() => {
        loadAnalytics();
    }, [loadAnalytics]);

    const attendanceKpi = useMemo(() => {
        const total = metricNumber(
            firstDefined(attendanceRate?.total, overview?.attendance?.total)
        );
        const good = metricNumber(firstDefined(attendanceRate?.good, overview?.attendance?.good));
        const rate = metricNumber(
            firstDefined(attendanceRate?.rate, overview?.attendance?.rate),
            total ? Math.round((good / total) * 100) : 0
        );
        return { total, good, rate };
    }, [attendanceRate, overview]);

    const riskSummary = useMemo(() => {
        const distribution = toList(dropoutRisk?.distribution || dropoutRisk?.riskDistribution);
        const topRisk = toList(
            dropoutRisk?.topRiskStudents || dropoutRisk?.students || dropoutRisk
        );
        return { distribution, topRisk };
    }, [dropoutRisk]);

    return (
        <div className="pt-24 min-h-screen bg-gray-50 dark:bg-[#1A1A1A] px-4 pb-12">
            <div className="max-w-7xl mx-auto space-y-4">
                <div className="flex flex-wrap items-end gap-3">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900 dark:text-[#E8ECF3]">
                            Admin Analytics
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Course popularity, fill rate, attendance, risk, instructor performance
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={loadAnalytics}
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
                        label="Attendance Rate"
                        value={`${attendanceKpi.rate}%`}
                        hint={`${attendanceKpi.good}/${attendanceKpi.total} good`}
                    />
                    <KpiCard
                        label="Popular Courses"
                        value={coursePopularity.length}
                        hint="enrollment ranking"
                    />
                    <KpiCard
                        label="Groups Tracked"
                        value={groupFillRate.length}
                        hint="seat utilization"
                    />
                    <KpiCard
                        label="At-Risk Students"
                        value={riskSummary.topRisk.length}
                        hint="dropout risk list"
                    />
                </div>

                <div className="grid lg:grid-cols-2 gap-4">
                    <TableCard
                        title="Course Popularity"
                        columns={['Course', 'Enrollments']}
                        rows={coursePopularity.map((item) => [
                            item.courseTitle || item.title || `Course #${item.courseId || '-'}`,
                            metricNumber(item.enrollments || item.count),
                        ])}
                    />
                    <TableCard
                        title="Group Fill Rate"
                        columns={['Group', 'Fill Rate', 'Seats']}
                        rows={groupFillRate.map((item) => [
                            item.groupName || item.name || `Group #${item.groupId || '-'}`,
                            `${metricNumber(item.fillRate || item.rate)}%`,
                            `${metricNumber(item.filledSeats || item.filled)}/${metricNumber(item.seatLimit || item.totalSeats)}`,
                        ])}
                    />
                    <TableCard
                        title="Dropout Risk Distribution"
                        columns={['Risk', 'Count']}
                        rows={riskSummary.distribution.map((item) => [
                            item.risk || item.level || item.severity || '-',
                            metricNumber(item.count || item.total),
                        ])}
                    />
                    <TableCard
                        title="Top At-Risk Students"
                        columns={['Student', 'Risk', 'Course/Group']}
                        rows={riskSummary.topRisk.map((item) => [
                            item.studentName ||
                                item.fullName ||
                                `Student #${item.studentId || '-'}`,
                            item.risk || item.severity || '-',
                            item.courseTitle || item.groupName || '-',
                        ])}
                    />
                </div>

                <TableCard
                    title="Instructor Performance"
                    columns={['Instructor', 'Attendance', 'Completion', 'Engagement']}
                    rows={instructorPerformance.map((item) => [
                        item.instructorName ||
                            item.fullName ||
                            `Instructor #${item.instructorId || '-'}`,
                        `${metricNumber(item.attendanceRate)}%`,
                        `${metricNumber(item.homeworkCompletionRate || item.completionRate)}%`,
                        metricNumber(item.engagementScore || item.score),
                    ])}
                />
            </div>
        </div>
    );
};

const KpiCard = ({ label, value, hint }) => (
    <div className="rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#111111] p-4">
        <div className="text-xs text-gray-500 dark:text-gray-400">{label}</div>
        <div className="mt-2 text-2xl font-semibold text-gray-900 dark:text-[#E8ECF3]">{value}</div>
        <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">{hint}</div>
    </div>
);

const TableCard = ({ title, columns, rows }) => (
    <section className="rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#111111] p-4 overflow-x-auto">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-[#E8ECF3] mb-3">{title}</h3>
        <table className="w-full text-sm">
            <thead>
                <tr className="text-left text-gray-500 border-b border-gray-100 dark:border-gray-800">
                    {columns.map((col) => (
                        <th key={col} className="py-2 pr-3">
                            {col}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {rows.map((row, idx) => (
                    <tr
                        key={`${title}-${idx}`}
                        className="border-b border-gray-50 dark:border-gray-900"
                    >
                        {row.map((cell, cidx) => (
                            <td
                                key={`${title}-${idx}-${cidx}`}
                                className="py-2 pr-3 text-gray-700 dark:text-gray-200"
                            >
                                {cell}
                            </td>
                        ))}
                    </tr>
                ))}
                {rows.length === 0 && (
                    <tr>
                        <td colSpan={columns.length} className="py-6 text-center text-gray-500">
                            Маалымат жок.
                        </td>
                    </tr>
                )}
            </tbody>
        </table>
    </section>
);

KpiCard.propTypes = {
    label: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    hint: PropTypes.string.isRequired,
};

TableCard.propTypes = {
    title: PropTypes.string.isRequired,
    columns: PropTypes.arrayOf(PropTypes.string).isRequired,
    rows: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.any)).isRequired,
};

export default AdminAnalyticsPage;
