import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import {
    fetchCourseGroups,
    fetchCourses,
    fetchInstructorOverviewAnalytics,
    fetchInstructorStudentsAtRiskAnalytics,
} from '@services/api';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

const toList = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.items)) return payload.items;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.rows)) return payload.rows;
    return [];
};

const metricNumber = (value, fallback = 0) => {
    const num = Number(value);
    return Number.isFinite(num) ? num : fallback;
};

const InstructorAnalyticsPage = () => {
    const { user } = useContext(AuthContext);
    const [filters, setFilters] = useState({ from: '', to: '', courseId: '', groupId: '' });
    const [loading, setLoading] = useState(false);

    const [courses, setCourses] = useState([]);
    const [groups, setGroups] = useState([]);

    const [overview, setOverview] = useState(null);
    const [studentsAtRisk, setStudentsAtRisk] = useState([]);

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
            instructorId: user?.role === 'admin' ? undefined : user?.id,
        }),
        [filters, user]
    );

    const loadAnalytics = useCallback(async () => {
        setLoading(true);
        try {
            const [overviewRes, atRiskRes] = await Promise.all([
                fetchInstructorOverviewAnalytics(requestFilters),
                fetchInstructorStudentsAtRiskAnalytics(requestFilters),
            ]);
            setOverview(overviewRes || null);
            setStudentsAtRisk(toList(atRiskRes));
        } catch (error) {
            console.error(error);
            const message = error?.response?.data?.message || 'Instructor analytics жүктөө катасы';
            toast.error(Array.isArray(message) ? message.join(', ') : message);
        } finally {
            setLoading(false);
        }
    }, [requestFilters]);

    useEffect(() => {
        loadAnalytics();
    }, [loadAnalytics]);

    const kpis = useMemo(
        () => ({
            attendance: metricNumber(overview?.attendanceRate || overview?.attendance?.rate),
            homework: metricNumber(
                overview?.homeworkCompletionRate || overview?.homework?.completionRate
            ),
            engagement: metricNumber(overview?.engagementScore || overview?.engagement?.score),
            atRisk: metricNumber(overview?.studentsAtRisk || studentsAtRisk.length),
        }),
        [overview, studentsAtRisk.length]
    );

    return (
        <div className="pt-24 min-h-screen bg-gray-50 dark:bg-[#1A1A1A] px-4 pb-12">
            <div className="max-w-6xl mx-auto space-y-4">
                <div className="flex flex-wrap items-end gap-3">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900 dark:text-[#E8ECF3]">
                            Instructor Analytics
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Attendance, homework, engagement, and at-risk students
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
                        value={filters.from || ''}
                        onChange={(e) => setFilters((prev) => ({ ...prev, from: e.target.value }))}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-[#0E0E0E]"
                    />
                    <input
                        type="date"
                        value={filters.to || ''}
                        onChange={(e) => setFilters((prev) => ({ ...prev, to: e.target.value }))}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-[#0E0E0E]"
                    />
                    <select
                        value={filters.courseId || ''}
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
                    <KpiCard label="Attendance" value={`${kpis.attendance}%`} />
                    <KpiCard label="Homework Completion" value={`${kpis.homework}%`} />
                    <KpiCard label="Engagement Score" value={kpis.engagement} />
                    <KpiCard label="Students At Risk" value={kpis.atRisk} />
                </div>

                <section className="rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#111111] p-4 overflow-x-auto">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-[#E8ECF3] mb-3">
                        Students At Risk
                    </h3>
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-gray-500 border-b border-gray-100 dark:border-gray-800">
                                <th className="py-2 pr-3">Student</th>
                                <th className="py-2 pr-3">Risk</th>
                                <th className="py-2 pr-3">Attendance</th>
                                <th className="py-2 pr-3">Homework</th>
                            </tr>
                        </thead>
                        <tbody>
                            {studentsAtRisk.map((item, idx) => (
                                <tr
                                    key={item.studentId || item.id || idx}
                                    className="border-b border-gray-50 dark:border-gray-900"
                                >
                                    <td className="py-2 pr-3 text-gray-700 dark:text-gray-200">
                                        {item.studentName ||
                                            item.fullName ||
                                            `Student #${item.studentId || '-'}`}
                                    </td>
                                    <td className="py-2 pr-3 text-gray-700 dark:text-gray-200">
                                        {item.risk || item.severity || '-'}
                                    </td>
                                    <td className="py-2 pr-3 text-gray-700 dark:text-gray-200">
                                        {metricNumber(item.attendanceRate)}%
                                    </td>
                                    <td className="py-2 pr-3 text-gray-700 dark:text-gray-200">
                                        {metricNumber(item.homeworkCompletionRate)}%
                                    </td>
                                </tr>
                            ))}
                            {studentsAtRisk.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="py-6 text-center text-gray-500">
                                        Маалымат жок.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
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

export default InstructorAnalyticsPage;
